// src/components/apps/videoDownloader/DownloadHistoryTab.tsx
"use client";

import React, { useState } from "react";
import {
  History,
  Download,
  Trash2,
  Play,
  Film,
  HardDrive,
  Calendar,
  X,
} from "lucide-react";
import { DownloadHistoryItem } from "./types";
import { useTranslation } from "@/i18n";

interface DownloadHistoryTabProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const DownloadHistoryTab: React.FC<DownloadHistoryTabProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
}) => {
  const { language } = useTranslation();
  const isEn = language === "en";
  const [searchQuery, setSearchQuery] = useState("");
  const [playingItem, setPlayingItem] = useState<DownloadHistoryItem | null>(null);

  const filtered = history.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return "Stream";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleDateString(isEn ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar & Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
          <History size={16} className="text-cyan-400" />
          <span>{isEn ? `Download History (${history.length})` : `Riwayat Unduhan (${history.length})`}</span>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari riwayat..."
                className="px-3 py-1.5 bg-zinc-900/90 text-zinc-100 text-xs rounded-xl border border-white/10 focus:border-cyan-500/80 focus:outline-none placeholder:text-zinc-500 w-36 sm:w-48"
              />

              <button
                onClick={onClearHistory}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Hapus Semua Riwayat"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Items Grid / List */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col items-center justify-center text-center gap-2 text-zinc-500">
          <Film size={32} className="text-zinc-600" />
          <p className="text-xs">
            {history.length === 0
              ? "Belum ada riwayat video yang diunduh."
              : "Tidak ada riwayat yang cocok dengan pencarian."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between gap-3 shadow-lg hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                    <Film size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-white truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">
                      {item.filename}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Hapus item"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1 font-mono">
                  <HardDrive size={11} className="text-purple-400" />
                  {formatBytes(item.sizeBytes)}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-zinc-500" />
                  {formatDate(item.downloadedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayingItem(item)}
                  className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play size={13} className="text-cyan-400" />
                  <span>Putar</span>
                </button>

                <a
                  href={`/api/video-downloader/stream?url=${encodeURIComponent(
                    item.url
                  )}&filename=${encodeURIComponent(item.filename)}`}
                  download={item.filename}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  title="Unduh ulang"
                >
                  <Download size={13} />
                  <span>Unduh Lagi</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {playingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2 truncate pr-2">
                <Film size={16} className="text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  {playingItem.title}
                </span>
              </div>
              <button
                onClick={() => setPlayingItem(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={playingItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
