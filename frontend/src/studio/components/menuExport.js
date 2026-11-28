import { useStudio, cleanMenu } from "../store.js";
import { fileBase, menuToCSV, saveBlobAs } from "../../shared/files.js";
import { getMe } from "../../shared/auth.js";

// High-res PNG of the board (2x). html2canvas is only downloaded the first time someone exports.
export async function exportMenuPNG() {
  if (!document.getElementById("captureBoardTarget")) return;
  // Show the board at its true size while the picture is taken (the on-screen fit/zoom stands down)
  useStudio.setState({ boardExporting: true });
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  try {
    const target = document.getElementById("captureBoardTarget");
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: null, logging: false, windowWidth: Math.max(window.innerWidth, 1280) });
    const a = document.createElement("a");
    a.download = `${fileBase(useStudio.getState().brand.name)}_menu_board.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  } catch (err) {
    alert("Could not create the image: " + err.message);
  } finally {
    useStudio.setState({ boardExporting: false });
  }
}

export function exportMenuCSV() {
  const s = useStudio.getState();
  const csv = menuToCSV(cleanMenu(s.menu).categories);
  saveBlobAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${fileBase(s.brand.name)}_menu.csv`);
}

// Publishes the menu (owner must be logged in) and resolves with the phone-menu link.
// Not logged in -> error with code "AUTH_REQUIRED".
export async function publishMenu(brand, menu) {
  const r = await fetch("/api/publish-menu", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand, menu: cleanMenu(menu) }) });
  const res = await r.json().catch(() => ({}));
  if (r.status === 401) { const e = new Error("Please log in to publish your menu."); e.code = "AUTH_REQUIRED"; useStudio.setState({ owner: null }); throw e; }
  if (!res.success) throw new Error(res.error || "Publish failed");
  getMe().then(me => { if (me) useStudio.setState({ owner: me }); });   // refresh "my restaurants"
  return res.url;
}

export function printMenu() { window.print(); }

export function toggleFullScreenBoard() {
  const target = document.getElementById("captureBoardTarget");
  if (!target) return;
  if (!document.fullscreenElement) {
    target.requestFullscreen ? target.requestFullscreen() : target.webkitRequestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
