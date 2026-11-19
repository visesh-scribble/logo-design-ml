import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";     // the studio's design (unchanged from the original styles.css)
import "./tailwind.css";   // Tailwind, compiled at build time instead of the CDN script
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
