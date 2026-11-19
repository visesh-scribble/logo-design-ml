import { useEffect, useRef, useState } from "react";
import { FileText, X, Edit3, Sparkles, Plus, QrCode } from "lucide-react";
import { useStudio, cleanMenu } from "../store.js";
import { parseRawTextLocally, qrDataUrl, downloadQrCard, fileBase } from "../../shared/files.js";

function ModalShell({ id, maxW, extra = "", children }) {
  const close = useStudio(s => s.closeModal);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);
  return (
    <div id={id} className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className={`bg-white border border-[#e7e5e0] ${maxW} w-full rounded-2xl p-6 shadow-2xl ${extra}`}>{children}</div>
    </div>
  );
}

function ModalHead({ Icon, title }) {
  const close = useStudio(s => s.closeModal);
  return (
    <div className="flex items-center justify-between border-b border-[#f0eee6] pb-3">
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-[#b45309]" />
        <h3 className="font-serif text-lg font-bold text-[#1c1917]">{title}</h3>
      </div>
      <button onClick={close} className="text-[#78716c] hover:text-[#1c1917] p-1 rounded-lg" aria-label="Close"><X className="w-5 h-5" /></button>
    </div>
  );
}

const EXAMPLE_TEXT = `[Starters]
Crispy Cheese Corn Balls - Crunchy outside, cheesy inside - Rs. 160
Tandoori Mushroom Tikka - Smoky juicy full of flavor - Rs. 180
Crispy Honey Chilli Potatoes - Sweet and spicy - Rs. 150

[Main Course]
Dal Tadka - Yellow lentils with cumin garlic tadka - Rs. 59
Kadhai Paneer - Cottage cheese tossed with bell peppers - Rs. 115
Tawa Roti Butter - Fresh handmade flatbread - Rs. 10`;

// MODAL: PASTE RAW MENU TEXT
export function RawTextModal() {
  const close = useStudio(s => s.closeModal);
  const menuLoaded = useStudio(s => s.menuLoaded);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    let categories;
    try {
      const res = await fetch("/api/parse-text", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) });
      const data = await res.json();
      if (!(data.success && data.menu)) { setBusy(false); return; }
      categories = data.menu.categories;
    } catch {
      categories = parseRawTextLocally(t);   // server not reachable: sort it in the browser
    }
    menuLoaded(categories);
    close();
  };

  return (
    <ModalShell id="rawTextModal" maxW="max-w-2xl" extra="space-y-4">
      <ModalHead Icon={FileText} title="Paste or Type Menu" />
      <p className="text-xs text-[#78716c]">Paste your unformatted menu text below. Sections, dishes, descriptions, and prices are automatically organized.</p>
      <textarea id="rawMenuTextArea" rows={10} autoFocus value={text} onChange={e => setText(e.target.value)}
        className="w-full bg-[#fbfaf7] border border-[#d6d3cb] rounded-xl p-3 text-xs font-mono text-[#1c1917] focus:border-[#c2410c] focus:outline-none"
        placeholder={"[Starters]\nCrispy Cheese Corn Balls - Crunchy outside, cheesy inside - Rs. 160\nTandoori Mushroom Tikka - Smoky juicy full of flavor - Rs. 180\n\n[Main Course]\nDal Tadka - Yellow lentils with cumin garlic tadka - Rs. 59\nPaneer Butter Masala - Rich creamy tomato gravy - Rs. 115\nTawa Roti Butter - Fresh handmade flatbread - Rs. 10"} />
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setText(EXAMPLE_TEXT)} className="text-xs text-[#b45309] font-bold hover:underline">Insert Sample Menu Text</button>
        <div className="flex space-x-2">
          <button onClick={close} className="px-4 py-2 bg-white hover:bg-[#f5f4ef] text-[#44403c] border border-[#d6d3cb] rounded-xl text-xs font-semibold">Cancel</button>
          <button onClick={submit} disabled={busy} className="px-5 py-2 bg-[#1c1917] hover:bg-[#292524] text-white font-bold rounded-xl text-xs shadow-sm">Organize &amp; Generate</button>
        </div>
      </div>
    </ModalShell>
  );
}

