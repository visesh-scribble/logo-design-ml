// One store for the whole studio (replaces the global `state` object + manual DOM updates).
// Components read from it with useStudio(selector) and re-render on their own when it changes.
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { REFERENCE_SAMPLES } from "../shared/logos.js";
import { CUISINE_PRESETS, iconForCustomCuisine, MY_LOGO_DEFAULTS, DEFAULT_LOGO, interpretStyleWords } from "../shared/brand.js";
import { STEP_DEFS, wizFlow, NO_GOALS, hasMenuGoal } from "./steps.js";

// Every dish gets a hidden id so the editor can remember which tags the AI added.
// The id is stripped before the menu leaves the browser (see cleanMenu).
let uidCounter = 0;
const withUids = (categories) => (categories || []).map(c => ({
  ...c,
  items: (c.items || []).map(it => ({ ...it, uid: it.uid || "d" + (++uidCounter) }))
}));
export const cleanMenu = (menu) => ({
  ...menu,
  categories: menu.categories.map(c => ({ ...c, items: c.items.map(({ uid, ...it }) => it) }))
});

const SAMPLE = REFERENCE_SAMPLES.veg_starters;

const initialState = {
  // wizard
  step: "goals",
  error: "",
  // what to create (first screen); shapes which steps the wizard shows
  goals: { ...NO_GOALS },
  // raw text in the three brand inputs (brand.* holds the value with defaults filled in)
  inputs: { name: "", tagline: "", estYear: "" },
  brand: {
    name: "Restaurant", tagline: "Good Food • Good Mood", estYear: "EST. 2024",
    cuisine: "veg", customCuisine: "",
    primaryColor: "#16a34a", bgColor: "#052e16", accentColor: "#f0fdf4", icon: "leaf"
  },
  brandTouched: false,
  cuisineSelect: "veg",        // value of the cuisine picker
  cuisinePicked: false,
  customCuisineInput: "",
  hasLogo: null,               // true | "reference" | false; null = not answered yet
  reference: { image: null, notes: "", palette: null },   // a logo they like + what they want
  styleText: "",               // "describe your own style" on the design step
  paletteManual: false,        // picked a colour theme by hand (wins over words / reference)
  styleManual: false,          // clicked a logo style card by hand (wins over words)
  myLogo: null,                // uploaded + customised logo settings
  wantMenu: null,
  hasMenu: null,
  menuUploaded: false,
  selectedStyles: [],          // indexes into BASE_LOGOS
  variantSeed: 0,
  selectedLogo: DEFAULT_LOGO,
  menu: {
    template: SAMPLE.template,
    orientation: "portrait",
    columns: 2,
    currency: SAMPLE.currency,
    priceStyle: "dots",
    photoStyle: "auto",
    showLogo: true,
    showVegBadges: true,
    showDesc: true,
    showDietary: true,
    showFooter: true,
    ordering: true,              // phone menu lets customers order (false = view-only online menu)
    headerSubtext: "Crispy, Cheesy & Absolutely Delicious! • Perfect for Parties & Cravings",
    categories: withUids(JSON.parse(JSON.stringify(SAMPLE.categories))),
    shop: { address: "", phone: "", hours: "", extra: "", locQr: false, mapLink: "", coords: "" }
  },
  aiAdded: {},                 // dish uid -> "Veg 97%, Spicy 84%"
  // menu studio UI
  msTab: "layout",
  menuZoom: 100,
  menuZoomMode: "fit",           // "fit" = scale the board to the screen; "manual" = use menuZoom
  boardExporting: false,         // true while the PNG is being taken: board shown at 100%
  modal: null                  // "rawText" | "editor" | "qr" | null
};

// ---------- helpers that work on the immer draft ----------
function syncBrandFromInputs(d) {
  if (d.inputs.name.trim()) { d.brandTouched = true; d.error = ""; }
  d.brand.name = d.inputs.name.trim() || "Restaurant";
  d.brand.tagline = d.inputs.tagline.trim() || "Good Food • Good Mood";
  d.brand.estYear = d.inputs.estYear.trim() || "EST. 2024";
}

