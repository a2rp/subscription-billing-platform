import { createRoot } from "react-dom/client";
import { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/overlayscrollbars.css";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

OverlayScrollbars(document.body, {
    scrollbars: {
        theme: "os-theme-ledgerline",
        autoHide: "move",
        autoHideSuspend: false,
    },
});

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
    </BrowserRouter>,
);