// MODAL: MANAGE ITEMS & PHOTOS
export function ItemEditorModal() {
  const s = useStudio();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const line = "bg-transparent border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]";

  // ML DIETARY TAGGER: a Naive Bayes model on the server (ml.py) reads each dish and suggests tags.
  const autoTagWithAI = async () => {
    setBusy(true); setStatus("Reading your dishes…");
    try {
      const r = await fetch("/api/ml/tag-menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categories: cleanMenu(s.menu).categories }) });
      const res = await r.json();
      if (!res.success) throw new Error(res.error);
      const { dishes, tags } = s.applyAiTags(res.predictions);
      setStatus(tags ? `✨ Added ${tags} tag${tags > 1 ? "s" : ""} to ${dishes} dish${dishes > 1 ? "es" : ""}. Check them below; you can edit any tag.`
                     : "✨ Nothing to add: every dish already has the tags the model is confident about.");
    } catch (e) {
      setStatus("AI tagging failed: " + e.message);
    } finally { setBusy(false); }
  };
  const addSection = () => {
    const name = prompt("Enter new section name (e.g. Starters, Main Course):");
    if (name) s.addCategory(name);
  };

  return (
    <ModalShell id="itemEditorModal" maxW="max-w-5xl" extra="flex flex-col max-h-[90vh]">
      <ModalHead Icon={Edit3} title="Edit Menu Items & Photos" />
      <div className="flex items-center justify-between my-3">
        <p className="text-xs text-[#78716c]">Edit dish names, prices, descriptions, recipe steps, and custom photo URLs.
          <span id="aiTagStatus" className="block text-[#15803d] font-semibold">{status}</span>
        </p>
        <div className="flex items-center gap-2">
          <button id="aiTagBtn" onClick={autoTagWithAI} disabled={busy} title="A machine-learning model reads each dish and suggests Veg / Non-Veg, Vegan, Gluten-Free and Spicy tags"
            className="bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /><span>Auto-tag with AI</span>
          </button>
          <button onClick={addSection} className="bg-[#1c1917] hover:bg-[#292524] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm">
            <Plus className="w-3.5 h-3.5" /><span>Add Section</span>
          </button>
        </div>
      </div>

      <div id="itemsEditorList" className="flex-1 overflow-y-auto space-y-4 pr-1">
        {s.menu.categories.map((cat, c) => (
          <div key={c} className="bg-[#fbfaf7] border border-[#e7e5e0] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#f0eee6] pb-2">
              <input type="text" value={cat.name} onChange={e => s.updateCatName(c, e.target.value)} aria-label="Section name"
                className="bg-transparent font-bold text-[#1c1917] text-sm focus:outline-none border-b border-transparent focus:border-[#c2410c]" />
              <div className="flex space-x-2">
                <button onClick={() => s.addItem(c)} className="text-xs bg-white hover:bg-[#f5f4ef] text-[#44403c] font-semibold border border-[#d6d3cb] px-2.5 py-1 rounded-lg">+ Add Item</button>
                <button onClick={() => s.deleteCategory(c)} className="text-xs text-rose-600 hover:text-rose-700 px-1 font-semibold">Delete Section</button>
              </div>
            </div>
            <div className="space-y-3">
              {cat.items.map((item, i) => (
                <div key={item.uid} className="bg-white p-3 rounded-lg text-xs space-y-2 border border-[#e7e5e0]">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={item.name || ""} onChange={e => s.updateItem(c, i, "name", e.target.value)} placeholder="Dish Name" className={"col-span-4 font-bold text-[#1c1917] " + line} />
                    <input type="text" value={item.tagline || ""} onChange={e => s.updateItem(c, i, "tagline", e.target.value)} placeholder="Tagline (e.g. Cheesy & Crispy!)" className={"col-span-4 text-[#b45309] " + line} />
                    <input type="text" value={item.price ?? ""} onChange={e => s.updateItem(c, i, "price", e.target.value)} placeholder="Price" className={"col-span-3 text-[#1c1917] font-bold " + line} />
                    <button onClick={() => s.deleteItem(c, i)} className="col-span-1 text-[#78716c] hover:text-rose-600 text-center text-sm font-bold" aria-label="Delete dish">&times;</button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={item.photo || ""} onChange={e => s.updateItem(c, i, "photo", e.target.value)} placeholder="Photo URL (e.g. https://...)" className={"col-span-6 text-[#78716c] " + line} />
                    <input type="text" value={item.ingredients || item.description || ""} onChange={e => s.updateItem(c, i, "ingredients", e.target.value)} placeholder="Ingredients / Description" className={"col-span-6 text-[#78716c] " + line} />
                  </div>
                  <div className="flex items-center gap-2">
                    <TagsInput value={(item.dietary || []).join(", ")} onCommit={v => s.updateItemTags(c, i, v)} className={"flex-1 text-[#15803d] " + line} />
                    {s.aiAdded[item.uid] && (
                      <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] rounded-full px-2 py-0.5 whitespace-nowrap" title="Confidence of the tags the model added">✨ AI added: {s.aiAdded[item.uid]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#f0eee6] pt-3 mt-3 flex justify-end">
        <button onClick={s.closeModal} className="px-5 py-2 bg-[#1c1917] hover:bg-[#292524] text-white font-bold rounded-xl text-xs shadow-sm">Save &amp; Close</button>
      </div>
    </ModalShell>
  );
}

// Tags are typed as "Veg, Spicy": keep the raw text while typing, save the list when the field is left
function TagsInput({ value, onCommit, className }) {
  const [text, setText] = useState(value);
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(value); }, [value]);
  return (
    <input type="text" value={text} placeholder="Tags (e.g. Veg, Spicy, Gluten-Free)" className={className}
      onFocus={() => { focused.current = true; }}
      onChange={e => setText(e.target.value)}
      onBlur={() => { focused.current = false; if (text !== value) onCommit(text); }} />
  );
}

// QR CODE ONLINE MENU
// Publishes the current menu to the server, then shows a QR code that opens the phone menu.
export function QrMenuModal() {
  const brand = useStudio(s => s.brand);
  const menu = useStudio(s => s.menu);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!menu.categories.length) { setNote("Load or add a menu first, then open this again."); return; }
    setNote("Preparing your phone menu…");
    fetch("/api/publish-menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand, menu: cleanMenu(menu) }) })
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.error);
        setUrl(res.url);
        setNote("Demo mode: this link works only for phones on the same Wi-Fi as this computer, while the app is running. For real customers, put the menu online and paste that link above.");
      })
      .catch(err => setNote("Could not publish the menu: " + err.message + ". Restart the server (start.bat) and try again."));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    qrDataUrl(url, { width: 200, dark: "#1c1917" }).then(u => { if (alive) setQr(u); });
    return () => { alive = false; };
  }, [url]);

  const download = () => {
    if (!qr) { alert("No QR code to download yet."); return; }
    downloadQrCard({ qrUrl: qr, brand, title: "SCAN FOR MENU", lines: ["Point your phone camera at the code"], filename: `${fileBase(brand.name)}_menu_qr.png` });
  };

  return (
    <ModalShell id="qrMenuModal" maxW="max-w-md" extra="space-y-4 max-h-[95vh] overflow-y-auto">
      <ModalHead Icon={QrCode} title="QR Code Online Menu" />
      <p className="text-xs text-[#78716c]">Scan this with your phone camera. The menu opens on the phone.</p>
      <div id="qrCard" className="mx-auto w-64 rounded-2xl border border-[#e7e5e0] bg-white p-4 text-center">
        <p id="qrBrandName" className="font-serif font-bold text-base text-[#1c1917] mb-2">{brand.name}</p>
        <div id="qrCodeBox" className="flex justify-center">{qr && <img src={qr} alt="QR code for the phone menu" width={200} height={200} />}</div>
        <p className="text-[11px] font-bold tracking-widest text-[#b45309] mt-2">SCAN FOR MENU</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-[#44403c] mb-1.5" htmlFor="qrUrlInput">Link inside the QR code</label>
        <input id="qrUrlInput" type="text" value={url} onChange={e => setUrl(e.target.value)}
          className="w-full bg-[#fbfaf7] border border-[#d6d3cb] text-[#1c1917] rounded-xl px-3 py-2 text-xs" placeholder="https://..." />
        <p className="text-[11px] text-[#a8a29e] mt-1">Already have an online menu (website, Zomato, Swiggy)? Paste that link here instead.</p>
      </div>
      <p id="qrNote" className="text-[11px] text-[#92400e] bg-amber-50 border border-amber-200 rounded-lg p-2">{note}</p>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#f0eee6] pt-3">
        <button onClick={() => window.open("/orders.html", "_blank")} className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded-xl text-xs shadow-sm">Kitchen Orders</button>
        <button onClick={() => window.open(url, "_blank")} className="px-4 py-2 bg-white border border-[#d6d3cb] hover:bg-[#f5f4ef] text-[#1c1917] font-semibold rounded-xl text-xs">Open Link</button>
        <button onClick={download} className="px-4 py-2 bg-[#1c1917] hover:bg-[#292524] text-white font-bold rounded-xl text-xs shadow-sm">Download QR (PNG)</button>
      </div>
    </ModalShell>
  );
}
