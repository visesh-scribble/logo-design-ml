// Downloads, QR codes and menu-file parsing. Same behaviour as the original app.js.
import QRCode from "qrcode";

export function saveBlobAs(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const fileBase = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "_");

export function downloadSVG(svg, filename) {
  saveBlobAs(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), filename);
}

// SVG markup -> 2048 x 2048 PNG
export function downloadSVGasPNG(svg, filename) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 2048;
    c.getContext("2d").drawImage(img, 0, 0, 2048, 2048);
    URL.revokeObjectURL(url);
    c.toBlob(bl => saveBlobAs(bl, filename), "image/png");
  };
  img.src = url;
}

// ---------- QR codes ----------
const qrCache = new Map();
export function qrDataUrl(text, { width = 256, dark = "#111111" } = {}) {
  if (!text) return Promise.resolve("");
  const key = width + dark + text;
  if (!qrCache.has(key)) {
    qrCache.set(key, QRCode.toDataURL(text, { width, margin: 0, errorCorrectionLevel: "M", color: { dark, light: "#ffffff" } }));
  }
  return qrCache.get(key);
}

// Print-ready card: brand name on top, QR code, call to action below
export function downloadQrCard({ qrUrl, brand, title, lines, filename }) {
  const img = new Image();
  img.onload = () => {
    const W = 600, H = 760, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = brand.bgColor || "#111827"; g.fillRect(0, 0, W, 120);
    g.textAlign = "center";
    g.fillStyle = brand.primaryColor || "#d4af37";
    g.font = "bold 40px Georgia, serif";
    g.fillText(brand.name || "Our shop", W / 2, 75, W - 40);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 100, title === "SCAN FOR MENU" ? 160 : 150, 400, 400);
    g.fillStyle = "#1c1917"; g.font = "bold 34px system-ui, sans-serif";
    g.fillText(title, W / 2, title === "SCAN FOR MENU" ? 630 : 615);
    g.fillStyle = "#78716c"; g.font = "20px system-ui, sans-serif";
    lines.forEach((t, i) => t && g.fillText(t, W / 2, (title === "SCAN FOR MENU" ? 670 : 660) + i * 35, W - 40));
    c.toBlob(b => saveBlobAs(b, filename), "image/png");
  };
  img.src = qrUrl;
}

// The link inside the location QR: the user's own Maps link, else their GPS spot, else a Maps search for the address.
export function locationUrl(shop, brandName) {
  const s = { mapLink: (shop.mapLink || "").trim(), coords: shop.coords || "", address: (shop.address || "").trim() };
  if (s.mapLink) return /^https?:\/\//i.test(s.mapLink) ? s.mapLink : "https://" + s.mapLink;
  if (s.coords) return "https://www.google.com/maps/search/?api=1&query=" + s.coords;
  if (s.address) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([brandName, s.address].filter(Boolean).join(", "));
  return "";
}

// ---------- Menu files ----------
// Each parser returns menu categories: [{ name, items: [{ name, description, price, dietary }] }]
export function parseCSVText(csvContent) {
  const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l);
  if (!lines.length) return null;

  const header = lines[0].toLowerCase().split(",").map(c => c.trim().replace(/"/g, ""));
  const catIdx = header.findIndex(h => h.includes("cat") || h.includes("sec"));
  let nameIdx = header.findIndex(h => h.includes("name") || h.includes("dish") || h.includes("item"));
  const descIdx = header.findIndex(h => h.includes("desc") || h.includes("detail") || h.includes("ingred"));
  const priceIdx = header.findIndex(h => h.includes("price") || h.includes("cost") || h.includes("amount"));
  const dietIdx = header.findIndex(h => h.includes("diet") || h.includes("tag") || h.includes("veg"));
  if (nameIdx === -1) nameIdx = 0;

  const categoriesMap = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const cat = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : "Main Specialties";
    const name = cols[nameIdx];
    if (!name) continue;
    const desc = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : "";
    const price = priceIdx !== -1 && cols[priceIdx] ? cols[priceIdx].replace(/[^0-9.]/g, "") : "";
    const diet = dietIdx !== -1 && cols[dietIdx] ? cols[dietIdx].split(";").map(s => s.trim()) : [];
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push({ name, description: desc, price, dietary: diet });
  }
  return Object.keys(categoriesMap).map(k => ({ name: k, items: categoriesMap[k] }));
}

