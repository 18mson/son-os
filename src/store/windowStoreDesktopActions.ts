import { playUiClickSound } from "@/utils/audio";
import { DesktopWidgetConfig, DesktopShortcutItem, DesktopWidgetType, WindowStore } from "./windowStoreTypes";
import { DEFAULT_DESKTOP_WIDGETS } from "./windowStoreHelpers";
import { getTranslation } from "@/i18n";
import { useSettingsStore } from "./settingsStore";

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
        localStorage.setItem("sonos-pinned-apps", JSON.stringify(updated));
      } catch {}
    }
    const lang = useSettingsStore.getState().language;
    const t = getTranslation(lang);
    get().showNotification(
      isPinned ? t.notifications.unpinnedTitle : t.notifications.pinnedTitle,
      isPinned ? t.notifications.unpinnedDesc : t.notifications.pinnedDesc,
      "Shelf",
      isPinned ? "PinOff" : "Pin"
    );
    set({ pinnedApps: updated });
  },

  reorderPinnedApps: (newOrder: string[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos-pinned-apps", JSON.stringify(newOrder));
      } catch {}
    }
    set({ pinnedApps: newOrder });
  },

  isPinnedApp: (appId: string) => get().pinnedApps.includes(appId),

  addDesktopShortcut: (appId: string) => {
    const lang = useSettingsStore.getState().language;
    const t = getTranslation(lang);
    const current = get().desktopShortcuts;
    if (current.some((s) => s.appId === appId)) {
      get().showNotification(
        t.notifications.shortcutExistsTitle,
        t.notifications.shortcutExistsDesc,
        "Desktop",
        "Monitor"
      );
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
    get().showNotification(
      t.notifications.shortcutCreatedTitle,
      t.notifications.shortcutCreatedDesc,
      "Desktop",
      "Monitor"
    );
    set({ desktopShortcuts: updated });
  },

  removeDesktopShortcut: (id: string) => {
    const lang = useSettingsStore.getState().language;
    const t = getTranslation(lang);
    const updated = get().desktopShortcuts.filter((s) => s.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_shortcuts", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification(
      t.notifications.shortcutRemovedTitle,
      t.notifications.shortcutRemovedDesc,
      "Desktop",
      "Trash"
    );
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
    const lang = useSettingsStore.getState().language;
    const t = getTranslation(lang);
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
    const widgetName = (t.widgetGallery as Record<string, string>)[`${type}Title`] || type;
    get().showNotification(
      t.notifications.widgetAddedTitle,
      `${widgetName} ${t.notifications.widgetAddedDesc}`,
      "Widget Gallery",
      "Palette"
    );
    set({ desktopWidgets: updated });
  },

  removeWidget: (id: string) => {
    const lang = useSettingsStore.getState().language;
    const t = getTranslation(lang);
    const updated = get().desktopWidgets.filter((w) => w.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_desktop_widgets", JSON.stringify(updated));
      } catch {}
    }
    get().showNotification(
      t.notifications.widgetRemovedTitle,
      t.notifications.widgetRemovedDesc,
      "Widget Gallery",
      "Trash"
    );
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
