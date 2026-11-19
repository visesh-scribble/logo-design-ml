// Cuisine presets, logo variations, the uploaded-logo SVG and the "which logo is selected" helpers.
// Logic is the same as the original app.js; only the global `state` was replaced by parameters.
import { ICONS, BASE_LOGOS, escXml } from "./logos.js";

export const CUISINES = [
  ["veg", "Pure veg & snacks", "leaf"],
  ["indian", "Indian curries & tandoor", "flame"],
  ["chinese", "Chinese & street food", "ramen"],
  ["bistro", "European bistro", "cutlery"],
  ["italian", "Italian & pizzeria", "wheat"],
  ["finedining", "Fine dining & steakhouse", "cloche"],
  ["cafe", "Bakery & coffee", "coffee"],
  ["burger", "Burgers & smokehouse", "burger"],
  ["other", "Other (type your own)", "chefhat"]
];

export const CUISINE_PRESETS = {
  veg: { icon: "leaf", color: "#16a34a", bg: "#052e16", accent: "#f0fdf4", tagline: "Crispy, Cheesy & Absolutely Delicious!" },
  indian: { icon: "flame", color: "#f59e0b", bg: "#181414", accent: "#ffffff", tagline: "Pure Authentic Indian Curries" },
  chinese: { icon: "ramen", color: "#dc2626", bg: "#1a0505", accent: "#fef2f2", tagline: "Authentic Szechuan & Wok Specialties" },
  bistro: { icon: "cutlery", color: "#d4af37", bg: "#111827", accent: "#ffffff", tagline: "Artisan Kitchen & Wine Bar" },
  italian: { icon: "wheat", color: "#e11d48", bg: "#181414", accent: "#fef08a", tagline: "Cucina Tradizionale & Pizzeria" },
  finedining: { icon: "cloche", color: "#f59e0b", bg: "#090d16", accent: "#ffffff", tagline: "Contemporary Tasting Experience" },
  cafe: { icon: "coffee", color: "#ea580c", bg: "#1c1917", accent: "#ffedd5", tagline: "Specialty Coffee & Viennoiserie" },
  burger: { icon: "burger", color: "#f59e0b", bg: "#1e1b18", accent: "#ffffff", tagline: "Craft Smash Burgers & Brews" }
};

export const PALETTES = [
  ["#16a34a", "#052e16", "#f0fdf4", "Forest Veg Green"],
  ["#d4af37", "#111827", "#ffffff", "Noir & Gold"],
  ["#f59e0b", "#181414", "#ffffff", "Warm Saffron / Amber"],
  ["#dc2626", "#1a0505", "#fef2f2", "Crimson Dragon Red"],
  ["#c2410c", "#1c1917", "#fff7ed", "Tuscan Terracotta"]
];

export const ICON_OPTIONS = [
  ["chefhat", "Master Chef Hat (Gastronomy)"],
  ["leaf", "Fresh Organic Leaf (Veg / Farm)"],
  ["cutlery", "Crossed Fork & Knife (Classic)"],
  ["cloche", "Covered Cloche Platter (Fine Dining)"],
  ["flame", "Hearth Flame & Tandoor (Grill/Curry)"],
  ["ramen", "Bowl & Chopsticks (Asian/Chinese)"],
  ["burger", "Artisan Burger (Craft Eatery)"],
  ["wheat", "Golden Wheat Sheaf (Bakery)"],
  ["coffee", "Coffee Cup & Steam (Cafe)"],
  ["pizza", "Stone Oven Pizza Slice (Pizzeria)"]
];

// Guess a logo symbol from the food style the user typed
export function iconForCustomCuisine(text) {
  const t = text.toLowerCase();
  const rules = [
    [/pizza|pasta|italian/, "pizza"],
    [/coffee|cafe|café|tea|chai|juice|shake/, "coffee"],
    [/burger|sandwich|sub|hot ?dog|fries/, "burger"],
    [/sushi|ramen|noodle|thai|japan|korea|asian|chinese|wok|momo|dim sum|vietnam/, "ramen"],
    [/bbq|barbecue|grill|tandoor|kebab|kabab|shawarma|biryani|curry|spic|mexican|taco/, "flame"],
    [/bak|cake|bread|pastr|dessert|sweet|mithai|donut|ice cream/, "wheat"],
    [/veg|salad|organic|healthy|green|farm|plant/, "leaf"],
    [/fine|steak|luxury|tasting/, "cloche"]
  ];
  for (const [re, icon] of rules) if (re.test(t)) return icon;
  return "cutlery";
}