export function parseJsonRowsIntoMenu(rows) {
  const categoriesMap = {};
  rows.forEach(row => {
    let cat = "Chef's Specials", name = "", desc = "", price = "", dietary = [];
    Object.keys(row).forEach(key => {
      const k = key.toLowerCase();
      const val = String(row[key]).trim();
      if (k.includes("cat") || k.includes("sec")) cat = val || cat;
      else if (k.includes("name") || k.includes("dish") || k.includes("item")) name = val;
      else if (k.includes("desc") || k.includes("detail")) desc = val;
      else if (k.includes("price") || k.includes("cost")) price = val.replace(/[^0-9.]/g, "");
      else if (k.includes("diet") || k.includes("tag") || k.includes("veg")) dietary = val ? [val] : [];
    });
    if (name) {
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push({ name, description: desc, price, dietary });
    }
  });
  return Object.keys(categoriesMap).map(k => ({ name: k, items: categoriesMap[k] }));
}

const readAs = (file, how) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  how === "buffer" ? r.readAsArrayBuffer(file) : r.readAsText(file);
});

// Reads an uploaded .xlsx / .xls / .csv / .txt / .json menu. Resolves to categories, or null for other file types.
// SheetJS is only downloaded when someone actually uploads an Excel file.
export async function readMenuFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    try {
      const wb = XLSX.read(new Uint8Array(await readAs(file, "buffer")), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return parseJsonRowsIntoMenu(XLSX.utils.sheet_to_json(ws, { defval: "" }));
    } catch (err) { throw new Error("Excel parse error: " + err.message); }
  }
  if (ext === "csv" || ext === "txt") return parseCSVText(await readAs(file, "text"));
  if (ext === "json") {
    try {
      const parsed = JSON.parse(await readAs(file, "text"));
      return parsed.categories || [{ name: "Signature Items", items: parsed }];
    } catch (err) { throw new Error("JSON parse error: " + err.message); }
  }
  return null;
}

// Fallback for "Paste menu text" when the server cannot be reached
export function parseRawTextLocally(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  const categories = [];
  let cur = { name: "Signature Dishes", items: [] };
  lines.forEach(line => {
    if (line.startsWith("[") && line.endsWith("]")) {
      if (cur.items.length) categories.push(cur);
      cur = { name: line.slice(1, -1), items: [] };
    } else {
      const parts = line.split(" - ");
      const name = parts[0] || "";
      const desc = parts[1] || "";
      const price = (parts[2] || "").replace(/[^0-9.]/g, "");
      if (name) cur.items.push({ name, description: desc, price });
    }
  });
  if (cur.items.length) categories.push(cur);
  return categories;
}

export function menuToCSV(categories) {
  let csv = "Category,Item Name,Description,Price,Dietary\n";
  categories.forEach(cat => {
    cat.items.forEach(item => {
      const diet = (item.dietary || []).join(";");
      csv += `"${cat.name}","${item.name}","${item.description || item.ingredients || ''}","${item.price}","${diet}"\n`;
    });
  });
  return csv;
}

