import { useStudio, cleanMenu } from "../store.js";
import { fileBase, menuToCSV, saveBlobAs } from "../../shared/files.js";

// High-res PNG of the board (2x). html2canvas is only downloaded the first time someone exports.
export async function exportMenuPNG() {
  const target = document.getElementById("captureBoardTarget");
  if (!target) return;
  const zoomBox = document.getElementById("menuZoom");
  const prevZoom = zoomBox ? zoomBox.style.zoom : "";
  if (zoomBox) zoomBox.style.zoom = 1;               // export at true size, not the on-screen zoom
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
    const a = document.createElement("a");
    a.download = `${fileBase(useStudio.getState().brand.name)}_menu_board.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  } catch (err) {
    alert("Could not create the image: " + err.message);
  } finally {
    if (zoomBox) zoomBox.style.zoom = prevZoom;
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
