// ONE-QUESTION-PER-SCREEN WIZARD (unchanged from the original)
// Flow (no logo):  name > hasLogo > tagline > badge > cuisine > styles > colours > logos > menu > mockups
// Flow (has logo): name > hasLogo > tagline > upload > modify > badge > colours > menu > mockups
export const STEP_DEFS = {
  name:     { panel: "q", q: 1, title: "What is your restaurant called?", sub: "This name goes on every logo and menu.", phase: "Brand" },
  haslogo:  { panel: "mylogo", sub2: "ask", title: "Do you already have a logo?", sub: "If you do, upload it and we will use it on your menu and mockups.", phase: "Logo" },
  tagline:  { panel: "q", q: 2, title: "Add a tagline or motto", sub: "A short line under the name. You can skip this.", phase: "Brand", optional: true },
  upload:   { panel: "mylogo", sub2: "upload", title: "Upload your logo", sub: "Choose the image file of your current logo.", phase: "Logo" },
  modify:   { panel: "mylogo", sub2: "modify", title: "Adjust your logo", sub: "Change anything you like. The preview updates as you go.", phase: "Logo" },
  badge:    { panel: "q", q: 3, title: "Add a heritage badge", sub: "For example EST. 2024 or Made with Love. You can skip this.", phase: "Brand", optional: true },
  cuisine:  { panel: "q", q: 4, title: "What kind of food do you serve?", sub: "This sets a starting colour palette and the symbol used in your logos.", phase: "Style" },
  colors:   { panel: "q", q: 5, title: "Pick your brand colours", sub: "Choose a palette or your own colour. Used on your menu and logos.", phase: "Style" },
  symbol:   { panel: "q", q: 6, title: "Pick your symbol", sub: "The picture used in your logos.", phase: "Style" },
  styles:   { panel: "styles", title: "Pick a logo style", sub: "Here are 7 preset styles. Click one, pick your colours, and we will create 5 logos with your name in that style.", phase: "Logo" },
  logos:    { panel: "logos", title: "Choose your logo", sub: "Five variations of the style you picked. Click one to use it and continue.", phase: "Logo" },
  wantmenu: { panel: "menuask", sub2: "want", title: "Do you want a menu board?", sub: "We can design a print or TV menu board with your logo.", phase: "Menu" },
  hasmenu:  { panel: "menuask", sub2: "has", title: "Do you already have a menu?", sub: "If you do, upload it and we will put your dishes on the board.", phase: "Menu" },
  menuupload: { panel: "menuask", sub2: "upload", title: "Upload your menu", sub: "Choose your menu file, or paste the menu as text.", phase: "Menu" },
  menusample: { panel: "menuask", sub2: "sample", title: "Pick a starting menu", sub: "Choose one to start from. You can edit every dish and price on the next screen.", phase: "Menu" },
  menu:     { panel: "menu", title: "Design your menu board", sub: "Pick a theme, layout and colours. Click any dish or price to edit it.", phase: "Menu" },
  mockups:  { panel: "mockups", title: "See it in the real world", sub: "Your logo on a signboard, menu cover, packaging and business card.", phase: "Mockups" }
};

export function wizFlow(s) {
  const f = ["name", "haslogo", "tagline"];
  if (s.hasLogo === true) f.push("upload", "modify", "badge", "colors");
  else f.push("badge", "cuisine", "styles", "colors", "logos");
  f.push("wantmenu");
  if (s.wantMenu === true) {
    f.push("hasmenu");
    if (s.hasMenu === true) f.push("menuupload");
    else if (s.hasMenu === false) f.push("menusample");
    f.push("menu");
  }
  f.push("mockups");
  return f;
}

// These steps advance by clicking their big choice buttons, so they have no Next button
export const CHOICE_STEPS = ["haslogo", "wantmenu", "hasmenu", "menusample", "logos"];

export function nextLabel(key, s) {
  return key === "mockups" ? "Start over"
    : key === "colors" && s.hasLogo !== true ? "Create my logos →"
    : key === "modify" ? "Use this logo →"
    : key === "menu" ? "Next: see it in the real world →"
    : "Next →";
}
