import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* basename: en GitHub Pages la app vive bajo /stokatienda/ (ver `base` en vite.config.ts) — sin
        esto, React Router compara sus rutas contra la ruta completa del navegador y nunca hace match. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
