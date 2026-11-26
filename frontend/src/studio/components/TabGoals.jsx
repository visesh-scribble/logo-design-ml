import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import GoalPicker from "./GoalPicker.jsx";
import Showcase from "./Showcase.jsx";
import { useMediaQuery } from "./ui.jsx";

// FIRST SCREEN: what do you want to create? The wizard only asks for what is picked here.
export default function TabGoals() {
  const def = STEP_DEFS[useStudio(s => s.step)];
  const phone = useMediaQuery("(max-width: 640px)");

  const head = (
    <div className="q-head">
      <div>
        <Eyebrow />
        <h1 className="display q-title">{def.title}</h1>
        <p className="q-sub">{def.sub}</p>
      </div>
    </div>
  );

  if (phone) return <PhoneSlides head={head} />;

  return (
    <div id="tab-goals" className="animate-fade-in wiz-single">
      <div className="studio-card q-shell">
        {head}
        <GoalPicker big />
        <WizardFooter inline />
        <Showcase />
      </div>
    </div>
  );
}

// Phones: one screen per slide, swiped sideways: [question] [logo samples] [menu card samples] [online menu samples]
function PhoneSlides({ head }) {
  const goals = useStudio(s => s.goals);
  const sliderRef = useRef(null);
  const [count, setCount] = useState(1);
  const [active, setActive] = useState(0);

  // The slider fills the screen below the top bar, so the page itself never scrolls up and down
  useLayoutEffect(() => {
    const el = sliderRef.current;
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.height = Math.max(420, window.innerHeight - top - 40) + "px";   // 40px left for the dots
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Number of slides changes when goals are picked or unpicked
  useEffect(() => {
    const el = sliderRef.current;
    const n = el.children.length;
    setCount(n);
    if (active > n - 1) setActive(n - 1);
  }, [goals, active]);

  const onScroll = () => {
    const el = sliderRef.current;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = i => {
    const el = sliderRef.current;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div id="tab-goals" className="animate-fade-in wiz-single gs">
      <div className="gs-slider" ref={sliderRef} onScroll={onScroll} aria-roledescription="carousel">
        <section className="gs-slide gs-q" aria-label="Step 1">
          <div className="studio-card q-shell">
            {head}
            <GoalPicker big />
            <WizardFooter inline />
            {count > 1 && <button type="button" className="gs-hint" onClick={() => goTo(1)}>Swipe to see samples →</button>}
          </div>
        </section>
        <Showcase slides />
      </div>
      {count > 1 && (
        <div className="gs-dots" role="tablist" aria-label="Slides">
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={i === 0 ? "Choose what to create" : "Sample " + i}
              className={i === active ? "on" : ""} onClick={() => goTo(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
