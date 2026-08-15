// src/components/apps/videoDownloader/UrlInspector.tsx
"use client";

import React, { useState } from "react";
import {
  Search,
  Clipboard,
  X,
  Sparkles,
  Loader2,
  ArrowRight,
  Film,
} from "lucide-react";
import { PRESET_SAMPLES, PresetSample } from "./presetSamples";

interface UrlInspectorProps {
  url: string;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onInspect: (targetUrl?: string) => void;
}

export const UrlInspector: React.FC<UrlInspectorProps> = ({
  url,
  isLoading,
  onUrlChange,
  onInspect,
}) => {
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null);

  const handlePasteClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith("http")) {
          onUrlChange(text.trim());
          onInspect(text.trim());
        }
      }
    } catch {
      // Permission rejected or not supported
    }
  };

  const handleSelectPreset = (sample: PresetSample) => {
    setCopiedPresetId(sample.id);
    onUrlChange(sample.url);
    onInspect(sample.url);
    setTimeout(() => setCopiedPresetId(null), 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onInspect(url.trim());
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            <Film size={18} className="text-cyan-400" />
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Tempel tautan video (.mp4, .webm, cdn link, web video URL)..."
            required
            className="w-full pl-10 pr-24 py-3 bg-zinc-900/90 hover:bg-zinc-900 text-zinc-100 text-xs sm:text-sm rounded-2xl border border-white/10 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder:text-zinc-500 shadow-inner"
          />

          {/* Quick Action Buttons inside input */}
          <div className="absolute right-2 flex items-center gap-1">
            {url && (
              <button
                type="button"
                onClick={() => onUrlChange("")}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Hapus URL"
              >
                <X size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-[11px] font-medium"
              title="Tempel dari Clipboard"
            >
              <Clipboard size={14} />
              <span>Tempel</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="ml-2 px-4 sm:px-5 py-3 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span className="hidden sm:inline">Menganalisis...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Periksa Video</span>
              <ArrowRight size={14} className="hidden sm:inline" />
            </>
          )}
        </button>
      </form>

      {/* Preset Test Samples Section */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
          <Sparkles size={13} className="text-amber-400" />
          <span>Coba contoh video instan:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_SAMPLES.map((sample) => {
            const isSelected = url === sample.url;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected || copiedPresetId === sample.id
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-sm"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 active:scale-95"
                }`}
                title={`${sample.description} (${sample.approxSize})`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{sample.name}</span>
                <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-zinc-400">
                  {sample.approxSize}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
