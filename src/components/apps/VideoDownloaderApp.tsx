// src/components/apps/VideoDownloaderApp.tsx
"use client";

import React, { useState } from "react";
import {
  DownloadCloud,
  Film,
  ListPlus,
  Music,
  History,
  AlertCircle,
} from "lucide-react";
import { VideoStreamInfo, DownloadHistoryItem } from "./videoDownloader/types";
import { UrlInspector } from "./videoDownloader/UrlInspector";
import { VideoPreviewCard } from "./videoDownloader/VideoPreviewCard";
import { BatchDownloaderTab } from "./videoDownloader/BatchDownloaderTab";
import { AudioExtractorTab } from "./videoDownloader/AudioExtractorTab";
import { DownloadHistoryTab } from "./videoDownloader/DownloadHistoryTab";

type ActiveTab = "quick" | "batch" | "extractor" | "history";

const STORAGE_KEY = "sonos_video_downloader_history";

export const VideoDownloaderApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("quick");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<VideoStreamInfo | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (items: DownloadHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const handleInspect = async (targetUrl?: string) => {
    const inspectUrl = (targetUrl || url).trim();
    if (!inspectUrl) return;

    setIsLoading(true);
    setError(null);
    setCurrentStream(null);

    try {
      const res = await fetch("/api/video-downloader/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inspectUrl }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setCurrentStream(data.data);
      } else {
        setError(data.error || "Gagal menemukan video stream pada URL tersebut.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadStarted = (stream: VideoStreamInfo) => {
    const newItem: DownloadHistoryItem = {
      id: `dl-${Date.now()}`,
      title: stream.title,
      url: stream.url,
      filename: stream.filename,
      format: stream.mimeType.split("/")[1] || "mp4",
      sizeBytes: stream.sizeBytes,
      downloadedAt: Date.now(),
      status: "completed",
    };

    const updated = [newItem, ...history.filter((h) => h.url !== stream.url)].slice(0, 50);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    saveHistory(history.filter((h) => h.id !== id));
  };

  const handleSwitchToAudioExtractor = (stream: VideoStreamInfo) => {
    setCurrentStream(stream);
    setActiveTab("extractor");
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans relative">
      {/* Top Header Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-zinc-900/90 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shrink-0">
            <DownloadCloud size={17} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                Video Downloader
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                v1.0.0
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              Unduh video langsung dari URL, proxy stream, & ekstrak audio MP3
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("quick")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "quick"
                ? "bg-cyan-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Film size={13} />
            <span className="hidden xs:inline">Unduh Cepat</span>
          </button>

          <button
            onClick={() => setActiveTab("batch")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "batch"
                ? "bg-cyan-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ListPlus size={13} />
            <span className="hidden xs:inline">Batch Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("extractor")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "extractor"
                ? "bg-cyan-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Music size={13} />
            <span className="hidden xs:inline">Ekstrak Audio</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-cyan-500 text-zinc-950 shadow-md font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <History size={13} />
            <span className="hidden xs:inline">Riwayat</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Tab 1: Quick Downloader */}
        {activeTab === "quick" && (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            <UrlInspector
              url={url}
              isLoading={isLoading}
              onUrlChange={setUrl}
              onInspect={handleInspect}
            />

            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-200 shadow-lg animate-in fade-in">
                <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-rose-300">Gagal Memeriksa URL</span>
                  <p className="text-rose-200/90 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {currentStream && (
              <VideoPreviewCard
                streamInfo={currentStream}
                onDownloadStarted={handleDownloadStarted}
                onExtractAudio={handleSwitchToAudioExtractor}
              />
            )}
          </div>
        )}

        {/* Tab 2: Batch Downloader */}
        {activeTab === "batch" && (
          <div className="max-w-4xl mx-auto w-full">
            <BatchDownloaderTab />
          </div>
        )}

        {/* Tab 3: Audio Extractor */}
        {activeTab === "extractor" && (
          <div className="max-w-4xl mx-auto w-full">
            <AudioExtractorTab initialStreamInfo={currentStream} />
          </div>
        )}

        {/* Tab 4: Download History */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto w-full">
            <DownloadHistoryTab
              history={history}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>
        )}
      </div>
    </div>
  );
};
