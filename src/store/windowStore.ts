import { create } from 'zustand';
import { playUiClickSound } from '@/utils/audio';
import { PLAYLIST } from '@/config/musicConfig';
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
  theme: "dark",
  wallpaper: "default",
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
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_theme", nextTheme);
      } catch {}
    }
    set({ theme: nextTheme });
    // Keep settingsStore in sync
    import('./settingsStore').then(({ useSettingsStore }) => {
      useSettingsStore.getState().setTheme(nextTheme);
    });
  },

  setTheme: (theme: 'dark' | 'light') => {
    if (get().soundEnabled) playUiClickSound();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_theme", theme);
      } catch {}
    }
    set({ theme });
    // Keep settingsStore in sync
    import('./settingsStore').then(({ useSettingsStore }) => {
      useSettingsStore.getState().setTheme(theme);
    });
  },

  cycleWallpaper: () => {
    if (get().soundEnabled) playUiClickSound();
    const wallpapers = ['default', 'sunset', 'ocean', 'cyberpunk', 'abstract'];
    const currentIndex = wallpapers.indexOf(get().wallpaper);
    const next = wallpapers[(currentIndex + 1) % wallpapers.length];
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
      const savedTheme = localStorage.getItem("sonos_theme") as "dark" | "light" | null;
      const savedLanguage = localStorage.getItem("sonos_language");
      const savedWallpaper = localStorage.getItem("sonos_wallpaper");
      const savedWidgets = localStorage.getItem("sonos_desktop_widgets");
      const savedPinned = localStorage.getItem("sonos_pinned_apps");
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

      if (savedTheme === "dark" || savedTheme === "light") updates.theme = savedTheme;
      if (savedLanguage) updates.language = savedLanguage;
      if (savedWallpaper) updates.wallpaper = savedWallpaper;
      if (savedWidgets) {
        try { updates.desktopWidgets = JSON.parse(savedWidgets); } catch {}
      }
      if (savedPinned) {
        try {
          const parsed = JSON.parse(savedPinned);
          updates.pinnedApps = parsed.includes("app-store") ? parsed : ["app-store", ...parsed];
        } catch {}
      }
      if (savedShortcuts) {
        try { updates.desktopShortcuts = JSON.parse(savedShortcuts); } catch {}
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
