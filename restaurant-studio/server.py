#!/usr/bin/env python3
"""
GourmetStudio Pro - Restaurant Brand & Menu Board Generator Server
A professional full-stack suite for generating restaurant logos and digital/print menu boards.
"""

import os
import sys
import json
import mimetypes
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver
import csv
import io
import socket
import threading
import time

import ml
from storage import get_store, now_iso
import auth

# Menu published for the QR code / phone page (kept in memory while the server runs)
PUBLISHED_MENU = {"data": None}
# Every published menu by its page name, e.g. "spice-garden" -> served at /spice-garden.html
PUBLISHED_BY_SLUG = {}
RESERVED_PAGES = {"index", "m", "orders"}


def slugify(name):
    """'Spice Garden & Co.' -> 'spice-garden-co'. Falls back to 'menu' for names with no latin letters."""
    out, dash = [], False
    for ch in str(name).lower():
        if ch.isascii() and ch.isalnum():
            out.append(ch)
            dash = False
        elif not dash and out:
            out.append("-")
            dash = True
    slug = "".join(out).strip("-")[:60] or "menu"
    return slug + "-menu" if slug in RESERVED_PAGES else slug

# Orders placed from the phone menu (kept in memory while the server runs)
ORDERS = []
ORDERS_LOCK = threading.Lock()


def parse_price(p):
    try:
        return float(str(p).replace(",", "").strip())
    except ValueError:
        return 0.0


def resolve_menu(slug):
    """(published menu, its slug) for a page name; unknown names fall back to the latest published menu."""
    slug = str(slug or "")
    if slug in PUBLISHED_BY_SLUG:
        return PUBLISHED_BY_SLUG[slug], slug
    data = PUBLISHED_MENU["data"]
    return data, slugify((data or {}).get("brand", {}).get("name", "")) if data else ""


def build_order(payload):
    """Validates a cart against the published menu and recomputes prices server-side."""
    published, slug = resolve_menu(payload.get("slug", ""))
    if not published:
        raise ValueError("No menu published")
    cats = published.get("menu", {}).get("categories", [])
    lines = []
    for entry in payload.get("items", []):
        c, i, qty = int(entry.get("c", -1)), int(entry.get("i", -1)), int(entry.get("qty", 0))
        if qty <= 0 or qty > 99:
            continue
        if not (0 <= c < len(cats)) or not (0 <= i < len(cats[c].get("items", []))):
            raise ValueError("The menu has changed. Please refresh the page and try again.")
        item = cats[c]["items"][i]
        price = parse_price(item.get("price", 0))
        lines.append({"name": item.get("name", ""), "qty": qty, "price": price, "subtotal": round(price * qty, 2)})
    if not lines:
        raise ValueError("Your cart is empty")
    table = str(payload.get("table", "")).strip()[:20]
    if not table:
        raise ValueError("Please enter your table number")
    return {
        "slug": slug,
        "table": table,
        "name": str(payload.get("name", "")).strip()[:40],
        "note": str(payload.get("note", "")).strip()[:200],
        "items": lines,
        "total": round(sum(l["subtotal"] for l in lines), 2),
        "currency": published.get("menu", {}).get("currency", ""),
        "status": "new",
        "time": time.strftime("%H:%M"),
    }


# Menus and orders live in MongoDB when MONGO_URL is set, else in data/state.json (see storage.py).
# The dictionaries above are a fast in-memory copy; every change is written to the store first.
STORE = None
MENU_OWNER = {}          # slug -> owner id (menus published before logins existed have no owner yet)
PUBLISH_LOCK = threading.Lock()


def load_state():
    global STORE
    STORE = get_store()
    latest, menus, orders = STORE.load()
    PUBLISHED_MENU["data"] = latest
    PUBLISHED_BY_SLUG.update(menus)
    ORDERS.extend(orders)
    MENU_OWNER.update(STORE.menu_owners())
    print(f" Storage: {STORE.name}")
    print(f" Loaded {len(PUBLISHED_BY_SLUG)} published menu(s) and {len(ORDERS)} order(s)")


