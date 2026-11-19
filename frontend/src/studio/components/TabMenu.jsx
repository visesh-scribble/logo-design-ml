import { useState } from "react";
import {
  LayoutGrid, List, Palette, SlidersHorizontal, Pencil, Upload, Clipboard, MapPin, LocateFixed,
  ExternalLink, Download, Image, Printer, QrCode, FileSpreadsheet, Tv
} from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { locationUrl, downloadQrCard, fileBase, qrDataUrl } from "../../shared/files.js";
import { Eyebrow } from "./WizardFooter.jsx";
import MenuBoard, { useQr } from "./MenuBoard.jsx";
import { handleMenuFile } from "./menuFiles.js";
import { exportMenuPNG, exportMenuCSV, printMenu, toggleFullScreenBoard } from "./menuExport.js";

const MENU_TEMPLATES = [
  ["infographic", "Dish cards", "Photos and recipes", "#fff7ed", "#c2410c"],
  ["photorow", "Photo row", "Round dish photos", "#fffbeb", "#166534"],
  ["chinese", "Takeaway trifold", "Many sections", "#991b1b", "#fde68a"],
  ["editorial", "Minimal bistro", "Clean, light paper", "#fbf8f1", "#1c1917"],
  ["luxe", "Noir & gold", "Fine dining", "#111827", "#d4af37"],
  ["chalkboard", "Chalkboard", "Hand-written cafe", "#2b2f2c", "#f5f5f4"],
  ["tv", "TV display", "Wide 16:9 screen", "#0f172a", "#f59e0b"]
];

