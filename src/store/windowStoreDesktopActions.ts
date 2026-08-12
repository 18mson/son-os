import { playUiClickSound } from "@/utils/audio";
import { DesktopWidgetConfig, DesktopShortcutItem, DesktopWidgetType, WindowStore } from "./windowStoreTypes";
import { DEFAULT_DESKTOP_WIDGETS } from "./windowStoreHelpers";

export const createDesktopActions = (
  set: (fn: Partial<WindowStore> | ((state: WindowStore) => Partial<WindowStore>)) => void,
  get: () => WindowStore
) => ({
  togglePinApp: (appId: string) => {
    const current = get().pinnedApps;
    const isPinned = current.includes(appId);
    const updated = isPinned ? current.filter((id) => id !== appId) : [...current, appId];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_pinned_apps", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification(
      isPinned ? "Sematkan Dibatalkan" : "Aplikasi Disematkan",
      isPinned ? "Aplikasi telah dihapus dari Shelf" : "Aplikasi ditambahkan ke Shelf",
      "Shelf System"
    );
    set({ pinnedApps: updated });
  },

  reorderPinnedApps: (newOrder: string[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_pinned_apps", JSON.stringify(newOrder));
      } catch {}
    }
    set({ pinnedApps: newOrder });
  },

  isPinnedApp: (appId: string) => get().pinnedApps.includes(appId),

  addDesktopShortcut: (appId: string) => {
    const current = get().desktopShortcuts;
    if (current.some((s) => s.appId === appId)) {
      get().showNotification("Pintasan Sudah Ada", "Pintasan aplikasi ini sudah ada di Desktop");
      return;
    }

    const GRID_W = 96;
    const GRID_H = 110;
    const START_X = 28;
    const START_Y = 28;

    let newX = START_X;
    let newY = START_Y;
    let found = false;

    for (let col = 0; col < 12 && !found; col++) {
      for (let row = 0; row < 6 && !found; row++) {
        const testX = START_X + col * GRID_W;
        const testY = START_Y + row * GRID_H;
        const occupied = current.some((s) => Math.abs(s.x - testX) < 30 && Math.abs(s.y - testY) < 30);
        if (!occupied) {
          newX = testX;
          newY = testY;
          found = true;
        }
      }
    }

    const newShortcut: DesktopShortcutItem = {
      id: `ds-${appId}-${Date.now()}`,
      appId,
      x: newX,
      y: newY,
    };

    const updated = [...current, newShortcut];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification("Pintasan Dibuat", "Pintasan aplikasi telah ditambahkan ke Desktop");
    set({ desktopShortcuts: updated });
  },

  removeDesktopShortcut: (id: string) => {
    const updated = get().desktopShortcuts.filter((s) => s.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification("Pintasan Dihapus", "Pintasan telah dihapus dari Desktop");
    set({ desktopShortcuts: updated });
  },

  updateDesktopShortcutPos: (id: string, position: { x: number; y: number }) => {
    const updated = get().desktopShortcuts.map((s) => (s.id === id ? { ...s, x: position.x, y: position.y } : s));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {}
    }
    set({ desktopShortcuts: updated });
  },

  toggleWidgetGallery: (open?: boolean) => {
    if (get().soundEnabled) playUiClickSound();
    set((state) => ({ widgetGalleryOpen: open !== undefined ? open : !state.widgetGalleryOpen }));
  },

  addWidget: (type: DesktopWidgetType) => {
    const newWidget: DesktopWidgetConfig = {
      id: `w-${type}-${Date.now()}`,
      type,
    };
    const updated = [...get().desktopWidgets, newWidget];
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification("Widget Ditambahkan", `Widget ${type} telah ditambahkan ke Desktop`, "Widget Gallery");
    set({ desktopWidgets: updated });
  },

  removeWidget: (id: string) => {
    const updated = get().desktopWidgets.filter((w) => w.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification("Widget Dihapus", "Widget telah dihapus dari Desktop", "Widget Gallery");
    set({ desktopWidgets: updated });
  },

  reorderWidgets: (newWidgets: DesktopWidgetConfig[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(newWidgets));
      } catch {}
    }
    set({ desktopWidgets: newWidgets });
  },

  resetWidgets: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(DEFAULT_DESKTOP_WIDGETS));
      } catch {}
    }
    set({ desktopWidgets: DEFAULT_DESKTOP_WIDGETS });
  },
});