export { CUISINE_PHOTOS, unsplash } from "./photos.js";

// ========================================================
// 5 VARIATIONS PER STYLE
// ========================================================
export const VARIANTS_PER_STYLE = 5;
const VARIANT_FONTS = {
  classic:   { display: "'Playfair Display', serif",        sans: "'Montserrat', sans-serif" },
  modern:    { display: "'Space Grotesk', sans-serif",      sans: "'Plus Jakarta Sans', sans-serif" },
  condensed: { display: "'Oswald', sans-serif",             sans: "'Inter', sans-serif" },
  elegant:   { display: "'Cormorant Garamond', serif",      sans: "'Montserrat', sans-serif" }
};
export const VARIANT_NAMES = ["Signature", "Light and classic", "Modern", "Bold reverse", "Clean on white"];

function variantBrand(brand, v, seed) {
  const b = Object.assign({}, brand);
  let fonts = null;
  const keys = Object.keys(ICONS);
  const baseIcon = Math.max(0, keys.indexOf(brand.icon));
  const pickIcon = (off) => {
    let i = (baseIcon + off + seed) % keys.length;
    if (keys[i] === brand.icon) i = (i + 1) % keys.length;
    return keys[i];
  };
  // Every variation keeps the colours the user picked; only the type, symbol and layout of colour change.
  if (v === 1) { b.bgColor = "#faf6ee"; b.accentColor = brand.bgColor; fonts = "classic"; b.icon = pickIcon(seed); }
  else if (v === 2) { b.icon = pickIcon(3); fonts = "modern"; }
  else if (v === 3) { b.bgColor = brand.primaryColor; b.primaryColor = brand.bgColor; b.accentColor = brand.bgColor; b.icon = pickIcon(6); fonts = "condensed"; }
  else if (v === 4) { b.bgColor = "#ffffff"; b.accentColor = brand.primaryColor; fonts = "elegant"; }
  if (seed && v === 0) fonts = Object.keys(VARIANT_FONTS)[seed % 4];
  return { brand: b, fonts };
}

export function variantSVG(baseIdx, v, seed, brand) {
  const base = BASE_LOGOS[baseIdx];
  const cfg = variantBrand(brand, v, seed);
  let svg = base.generate(cfg.brand);
  if (cfg.fonts) {
    const f = VARIANT_FONTS[cfg.fonts];
    svg = svg.replace(/font-family="([^"]*)"/g, (m, fam) => {
      if (/Great Vibes|Caveat/.test(fam)) return m;                                    // keep scripts
      if (/^'(Cinzel|Playfair Display|Volkhov|Newsreader|Cormorant)/.test(fam)) return `font-family="${f.display}"`;
      if (/^'(Montserrat|Plus Jakarta Sans|Space Grotesk|Inter|Oswald)/.test(fam)) return `font-family="${f.sans}"`;
      return m;
    });
  }
  return svg;
}

// Fixed sample brand for the 7 preset style previews (not the user's name)
const PRESET_BRAND = {
  name: "Sample Bistro", tagline: "Fresh & Delicious", estYear: "EST. 2024", cuisine: "veg",
  primaryColor: "#d4af37", bgColor: "#111827", accentColor: "#ffffff", icon: "chefhat"
};
let PRESET_SVGS = null;
export function presetSVG(i) {
  if (!PRESET_SVGS) PRESET_SVGS = BASE_LOGOS.map(t => t.generate(Object.assign({}, PRESET_BRAND)));
  return PRESET_SVGS[i];
}

export const stripNum = (title) => title.replace(/^\d+\.\s*/, "");

// ========================================================
// "DO YOU ALREADY HAVE A LOGO?"  uploaded + customised logo
// ========================================================
export const MY_LOGO_DEFAULTS = {
  zoom: 100, rotate: 0, x: 0, y: 0, shape: "square",
  bgTransparent: false, bg: "#ffffff", borderW: 0, borderColor: "#1c1917",
  filter: "none", showName: false, showTagline: false, textColor: "#1c1917", removeWhite: false
};

