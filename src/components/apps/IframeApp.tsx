"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, RotateCw, AlertTriangle, Loader2, Globe, Code2, ZoomIn, ZoomOut } from "lucide-react";

interface IframeAppProps {
  url: string;
  title: string;
  githubUrl?: string;
  initialZoom?: number;
}

export const IframeApp: React.FC<IframeAppProps> = ({ url, title, githubUrl, initialZoom = 0.85 }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0); // used for reload
  const [zoom, setZoom] = useState<number>(initialZoom);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasTimedOut(true);
    }, 8000);

    timerRef.current = timer;

    return () => {
      clearTimeout(timer);
    };
  }, [url, key]);

  const handleLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(false);
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasTimedOut(false);
    setKey((prev) => prev + 1);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(1.25, Math.round((prev + 0.05) * 100) / 100));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.50, Math.round((prev - 0.05) * 100) / 100));
  const handleResetZoom = () => setZoom(initialZoom);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Toolbar */}
      <div className="h-10 px-3 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 max-w-md w-full truncate">
            <Globe size={13} className="text-zinc-400 shrink-0" />
            <span className="truncate">{url}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg px-1 py-0.5 text-zinc-400">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.50}
              title="Perkecil Tampilan (Zoom Out)"
              className="p-1 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleResetZoom}
              title={`Reset Zoom ke ${Math.round(initialZoom * 100)}%`}
              className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white hover:bg-white/10 rounded cursor-pointer min-w-9 text-center"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 1.25}
              title="Perbesar Tampilan (Zoom In)"
              className="p-1 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <button
            onClick={handleReload}
            title="Reload frame"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
          </button>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View on GitHub"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Code2 size={13} />
            </a>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors cursor-pointer"
          >
            <span>Open</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className={`relative flex-1 w-full h-full bg-zinc-950 overflow-hidden ${isLoading ? "cursor-wait" : ""}`}>
        {/* Loading Spinner Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <p className="text-xs text-zinc-400 font-medium">Memuat {title}...</p>
          </div>
        )}

        {/* Fallback Screen on Timeout */}
        {hasTimedOut ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 p-6 bg-zinc-950 text-center select-none">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle size={36} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-semibold text-zinc-100">Preview tidak tersedia saat ini</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Situs web ini membatasi tampilan iframe (X-Frame-Options) atau membutuhkan waktu muat lebih lama.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReload}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-2"
              >
                <RotateCw size={13} /> Coba lagi
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <ExternalLink size={13} /> Buka di tab baru
              </a>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full origin-top-left transition-all duration-150"
            style={{
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`,
              transform: `scale(${zoom})`,
            }}
          >
            <iframe
              key={key}
              src={url}
              title={title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              onLoad={handleLoad}
            />
          </div>
        )}
      </div>
    </div>
  );
};
