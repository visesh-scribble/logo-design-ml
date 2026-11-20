import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { BASE_LOGOS } from "../../shared/logos.js";
import { VARIANTS_PER_STYLE, VARIANT_NAMES, variantSVG, stripNum, selectedLogoInfo } from "../../shared/brand.js";
import { downloadSVG, downloadSVGasPNG, fileBase } from "../../shared/files.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import { Coverflow, Svg } from "./ui.jsx";
import Showcase from "./Showcase.jsx";

const INPUT = "w-full bg-[#fbfaf7] border border-[#d6d3cb] focus:border-[#c2410c] focus:bg-white focus:ring-1 focus:ring-[#c2410c] text-[#1c1917] rounded-xl px-3.5 py-2 text-sm transition";

// Tagline step (after the logo): the chosen logo, live, so the tagline shows up on it as they type
function LogoPreview() {
  const s = useStudio();
  const logo = selectedLogoInfo(s.selectedLogo, s.myLogo);
  return (
    <figure className="q-preview" aria-label="Your logo with the tagline">
      <Svg className="q-preview-logo" markup={logo.generate(s.brand)} />
      <figcaption>Your logo · updates as you type</figcaption>
    </figure>
  );
}

function BrandQuestion({ q }) {
  const inputs = useStudio(s => s.inputs);
  const setInput = useStudio(s => s.setInput);
  const fields = {
    1: ["name", "inputBrandName", "Restaurant or Brand Name", "e.g. Bella Roma, Fire & Oak", " font-semibold"],
    2: ["tagline", "inputTagline", "Tagline or Motto", "e.g. Wood-Fired & Handcrafted", ""],
    3: ["estYear", "inputEstYear", "Established or Heritage Badge", "e.g. EST. 2024, Made with Love", ""]
  };
  const [field, id, label, placeholder, extra] = fields[q];
  return (
    <div id={"wiz-q-" + q} className="wiz-q">
      <label className="block text-xs font-bold text-[#44403c] mb-1.5" htmlFor={id}>{label}</label>
      <input type="text" id={id} value={inputs[field]} placeholder={placeholder} className={INPUT + extra}
        onChange={e => setInput(field, e.target.value)} />
    </div>
  );
}

// "Choose your logo": 5 variations of the picked style in a 3D coverflow
function LogoVariations() {
  const s = useStudio();
  const ch = s.selectedLogo.kind === "variant" ? s.selectedLogo : null;
  return (
    <div id="wiz-step-7" className="wiz-panel space-y-6">
      <div id="logosContainer">
        {s.selectedStyles.map(b => {
          const base = BASE_LOGOS[b];
          const isSel = v => !!ch && ch.b === b && ch.v === v && ch.seed === s.variantSeed;
          const selIdx = Array.from({ length: VARIANTS_PER_STYLE }, (_, v) => v).find(isSel);
          const svgOf = v => variantSVG(b, v, s.variantSeed, s.brand);
          const name = v => `${fileBase(s.brand.name)}_${base.type}_v${v + 1}`;
          return (
            <section key={b} className="v-section">
              <div className="v-head"><h3>{stripNum(base.title)}</h3><span>{base.style}</span></div>
              {/* Coverflow per style; open on the chosen logo if there is one */}
              <Coverflow key={s.variantSeed} count={VARIANTS_PER_STYLE} start={selIdx ?? 0} className="v-grid"
                renderCard={(v, { style, front, onClickCapture }) => {
                  const sel = isSel(v);
                  return (
                    <div key={v} className={"v-card" + (sel ? " selected" : "") + (front ? " cf-front" : "")} style={style}
                      aria-hidden={front ? "false" : "true"} onClickCapture={onClickCapture}>
                      <button type="button" className="v-art" onClick={() => s.chooseVariant(b, v)} aria-label={`Choose ${base.title} variation ${v + 1}`}
                        dangerouslySetInnerHTML={{ __html: svgOf(v) }} />
                      <div className="v-row"><b>{VARIANT_NAMES[v]}</b></div>
                      <div className="v-row">
                        <button type="button" className="v-pick" onClick={() => s.chooseVariant(b, v)}>{sel ? "Chosen" : "Choose"}</button>
                        <div className="v-dl" style={{ flex: 1 }}>
                          <button type="button" onClick={() => downloadSVG(svgOf(v), name(v) + ".svg")} title="Download SVG">SVG</button>
                          <button type="button" onClick={() => downloadSVGasPNG(svgOf(v), name(v) + ".png")} title="Download PNG">PNG</button>
                        </div>
                      </div>
                    </div>
                  );
                }} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function TabLogos() {
  const step = useStudio(s => s.step);
  const nextStep = useStudio(s => s.nextStep);
  const newVariations = useStudio(s => s.newVariations);
  const def = STEP_DEFS[step];
  const isQ = def.panel === "q";
  const goals = useStudio(s => s.goals);
  const showPreview = isQ && def.q === 2 && goals.logo;
  const qRef = useRef(null);

  // Focus the question's input when the step changes
  useEffect(() => {
    if (!isQ) return;
    const t = setTimeout(() => {
      const first = qRef.current?.querySelector(`#wiz-q-${def.q} input, #wiz-q-${def.q} select`);
      if (first) first.focus({ preventScroll: true });
    }, 30);
    return () => clearTimeout(t);
  }, [step, isQ, def.q]);

  // Enter key submits the current question
  const onKeyDown = e => {
    if (e.key === "Enter" && isQ && e.target.tagName === "INPUT" && e.target.type !== "color") { e.preventDefault(); nextStep(); }
  };

  return (
    <div id="tab-logos" className={"animate-fade-in space-y-6" + (isQ ? " wiz-single" : "")}>
      <div className="studio-card q-shell" ref={qRef} onKeyDown={onKeyDown}>
        <div className="q-head">
          <div>
            <Eyebrow />
            <h1 className="display q-title"><span id="wizTitle">{def.title}</span></h1>
            <p className="q-sub"><span id="wizSubtitle">{def.sub}</span></p>
          </div>
          <div id="wizHeaderBtns" className={def.panel === "logos" ? "flex items-center space-x-2.5" : "items-center space-x-2.5 hidden"}>
            <button onClick={newVariations} className="ui-btn ui-btn-primary">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New variations</span>
            </button>
          </div>
        </div>

        <div className={"wiz-qwrap" + (isQ ? "" : " hidden") + (showPreview ? " q-split" : "")}>
          {showPreview && <LogoPreview />}
          <div>
            {isQ && <BrandQuestion q={def.q} />}
            <p id="wizHint" className="wiz-hint" style={{ display: isQ ? "" : "none" }}>Press <kbd>Enter</kbd> to continue</p>
          </div>
        </div>
        {isQ && <WizardFooter inline />}
        {isQ && def.q === 1 && <Showcase />}
      </div>

      {def.panel === "logos" && <LogoVariations />}
    </div>
  );
}