export function buildCustomLogoSVG(m, brand) {
  if (!m) return "";
  const hasText = m.showName || m.showTagline;
  const S = hasText ? 280 : 380;
  const cx = 250, cy = hasText ? 180 : 250;
  const x0 = cx - S / 2, y0 = cy - S / 2;
  const rx = m.shape === "circle" ? S / 2 : m.shape === "rounded" ? S * 0.14 : 0;
  const k = Math.min(S / m.w, S / m.h) * (m.zoom / 100);
  const iw = m.w * k, ih = m.h * k;
  const tx = cx + (m.x / 100) * S, ty = cy + (m.y / 100) * S;

  const filters = {
    gray: '<feColorMatrix type="saturate" values="0"/>',
    sepia: '<feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0 0 0 1 0"/>',
    vivid: '<feColorMatrix type="saturate" values="1.7"/>',
    white: '<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>',
    black: '<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/>'
  };
  const filterDef = filters[m.filter] ? `<filter id="myLogoFx" color-interpolation-filters="sRGB">${filters[m.filter]}</filter>` : "";
  const filterAttr = filters[m.filter] ? ' filter="url(#myLogoFx)"' : "";

  let text = "";
  if (hasText) {
    const name = escXml(brand.name || "");
    const tag = escXml(brand.tagline || "");
    const nSize = Math.max(16, Math.min(32, Math.floor(430 / Math.max(1, name.length * 0.78))));
    const both = m.showName && m.showTagline;
    if (m.showName) text += `<text x="250" y="${both ? 372 : 392}" font-family="'Cinzel','Playfair Display',serif" font-size="${nSize}" font-weight="800" fill="${m.textColor}" text-anchor="middle" letter-spacing="3">${name.toUpperCase()}</text>`;
    if (m.showTagline) text += `<text x="250" y="${both ? 404 : 392}" font-family="'Montserrat',sans-serif" font-size="12" font-weight="600" fill="${m.textColor}" text-anchor="middle" letter-spacing="3" opacity="0.85">${tag.toUpperCase()}</text>`;
  }

  const border = m.borderW > 0
    ? `<rect x="${x0 + m.borderW / 2}" y="${y0 + m.borderW / 2}" width="${S - m.borderW}" height="${S - m.borderW}" rx="${Math.max(0, rx - m.borderW / 2)}" fill="none" stroke="${m.borderColor}" stroke-width="${m.borderW}"/>`
    : "";

  return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 500" class="w-full h-full">
        <defs>
          <clipPath id="myLogoClip"><rect x="${x0}" y="${y0}" width="${S}" height="${S}" rx="${rx}"/></clipPath>
          ${filterDef}
        </defs>
        ${m.bgTransparent ? "" : `<rect width="500" height="500" fill="${m.bg}" rx="14"/>`}
        <g clip-path="url(#myLogoClip)">
          <g transform="translate(${tx} ${ty}) rotate(${m.rotate})">
            <image href="${m.dataUrl}" xlink:href="${m.dataUrl}" x="${-iw / 2}" y="${-ih / 2}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMid meet"${filterAttr}/>
          </g>
        </g>
        ${border}
        ${text}
      </svg>`;
}

// Remove near-white pixels (soft edge) from the original image
export function whiteToTransparent(srcUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height), px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        const m = Math.min(px[i], px[i + 1], px[i + 2]);
        if (m >= 245) px[i + 3] = 0;
        else if (m > 205) px[i + 3] = Math.round(px[i + 3] * (245 - m) / 40);
      }
      ctx.putImageData(d, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.src = srcUrl;
  });
}

// ========================================================
// SELECTED LOGO
//   { kind: "base", b }            one of the 7 styles as-is (default: 5. Emblem)
//   { kind: "variant", b, v, seed } a variation picked on the "Choose your logo" screen
//   { kind: "custom" }             the uploaded + adjusted logo
// ========================================================
export const DEFAULT_LOGO = { kind: "base", b: 4 };

export function selectedLogoInfo(selected, myLogo) {
  if (selected.kind === "custom" && myLogo) {
    return { type: "custom", title: "Your Logo", style: "Uploaded & customised", generate: (brand) => buildCustomLogoSVG(myLogo, brand) };
  }
  if (selected.kind === "variant") {
    const base = BASE_LOGOS[selected.b];
    return {
      type: base.type + "_v" + (selected.v + 1),
      title: stripNum(base.title) + ", variation " + (selected.v + 1),
      style: base.style,
      generate: (brand) => variantSVG(selected.b, selected.v, selected.seed, brand)
    };
  }
  return BASE_LOGOS[selected.b] || BASE_LOGOS[4];
}
