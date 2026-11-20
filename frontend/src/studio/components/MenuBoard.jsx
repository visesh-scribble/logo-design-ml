// RENDER MENU BOARD CANVAS (REFERENCE-ACCURATE TEMPLATES)
// Same 7 designs and markup as the original renderMenuBoard(), written as React components.
// Text on the board is click-to-edit; dish names, prices, descriptions and section names are saved back to the menu.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStudio } from "../store.js";
import { selectedLogoInfo } from "../../shared/brand.js";
import { locationUrl, qrDataUrl } from "../../shared/files.js";

// contentEditable text that React does not fight with: the DOM text is only replaced when the value changes.
function Editable({ as: Tag = "span", className, value, onCommit }) {
  const ref = useRef(null);
  useLayoutEffect(() => { if (ref.current && ref.current.textContent !== String(value ?? "")) ref.current.textContent = value ?? ""; }, [value]);
  return (
    <Tag ref={ref} className={className} contentEditable suppressContentEditableWarning
      onBlur={onCommit ? e => { const t = e.currentTarget.textContent.trim(); if (t !== String(value ?? "").trim()) onCommit(t); } : undefined} />
  );
}

export function useQr(text, opts) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    qrDataUrl(text, opts).then(u => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return url;
}

// Helper for FSSAI Veg/Non-Veg badges
function VegBadge({ dietary }) {
  const show = useStudio(s => s.menu.showVegBadges);
  if (!show) return null;
  const isNonVeg = (dietary || []).some(d => /non-veg|chicken|fish|egg|prawn/.test(String(d).toLowerCase()));
  return isNonVeg ? <span className="badge-nonveg mr-1.5" title="Non-Vegetarian" /> : <span className="badge-veg mr-1.5" title="100% Vegetarian" />;
}

function Logo({ className, markup }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: markup }} />;
}

// Strip at the bottom of every menu design: address, phone, hours, extra details and the location QR.
function ShopStrip() {
  const shop = useStudio(s => s.menu.shop);
  const showFooter = useStudio(s => s.menu.showFooter);
  const brandName = useStudio(s => s.brand.name);
  const qr = useQr(shop.locQr ? locationUrl(shop, brandName) : "");
  const t = { address: shop.address.trim(), phone: shop.phone.trim(), hours: shop.hours.trim(), extra: shop.extra.trim() };
  if (!showFooter) return null;
  if (!t.address && !t.phone && !t.hours && !t.extra && !qr) return null;
  const line = (icon, v) => v ? <div>{icon} {v}</div> : null;
  return (
    <div className="shop-strip">
      <div className="shop-lines">
        <b>{brandName || "Visit us"}</b>
        {line("📍", t.address)}{line("📞", t.phone)}{line("🕒", t.hours)}{line("ℹ️", t.extra)}
      </div>
      {qr && <div className="shop-qr"><img src={qr} alt="Location QR code" /><small>Scan to find us</small></div>}
    </div>
  );
}

