"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Clock as ClockIcon,
  Sun,
  Calendar as CalendarIcon,
  StickyNote,
  ShieldCheck,
  Calculator,
  RotateCcw,
} from "lucide-react";
import { useWindowStore, DesktopWidgetType } from "@/store/windowStore";

interface WidgetCatalogItem {
  type: DesktopWidgetType;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
}

const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    type: "clock",
    title: "Jam Sistem",
    category: "Waktu & Tanggal",
    description: "Tampilan jam digital real-time beserta hari dan tanggal.",
    icon: <ClockIcon size={20} className="text-blue-400" />,
    accentColor: "bg-blue-600/20 border-blue-500/30",
  },
  {
    type: "weather",
    title: "Perkiraan Cuaca",
    category: "Informasi",
    description: "Informasi cuaca dan suhu real-time berdasarkan lokasi Anda.",
    icon: <Sun size={20} className="text-amber-400" />,
    accentColor: "bg-amber-500/20 border-amber-500/30",
  },
  {
    type: "calendar",
    title: "Kalender Bulanan",
    category: "Waktu & Tanggal",
    description: "Widget kalender bulanan mini untuk memantau tanggal aktif.",
    icon: <CalendarIcon size={20} className="text-rose-400" />,
    accentColor: "bg-rose-500/20 border-rose-500/30",
  },
  {
    type: "notes",
    title: "Catatan Cepat",
    category: "Produktivitas",
    description: "Sticky note untuk menulis pesan singkat langsung di desktop.",
    icon: <StickyNote size={20} className="text-amber-300" />,
    accentColor: "bg-amber-400/20 border-amber-400/30",
  },
  {
    type: "system",
    title: "Status Sistem",
    category: "Utilitas",
    description: "Monitor status RAM, baterai, dan kesehatan sistem Son-OS.",
    icon: <ShieldCheck size={20} className="text-emerald-400" />,
    accentColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  {
    type: "calculator",
    title: "Kalkulator Cepat",
    category: "Utilitas",
    description: "Kalkulator mini untuk perhitungan matematika instan di desktop.",
    icon: <Calculator size={20} className="text-purple-400" />,
    accentColor: "bg-purple-500/20 border-purple-500/30",
  },
];

export const WidgetGalleryModal: React.FC = () => {
  const {
    widgetGalleryOpen,
    toggleWidgetGallery,
    desktopWidgets,
    addWidget,
    removeWidget,
    resetWidgets,
  } = useWindowStore();

  const [search, setSearch] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetGalleryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleWidgetGallery(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [widgetGalleryOpen, toggleWidgetGallery]);

  const filteredCatalog = WIDGET_CATALOG.filter(
    (w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {widgetGalleryOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 select-none">
          {/* Backdrop Click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleWidgetGallery(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Gallery Modal Container (macOS Sonoma style) */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-3xl bg-zinc-950/95 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl text-zinc-100 flex flex-col gap-5 max-h-[85vh] z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Galeri Widget Desktop
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Tambahkan widget ke desktop Anda ala macOS Sonoma &amp; ChromeOS.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetWidgets}
                  title="Reset ke widget default"
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={13} /> Reset
                </button>

                <button
                  onClick={() => toggleWidgetGallery(false)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari widget (misal: Jam, Cuaca, Notes)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Widget Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 flex-1 min-h-75">
              {filteredCatalog.map((catalogItem) => {
                const activeCount = desktopWidgets.filter((w) => w.type === catalogItem.type).length;
                const isAdded = activeCount > 0;

                return (
                  <div
                    key={catalogItem.type}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-2xl border ${catalogItem.accentColor} shrink-0`}>
                          {catalogItem.icon}
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            {catalogItem.category}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {catalogItem.title}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {catalogItem.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {isAdded ? `${activeCount} aktif di Desktop` : "Belum ditambahkan"}
                      </span>

                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <button
                            onClick={() => {
                              const found = desktopWidgets.find((w) => w.type === catalogItem.type);
                              if (found) removeWidget(found.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        )}

                        <button
                          onClick={() => addWidget(catalogItem.type)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={14} /> Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
