import { LayoutList, SkipForward, Upload, BookOpen } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import { handleMenuFile } from "./menuFiles.js";

const img = (id) => ({ backgroundImage: `url(https://images.unsplash.com/${id}?w=600&q=70&auto=format&fit=crop)` });

// The sample menus to start from (also shown in the "Menu card samples" popup)
export const SAMPLES = [
  ["veg_starters", "photo-1601050690597-df0568f70950", "Veg Starters", "8 crispy, cheesy vegetarian starters."],
  ["indian_main", "photo-1546833999-b9f581a1996d", "Indian Main Course", "Curries, breads and rice with a photo row."],
  ["hongkong_chinese", "photo-1563245372-f21724e3856d", "Hong Kong Chinese", "Noodles, dim sum and wok dishes."],
  ["editorial_bistro", "photo-1512621776951-a57141f2eefd", "Salads & Burgers", "A clean, minimalist bistro menu."]
];

function UploadMenu() {
  const uploaded = useStudio(s => s.menuUploaded);
  const cats = useStudio(s => s.menu.categories);
  const openModal = useStudio(s => s.openModal);
  const items = cats.reduce((n, c) => n + (c.items || []).length, 0);
  return (
    <div id="ma-upload" className="max-w-xl mx-auto">
      <label htmlFor="maMenuFile" className="studio-card block p-10 text-center cursor-pointer border-2 border-dashed border-[#d6d3cb] hover:border-[#c2410c] transition">
        <input id="maMenuFile" type="file" accept=".csv,.xlsx,.xls,.json,.txt" className="hidden"
          onChange={e => { handleMenuFile(e.target.files[0]); e.target.value = ""; }} />
        {!uploaded ? (
          <div id="maDropEmpty">
            <p className="text-base font-bold text-[#1c1917]">Click to choose your menu file</p>
            <p className="text-xs text-[#78716c] mt-1">or drag and drop it here. Excel (.xlsx), CSV, JSON or text.</p>
          </div>
        ) : (
          <div id="maDropLoaded">
            <p className="text-sm font-bold text-[#166534]">Menu loaded</p>
            <p id="maLoadedInfo" className="text-xs text-[#78716c] mt-1">{items} dishes in {cats.length}{cats.length === 1 ? " section" : " sections"}</p>
            <p className="text-xs text-[#78716c]">Click to choose a different file.</p>
          </div>
        )}
      </label>
      <p className="text-center text-xs text-[#78716c] mt-4">No file? <button type="button" onClick={() => openModal("rawText")} className="font-bold text-[#c2410c] underline">Paste your menu as text</button></p>
      <WizardFooter inline />
    </div>
  );
}

// MENU QUESTIONS: want menu / have menu / upload / sample
export default function TabMenuAsk() {
  const s = useStudio();
  const def = STEP_DEFS[s.step];
  return (
    <div id="tab-menuask" className="animate-fade-in">
      <div className="page-head">
        <Eyebrow />
        <h1 id="maTitle" className="display page-title">{def.title}</h1>
        <p id="maSubtitle" className="q-sub">{def.sub}</p>
      </div>

      {def.sub2 === "want" && (
        <div id="ma-want" className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button id="wantYes" onClick={() => s.chooseWantMenu(true)} className={"my-choice" + (s.wantMenu === true ? " selected" : "")}>
            <span className="my-choice-img" style={img("photo-1504674900247-0877df9cc836")} />
            <span className="my-choice-icon"><LayoutList className="w-5 h-5" /></span>
            <span className="my-choice-title">Yes, make a menu board</span>
            <span className="my-choice-sub">Design a print or TV menu with your new logo.</span>
          </button>
          <button id="wantNo" onClick={() => s.chooseWantMenu(false)} className={"my-choice" + (s.wantMenu === false ? " selected" : "")}>
            <span className="my-choice-img" style={img("photo-1552566626-52f8b828add9")} />
            <span className="my-choice-icon"><SkipForward className="w-5 h-5" /></span>
            <span className="my-choice-title">No, skip the menu</span>
            <span className="my-choice-sub">Go straight to seeing your logo in the real world.</span>
          </button>
        </div>
      )}

      {def.sub2 === "has" && (
        <div id="ma-has" className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button id="hasMenuYes" onClick={() => s.chooseHasMenu(true)} className={"my-choice" + (s.hasMenu === true ? " selected" : "")}>
            <span className="my-choice-icon"><Upload className="w-5 h-5" /></span>
            <span className="my-choice-title">Yes, I have a menu</span>
            <span className="my-choice-sub">Upload a spreadsheet (Excel, CSV, JSON) or paste your menu text.</span>
          </button>
          <button id="hasMenuNo" onClick={() => s.chooseHasMenu(false)} className={"my-choice" + (s.hasMenu === false ? " selected" : "")}>
            <span className="my-choice-icon"><BookOpen className="w-5 h-5" /></span>
            <span className="my-choice-title">No, start from a sample</span>
            <span className="my-choice-sub">Pick a ready-made menu and edit the dishes and prices later.</span>
          </button>
        </div>
      )}

      {def.sub2 === "upload" && <UploadMenu />}

      {def.sub2 === "sample" && (
        <div id="ma-sample" className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLES.map(([key, photo, title, sub]) => (
            <button key={key} onClick={() => s.chooseSampleMenu(key)} className="my-choice">
              <span className="my-choice-img" style={img(photo)} />
              <span className="my-choice-title">{title}</span>
              <span className="my-choice-sub">{sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
