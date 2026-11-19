import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { BASE_LOGOS } from "../../shared/logos.js";
import { presetSVG, stripNum, VARIANTS_PER_STYLE } from "../../shared/brand.js";
import { Eyebrow } from "./WizardFooter.jsx";
import { StackCards } from "./ui.jsx";

// STYLE PICKER: a sample of the 7 styles. Clicking one creates 5 logos in that style.
export default function TabStyles() {
  const def = STEP_DEFS.styles;
  const selected = useStudio(s => s.selectedStyles);
  const pickStyle = useStudio(s => s.pickStyle);
  return (
    <div id="tab-styles" className="animate-fade-in">
      <div className="page-head">
        <Eyebrow />
        <h1 id="styTitle" className="display page-title">{def.title}</h1>
        <p id="stySubtitle" className="q-sub">{def.sub}</p>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p id="styCount" className="text-sm font-semibold text-[#44403c]">Click a style to create {VARIANTS_PER_STYLE} logos with your name in it.</p>
        </div>
        <StackCards id="stylesGrid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" count={BASE_LOGOS.length}
          renderCard={(i, { style, tabIndex, ariaHidden }) => {
            const t = BASE_LOGOS[i];
            const on = selected.includes(i);
            return (
              <button key={i} type="button" onClick={() => pickStyle(i)} className={"style-card" + (on ? " selected" : "")} aria-pressed={on}
                style={style} tabIndex={tabIndex} aria-hidden={ariaHidden}>
                <div className="style-card-art" dangerouslySetInnerHTML={{ __html: presetSVG(i) }} />
                <div><span className="style-card-title">{stripNum(t.title)}</span><span className="style-card-sub">{t.style}</span></div>
                <span className="style-card-check" aria-hidden="true">{on ? "✓" : ""}</span>
              </button>
            );
          }} />
      </div>
    </div>
  );
}
