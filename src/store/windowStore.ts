import { create } from 'zustand';
import { playUiClickSound } from '@/utils/audio';
import { PLAYLIST } from '@/config/musicConfig';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  w: number;
  h: number;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  accentColor?: string;
  position: WindowPosition;
  size: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: string;
  title: string;
  icon: string;
  accentColor: string;
  description?: string;
  defaultSize?: WindowSize;
  type?: 'iframe' | 'static';
  liveUrl?: string;
  githubUrl?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  appName?: string;
  icon?: string;
}

export interface DesktopShortcutItem {
  id: string;
  appId: string;
  x: number;
  y: number;
}

export type DesktopWidgetType = 'clock' | 'weather' | 'calendar' | 'notes' | 'system' | 'calculator';

export interface DesktopWidgetConfig {
  id: string;
  type: DesktopWidgetType;
}

const DEFAULT_PINNED_APPS = ["japanese-quiz", "lovely-ever", "about", "settings"];

const DEFAULT_DESKTOP_SHORTCUTS: DesktopShortcutItem[] = [
  { id: "ds-japanese-quiz", appId: "japanese-quiz", x: 28, y: 28 },
  { id: "ds-lovely-ever", appId: "lovely-ever", x: 28, y: 138 },
  { id: "ds-about", appId: "about", x: 28, y: 248 },
  { id: "ds-terminal", appId: "terminal", x: 28, y: 358 },
];

const DEFAULT_DESKTOP_WIDGETS: DesktopWidgetConfig[] = [
  { id: "w-clock-def", type: "clock" },
  { id: "w-weather-def", type: "weather" },
];

const getInitialDesktopWidgets = (): DesktopWidgetConfig[] => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("sonos_desktop_widgets");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to default
    }
  }
  return DEFAULT_DESKTOP_WIDGETS;
};

const getInitialPinnedApps = (): string[] => {
  if (typeof window === "undefined") return DEFAULT_PINNED_APPS;
  try {
    const saved = localStorage.getItem("sonos_pinned_apps");
    return saved ? JSON.parse(saved) : DEFAULT_PINNED_APPS;
  } catch {
    return DEFAULT_PINNED_APPS;
  }
};

const getInitialDesktopShortcuts = (): DesktopShortcutItem[] => {
  if (typeof window === "undefined") return DEFAULT_DESKTOP_SHORTCUTS;
  try {
    const saved = localStorage.getItem("sonos_desktop_shortcuts");
    return saved ? JSON.parse(saved) : DEFAULT_DESKTOP_SHORTCUTS;
  } catch {
    return DEFAULT_DESKTOP_SHORTCUTS;
  }
};

interface WindowStore {
  windows: WindowState[];
  launcherOpen: boolean;
  quickSettingsOpen: boolean;
  soundEnabled: boolean;
  theme: 'dark' | 'light';
  activeWindowId: string | null;
  highestZIndex: number;
  wallpaper: string;
  booted: boolean;
  notification: SystemNotification | null;
  pinnedApps: string[];
  desktopShortcuts: DesktopShortcutItem[];
  desktopWidgets: DesktopWidgetConfig[];
  widgetGalleryOpen: boolean;

  // Global Music Player Media State
  mediaTrackIndex: number;
  mediaIsPlaying: boolean;
  mediaCurrentTime: number;
  mediaDuration: number;
  mediaVolume: number;
  mediaIsMuted: boolean;
  mediaIsShuffle: boolean;
  mediaIsRepeat: boolean;

