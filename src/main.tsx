import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);

  const openingLoader = document.getElementById("opening-loader");
  if (openingLoader) {
    window.setTimeout(() => {
      openingLoader.classList.add("is-leaving");
      window.setTimeout(() => openingLoader.remove(), 420);
    }, 700);
  }
}
