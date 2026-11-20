// ONE-QUESTION-PER-SCREEN WIZARD
// Flow: goals > name > haslogo ┬ yes:       upload > modify ─────────────┐
//                              ├ reference: reference > design > logos ─┤> tagline > [menu steps] > download
//                              └ no:                    design > logos ─┘
// No logo goal: goals > name > design (colours only) > tagline > [menu steps] > download
export const STEP_DEFS = {
  goals:    { panel: "goals", title: "What do you want to create?", sub: "Pick one or more. We'll only ask what's needed.", phase: "Start" },
  name:     { panel: "q", q: 1, title: "What is your restaurant called?", sub: "This name goes on every logo and menu.", phase: "Brand" },
  haslogo:  { panel: "mylogo", sub2: "ask", title: "Do you already have a logo?", sub: "Upload yours, share one you like, or let us create one for you.", phase: "Logo" },
  upload:   { panel: "mylogo", sub2: "upload", title: "Upload your logo", sub: "Choose the image file of your current logo.", phase: "Logo" },
  modify:   { panel: "mylogo", sub2: "modify", title: "Adjust your logo", sub: "Change anything you like. The preview updates as you go.", phase: "Logo" },
  reference:{ panel: "mylogo", sub2: "reference", title: "Share your logo reference", sub: "Upload a logo you like and tell us what you want in yours. We'll use its colours and your words.", phase: "Logo" },
  design:   { panel: "design", title: "Choose your look", sub: "Pick a colour theme and a logo style, or describe the style you want in your own words.", phase: "Style" },
  logos:    { panel: "logos", title: "Choose your logo", sub: "Five variations of the style you picked. Click one to use it and continue.", phase: "Logo" },
  tagline:  { panel: "q", q: 2, title: "Add a tagline or motto", sub: "A short line under the name. You can skip this.", phase: "Brand", optional: true },
  hasmenu:  { panel: "menuask", sub2: "has", title: "Do you already have a menu?", sub: "If you do, upload it and we will put your dishes on the board.", phase: "Menu" },
  menuupload: { panel: "menuask", sub2: "upload", title: "Upload your menu", sub: "Choose your menu file, or paste the menu as text.", phase: "Menu" },
  menusample: { panel: "menuask", sub2: "sample", title: "Pick a starting menu", sub: "Choose one to start from. You can edit every dish and price on the next screen.", phase: "Menu" },
  menu:     { panel: "menu", title: "Design your menu board", sub: "Pick a theme, layout and colours. Click any dish or price to edit it.", phase: "Menu" },
  download: { panel: "download", title: "Your files are ready", sub: "Download, print or share everything you made.", phase: "Download" }
};

// What the visitor wants to create (picked on the first screen). The flow only includes the steps they need.
export const NO_GOALS = { logo: false, menucard: false, onlinemenu: false, onlineorder: false };
export const hasMenuGoal = (g) => !!(g && (g.menucard || g.onlinemenu || g.onlineorder));

export function wizFlow(s) {
  const g = s.goals || NO_GOALS;
  const f = ["goals", "name"];
  if (g.logo) {
    f.push("haslogo");
    if (s.hasLogo === true) f.push("upload", "modify");
    else if (s.hasLogo === "reference") f.push("reference", "design", "logos");
    else f.push("design", "logos");
  } else {
    f.push("design");                       // colour theme for the menu
  }
  f.push("tagline");                        // asked after the logo, so it shows up on it
  if (hasMenuGoal(g)) {
    f.push("hasmenu");
    if (s.hasMenu === true) f.push("menuupload");
    else if (s.hasMenu === false) f.push("menusample");
    f.push("menu");
  }
  f.push("download");                       // every run ends on its own downloads page
  return f;
}

// These steps advance by clicking their big choice buttons, so they have no Next button
export const CHOICE_STEPS = ["haslogo", "hasmenu", "menusample", "logos"];

export function nextLabel(key, s) {
  const flow = wizFlow(s);
  const next = flow[flow.indexOf(key) + 1];
  return !next ? "Start over"
    : next === "download" ? "Next: download your files →"
    : key === "design" && next === "logos" ? "Create my logos →"
    : key === "modify" ? "Use this logo →"
    : "Next →";
}
