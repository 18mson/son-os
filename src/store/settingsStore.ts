import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "auto";
export type ResolvedTheme = "dark" | "light";
export type ClockFormat = "12h" | "24h";
export type TextScale = "small" | "normal" | "large";
export type Language = "en" | "id" | string;

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
};

export const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === "auto") {
    return getSystemTheme();
  }
  return mode;
};

export interface SettingsState {
  language: Language;
  themeMode: ThemeMode;
  theme: ResolvedTheme;
  soundEnabled: boolean;
  volume: number; // 0-100
  reducedMotion: boolean;
  clockFormat: ClockFormat;
  textScale: TextScale;
  brightness: number; // 0-100 (100 = full brightness)

  // Actions
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleTheme: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  toggleReducedMotion: () => void;
  setClockFormat: (format: ClockFormat) => void;
  setTextScale: (scale: TextScale) => void;
  setBrightness: (brightness: number) => void;
  resetToDefault: () => void;
}

const DEFAULT_SETTINGS = {
  language: "en" as Language,
  themeMode: "auto" as ThemeMode,
  theme: "dark" as ResolvedTheme,
  soundEnabled: true,
  volume: 70,
  reducedMotion: false,
  clockFormat: "12h" as ClockFormat,
  textScale: "normal" as TextScale,
  brightness: 100,
};

// Apply theme-related DOM changes
export const applyThemeDOM = (resolved: ResolvedTheme, mode: ThemeMode = "auto") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-theme-mode", mode);
  if (resolved === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
};

// Apply only text scale DOM changes
export const applyTextScaleDOM = (scale: TextScale) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-text-scale", scale);
};

// Apply both — used on initial hydration
const applyDOMSettings = (themeMode: ThemeMode, scale: TextScale) => {
  const resolved = resolveTheme(themeMode);
  applyThemeDOM(resolved, themeMode);
  applyTextScaleDOM(scale);
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setLanguage: (language) => set({ language }),

      setTheme: (mode: ThemeMode) => {
        const resolved = resolveTheme(mode);
        applyThemeDOM(resolved, mode);
        set({ themeMode: mode, theme: resolved });
      },

      setThemeMode: (mode: ThemeMode) => {
        const resolved = resolveTheme(mode);
        applyThemeDOM(resolved, mode);
        set({ themeMode: mode, theme: resolved });
      },

      toggleTheme: () => {
        const current = get().themeMode;
        // Cycle: dark -> light -> auto -> dark
        const next: ThemeMode = current === "dark" ? "light" : current === "light" ? "auto" : "dark";
        const resolved = resolveTheme(next);
        applyThemeDOM(resolved, next);
        set({ themeMode: next, theme: resolved });
      },

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),

      setReducedMotion: (reducedMotion) => set({ reducedMotion }),

      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      setClockFormat: (clockFormat) => set({ clockFormat }),

      setTextScale: (textScale) => {
        applyTextScaleDOM(textScale);
        set({ textScale });
      },

      setBrightness: (brightness) => set({ brightness: Math.min(100, Math.max(0, brightness)) }),

      resetToDefault: () => {
        applyDOMSettings(DEFAULT_SETTINGS.themeMode, DEFAULT_SETTINGS.textScale);
        set({ ...DEFAULT_SETTINGS, theme: resolveTheme(DEFAULT_SETTINGS.themeMode) });
      },
    }),
    {
      name: "sonos_settings",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.themeMode || state.theme || "auto");
          applyThemeDOM(resolved, state.themeMode || "auto");
          applyTextScaleDOM(state.textScale);
        }
      },
    }
  )
);
