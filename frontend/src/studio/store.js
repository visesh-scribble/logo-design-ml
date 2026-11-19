// One store for the whole studio (replaces the global `state` object + manual DOM updates).
// Components read from it with useStudio(selector) and re-render on their own when it changes.
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { REFERENCE_SAMPLES } from "../shared/logos.js";
import { CUISINE_PRESETS, iconForCustomCuisine, MY_LOGO_DEFAULTS, DEFAULT_LOGO } from "../shared/brand.js";
import { STEP_DEFS, wizFlow } from "./steps.js";

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
  step: "name",
  error: "",
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
  hasLogo: null,               // null = not answered yet
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
    headerSubtext: "Crispy, Cheesy & Absolutely Delicious! • Perfect for Parties & Cravings",
    categories: withUids(JSON.parse(JSON.stringify(SAMPLE.categories))),
    shop: { address: "", phone: "", hours: "", extra: "", locQr: false, mapLink: "", coords: "" }
  },
  aiAdded: {},                 // dish uid -> "Veg 97%, Spicy 84%"
  // menu studio UI
  msTab: "layout",
  menuZoom: 100,
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
  if (!force && key !== "name" && !d.inputs.name.trim()) {
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

function nextStep(d) {
  const k = d.step;
  const fail = (msg) => { d.error = msg; return false; };
  if (k === "name" && !d.inputs.name.trim()) return fail("Please enter your restaurant name first.");
  if (k === "upload" && !d.myLogo) return fail("Upload your logo to continue, or go back and choose No.");
  if (k === "cuisine" && !d.cuisinePicked) return fail("Choose a cuisine to continue.");
  if (k === "cuisine" && d.cuisineSelect === "other" && !d.brand.customCuisine) return fail("Type your food style to continue.");
  if (k === "styles" && !d.selectedStyles.length) return fail("Pick at least one style to continue.");
  if (k === "logos" && d.selectedLogo.kind !== "variant") return fail("Click a logo to choose it.");
  if (k === "menuupload" && !d.menuUploaded) return fail("Upload your menu to continue, or go back and choose No.");
  if (k === "modify" && d.myLogo) d.selectedLogo = { kind: "custom" };
  const f = wizFlow(d), i = f.indexOf(k);
  if (i === f.length - 1) { goTo(d, "name", true); return true; }
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
  setPalette: (primary, bg, accent) => set(d => { d.brand.primaryColor = primary; d.brand.bgColor = bg; d.brand.accentColor = accent; }),
  setCustomColor: (hex) => set(d => { d.brand.primaryColor = hex; }),
  setIcon: (icon) => set(d => { d.brand.icon = icon; }),

  // ---------- "do you already have a logo?" ----------
  chooseHasLogo: (v) => set(d => {
    d.hasLogo = v;
    if (!v) removeCustomLogo(d);
    const f = wizFlow(d);
    goTo(d, f[f.indexOf("haslogo") + 1], true);
  }),
  setMyLogo: (logo) => set(d => { d.myLogo = logo; d.error = ""; }),
  updateMyLogo: (patch) => set(d => { if (d.myLogo) Object.assign(d.myLogo, patch); }),
  resetMyLogo: () => set(d => { if (d.myLogo) Object.assign(d.myLogo, MY_LOGO_DEFAULTS, { dataUrl: d.myLogo.original }); }),

  // ---------- logo styles + variations ----------
  pickStyle: (i) => set(d => {
    d.selectedStyles = [i];
    d.error = "";
    const f = wizFlow(d);
    goTo(d, f[f.indexOf("styles") + 1]);
  }),
  // Clicking a logo picks it and moves straight on, no extra "Use this logo" click
  chooseVariant: (b, v) => set(d => {
    d.selectedLogo = { kind: "variant", b, v, seed: d.variantSeed };
    d.error = "";
    if (d.step === "logos") nextStep(d);
  }),
  newVariations: () => set(d => { d.variantSeed++; }),

  // ---------- menu questions ----------
  chooseWantMenu: (v) => set(d => { d.wantMenu = v; goTo(d, v ? "hasmenu" : "mockups", true); }),
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
  setMenuZoom: (delta) => set(d => { d.menuZoom = delta === 0 ? 100 : Math.min(150, Math.max(50, d.menuZoom + delta)); }),
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
