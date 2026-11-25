import { Palette, Shapes, PenLine } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { BASE_LOGOS } from "../../shared/logos.js";
import { PALETTES, presetSVG, stripNum, interpretStyleWords } from "../../shared/brand.js";
import { Eyebrow } from "./WizardFooter.jsx";
import { UnderstoodChips } from "./TabMyLogo.jsx";

// "CHOOSE YOUR LOOK": colour theme + sample logo styles + describe your own style, on one screen.
// Without a logo goal it is only the colour theme (used on the menu).
export default function TabDesign() {
  const s = useStudio();
  const def = STEP_DEFS.design;
  const logo = s.goals.logo;
  const ref = s.hasLogo === "reference" ? s.reference : null;
  const b = s.brand;
  const same = (p, bg) => p.toLowerCase() === String(b.primaryColor).toLowerCase() && bg.toLowerCase() === String(b.bgColor).toLowerCase();
  // A style the typed words point to (shown as a hint until a card is clicked)
  const words = interpretStyleWords((ref ? ref.notes + " " : "") + s.styleText);
  const shownStyle = s.styleManual ? s.selectedStyles[0] : (words.style ?? s.selectedStyles[0]);

  const swatch = (key, primary, bg, accent, title) => (
    <button key={key} type="button" className={"pal" + (same(primary, bg) ? " on" : "")} title={title} aria-pressed={same(primary, bg)}
      onClick={() => s.setPalette(primary, bg, accent)}>
      <span className="pal-sw" style={{ background: primary }} />
      <span className="pal-name">{title}</span>
    </button>
  );

  return (
    <div id="tab-design" className="animate-fade-in">
      <div className="page-head">
        <Eyebrow />
        <h1 className="display page-title">{logo ? def.title : "Pick your colour theme"}</h1>
        <p className="q-sub">{logo ? def.sub : "These colours are used on your menu."}</p>
      </div>

      <section className="dz-sec" aria-labelledby="dzColours">
        <div className="dz-head"><span className="dz-ico"><Palette /></span><h2 id="dzColours">Colour theme</h2></div>
        <div className="pal-grid">
          {ref && ref.palette && swatch("ref", ref.palette.primary, ref.palette.bg, ref.palette.accent, "From your reference")}
          {PALETTES.map(([p, bg, a, t]) => swatch(p, p, bg, a, t))}
          <label className="pal pal-custom" title="Pick your own main colour">
            <input type="color" value={b.primaryColor} onChange={e => s.setCustomColor(e.target.value)} aria-label="Your own main colour" />
            <span className="pal-name">Your own colour</span>
          </label>
        </div>
      </section>

      {logo && (
        <section className="dz-sec" aria-labelledby="dzStyles">
          <div className="dz-head"><span className="dz-ico"><Shapes /></span><h2 id="dzStyles">Logo style</h2>
            <span className="dz-note">Pick one, or describe it below</span></div>
          <div className="dz-styles" role="radiogroup" aria-labelledby="dzStyles">
            {BASE_LOGOS.map((t, i) => {
              const on = shownStyle === i;
              return (
                <button key={i} type="button" role="radio" aria-checked={on ? "true" : "false"} onClick={() => s.pickStyle(i)}
                  className={"style-card" + (on ? " selected" : "")}>
                  <div className="style-card-art" dangerouslySetInnerHTML={{ __html: presetSVG(i, b) }} />
                  <div><span className="style-card-title">{stripNum(t.title)}</span><span className="style-card-sub">{t.style}</span></div>
                  <span className="style-card-check" aria-hidden="true">{on ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {logo && (
        <section className="dz-sec" aria-labelledby="dzOwn">
          <div className="dz-head"><span className="dz-ico"><PenLine /></span><h2 id="dzOwn">Describe your own style</h2>
            <span className="dz-note">Optional</span></div>
          <textarea id="styleText" rows={3} className="ms-field" value={s.styleText} onChange={e => s.setStyleText(e.target.value)}
            placeholder="e.g. Round badge, gold on black, chef hat, elegant script" aria-labelledby="dzOwn" />
          <UnderstoodChips text={(ref ? ref.notes + " " : "") + s.styleText} palette={ref && ref.palette} />
        </section>
      )}
    </div>
  );
}
