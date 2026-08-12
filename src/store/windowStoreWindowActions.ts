import { playUiClickSound } from '@/utils/audio';
import { AppDefinition, WindowPosition, WindowSize, WindowState, WindowStore } from './windowStoreTypes';
import { saveWindowsSession } from './windowStoreHelpers';

export const createWindowActions = (
  set: (fn: Partial<WindowStore> | ((state: WindowStore) => Partial<WindowStore>)) => void,
  get: () => WindowStore
) => ({
  openWindow: (app: AppDefinition, options?: { keepLauncherOpen?: boolean }) => {
    if (get().soundEnabled) playUiClickSound();
    const state = get();
    const existing = state.windows.find((w) => w.id === app.id);
    const newZ = state.highestZIndex + 1;
    let nextWindows: WindowState[];

    if (existing) {
      nextWindows = state.windows.map((w) =>
        w.id === app.id ? { ...w, isMinimized: false, zIndex: newZ } : w
      );
    } else {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const defaultW = isMobile ? Math.min(window.innerWidth - 16, 700) : app.defaultSize?.w ?? 800;
      const defaultH = isMobile ? Math.min(window.innerHeight - 100, 520) : app.defaultSize?.h ?? 550;
      const windowCount = state.windows.length;
      const offsetX = isMobile ? 8 : 40 + (windowCount % 8) * 24;
      const offsetY = isMobile ? 8 : 40 + (windowCount % 8) * 24;

      const newWindow: WindowState = {
        id: app.id,
        title: app.title,
        icon: app.icon,
        accentColor: app.accentColor,
        position: { x: offsetX, y: offsetY },
        size: { w: defaultW, h: defaultH },
        isMinimized: false,
        isMaximized: isMobile,
        zIndex: newZ,
      };
      nextWindows = [...state.windows, newWindow];
    }

    const nextActiveId = app.id;
    saveWindowsSession(nextWindows, nextActiveId);
    set(() => ({
      windows: nextWindows,
      activeWindowId: nextActiveId,
      highestZIndex: newZ,
      launcherOpen: options?.keepLauncherOpen ? state.launcherOpen : false,
    }));
  },

  closeWindow: (id: string) => {
    if (get().soundEnabled) playUiClickSound();
    const state = get();
    const nextWindows = state.windows.filter((w) => w.id !== id);
    let nextActiveId = state.activeWindowId;

    if (state.activeWindowId === id) {
      const remaining = nextWindows.filter((w) => !w.isMinimized);
      if (remaining.length > 0) {
        nextActiveId = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev)).id;
      } else {
        nextActiveId = null;
      }
    }

    saveWindowsSession(nextWindows, nextActiveId);
    set(() => ({ windows: nextWindows, activeWindowId: nextActiveId }));
  },

  closeAllWindows: () => {
    if (get().soundEnabled) playUiClickSound();
    saveWindowsSession([], null);
    set(() => ({ windows: [], activeWindowId: null }));
  },

  minimizeWindow: (id: string) => {
    if (get().soundEnabled) playUiClickSound();
    const state = get();
    const nextWindows = state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w));
    let nextActiveId = state.activeWindowId;

    if (state.activeWindowId === id) {
      const remaining = nextWindows.filter((w) => !w.isMinimized);
      if (remaining.length > 0) {
        nextActiveId = remaining.reduce((prev, curr) => (curr.zIndex > prev.zIndex ? curr : prev)).id;
      } else {
        nextActiveId = null;
      }
    }

    saveWindowsSession(nextWindows, nextActiveId);
    set(() => ({ windows: nextWindows, activeWindowId: nextActiveId }));
  },

  focusWindow: (id: string) => {
    const state = get();
    const win = state.windows.find((w) => w.id === id);
    if (!win) return;
    if (state.activeWindowId === id && !win.isMinimized) return;

    const newZ = state.highestZIndex + 1;
    const nextWindows = state.windows.map((w) =>
      w.id === id ? { ...w, isMinimized: false, zIndex: newZ } : w
    );

    saveWindowsSession(nextWindows, id);
    set(() => ({ windows: nextWindows, activeWindowId: id, highestZIndex: newZ }));
  },

  moveWindow: (id: string, position: WindowPosition) => {
    const state = get();
    const nextWindows = state.windows.map((w) => (w.id === id ? { ...w, position } : w));
    saveWindowsSession(nextWindows, state.activeWindowId);
    set(() => ({ windows: nextWindows }));
  },

  resizeWindow: (id: string, size: WindowSize) => {
    const state = get();
    const nextWindows = state.windows.map((w) => (w.id === id ? { ...w, size } : w));
    saveWindowsSession(nextWindows, state.activeWindowId);
    set(() => ({ windows: nextWindows }));
  },

  toggleMaximizeWindow: (id: string) => {
    if (get().soundEnabled) playUiClickSound();
    const state = get();
    const nextWindows = state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    saveWindowsSession(nextWindows, state.activeWindowId);
    set(() => ({ windows: nextWindows }));
  },

  toggleMinimizeWindow: (id: string) => {
    const state = get();
    const win = state.windows.find((w) => w.id === id);
    if (!win) return;
    if (win.isMinimized) {
      get().focusWindow(id);
    } else {
      get().minimizeWindow(id);
    }
  },
});
