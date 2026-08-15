// src/components/apps/videoDownloader/BatchDownloaderTab.tsx
"use client";

import React, { useState } from "react";
import {
  ListPlus,
  Play,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowDownToLine,
} from "lucide-react";
import { VideoStreamInfo } from "./types";

interface BatchItem {
  id: string;
  url: string;
  status: "idle" | "inspecting" | "ready" | "downloading" | "completed" | "failed";
  info?: VideoStreamInfo;
  error?: string;
  progress?: number;
}

export const BatchDownloaderTab: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParseUrls = () => {
    const urls = inputText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (urls.length === 0) return;

    const newItems: BatchItem[] = urls.map((u, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      url: u,
      status: "idle",
    }));

    setItems(newItems);
    setInputText("");
  };

  const handleInspectAll = async () => {
    setIsProcessing(true);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "completed") continue;

      updated[i] = { ...updated[i], status: "inspecting", error: undefined };
      setItems([...updated]);

      try {
        const res = await fetch("/api/video-downloader/inspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: updated[i].url }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          updated[i] = {
            ...updated[i],
            status: "ready",
            info: data.data,
          };
        } else {
          updated[i] = {
            ...updated[i],
            status: "failed",
            error: data.error || "Gagal memeriksa stream",
          };
        }
      } catch (err: unknown) {
        updated[i] = {
          ...updated[i],
          status: "failed",
          error: err instanceof Error ? err.message : "Koneksi gagal",
        };
      }
      setItems([...updated]);
    }

    setIsProcessing(false);
  };

  const handleDownloadAllReady = async () => {
    const readyItems = items.filter((item) => item.status === "ready" && item.info);
    if (readyItems.length === 0) return;

    for (const item of readyItems) {
      if (!item.info) continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "downloading" } : it))
      );

      // Trigger download via proxy URL
      const a = document.createElement("a");
      a.href = item.info.proxyUrl;
      a.download = item.info.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      await new Promise((r) => setTimeout(r, 600));

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "completed" } : it))
      );
    }
  };

  const handleClear = () => {
    setItems([]);
  };

  const readyCount = items.filter((i) => i.status === "ready").length;
  const completedCount = items.filter((i) => i.status === "completed").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Batch Input Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
            <ListPlus size={16} className="text-cyan-400" />
            <span>Masukkan Banyak URL Video (Batch Queue)</span>
          </div>
          <span className="text-[11px] text-zinc-400">1 baris per URL</span>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4`}
          rows={4}
          className="w-full p-3 bg-black/50 text-zinc-100 text-xs font-mono rounded-xl border border-white/10 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none placeholder:text-zinc-600 resize-y"
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={handleParseUrls}
            disabled={!inputText.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <ListPlus size={14} />
            <span>Tambahkan ke Antrean</span>
          </button>

          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleInspectAll}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Play size={14} />
                )}
                <span>Periksa Semua ({items.length})</span>
              </button>

              {readyCount > 0 && (
                <button
                  onClick={handleDownloadAllReady}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowDownToLine size={14} />
                  <span>Unduh Semua Siap ({readyCount})</span>
                </button>
              )}

              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Hapus Semua Antrean"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Queue List */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
            <span>Daftar Antrean Video ({items.length})</span>
            <span>
              Selesai: {completedCount} / {items.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-zinc-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">
                      {item.info?.title || item.url}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">
                      {item.info ? `${item.info.filename} • ${item.info.domain}` : item.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "idle" && (
                    <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                      Menunggu
                    </span>
                  )}
                  {item.status === "inspecting" && (
                    <span className="text-[10px] text-purple-400 flex items-center gap-1">
                      <Loader2 className="animate-spin" size={12} />
                      Menganalisis...
                    </span>
                  )}
                  {item.status === "ready" && item.info && (
                    <a
                      href={item.info.proxyUrl}
                      download={item.info.filename}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Download size={12} /> Unduh
                    </a>
                  )}
                  {item.status === "downloading" && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <Loader2 className="animate-spin" size={12} />
                      Mengunduh...
                    </span>
                  )}
                  {item.status === "completed" && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 size={13} /> Selesai
                    </span>
                  )}
                  {item.status === "failed" && (
                    <span
                      className="text-[10px] text-rose-400 flex items-center gap-1"
                      title={item.error}
                    >
                      <AlertCircle size={12} /> Gagal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
