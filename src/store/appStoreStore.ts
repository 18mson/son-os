import { create } from "zustand";
import { APPS } from "@/data/apps";
import { useWindowStore } from "./windowStore";
import { useSettingsStore } from "./settingsStore";
import { getTranslation, getAppTranslation } from "@/i18n";

const STORAGE_KEY = "sonos_installed_apps";

const getInitialInstalledApps = (): string[] => {
  return APPS.filter((a) => a.isPreinstalled).map((a) => a.id);
};

interface AppStoreState {
  installedApps: string[];
  pendingUninstallAppId: string | null;
  setPendingUninstallAppId: (id: string | null) => void;
  confirmUninstallApp: () => void;
  installApp: (id: string) => void;
  uninstallApp: (id: string) => void;
  isInstalled: (id: string) => boolean;
  hydrateFromStorage: () => void;
}

export const useAppStoreStore = create<AppStoreState>((set, get) => ({
  installedApps: getInitialInstalledApps(),
  pendingUninstallAppId: null,

  setPendingUninstallAppId: (id: string | null) => set({ pendingUninstallAppId: id }),

  confirmUninstallApp: () => {
    const id = get().pendingUninstallAppId;
    if (id) {
      get().uninstallApp(id);
      set({ pendingUninstallAppId: null });
    }
  },

  installApp: (id: string) => {
    const current = get().installedApps;
    if (!current.includes(id)) {
      const updated = [...current, id];
      set({ installedApps: updated });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }

      const app = APPS.find((a) => a.id === id);
      if (app) {
        const lang = useSettingsStore.getState().language;
        const t = getTranslation(lang);
        const appMeta = getAppTranslation(app.id, lang);
        const title = appMeta?.title || app.title;
        useWindowStore.getState().showNotification(
          t.notifications.appInstalledTitle,
          `${title} ${t.notifications.appInstalledDesc}`,
          "App Store",
          "CheckCircle2"
        );
      }
    }
  },

  uninstallApp: (id: string) => {
    const app = APPS.find((a) => a.id === id);
    if (app?.isSystemApp) return; // Cannot uninstall system app

    const current = get().installedApps;
    if (current.includes(id)) {
      const updated = current.filter((appId) => appId !== id);
      set({ installedApps: updated });

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }

      // Close open window if open
      const windowStore = useWindowStore.getState();
      if (windowStore.windows.some((w) => w.id === id)) {
        windowStore.closeWindow(id);
      }

      // Unpin app if currently pinned
      if (windowStore.pinnedApps.includes(id)) {
        windowStore.togglePinApp(id);
      }

      // Remove any desktop shortcuts for this app
      const shortcuts = windowStore.desktopShortcuts.filter((s) => s.appId === id);
      shortcuts.forEach((s) => {
        windowStore.removeDesktopShortcut(s.id);
      });

      if (app) {
        const lang = useSettingsStore.getState().language;
        const t = getTranslation(lang);
        const appMeta = getAppTranslation(app.id, lang);
        const title = appMeta?.title || app.title;
        windowStore.showNotification(
          t.notifications.appUninstalledTitle,
          `${title} ${t.notifications.appUninstalledDesc}`,
          "App Store",
          "Trash"
        );
      }
    }
  },

  isInstalled: (id: string) => {
    return get().installedApps.includes(id);
  },

  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const systemAppIds = APPS.filter((a) => a.isSystemApp).map((a) => a.id);
        set({ installedApps: Array.from(new Set([...parsed, ...systemAppIds])) });
      }
    } catch {}
  },
}));
