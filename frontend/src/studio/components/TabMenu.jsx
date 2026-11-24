import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  LayoutGrid, List, Palette, SlidersHorizontal, Pencil, Upload, Clipboard, MapPin, LocateFixed,
  ExternalLink, Download, Maximize2, QrCode, Link2
} from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { locationUrl, downloadQrCard, fileBase, qrDataUrl } from "../../shared/files.js";
import { Eyebrow } from "./WizardFooter.jsx";
import MenuBoard, { useQr } from "./MenuBoard.jsx";
import { handleMenuFile } from "./menuFiles.js";
import { toggleFullScreenBoard, publishMenu } from "./menuExport.js";
import { useMediaQuery, useFitZoom, BOARD_WIDTH } from "./ui.jsx";

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

export function downloadMenuQrPNG() {
  const s = useStudio.getState();
  const url = (s.menu.shop.menuLink || "").trim();
  if (!url) return;
  qrDataUrl(url).then(qrUrl => downloadQrCard({
    qrUrl, brand: s.brand, title: "SCAN FOR MENU", lines: ["Point your phone camera at the code"],
    filename: `${fileBase(s.brand.name) || "shop"}_menu_qr.png`
  }));
}

// Online menu QR shown on the board: the owner's own link, or the app's phone menu.
function MenuQr() {
  const shop = useStudio(s => s.menu.shop);
  const setShop = useStudio(s => s.setShop);
  const [msg, setMsg] = useState("");
  const url = shop.menuQr ? (shop.menuLink || "").trim() : "";
  const qr = useQr(url);

  const usePhoneMenu = () => {
    const s = useStudio.getState();
    if (!s.menu.categories.length) { setMsg("Load or add a menu first."); return; }
    setMsg("Preparing your phone menu…");
    publishMenu(s.brand, s.menu)
      .then(link => {
        setShop({ menuLink: link });
        setMsg("Demo link: works only for phones on the same Wi-Fi as this computer, while the app is running. For real customers, paste your public menu link instead.");
      })
      .catch(err => setMsg("Could not publish the menu: " + err.message + ". Restart the server (start.bat) and try again."));
  };

  return (
    <div className="ms-grp">
      <span className="ms-lab">Add an online menu QR to the board?</span>
      <div className="ms-seg">
        <button type="button" id="btnMenuQrYes" {...press(shop.menuQr === true)} onClick={() => setShop({ menuQr: true })}><QrCode />Yes</button>
        <button type="button" id="btnMenuQrNo" {...press(shop.menuQr !== true)} onClick={() => setShop({ menuQr: false })}>No</button>
      </div>
      {shop.menuQr && (
        <div id="menuQrBox" style={{ marginTop: ".75rem" }}>
          <div className="ms-stack">
            <input type="url" id="shopMenuLink" className="ms-field" placeholder="Online menu link, e.g. https://yourshop.com/menu" aria-label="Online menu link"
              value={shop.menuLink || ""} onChange={e => { setMsg(""); setShop({ menuLink: e.target.value }); }} />
            <button type="button" className="ms-row" onClick={usePhoneMenu}><span className="ms-ico"><Link2 /></span><span><b>Use our phone menu link</b><small>Publishes this menu for phones</small></span></button>
          </div>
          <p id="menuQrMsg" className="ms-hint">{msg || (url ? "Customers scan this to open your menu." : "Paste your website, Zomato or Swiggy link.")}</p>
          {qr && (
            <>
              <div className="loc-qr-card">
                <div><img src={qr} alt="Online menu QR code" style={{ width: 160, height: 160, display: "block", margin: "0 auto" }} /></div>
                <small>Scan for menu</small>
              </div>
              <div className="ms-stack" style={{ marginTop: ".6rem" }}>
                <button type="button" className="ms-row" onClick={() => window.open(/^https?:\/\//i.test(url) ? url : "https://" + url, "_blank", "noopener")}><span className="ms-ico"><ExternalLink /></span><span><b>Test the link</b><small>Opens the link inside the QR</small></span></button>
                <button type="button" className="ms-row ms-row-primary" onClick={downloadMenuQrPNG}><span className="ms-ico"><Download /></span><span><b>Download menu QR</b><small>PNG to print or share</small></span></button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
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

const TOOL_TABS = [
  ["layout", LayoutGrid, "Layout", "Columns, prices and your shop details"],
  ["dishes", List, "Dishes", "Edit, upload or paste your dishes"],
  ["style", Palette, "Style", "Pick a design for your menu"],
  ["details", SlidersHorizontal, "Details", "Choose what shows on the board"]
];

// sheet = shown as a bottom sheet (tablet/phone) instead of a side panel (laptop)
function SettingsPanel({ sheet, open, onClose }) {
  const s = useStudio();
  const m = s.menu;
  const cats = m.categories;
  const totalItems = cats.reduce((n, c) => n + c.items.length, 0);
  const panelRef = useRef(null);
  const [, , label, desc] = TOOL_TABS.find(t => t[0] === s.msTab) || TOOL_TABS[0];
  const pane = (key) => "ms-pane" + (s.msTab === key ? " on" : "");

  // Sheet: focus moves in when it opens, Esc closes it (but not while a pop-up is open on top)
  useEffect(() => {
    if (!sheet || !open) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = e => { if (e.key === "Escape" && !useStudio.getState().modal) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet, open, onClose]);
  const toggle = (id, key, title, sub) => (
    <label className="ms-switch-row"><span><b>{title}</b><small>{sub}</small></span>
      <span className="ms-toggle"><input type="checkbox" id={id} checked={m[key]} onChange={e => s.setMenu({ [key]: e.target.checked })} /><i /></span></label>
  );
  const shopField = (Tag, id, key, placeholder, label, extra = {}) => (
    <Tag id={id} className="ms-field" placeholder={placeholder} aria-label={label} value={m.shop[key]} onChange={e => s.setShop({ [key]: e.target.value })} {...extra} />
  );

  const body = (
    <>
    {sheet && open && <div className="ms-sheet-bg no-print" onClick={onClose} aria-hidden="true" />}
    <aside id="msPanel" ref={panelRef} tabIndex={-1} className={"ms-panel no-print" + (sheet ? " is-sheet" : "") + (open ? " open" : "")}
      role={sheet ? "dialog" : "tabpanel"} aria-modal={sheet ? "true" : undefined} aria-label={label + " settings"}>
      {sheet && <span className="ms-grab" aria-hidden="true" />}
      <div className="ms-panel-head">
        <div><b>{label}</b><small>{desc}</small></div>
        {sheet && <button type="button" className="ms-done" onClick={onClose}>Done</button>}
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

        <MenuQr />
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
    </>
  );
  // On tablets/phones the sheet lives in <body>, so no animated page wrapper can move it
  return sheet ? createPortal(body, document.body) : body;
}

export function DownloadItem({ id, Icon, title, sub, onClick, hidden }) {
  return (
    <button type="button" id={id} className={"dl-item" + (hidden ? " hidden" : "")} onClick={onClick}>
      <span className="ms-ico"><Icon /></span><span><b>{title}</b><small>{sub}</small></span>
    </button>
  );
}

// The live board at its real (export) size, scaled to fit the space it is given.
// manual = allow the −/+ zoom from the store; otherwise it always fits.
export function BoardStage({ manual = false, stageClass = "ms-stage" }) {
  const stageRef = useRef(null);
  const fit = useFitZoom(stageRef);
  const mode = useStudio(s => s.menuZoomMode);
  const menuZoom = useStudio(s => s.menuZoom);
  const exporting = useStudio(s => s.boardExporting);
  const zoom = exporting ? 100 : manual && mode === "manual" ? menuZoom : fit;
  return (
    <div className={stageClass} ref={stageRef}>
      <div id="menuZoom" style={{ zoom: zoom / 100 }}>
        {/* WRAPPER TARGET FOR EXPORT AND DISPLAY */}
        <div id="menuBoardWrapper" style={{ width: BOARD_WIDTH }}><MenuBoard /></div>
      </div>
    </div>
  );
}

function ZoomTools() {
  const mode = useStudio(s => s.menuZoomMode);
  const menuZoom = useStudio(s => s.menuZoom);
  const setMenuZoom = useStudio(s => s.setMenuZoom);
  // "fit" shows the real fitted percentage, read from the board on screen
  const [shown, setShown] = useState(100);
  useEffect(() => {
    const el = document.getElementById("menuZoom");
    if (!el) return;
    const read = () => setShown(Math.round(parseFloat(el.style.zoom || 1) * 100));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, []);
  const cur = mode === "manual" ? menuZoom : shown;
  return (
    <div className="ms-zoom" role="group" aria-label="Zoom">
      <button type="button" onClick={() => setMenuZoom(-10, cur)} aria-label="Zoom out">&minus;</button>
      <span id="menuZoomVal" aria-live="polite">{cur}%</span>
      <button type="button" onClick={() => setMenuZoom(10, cur)} aria-label="Zoom in">+</button>
      <button type="button" className={"ms-fit" + (mode === "fit" ? " on" : "")} onClick={() => setMenuZoom(0)} aria-pressed={mode === "fit" ? "true" : "false"}>Fit</button>
    </div>
  );
}

// MENU BOARD STUDIO: tools rail + panel + big live canvas (laptop); canvas + bottom dock + sheet (tablet/phone)
export default function TabMenu() {
  const def = STEP_DEFS.menu;
  const isDesk = useMediaQuery("(min-width: 1024px)");
  const msTab = useStudio(s => s.msTab);
  const setMsTab = useStudio(s => s.setMsTab);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => { if (isDesk) setSheetOpen(false); }, [isDesk]);

  const pick = key => {
    if (isDesk) { setMsTab(key); return; }
    if (sheetOpen && key === msTab) { setSheetOpen(false); return; }
    setMsTab(key);
    setSheetOpen(true);
  };
  const tabs = cls => TOOL_TABS.map(([key, Icon, label]) => (
    <button key={key} type="button" className={cls} role="tab" aria-selected={msTab === key && (isDesk || sheetOpen) ? "true" : "false"}
      aria-controls="msPanel" data-p={key} onClick={() => pick(key)}><Icon aria-hidden="true" /><span>{label}</span></button>
  ));

  return (
    <div id="tab-menu" className="animate-fade-in">
      <div className="ms-head no-print">
        <div className="ms-head-txt">
          <Eyebrow />
          <h1 id="menuTitle" className="display page-title">{def.title}</h1>
          <p id="menuSub" className="q-sub">{def.sub}</p>
        </div>
        <div className="ms-head-tools">
          <ZoomTools />
          <button type="button" className="ms-btn" onClick={toggleFullScreenBoard}><Maximize2 />Full screen</button>
        </div>
      </div>

      <div className="ms-work">
        {isDesk && <nav className="ms-rail no-print" role="tablist" aria-label="Menu tools">{tabs("ms-rail-btn")}</nav>}
        <SettingsPanel sheet={!isDesk} open={isDesk || sheetOpen} onClose={closeSheet} />
        <section className="ms-canvas" aria-label="Live preview of your menu board">
          <BoardStage manual />
        </section>
      </div>

      {!isDesk && createPortal(<nav className="ms-dock no-print" role="tablist" aria-label="Menu tools">{tabs("ms-dock-btn")}</nav>, document.body)}
    </div>
  );
}
