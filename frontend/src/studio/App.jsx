import { useEffect, useState } from "react";
import { useStudio } from "./store.js";
import { STEP_DEFS, wizFlow } from "./steps.js";
import { selectedLogoInfo } from "../shared/brand.js";
import { Svg } from "./components/ui.jsx";
import WizardFooter from "./components/WizardFooter.jsx";
import TabLogos from "./components/TabLogos.jsx";
import TabGoals from "./components/TabGoals.jsx";
import TabDesign from "./components/TabDesign.jsx";
import TabMyLogo from "./components/TabMyLogo.jsx";
import TabMenuAsk from "./components/TabMenuAsk.jsx";
import TabMenu from "./components/TabMenu.jsx";
import TabDownload from "./components/TabDownload.jsx";
import { RawTextModal, ItemEditorModal, QrMenuModal } from "./components/Modals.jsx";
import { AuthModal, AccountButton } from "./components/Account.jsx";
import { useMenuFileDrop } from "./components/menuFiles.js";

// THEME: light by default, sun/moon button in the top bar switches it (remembered on this device)
function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("gs-theme-v2", next); } catch (e) { /* private mode */ }
    setTheme(next);
  };
  return (
    <button type="button" id="themeToggle" className="theme-toggle" onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Switch theme">
      <svg className="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    </button>
  );
}

function AppBar() {
  const s = useStudio();
  const def = STEP_DEFS[s.step];
  const flow = wizFlow(s);
  const n = flow.indexOf(s.step) + 1;
  const logo = selectedLogoInfo(s.selectedLogo, s.myLogo);
  return (
    <header id="appBar" className="app-bar">
      <div className="app-bar-inner">
        <div className="brandmark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M7 3v4M11 3v4" />
            <path d="M17 21V12c-2.5-1.2-3.5-4-3-7 3 .5 4.5 3 4.5 6 0 .6 0 1-.1 1.5" />
          </svg>
          Gourmet Studio
        </div>
        <div id="wizardStepper" className="stepper" aria-label="Progress">
          <div id="wizProgSegs" className="segs">
            {flow.map((_, i) => <i key={i} className={i < n - 1 ? "done" : i === n - 1 ? "cur" : ""} />)}
          </div>
          <div className="stepper-meta"><span id="wizProgLabel">Step {n} of {flow.length}</span><i className="sep" /><span id="wizProgPhase">{def.phase}</span></div>
        </div>
        <div className="active-brand">
          <AccountButton />
          <ThemeToggle />
          <Svg id="activeLogoMiniPreview" className="ab-mini" markup={logo.generate(s.brand)} />
          <div className="ab-text"><span className="ab-label">Your brand</span><span id="activeBrandNameDisplay" className="ab-name">{s.brand.name}</span></div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const step = useStudio(s => s.step);
  const modal = useStudio(s => s.modal);
  const def = STEP_DEFS[step];
  const inlineFooter = def.panel === "q" || def.panel === "goals" || (def.panel === "mylogo" && (def.sub2 === "upload" || def.sub2 === "reference")) || (def.panel === "menuask" && def.sub2 === "upload");

  useMenuFileDrop();                                  // drop a menu file anywhere on the page
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  return (
    <>
      <AppBar />
      <main className="app-main">
        {(def.panel === "q" || def.panel === "logos") && <TabLogos />}
        {def.panel === "goals" && <TabGoals />}
        {def.panel === "design" && <TabDesign />}
        {def.panel === "mylogo" && <TabMyLogo />}
        {def.panel === "menuask" && <TabMenuAsk />}
        {def.panel === "menu" && <TabMenu />}
        {def.panel === "download" && <TabDownload />}
      </main>
      {/* On short question screens the Back / Next buttons sit right under the input (rendered by the tab);
          on the big work screens they stay in the sticky bottom bar. */}
      {!inlineFooter && <WizardFooter />}

      {modal === "rawText" && <RawTextModal />}
      {modal === "editor" && <ItemEditorModal />}
      {modal === "qr" && <QrMenuModal />}
      {modal === "auth" && <AuthModal />}
    </>
  );
}
