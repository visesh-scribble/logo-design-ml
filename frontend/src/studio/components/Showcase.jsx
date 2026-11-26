import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useStudio } from "../store.js";
import { variantSVG, CUISINE_PHOTOS, unsplash, VARIANT_NAMES, CUISINE_PRESETS, DEFAULT_LOGO } from "../../shared/brand.js";
import { REFERENCE_SAMPLES } from "../../shared/logos.js";
import { Svg, useFitZoom, BOARD_WIDTH } from "./ui.jsx";
import { MenuBoardPreview } from "./MenuBoard.jsx";
import { SAMPLES as MENU_SAMPLES } from "./TabMenuAsk.jsx";

// "What you'll create": live samples of a logo, a printed menu card and the phone menu,
// shown under the first brand questions. They use the name being typed, so they update as you go.
// Clicking a card opens a popup with reference samples for a few made-up restaurants,
// drawn with the same generators the studio uses.

// Demo restaurants for the reference samples. Colours follow the brand shape used by variantSVG:
// bgColor = main brand colour, primaryColor = highlight, accentColor = light text/paper.
const DEMO_BRANDS = [
  {
    key: "roma", name: "Bella Roma", tagline: "Cucina Tradizionale", cuisine: "italian", icon: "leaf",
    primaryColor: "#C6A15B", bgColor: "#1F4D3A", accentColor: "#FBF9F4",
    chips: ["Pizza", "Pasta", "Dolci"],
    menu: [
      ["Starters", [["Bruschetta al Pomodoro", "240", true], ["Arancini di Riso", "280", true], ["Calamari Fritti", "360", false]]],
      ["Mains", [["Margherita Napoletana", "420", true], ["Tagliatelle al Ragù", "480", false], ["Risotto ai Funghi", "450", true]]]
    ],
    dishes: [
      ["Margherita Napoletana", "Tomato, fior di latte, basil", "420", true],
      ["Tagliatelle al Ragù", "Slow-cooked beef, parmesan", "480", false],
      ["Tiramisù della Casa", "Mascarpone, espresso, cocoa", "260", true]
    ],
    logos: [[4, 0], [1, 1]]
  },
  {
    key: "masala", name: "Masala Darbar", tagline: "Royal Indian Kitchen", cuisine: "indian", icon: "flame",
    primaryColor: "#E8A33D", bgColor: "#6B1E2E", accentColor: "#FFF7E8",
    chips: ["Tandoor", "Curries", "Breads"],
    menu: [
      ["Starters", [["Paneer Tikka", "280", true], ["Murgh Malai Kebab", "340", false], ["Hara Bhara Kebab", "220", true]]],
      ["Mains", [["Dal Makhani", "260", true], ["Butter Chicken", "380", false], ["Lucknowi Biryani", "420", false]]]
    ],
    dishes: [
      ["Paneer Tikka", "Charred cottage cheese, mint chutney", "280", true],
      ["Butter Chicken", "Tandoori chicken, tomato makhani", "380", false],
      ["Garlic Naan", "Fresh from the tandoor", "70", true]
    ],
    logos: [[6, 0], [3, 3]]
  },
  {
    key: "brew", name: "Brew & Bloom", tagline: "Coffee · Bakes · Brunch", cuisine: "cafe", icon: "coffee",
    primaryColor: "#D9B88F", bgColor: "#4A3426", accentColor: "#FBF4EA",
    chips: ["Coffee", "Bakes", "Brunch"],
    menu: [
      ["Coffee", [["Flat White", "190", true], ["Cold Brew Tonic", "220", true], ["Hazelnut Latte", "240", true]]],
      ["Brunch", [["Avocado Toast", "320", true], ["Eggs Benedict", "360", false], ["Banana Pancakes", "280", true]]]
    ],
    dishes: [
      ["Flat White", "Double ristretto, silky milk", "190", true],
      ["Eggs Benedict", "Ham, poached eggs, hollandaise", "360", false],
      ["Almond Croissant", "Baked every morning", "160", true]
    ],
    logos: [[0, 0], [2, 4]]
  },
  {
    key: "smash", name: "Smash Co.", tagline: "Burgers & Shakes", cuisine: "burger", icon: "burger",
    primaryColor: "#E63B2E", bgColor: "#1C1C1C", accentColor: "#FFFFFF",
    chips: ["Burgers", "Sides", "Shakes"],
    menu: [
      ["Burgers", [["Classic Smash", "290", false], ["Double Cheese", "360", false], ["Crispy Paneer", "260", true]]],
      ["Sides & Shakes", [["Loaded Fries", "180", true], ["Chicken Wings", "240", false], ["Oreo Shake", "200", true]]]
    ],
    dishes: [
      ["Classic Smash", "Double patty, cheese, house sauce", "290", false],
      ["Crispy Paneer", "Spiced paneer, slaw, chipotle mayo", "260", true],
      ["Loaded Fries", "Cheese sauce, jalapeños", "180", true]
    ],
    logos: [[5, 0], [3, 2]]
  }
];

