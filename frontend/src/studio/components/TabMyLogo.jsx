import { useState } from "react";
import { Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { MY_LOGO_DEFAULTS, buildCustomLogoSVG, whiteToTransparent, readImageFile, paletteFromImage, interpretStyleWords } from "../../shared/brand.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import { Svg } from "./ui.jsx";

// Live "what we understood" chips for reference notes / typed style
export function UnderstoodChips({ text, palette }) {
  const w = interpretStyleWords(text);
  if (!w.chips.length && !palette) return null;
  return (
    <div className="understood" aria-live="polite">
      <span className="understood-lab">We'll use:</span>
      {palette && <span className="chip chip-swatches" title="Colours from your picture">
        {[palette.primary, palette.bg, palette.accent].map((c, i) => <i key={i} style={{ background: c }} />)}colours from your picture</span>}
      {w.chips.map(c => <span key={c} className="chip">{c}</span>)}
    </div>
  );
}

function AskLogo() {
  const hasLogo = useStudio(s => s.hasLogo);
  const choose = useStudio(s => s.chooseHasLogo);
  const card = (id, v, Icon, title, sub) => (
    <button id={id} onClick={() => choose(v)} className={"my-choice" + (hasLogo === v ? " selected" : "")}>
      <span className="my-choice-icon"><Icon className="w-5 h-5" /></span>
      <span className="my-choice-title">{title}</span>
      <span className="my-choice-sub">{sub}</span>
    </button>
  );
  return (
    <div id="my-ask" className="ask3">
      {card("askYes", true, Upload, "Yes, I have a logo", "Upload it and adjust size, colours, shape and more.")}
      {card("askRef", "reference", ImageIcon, "I have a logo reference", "Upload a logo you like and type the features you want.")}
      {card("askNo", false, Sparkles, "No, create one for me", "Pick colours and a style, or describe it, and we create 5 logos.")}
    </div>
  );
}

// Shared drop-zone behaviour (click or drag a file)
function useDrop(onFile) {
  const [over, setOver] = useState(false);
  return [over, {
    onDragEnter: e => { e.preventDefault(); setOver(true); },
    onDragOver: e => { e.preventDefault(); setOver(true); },
    onDragLeave: e => { e.preventDefault(); setOver(false); },
    onDrop: e => { e.preventDefault(); e.stopPropagation(); setOver(false); onFile(e.dataTransfer && e.dataTransfer.files[0]); }
  }];
}

// "I have a logo reference": a picture they like + the features they want
function ReferenceLogo() {
  const ref = useStudio(s => s.reference);
  const setReference = useStudio(s => s.setReference);
  const setPalette = useStudio(s => s.setPalette);
  const paletteManual = useStudio(s => s.paletteManual);
  const [msg, setMsg] = useState("");
  const onFile = file => {
    setMsg("");
    readImageFile(file).then(({ dataUrl }) => {
      setReference({ image: dataUrl });
      return paletteFromImage(dataUrl).then(pal => {
        setReference({ palette: pal });
        if (pal && !paletteManual) setPalette(pal.primary, pal.bg, pal.accent, false);
      });
    }).catch(e => setMsg(e.message));
  };
  const [over, dropProps] = useDrop(onFile);
  return (
    <div id="my-reference" className="ref-grid">
      <label id="refDrop" htmlFor="refFile" {...dropProps} className={"ref-drop" + (over ? " over" : "") + (ref.image ? " has" : "")}>
        <input id="refFile" type="file" accept="image/*" className="hidden" onChange={e => { onFile(e.target.files && e.target.files[0]); e.target.value = ""; }} />
        {ref.image ? (
          <>
            <img src={ref.image} alt="Your logo reference" />
            <span className="ref-drop-note">Click to choose a different picture</span>
          </>
        ) : (
          <span className="ref-drop-empty">
            <ImageIcon className="w-7 h-7" aria-hidden="true" />
            <b>Upload a logo you like</b>
            <small>Click or drag a picture here. PNG, JPG, SVG or WebP, up to 10 MB.</small>
          </span>
        )}
      </label>
      <div className="ref-notes">
        <label htmlFor="refNotes" className="ms-lab">What do you want in your logo?</label>
        <textarea id="refNotes" rows={5} className="ms-field" value={ref.notes}
          placeholder="e.g. Round badge, gold and black, chef hat, elegant script font"
          onChange={e => setReference({ notes: e.target.value })} />
        <p className="ms-hint">Mention a shape, colours, a symbol and a feeling. You can fine-tune everything on the next screen.</p>
        <UnderstoodChips text={ref.notes} palette={ref.palette} />
        <p className="form-err" role="alert">{msg}</p>
      </div>
      <div className="ref-foot"><WizardFooter inline /></div>
    </div>
  );
}

function UploadLogo() {
  const myLogo = useStudio(s => s.myLogo);
  const setMyLogo = useStudio(s => s.setMyLogo);
  const setPalette = useStudio(s => s.setPalette);
  const [msg, setMsg] = useState("");

  // Read the file, keep it as PNG, and take the brand colours from it so the menu matches the logo
  const handleLogoFile = (file) => {
    setMsg("");
    if (!file) return;
    readImageFile(file).then(({ dataUrl, w, h }) => {
      setMyLogo({ ...MY_LOGO_DEFAULTS, original: dataUrl, dataUrl, w, h });
      paletteFromImage(dataUrl).then(pal => { if (pal) setPalette(pal.primary, pal.bg, pal.accent, false); });
    }).catch(e => setMsg(e.message));
  };
  const [over, dropProps] = useDrop(handleLogoFile);

  const has = !!(myLogo && myLogo.dataUrl);

  return (
    <div id="my-upload" className="max-w-xl mx-auto">
      <label id="myDrop" htmlFor="myLogoFile" {...dropProps} style={{ borderColor: over ? "#c2410c" : undefined }}
        className="studio-card block p-10 text-center cursor-pointer border-2 border-dashed border-[#d6d3cb] hover:border-[#c2410c] transition">
        <input id="myLogoFile" type="file" accept="image/*" className="hidden" onChange={e => handleLogoFile(e.target.files && e.target.files[0])} />
        {!has ? (
          <div id="myDropEmpty">
            <p className="text-base font-bold text-[#1c1917]">Click to choose your logo file</p>
            <p className="text-xs text-[#78716c] mt-1">or drag and drop it here. PNG, JPG, SVG or WebP, up to 10 MB.</p>
          </div>
        ) : (
          <div id="myDropLoaded">
            <div id="myThumb" className="w-40 h-40 mx-auto my-checker rounded-xl border border-[#e7e5e0] overflow-hidden">
              <img src={myLogo.original} alt="Your logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <p className="text-sm font-bold text-[#166534] mt-3">Logo loaded</p>
            <p className="text-xs text-[#78716c]">Click to choose a different file.</p>
          </div>
        )}
      </label>
      <p id="myUploadMsg" className="text-xs font-semibold text-red-600 text-center mt-3 h-4">{msg}</p>
      <WizardFooter inline />
    </div>
  );
}

function ModifyLogo() {
  const m = useStudio(s => s.myLogo);
  const brand = useStudio(s => s.brand);
  const update = useStudio(s => s.updateMyLogo);
  const reset = useStudio(s => s.resetMyLogo);
  if (!m) return null;

  const range = (id, key, min, max, label, out) => (
    <>
      <label className="my-lab" htmlFor={id}>{label} <output id={id + "Out"}>{out}</output></label>
      <input id={id} type="range" min={min} max={max} value={m[key]} onChange={e => update({ [key]: +e.target.value })} />
    </>
  );
  const check = (id, key, label) => (
    <label className="my-check"><input id={id} type="checkbox" checked={m[key]} onChange={e => update({ [key]: e.target.checked })} /> {label}</label>
  );
  const colour = (id, key) => <input id={id} type="color" value={m[key]} onChange={e => update({ [key]: e.target.value })} className="my-color" />;

  const onRemoveWhite = async (rw) => {
    update({ removeWhite: rw });
    update({ dataUrl: rw ? await whiteToTransparent(m.original) : m.original });
  };

  return (
    <div id="my-modify" className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
      <div className="lg:col-span-2">
        <div className="studio-card p-4 lg:sticky lg:top-24">
          <Svg id="myPreview" className="w-full aspect-square my-checker rounded-xl border border-[#e7e5e0] overflow-hidden" markup={buildCustomLogoSVG(m, brand)} />
          <button onClick={reset} className="mt-3 w-full text-xs font-semibold text-[#44403c] bg-white hover:bg-[#f5f4ef] border border-[#d6d3cb] rounded-xl py-2">Reset all changes</button>
        </div>
      </div>

      <div className="lg:col-span-3 studio-card p-5 space-y-5">
        <div>
          <p className="my-group">Size and position</p>
          <div className="my-grid">
            {range("myZoom", "zoom", 30, 200, "Zoom", m.zoom + "%")}
            {range("myRotate", "rotate", -180, 180, "Rotate", m.rotate + "°")}
            {range("myX", "x", -50, 50, "Move left / right", m.x)}
            {range("myY", "y", -50, 50, "Move up / down", m.y)}
          </div>
        </div>

        <div>
          <p className="my-group">Shape and border</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="my-lab" htmlFor="myShape">Crop shape</label>
              <select id="myShape" value={m.shape} onChange={e => update({ shape: e.target.value })} className="my-input">
                <option value="square">Square</option>
                <option value="rounded">Rounded square</option>
                <option value="circle">Circle</option>
              </select>
            </div>
            <div>
              <label className="my-lab" htmlFor="myBorderW">Border <output id="myBorderWOut">{m.borderW} px</output></label>
              <input id="myBorderW" type="range" min="0" max="20" value={m.borderW} onChange={e => update({ borderW: +e.target.value })} />
            </div>
            <div>
              <label className="my-lab" htmlFor="myBorderColor">Border colour</label>
              {colour("myBorderColor", "borderColor")}
            </div>
          </div>
        </div>

        <div>
          <p className="my-group">Colour</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="my-lab" htmlFor="myFilter">Colour effect</label>
              <select id="myFilter" value={m.filter} onChange={e => update({ filter: e.target.value })} className="my-input">
                <option value="none">Original</option>
                <option value="gray">Black and white</option>
                <option value="sepia">Sepia</option>
                <option value="vivid">Vivid</option>
                <option value="white">All white</option>
                <option value="black">All black</option>
              </select>
            </div>
            <div>
              <label className="my-lab" htmlFor="myBgColor">Background colour</label>
              {colour("myBgColor", "bg")}
            </div>
            <div className="flex flex-col justify-end gap-2">
              {check("myBgTransparent", "bgTransparent", "Transparent background")}
              <label className="my-check"><input id="myRemoveWhite" type="checkbox" checked={m.removeWhite} onChange={e => onRemoveWhite(e.target.checked)} /> Remove white from logo</label>
            </div>
          </div>
        </div>

        <div>
          <p className="my-group">Text under the logo</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            {check("myShowName", "showName", "Restaurant name")}
            {check("myShowTagline", "showTagline", "Tagline")}
            <div>
              <label className="my-lab" htmlFor="myTextColor">Text colour</label>
              {colour("myTextColor", "textColor")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "Do you already have a logo?" ask / upload / modify
export default function TabMyLogo() {
  const step = useStudio(s => s.step);
  const def = STEP_DEFS[step];
  return (
    <div id="tab-mylogo" className="animate-fade-in">
      <div className="page-head">
        <Eyebrow />
        <h1 id="myTitle" className="display page-title">{def.title}</h1>
        <p id="mySubtitle" className="q-sub">{def.sub}</p>
      </div>
      {def.sub2 === "ask" && <AskLogo />}
      {def.sub2 === "upload" && <UploadLogo />}
      {def.sub2 === "reference" && <ReferenceLogo />}
      {def.sub2 === "modify" && <ModifyLogo />}
    </div>
  );
}
