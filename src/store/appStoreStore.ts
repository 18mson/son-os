import { create } from "zustand";
import { APPS } from "@/data/apps";
import { useWindowStore } from "./windowStore";

const STORAGE_KEY = "sonos_installed_apps";

const getInitialInstalledApps = (): string[] => {
  const defaultInstalled = APPS.filter((a) => a.isPreinstalled).map((a) => a.id);
  if (typeof window === "undefined") return defaultInstalled;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      // Always guarantee system apps are present
      const systemAppIds = APPS.filter((a) => a.isSystemApp).map((a) => a.id);
      return Array.from(new Set([...parsed, ...systemAppIds]));
    }
  } catch {
    // fallback
  }

  return defaultInstalled;
};

interface AppStoreState {
  installedApps: string[];
  installApp: (id: string) => void;
  uninstallApp: (id: string) => void;
  isInstalled: (id: string) => boolean;
}

export const useAppStoreStore = create<AppStoreState>((set, get) => ({
  installedApps: getInitialInstalledApps(),

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
        useWindowStore.getState().showNotification(
          "App Terinstall",
          `${app.title} berhasil dipasang ke Son-OS.`,
          "App Store",
          "ShoppingBag"
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

      if (app) {
        windowStore.showNotification(
          "App Di-uninstall",
          `${app.title} telah dihapus dari sistem.`,
          "App Store",
          "Trash2"
        );
      }
    }
  },

  isInstalled: (id: string) => {
    return get().installedApps.includes(id);
  },
}));
