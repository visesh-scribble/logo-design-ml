"""
Where published menus and orders are kept.

- MONGO_URL set   -> MongoDB (Atlas). Survives restarts and redeploys on Render.
- MONGO_URL unset -> data/state.json on this computer (local development).

Both stores have the same methods, so server.py doesn't care which one it gets.
"""

import json
import os
import sys
import threading
import uuid
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("DATA_DIR") or os.path.join(HERE, "data")
DATA_FILE = os.path.join(DATA_DIR, "state.json")


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def load_env_file(path=os.path.join(HERE, ".env")):
    """Reads KEY=value lines from .env. Real environment variables win, so Render's settings take priority."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key, value = key.strip(), value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


def _read_json_file():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


class JsonStore:
    """Local file storage: the whole state is rewritten to data/state.json on every change."""

    name = "local file storage (" + DATA_FILE + ")"

    def __init__(self):
        self.lock = threading.Lock()
        state = _read_json_file() or {}
        self.latest = state.get("latest")
        self.menus = dict(state.get("menus") or {})
        self.orders = list(state.get("orders") or [])
        self.menu_owner = dict(state.get("menu_owner") or {})   # slug -> owner id
        self.owners = dict(state.get("owners") or {})           # owner id -> {id, email, pw_hash, salt, created_at}
        self.sessions = dict(state.get("sessions") or {})       # token hash -> {owner_id, expires}

    def _write(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        tmp = DATA_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump({"latest": self.latest, "menus": self.menus, "orders": self.orders, "menu_owner": self.menu_owner,
                       "owners": self.owners, "sessions": self.sessions}, f)
        os.replace(tmp, DATA_FILE)

    def load(self):
        return self.latest, dict(self.menus), [dict(o) for o in self.orders]

    def menu_owners(self):
        return dict(self.menu_owner)

    def save_menu(self, slug, data, owner_id=None):
        with self.lock:
            self.menus[slug] = data
            self.latest = data
            if owner_id:
                self.menu_owner[slug] = owner_id
            self._write()

    # ----- owners and sessions -----
    def create_owner(self, email, pw_hash, salt):
        with self.lock:
            if any(o["email"] == email for o in self.owners.values()):
                raise ValueError("EMAIL_TAKEN")
            oid = uuid.uuid4().hex
            self.owners[oid] = {"id": oid, "email": email, "pw_hash": pw_hash, "salt": salt, "created_at": now_iso()}
            self._write()
            return oid

    def get_owner_by_email(self, email):
        return next((dict(o) for o in self.owners.values() if o["email"] == email), None)

    def get_owner(self, owner_id):
        o = self.owners.get(owner_id)
        return dict(o) if o else None

    def create_session(self, token_hash, owner_id, expires):
        with self.lock:
            now = datetime.now(timezone.utc).isoformat()
            self.sessions = {k: v for k, v in self.sessions.items() if v["expires"] > now}   # drop expired ones
            self.sessions[token_hash] = {"owner_id": owner_id, "expires": expires.isoformat()}
            self._write()

    def get_session(self, token_hash):
        sess = self.sessions.get(token_hash)
        if not sess or sess["expires"] <= datetime.now(timezone.utc).isoformat():
            return None
        return {"owner_id": sess["owner_id"]}

    def delete_session(self, token_hash):
        with self.lock:
            if self.sessions.pop(token_hash, None) is not None:
                self._write()

    def next_order_id(self):
        with self.lock:
            return max((o.get("id", 0) for o in self.orders), default=0) + 1

    def add_order(self, order):
        with self.lock:
            self.orders.append(dict(order))
            self._write()

    def set_order_status(self, order_id, status, extra=None):
        with self.lock:
            for o in self.orders:
                if o.get("id") == order_id:
                    o["status"] = status
                    o.update(extra or {})
            self._write()


class MongoStore:
    """MongoDB storage. Collections: menus, meta (which menu is the latest), orders, counters (order numbers)."""

    def __init__(self, url):
        try:
            from pymongo import MongoClient, ReturnDocument, ASCENDING
        except ImportError:
            sys.exit("MONGO_URL is set but pymongo is not installed. Run:  python -m pip install pymongo")
        self._after = ReturnDocument.AFTER
        try:
            self.client = MongoClient(url, serverSelectionTimeoutMS=8000, appname="restaurant-studio")
            self.client.admin.command("ping")
        except Exception as e:
            sys.exit("Could not connect to MongoDB: " + str(e).split(",")[0] +
                     "\n  Check MONGO_URL (user name and password) and Atlas > Network Access (allow 0.0.0.0/0).")
        try:
            db = self.client.get_default_database()
        except Exception:
            db = None
        if db is None:
            db = self.client["restaurant_studio"]
        self.db = db
        self.name = "MongoDB (database '" + db.name + "')"
        self.menus, self.meta, self.orders, self.counters = db.menus, db.meta, db.orders, db.counters
        self.owners, self.sessions = db.owners, db.sessions
        self.orders.create_index([("slug", ASCENDING), ("created_at", ASCENDING)])
        self.owners.create_index("email", unique=True)
        self.sessions.create_index("expires", expireAfterSeconds=0)   # Mongo deletes sessions once they expire
        self._import_json_once()

    def _import_json_once(self):
        """First start with an empty database: bring over the menus and orders from data/state.json."""
        if self.menus.estimated_document_count() or self.orders.estimated_document_count():
            return
        state = _read_json_file()
        if not state:
            return
        menus = state.get("menus") or {}
        orders = state.get("orders") or []
        for slug, data in menus.items():
            self.menus.replace_one({"_id": slug}, {"_id": slug, "data": data, "updated_at": now_iso()}, upsert=True)
        latest = state.get("latest")
        latest_slug = next((s for s, d in menus.items() if d == latest), None)
        if latest_slug:
            self.meta.replace_one({"_id": "latest"}, {"_id": "latest", "slug": latest_slug}, upsert=True)
        for o in orders:
            if "id" in o:
                self.orders.replace_one({"_id": o["id"]}, {**o, "_id": o["id"]}, upsert=True)
        top = max((o.get("id", 0) for o in orders), default=0)
        self.counters.update_one({"_id": "orders"}, {"$max": {"seq": top}}, upsert=True)
        print(f" Imported {len(menus)} menu(s) and {len(orders)} order(s) from {DATA_FILE} into MongoDB")

    @staticmethod
    def _clean(doc):
        doc.pop("_id", None)
        return doc

    def load(self):
        menus = {d["_id"]: d.get("data") for d in self.menus.find()}
        latest_doc = self.meta.find_one({"_id": "latest"})
        latest = menus.get(latest_doc["slug"]) if latest_doc else None
        orders = [self._clean(o) for o in self.orders.find().sort("_id", 1)]
        return latest, menus, orders

    def menu_owners(self):
        return {d["_id"]: d["owner_id"] for d in self.menus.find({"owner_id": {"$ne": None}}, {"owner_id": 1}) if d.get("owner_id")}

    def save_menu(self, slug, data, owner_id=None):
        update = {"data": data, "updated_at": now_iso()}
        if owner_id:
            update["owner_id"] = owner_id
        self.menus.update_one({"_id": slug}, {"$set": update}, upsert=True)
        self.meta.replace_one({"_id": "latest"}, {"_id": "latest", "slug": slug}, upsert=True)

    # ----- owners and sessions -----
    def create_owner(self, email, pw_hash, salt):
        from pymongo.errors import DuplicateKeyError
        oid = uuid.uuid4().hex
        try:
            self.owners.insert_one({"_id": oid, "email": email, "pw_hash": pw_hash, "salt": salt, "created_at": now_iso()})
        except DuplicateKeyError:
            raise ValueError("EMAIL_TAKEN")
        return oid

    def _owner(self, doc):
        if not doc:
            return None
        doc["id"] = doc.pop("_id")
        return doc

    def get_owner_by_email(self, email):
        return self._owner(self.owners.find_one({"email": email}))

    def get_owner(self, owner_id):
        return self._owner(self.owners.find_one({"_id": owner_id}))

    def create_session(self, token_hash, owner_id, expires):
        self.sessions.insert_one({"_id": token_hash, "owner_id": owner_id, "expires": expires})

    def get_session(self, token_hash):
        sess = self.sessions.find_one({"_id": token_hash})
        if not sess:
            return None
        exp = sess["expires"]
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp <= datetime.now(timezone.utc):    # the TTL cleanup runs about once a minute, so check here too
            return None
        return {"owner_id": sess["owner_id"]}

    def delete_session(self, token_hash):
        self.sessions.delete_one({"_id": token_hash})

    def next_order_id(self):
        doc = self.counters.find_one_and_update({"_id": "orders"}, {"$inc": {"seq": 1}}, upsert=True, return_document=self._after)
        return int(doc["seq"])

    def add_order(self, order):
        self.orders.insert_one({**order, "_id": order["id"]})

    def set_order_status(self, order_id, status, extra=None):
        self.orders.update_one({"_id": order_id}, {"$set": {**(extra or {}), "status": status, "updated_at": now_iso()}})


def get_store():
    load_env_file()
    url = os.environ.get("MONGO_URL", "").strip()
    return MongoStore(url) if url else JsonStore()