function applyCuisine(d) {
  const c = d.cuisineSelect;
  d.brand.cuisine = c;
  const p = CUISINE_PRESETS[c];
  if (!p) return;
  d.brand.icon = p.icon;
  d.brand.primaryColor = p.color;
  d.brand.bgColor = p.bg;
  d.brand.accentColor = p.accent;
  if (!d.inputs.tagline.trim()) {      // never overwrite a tagline the user typed
    d.brand.tagline = p.tagline;
    d.inputs.tagline = p.tagline;
  }
}

function loadSample(d, key) {
  const sample = REFERENCE_SAMPLES[key];
  if (!sample) return;
  const fresh = !d.brandTouched;
  if (fresh) {
    d.brand.name = sample.brandName; d.brand.tagline = sample.tagline; d.brand.estYear = sample.estYear;
    d.inputs = { name: sample.brandName, tagline: sample.tagline, estYear: sample.estYear };
    d.cuisineSelect = sample.cuisine;
  }
  d.menu.template = sample.template;
  d.menu.currency = sample.currency;
  d.menu.categories = withUids(JSON.parse(JSON.stringify(sample.categories)));
  // Only re-apply the cuisine colours before the owner has set up their brand,
  // so loading a sample menu never wipes the colours they picked.
  if (fresh) applyCuisine(d);
}

function goTo(d, key, force) {
  if (!force && key !== "name" && key !== "goals" && !d.inputs.name.trim()) {
    key = "name";
    d.error = "Please enter your restaurant name first.";
  } else {
    d.error = "";
  }
  d.step = key;
  if (key === "menu" && d.brand.tagline) d.menu.headerSubtext = d.brand.tagline;
}

function removeCustomLogo(d) {
  if (d.selectedLogo.kind === "custom") d.selectedLogo = DEFAULT_LOGO;
}

// Leaving "Choose your look": turn the reference notes + typed style into style, symbol, font and colours.
// Anything the person picked by hand wins. Returns false when no style could be chosen.
function applyDesignWords(d) {
  const text = (d.hasLogo === "reference" ? d.reference.notes + " " : "") + d.styleText;
  const w = interpretStyleWords(text);
  if (!d.styleManual) {
    if (w.style != null) d.selectedStyles = [w.style];
    else if (!d.selectedStyles.length && text.trim()) d.selectedStyles = [3];   // words but no style word: Combination
  }
  if (!d.selectedStyles.length) return false;
  if (w.icon) d.brand.icon = w.icon;
  d.brand.fontPref = w.fontPref || "";
  if (w.colors && !d.paletteManual) {
    if (w.colors.primary) d.brand.primaryColor = w.colors.primary;
    if (w.colors.bg) { d.brand.bgColor = w.colors.bg; d.brand.accentColor = w.colors.accent; }
  }
  return true;
}

function nextStep(d) {
  const k = d.step;
  const fail = (msg) => { d.error = msg; return false; };
  if (k === "goals" && !Object.values(d.goals).some(Boolean)) return fail("Pick at least one thing to create.");
  if (k === "name" && !d.inputs.name.trim()) return fail("Please enter your restaurant name first.");
  if (k === "goals") {                                 // the goals answer the old "want a menu?" question
    d.wantMenu = hasMenuGoal(d.goals);
    d.menu.ordering = !!d.goals.onlineorder;
  }
  if (k === "upload" && !d.myLogo) return fail("Upload your logo to continue, or go back and choose No.");
  if (k === "reference" && !d.reference.image && !d.reference.notes.trim()) return fail("Upload a logo you like, or type what you want in your logo.");
  if (k === "design" && d.goals.logo && !applyDesignWords(d)) return fail("Pick a logo style, or describe the style you want.");
  if (k === "logos" && d.selectedLogo.kind !== "variant") return fail("Click a logo to choose it.");
  if (k === "menuupload" && !d.menuUploaded) return fail("Upload your menu to continue, or go back and choose No.");
  if (k === "modify" && d.myLogo) d.selectedLogo = { kind: "custom" };
  const f = wizFlow(d), i = f.indexOf(k);
  if (i === f.length - 1) { goTo(d, "goals", true); return true; }
  goTo(d, f[i + 1]);
  return true;
}

