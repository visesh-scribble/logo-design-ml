import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { ICONS, BASE_LOGOS } from "../../shared/logos.js";
import {
  CUISINES, CUISINE_PHOTOS, unsplash, PALETTES, ICON_OPTIONS,
  VARIANTS_PER_STYLE, VARIANT_NAMES, variantSVG, stripNum
} from "../../shared/brand.js";
import { downloadSVG, downloadSVGasPNG, fileBase } from "../../shared/files.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import { Coverflow } from "./ui.jsx";

const INPUT = "w-full bg-[#fbfaf7] border border-[#d6d3cb] focus:border-[#c2410c] focus:bg-white focus:ring-1 focus:ring-[#c2410c] text-[#1c1917] rounded-xl px-3.5 py-2 text-sm transition";

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

function CuisineQuestion() {
  const s = useStudio();
  const customRef = useRef(null);
  useEffect(() => { if (s.cuisineSelect === "other" && s.cuisinePicked) customRef.current?.focus(); }, [s.cuisineSelect, s.cuisinePicked]);
  return (
    <div id="wiz-q-4" className="wiz-q">
      <div id="cuisineGrid" className="cuisine-grid" role="radiogroup">
        {CUISINES.map(([v, label, icon]) => {
          const on = s.cuisinePicked && v === s.cuisineSelect;
          return (
            <button key={v} type="button" className={"cuisine-tile" + (on ? " sel" : "")} role="radio" aria-checked={on ? "true" : "false"}
              data-cuisine={v} onClick={() => s.pickCuisine(v)}>
              <span className="cuisine-photo" style={{ backgroundImage: `url(${unsplash(CUISINE_PHOTOS[v], 400)})` }}>
                <span className="cuisine-ico"><svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[icon] }} /></span>
              </span>
              <span className="cuisine-label">{label}</span>
            </button>
          );
        })}
        {s.cuisinePicked && s.cuisineSelect === "other" && (
          <div id="customCuisineWrap" style={{ gridColumn: "1/-1" }}>
            <label htmlFor="inputCustomCuisine" className="block text-xs font-bold text-[#44403c] mb-1.5">Your food style</label>
            <input ref={customRef} type="text" id="inputCustomCuisine" maxLength={60} placeholder="e.g. South Indian tiffin, Korean BBQ, Kerala seafood"
              className={INPUT} value={s.customCuisineInput} onChange={e => s.setCustomCuisine(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

function ColourQuestion() {
  const brand = useStudio(s => s.brand);
  const setPalette = useStudio(s => s.setPalette);
  const setCustomColor = useStudio(s => s.setCustomColor);
  return (
    <div id="wiz-q-5" className="wiz-q">
      <span className="block text-xs font-bold text-[#44403c] mb-1.5">Color Palette</span>
      <div className="flex items-center space-x-2">
        {PALETTES.map(([p, b, a, title]) => (
          <button key={p} onClick={() => setPalette(p, b, a)} title={title}
            className={"w-7 h-7 rounded-full border-2 border-[#d6d3cb] hover:border-[#1c1917] flex items-center justify-center overflow-hidden transition" + (p.toLowerCase() === String(brand.primaryColor).toLowerCase() ? " sel" : "")}
            style={{ background: `linear-gradient(90deg,${b} 50%,${p} 50%)` }} />
        ))}
        <div className="flex items-center space-x-1.5 ml-2">
          <input type="color" id="inputCustomColor" value={brand.primaryColor} onChange={e => setCustomColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" title="Custom Hex Color" />
          <span className="text-[11px] text-[#78716c]">Custom</span>
        </div>
      </div>
    </div>
  );
}

function SymbolQuestion() {
  const icon = useStudio(s => s.brand.icon);
  const setIcon = useStudio(s => s.setIcon);
  return (
    <div id="wiz-q-6" className="wiz-q">
      <span className="block text-xs font-bold text-[#44403c] mb-1.5">Culinary Symbol</span>
      <select id="selectIcon" value={icon} onChange={e => setIcon(e.target.value)}
        className="w-full bg-[#fbfaf7] border border-[#d6d3cb] text-[#1c1917] rounded-xl px-3 py-1.5 text-xs">
        {ICON_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
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

        <div className={"wiz-qwrap" + (isQ ? "" : " hidden")}>
          {isQ && def.q <= 3 && <BrandQuestion q={def.q} />}
        </div>
        <div className={"wiz-qwrap" + (isQ ? "" : " hidden")}>
          {def.q === 4 && <CuisineQuestion />}
          {def.q === 5 && <ColourQuestion />}
          {def.q === 6 && <SymbolQuestion />}
        </div>
        <p id="wizHint" className="wiz-hint" style={{ display: isQ && def.q <= 3 ? "" : "none" }}>Press <kbd>Enter</kbd> to continue</p>
        {isQ && <WizardFooter inline />}
      </div>

      {def.panel === "logos" && <LogoVariations />}
    </div>
  );
}
