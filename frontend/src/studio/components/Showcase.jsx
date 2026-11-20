import { useMemo } from "react";
import { useStudio } from "../store.js";
import { variantSVG, CUISINE_PHOTOS, unsplash } from "../../shared/brand.js";
import { Svg } from "./ui.jsx";

// "What you'll create": live samples of a logo, a printed menu card and the phone menu,
// shown under the first brand questions. They use the name being typed, so they update as you go.

const DEMO_COLOURS = { primaryColor: "#C6A15B", bgColor: "#1F4D3A", accentColor: "#FBF9F4" };

const MENU = [
  ["Starters", [["Bruschetta al Pomodoro", "240", true], ["Arancini di Riso", "280", true], ["Calamari Fritti", "360", false]]],
  ["Mains", [["Margherita Napoletana", "420", true], ["Tagliatelle al Ragù", "480", false], ["Risotto ai Funghi", "450", true]]]
];

const PHONE_DISHES = [
  ["Margherita Napoletana", "Tomato, fior di latte, basil", "420", true],
  ["Tagliatelle al Ragù", "Slow-cooked beef, parmesan", "480", false],
  ["Tiramisù della Casa", "Mascarpone, espresso, cocoa", "260", true]
];

const Dot = ({ veg }) => <i className={"sc-dot " + (veg ? "veg" : "nonveg")} aria-hidden="true" />;

export default function Showcase() {
  const goals = useStudio(s => s.goals);
  const name = useStudio(s => s.inputs.name);
  const tagline = useStudio(s => s.inputs.tagline);
  const brandName = (name || "").trim() || "Bella Roma";
  const brandTag = (tagline || "").trim() || "Cucina Tradizionale";

  const logos = useMemo(() => {
    const brand = { ...DEMO_COLOURS, name: brandName, tagline: brandTag, estYear: "EST. 2024", cuisine: "italian", icon: "leaf" };
    return { main: variantSVG(4, 0, 0, brand), alt1: variantSVG(1, 1, 0, brand), alt2: variantSVG(2, 3, 0, brand) };
  }, [brandName, brandTag]);

  const showPhone = goals.onlinemenu || goals.onlineorder;
  const ordering = !!goals.onlineorder;
  if (!goals.logo && !goals.menucard && !showPhone) return null;
  let i = 0;                                      // stagger index for the cards that are shown

  return (
    <section className="sc" aria-labelledby="scTitle">
      <p id="scTitle" className="sc-eyebrow">What you'll create</p>
      <p className="sc-lead">A complete brand kit for your restaurant, ready in minutes.</p>

      <div className="sc-grid">
        {/* 1. Logo */}
        {goals.logo && <figure className="sc-card" style={{ "--i": i++ }}>
          <div className="sc-art sc-logos">
            <Svg className="sc-logo sc-logo-alt1" markup={logos.alt1} />
            <Svg className="sc-logo sc-logo-alt2" markup={logos.alt2} />
            <Svg className="sc-logo sc-logo-main" markup={logos.main} />
          </div>
          <figcaption className="sc-cap"><b>Logo</b><span>7 styles · PNG + SVG</span></figcaption>
        </figure>}

        {/* 2. Printed menu card */}
        {goals.menucard && <figure className="sc-card" style={{ "--i": i++ }}>
          <div className="sc-art sc-menu-wrap">
            <div className="sc-menu">
              <Svg className="sc-menu-logo" markup={logos.main} />
              <div className="sc-menu-name">{brandName}</div>
              <div className="sc-menu-tag">{brandTag}</div>
              {MENU.map(([sec, dishes]) => (
                <div key={sec} className="sc-menu-sec">
                  <div className="sc-menu-h">{sec}</div>
                  {dishes.map(([d, p, veg]) => (
                    <div key={d} className="sc-menu-row"><Dot veg={veg} /><span>{d}</span><i className="sc-lead-dots" /><b>₹{p}</b></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <figcaption className="sc-cap"><b>Menu card</b><span>Print, PDF &amp; TV screens</span></figcaption>
        </figure>}

        {/* 3. Online phone menu (with cart + "Add" buttons when ordering is picked) */}
        {showPhone && <figure className="sc-card" style={{ "--i": i++ }}>
          <div className="sc-art sc-phone-wrap">
            <div className="sc-phone">
              <div className="sc-phone-hero" style={{ backgroundImage: `url(${unsplash(CUISINE_PHOTOS.italian, 360)})` }}>
                <span className="sc-phone-name">{brandName}</span>
              </div>
              <div className="sc-phone-chips"><span className="on">Pizza</span><span>Pasta</span><span>Dolci</span></div>
              {PHONE_DISHES.map(([d, desc, p, veg]) => (
                <div key={d} className="sc-phone-row">
                  <div><b><Dot veg={veg} />{d}</b><small>{desc}</small><em>₹{p}</em></div>
                  {ordering && <span className="sc-add">+ Add</span>}
                </div>
              ))}
              {ordering && <div className="sc-phone-cart">View cart · 2 items</div>}
            </div>
          </div>
          <figcaption className="sc-cap">
            <b>{ordering ? "Online menu + ordering" : "Online menu"}</b>
            <span>{ordering ? "Customers scan a QR & order" : "Customers scan a QR to view"}</span>
          </figcaption>
        </figure>}
      </div>
    </section>
  );
}