// ---------- Design brief (logo reference) ----------
const loadImg = src => new Promise(res => { if (!src) { res(null); return; } const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

// One PNG a designer can follow: name, tagline, the reference picture, the notes,
// what we understood, the colours and the logo that was chosen.
export async function downloadBriefPNG({ brand, reference, chips, logoSvg, filename }) {
  const W = 1240, H = 1754, P = 80;                      // A4-ish portrait
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#fbf9f4"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#1f4d3a"; g.fillRect(0, 0, W, 14);
  const text = (t, x, y, font, color = "#16201b") => { g.font = font; g.fillStyle = color; g.fillText(t, x, y); };
  const wrap = (t, x, y, maxW, lh, font, color) => {
    g.font = font; g.fillStyle = color;
    let line = "", yy = y;
    for (const word of String(t).split(/\s+/)) {
      const test = line ? line + " " + word : word;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = word; yy += lh; } else line = test;
    }
    if (line) g.fillText(line, x, yy);
    return yy + lh;
  };

  text("LOGO DESIGN BRIEF", P, 110, "600 22px Inter, Arial, sans-serif", "#1f4d3a");
  text(brand.name || "Restaurant", P, 175, "500 56px Newsreader, Georgia, serif");
  if (brand.tagline) text(brand.tagline, P, 220, "400 26px Inter, Arial, sans-serif", "#6e746f");

  // Reference picture (left) and chosen logo (right)
  const boxY = 270, box = 500;
  const [refImg, logoImg] = await Promise.all([
    loadImg(reference.image),
    loadImg(logoSvg ? URL.createObjectURL(new Blob([logoSvg], { type: "image/svg+xml;charset=utf-8" })) : null)
  ]);
  const frame = (x, label, img) => {
    g.fillStyle = "#ffffff"; g.fillRect(x, boxY, box, box);
    g.strokeStyle = "#e7e2d6"; g.lineWidth = 2; g.strokeRect(x, boxY, box, box);
    if (img) {
      const s = Math.min((box - 40) / img.width, (box - 40) / img.height);
      const w = img.width * s, h = img.height * s;
      g.drawImage(img, x + (box - w) / 2, boxY + (box - h) / 2, w, h);
    } else text("(none)", x + box / 2 - 40, boxY + box / 2, "400 24px Inter, Arial, sans-serif", "#9aa39c");
    text(label, x, boxY + box + 40, "600 22px Inter, Arial, sans-serif", "#3c4640");
  };
  frame(P, "Their reference", refImg);
  frame(W - P - box, "Logo we made from it", logoImg);

  // Notes
  let y = boxY + box + 110;
  text("What they want", P, y, "600 26px Inter, Arial, sans-serif", "#1f4d3a");
  y = wrap(reference.notes || "(no notes)", P, y + 44, W - 2 * P, 38, "400 28px Inter, Arial, sans-serif", "#16201b");

  // Understood keywords
  if (chips && chips.length) {
    y += 20;
    text("We understood", P, y, "600 26px Inter, Arial, sans-serif", "#1f4d3a");
    let x = P; y += 30;
    g.font = "600 24px Inter, Arial, sans-serif";
    for (const chip of chips) {
      const w = g.measureText(chip).width + 36;
      if (x + w > W - P) { x = P; y += 56; }
      g.fillStyle = "#e9f0ec"; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, 44, 22) : g.rect(x, y, w, 44); g.fill();
      g.fillStyle = "#1f4d3a"; g.fillText(chip, x + 18, y + 30);
      x += w + 12;
    }
    y += 90;
  }

  // Colours
  text("Colours", P, y, "600 26px Inter, Arial, sans-serif", "#1f4d3a");
  [["Main", brand.primaryColor], ["Background", brand.bgColor], ["Accent", brand.accentColor]].forEach(([label, col], i) => {
    const x = P + i * 260;
    g.fillStyle = col; g.fillRect(x, y + 24, 80, 80);
    g.strokeStyle = "#d5cfc0"; g.strokeRect(x, y + 24, 80, 80);
    text(label, x + 96, y + 58, "600 22px Inter, Arial, sans-serif", "#3c4640");
    text(String(col).toUpperCase(), x + 96, y + 90, "400 22px Inter, Arial, sans-serif", "#6e746f");
  });

  text("Made with Gourmet Studio", P, H - 60, "400 20px Inter, Arial, sans-serif", "#9aa39c");
  if (logoImg) URL.revokeObjectURL(logoImg.src);
  await new Promise(res => c.toBlob(bl => { saveBlobAs(bl, filename); res(); }, "image/png"));
}