def owner_slugs(owner_id):
    return {slug for slug, oid in MENU_OWNER.items() if oid == owner_id}


def free_slug_for(base, owner_id):
    """The owner's own page name, or base-2, base-3... when someone else already owns base."""
    slug, n = base, 1
    while MENU_OWNER.get(slug) not in (None, owner_id):
        n += 1
        slug = f"{base}-{n}"
    return slug


def owner_info(handler, owner):
    base = public_base_url(handler)
    rests = [{"slug": s, "name": ((PUBLISHED_BY_SLUG.get(s) or {}).get("brand") or {}).get("name", s), "url": f"{base}/{s}.html"}
             for s in sorted(owner_slugs(owner["id"]))]
    return {"email": owner["email"], "restaurants": rests}


def public_base_url(handler):
    """The address phones should use: PUBLIC_URL if set, else the host the browser used (cloud), else the LAN IP (local)."""
    configured = os.environ.get("PUBLIC_URL", "").strip().rstrip("/")
    if configured:
        return configured
    host = (handler.headers.get("X-Forwarded-Host") or handler.headers.get("Host") or "").split(",")[0].strip()
    hostname = host.rsplit(":", 1)[0] if not host.startswith("[") else host
    if host and hostname not in ("localhost", "127.0.0.1", "[::1]"):
        proto = (handler.headers.get("X-Forwarded-Proto") or "http").split(",")[0].strip()
        return f"{proto}://{host}"
    return f"http://{get_lan_ip()}:{handler.server.server_address[1]}"


