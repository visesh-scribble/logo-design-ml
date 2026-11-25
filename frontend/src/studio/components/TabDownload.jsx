import { Check, BookOpen, Smartphone, ShoppingBag, Image, PenTool, Printer, Tv, FileSpreadsheet, QrCode, MapPin, ChefHat, ExternalLink, FileText } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { selectedLogoInfo, interpretStyleWords } from "../../shared/brand.js";
import { downloadSVG, downloadSVGasPNG, fileBase, locationUrl, downloadBriefPNG } from "../../shared/files.js";
import { Eyebrow } from "./WizardFooter.jsx";
import { Svg } from "./ui.jsx";
import { BoardStage, DownloadItem, downloadLocQrPNG } from "./TabMenu.jsx";
import { exportMenuPNG, exportMenuCSV, printMenu, toggleFullScreenBoard } from "./menuExport.js";

// LAST PAGE: everything the person made, grouped, with only the groups that apply to them
export default function TabDownload() {
  const def = STEP_DEFS.download;
  const s = useStudio();
  const g = s.goals;
  const logo = selectedLogoInfo(s.selectedLogo, s.myLogo);
  const svg = logo.generate(s.brand);
  const base = fileBase(s.brand.name);

  const hasMenu = (g.menucard || g.onlinemenu || g.onlineorder) && s.menu.categories.length > 0;
  const online = g.onlinemenu || g.onlineorder;
  const hasLocQr = !!(s.menu.shop.locQr && locationUrl(s.menu.shop, s.brand.name));
  const hasRef = g.logo && s.hasLogo === "reference" && (s.reference.image || s.reference.notes.trim());
  const brief = () => downloadBriefPNG({
    brand: s.brand, reference: s.reference, logoSvg: svg,
    chips: interpretStyleWords(s.reference.notes + " " + s.styleText).chips,
    filename: `${base}_design_brief.png`
  });

  // "You have created:" one line per thing the person made
  const dishes = s.menu.categories.reduce((n, c) => n + c.items.length, 0);
  const menuSize = `${dishes} dish${dishes === 1 ? "" : "es"} in ${s.menu.categories.length} section${s.menu.categories.length === 1 ? "" : "s"}`;
  const made = [
    g.logo && [PenTool, "Logo", s.selectedLogo.kind === "custom" ? "Your own logo, adjusted" : logo.title],
    hasRef && [FileText, "Design brief", "Your reference and notes for a designer"],
    g.menucard && hasMenu && [BookOpen, "Menu card", menuSize + ", for print and TV"],
    g.onlinemenu && hasMenu && [Smartphone, "Online menu", "A QR menu customers open on their phones"],
    g.onlineorder && hasMenu && [ShoppingBag, "Online ordering", "Table orders that go to your kitchen screen"],
    hasLocQr && [MapPin, "Location QR", "Opens your shop on Google Maps"]
  ].filter(Boolean);

  const group = (title, sub, children) => (
    <section className="dlp-group">
      <div className="dlp-group-head"><h2>{title}</h2><span>{sub}</span></div>
      <div className="dlp-list">{children}</div>
    </section>
  );

  return (
    <div id="tab-download" className="animate-fade-in">
      <div className="page-head">
        <Eyebrow />
        <h1 className="display page-title">{def.title}</h1>
        <p className="q-sub">{def.sub}</p>
      </div>

      <div className={"dlp" + (hasMenu || g.logo ? "" : " dlp-single")}>
        {/* Previews: what the files look like */}
        {(g.logo || hasMenu) && (
          <aside className="dlp-previews">
            {g.logo && (
              <figure className="dlp-prev dlp-prev-logo">
                <Svg className="dlp-logo" markup={svg} />
                <figcaption>{logo.title}</figcaption>
              </figure>
            )}
            {hasMenu && (
              <figure className="dlp-prev dlp-prev-menu">
                <BoardStage stageClass="dlp-stage" />
                <figcaption>Menu board · click any text to fix it</figcaption>
              </figure>
            )}
          </aside>
        )}

        {/* Downloads */}
        <div className="dlp-groups">
          {made.length > 0 && (
            <section className="made" aria-labelledby="madeHead">
              <h2 id="madeHead">You have created:</h2>
              <ul>
                {made.map(([Icon, title, sub]) => (
                  <li key={title}>
                    <span className="made-ico"><Icon aria-hidden="true" /></span>
                    <span className="made-txt"><b>{title}</b><small>{sub}</small></span>
                    <span className="made-check" aria-hidden="true"><Check /></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {online && hasMenu && (
            <div className="online-ready">
              <span className="online-ico"><QrCode /></span>
              <div className="online-txt">
                <b>Your online menu is ready</b>
                <small>{g.onlineorder
                  ? "Customers scan the QR code, browse your dishes and order from their table. Orders appear on your kitchen screen."
                  : "Customers scan the QR code and see your full menu with photos and prices on their phone."}</small>
              </div>
              <button type="button" className="online-btn" onClick={() => s.openModal("qr")}>Get QR code</button>
            </div>
          )}

          {g.logo && group("Logo", "For signs, print and social media", <>
            <DownloadItem Icon={Image} title="Logo (PNG)" sub="2048 × 2048, for print & social" onClick={() => downloadSVGasPNG(svg, `${base}_${logo.type}.png`)} />
            <DownloadItem Icon={PenTool} title="Logo (SVG)" sub="Sharp at any size, for sign makers" onClick={() => downloadSVG(svg, `${base}_${logo.type}.svg`)} />
          </>)}

          {hasRef && group("Design brief", "Your reference, notes and colours in one page", <>
            <DownloadItem id="dlBrief" Icon={FileText} title="Design brief (PNG)" sub="Share it with a designer or printer" onClick={brief} />
          </>)}

          {hasMenu && group("Menu card", "Print it, post it or show it on a TV", <>
            <DownloadItem id="dlMenuPng" Icon={Image} title="Menu board (PNG)" sub="For WhatsApp, Instagram or a screen" onClick={exportMenuPNG} />
            <DownloadItem Icon={Printer} title="Print or PDF" sub="For a printed menu card" onClick={printMenu} />
            <DownloadItem Icon={Tv} title="TV display" sub="Full screen for a TV behind the counter" onClick={toggleFullScreenBoard} />
            <DownloadItem id="dlMenuCsv" Icon={FileSpreadsheet} title="Dish list (CSV)" sub="Open in Excel or your billing system" onClick={exportMenuCSV} />
          </>)}

          {online && hasMenu && group(g.onlineorder ? "Online menu & ordering" : "Online menu", "Customers use it on their phones", <>
            <DownloadItem id="dlMenuQr" Icon={QrCode} title="QR code for tables" sub={g.onlineorder ? "Customers scan, see photos and order" : "Customers scan and see your menu"} onClick={() => s.openModal("qr")} />
            {g.onlineorder && <DownloadItem Icon={ChefHat} title="Kitchen orders screen" sub="Open on a tablet in your kitchen" onClick={() => window.open("/orders.html", "_blank", "noopener")} />}
          </>)}

          {hasLocQr && group("Location", "Help customers find your shop", <>
            <DownloadItem id="dlLocQr" Icon={MapPin} title="Location QR" sub="Scan to open your shop on Google Maps" onClick={downloadLocQrPNG} />
            <DownloadItem Icon={ExternalLink} title="Test the location link" sub="Opens the link inside the QR" onClick={() => window.open(locationUrl(s.menu.shop, s.brand.name), "_blank", "noopener")} />
          </>)}

          {!g.logo && !hasMenu && <p className="q-sub">Nothing to download yet. Go back and add your menu.</p>}
        </div>
      </div>
    </div>
  );
}