export const useStudio = create(immer((set, get) => ({
  ...initialState,

  // ---------- wizard navigation ----------
  goTo: (key, force) => set(d => goTo(d, key, force)),
  nextStep: () => set(d => { nextStep(d); }),
  prevStep: () => set(d => { const f = wizFlow(d), i = f.indexOf(d.step); goTo(d, f[Math.max(0, i - 1)], true); }),
  skipStep: () => set(d => {
    if (d.step === "tagline") d.inputs.tagline = "";
    if (d.step === "badge") d.inputs.estYear = "";
    syncBrandFromInputs(d);
    nextStep(d);
  }),
  setError: (msg) => set(d => { d.error = msg; }),
  // Online Order needs the online menu: picking Order adds Menu, dropping Menu drops Order
  toggleGoal: (key) => set(d => {
    const g = d.goals;
    g[key] = !g[key];
    if (key === "onlineorder" && g.onlineorder) g.onlinemenu = true;
    if (key === "onlinemenu" && !g.onlinemenu) g.onlineorder = false;
    d.error = Object.values(g).some(Boolean) ? "" : "Pick at least one thing to create.";
  }),

  // ---------- brand ----------
  setInput: (field, value) => set(d => { d.inputs[field] = value; syncBrandFromInputs(d); }),
  pickCuisine: (v) => set(d => {
    d.cuisineSelect = v;
    d.cuisinePicked = true;
    applyCuisine(d);
    d.error = "";
    if (v === "other" && d.customCuisineInput.trim()) {
      d.brand.customCuisine = d.customCuisineInput.trim();
      d.brand.icon = iconForCustomCuisine(d.brand.customCuisine);
    }
  }),
  setCustomCuisine: (v) => set(d => {
    d.customCuisineInput = v;
    d.brand.customCuisine = v.trim();
    if (d.brand.customCuisine) { d.error = ""; d.brand.icon = iconForCustomCuisine(d.brand.customCuisine); }
  }),
  // manual = false when the app sets colours itself (from a picture), so a later hand-pick still wins
  setPalette: (primary, bg, accent, manual = true) => set(d => {
    d.brand.primaryColor = primary; d.brand.bgColor = bg; d.brand.accentColor = accent;
    if (manual) d.paletteManual = true;
  }),
  setCustomColor: (hex) => set(d => { d.brand.primaryColor = hex; d.paletteManual = true; }),
  setReference: (patch) => set(d => { Object.assign(d.reference, patch); d.error = ""; }),
  setStyleText: (v) => set(d => { d.styleText = v; d.error = ""; }),
  setIcon: (icon) => set(d => { d.brand.icon = icon; }),

  // ---------- "do you already have a logo?" ----------
  chooseHasLogo: (v) => set(d => {
    d.hasLogo = v;
    if (v !== true) removeCustomLogo(d);
    const f = wizFlow(d);
    goTo(d, f[f.indexOf("haslogo") + 1], true);
  }),
  setMyLogo: (logo) => set(d => { d.myLogo = logo; d.error = ""; }),
  updateMyLogo: (patch) => set(d => { if (d.myLogo) Object.assign(d.myLogo, patch); }),
  resetMyLogo: () => set(d => { if (d.myLogo) Object.assign(d.myLogo, MY_LOGO_DEFAULTS, { dataUrl: d.myLogo.original }); }),

  // ---------- logo styles + variations ----------
  // Style cards on "Choose your look" just highlight; "Create my logos" moves on
  pickStyle: (i) => set(d => { d.selectedStyles = [i]; d.styleManual = true; d.error = ""; }),
  // Clicking a logo picks it and moves straight on, no extra "Use this logo" click
  chooseVariant: (b, v) => set(d => {
    d.selectedLogo = { kind: "variant", b, v, seed: d.variantSeed };
    d.error = "";
    if (d.step === "logos") nextStep(d);
  }),
  newVariations: () => set(d => { d.variantSeed++; }),

  // ---------- menu questions ----------
  chooseWantMenu: (v) => set(d => { d.wantMenu = v; goTo(d, v ? "hasmenu" : "download", true); }),
  chooseHasMenu: (v) => set(d => { d.hasMenu = v; goTo(d, v ? "menuupload" : "menusample", true); }),
  chooseSampleMenu: (key) => set(d => { loadSample(d, key); goTo(d, "menu", true); }),
  loadSampleMenu: (key) => set(d => { loadSample(d, key); }),
  // Called whenever a menu file or pasted text has been parsed
  menuLoaded: (categories) => set(d => {
    d.menu.categories = withUids(categories);
    d.menuUploaded = true;
    if (d.step === "menuupload") { d.error = ""; goTo(d, "menu", true); }
  }),

  // ---------- menu board design ----------
  setMenu: (patch) => set(d => { Object.assign(d.menu, patch); }),
  setShop: (patch) => set(d => {
    const s = d.menu.shop;
    if ("mapLink" in patch && patch.mapLink !== s.mapLink && patch.mapLink) s.coords = "";
    Object.assign(s, patch);
  }),
  setMsTab: (t) => set(d => { d.msTab = t; }),
  // delta 0 = back to "fit"; otherwise step from the zoom currently on screen (`from`)
  setMenuZoom: (delta, from) => set(d => {
    if (delta === 0) { d.menuZoomMode = "fit"; return; }
    d.menuZoomMode = "manual";
    d.menuZoom = Math.min(150, Math.max(20, Math.round(((from ?? d.menuZoom) + delta) / 10) * 10));
  }),
  openModal: (m) => set(d => { d.modal = m; }),
  closeModal: () => set(d => { d.modal = null; }),

  // ---------- dish editor ----------
  updateCatName: (c, val) => set(d => { d.menu.categories[c].name = val; }),
  updateItem: (c, i, field, val) => set(d => { d.menu.categories[c].items[i][field] = val; }),
  updateItemTags: (c, i, val) => set(d => {
    const item = d.menu.categories[c].items[i];
    item.dietary = val.split(",").map(s => s.trim()).filter(Boolean);
    delete d.aiAdded[item.uid];
  }),
  addItem: (c) => set(d => {
    d.menu.categories[c].items.push({ name: "New Dish", price: "100", tagline: "Fresh & Delicious", photo: "", dietary: ["Veg"], uid: "d" + (++uidCounter) });
  }),
  deleteItem: (c, i) => set(d => { d.menu.categories[c].items.splice(i, 1); }),
  deleteCategory: (c) => set(d => { d.menu.categories.splice(c, 1); }),
  addCategory: (name) => set(d => { d.menu.categories.push({ name, items: [] }); }),

  // ML dietary tagger: only ever adds tags a dish is missing; never removes the owner's tags.
  applyAiTags: (predictions) => {
    let dishes = 0, tags = 0;
    set(d => {
      const cats = d.menu.categories;
      const all = cats.flatMap(c => c.items.flatMap(i => i.dietary || []));
      const useLong = all.filter(t => /^vegetarian$/i.test(t)).length > all.filter(t => /^veg$/i.test(t)).length;
      predictions.forEach(p => {
        const item = ((cats[p.c] || {}).items || [])[p.i];
        if (!item) return;
        item.dietary = item.dietary || [];
        const have = item.dietary.join(" ").toLowerCase();
        const hasDiet = /non[\s-]?veg|\bveg|vegan|vegetarian/.test(have);
        const isNonVeg = /non[\s-]?veg/.test(have) || ("Non-Veg" in p.predicted && !hasDiet);
        const added = [];
        Object.entries(p.predicted).forEach(([tag, conf]) => {
          if (tag === "Veg" || tag === "Non-Veg") {
            if (hasDiet || (tag === "Veg" && "Vegan" in p.predicted)) return;   // Vegan already implies Veg
          } else if (tag === "Vegan" && isNonVeg) return;
          else if (have.replace(/[^a-z]/g, "").includes(tag.toLowerCase().replace(/[^a-z]/g, ""))) return;
          const label = tag === "Veg" && useLong ? "Vegetarian" : tag;
          item.dietary.push(label);
          added.push(`${label} ${Math.round(conf * 100)}%`);
        });
        if (added.length) { d.aiAdded[item.uid] = added.join(", "); dishes++; tags += added.length; }
      });
    });
    return { dishes, tags };
  }
})));

// Handy selectors
export const stepDef = (s) => STEP_DEFS[s.step];
