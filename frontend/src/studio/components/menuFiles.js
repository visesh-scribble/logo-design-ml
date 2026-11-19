import { useEffect } from "react";
import { useStudio } from "../store.js";
import { readMenuFile } from "../../shared/files.js";

// Upload a menu (.xlsx, .csv, .json, .txt) from any file input on the studio
export async function handleMenuFile(file) {
  if (!file) return;
  try {
    const categories = await readMenuFile(file);
    if (categories) useStudio.getState().menuLoaded(categories);
  } catch (err) {
    alert(err.message);
  }
}

// Dropping a menu file anywhere on the page loads it
export function useMenuFileDrop() {
  useEffect(() => {
    const over = e => e.preventDefault();
    const drop = e => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleMenuFile(e.dataTransfer.files[0]);
    };
    window.addEventListener("dragover", over, false);
    window.addEventListener("drop", drop, false);
    return () => { window.removeEventListener("dragover", over); window.removeEventListener("drop", drop); };
  }, []);
}
