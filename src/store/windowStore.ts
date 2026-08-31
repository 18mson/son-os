import { create } from 'zustand';
import { playUiClickSound } from '@/utils/audio';
import { PLAYLIST } from '@/config/musicConfig';
import { WALLPAPERS_CYCLE_IDS } from '@/config/wallpaperConfig';
import { WindowStore } from './windowStoreTypes';
import {
  getInitialWindows,
  getInitialActiveWindowId,
  getInitialPinnedApps,
  getInitialDesktopShortcuts,
  getInitialDesktopWidgets,
} from './windowStoreHelpers';
import { createWindowActions } from './windowStoreWindowActions';
import { createDesktopActions } from './windowStoreDesktopActions';

export * from './windowStoreTypes';

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: getInitialWindows(),
  activeWindowId: getInitialActiveWindowId(),
  highestZIndex: 20,
  launcherOpen: false,
  quickSettingsOpen: false,
  widgetGalleryOpen: false,
  soundEnabled: true,
  wifiEnabled: true,
  bluetoothEnabled: false,
  nightLightEnabled: false,
  volume: 80,
  brightness: 100,
  themeMode: "auto",
  theme: "dark",
  wallpaper: "fractal-cyber",
  booted: false,
  notification: null,
  pinnedApps: getInitialPinnedApps(),
  desktopShortcuts: getInitialDesktopShortcuts(),
  desktopWidgets: getInitialDesktopWidgets(),

  // Accessibility & System Preferences
  language: "en",
  reducedMotion: false,
  textScale: "normal",
  highContrast: false,
  clockFormat: "12h",

  // Global Background Media Player State
  mediaTrackIndex: 0,
  mediaIsPlaying: false,
  mediaCurrentTime: 0,
  mediaDuration: 0,
  mediaVolume: 80,
  mediaIsMuted: false,
  mediaIsShuffle: false,
  mediaIsRepeat: false,
  customTracks: [],

  ...createWindowActions(set, get),
  ...createDesktopActions(set, get),

  toggleLauncher: () => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ launcherOpen: !state.launcherOpen }));
  },
  closeLauncher: () => set({ launcherOpen: false }),

  toggleQuickSettings: (open) => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ quickSettingsOpen: open !== undefined ? open : !state.quickSettingsOpen }));
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    if (next) playUiClickSound();
    set({ soundEnabled: next });
  },

  toggleWifi: () => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ wifiEnabled: !state.wifiEnabled }));
  },

  toggleBluetooth: () => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ bluetoothEnabled: !state.bluetoothEnabled }));
  },

  toggleNightLight: () => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ nightLightEnabled: !state.nightLightEnabled }));
  },

  setVolume: (volume: number) => set({ volume }),
  setBrightness: (brightness: number) => set({ brightness }),

  toggleTheme: () => {
    if (get().soundEnabled) playUiClickSound();
    const currentMode = get().themeMode;
    // Cycle: dark -> light -> auto -> dark
    const nextMode: 'dark' | 'light' | 'auto' =
      currentMode === 'dark' ? 'light' : currentMode === 'light' ? 'auto' : 'dark';

    get().setThemeMode(nextMode);
  },

  setTheme: (theme: 'dark' | 'light' | 'auto') => {
    get().setThemeMode(theme);
  },

  setThemeMode: (mode: 'dark' | 'light' | 'auto') => {
    if (get().soundEnabled) playUiClickSound();
    let resolved: 'dark' | 'light' = 'dark';
    if (mode === 'auto') {
      if (typeof window !== "undefined" && window.matchMedia) {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
    } else {
      resolved = mode;
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_theme_mode", mode);
        localStorage.setItem("sonos_theme", resolved);
      } catch {}
    }

    set({ themeMode: mode, theme: resolved });

    // Sync settingsStore & DOM
    import('./settingsStore').then(({ useSettingsStore, applyThemeDOM }) => {
      applyThemeDOM(resolved, mode);
      useSettingsStore.getState().setThemeMode(mode);
    });
  },

  cycleWallpaper: () => {
    if (get().soundEnabled) playUiClickSound();
    const wallpapers = WALLPAPERS_CYCLE_IDS;
    const currentIndex = wallpapers.indexOf(get().wallpaper);
    const next = currentIndex >= 0 ? wallpapers[(currentIndex + 1) % wallpapers.length] : wallpapers[0];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_wallpaper", next);
      } catch {}
    }
    set({ wallpaper: next });
  },

  setWallpaper: (wallpaper: string) => {
    if (get().soundEnabled) playUiClickSound();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_wallpaper", wallpaper);
      } catch {}
    }
    set({ wallpaper });
  },

  setBooted: (booted: boolean) => set({ booted }),

  showNotification: (title: string, message: string, appName = "SonOS System", icon?: string) => {
    set({
      notification: {
        id: `notif-${Date.now()}`,
        title,
        message,
        appName,
        icon,
      },
    });
  },

  clearNotification: () => set({ notification: null }),

  setLanguage: (language: string) => {
    if (get().soundEnabled) playUiClickSound();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_language", language);
      } catch {}
    }
    set({ language });
    import('./settingsStore').then(({ useSettingsStore }) => {
      useSettingsStore.getState().setLanguage(language);
    });
  },

  toggleReducedMotion: (enabled?: boolean) => {
    const next = enabled !== undefined ? enabled : !get().reducedMotion;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_reduced_motion", JSON.stringify(next));
      } catch {}
    }
    set({ reducedMotion: next });
  },

  setTextScale: (scale: 'small' | 'normal' | 'large') => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_text_scale", scale);
      } catch {}
    }
    set({ textScale: scale });
  },

  toggleHighContrast: (enabled?: boolean) => {
    const next = enabled !== undefined ? enabled : !get().highContrast;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_high_contrast", JSON.stringify(next));
      } catch {}
    }
    set({ highContrast: next });
  },

  setClockFormat: (format: '12h' | '24h') => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_clock_format", format);
      } catch {}
    }
    set({ clockFormat: format });
  },

  toggleMediaPlay: (playing?: boolean) => {
    set((state) => ({
      mediaIsPlaying: playing !== undefined ? playing : !state.mediaIsPlaying,
    }));
  },

  playNextTrack: () => {
    const state = get();
    const allTracks = [...PLAYLIST, ...state.customTracks];
    let nextIndex: number;
    if (state.mediaIsShuffle) {
      nextIndex = Math.floor(Math.random() * allTracks.length);
    } else {
      nextIndex = (state.mediaTrackIndex + 1) % allTracks.length;
    }
    set({ mediaTrackIndex: nextIndex, mediaIsPlaying: true, mediaCurrentTime: 0 });
  },

  playPrevTrack: () => {
    const state = get();
    const allTracks = [...PLAYLIST, ...state.customTracks];
    const prevIndex = (state.mediaTrackIndex - 1 + allTracks.length) % allTracks.length;
    set({ mediaTrackIndex: prevIndex, mediaIsPlaying: true, mediaCurrentTime: 0 });
  },

  selectTrack: (index: number) => set({ mediaTrackIndex: index, mediaIsPlaying: true, mediaCurrentTime: 0 }),
  setMediaCurrentTime: (time: number) => set({ mediaCurrentTime: time }),
  setMediaDuration: (duration: number) => set({ mediaDuration: duration }),
  setMediaVolume: (volume: number) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_media_volume", String(volume));
      } catch {}
    }
    set({ mediaVolume: volume, mediaIsMuted: volume === 0 });
  },
  toggleMediaMute: () => set((state) => ({ mediaIsMuted: !state.mediaIsMuted })),
  toggleMediaShuffle: () => set((state) => ({ mediaIsShuffle: !state.mediaIsShuffle })),
  toggleMediaRepeat: () => set((state) => ({ mediaIsRepeat: !state.mediaIsRepeat })),
  addCustomTrack: (track) => {
    const updated = [...get().customTracks, track];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_custom_tracks", JSON.stringify(updated));
      } catch {}
    }
    set({ customTracks: updated });
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const savedThemeMode = localStorage.getItem("sonos_theme_mode") as "dark" | "light" | "auto" | null;
      const savedLanguage = localStorage.getItem("sonos_language");
      const savedWallpaper = localStorage.getItem("sonos_wallpaper");
      const savedWidgets = localStorage.getItem("sonos_desktop_widgets");
      const savedShortcuts = localStorage.getItem("sonos_desktop_shortcuts");
      const savedSound = localStorage.getItem("sonos_sound_enabled");
      const savedReducedMotion = localStorage.getItem("sonos_reduced_motion");
      const savedTextScale = localStorage.getItem("sonos_text_scale") as "small" | "normal" | "large" | null;
      const savedHighContrast = localStorage.getItem("sonos_high_contrast");
      const savedClockFormat = localStorage.getItem("sonos_clock_format") as "12h" | "24h" | null;
      const savedMediaVolume = localStorage.getItem("sonos_media_volume");
      const savedCustomTracks = localStorage.getItem("sonos_custom_tracks");
      const savedWindows = localStorage.getItem("sonos_windows");
      const savedActiveWindowId = localStorage.getItem("sonos_active_window_id");

      const updates: Partial<WindowStore> = {};

      const mode: "dark" | "light" | "auto" = savedThemeMode || "auto";
      updates.themeMode = mode;
      if (mode === "auto") {
        const sysTheme = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        updates.theme = sysTheme;
      } else {
        updates.theme = mode;
      }

      if (savedLanguage) updates.language = savedLanguage;
      if (savedWallpaper) updates.wallpaper = savedWallpaper;
      if (savedWidgets) {
        try { updates.desktopWidgets = JSON.parse(savedWidgets); } catch {}
      }

      // Silent migration of old install-state data & pinned apps
      const oldInstalledKey1 = localStorage.getItem("sonos_installed_apps");
      const oldInstalledKey2 = localStorage.getItem("sonos-installed-apps");
      const oldInstalledRaw = oldInstalledKey1 || oldInstalledKey2;

      let savedPinned = localStorage.getItem("sonos-pinned-apps");
      if (!savedPinned) {
        // Fallback to legacy pinned apps key if present
        const legacyPinned = localStorage.getItem("sonos_pinned_apps");
        if (legacyPinned) {
          savedPinned = legacyPinned;
          try {
            localStorage.setItem("sonos-pinned-apps", legacyPinned);
            localStorage.removeItem("sonos_pinned_apps");
          } catch {}
        }
      }

      if (oldInstalledRaw) {
        try {
          const installedIds: string[] = JSON.parse(oldInstalledRaw);
          if (Array.isArray(installedIds)) {
            const cleanInstalled = installedIds.filter((id) => id && id !== "app-store");
            const existingPinned: string[] = savedPinned ? JSON.parse(savedPinned) : [];
            const merged = Array.from(new Set([...cleanInstalled, ...existingPinned.filter((id) => id !== "app-store")]));
            localStorage.setItem("sonos-pinned-apps", JSON.stringify(merged));
            savedPinned = JSON.stringify(merged);
          }
        } catch {}
        try {
          localStorage.removeItem("sonos_installed_apps");
          localStorage.removeItem("sonos-installed-apps");
        } catch {}
      }

      if (savedPinned) {
        try {
          const parsed: string[] = JSON.parse(savedPinned);
          if (Array.isArray(parsed)) {
            updates.pinnedApps = parsed.filter((id) => id !== "app-store");
          }
        } catch {}
      }
      if (savedShortcuts) {
        try {
          const parsed = JSON.parse(savedShortcuts);
          if (Array.isArray(parsed)) {
            updates.desktopShortcuts = parsed.map((item, idx) => {
              if (typeof item.col === "number" && typeof item.row === "number") {
                return {
                  id: item.id || `ds-${item.appId}-${idx}`,
                  appId: item.appId,
                  col: item.col,
                  row: item.row,
                };
              }
              const rawX = typeof item.x === "number" ? item.x : 28;
              const rawY = typeof item.y === "number" ? item.y : 28;
              const col = Math.max(0, Math.round((rawX - 28) / 96));
              const row = Math.max(0, Math.round((rawY - 28) / 110));
              return {
                id: item.id || `ds-${item.appId}-${idx}`,
                appId: item.appId,
                col,
                row,
              };
            });
          }
        } catch {}
      }
      if (savedCustomTracks) {
        try { updates.customTracks = JSON.parse(savedCustomTracks); } catch {}
      }
      if (savedSound !== null) {
        try { updates.soundEnabled = JSON.parse(savedSound); } catch {}
      }
      if (savedReducedMotion !== null) {
        try { updates.reducedMotion = JSON.parse(savedReducedMotion); } catch {}
      }
      if (savedTextScale === "small" || savedTextScale === "normal" || savedTextScale === "large") {
        updates.textScale = savedTextScale;
      }
      if (savedHighContrast !== null) {
        try { updates.highContrast = JSON.parse(savedHighContrast); } catch {}
      }
      if (savedClockFormat === "12h" || savedClockFormat === "24h") {
        updates.clockFormat = savedClockFormat;
      }
      if (savedMediaVolume !== null && !isNaN(Number(savedMediaVolume))) {
        updates.mediaVolume = Number(savedMediaVolume);
      }
      if (savedWindows) {
        try {
          const parsedWindows = JSON.parse(savedWindows);
          updates.windows = parsedWindows;
          if (savedActiveWindowId && parsedWindows.some((w: { id: string }) => w.id === savedActiveWindowId)) {
            updates.activeWindowId = savedActiveWindowId;
          } else {
            const active = parsedWindows.filter((w: { isMinimized: boolean }) => !w.isMinimized);
            if (active.length > 0) {
              updates.activeWindowId = active.reduce((prev: { zIndex: number }, curr: { zIndex: number }) => (curr.zIndex > prev.zIndex ? curr : prev)).id;
            }
          }
          if (parsedWindows.length > 0) {
            updates.highestZIndex = Math.max(20, ...parsedWindows.map((w: { zIndex?: number }) => w.zIndex || 20));
          }
        } catch {}
      }

      set(updates);
    } catch (e) {
      console.error("Failed to rehydrate store from localStorage:", e);
    }
  },
}));
