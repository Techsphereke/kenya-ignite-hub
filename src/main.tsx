import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource-variable/sora";
import "@fontsource-variable/manrope";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);

  const openingLoader = document.getElementById("opening-loader");
  if (openingLoader) {
    // Hide as soon as the first frame of the app is painted, so the site
    // content shows immediately instead of waiting on a fixed delay.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        openingLoader.classList.add("is-leaving");
        window.setTimeout(() => openingLoader.remove(), 320);
      });
    });
  }
}
