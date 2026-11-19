import { useEffect, useState } from "react";
import { Store, BookOpen, Coffee, CreditCard, Image, PenTool, LayoutList, FileSpreadsheet, QrCode, MapPin } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { selectedLogoInfo } from "../../shared/brand.js";
import { downloadSVG, downloadSVGasPNG, fileBase, locationUrl } from "../../shared/files.js";
import { Eyebrow } from "./WizardFooter.jsx";
import { CentreFocus, Svg } from "./ui.jsx";
import MenuBoard from "./MenuBoard.jsx";
import { DownloadItem, downloadLocQrPNG } from "./TabMenu.jsx";
import { exportMenuPNG, exportMenuCSV } from "./menuExport.js";

// BRAND MOCKUPS: the selected logo on a signboard, menu cover, packaging and business card
export default function TabMockups() {
  const def = STEP_DEFS.mockups;
  const s = useStudio();
  const logo = selectedLogoInfo(s.selectedLogo, s.myLogo);
  const svg = logo.generate(s.brand);
  const base = fileBase(s.brand.name);
  // Download section: only show what this person actually made
  const hasMenu = s.wantMenu === true && s.menu.categories.length > 0;
  const hasLocQr = !!(s.menu.shop.locQr && locationUrl(s.menu.shop, s.brand.name));

  // The menu tab is not on this page: render the board off-screen just long enough to take the picture
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    if (!exporting) return;
    const t = setTimeout(() => exportMenuPNG().finally(() => setExporting(false)), 50);
    return () => clearTimeout(t);
  }, [exporting]);

  const card = (Icon, title, note, children) => (
    <div className="studio-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1c1917] flex items-center space-x-2">
          <Icon className="w-4 h-4 text-[#b45309]" />
          <span>{title}</span>
        </h3>
        <span className="text-[11px] text-[#78716c]">{note}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div id="tab-mockups" className="animate-fade-in space-y-6">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <Eyebrow />
        <h1 id="mockTitle" className="display page-title">{def.title}</h1>
        <p id="mockSub" className="q-sub">{def.sub}</p>
      </div>

      <div className="studio-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Real-World Brand Showcase</h2>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1">See your selected logo applied across storefront signage, leather menu covers, coffee cups, and stationery.</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#fbfaf7] border border-[#e7e5e0] px-3 py-1.5 rounded-xl">
          <span className="text-xs text-[#78716c]">Current Design:</span>
          <span id="mockupActiveLogoTitle" className="text-xs font-bold text-[#b45309]">{logo.title}</span>
        </div>
      </div>

      {/* Mockup carousel */}
      <CentreFocus id="mockupGrid" className="grid grid-cols-1 md:grid-cols-2 gap-6" autoMs={4500}>
        {card(Store, "Exterior Architectural Signboard", "Backlit Matte Acrylic",
          <div className="w-full h-72 rounded-xl mockup-storefront mock-photo border border-[#2d2b29] flex flex-col items-center justify-center p-6 shadow-xl relative"
            style={{ background: "linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.7)),url(https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&q=70&auto=format&fit=crop)" }}>
            <div className="bg-[#151413] border border-[#3d3a37] p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center max-w-sm w-full text-center relative z-10">
              <Svg id="mockupStorefrontLogo" className="w-48 h-32 flex items-center justify-center" markup={svg} />
              <div className="mt-2 text-[10px] text-[#a8a29e] tracking-widest uppercase font-semibold">Fine Food &amp; Crafted Hospitality</div>
            </div>
          </div>)}
        {card(BookOpen, "Leather Bound Menu Cover", "Debossed Foil on Leather",
          <div className="w-full h-72 rounded-xl bg-gradient-to-br from-[#241a13] via-[#33241b] to-[#1a120c] border border-[#4a3525] flex flex-col items-center justify-center p-6 shadow-xl relative overflow-hidden">
            <div className="w-[85%] h-[85%] border-2 border-dashed border-[#634832] rounded-xl flex flex-col items-center justify-center p-6 bg-black/15 shadow-inner">
              <Svg id="mockupLeatherMenuLogo" className="w-44 h-28 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]" markup={svg} />
              <div className="w-16 h-0.5 bg-amber-500/40 my-2" />
              <div className="text-[10px] tracking-[0.25em] text-amber-200/80 uppercase font-semibold">Tasting Menu</div>
            </div>
          </div>)}
        {card(Coffee, "Ceramic Tableware & Paper Bag", "Cafe Packaging",
          <div className="w-full h-72 rounded-xl bg-[#f0eee9] border border-[#e5e2db] flex items-center justify-around p-6 shadow-inner">
            <div className="w-32 h-40 bg-white rounded-b-3xl rounded-t-lg shadow-lg border-t-4 border-[#e5e2db] flex flex-col items-center justify-center relative p-3">
              <div className="absolute -right-5 top-8 w-7 h-16 border-4 border-slate-200 rounded-r-2xl" />
              <Svg id="mockupCupLogo" className="w-20 h-16 flex items-center justify-center filter invert" markup={svg} />
            </div>
            <div className="w-40 h-48 bg-[#c49a6c] rounded-md shadow-lg flex flex-col items-center justify-center p-4 border border-[#aa8254] relative">
              <div className="absolute top-2 w-12 h-3 border-2 border-[#815f3a] rounded-full" />
              <Svg id="mockupBagLogo" className="w-24 h-20 flex items-center justify-center" markup={svg} />
              <span className="text-[9px] text-[#553c22] font-mono mt-1 font-semibold">100% RECYCLED KRAFT</span>
            </div>
          </div>)}
        {card(CreditCard, "Executive Cardstock", "Cotton Paper",
          <div className="w-full h-72 rounded-xl mock-photo border border-[#e0ddd5] flex items-center justify-center p-6 shadow-inner"
            style={{ background: "linear-gradient(rgba(255,255,255,.25),rgba(255,255,255,.25)),url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=70&auto=format&fit=crop)" }}>
            <div className="w-80 h-48 bg-[#1f1d1b] border border-[#3d3a36] rounded-xl p-5 shadow-2xl flex flex-col justify-between transform rotate-[-2deg] hover:rotate-0 transition duration-300">
              <div className="flex justify-between items-start">
                <Svg id="mockupCardLogo" className="w-28 h-16 flex items-center justify-start" markup={svg} />
                <div className="text-right">
                  <div className="text-xs font-bold text-white">General Manager</div>
                  <div className="text-[10px] text-amber-400">Executive Chef</div>
                </div>
              </div>
              <div className="border-t border-[#3d3a36] pt-2 flex justify-between items-end text-[10px] text-[#a8a29e]">
                <div><div>reservations@gourmet.com</div><div>+1 (555) 234-8900</div></div>
                <div className="font-mono text-amber-400/80">www.gourmet.com</div>
              </div>
            </div>
          </div>)}
      </CentreFocus>

      {/* DOWNLOADS: always the last thing on the last page */}
      <section id="dlSection" className="dl-section">
        <h2 className="display">Download your files</h2>
        <p>Everything you made, ready to print, post or send to your printer.</p>
        <div className="dl-grid">
          <DownloadItem Icon={Image} title="Logo (PNG)" sub="2048 × 2048, for print & social" onClick={() => downloadSVGasPNG(svg, `${base}_${logo.type}.png`)} />
          <DownloadItem Icon={PenTool} title="Logo (SVG)" sub="Sharp at any size, for sign makers" onClick={() => downloadSVG(svg, `${base}_${logo.type}.svg`)} />
          <DownloadItem id="dlMenuPng" Icon={LayoutList} title="Menu board (PNG)" sub="For WhatsApp, Instagram or a screen" onClick={() => setExporting(true)} hidden={!hasMenu} />
          <DownloadItem id="dlMenuCsv" Icon={FileSpreadsheet} title="Dish list (CSV)" sub="Open in Excel or your billing system" onClick={exportMenuCSV} hidden={!hasMenu} />
          <DownloadItem id="dlMenuQr" Icon={QrCode} title="Phone menu QR" sub="Customers scan and order" onClick={() => s.openModal("qr")} hidden={!hasMenu} />
          <DownloadItem id="dlLocQr" Icon={MapPin} title="Location QR" sub="Scan to find your shop" onClick={downloadLocQrPNG} hidden={!hasLocQr} />
        </div>
      </section>

      {exporting && (
        <div id="tab-menu" style={{ position: "absolute", left: -12000, top: 0, width: 1200 }} aria-hidden="true">
          <div className="w-full max-w-4xl"><MenuBoard /></div>
        </div>
      )}
    </div>
  );
}