  openWindow: (app: AppDefinition, options?: { keepLauncherOpen?: boolean }) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: WindowPosition) => void;
  resizeWindow: (id: string, size: WindowSize) => void;
  toggleMaximizeWindow: (id: string) => void;
  toggleMinimizeWindow: (id: string) => void;
  toggleLauncher: (open?: boolean) => void;
  closeLauncher: () => void;
  toggleQuickSettings: (open?: boolean) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  cycleWallpaper: () => void;
  setWallpaper: (wallpaper: string) => void;
  setBooted: (booted: boolean) => void;
  showNotification: (title: string, message: string, appName?: string, icon?: string) => void;
  clearNotification: () => void;
  togglePinApp: (appId: string) => void;
  reorderPinnedApps: (newOrder: string[]) => void;
  isPinnedApp: (appId: string) => boolean;
  addDesktopShortcut: (appId: string) => void;
  removeDesktopShortcut: (id: string) => void;
  updateDesktopShortcutPos: (id: string, position: { x: number; y: number }) => void;
  toggleWidgetGallery: (open?: boolean) => void;
  addWidget: (type: DesktopWidgetType) => void;
  removeWidget: (id: string) => void;
  resetWidgets: () => void;
  toggleMediaPlay: (playing?: boolean) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  selectTrack: (index: number) => void;
  setMediaCurrentTime: (time: number) => void;
  setMediaDuration: (duration: number) => void;
  setMediaVolume: (volume: number) => void;
  toggleMediaMute: () => void;
  toggleMediaShuffle: () => void;
  toggleMediaRepeat: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  launcherOpen: false,
  quickSettingsOpen: false,
  soundEnabled: true,
  theme: (typeof window !== 'undefined'
    ? (localStorage.getItem('sonos_theme') as 'dark' | 'light' | null) ?? 'dark'
    : 'dark'),
  activeWindowId: null,
  highestZIndex: 10,
  wallpaper: 'default',
  booted: false,
  notification: null,
  pinnedApps: getInitialPinnedApps(),
  desktopShortcuts: getInitialDesktopShortcuts(),
  desktopWidgets: getInitialDesktopWidgets(),
  widgetGalleryOpen: false,
  mediaTrackIndex: 0,
  mediaIsPlaying: false,
  mediaCurrentTime: 0,
  mediaDuration: 0,
  mediaVolume: 0.8,
  mediaIsMuted: false,
  mediaIsShuffle: false,
  mediaIsRepeat: false,

  openWindow: (app, options) => {
    if (get().soundEnabled) playUiClickSound();
    const { windows, highestZIndex, launcherOpen } = get();
    const existingWindow = windows.find((w) => w.id === app.id);

    const nextZIndex = highestZIndex + 1;
    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const shouldCloseLauncher = options?.keepLauncherOpen ? launcherOpen : false;

    if (existingWindow) {
      set({
        windows: windows.map((w) =>
          w.id === app.id
            ? { ...w, isMinimized: false, isMaximized: isMobileScreen ? true : w.isMaximized, zIndex: nextZIndex }
            : w
        ),
        activeWindowId: app.id,
        highestZIndex: nextZIndex,
        launcherOpen: shouldCloseLauncher,
      });
    } else {
      const offset = (windows.length % 5) * 28;
      const defaultW = app.defaultSize?.w || 760;
      const defaultH = app.defaultSize?.h || 500;
      
      const initialX = Math.max(20, typeof window !== 'undefined' ? Math.round((window.innerWidth - defaultW) / 2) + offset : 120 + offset);
      const initialY = Math.max(20, typeof window !== 'undefined' ? Math.round((window.innerHeight - defaultH) / 2) - 30 + offset : 70 + offset);

      const newWindow: WindowState = {
        id: app.id,
        title: app.title,
        icon: app.icon,
        accentColor: app.accentColor,
        position: { x: initialX, y: initialY },
        size: { w: defaultW, h: defaultH },
        isMinimized: false,
        isMaximized: isMobileScreen,
        zIndex: nextZIndex,
      };

      set({
        windows: [...windows, newWindow],
        activeWindowId: app.id,
        highestZIndex: nextZIndex,
        launcherOpen: shouldCloseLauncher,
      });
    }
  },

  closeWindow: (id) => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== id);
      const activeWindows = remaining.filter((w) => !w.isMinimized);
      const newActiveId = activeWindows.length > 0
        ? activeWindows.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev)).id
        : null;
      return {
        windows: remaining,
        activeWindowId: newActiveId,
      };
    });
  },

  minimizeWindow: (id) => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => {
      const updatedWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      );
      const activeWindows = updatedWindows.filter((w) => !w.isMinimized);
      const newActiveId = activeWindows.length > 0
        ? activeWindows.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev)).id
        : null;
      return {
        windows: updatedWindows,
        activeWindowId: newActiveId,
      };
    });
  },

  focusWindow: (id) => {
    const { windows, highestZIndex, activeWindowId } = get();
    const target = windows.find((w) => w.id === id);

    if (!target) return;

    if (activeWindowId === id && !target.isMinimized) {
      return;
    }

    const nextZIndex = highestZIndex + 1;
    set({
      windows: windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      ),
      activeWindowId: id,
      highestZIndex: nextZIndex,
    });
  },

  toggleMinimizeWindow: (id) => {
    const { windows, activeWindowId } = get();
    const target = windows.find((w) => w.id === id);
    if (!target) return;

    if (activeWindowId === id && !target.isMinimized) {
      get().minimizeWindow(id);
    } else {
      get().focusWindow(id);
    }
  },

  moveWindow: (id, position) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    }));
  },

  resizeWindow: (id, size) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }));
  },

  toggleMaximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    }));
  },

  toggleLauncher: (open) => {
    set((state) => ({
      launcherOpen: open !== undefined ? open : !state.launcherOpen,
    }));
  },

  closeLauncher: () => {
    set({ launcherOpen: false });
  },

  toggleQuickSettings: (open) => {
    set((state) => ({
      quickSettingsOpen: open !== undefined ? open : !state.quickSettingsOpen,
    }));
  },

  toggleSound: () => {
    const nextState = !get().soundEnabled;
    get().showNotification(
      "Audio System",
      nextState ? "Suara sistem diaktifkan" : "Suara sistem dibisukan",
      "System Settings",
      nextState ? "Volume2" : "VolumeX"
    );
    set({ soundEnabled: nextState });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('sonos_theme', nextTheme); } catch { /* ignore */ }
    }
    get().showNotification(
      nextTheme === 'light' ? 'Mode Terang Aktif' : 'Mode Gelap Aktif',
      nextTheme === 'light' ? 'Tampilan diubah ke tema terang.' : 'Tampilan diubah ke tema gelap.',
      'Personalization',
      nextTheme === 'light' ? 'Sun' : 'Moon'
    );
    set({ theme: nextTheme });
  },

  cycleWallpaper: () => {
    const PRESETS = ["default", "ocean", "sunset", "emerald"];
    const current = get().wallpaper;
    const currentIndex = PRESETS.indexOf(current);
    const nextWallpaper = PRESETS[(currentIndex + 1) % PRESETS.length];
    get().showNotification(
      "Wallpaper Diperbarui",
      `Tema wallpaper diubah ke: ${nextWallpaper}`,
      "Personalization",
      "Palette"
    );
    set({ wallpaper: nextWallpaper });
  },

  closeAllWindows: () => {
    set({ windows: [], activeWindowId: null });
  },

  setWallpaper: (wallpaper) => {
    get().showNotification(
      "Wallpaper Diperbarui",
      `Tema wallpaper diubah ke: ${wallpaper}`,
      "Personalization",
      "Palette"
    );
    set({ wallpaper });
  },

  setBooted: (booted) => {
    set({ booted });
  },

  showNotification: (title, message, appName = "Son-OS System", icon = "Monitor") => {
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

  clearNotification: () => {
    set({ notification: null });
  },

  togglePinApp: (appId) => {
    const { pinnedApps } = get();
    const isPinned = pinnedApps.includes(appId);
    const updated = isPinned
      ? pinnedApps.filter((id) => id !== appId)
      : [...pinnedApps, appId];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_pinned_apps", JSON.stringify(updated));
      } catch {
        // ignore localStorage write errors
      }
    }

    get().showNotification(
      isPinned ? "Unpinned dari Shelf" : "Pinned ke Shelf",
      `Aplikasi '${appId}' ${isPinned ? "dilepas dari" : "disematkan ke"} shelf`,
      "Shelf Manager",
      "Pin"
    );

    set({ pinnedApps: updated });
  },

  reorderPinnedApps: (newOrder) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_pinned_apps", JSON.stringify(newOrder));
      } catch {
        // ignore localStorage write errors
      }
    }
    set({ pinnedApps: newOrder });
  },

  isPinnedApp: (appId) => {
    return get().pinnedApps.includes(appId);
  },

  addDesktopShortcut: (appId) => {
    const { desktopShortcuts } = get();
    const existing = desktopShortcuts.find((s) => s.appId === appId);
    if (existing) return;

    const count = desktopShortcuts.length;
    const newShortcut: DesktopShortcutItem = {
      id: `ds-${appId}-${Date.now()}`,
      appId,
      x: 28,
      y: 28 + (count % 5) * 110,
    };

    const updated = [...desktopShortcuts, newShortcut];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }

    get().showNotification(
      "Shortcut Ditambahkan",
      `Shortcut '${appId}' berhasil dibuat di Desktop`,
      "Desktop Manager",
      "Monitor"
    );

    set({ desktopShortcuts: updated });
  },

  removeDesktopShortcut: (id) => {
    const { desktopShortcuts } = get();
    const updated = desktopShortcuts.filter((s) => s.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }

    get().showNotification(
      "Shortcut Dihapus",
      "Shortcut telah dihapus dari Desktop",
      "Desktop Manager",
      "Trash"
    );

    set({ desktopShortcuts: updated });
  },

  updateDesktopShortcutPos: (id, position) => {
    const { desktopShortcuts } = get();
    const updated = desktopShortcuts.map((s) =>
      s.id === id ? { ...s, x: position.x, y: position.y } : s
    );
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }
    set({ desktopShortcuts: updated });
  },

  toggleWidgetGallery: (open) => {
    set((state) => ({
      widgetGalleryOpen: open !== undefined ? open : !state.widgetGalleryOpen,
    }));
  },

  addWidget: (type) => {
    const newWidget: DesktopWidgetConfig = {
      id: `w-${type}-${Date.now()}`,
      type,
    };
    const updated = [...get().desktopWidgets, newWidget];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }
    get().showNotification(
      "Widget Ditambahkan",
      `Widget '${type}' berhasil ditambahkan ke Desktop`,
      "Widget Gallery",
      "Monitor"
    );
    set({ desktopWidgets: updated });
  },

  removeWidget: (id) => {
    const updated = get().desktopWidgets.filter((w) => w.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
    }
    get().showNotification(
      "Widget Dihapus",
      "Widget telah dihapus dari Desktop",
      "Widget Gallery",
      "Trash"
    );
    set({ desktopWidgets: updated });
  },

  resetWidgets: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(DEFAULT_DESKTOP_WIDGETS));
      } catch {
        // ignore storage error
      }
    }
    set({ desktopWidgets: DEFAULT_DESKTOP_WIDGETS });
  },

  toggleMediaPlay: (playing) => {
    set((state) => ({
      mediaIsPlaying: playing !== undefined ? playing : !state.mediaIsPlaying,
    }));
  },

  playNextTrack: () => {
    const { mediaIsShuffle, mediaTrackIndex } = get();
    if (mediaIsShuffle) {
      const nextIdx = Math.floor(Math.random() * PLAYLIST.length);
      set({ mediaTrackIndex: nextIdx, mediaIsPlaying: true, mediaCurrentTime: 0 });
    } else {
      const nextIdx = (mediaTrackIndex + 1) % PLAYLIST.length;
      set({ mediaTrackIndex: nextIdx, mediaIsPlaying: true, mediaCurrentTime: 0 });
    }
  },

  playPrevTrack: () => {
    const { mediaTrackIndex } = get();
    const prevIdx = (mediaTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    set({ mediaTrackIndex: prevIdx, mediaIsPlaying: true, mediaCurrentTime: 0 });
  },

  selectTrack: (index) => {
    set({ mediaTrackIndex: index, mediaIsPlaying: true, mediaCurrentTime: 0 });
  },

  setMediaCurrentTime: (time) => set({ mediaCurrentTime: time }),
  setMediaDuration: (duration) => set({ mediaDuration: duration }),
  setMediaVolume: (volume) => set({ mediaVolume: volume, mediaIsMuted: false }),
  toggleMediaMute: () => set((state) => ({ mediaIsMuted: !state.mediaIsMuted })),
  toggleMediaShuffle: () => set((state) => ({ mediaIsShuffle: !state.mediaIsShuffle })),
  toggleMediaRepeat: () => set((state) => ({ mediaIsRepeat: !state.mediaIsRepeat })),
}));
