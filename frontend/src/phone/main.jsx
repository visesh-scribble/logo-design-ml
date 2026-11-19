import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./phone.css";
import PhoneMenu from "./PhoneMenu.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><PhoneMenu /></StrictMode>);
