import { useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import { useStudio } from "../store.js";
import { STEP_DEFS } from "../steps.js";
import { MY_LOGO_DEFAULTS, buildCustomLogoSVG, whiteToTransparent } from "../../shared/brand.js";
import WizardFooter, { Eyebrow } from "./WizardFooter.jsx";
import { Svg } from "./ui.jsx";

function AskLogo() {
  const hasLogo = useStudio(s => s.hasLogo);
  const choose = useStudio(s => s.chooseHasLogo);
  return (
    <div id="my-ask" className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button id="askYes" onClick={() => choose(true)} className={"my-choice" + (hasLogo === true ? " selected" : "")}>
        <span className="my-choice-icon"><Upload className="w-5 h-5" /></span>
        <span className="my-choice-title">Yes, I have a logo</span>
        <span className="my-choice-sub">Upload it and adjust size, colours, shape and more.</span>
      </button>
      <button id="askNo" onClick={() => choose(false)} className={"my-choice" + (hasLogo === false ? " selected" : "")}>
        <span className="my-choice-icon"><Sparkles className="w-5 h-5" /></span>
        <span className="my-choice-title">No, create one for me</span>
        <span className="my-choice-sub">Pick a cuisine and colours, then explore 7 design styles.</span>
      </button>
    </div>
  );
}

function UploadLogo() {
  const myLogo = useStudio(s => s.myLogo);
  const setMyLogo = useStudio(s => s.setMyLogo);
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState(false);

  const handleLogoFile = (file) => {
    setMsg("");
    if (!file) return;
    if (!/^image\//.test(file.type)) { setMsg("That file is not an image. Choose a PNG, JPG, SVG or WebP."); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg("That file is larger than 10 MB. Choose a smaller one."); return; }
    const fr = new FileReader();
    fr.onerror = () => setMsg("Could not read that file. Try another one.");
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => setMsg("Could not open that image. Try another file.");
      img.onload = () => {
        let w = img.naturalWidth || 512, h = img.naturalHeight || 512;
        const sc = Math.min(1, 1024 / Math.max(w, h));
        w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const png = c.toDataURL("image/png");
        setMyLogo({ ...MY_LOGO_DEFAULTS, original: png, dataUrl: png, w, h });
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  };

  const dropProps = {
    onDragEnter: e => { e.preventDefault(); setOver(true); },
    onDragOver: e => { e.preventDefault(); setOver(true); },
    onDragLeave: e => { e.preventDefault(); setOver(false); },
    onDrop: e => { e.preventDefault(); e.stopPropagation(); setOver(false); handleLogoFile(e.dataTransfer && e.dataTransfer.files[0]); }
  };
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
      {def.sub2 === "modify" && <ModifyLogo />}
    </div>
  );
}
