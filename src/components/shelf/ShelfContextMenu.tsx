import React from "react";
import { ExternalLink, Pin, PinOff, X } from "lucide-react";
import { AppDefinition } from "@/store/windowStore";

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
  if (!contextMenu) return null;

  const { app, x } = contextMenu;
  const isPinned = pinnedApps.includes(app.id);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: `${Math.min(x, typeof window !== "undefined" ? window.innerWidth - 200 : 300)}px`,
        bottom: "64px",
      }}
      onClick={(e) => e.stopPropagation()}
      className="z-50 w-48 rounded-2xl bg-zinc-900/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none"
      data-context-menu
    >
      <div className="flex flex-col gap-0.5 text-xs text-zinc-200">
        <button
          onClick={() => {
            onOpenWindow(app);
            onCloseMenu();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
        >
          <ExternalLink size={14} /> {isOpen ? "Bawa ke Depan" : "Buka App"}
        </button>

        {app.id !== "app-store" && (
          <button
            onClick={() => {
              onTogglePin(app.id);
              onCloseMenu();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full text-left font-medium"
          >
            {isPinned ? (
              <>
                <PinOff size={14} className="text-rose-400" /> Unpin dari Shelf
              </>
            ) : (
              <>
                <Pin size={14} className="text-blue-400" /> Pin ke Shelf
              </>
            )}
          </button>
        )}

        {isOpen && (
          <button
            onClick={() => {
              onCloseWindow(app.id);
              onCloseMenu();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer w-full text-left font-medium"
          >
            <X size={14} /> Tutup Window
          </button>
        )}
      </div>
    </div>
  );
};
