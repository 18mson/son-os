"use client";

import React, { useState, useRef } from "react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/data/apps";
import { LayoutGrid, XSquare, Image as ImageIcon, Info } from "lucide-react";
import { useContextMenuClose } from "@/hooks/useContextMenuClose";
import { useTranslation, getAppTranslation } from "@/i18n";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const { t, language } = useTranslation();
  const { toggleLauncher, closeAllWindows, setWallpaper, wallpaper, openWindow, toggleWidgetGallery } = useWindowStore();
  const [showWallpapers, setShowWallpapers] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useContextMenuClose(true, onClose, menuRef);

  const wallpapers = [
    { id: "default", name: "Dark Minimal", color: "from-indigo-500/30 to-purple-500/10" },
    { id: "ocean", name: "Deep Ocean", color: "from-sky-500/30 to-blue-600/10" },
    { id: "sunset", name: "Sunset Glow", color: "from-rose-500/30 to-amber-500/10" },
    { id: "emerald", name: "Emerald Forest", color: "from-emerald-500/30 to-teal-600/10" },
  ];

  return (
    <div
      ref={menuRef}
      style={{ left: Math.min(x, typeof window !== "undefined" ? window.innerWidth - 220 : 300), top: Math.min(y, typeof window !== "undefined" ? window.innerHeight - 300 : 300) }}
      className="fixed z-90 w-52 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-xs select-none animate-in fade-in zoom-in-95 duration-100"
      data-context-menu


    >
      <button
        type="button"
        onClick={() => {
          toggleWidgetGallery(true);
          onClose();
        }}
        className="w-full px-3 py-2.5 text-left text-zinc-200 hover:bg-white/10 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden flex items-center gap-2.5 transition-colors min-h-10 rounded-lg cursor-pointer"
      >
        <LayoutGrid size={14} className="text-amber-400" />
        <span>{t.contextMenu.widgetGallery}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          toggleLauncher(true);
          onClose();
        }}
        className="w-full px-3 py-2.5 text-left text-zinc-200 hover:bg-white/10 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden flex items-center gap-2.5 transition-colors min-h-10 rounded-lg cursor-pointer"
      >
        <LayoutGrid size={14} className="text-blue-400" />
        <span>{t.shelf.launcherTooltip}</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowWallpapers(!showWallpapers)}
          className="w-full px-3 py-2.5 text-left text-zinc-200 hover:bg-white/10 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden flex items-center justify-between transition-colors min-h-10 rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ImageIcon size={14} className="text-purple-400" />
            <span>{t.contextMenu.changeWallpaper}</span>
          </div>
          <span className="text-[10px] text-zinc-400">►</span>
        </button>

        {showWallpapers && (
          <div className="pl-6 pr-2 py-1.5 space-y-1 bg-white/5 border-y border-white/10">
            {wallpapers.map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => {
                  setWallpaper(wp.id);
                  onClose();
                }}
                className={`w-full px-2.5 py-2 rounded-md text-left flex items-center justify-between text-xs transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden cursor-pointer ${
                  wallpaper === wp.id ? "bg-white/15 text-white font-medium" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-linear-to-br ${wp.color} border border-white/20`} />
                  <span>{wp.name}</span>
                </div>
                {wallpaper === wp.id && <span className="text-[10px] text-blue-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="my-1 border-t border-white/10" />

      <button
        type="button"
        onClick={() => {
          const aboutApp = APPS.find((a) => a.id === "about");
          if (aboutApp) {
            const appMeta = getAppTranslation("about", language);
            openWindow({ ...aboutApp, title: appMeta?.title || aboutApp.title });
          }
          onClose();
        }}
        className="w-full px-3 py-2.5 text-left text-zinc-200 hover:bg-white/10 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden flex items-center gap-2.5 transition-colors min-h-10 rounded-lg cursor-pointer"
      >
        <Info size={14} className="text-emerald-400" />
        <span>{t.contextMenu.openAbout}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          closeAllWindows();
          onClose();
        }}
        className="w-full px-3 py-2.5 text-left text-rose-400 hover:bg-rose-500/15 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-hidden flex items-center gap-2.5 transition-colors min-h-10 rounded-lg cursor-pointer"
      >
        <XSquare size={14} />
        <span>{t.contextMenu.closeAllWindows}</span>
      </button>
    </div>
  );
};