export default function MenuBoard() {
  const s = useStudio();
  const { template, columns, currency, showLogo, showDesc, showFooter, headerSubtext, categories } = s.menu;
  const brand = s.brand;
  const logoMarkup = selectedLogoInfo(s.selectedLogo, s.myLogo).generate(brand);
  const formatPrice = (p) => !p ? "" : currency === "/-" ? `${p}/-` : `${currency}${p}`;

  // edit helpers
  const field = (c, i, f) => (t) => s.updateItem(c, i, f, t);
  // "Rs. 180", "$9.50" or "100/-" -> just the number
  const price = (c, i) => (t) => { const m = t.replace(/,/g, "").match(/\d+(\.\d+)?/); s.updateItem(c, i, "price", m ? m[0] : ""); };
  const catName = (c) => (t) => s.updateCatName(c, t);

  // ----------------------------------------------------
  // TEMPLATE 1: INFOGRAPHIC DISH CARDS (Glow with Khushi style)
  // ----------------------------------------------------
  if (template === "infographic") {
    const all = categories.flatMap((cat, c) => cat.items.map((item, i) => ({ item, c, i })));
    return (
      <div id="captureBoardTarget" className="menu-board-container w-full infographic-bg p-8 rounded-2xl shadow-2xl relative">
        {/* HEADER RIBBON */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#ebd9c3] mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✨</span>
            <div>
              <Editable as="h1" className="text-5xl font-black tracking-tight text-[#c2410c] uppercase font-['Montserrat'] leading-none" value={brand.name.toUpperCase()} />
              <Editable as="div" className="inline-block bg-[#166534] text-white text-sm font-extrabold px-3 py-1 rounded-full mt-2 uppercase tracking-wider" value={brand.tagline} />
              <Editable as="p" className="text-xs text-[#78350f] font-semibold mt-1" value={headerSubtext} onCommit={t => s.setMenu({ headerSubtext: t })} />
            </div>
          </div>
          {showLogo && <Logo className="w-28 h-28 rounded-full border-2 border-[#166534] p-1 bg-white shadow shrink-0 overflow-hidden" markup={logoMarkup} />}
        </div>

        {/* DISH CARDS */}
        <div className="grid grid-cols-4 gap-4">
          {all.map(({ item, c, i }, idx) => (
            <div key={item.uid} className="infographic-card p-3 flex flex-col justify-between space-y-2 relative">
              <div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#166534] text-white font-black text-xs flex items-center justify-center shrink-0">{item.number || idx + 1}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold text-[#9a3412] leading-tight flex items-center">
                      <VegBadge dietary={item.dietary} />
                      <Editable value={item.name} onCommit={field(c, i, "name")} />
                    </h3>
                    {item.tagline && <Editable as="p" className="text-[10px] text-[#78350f] italic" value={item.tagline} onCommit={field(c, i, "tagline")} />}
                  </div>
                </div>
                {item.photo && (
                  <div className="w-full h-28 rounded-lg overflow-hidden my-2 shadow-inner border border-[#ebd9c3]">
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {item.ingredients && (
                  <div className="bg-[#fef3c7] border border-[#fde68a] p-1.5 rounded-lg text-[9px] text-[#78350f] mt-1">
                    <span className="font-extrabold uppercase text-[#b45309] block">INGREDIENTS:</span>
                    <Editable as="p" className="leading-tight mt-0.5" value={item.ingredients} onCommit={field(c, i, "ingredients")} />
                  </div>
                )}
                {item.method && (
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-1.5 rounded-lg text-[9px] text-[#166534] mt-1">
                    <span className="font-extrabold uppercase text-[#15803d] block">METHOD (Short Steps):</span>
                    <Editable as="p" className="leading-tight mt-0.5" value={item.method} onCommit={field(c, i, "method")} />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#ebd9c3] text-xs font-bold text-[#b45309]">
                <span>Price</span>
                <Editable className="text-sm font-black text-[#9a3412]" value={formatPrice(item.price)} onCommit={price(c, i)} />
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER: QUICK TIPS & SAUCES */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t-2 border-[#ebd9c3] text-xs">
          <div className="bg-[#fffbeb] border border-[#fde68a] p-3 rounded-xl">
            <span className="font-bold text-[#b45309] flex items-center space-x-1 mb-1"><span>💡</span><span className="uppercase tracking-wider">Quick Tips</span></span>
            <ul className="text-[10px] text-[#78350f] space-y-0.5 list-disc list-inside">
              <li>For extra crispiness, add a little cornflour.</li>
              <li>Serve hot with fresh green chutney.</li>
              <li>Can also be air-fried or baked for a healthier twist!</li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2">
            <span className="text-[11px] text-[#9a3412] italic">Made with Love ♡</span>
            <div className="text-xl font-bold text-[#be185d] font-['Great_Vibes']">{brand.name}</div>
            <div className="bg-[#166534] text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">Good Food &bull; Good Mood &bull; Great You!</div>
          </div>
          <div className="bg-[#fff1f2] border border-[#fecdd3] p-3 rounded-xl">
            <span className="font-bold text-[#be123c] block uppercase tracking-wider text-[10px] mb-1">Perfect To Serve With</span>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-[#881337] font-semibold">
              <span className="bg-white/80 px-1.5 py-0.5 rounded">🌱 Mint Chutney</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded">🌶️ Schezwan</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded">🍅 Ketchup</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded">🧄 Garlic Mayo</span>
            </div>
          </div>
        </div>
        <div className="bg-[#be185d] text-white text-center text-xs font-bold py-1.5 rounded-b-xl mt-4 tracking-wider uppercase">Follow for more Easy, Tasty &amp; Healthy Dishes</div>
        <ShopStrip />
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 2: PHOTO-ROW MENU (Dark Main Course)
  // ----------------------------------------------------
  if (template === "photorow") {
    return (
      <div id="captureBoardTarget" className="menu-board-container w-full photorow-bg p-8 rounded-2xl shadow-2xl relative font-sans">
        <div className="text-center pb-6 border-b border-white/10 mb-6">
          {showLogo && <Logo className="w-20 h-20 mx-auto mb-3 filter drop-shadow" markup={logoMarkup} />}
          <Editable as="h1" className="text-4xl font-extrabold uppercase tracking-wide text-white" value={brand.name} />
          <Editable as="p" className="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-1" value={brand.tagline} />
        </div>
        <div className="space-y-6">
          {categories.map((cat, c) => (
            <div key={c}>
              <div className="inline-block bg-[#f59e0b] text-[#111] font-black text-sm px-4 py-1.5 rounded-md uppercase tracking-wider mb-4 shadow">{cat.name}</div>
              <div className="space-y-2.5">
                {cat.items.map((item, i) => (
                  <div key={item.uid} className="flex items-center text-sm font-bold text-slate-100 hover:text-amber-300 transition py-1">
                    {item.photo ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/80 mr-3 shrink-0 shadow">
                        <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0 text-amber-400 text-xs">🍛</div>
                    )}
                    <VegBadge dietary={item.dietary} />
                    <Editable className="tracking-wide uppercase truncate" value={item.name} onCommit={field(c, i, "name")} />
                    <span className="menu-leader" />
                    <Editable className="text-amber-400 font-extrabold shrink-0 pl-2 font-mono" value={formatPrice(item.price)} onCommit={price(c, i)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {showFooter && (
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            <p>* All dishes prepared fresh with pure ghee and authentic spices.</p>
          </div>
        )}
        <ShopStrip />
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 3: TAKEAWAY TRIFOLD (Hongkong Chinese)
  // ----------------------------------------------------
  if (template === "chinese") {
    return (
      <div id="captureBoardTarget" className="menu-board-container w-full trifold-chinese-bg p-6 rounded-2xl shadow-2xl relative">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 bg-[#faebd7] border-2 border-[#e0cda9] p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <img src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80" className="w-full h-20 object-cover rounded-lg shadow" alt="" />
                <img src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80" className="w-full h-20 object-cover rounded-lg shadow" alt="" />
              </div>
              <Editable as="h1" className="text-2xl font-black text-[#991b1b] font-['Volkhov'] leading-tight" value={brand.name} />
              <Editable as="p" className="text-xs text-[#78350f] font-bold mt-1" value="Food Menu" />
              <div className="mt-4 p-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[10px] text-[#991b1b] font-bold space-y-1">
                <div>BULK ORDER | PARTY ORDER</div>
                <div>TAKEAWAY | WEDDING | WINTER</div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2 bg-[#991b1b] text-white font-black text-sm rounded-lg shadow-lg uppercase tracking-wider">ORDER NOW</button>
              <div className="text-[10px] text-[#78350f] text-center font-bold space-y-0.5">
                <div>SAFE HOME DELIVERY</div>
                <div className="text-[#991b1b]">CONTACT : {s.menu.shop.phone.trim() || "+999 999 9999"}</div>
                <div>WWW.WEBSITE.ORG</div>
              </div>
            </div>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-5">
            {categories.map((cat, c) => (
              <div key={c} className="space-y-2">
                <Editable as="h3" className="text-base font-extrabold text-[#991b1b] font-['Volkhov'] border-b border-[#991b1b]/30 pb-0.5" value={cat.name} onCommit={catName(c)} />
                <div className="space-y-1 text-xs">
                  {cat.items.map((item, i) => (
                    <div key={item.uid} className="flex items-baseline justify-between">
                      <span className="truncate pr-1 text-[#3d2314] flex items-center">
                        <VegBadge dietary={item.dietary} />
                        <Editable value={item.name} onCommit={field(c, i, "name")} />
                      </span>
                      <span className="menu-leader" />
                      <Editable className="font-bold text-[#991b1b] shrink-0" value={formatPrice(item.price)} onCommit={price(c, i)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 bg-[#991b1b] text-white text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-2">
          <span>= VISIT US AT =</span>
          <Editable className="font-normal" value={s.menu.shop.address.trim() || "42, Street Down Town, City, Country"} />
        </div>
        <ShopStrip />
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 4: EDITORIAL BISTRO (Salads, Burgers, Sides)
  // ----------------------------------------------------
  if (template === "editorial") {
    return (
      <div id="captureBoardTarget" className="menu-board-container w-full editorial-bg p-10 rounded-2xl shadow-2xl relative font-serif">
        <div className="text-center pb-8 border-b border-[#e5ded5] mb-8">
          {showLogo && <Logo className="w-24 h-24 mx-auto mb-3" markup={logoMarkup} />}
          <Editable as="h1" className="text-4xl font-black uppercase text-[#2b2623] tracking-widest" value={brand.name} />
          <Editable as="p" className="text-xs text-[#78716c] font-sans font-semibold tracking-wider mt-1" value={brand.tagline} />
        </div>
        <div className="space-y-8 max-w-2xl mx-auto">
          {categories.map((cat, c) => (
            <div key={c} className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {cat.iconBadge && <span className="w-7 h-7 rounded-full bg-[#f5e6d3] text-sm flex items-center justify-center">{cat.iconBadge}</span>}
                <Editable as="h2" className="text-2xl font-bold underline text-[#2b2623] decoration-[#2b2623]/40 decoration-1 underline-offset-4" value={cat.name} onCommit={catName(c)} />
              </div>
              <div className="space-y-4">
                {cat.items.map((item, i) => (
                  <div key={item.uid} className="text-center">
                    <div className="flex items-baseline justify-center space-x-2 text-base font-bold text-[#2b2623]">
                      <VegBadge dietary={item.dietary} />
                      <Editable className="uppercase tracking-wide" value={item.name} onCommit={field(c, i, "name")} />
                      <Editable className="font-mono text-sm text-[#57534e]" value={formatPrice(item.price)} onCommit={price(c, i)} />
                    </div>
                    {showDesc && item.description && (
                      <Editable as="p" className="text-xs text-[#78716c] font-sans max-w-lg mx-auto mt-0.5 leading-relaxed" value={item.description} onCommit={field(c, i, "description")} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-[#e5ded5] text-center text-[10px] text-[#a8a29e] font-sans">
          Consumer Advisory: Consumption of undercooked meat, poultry, eggs, or seafood may increase the risk of food-borne illnesses.
        </div>
        <ShopStrip />
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 5/6/7: CLASSIC THEMES (Luxe, Chalkboard, TV)
  // ----------------------------------------------------
  const theme = {
    luxe: ["luxe-bg text-slate-100", "text-[#d4af37]", "text-[#d4af37] border-b border-[#d4af37]/40", "text-white", "text-slate-400", "text-[#d4af37]"],
    chalkboard: ["chalkboard-bg text-[#f5f5f5]", "text-[#fef08a]", "text-[#fef08a] border-b-2 border-dashed border-[#fef08a]/60", "text-white", "text-[#d4d4d4]", "text-[#fef08a]"],
    tv: ["tv-display-bg text-slate-100", "text-amber-400", "text-amber-400 border-b border-amber-500/30", "text-white font-bold", "text-slate-400", "text-amber-400 font-extrabold"]
  }[template] || [];
  const [themeContainerClass, headerTitleColor, catTitleColor, itemTitleColor, descColor, priceColor] =
    theme.length ? theme : ["luxe-bg text-slate-100", "text-[#d4af37]", "text-[#d4af37] border-b border-[#d4af37]/40", "text-white", "text-slate-400", "text-[#d4af37]"];
  const colGridClass = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns] || "grid-cols-1";

  return (
    <div id="captureBoardTarget" className={`menu-board-container w-full ${themeContainerClass} p-8 rounded-2xl shadow-2xl relative`}>
      <header className="flex flex-col items-center justify-center text-center pb-6 border-b border-white/10 mb-8">
        {showLogo && <Logo className="w-28 h-28 mb-3" markup={logoMarkup} />}
        <Editable as="h1" className={`text-4xl font-black uppercase ${headerTitleColor}`} value={brand.name} />
        <Editable as="p" className="text-xs font-semibold tracking-widest uppercase mt-1 opacity-80" value={brand.tagline} />
      </header>
      <div className={`grid ${colGridClass} gap-8`}>
        {categories.map((cat, c) => (
          <section key={c} className="space-y-4">
            <Editable as="h2" className={`text-lg font-bold uppercase tracking-wider ${catTitleColor}`} value={cat.name} onCommit={catName(c)} />
            <div className="space-y-3">
              {cat.items.map((item, i) => (
                <div key={item.uid}>
                  <div className={`flex items-baseline justify-between text-sm font-bold ${itemTitleColor}`}>
                    <span className="truncate pr-1 flex items-center">
                      <VegBadge dietary={item.dietary} />
                      <Editable value={item.name} onCommit={field(c, i, "name")} />
                    </span>
                    <span className="menu-leader" />
                    <Editable className={`${priceColor} pl-2 shrink-0 font-mono`} value={formatPrice(item.price)} onCommit={price(c, i)} />
                  </div>
                  {showDesc && item.description && <Editable as="p" className={`text-xs ${descColor} mt-0.5`} value={item.description} onCommit={field(c, i, "description")} />}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <ShopStrip />
    </div>
  );
}
