// Phone menu: what customers see after scanning the QR code. They add dishes to a cart and order to their table.
import { useEffect, useRef, useState } from "react";
import { CUISINE_PHOTOS as CUISINE_PHOTO } from "../shared/photos.js";
import LinksPage from "./LinksPage.jsx";

const num = p => { const n = parseFloat(String(p).replace(/,/g, "")); return isNaN(n) ? 0 : n; };
const STATUS_TEXT = { new: "Order received", preparing: "Being prepared 👨‍🍳", ready: "Ready! 🎉", done: "Served — enjoy your meal!" };

// Page name = hotel name, e.g. /spice-garden.html -> slug "spice-garden" (m.html = latest menu)
const SLUG = decodeURIComponent(location.pathname.split("/").pop().replace(/\.html$/, ""));

// A photo for every dish: its own photo if it has one, else matched by the dish name, else the cuisine photo.
const DISH_PHOTOS = [
  [/soup|shorba|rasam/, "photo-1547592166-23ac45744acd"],
  [/momo|kothe|dim ?sum|dumpling/, "photo-1534422298391-e4f8c172dddb"],
  [/wonton/, "photo-1625220194771-7ebdea0b70b9"],
  [/garlic bread|bread roll|\bpav\b|\bbuns?\b/, "photo-1606491956689-2ea866880c84"],
  [/spring roll|\brolls?\b|wrap|frankie|kathi|burrito/, "photo-1626700051175-6818013e1d4f"],
  [/pasta|spaghetti|penne|tagliolini|pappardelle|risotto/, "photo-1563379926898-05f4575a45d8"],
  [/noodle|chow ?mein|hakka|ramen/, "photo-1585032226651-759b368d7246"],
  [/biryani|pulao/, "photo-1631515242808-497c3fbd3972"],
  [/fried rice|\brice\b/, "photo-1603133872878-684f208fb84b"],
  [/manchurian|chilli|chili|\b65\b|schezwan/, "photo-1604908176997-125f25cc6f3d"],
  [/paneer/, "photo-1588166524941-3bf61a9c41db"],
  [/tikka|tandoor|kebab|kabab|seekh/, "photo-1567188040759-fb8a883dc6d8"],
  [/chicken|lollipop|wings/, "photo-1532550907401-a500c9a57435"],
  [/fish|prawn|shrimp|seafood|crab|branzino|salmon/, "photo-1574484284002-952d92456975"],
  [/mutton|lamb|steak|beef|brisket|ossobuco|carpaccio/, "photo-1573225342350-16731dd9bf3d"],
  [/\bdal\b|curry|masala|kofta|korma|makhan|makhni|kadhai|kadai/, "photo-1596797038530-2c107229654b"],
  [/roti|naan|paratha|kulcha|chapati/, "photo-1567337710282-00832b415979"],
  [/thali|meal|combo|aloo|bhindi|sabzi|mixed veg/, "photo-1626777552726-4a6b54c97e46"],
  [/samosa|pakora|bhaji|vada|kachori/, "photo-1601050690597-df0568f70950"],
  [/idli|dosa|uttapam/, "photo-1589301760014-d929f3979dbc"],
  [/fries|chips|wedges|potato/, "photo-1573080496219-bb080dd4f877"],
  [/burger/, "photo-1568901346375-23c9450c58cd"],
  [/pizza/, "photo-1513104890138-7c749659a591"],
  [/sandwich|toast|tartine|brioche|bruschetta/, "photo-1619860860774-1e2e17343432"],
  [/salad|bowl|poke/, "photo-1512621776951-a57141f2eefd"],
  [/ice ?cream|gelato|kulfi|sundae|affogato/, "photo-1497034825429-c343d7c6a68f"],
  [/cake|pastry|brownie|cheesecake|tart|torta|babka|croissant|muffin/, "photo-1578985545062-69928b1d9587"],
  [/donut|doughnut|dessert|sweet|gulab|halwa|jamun|dolci/, "photo-1551024601-bec78aea704b"],
  [/pancake|waffle/, "photo-1567620905732-2d1ec7ab7445"],
  [/coffee|latte|cappuccino|espresso|cortado|mocha|pour-over|americano/, "photo-1509042239860-f550ce710b93"],
  [/\btea\b|\bchai\b/, "photo-1576092768241-dec231879fc3"],
  [/cocktail|mocktail|\bipa\b|beer|wine|brew|margarita/, "photo-1544145945-f90425340c7e"],
  [/juice|shake|smoothie|lassi|mojito|soda|lemonade|cola|drink|beverage/, "photo-1556679343-c7306c1976bc"],
  [/corn|cheese ball|nuggets|fritter|crispy/, "photo-1601050690117-94f5f6fa8bd7"]
];
function dishPhoto(it, cuisine) {
  if (it.photo) return it.photo;
  const t = String(it.name || "").toLowerCase() + " " + String(it.description || "").toLowerCase();
  const hit = DISH_PHOTOS.find(([re]) => re.test(String(it.name || "").toLowerCase())) || DISH_PHOTOS.find(([re]) => re.test(t));
  const id = hit ? hit[1] : (CUISINE_PHOTO[cuisine] || CUISINE_PHOTO.other);
  return `https://images.unsplash.com/${id}?w=240&h=240&q=65&auto=format&fit=crop`;
}

