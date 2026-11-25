import { useEffect, useRef } from "react";
import { useStudio } from "../store.js";
import { STEP_DEFS, wizFlow, CHOICE_STEPS, nextLabel } from "../steps.js";

export default function WizardFooter({ inline }) {
  const s = useStudio();
  const def = STEP_DEFS[s.step];
  const n = wizFlow(s).indexOf(s.step) + 1;
  const ref = useRef(null);
  // The sticky footer's real height (it changes with screen size and error messages);
  // the menu editor's tool dock sits right on top of it.
  useEffect(() => {
    if (inline || !ref.current) return;
    const el = ref.current;
    const set = () => document.documentElement.style.setProperty("--foot-h", el.offsetHeight + "px");
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [inline]);
  return (
    <footer id="wizardFooter" ref={ref} className={"app-foot" + (inline ? " inline" : "")}>
      <div className="app-foot-inner">
        <button id="wizBack" onClick={s.prevStep} className="btn-text" style={{ visibility: n === 1 ? "hidden" : "visible" }}>&larr; Back</button>
        <p id="wizError" className="foot-msg" role="alert">{s.error}</p>
        <span id="wizStepLabel" style={{ display: "none" }} />
        <div className="foot-actions">
          <button id="wizSkip" onClick={s.skipStep} className={"btn-text" + (def.optional ? "" : " hidden")}>Skip</button>
          <button id="wizNext" onClick={s.nextStep} className={"btn-next" + (CHOICE_STEPS.includes(s.step) || s.step === "download" ? " hidden" : "")}>{nextLabel(s.step, s)}</button>
        </div>
      </div>
    </footer>
  );
}

// "Brand · Step 3 of 10" line above every page title
export function Eyebrow() {
  const s = useStudio();
  const flow = wizFlow(s);
  const n = flow.indexOf(s.step) + 1;
  return <p className="eyebrow">{STEP_DEFS[s.step].phase + "  ·  Step " + n + " of " + flow.length}</p>;
}
