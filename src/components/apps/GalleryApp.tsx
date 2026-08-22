/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, X, Monitor } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

interface GalleryItem {
  id: string;
  title: string;
  category: "UI/UX" | "Web Dev" | "Wallpapers" | "Photography";
  url: string;
  resolution: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Son-OS Minimalist Desktop Workspace",
    category: "UI/UX",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=95",
    resolution: "3840 x 2160",
  },
  {
    id: "g2",
    title: "Japanese Quiz App Battleground",
    category: "Web Dev",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2560&q=95",
    resolution: "2560 x 1440",
  },
  {
    id: "g3",
    title: "Cyberpunk Neon Cityscape Wallpaper",
    category: "Wallpapers",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=3840&q=95",
    resolution: "3840 x 2160",
  },
  {
    id: "g4",
    title: "Lovely Ever Wedding Invitation Dashboard",
    category: "UI/UX",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2880&q=95",
    resolution: "2880 x 1800",
  },
  {
    id: "g5",
    title: "Minimalist Mountain Dawn",
    category: "Photography",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3840&q=95",
    resolution: "3840 x 2160",
  },
  {
    id: "g6",
    title: "Dark Mode Code Syntax Editor",
    category: "Web Dev",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2560&q=95",
    resolution: "2560 x 1440",
  },
];

const CATEGORIES = ["Semua", "UI/UX", "Web Dev", "Wallpapers", "Photography"];

import { useTranslation } from "@/i18n";

export const GalleryApp: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const { setWallpaper, showNotification } = useWindowStore();

  const filteredItems = GALLERY_ITEMS.filter(
    (item) => selectedCategory === "Semua" || item.category === selectedCategory
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setRotation(0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleSetWallpaper = (imageUrl: string, title?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWallpaper(imageUrl);
    showNotification(
      t.notifications.wallpaperUpdatedTitle,
      `"${title || "Portofolio"}" ${t.notifications.wallpaperUpdatedDesc}`,
      t.apps["gallery"]?.title || "Gallery",
      "Monitor"
    );
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    setZoomLevel(1);
    setRotation(0);
  };

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none p-4 sm:p-5 relative">
      {/* Category Pill Navigation Header (ChromeOS Media / Gallery Tab Style) */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 overflow-x-auto shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 overflow-y-auto flex-1 pr-1">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-video cursor-pointer"
          >
            {/* eslint-disable-next-html-element-suppression */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
              {/* Quick Set Wallpaper Button */}
              <div className="flex justify-end">
                <button
                  onClick={(e) => handleSetWallpaper(item.url, item.title, e)}
                  className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-blue-600 text-[10px] text-white font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors border border-white/20 shadow-md"
                  title="Jadikan Wallpaper Desktop"
                >
                  <Monitor size={12} /> Set Wallpaper
                </button>
              </div>

              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-xs font-semibold text-white line-clamp-1">{item.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 select-none">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{currentItem.title}</h3>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentItem.category} • {currentItem.resolution}
              </span>
            </div>

            {/* Controls & Set Wallpaper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSetWallpaper(currentItem.url, currentItem.title)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                title="Jadikan Wallpaper Desktop"
              >
                <Monitor size={14} /> Set as Wallpaper
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200"
                title="Rotate"
              >
                <RotateCw size={16} />
              </button>
              <a
                href={currentItem.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200"
                title="Download / Open Original"
              >
                <Download size={16} />
              </a>
              <button
                onClick={closeLightbox}
                className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lightbox Image Preview Area */}
          <div className="flex-1 flex items-center justify-between relative overflow-hidden my-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white z-10 min-h-11 min-w-11 flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
              {/* eslint-disable-next-html-element-suppression */}
              <img
                src={currentItem.url}
                alt={currentItem.title}
                className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 shadow-2xl"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              />
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white z-10 min-h-11 min-w-11 flex items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