const BASE_STYLE_NAMES = ["Pictorial", "Lettermark", "Wordmark", "Combination", "Emblem", "Abstract", "Mascot"];
const ROMA = DEMO_BRANDS[0];

const Dot = ({ veg }) => <i className={"sc-dot " + (veg ? "veg" : "nonveg")} aria-hidden="true" />;

const logoBrand = (b) => ({
  name: b.name, tagline: b.tagline, estYear: "EST. 2024", cuisine: b.cuisine, icon: b.icon,
  primaryColor: b.primaryColor, bgColor: b.bgColor, accentColor: b.accentColor
});
// Colours the menu card / phone art use (CSS vars, fallbacks are Bella Roma's)
const artVars = (b) => ({ "--sc-ink": b.bgColor, "--sc-gold": b.primaryColor });

function MenuCardArt({ demo, name, tagline, logo }) {
  return (
    <div className="sc-art sc-menu-wrap" style={artVars(demo)}>
      <div className="sc-menu">
        <Svg className="sc-menu-logo" markup={logo} />
        <div className="sc-menu-name">{name}</div>
        <div className="sc-menu-tag">{tagline}</div>
        {demo.menu.map(([sec, dishes]) => (
          <div key={sec} className="sc-menu-sec">
            <div className="sc-menu-h">{sec}</div>
            {dishes.map(([d, p, veg]) => (
              <div key={d} className="sc-menu-row"><Dot veg={veg} /><span>{d}</span><i className="sc-lead-dots" /><b>₹{p}</b></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneArt({ demo, name, ordering }) {
  return (
    <div className="sc-art sc-phone-wrap" style={artVars(demo)}>
      <div className="sc-phone">
        <div className="sc-phone-hero" style={{ backgroundImage: `url(${unsplash(CUISINE_PHOTOS[demo.cuisine] || CUISINE_PHOTOS.other, 360)})` }}>
          <span className="sc-phone-name">{name}</span>
        </div>
        <div className="sc-phone-chips">{demo.chips.map((c, k) => <span key={c} className={k === 0 ? "on" : undefined}>{c}</span>)}</div>
        {demo.dishes.map(([d, desc, p, veg]) => (
          <div key={d} className="sc-phone-row">
            <div><b><Dot veg={veg} />{d}</b><small>{desc}</small><em>₹{p}</em></div>
            {ordering && <span className="sc-add">+ Add</span>}
          </div>
        ))}
        {ordering && <div className="sc-phone-cart">View cart · 2 items</div>}
      </div>
    </div>
  );
}

// Board state for one of our sample menus, set up the way loadSample + applyCuisine do in the store
const noop = () => {};
function sampleBoardState(key) {
  const sample = REFERENCE_SAMPLES[key];
  const preset = CUISINE_PRESETS[sample.cuisine] || {};
  const live = useStudio.getState();
  return {
    menu: {
      ...live.menu,
      template: sample.template,
      currency: sample.currency,
      categories: sample.categories.map((c, ci) => ({ ...c, items: c.items.map((it, i) => ({ ...it, uid: `${key}-${ci}-${i}` })) })),
      shop: { address: "", phone: "", hours: "", extra: "", locQr: false, menuQr: false, menuLink: "", mapLink: "", coords: "", instagram: "", facebook: "", website: "", whatsapp: "", orderLink: "" },
      showFooter: false
    },
    brand: {
      name: sample.brandName, tagline: sample.tagline, estYear: sample.estYear, cuisine: sample.cuisine,
      icon: preset.icon || "chefhat", primaryColor: preset.color || "#d4af37", bgColor: preset.bg || "#111827", accentColor: preset.accent || "#ffffff"
    },
    selectedLogo: DEFAULT_LOGO,
    myLogo: null,
    updateItem: noop, updateCatName: noop, setMenu: noop
  };
}

// A real menu board, scaled down to fit the tile and cropped to its top part
function MenuSampleArt({ state }) {
  const ref = useRef(null);
  const zoom = useFitZoom(ref, BOARD_WIDTH, 5);       // phone tiles need under 20%
  return (
    <div className="scm-board-art" ref={ref} aria-hidden="true">
      <div style={{ zoom: zoom / 100, width: BOARD_WIDTH }}><MenuBoardPreview state={state} /></div>
    </div>
  );
}

const MODAL_TEXT = {
  logo: ["Logo samples", "7 logo styles, each with 5 colour and type variations."],
  menu: ["Menu card samples", "Our ready-made menus. Print them, download a PDF or show them on a TV screen."],
  phone: ["Online menu samples", "Customers scan a QR code at the table and see your menu on their phone."]
};

function SamplesModal({ kind, ordering, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement;
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  const tiles = useMemo(() => {
    if (kind === "logo") {
      return DEMO_BRANDS.flatMap(b => b.logos.map(([base, v]) => ({
        key: `${b.key}-${base}-${v}`,
        label: b.name,
        sub: `${BASE_STYLE_NAMES[base]} · ${VARIANT_NAMES[v]}`,
        art: <div className="sc-art scm-logo-art"><Svg className="scm-logo" markup={variantSVG(base, v, 0, logoBrand(b))} /></div>
      })));
    }
    if (kind === "menu") {
      return MENU_SAMPLES.map(([key, , title]) => {
        const state = sampleBoardState(key);
        return { key, label: title, sub: state.brand.name, art: <MenuSampleArt state={state} /> };
      });
    }
    return DEMO_BRANDS.map(b => ({
      key: b.key,
      label: b.name,
      sub: b.tagline,
      art: kind === "menu"
        ? <MenuCardArt demo={b} name={b.name} tagline={b.tagline} logo={variantSVG(b.logos[0][0], b.logos[0][1], 0, logoBrand(b))} />
        : <PhoneArt demo={b} name={b.name} ordering={ordering} />
    }));
  }, [kind, ordering]);

  const [title, lead] = MODAL_TEXT[kind];
  return createPortal(
    <div className="scm-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="scm" role="dialog" aria-modal="true" aria-labelledby="scmTitle">
        <div className="scm-head">
          <div>
            <h3 id="scmTitle" className="scm-title">{title}</h3>
            <p className="scm-lead">{lead}</p>
          </div>
          <button ref={closeRef} type="button" className="scm-close" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className={"scm-grid scm-" + kind}>
          {tiles.map(t => (
            <figure key={t.key} className="scm-tile">
              {t.art}
              <figcaption className="sc-cap"><b>{t.label}</b><span>{t.sub}</span></figcaption>
            </figure>
          ))}
        </div>
        <p className="scm-foot">{kind === "menu"
          ? "Pick one of these when you make your menu, then change every dish, price and colour."
          : "Samples for made-up restaurants. Yours will use your name and colours."}</p>
      </div>
    </div>,
    document.body
  );
}

export default function Showcase({ slides }) {
  const picked = useStudio(s => s.goals);
  // Nothing picked yet (first screen): show everything we can make
  const goals = Object.values(picked).some(Boolean) ? picked : { logo: true, menucard: true, onlinemenu: true, onlineorder: true };
  const name = useStudio(s => s.inputs.name);
  const tagline = useStudio(s => s.inputs.tagline);
  const brandName = (name || "").trim() || ROMA.name;
  const brandTag = (tagline || "").trim() || ROMA.tagline;
  const [open, setOpen] = useState(null);         // "logo" | "menu" | "phone" | null
  const closeSamples = useCallback(() => setOpen(null), []);

  const logos = useMemo(() => {
    const brand = { ...logoBrand(ROMA), name: brandName, tagline: brandTag };
    return { main: variantSVG(4, 0, 0, brand), alt1: variantSVG(1, 1, 0, brand), alt2: variantSVG(2, 3, 0, brand) };
  }, [brandName, brandTag]);

  const showPhone = goals.onlinemenu || goals.onlineorder;
  const ordering = !!goals.onlineorder;
  if (!goals.logo && !goals.menucard && !showPhone) return null;
  let i = 0;                                      // stagger index for the cards that are shown

  // Card props: the whole card opens its samples popup (click, Enter or Space)
  const cardProps = (kind, label) => ({
    className: "sc-card sc-card-click",
    style: { "--i": i++ },
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    onClick: () => setOpen(kind),
    onKeyDown: e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(kind); } }
  });
  const More = () => <em className="sc-more" aria-hidden="true">See samples →</em>;

  const cards = [
    /* 1. Logo */
    goals.logo && <figure key="logo" {...cardProps("logo", "See logo samples")}>
      <div className="sc-art sc-logos">
        <Svg className="sc-logo sc-logo-alt1" markup={logos.alt1} />
        <Svg className="sc-logo sc-logo-alt2" markup={logos.alt2} />
        <Svg className="sc-logo sc-logo-main" markup={logos.main} />
      </div>
      <figcaption className="sc-cap"><b>Logo</b><span>7 styles · PNG + SVG</span><More /></figcaption>
    </figure>,

    /* 2. Printed menu card */
    goals.menucard && <figure key="menu" {...cardProps("menu", "See menu card samples")}>
      <MenuCardArt demo={ROMA} name={brandName} tagline={brandTag} logo={logos.main} />
      <figcaption className="sc-cap"><b>Menu card</b><span>Print, PDF &amp; TV screens</span><More /></figcaption>
    </figure>,

    /* 3. Online phone menu (with cart + "Add" buttons when ordering is picked) */
    showPhone && <figure key="phone" {...cardProps("phone", "See online menu samples")}>
      <PhoneArt demo={ROMA} name={brandName} ordering={ordering} />
      <figcaption className="sc-cap">
        <b>{ordering ? "Online menu + ordering" : "Online menu"}</b>
        <span>{ordering ? "Customers scan a QR & order" : "Customers scan a QR to view"}</span>
        <More />
      </figcaption>
    </figure>
  ].filter(Boolean);
  const modal = open && <SamplesModal kind={open} ordering={ordering} onClose={closeSamples} />;

  // Phones: every card is its own slide in the first screen's slider (see TabGoals)
  if (slides) return (
    <>
      {cards.map((card, n) => (
        <section key={card.key} className="gs-slide gs-sample" aria-label={"Sample " + (n + 1) + " of " + cards.length}>
          <div className="studio-card q-shell sc">
            <p className="sc-eyebrow">What you'll create · {n + 1}/{cards.length}</p>
            {card}
            <p className="sc-lead">Tap the card to see samples.</p>
          </div>
        </section>
      ))}
      {modal}
    </>
  );

  return (
    <section className="sc" aria-labelledby="scTitle">
      <p id="scTitle" className="sc-eyebrow">What you'll create</p>
      <p className="sc-lead">A complete brand kit for your restaurant, ready in minutes. Tap a card to see samples.</p>
      <div className="sc-grid">{cards}</div>
      {modal}
    </section>
  );
}
