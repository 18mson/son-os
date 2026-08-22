import React from "react";
import { ExternalLink, Pin, PinOff, X } from "lucide-react";
import { AppDefinition } from "@/store/windowStore";
import { useTranslation, getAppTranslation } from "@/i18n";

interface ShelfContextMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  contextMenu: { app: AppDefinition; x: number; y: number } | null;
  pinnedApps: string[];
  isOpen: boolean;
  onOpenWindow: (app: AppDefinition) => void;
  onTogglePin: (appId: string) => void;
  onCloseWindow: (appId: string) => void;
  onCloseMenu: () => void;
}

export const ShelfContextMenu: React.FC<ShelfContextMenuProps> = ({
  menuRef,
  contextMenu,
  pinnedApps,
  isOpen,
  onOpenWindow,
  onTogglePin,
  onCloseWindow,
  onCloseMenu,
}) => {
  const { t, language } = useTranslation();
  if (!contextMenu) return null;

  const { app, x } = contextMenu;
  const isPinned = pinnedApps.includes(app.id);
  const appMeta = getAppTranslation(app.id, language);
  const translatedTitle = appMeta?.title || app.title;

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${Math.min(x, typeof window !== "undefined" ? window.innerWidth - 200 : 300)}px`,
        bottom: "64px",
      }}
      onClick={(e) => e.stopPropagation()}
      className="z-70 w-48 rounded-2xl bg-zinc-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
      data-context-menu
    >
      <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
        <button
          type="button"
          onClick={() => {
            onOpenWindow({ ...app, title: translatedTitle });
            onCloseMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
        >
          <ExternalLink size={14} /> {isOpen ? (language === "en" ? "Bring to Front" : "Bawa ke Depan") : (language === "en" ? "Open App" : "Buka App")}
        </button>

        {app.id !== "app-store" && (
          <button
            type="button"
            onClick={() => {
              onTogglePin(app.id);
              onCloseMenu();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
          >
            {isPinned ? (
              <>
                <PinOff size={14} className="text-rose-400" /> {t.launcher.unpinFromShelf}
              </>
            ) : (
              <>
                <Pin size={14} className="text-blue-400" /> {t.launcher.pinToShelf}
              </>
            )}
          </button>
        )}

        {isOpen && (
          <button
            type="button"
            onClick={() => {
              onCloseWindow(app.id);
              onCloseMenu();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left font-medium"
          >
            <X size={14} /> {t.shelf.closeApp}
          </button>
        )}
      </div>
    </div>
  );
};
