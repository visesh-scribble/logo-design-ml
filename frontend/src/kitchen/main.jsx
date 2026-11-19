import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./kitchen.css";
import Orders from "./Orders.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><Orders /></StrictMode>);
