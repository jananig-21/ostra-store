import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

// once the app has run for a while, allow one more automatic reload after a future deploy
// (clearing it immediately could loop if a chunk were genuinely missing)
setTimeout(() => {
  try {
    sessionStorage.removeItem("ostra.chunkReload");
  } catch {
    /* ignore */
  }
}, 10_000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
