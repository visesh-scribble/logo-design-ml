import { PenTool, BookOpen, Smartphone, ShoppingBag, Check } from "lucide-react";
import { useStudio } from "../store.js";

// "What do you want to create?" — multi-select. The wizard only shows the steps for what is picked.
export const GOAL_OPTIONS = [
  ["logo", "Logo", "Design or upload", PenTool],
  ["menucard", "Menu card", "Print & TV", BookOpen],
  ["onlinemenu", "Online Menu", "QR menu on phones", Smartphone],
  ["onlineorder", "Online Order", "Order from the table", ShoppingBag]
];

export default function GoalPicker({ big = false }) {
  const goals = useStudio(s => s.goals);
  const toggleGoal = useStudio(s => s.toggleGoal);
  return (
    <div className={"goal-pick" + (big ? " goal-pick-big" : "")}>
      <p className={"goal-pick-q" + (big ? " sr-only" : "")} id="goalPickLabel">What do you want to create? <span>Pick one or more</span></p>
      <div className="goal-grid" role="group" aria-labelledby="goalPickLabel">
        {GOAL_OPTIONS.map(([key, label, sub, Icon]) => {
          const on = !!goals[key];
          return (
            <button key={key} type="button" id={"goal-" + key} role="checkbox" aria-checked={on ? "true" : "false"}
              className={"goal-chip" + (on ? " on" : "")} onClick={() => toggleGoal(key)}>
              <span className="goal-ico"><Icon aria-hidden="true" /></span>
              <span className="goal-txt"><b>{label}</b><small>{sub}</small></span>
              <span className="goal-check" aria-hidden="true">{on && <Check />}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
