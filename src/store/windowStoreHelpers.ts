import { DesktopShortcutItem, DesktopWidgetConfig, WindowState } from './windowStoreTypes';

export const DEFAULT_PINNED_APPS = ["japanese-quiz", "lovely-ever", "about", "settings", "file-manager"];

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

export const getInitialDesktopWidgets = (): DesktopWidgetConfig[] => DEFAULT_DESKTOP_WIDGETS;
export const getInitialPinnedApps = (): string[] => DEFAULT_PINNED_APPS;
export const getInitialDesktopShortcuts = (): DesktopShortcutItem[] => DEFAULT_DESKTOP_SHORTCUTS;
export const getInitialWallpaper = (): string => "fractal-cyber";
export const getInitialSoundEnabled = (): boolean => true;
export const getInitialMediaVolume = (): number => 80;
export const getInitialWindows = (): WindowState[] => [];
export const getInitialReducedMotion = (): boolean => false;
export const getInitialTextScale = (): 'small' | 'normal' | 'large' => "normal";
export const getInitialHighContrast = (): boolean => false;
export const getInitialClockFormat = (): '12h' | '24h' => "12h";
export const getInitialActiveWindowId = (): string | null => null;
export const getInitialHighestZIndex = (): number => 20;

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
