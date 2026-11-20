import { useStudio, cleanMenu } from "../store.js";
import { fileBase, menuToCSV, saveBlobAs } from "../../shared/files.js";

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
