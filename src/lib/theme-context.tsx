"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Mode = Theme | "system";

interface ThemeContextType {
  /** Thème réellement appliqué (résolu depuis mode "system" si besoin). */
  theme: Theme;
  /** Préférence choisie par l'utilisateur — miroir de mobile/src/contexts/theme-context.tsx. */
  mode: Mode;
  setMode: (m: Mode) => void;
  /** Conservés pour compatibilité avec l'admin existant (bascule simple clair/sombre). */
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "zando_admin_theme";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: Mode): Theme {
  return mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;
}

function applyToDom(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Mode | null;
    const initialMode: Mode = saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
    setModeState(initialMode);
    const resolved = resolve(initialMode);
    setThemeState(resolved);
    applyToDom(resolved);
  }, []);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = resolve("system");
      setThemeState(resolved);
      applyToDom(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(THEME_KEY, m);
    const resolved = resolve(m);
    setThemeState(resolved);
    applyToDom(resolved);
  };

  const setTheme = (t: Theme) => setMode(t);
  const toggleTheme = () => setMode(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return ctx;
}
