import { useStudio } from "../store.js";
import { STEP_DEFS, wizFlow, CHOICE_STEPS, nextLabel } from "../steps.js";

export default function WizardFooter({ inline }) {
  const s = useStudio();
  const def = STEP_DEFS[s.step];
  const n = wizFlow(s).indexOf(s.step) + 1;
  return (
    <footer id="wizardFooter" className={"app-foot" + (inline ? " inline" : "")}>
      <div className="app-foot-inner">
        <button id="wizBack" onClick={s.prevStep} className="btn-text" style={{ visibility: n === 1 ? "hidden" : "visible" }}>&larr; Back</button>
        <p id="wizError" className="foot-msg" role="alert">{s.error}</p>
        <span id="wizStepLabel" style={{ display: "none" }} />
        <div className="foot-actions">
          <button id="wizSkip" onClick={s.skipStep} className={"btn-text" + (def.optional ? "" : " hidden")}>Skip</button>
          <button id="wizNext" onClick={s.nextStep} className={"btn-next" + (CHOICE_STEPS.includes(s.step) ? " hidden" : "")}>{nextLabel(s.step, s)}</button>
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
