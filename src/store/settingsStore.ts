import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
export type ClockFormat = "12h" | "24h";
export type TextScale = "small" | "normal" | "large";
export type Language = "en" | "id" | string;

export interface SettingsState {
  language: Language;
  theme: ThemeMode;
  soundEnabled: boolean;
  volume: number; // 0-100
  reducedMotion: boolean;
  clockFormat: ClockFormat;
  textScale: TextScale;
  brightness: number; // 0-100 (100 = full brightness)

  // Actions
  setLanguage: (language: Language) => void;
  setTheme: (theme: ThemeMode) => void;
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
  theme: "dark" as ThemeMode,
  soundEnabled: true,
  volume: 70,
  reducedMotion: false,
  clockFormat: "12h" as ClockFormat,
  textScale: "normal" as TextScale,
  brightness: 100,
};

// Apply only theme-related DOM changes — does NOT touch text scale
const applyThemeDOM = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
  }
};

// Apply only text scale DOM changes — does NOT touch theme
const applyTextScaleDOM = (scale: TextScale) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-text-scale", scale);
};

// Apply both — used only on initial hydration
const applyDOMSettings = (theme: ThemeMode, scale: TextScale) => {
  applyThemeDOM(theme);
  applyTextScaleDOM(scale);
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => {
        // Only apply theme DOM — never touch text scale here
        applyThemeDOM(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const nextTheme = get().theme === "light" ? "dark" : "light";
        applyThemeDOM(nextTheme);
        set({ theme: nextTheme });
      },

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),

      setReducedMotion: (reducedMotion) => set({ reducedMotion }),

      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),

      setClockFormat: (clockFormat) => set({ clockFormat }),

      setTextScale: (textScale) => {
        // Only apply text scale DOM — never touch theme here
        applyTextScaleDOM(textScale);
        set({ textScale });
      },

      setBrightness: (brightness) => set({ brightness: Math.min(100, Math.max(0, brightness)) }),

      resetToDefault: () => {
        applyDOMSettings(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.textScale);
        set({ ...DEFAULT_SETTINGS });
      },
    }),
    {
      name: "sonos_settings",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On hydration, apply both together so initial page load is correct
          applyDOMSettings(state.theme, state.textScale);
        }
      },
    }
  )
);
