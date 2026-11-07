import { useEffect, useState } from "react";
import { load, save } from "../lib/storage";

export type Theme = "light" | "dark";
const KEY = "ostra.theme.v1";

function systemTheme(): Theme {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => load<Theme>(KEY, systemTheme(), (v): v is Theme => v === "light" || v === "dark"));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save(KEY, theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}
