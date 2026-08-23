import React from "react";
import { ExternalLink, Pin, PinOff, Monitor, Trash2 } from "lucide-react";
import { APPS } from "@/config/appsConfig";
import { AppDefinition, DesktopShortcutItem } from "@/store/windowStore";
import { useAppStoreStore } from "@/store/appStoreStore";
import { useTranslation, getAppTranslation } from "@/i18n";

interface LauncherContextMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  appContextMenu: { appId: string; x: number; y: number } | null;
  pinnedApps: string[];
  desktopShortcuts: DesktopShortcutItem[];
  onOpenApp: (app: AppDefinition) => void;
  onTogglePinApp: (appId: string) => void;
  onAddDesktopShortcut: (appId: string) => void;
  onRemoveDesktopShortcut: (shortcutId: string) => void;
  showNotification: (title: string, msg: string, appName: string, icon: string) => void;
  onCloseMenu: () => void;
}

export const LauncherContextMenu: React.FC<LauncherContextMenuProps> = ({
  menuRef,
  appContextMenu,
  pinnedApps,
  desktopShortcuts,
  onOpenApp,
  onTogglePinApp,
  onAddDesktopShortcut,
  onRemoveDesktopShortcut,
  showNotification,
  onCloseMenu,
}) => {
  const { t, language } = useTranslation();
  if (!appContextMenu) return null;

  const targetApp = APPS.find((a) => a.id === appContextMenu.appId);
  if (!targetApp) return null;

  const appMeta = getAppTranslation(targetApp.id, language);
  const translatedTitle = appMeta?.title || targetApp.title;
  const isPinned = pinnedApps.includes(appContextMenu.appId);
  const existingShortcut = desktopShortcuts.find((s) => s.appId === targetApp.id);

  const handleUninstall = () => {
    useAppStoreStore.getState().setPendingUninstallAppId(targetApp.id);
    onCloseMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${Math.min(appContextMenu.x, typeof window !== "undefined" ? window.innerWidth - 210 : 300)}px`,
        top: `${Math.max(8, Math.min(appContextMenu.y - 8, typeof window !== "undefined" ? window.innerHeight - 160 : 400))}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      className="z-90 w-52 rounded-2xl bg-zinc-900/98 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
      data-context-menu


    >
      <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
        <button
          type="button"
          onClick={() => {
            onOpenApp({ ...targetApp, title: translatedTitle });
            onCloseMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
        >
          <ExternalLink size={13} /> {language === "en" ? `Open ${translatedTitle}` : `Buka ${translatedTitle}`}
        </button>

        <button
          type="button"
          onClick={() => {
            onTogglePinApp(targetApp.id);
            onCloseMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
        >
          {isPinned ? (
            <>
              <PinOff size={13} className="text-rose-400" /> {t.launcher.unpinFromShelf}
            </>
          ) : (
            <>
              <Pin size={13} className="text-blue-400" /> {t.launcher.pinToShelf}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (existingShortcut) {
              onRemoveDesktopShortcut(existingShortcut.id);
              showNotification(
                "Desktop Shortcut",
                language === "en" ? `Shortcut for ${translatedTitle} removed.` : `Shortcut ${translatedTitle} dihapus.`,
                "Desktop",
                "Monitor"
              );
            } else {
              onAddDesktopShortcut(targetApp.id);
              showNotification(
                "Desktop Shortcut",
                language === "en" ? `Shortcut for ${translatedTitle} added to desktop.` : `Shortcut ${translatedTitle} ditambahkan ke desktop.`,
                "Desktop",
                "Monitor"
              );
            }
            onCloseMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
        >
          <Monitor size={13} className="text-emerald-400" />
          {existingShortcut
            ? (language === "en" ? "Remove from Desktop" : "Hapus dari Desktop")
            : t.launcher.addDesktopShortcut}
        </button>

        {!targetApp.isSystemApp && (
          <button
            type="button"
            onClick={handleUninstall}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-600/20 hover:text-rose-300 text-rose-400 transition-colors cursor-pointer w-full text-left font-medium border-t border-white/5 mt-0.5 pt-2"
          >
            <Trash2 size={13} /> {t.launcher.uninstallApp}
          </button>
        )}
      </div>
    </div>
  );
};
