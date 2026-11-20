import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import GoalPicker from "./GoalPicker.jsx";
import Showcase from "./Showcase.jsx";

// FIRST SCREEN: what do you want to create? The wizard only asks for what is picked here.
export default function TabGoals() {
  const def = STEP_DEFS[useStudio(s => s.step)];
  return (
    <div id="tab-goals" className="animate-fade-in wiz-single">
      <div className="studio-card q-shell">
        <div className="q-head">
          <div>
            <Eyebrow />
            <h1 className="display q-title">{def.title}</h1>
            <p className="q-sub">{def.sub}</p>
          </div>
        </div>
        <GoalPicker big />
        <WizardFooter inline />
        <Showcase />
      </div>
    </div>
  );
}