function VegDot({ item }) {
  const d = (item.dietary || []).join(" ").toLowerCase();
  if (/non[\s-]?veg/.test(d)) return <span className="dot nonveg" title="Non-Veg" />;
  if (/\bveg|vegan|vegetarian/.test(d)) return <span className="dot veg" title="Veg" />;
  return null;
}

const hideBroken = e => { e.currentTarget.style.visibility = "hidden"; };

function QtyControl({ q, onChange }) {
  if (!q) return <button className="add" onClick={() => onChange(1)}>+ ADD</button>;
  return (
    <span className="qty">
      <button onClick={() => onChange(-1)} aria-label="Remove one">−</button><span>{q}</span><button onClick={() => onChange(1)} aria-label="Add one">+</button>
    </span>
  );
}

export default function PhoneMenu() {
  const [data, setData] = useState(null);      // { brand, menu }
  const [error, setError] = useState("");
  const [cart, setCart] = useState({});        // key "c-i" -> qty
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ table: "", name: "", note: "" });
  const [placing, setPlacing] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [placed, setPlaced] = useState(null);  // the order once placed
  const [orderStatus, setOrderStatus] = useState(null);
  const [recs, setRecs] = useState([]);
  const recsFor = useRef("");
  const tableRef = useRef(null);
  // "links" = the link page shown after scanning; "#menu" in the address opens the menu straight away
  const [view, setView] = useState(location.hash === "#menu" ? "menu" : "links");
  useEffect(() => {
    const onHash = () => { setView(location.hash === "#menu" ? "menu" : "links"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const openMenu = () => { location.hash = "menu"; };   // phone Back button returns to the link page

  useEffect(() => {
    fetch("/api/published-menu" + (SLUG && SLUG !== "m" ? "?slug=" + encodeURIComponent(SLUG) : ""))
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.error);
        const { brand = {}, menu = {} } = res.data;
        const root = document.documentElement.style;
        if (brand.primaryColor) root.setProperty("--brand", brand.primaryColor);
        if (brand.bgColor) { root.setProperty("--bg", brand.bgColor); document.querySelector("meta[name=theme-color]")?.setAttribute("content", brand.bgColor); }
        document.title = (brand.name || "Our") + " Menu";
        if (!(menu.categories || []).length) throw new Error("This menu has no items yet.");
        setData(res.data);
      })
      .catch(err => setError(err.message));
  }, []);

  const brand = data?.brand || {};
  const menu = data?.menu || {};
  const cats = menu.categories || [];
  const ordering = menu.ordering !== false;     // older menus have no flag: keep ordering on
  const itemAt = key => { const [c, i] = key.split("-").map(Number); return cats[c].items[i]; };
  const money = n => {
    const cur = menu.currency;
    const v = Number.isInteger(n) ? String(n) : n.toFixed(2);
    return cur === "/-" ? `${v}/-` : `${cur || ""}${v}`;
  };
  const change = (key, d) => setCart(c => {
    const next = { ...c, [key]: Math.max(0, Math.min(99, (c[key] || 0) + d)) };
    if (!next[key]) delete next[key];
    return next;
  });
  const keys = Object.keys(cart);
  let count = 0, total = 0;
  if (data) for (const k of keys) { count += cart[k]; total += cart[k] * num(itemAt(k).price); }

  // ML recommendations: learned from past orders, or from dish descriptions before there are any
  useEffect(() => {
    if (!sheetOpen || placed || !keys.length) return;
    const sig = keys.slice().sort().join(",");
    if (sig === recsFor.current) return;
    recsFor.current = sig;
    fetch("/api/ml/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: SLUG, cart: keys }) })
      .then(r => r.json())
      .then(res => { if (sig === recsFor.current) setRecs((res.success && res.items) || []); })
      .catch(() => {});
  });

  // Order status updates by itself when the kitchen changes it
  useEffect(() => {
    if (!placed || !sheetOpen) return;
    const t = setInterval(() => {
      fetch(`/api/orders/${placed.id}`).then(r => r.json()).then(res => { if (res.success) setOrderStatus(res.order.status); }).catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [placed, sheetOpen]);

  const openCart = () => { setPlaced(null); recsFor.current = ""; setSheetOpen(true); };
  const closeCart = () => setSheetOpen(false);

  const placeOrder = () => {
    const table = form.table.trim();
    if (!table) { setFormErr("Please enter your table number."); tableRef.current?.focus(); return; }
    setPlacing(true); setFormErr("");
    const items = keys.map(k => { const [c, i] = k.split("-").map(Number); return { c, i, qty: cart[k] }; });
    fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: SLUG, table, name: form.name, note: form.note, items })
    })
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.error);
        setCart({});
        setPlaced(res.order);
        setOrderStatus(res.order.status);
        setPlacing(false);
      })
      .catch(e => { setFormErr(e.message); setPlacing("retry"); });
  };

  const shop = menu.shop || {};
  const mapUrl = shop.mapLink ? (/^https?:\/\//i.test(shop.mapLink) ? shop.mapLink : "https://" + shop.mapLink)
    : shop.coords ? "https://www.google.com/maps/search/?api=1&query=" + shop.coords
    : shop.address ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((brand.name ? brand.name + ", " : "") + shop.address) : "";
  const headerPhoto = CUISINE_PHOTO[brand.cuisine] || CUISINE_PHOTO.other;
  const priceText = it => it.price !== "" && it.price != null ? money(num(it.price)) : "";

  if (data && view === "links") {
    return <LinksPage brand={brand} shop={shop} mapUrl={mapUrl} photo={headerPhoto} onMenu={openMenu} />;
  }

  return (
    <>
      <header style={data ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.75)), url(https://images.unsplash.com/${headerPhoto}?w=${window.innerWidth > 900 ? 1800 : 900}&q=70&auto=format&fit=crop)` } : undefined}>
        {data && <a className="back-home" href="#" onClick={e => { e.preventDefault(); location.hash = ""; }}>‹ Home</a>}
        <h1 id="brandName">{brand.name || "Menu"}</h1><p id="tagline">{brand.tagline || ""}</p>
      </header>
      <nav id="catNav">{data && cats.map((c, i) => <a key={i} href={"#cat" + i}>{c.name}</a>)}</nav>
      <main id="menu">
        {error ? <p className="msg">Menu not available.<br />{error}</p>
          : !data ? <p className="msg">Loading menu…</p>
          : cats.map((c, ci) => (
            <section key={ci} id={"cat" + ci}>
              <h2>{c.name}</h2>
              {(c.items || []).map((it, ii) => (
                <div key={ii} className="item">
                  <img src={dishPhoto(it, brand.cuisine)} alt={it.name} loading="lazy" onError={hideBroken} />
                  <div className="info">
                    <div className="row">
                      <span className="name"><VegDot item={it} />{it.name}</span>
                      <span className="price">{priceText(it)}</span>
                    </div>
                    {(it.description || it.tagline) && <div className="desc">{it.description || it.tagline}</div>}
                    {ordering && <div className="actions"><QtyControl q={cart[`${ci}-${ii}`] || 0} onChange={d => change(`${ci}-${ii}`, d)} /></div>}
                  </div>
                </div>
              ))}
            </section>
          ))}
      </main>
      {data && (shop.address || shop.phone || shop.hours || shop.extra) && (
        <aside id="shopInfo" className="shop">
          <h2>Visit us</h2>
          {shop.address && <p>📍 {shop.address}</p>}
          {shop.phone && <p>📞 <a href={"tel:" + shop.phone.replace(/[^\d+]/g, "")}>{shop.phone}</a></p>}
          {shop.hours && <p>🕒 {shop.hours}</p>}
          {shop.extra && <p>ℹ️ {shop.extra}</p>}
          {mapUrl && <a className="maps" href={mapUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>}
        </aside>
      )}

      {ordering && <button id="cartBar" className={count > 0 ? "show" : ""} onClick={openCart}>
        <span id="cartCount">{count} item{count > 1 ? "s" : ""} · {data ? money(total) : ""}</span><span>View Cart ›</span>
      </button>}

      {ordering && <div id="sheetBg" className={"sheet-bg" + (sheetOpen ? " show" : "")} onClick={e => { if (e.target === e.currentTarget) closeCart(); }}>
        <div className="sheet" id="sheet">
          {placed ? (
            <>
              <h3><span /><button className="close" onClick={closeCart}>×</button></h3>
              <div className="done">
                <div className="tick">✓</div>
                <div style={{ fontWeight: 700 }}>Order placed!</div>
                <div className="num">#{placed.id}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Table {placed.table} · {money(placed.total)}</div>
                <div id="orderStatus" className={"status" + (orderStatus === "ready" || orderStatus === "done" ? " ready" : "")}>{STATUS_TEXT[orderStatus]}</div>
                <p className="hint">This screen updates by itself when the kitchen changes your order.</p>
                <button className="primary" onClick={closeCart}>Back to Menu</button>
              </div>
            </>
          ) : !keys.length ? (
            <>
              <h3>Your Cart <button className="close" onClick={closeCart}>×</button></h3>
              <p className="msg" style={{ padding: "30px 0" }}>Your cart is empty.</p>
            </>
          ) : (
            <>
              <h3>Your Cart <button className="close" onClick={closeCart}>×</button></h3>
              {keys.map(k => { const it = itemAt(k); return (
                <div key={k} className="cline">
                  <span className="n"><VegDot item={it} />{it.name}</span>
                  <span><QtyControl q={cart[k]} onChange={d => change(k, d)} /></span>
                  <span className="p">{money(cart[k] * num(it.price))}</span>
                </div>
              ); })}
              <div id="recs">
                {recs.length > 0 && (
                  <>
                    <div className="recs-h">✨ Goes well with your order</div>
                    <div className="recs">
                      {recs.map(r => { const key = `${r.c}-${r.i}`, it = itemAt(key); if (!it) return null; return (
                        <div key={key} className="rec">
                          <img src={dishPhoto(it, brand.cuisine)} alt="" loading="lazy" onError={hideBroken} />
                          <div className="rn"><VegDot item={it} />{it.name}</div>
                          <div className="rr">{r.reason}</div>
                          <div className="rp"><b>{priceText(it)}</b><button className="add" onClick={() => change(key, 1)}>+ ADD</button></div>
                        </div>
                      ); })}
                    </div>
                  </>
                )}
              </div>
              <div className="total"><span>Total</span><span>{money(total)}</span></div>
              <label htmlFor="table">Table number *</label>
              <input id="table" ref={tableRef} inputMode="numeric" placeholder="e.g. 5" value={form.table} onChange={e => setForm(f => ({ ...f, table: e.target.value }))} />
              <label htmlFor="cname">Your name (optional)</label>
              <input id="cname" placeholder="e.g. Rahul" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <label htmlFor="note">Cooking instructions (optional)</label>
              <textarea id="note" rows={2} placeholder="e.g. Less spicy, no onion" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              <div className="err" id="err">{formErr}</div>
              <button className="primary" id="placeBtn" disabled={placing === true} onClick={placeOrder}>
                {placing === true ? "Placing order…" : placing === "retry" ? "Try Again" : `Place Order · ${money(total)}`}
              </button>
              <p className="hint">Pay at the counter after your meal.</p>
            </>
          )}
        </div>
      </div>}
    </>
  );
}
