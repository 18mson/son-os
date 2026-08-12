import { DesktopShortcutItem, DesktopWidgetConfig, WindowState } from './windowStoreTypes';

export const DEFAULT_PINNED_APPS = ["app-store", "japanese-quiz", "lovely-ever", "about", "settings"];

export const DEFAULT_DESKTOP_SHORTCUTS: DesktopShortcutItem[] = [
  { id: "ds-japanese-quiz", appId: "japanese-quiz", x: 28, y: 28 },
  { id: "ds-lovely-ever", appId: "lovely-ever", x: 28, y: 138 },
  { id: "ds-about", appId: "about", x: 28, y: 248 },
  { id: "ds-terminal", appId: "terminal", x: 28, y: 358 },
];

export const DEFAULT_DESKTOP_WIDGETS: DesktopWidgetConfig[] = [
  { id: "w-clock-def", type: "clock" },
  { id: "w-weather-def", type: "weather" },
];

export const getInitialDesktopWidgets = (): DesktopWidgetConfig[] => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("sonos_desktop_widgets");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return DEFAULT_DESKTOP_WIDGETS;
};

export const getInitialPinnedApps = (): string[] => {
  if (typeof window === "undefined") return DEFAULT_PINNED_APPS;
  try {
    const saved = localStorage.getItem("sonos_pinned_apps");
    const parsed = saved ? JSON.parse(saved) : DEFAULT_PINNED_APPS;
    return parsed.includes("app-store") ? parsed : ["app-store", ...parsed];
  } catch {
    return DEFAULT_PINNED_APPS;
  }
};

export const getInitialDesktopShortcuts = (): DesktopShortcutItem[] => {
  if (typeof window === "undefined") return DEFAULT_DESKTOP_SHORTCUTS;
  try {
    const saved = localStorage.getItem("sonos_desktop_shortcuts");
    return saved ? JSON.parse(saved) : DEFAULT_DESKTOP_SHORTCUTS;
  } catch {
    return DEFAULT_DESKTOP_SHORTCUTS;
  }
};

export const getInitialWallpaper = (): string => {
  if (typeof window === "undefined") return "default";
  try {
    const saved = localStorage.getItem("sonos_wallpaper");
    return saved || "default";
  } catch {
    return "default";
  }
};

export const getInitialSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const saved = localStorage.getItem("sonos_sound_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
};

export const getInitialMediaVolume = (): number => {
  if (typeof window === "undefined") return 0.8;
  try {
    const saved = localStorage.getItem("sonos_media_volume");
    return saved !== null ? Number(saved) : 0.8;
  } catch {
    return 0.8;
  }
};

export const getInitialWindows = (): WindowState[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("sonos_windows");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getInitialReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("sonos_reduced_motion");
    return saved !== null ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

export const getInitialTextScale = (): 'small' | 'normal' | 'large' => {
  if (typeof window === "undefined") return "normal";
  try {
    const saved = localStorage.getItem("sonos_text_scale");
    if (saved === "small" || saved === "normal" || saved === "large") {
      return saved;
    }
    return "normal";
  } catch {
    return "normal";
  }
};

export const getInitialHighContrast = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("sonos_high_contrast");
    return saved !== null ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

export const getInitialClockFormat = (): '12h' | '24h' => {
  if (typeof window === "undefined") return "12h";
  try {
    const saved = localStorage.getItem("sonos_clock_format");
    if (saved === "12h" || saved === "24h") {
      return saved;
    }
    return "12h";
  } catch {
    return "12h";
  }
};

export const getInitialActiveWindowId = (initialWindows: WindowState[]): string | null => {
  if (typeof window === "undefined" || initialWindows.length === 0) return null;
  try {
    const saved = localStorage.getItem("sonos_active_window_id");
    if (saved && initialWindows.some((w) => w.id === saved)) return saved;
    const active = initialWindows.filter((w) => !w.isMinimized);
    if (active.length > 0) {
      return active.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev)).id;
    }
  } catch {
    // fallback
  }
  return null;
};

export const getInitialHighestZIndex = (initialWindows: WindowState[]): number => {
  if (initialWindows.length === 0) return 100;
  return Math.max(100, ...initialWindows.map((w) => w.zIndex || 100));
};

export const saveWindowsSession = (windows: WindowState[], activeId: string | null) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sonos_windows", JSON.stringify(windows));
    if (activeId) {
      localStorage.setItem("sonos_active_window_id", activeId);
    } else {
      localStorage.removeItem("sonos_active_window_id");
    }
  } catch {
    // ignore
  }
};
