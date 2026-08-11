import { create } from 'zustand';

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

interface WindowStore {
  windows: WindowState[];
  launcherOpen: boolean;
  activeWindowId: string | null;
  highestZIndex: number;
  wallpaper: string;
  booted: boolean;

  openWindow: (app: AppDefinition) => void;
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
  setWallpaper: (wallpaper: string) => void;
  setBooted: (booted: boolean) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  launcherOpen: false,
  activeWindowId: null,
  highestZIndex: 10,
  wallpaper: 'default',
  booted: false,

  openWindow: (app) => {
    const { windows, highestZIndex } = get();
    const existingWindow = windows.find((w) => w.id === app.id);

    const nextZIndex = highestZIndex + 1;

    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

    if (existingWindow) {
      set({
        windows: windows.map((w) =>
          w.id === app.id
            ? { ...w, isMinimized: false, isMaximized: isMobileScreen ? true : w.isMaximized, zIndex: nextZIndex }
            : w
        ),
        activeWindowId: app.id,
        highestZIndex: nextZIndex,
        launcherOpen: false,
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
        launcherOpen: false,
      });
    }
  },

  closeWindow: (id) => {
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

  closeAllWindows: () => {
    set({ windows: [], activeWindowId: null });
  },

  setWallpaper: (wallpaper) => {
    set({ wallpaper });
  },

  setBooted: (booted) => {
    set({ booted });
  },
}));