def get_lan_ip():
    """Best-guess Wi-Fi/LAN address of this computer, so phones on the same network can reach it."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))  # UDP connect sends no packets; it just picks the outgoing interface
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()

# Optional pandas / openpyxl import with fallback
try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

PORT = 8080
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
SAMPLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "samples")

class RestaurantStudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def end_headers(self):
        # Pages are always re-checked so visitors get the newest build right after an update.
        # Built JS/CSS in /assets/ have a content hash in the name, so they can be cached for good.
        p = urllib.parse.urlparse(self.path).path
        if p.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif not p.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if path == "/api/status":
            self.send_json_response({"status": "online", "pandas_available": HAS_PANDAS, "port": PORT})
            return

        if path == "/api/published-menu":
            slug = urllib.parse.parse_qs(url.query).get("slug", [""])[0]
            if slug in PUBLISHED_BY_SLUG:
                self.send_json_response({"success": True, "data": PUBLISHED_BY_SLUG[slug]})
            elif PUBLISHED_MENU["data"] is None:
                self.send_json_response({"success": False, "error": "No menu published yet"}, status=404)
            else:
                self.send_json_response({"success": True, "data": PUBLISHED_MENU["data"]})
            return

        if path == "/api/auth/me":
            owner = self.require_owner()
            if owner:
                self.send_json_response({"success": True, **owner_info(self, owner)})
            return

        # Kitchen screen: only the logged-in owner's restaurants
        if path == "/api/orders":
            owner = self.require_owner()
            if not owner:
                return
            mine = owner_slugs(owner["id"])
            with ORDERS_LOCK:
                orders = [o for o in reversed(ORDERS) if o.get("slug") in mine]
            self.send_json_response({"success": True, "orders": orders})
            return

        # Customer's phone follows its order: status only, no names, tables or dishes
        if path.startswith("/api/orders/"):
            try:
                order_id = int(path.split("/")[3])
            except ValueError:
                order_id = -1
            with ORDERS_LOCK:
                order = next((o for o in ORDERS if o["id"] == order_id), None)
            if order:
                self.send_json_response({"success": True, "order": {"id": order["id"], "status": order["status"]}})
            else:
                self.send_json_response({"success": False, "error": "Order not found"}, status=404)
            return

        if path == "/api/samples":
            samples = self.get_available_samples()
            self.send_json_response({"samples": samples})
            return

        if path.startswith("/api/sample/"):
            sample_id = path.replace("/api/sample/", "")
            sample_data = self.get_sample_data(sample_id)
            if sample_data:
                self.send_json_response({"success": True, "data": sample_data})
            else:
                self.send_json_response({"success": False, "error": "Sample not found"}, status=404)
            return

        # /<hotel-name>.html -> the phone menu page for that published menu
        if path.endswith(".html"):
            slug = urllib.parse.unquote(path[1:-5])
            if slug in PUBLISHED_BY_SLUG and not os.path.exists(os.path.join(PUBLIC_DIR, slug + ".html")):
                with open(os.path.join(PUBLIC_DIR, "m.html"), "rb") as f:
                    body = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return

        # Serve static files from PUBLIC_DIR
        return super().do_GET()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path

        if path in ("/api/auth/signup", "/api/auth/login"):
            self.handle_login(signup=path.endswith("signup"))
            return

        if path == "/api/auth/logout":
            auth.end_session(self, STORE)
            self.send_json_response({"success": True}, cookie=auth.clear_cookie(self))
            return

        if path == "/api/publish-menu":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8", errors="replace"))
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
                return
            owner = self.require_owner()
            if not owner:
                return
            try:
                with PUBLISH_LOCK:
                    slug = free_slug_for(slugify((data.get("brand") or {}).get("name", "")), owner["id"])
                    STORE.save_menu(slug, data, owner["id"])
                    MENU_OWNER[slug] = owner["id"]
                    PUBLISHED_MENU["data"] = data
                    PUBLISHED_BY_SLUG[slug] = data
                self.send_json_response({"success": True, "slug": slug, "url": f"{public_base_url(self)}/{slug}.html"})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        if path == "/api/orders":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(content_length).decode("utf-8", errors="replace"))
                order = build_order(payload)
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
                return
            try:
                order["id"] = STORE.next_order_id()
                order["created_at"] = now_iso()
                STORE.add_order(order)
                with ORDERS_LOCK:
                    ORDERS.append(order)
                self.send_json_response({"success": True, "order": order})
            except Exception as e:
                print(f"Warning: could not save order: {e}")
                self.send_json_response({"success": False, "error": "Could not save your order. Please try again."}, status=500)
            return

        if path.startswith("/api/orders/") and path.endswith("/status"):
            content_length = int(self.headers.get("Content-Length", 0))
            owner = self.require_owner()
            if not owner:
                return
            try:
                order_id = int(path.split("/")[3])
                body = json.loads(self.rfile.read(content_length).decode("utf-8"))
                status = body.get("status")
                if status not in ("new", "preparing", "ready", "done", "cancelled"):
                    raise ValueError("Invalid status")
                with ORDERS_LOCK:
                    order = next((o for o in ORDERS if o["id"] == order_id), None)
                if order is None or order.get("slug") not in owner_slugs(owner["id"]):
                    self.send_json_response({"success": False, "error": "This order is not from your restaurant."}, status=403)
                    return
                if order.get("status") == "cancelled":
                    raise ValueError("This order was cancelled and can't be changed.")
                extra = None
                if status == "cancelled":
                    if order.get("status") == "done":
                        raise ValueError("A served order can't be cancelled.")
                    extra = {"cancel_reason": str(body.get("reason", "")).strip()[:200], "cancelled_at": now_iso()}
                STORE.set_order_status(order_id, status, extra)
                order["status"] = status
                order.update(extra or {})
                self.send_json_response({"success": True, "order": order})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        if path == "/api/ml/tag-menu":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(content_length).decode("utf-8", errors="replace"))
                predictions = ml.tag_menu(payload.get("categories", []))
                self.send_json_response({"success": True, "predictions": predictions})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        if path == "/api/ml/recommend":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                payload = json.loads(self.rfile.read(content_length).decode("utf-8", errors="replace"))
                published, slug = resolve_menu(payload.get("slug", ""))
                if not published:
                    raise ValueError("No menu published")
                with ORDERS_LOCK:
                    history = [o for o in ORDERS if o.get("slug") == slug]
                recs = ml.recommend(published.get("menu", {}).get("categories", []),
                                    [str(k) for k in payload.get("cart", [])][:50], history)
                self.send_json_response({"success": True, "items": recs, "orders_learned_from": len(history)})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        if path == "/api/parse-csv":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                text_content = post_data.decode("utf-8", errors="replace")
                menu_data = self.parse_csv_text(text_content)
                self.send_json_response({"success": True, "menu": menu_data})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        if path == "/api/parse-text":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode("utf-8", errors="replace"))
                raw_text = payload.get("text", "")
                menu_data = self.parse_raw_menu_text(raw_text)
                self.send_json_response({"success": True, "menu": menu_data})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=400)
            return

        self.send_json_response({"error": "Endpoint not found"}, status=404)

    def parse_csv_text(self, csv_text):
        """Parses CSV text into organized menu structure."""
        reader = csv.reader(io.StringIO(csv_text))
        rows = list(reader)
        if not rows:
            return {"categories": []}

        # Check for header
        header = [col.strip().lower() for col in rows[0]]
        cat_idx = -1
        name_idx = -1
        desc_idx = -1
        price_idx = -1
        dietary_idx = -1

        for i, col in enumerate(header):
            if any(k in col for k in ["cat", "section", "group"]):
                cat_idx = i
            elif any(k in col for k in ["name", "item", "dish", "title"]):
                name_idx = i
            elif any(k in col for k in ["desc", "detail", "ingredient"]):
                desc_idx = i
            elif any(k in col for k in ["price", "cost", "amount", "rate"]):
                price_idx = i
            elif any(k in col for k in ["diet", "tag", "badge", "type", "allergy"]):
                dietary_idx = i

        # Fallback if no recognizable headers
        start_row = 1
        if name_idx == -1:
            start_row = 0
            cat_idx = 0 if len(rows[0]) > 0 else -1
            name_idx = 1 if len(rows[0]) > 1 else 0
            desc_idx = 2 if len(rows[0]) > 2 else -1
            price_idx = 3 if len(rows[0]) > 3 else -1
            dietary_idx = 4 if len(rows[0]) > 4 else -1

        categories_map = {}
        for row in rows[start_row:]:
            if not any(row):
                continue
            cat = row[cat_idx].strip() if cat_idx != -1 and len(row) > cat_idx and row[cat_idx].strip() else "Featured Specials"
            name = row[name_idx].strip() if name_idx != -1 and len(row) > name_idx else ""
            if not name:
                continue
            desc = row[desc_idx].strip() if desc_idx != -1 and len(row) > desc_idx else ""
            price = row[price_idx].strip() if price_idx != -1 and len(row) > price_idx else ""
            diet = row[dietary_idx].strip() if dietary_idx != -1 and len(row) > dietary_idx else ""

            # Clean price string
            clean_price = price.replace("$", "").replace("€", "").replace("£", "").replace("₹", "").strip()

            if cat not in categories_map:
                categories_map[cat] = []
            
            categories_map[cat].append({
                "name": name,
                "description": desc,
                "price": clean_price,
                "dietary": [d.strip() for d in diet.split(",") if d.strip()] if diet else []
            })

        categories_list = []
        for cat_name, items in categories_map.items():
            categories_list.append({
                "name": cat_name,
                "items": items
            })

        return {"categories": categories_list}

    def parse_raw_menu_text(self, text):
        """Intelligently parses unstructured restaurant menu text."""
        lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
        categories = []
        current_cat = {"name": "Signature Dishes", "items": []}

        for line in lines:
            # Check if line looks like a category header (e.g., [Appetizers], # Mains, ALL CAPS, or no numbers)
            is_header = False
            clean_line = line.strip("[]#=-*: ")
            if (line.isupper() and len(line) < 30 and not any(c.isdigit() for c in line)) or \
               line.startswith(("[", "#", "==", "--")) or \
               (clean_line.lower() in ["starters", "appetizers", "mains", "entrees", "pasta", "pizza", "desserts", "beverages", "drinks", "sides", "salads", "cocktails", "wine", "specials"]):
                is_header = True

            if is_header:
                if current_cat["items"]:
                    categories.append(current_cat)
                current_cat = {"name": clean_line.title(), "items": []}
                continue

            # Parse item line: e.g. "Truffle Burger - Wagyu patty, brioche - $18.50" or "Ribeye Steak .... 34.00"
            parts = line.split(" - ")
            name = ""
            desc = ""
            price = ""

            # Check for price at end
            words = line.split()
            last_word = words[-1] if words else ""
            clean_last = last_word.replace("$", "").replace("€", "").replace("£", "").replace("₹", "").strip()
            
            # Check if last word is numeric price
            try:
                float(clean_last)
                price = clean_last
                remaining = " ".join(words[:-1]).rstrip(".- ")
            except ValueError:
                remaining = line

            if " - " in remaining:
                item_parts = remaining.split(" - ", 1)
                name = item_parts[0].strip()
                desc = item_parts[1].strip()
            elif "..." in remaining:
                item_parts = remaining.split("...", 1)
                name = item_parts[0].strip()
                desc = item_parts[1].strip().lstrip(". ")
            else:
                name = remaining.strip()

            if name:
                current_cat["items"].append({
                    "name": name,
                    "description": desc,
                    "price": price,
                    "dietary": []
                })

        if current_cat["items"]:
            categories.append(current_cat)

        return {"categories": categories}

    def get_available_samples(self):
        samples = [
            {
                "id": "bistro",
                "name": "The Modern Bistro (Casual Fine Dining)",
                "description": "Starters, Dry-aged Steaks, Sea Bass, and Craft Cocktails"
            },
            {
                "id": "italian",
                "name": "L'Antica Trattoria (Authentic Italian)",
                "description": "Antipasti, Fresh Truffle Pasta, Risotto, Ossobuco & Dolci"
            },
            {
                "id": "cafe",
                "name": "Artisan Bakery & Specialty Coffee",
                "description": "Single-origin pour overs, Sourdough sandwiches, French pastries"
            },
            {
                "id": "burger",
                "name": "Craft Burger & Smokehouse",
                "description": "Smash burgers, BBQ brisket, Loaded fries & Craft beers"
            }
        ]
        return samples

    def get_sample_data(self, sample_id):
        if sample_id == "bistro":
            csv_path = os.path.join(SAMPLES_DIR, "bistro_menu.csv")
            if os.path.exists(csv_path):
                with open(csv_path, "r", encoding="utf-8") as f:
                    return self.parse_csv_text(f.read())
        elif sample_id == "italian":
            return {
                "categories": [
                    {
                        "name": "Antipasti",
                        "items": [
                            {"name": "Bruschetta al Pomodoro", "description": "Heirloom tomatoes, garlic, extra virgin olive oil on toasted ciabatta", "price": "11.50", "dietary": ["Vegetarian"]},
                            {"name": "Carpaccio di Manzo", "description": "Thinly sliced beef tenderloin, capers, arugula, shaved Parmigiano-Reggiano", "price": "16.00", "dietary": ["Gluten-Free"]},
                            {"name": "Burrata Pugliese", "description": "Creamy Pugliese burrata, roasted mission figs, prosciutto di Parma, aged balsamic", "price": "17.50", "dietary": ["Chef's Special"]}
                        ]
                    },
                    {
                        "name": "Primi Piatti",
                        "items": [
                            {"name": "Tagliolini al Tartufo", "description": "Fresh egg ribbon pasta, black Norcia truffle, alpine butter, 24-month parmesan", "price": "28.00", "dietary": ["Vegetarian"]},
                            {"name": "Pappardelle al Cinghiale", "description": "Slow-braised Tuscan wild boar ragu, rosemary, juniper berries", "price": "26.50", "dietary": []},
                            {"name": "Risotto ai Frutti di Mare", "description": "Carnaroli rice, gulf prawns, calamari, Manila clams, saffron broth", "price": "29.00", "dietary": ["Gluten-Free"]}
                        ]
                    },
                    {
                        "name": "Secondi",
                        "items": [
                            {"name": "Ossobuco alla Milanese", "description": "Braised veal shank, saffron risotto, gremolata", "price": "38.00", "dietary": ["Gluten-Free"]},
                            {"name": "Branzino al Forno", "description": "Whole roasted Mediterranean sea bass, cherry tomatoes, taggiasca olives", "price": "35.00", "dietary": ["Gluten-Free"]}
                        ]
                    },
                    {
                        "name": "Dolci & Digestivi",
                        "items": [
                            {"name": "Torta della Nonna", "description": "Shortcrust pastry, lemon custard, toasted pine nuts, powdered sugar", "price": "10.00", "dietary": ["Vegetarian"]},
                            {"name": "Affogato al Caffe", "description": "Double shot of espresso poured over artisanal fior di latte gelato with amaretto", "price": "8.50", "dietary": ["Vegetarian"]}
                        ]
                    }
                ]
            }
        elif sample_id == "cafe":
            return {
                "categories": [
                    {
                        "name": "Specialty Coffee & Espresso",
                        "items": [
                            {"name": "Ethiopian Yirgacheffe Pour-Over", "description": "Floral notes of jasmine, bergamot, and sweet stone fruit", "price": "6.00", "dietary": ["Vegan"]},
                            {"name": "Spanish Cortado", "description": "Equal parts espresso and warm silky textured milk with a touch of condensed milk", "price": "4.75", "dietary": ["Vegetarian"]},
                            {"name": "Iced Pistachio Oat Latte", "description": "Double espresso, homemade Sicilian pistachio cream, steamed Oatly milk", "price": "6.50", "dietary": ["Vegan", "Chef's Special"]}
                        ]
                    },
                    {
                        "name": "Artisan Bakery & Toast",
                        "items": [
                            {"name": "Avocado Tartine", "description": "Poached farm egg, pickled shallots, dukkah spice on toasted seeded sourdough", "price": "14.00", "dietary": ["Vegetarian"]},
                            {"name": "Smoked Salmon Brioche", "description": "Wild smoked salmon, dill whipped cream cheese, fried capers, pickled red onions", "price": "16.50", "dietary": []},
                            {"name": "Almond Frangipane Croissant", "description": "Twice-baked buttery croissant filled with almond creme and toasted flakes", "price": "5.50", "dietary": ["Vegetarian"]}
                        ]
                    },
                    {
                        "name": "Sweet Treats",
                        "items": [
                            {"name": "Matcha Basque Cheesecake", "description": "Uji ceremonial matcha with caramelized burnt top and gooey molten center", "price": "8.50", "dietary": ["Vegetarian", "Gluten-Free"]},
                            {"name": "Valrhona Chocolate Babka", "description": "Warm braided brioche with rich dark chocolate fudge swirl", "price": "6.00", "dietary": ["Vegetarian"]}
                        ]
                    }
                ]
            }
        elif sample_id == "burger":
            return {
                "categories": [
                    {
                        "name": "Smash & Craft Burgers",
                        "items": [
                            {"name": "The Double Truffle Smash", "description": "Twin 4oz Angus smashed patties, truffle aioli, melted aged Havarti, caramelized onion jam", "price": "16.50", "dietary": ["Chef's Special"]},
                            {"name": "Smokey BBQ Bourbon Bacon", "description": "Applewood smoked bacon, crispy onion rings, homemade bourbon BBQ glaze, sharp cheddar", "price": "17.00", "dietary": []},
                            {"name": "Nashville Hot Crispy Chicken", "description": "Buttermilk fried chicken thigh tossed in Nashville spice, tangy slaw, house pickles", "price": "15.50", "dietary": ["Spicy"]},
                            {"name": "The Plant Butcher Burger", "description": "Beyond meat patty, vegan cheddar, garlic vegan mayo, butterhead lettuce, pretzel bun", "price": "16.00", "dietary": ["Vegan"]}
                        ]
                    },
                    {
                        "name": "Sides & Loaded Fries",
                        "items": [
                            {"name": "Truffle Parmesan Hand-Cut Fries", "description": "White truffle oil, grated pecorino, fresh rosemary, roasted garlic dip", "price": "8.50", "dietary": ["Vegetarian"]},
                            {"name": "Smoked Brisket Poutine", "description": "Quebec cheese curds, slow-smoked 14hr beef brisket, rich peppercorn gravy", "price": "13.00", "dietary": []}
                        ]
                    },
                    {
                        "name": "Draft Brews & Shakes",
                        "items": [
                            {"name": "Hazy Double IPA (16oz)", "description": "Citra & Mosaic hops, notes of juicy mango and tropical pine (7.2% ABV)", "price": "8.00", "dietary": []},
                            {"name": "Salted Caramel Pretzel Shake", "description": "Hand-spun vanilla custard, Maldon sea salt, crushed buttery pretzels", "price": "7.50", "dietary": ["Vegetarian"]}
                        ]
                    }
                ]
            }
        return None

    def require_owner(self):
        """The logged-in owner, or None after sending a 401 ('please log in')."""
        owner = auth.current_owner(self, STORE)
        if not owner:
            self.send_json_response({"success": False, "error": "Please log in.", "auth": False}, status=401)
        return owner

    def handle_login(self, signup):
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length).decode("utf-8", errors="replace"))
        except Exception:
            self.send_json_response({"success": False, "error": "Bad request"}, status=400)
            return
        email = auth.normalize_email(payload.get("email"))
        password = str(payload.get("password") or "")
        if signup:
            problem = auth.validate_signup(email, password)
            if problem:
                self.send_json_response({"success": False, "error": problem}, status=400)
                return
            pw_hash, salt = auth.hash_password(password)
            try:
                owner_id = STORE.create_owner(email, pw_hash, salt)
            except ValueError:
                self.send_json_response({"success": False, "error": "An account with this email already exists. Please log in."}, status=409)
                return
            owner = STORE.get_owner(owner_id)
        else:
            if auth.too_many_fails(email):
                self.send_json_response({"success": False, "error": "Too many attempts. Please wait 15 minutes and try again."}, status=429)
                return
            owner = STORE.get_owner_by_email(email)
            if not owner or not auth.check_password(password, owner["pw_hash"], owner["salt"]):
                auth.record_fail(email)
                self.send_json_response({"success": False, "error": "Wrong email or password."}, status=401)
                return
            auth.clear_fails(email)
        token = auth.start_session(STORE, owner["id"])
        self.send_json_response({"success": True, **owner_info(self, owner)}, cookie=auth.session_cookie(self, token))

    def send_json_response(self, data, status=200, cookie=None):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

def run_server(port=PORT):
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", port), RestaurantStudioHandler) as httpd:
        print(f"============================================================")
        print(f" GourmetStudio Pro is running at http://localhost:{port}")
        print(f" Press Ctrl+C to stop the server.")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()

if __name__ == "__main__":
    load_state()
    port = int(os.environ.get("PORT", PORT))  # cloud hosts like Render pass the port in $PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