function TemplateThumb({ bg, fg }) {
  const bar = (l, t, w, h, o, k) => <i key={k} style={{ left: l + "%", top: t + "px", width: w + "%", height: h + "px", background: fg, opacity: o }} />;
  const bars = [bar(34, 8, 32, 6, 1, "t")];
  [22, 31, 38, 45].forEach((t, k) => { const h = k ? 2 : 3, o = k ? .35 : .7; bars.push(bar(10, t, 35, h, o, "a" + k), bar(55, t, 35, h, o, "b" + k)); });
  return <div className="ms-th" style={{ background: bg, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)" }}>{bars}</div>;
}

const press = (on) => ({ "aria-pressed": on ? "true" : "false", className: on ? "sel" : "" });

export function downloadLocQrPNG() {
  const s = useStudio.getState();
  const url = locationUrl(s.menu.shop, s.brand.name);
  if (!url) return;
  qrDataUrl(url).then(qrUrl => {
    const addr = s.menu.shop.address.trim().replace(/\s+/g, " ");
    downloadQrCard({
      qrUrl, brand: s.brand, title: "SCAN TO FIND US",
      lines: [addr.length > 55 ? addr.slice(0, 54) + "…" : addr, s.menu.shop.phone.trim()],
      filename: `${fileBase(s.brand.name) || "shop"}_location_qr.png`
    });
  });
}

function LocationQr() {
  const shop = useStudio(s => s.menu.shop);
  const brandName = useStudio(s => s.brand.name);
  const setShop = useStudio(s => s.setShop);
  const [geoMsg, setGeoMsg] = useState("");
  const url = shop.locQr ? locationUrl(shop, brandName) : "";
  const qr = useQr(url);
  const msg = geoMsg || (!url
    ? "Type your shop address above, paste a Google Maps link, or use your current location."
    : shop.mapLink.trim() ? "Using your Google Maps link."
    : shop.coords ? "Using your current location (" + shop.coords + ")."
    : "Using your shop address. For an exact pin, paste your Google Maps link.");

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoMsg("This browser cannot share location. Paste a Google Maps link instead."); return; }
    if (!window.isSecureContext) { setGeoMsg("Location only works on this computer (localhost) or over https. Paste a Google Maps link instead."); return; }
    setGeoMsg("Finding your location…");
    navigator.geolocation.getCurrentPosition(pos => {
      setGeoMsg("");
      setShop({ coords: pos.coords.latitude.toFixed(6) + "," + pos.coords.longitude.toFixed(6), mapLink: "" });
    }, err => {
      setGeoMsg(err.code === 1 ? "Location permission was blocked. Allow it in the browser, or paste a Google Maps link." : "Could not get your location. Paste a Google Maps link instead.");
    }, { enableHighAccuracy: true, timeout: 15000 });
  };

  return (
    <div className="ms-grp">
      <span className="ms-lab">Do you want a location QR code?</span>
      <div className="ms-seg">
        <button type="button" id="btnLocQrYes" {...press(shop.locQr === true)} onClick={() => setShop({ locQr: true })}><MapPin />Yes</button>
        <button type="button" id="btnLocQrNo" {...press(shop.locQr !== true)} onClick={() => setShop({ locQr: false })}>No</button>
      </div>
      {shop.locQr && (
        <div id="locQrBox" style={{ marginTop: ".75rem" }}>
          <div className="ms-stack">
            <input type="url" id="shopMapLink" className="ms-field" placeholder="Google Maps link (optional)" aria-label="Google Maps link"
              value={shop.mapLink} onChange={e => { setGeoMsg(""); setShop({ mapLink: e.target.value }); }} />
            <button type="button" className="ms-row" onClick={useMyLocation}><span className="ms-ico"><LocateFixed /></span><span><b>Use my current location</b><small>Stand at your shop and tap this</small></span></button>
          </div>
          <p id="locQrMsg" className="ms-hint">{msg}</p>
          <div className="loc-qr-card">
            <div id="locQrCode">{qr && <img src={qr} alt="Location QR code" />}</div>
            <small>Scan to find us</small>
          </div>
          <div className="ms-stack" style={{ marginTop: ".6rem" }}>
            <button type="button" className="ms-row" onClick={() => url && window.open(url, "_blank", "noopener")}><span className="ms-ico"><ExternalLink /></span><span><b>Test the location</b><small>Opens the link inside the QR</small></span></button>
            <button type="button" className="ms-row ms-row-primary" onClick={downloadLocQrPNG}><span className="ms-ico"><Download /></span><span><b>Download location QR</b><small>PNG to print or share</small></span></button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel() {
  const s = useStudio();
  const m = s.menu;
  const cats = m.categories;
  const totalItems = cats.reduce((n, c) => n + c.items.length, 0);
  const tab = (key, Icon, label) => (
    <button type="button" className="ms-tab" role="tab" aria-selected={s.msTab === key ? "true" : "false"} aria-controls={"ms-p-" + key}
      data-p={key} onClick={() => s.setMsTab(key)}><Icon />{label}</button>
  );
  const pane = (key) => "ms-pane" + (s.msTab === key ? " on" : "");
  const toggle = (id, key, title, sub) => (
    <label className="ms-switch-row"><span><b>{title}</b><small>{sub}</small></span>
      <span className="ms-toggle"><input type="checkbox" id={id} checked={m[key]} onChange={e => s.setMenu({ [key]: e.target.checked })} /><i /></span></label>
  );
  const shopField = (Tag, id, key, placeholder, label, extra = {}) => (
    <Tag id={id} className="ms-field" placeholder={placeholder} aria-label={label} value={m.shop[key]} onChange={e => s.setShop({ [key]: e.target.value })} {...extra} />
  );

  return (
    <aside className="ms-panel no-print">
      <div className="ms-tabs" role="tablist" aria-label="Menu settings">
        {tab("layout", LayoutGrid, "Layout")}
        {tab("dishes", List, "Dishes")}
        {tab("style", Palette, "Style")}
        {tab("details", SlidersHorizontal, "Details")}
      </div>

      {/* DISHES */}
      <div className={pane("dishes")} id="ms-p-dishes" role="tabpanel">
        <div className="ms-grp">
          <div className="ms-summary"><span id="menuItemCount" className="ms-num">{totalItems}</span><div><b>dishes on your menu</b>
            <small id="menuSectionCount">{cats.length + (cats.length === 1 ? " section" : " sections") + (cats.length ? " · " + cats.slice(0, 2).map(c => c.name).join(", ") + (cats.length > 2 ? "…" : "") : "")}</small></div></div>
        </div>
        <div className="ms-grp">
          <button type="button" className="ms-row ms-row-primary" onClick={() => s.openModal("editor")}><span className="ms-ico"><Pencil /></span><span><b>Edit dishes &amp; prices</b><small>Add, remove or change any dish and photo</small></span></button>
        </div>
        <div className="ms-grp">
          <span className="ms-lab">Replace the dishes</span>
          <div className="ms-stack">
            <label className="ms-row" htmlFor="menuFileInput">
              <input type="file" id="menuFileInput" accept=".csv,.xlsx,.xls,.json,.txt" className="hidden" onChange={e => { handleMenuFile(e.target.files[0]); e.target.value = ""; }} />
              <span className="ms-ico"><Upload /></span><span><b>Upload a file</b><small>Excel, CSV or JSON</small></span>
            </label>
            <button type="button" className="ms-row" onClick={() => s.openModal("rawText")}><span className="ms-ico"><Clipboard /></span><span><b>Paste menu text</b><small>We sort it into dishes and prices</small></span></button>
            <select id="sampleSelect" className="ms-field" value="" onChange={e => s.loadSampleMenu(e.target.value)} aria-label="Start from a sample menu">
              <option value="" disabled>Start from a sample menu&hellip;</option>
              <option value="veg_starters">Veg Starters</option>
              <option value="indian_main">Indian Main Course</option>
              <option value="hongkong_chinese">Hong Kong Chinese</option>
              <option value="editorial_bistro">Salads &amp; Burgers</option>
            </select>
          </div>
        </div>
      </div>

      {/* STYLE */}
      <div className={pane("style")} id="ms-p-style" role="tabpanel">
        <div className="ms-grp">
          <span className="ms-lab">Menu design</span>
          <div className="ms-tpls" id="msTemplates">
            {MENU_TEMPLATES.map(([k, n, d, bg, fg]) => (
              <button key={k} type="button" data-tpl={k} aria-pressed={m.template === k ? "true" : "false"} className={"ms-tpl" + (m.template === k ? " sel" : "")}
                onClick={() => s.setMenu({ template: k })}><TemplateThumb bg={bg} fg={fg} /><b>{n}</b><small>{d}</small></button>
            ))}
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className={pane("layout")} id="ms-p-layout" role="tabpanel">
        <div className="ms-grp">
          <span className="ms-lab">Columns</span>
          <div className="ms-seg">
            {[1, 2, 3, 4].map(i => <button key={i} type="button" id={"btnCol" + i} {...press(m.columns === i)} onClick={() => s.setMenu({ columns: i })}>{i}</button>)}
          </div>
        </div>
        <div className="ms-grp">
          <span className="ms-lab">Prices</span>
          <select id="menuCurrencySelect" value={m.currency} onChange={e => s.setMenu({ currency: e.target.value })} className="ms-field" aria-label="Currency">
            <option value="Rs. ">Rs. (Rupees)</option>
            <option value="/-">100/- style</option>
            <option value="₹">₹ symbol</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
          </select>
          <div className="ms-seg" style={{ marginTop: ".6rem" }}>
            {[["dots", "Dotted ...."], ["pill", "Pill"], ["clean", "Plain"]].map(([v, l]) => (
              <button key={v} type="button" data-price={v} {...press(m.priceStyle === v)} onClick={() => s.setMenu({ priceStyle: v })}>{l}</button>
            ))}
          </div>
        </div>

        {/* SHOP ADDRESS & DETAILS */}
        <div className="ms-grp">
          <span className="ms-lab">Shop address &amp; details</span>
          <div className="ms-stack">
            {shopField("textarea", "shopAddress", "address", "Shop address, e.g. 42 MG Road, Indiranagar, Bengaluru 560038", "Shop address", { rows: 2 })}
            {shopField("input", "shopPhone", "phone", "Phone, e.g. +91 98765 43210", "Phone number", { type: "tel" })}
            {shopField("input", "shopHours", "hours", "Opening hours, e.g. 11 am – 11 pm, all days", "Opening hours", { type: "text" })}
            {shopField("input", "shopExtra", "extra", "Other details, e.g. Free home delivery · Instagram @yourshop", "Other details", { type: "text" })}
          </div>
          <p className="ms-hint">Shown at the bottom of your menu board.</p>
        </div>

        <LocationQr />
      </div>

      {/* DETAILS */}
      <div className={pane("details")} id="ms-p-details" role="tabpanel">
        <div className="ms-grp">
          <span className="ms-lab">Show on the board</span>
          {toggle("toggleShowLogo", "showLogo", "Your logo", "At the top of the menu")}
          {toggle("toggleVegBadges", "showVegBadges", "Veg / non-veg marks", "Green and red dots")}
          {toggle("toggleShowDesc", "showDesc", "Dish descriptions", "Ingredients under each dish")}
          {toggle("toggleShowDietary", "showDietary", "Recipe tips", "How each dish is made")}
          {toggle("toggleShowFooter", "showFooter", "Shop address & QR", "Strip at the bottom (fill it in under Layout)")}
        </div>
        <div className="ms-grp">
          <label className="ms-lab" htmlFor="menuHeaderSubtext">Announcement line</label>
          <input type="text" id="menuHeaderSubtext" className="ms-field" value={m.headerSubtext} placeholder="e.g. Party orders welcome"
            onChange={e => s.setMenu({ headerSubtext: e.target.value })} />
        </div>
      </div>
    </aside>
  );
}

export function DownloadItem({ id, Icon, title, sub, onClick, hidden }) {
  return (
    <button type="button" id={id} className={"dl-item" + (hidden ? " hidden" : "")} onClick={onClick}>
      <span className="ms-ico"><Icon /></span><span><b>{title}</b><small>{sub}</small></span>
    </button>
  );
}

// MENU BOARD STUDIO
export default function TabMenu() {
  const def = STEP_DEFS.menu;
  const zoom = useStudio(s => s.menuZoom);
  const setMenuZoom = useStudio(s => s.setMenuZoom);
  const openModal = useStudio(s => s.openModal);
  const showLocQr = useStudio(s => s.menu.shop.locQr && !!locationUrl(s.menu.shop, s.brand.name));

  return (
    <div id="tab-menu" className="animate-fade-in">
      <div className="ms-head no-print">
        <div>
          <Eyebrow />
          <h1 id="menuTitle" className="display page-title">{def.title}</h1>
          <p id="menuSub" className="q-sub">{def.sub}</p>
        </div>
      </div>

      <div className="ms-work">
        <SettingsPanel />
        <section className="ms-canvas">
          <div className="ms-ctool no-print">
            <div className="ms-live"><i />Live preview &middot; click any text on the board to edit it</div>
            <div className="ms-zoom">
              <button type="button" onClick={() => setMenuZoom(-10)} aria-label="Zoom out">&minus;</button>
              <span id="menuZoomVal">{zoom}%</span>
              <button type="button" onClick={() => setMenuZoom(10)} aria-label="Zoom in">+</button>
              <button type="button" className="ms-fit" onClick={() => setMenuZoom(0)}>Fit</button>
            </div>
          </div>
          <div className="ms-stage">
            <div id="menuZoom" style={{ zoom: zoom / 100 }}>
              {/* WRAPPER TARGET FOR EXPORT AND DISPLAY */}
              <div id="menuBoardWrapper" className="w-full transition-all duration-300 max-w-4xl"><MenuBoard /></div>
            </div>
          </div>
        </section>
      </div>

      {/* DOWNLOAD & SHARE: bottom of the menu page */}
      <section id="msDlSection" className="dl-section no-print">
        <h2 className="display">Download &amp; share your menu</h2>
        <p>Happy with the board? Save it, print it, or put it on your customers' phones.</p>
        <div className="dl-grid">
          <DownloadItem Icon={Image} title="Image (PNG)" sub="For WhatsApp, Instagram or a screen" onClick={exportMenuPNG} />
          <DownloadItem Icon={Printer} title="Print or PDF" sub="For a printed menu card" onClick={printMenu} />
          <DownloadItem Icon={QrCode} title="QR menu for phones" sub="Customers scan, see photos and order" onClick={() => openModal("qr")} />
          <DownloadItem Icon={FileSpreadsheet} title="Dish list (CSV)" sub="Open in Excel or your billing system" onClick={exportMenuCSV} />
          <DownloadItem Icon={Tv} title="TV display" sub="Full screen for a TV behind the counter" onClick={() => { setMenuZoom(0); toggleFullScreenBoard(); }} />
          <DownloadItem id="msDlLocQr" Icon={MapPin} title="Location QR" sub="Scan to find your shop" onClick={downloadLocQrPNG} hidden={!showLocQr} />
        </div>
      </section>
    </div>
  );
}
