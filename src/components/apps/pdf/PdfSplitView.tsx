"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Scissors,
  Plus,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  Loader2,
  Download,
} from "lucide-react";
import { renderPageToJpgBlob, handleDownloadSinglePagePdf } from "./pdfOperations";

export interface SplitRange {
  start: number;
  end: number;
  label: string;
}

interface PdfSplitViewProps {
  pdfBuffer: ArrayBuffer;
  numPages: number;
  splitRanges: SplitRange[];
  setSplitRanges: React.Dispatch<React.SetStateAction<SplitRange[]>>;
  isLight: boolean;
  onPreviewPage?: (pageNum: number) => void;
}

const PART_COLORS = [
  { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-500", badge: "bg-blue-500 text-white", ring: "ring-blue-500/30" },
  { bg: "bg-purple-500/10", border: "border-purple-500", text: "text-purple-500", badge: "bg-purple-500 text-white", ring: "ring-purple-500/30" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-500", badge: "bg-emerald-500 text-white", ring: "ring-emerald-500/30" },
  { bg: "bg-amber-500/10", border: "border-amber-500", text: "text-amber-500", badge: "bg-amber-500 text-white", ring: "ring-amber-500/30" },
  { bg: "bg-rose-500/10", border: "border-rose-500", text: "text-rose-500", badge: "bg-rose-500 text-white", ring: "ring-rose-500/30" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500", text: "text-cyan-500", badge: "bg-cyan-500 text-white", ring: "ring-cyan-500/30" },
  { bg: "bg-indigo-500/10", border: "border-indigo-500", text: "text-indigo-500", badge: "bg-indigo-500 text-white", ring: "ring-indigo-500/30" },
  { bg: "bg-teal-500/10", border: "border-teal-500", text: "text-teal-500", badge: "bg-teal-500 text-white", ring: "ring-teal-500/30" },
  { bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-500", badge: "bg-orange-500 text-white", ring: "ring-orange-500/30" },
  { bg: "bg-pink-500/10", border: "border-pink-500", text: "text-pink-500", badge: "bg-pink-500 text-white", ring: "ring-pink-500/30" },
];

export const PdfSplitView: React.FC<PdfSplitViewProps> = ({
  pdfBuffer,
  numPages,
  splitRanges,
  setSplitRanges,
  isLight,
}) => {
  // Density columns: 'compact' (6-8 cols), 'medium' (4-6 cols), 'large' (3-4 cols)
  const [density, setDensity] = useState<"compact" | "medium" | "large">("compact");
  const [jumpPage, setJumpPage] = useState<string>("");
  const [hoveredDivider, setHoveredDivider] = useState<number | null>(null);

  // In-place Popup Modal Preview State
  const [modalPreviewPage, setModalPreviewPage] = useState<number | null>(null);

  // pdfjs document state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  // Thumbnail cache (pageNumber -> dataUrl)
  const [thumbCache, setThumbCache] = useState<Record<number, string>>({});
  const renderingQueueRef = useRef<Set<number>>(new Set());

  // Load PDF Document once whenever pdfBuffer changes
  useEffect(() => {
    if (!pdfBuffer || pdfBuffer.byteLength === 0) return;
    let cancelled = false;

    const initPdf = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const bufferCopy = pdfBuffer.slice(0);
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(bufferCopy),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setThumbCache({});
        }
      } catch (err) {
        console.error("Failed to load PDF doc for split view:", err);
      }
    };

    initPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfBuffer]);

  // Lazy render a thumbnail on demand
  const renderThumbnail = useCallback(async (pageNum: number) => {
    if (thumbCache[pageNum] || renderingQueueRef.current.has(pageNum) || !pdfDoc) {
      return;
    }

    renderingQueueRef.current.add(pageNum);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.35 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renderTask = page.render({ canvasContext: ctx, viewport } as any);
      await renderTask.promise;

      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      setThumbCache((prev) => ({ ...prev, [pageNum]: dataUrl }));
    } catch (err) {
      console.error(`Failed rendering thumbnail for page ${pageNum}:`, err);
    } finally {
      renderingQueueRef.current.delete(pageNum);
    }
  }, [thumbCache, pdfDoc]);

  // Page to Part Mapping
  const pageToPartMap = useMemo(() => {
    const map = new Map<number, { partIndex: number; range: SplitRange; isStart: boolean; isEnd: boolean }>();
    splitRanges.forEach((range, pIdx) => {
      const start = Math.max(1, range.start);
      const end = Math.min(numPages, range.end);
      for (let p = start; p <= end; p++) {
        map.set(p, {
          partIndex: pIdx,
          range,
          isStart: p === start,
          isEnd: p === end,
        });
      }
    });
    return map;
  }, [splitRanges, numPages]);

  // Split points (pages after which a split cut occurs)
  const cutPoints = useMemo(() => {
    const points = new Set<number>();
    splitRanges.forEach((range) => {
      if (range.end < numPages) {
        points.add(range.end);
      }
    });
    return points;
  }, [splitRanges, numPages]);

  // Quick Preset Handlers
  const handleSplitEveryNPages = (n: number) => {
    const newRanges: SplitRange[] = [];
    let currentStart = 1;
    let partNum = 1;

    while (currentStart <= numPages) {
      const currentEnd = Math.min(numPages, currentStart + n - 1);
      newRanges.push({
        start: currentStart,
        end: currentEnd,
        label: `part${partNum}`,
      });
      currentStart = currentEnd + 1;
      partNum++;
    }
    setSplitRanges(newRanges);
  };

  const handleSplitEqualParts = (partsCount: number) => {
    if (numPages <= 0) return;
    const count = Math.min(partsCount, numPages);
    const pagesPerPart = Math.ceil(numPages / count);
    const newRanges: SplitRange[] = [];
    let start = 1;
    let partNum = 1;

    while (start <= numPages && partNum <= count) {
      const end = Math.min(numPages, start + pagesPerPart - 1);
      newRanges.push({
        start,
        end,
        label: `part${partNum}`,
      });
      start = end + 1;
      partNum++;
    }
    setSplitRanges(newRanges);
  };

  // Toggle cut divider between page and page + 1
  const handleToggleCutPoint = (afterPage: number) => {
    if (afterPage >= numPages || afterPage < 1) return;

    // Find the range that covers afterPage
    const rangeIdx = splitRanges.findIndex((r) => afterPage >= r.start && afterPage < r.end);

    if (rangeIdx !== -1) {
      // Split this range into two
      const targetRange = splitRanges[rangeIdx];
      const partA: SplitRange = {
        start: targetRange.start,
        end: afterPage,
        label: targetRange.label,
      };
      const partB: SplitRange = {
        start: afterPage + 1,
        end: targetRange.end,
        label: `part${splitRanges.length + 1}`,
      };

      const updated = [...splitRanges];
      updated.splice(rangeIdx, 1, partA, partB);
      setSplitRanges(updated);
    } else {
      // Check if afterPage is the end of rangeIdx and start of rangeIdx + 1 (Merge them)
      const exactEndIdx = splitRanges.findIndex((r) => r.end === afterPage);
      const nextStartIdx = splitRanges.findIndex((r) => r.start === afterPage + 1);

      if (exactEndIdx !== -1 && nextStartIdx !== -1) {
        const merged: SplitRange = {
          start: splitRanges[exactEndIdx].start,
          end: splitRanges[nextStartIdx].end,
          label: splitRanges[exactEndIdx].label,
        };
        const updated = splitRanges.filter((_, i) => i !== exactEndIdx && i !== nextStartIdx);
        updated.splice(Math.min(exactEndIdx, nextStartIdx), 0, merged);
        setSplitRanges(updated);
      }
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      const el = document.getElementById(`pdf-split-page-${p}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const gridColsClass =
    density === "compact"
      ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
      : density === "medium"
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {/* Top Controls & Presets Bar */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none ${
          isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        {/* Quick Split Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[11px] opacity-75 mr-1 flex items-center gap-1">
            <Sparkles size={13} className="text-rose-500" /> Preset Cepat:
          </span>
          <button
            type="button"
            onClick={() => handleSplitEveryNPages(1)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
            }`}
          >
            Tiap 1 Hal
          </button>
          <button
            type="button"
            onClick={() => handleSplitEveryNPages(2)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
            }`}
          >
            Tiap 2 Hal
          </button>
          <button
            type="button"
            onClick={() => handleSplitEveryNPages(5)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
            }`}
          >
            Tiap 5 Hal
          </button>
          <button
            type="button"
            onClick={() => handleSplitEveryNPages(10)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
            }`}
          >
            Tiap 10 Hal
          </button>
          <button
            type="button"
            onClick={() => handleSplitEqualParts(2)}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
            }`}
          >
            Bagi 2 Sama
          </button>
        </div>

        {/* Right Tools: Jump & Density */}
        <div className="flex items-center gap-2.5">
          {/* Jump to Page Form */}
          {numPages > 12 && (
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={numPages}
                placeholder="Hal..."
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                className={`w-16 px-2 py-1 rounded-lg border text-xs outline-hidden ${
                  isLight ? "bg-white border-slate-300" : "bg-white/10 border-white/15 text-white"
                }`}
              />
              <button
                type="submit"
                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
              >
                Go
              </button>
            </form>
          )}

          {/* Density Selector */}
          <div
            className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
              isLight ? "bg-slate-200 border-slate-300" : "bg-white/5 border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                density === "compact"
                  ? "bg-rose-600 text-white shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Kecil (6-8 Kolom)"
            >
              Kecil
            </button>
            <button
              type="button"
              onClick={() => setDensity("medium")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                density === "medium"
                  ? "bg-rose-600 text-white shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Sedang (4-6 Kolom)"
            >
              Sedang
            </button>
            <button
              type="button"
              onClick={() => setDensity("large")}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                density === "large"
                  ? "bg-rose-600 text-white shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Besar (2-4 Kolom)"
            >
              Besar
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Page Grid Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <div className={`grid ${gridColsClass} gap-3 md:gap-4 max-w-7xl mx-auto`}>
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
            const partInfo = pageToPartMap.get(pageNum);
            const colorConfig = partInfo ? PART_COLORS[partInfo.partIndex % PART_COLORS.length] : null;
            const isCutPoint = cutPoints.has(pageNum);

            return (
              <SplitPageThumbnail
                key={pageNum}
                pageNum={pageNum}
                docReady={!!pdfDoc}
                thumbData={thumbCache[pageNum]}
                onVisible={() => renderThumbnail(pageNum)}
                partInfo={partInfo}
                colorConfig={colorConfig}
                isCutPoint={isCutPoint}
                isLight={isLight}
                onToggleCut={() => handleToggleCutPoint(pageNum)}
                onPreview={() => setModalPreviewPage(pageNum)}
                isLastPage={pageNum === numPages}
                isHoveredCut={hoveredDivider === pageNum}
                setHoveredCut={setHoveredDivider}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div
        className={`px-4 py-2 border-t flex flex-wrap items-center justify-between text-xs shrink-0 select-none ${
          isLight ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-zinc-900/90 border-white/10 text-zinc-300"
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-rose-500">Hasil Split:</span>
          <span className="font-bold">{splitRanges.length} File PDF Baru</span>
          <span className="opacity-50">•</span>
          <span className="text-[11px] opacity-75">
            Klik garis gunting antar halaman untuk menambah/menghapus batas split
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 no-scrollbar">
          {splitRanges.map((range, idx) => {
            const color = PART_COLORS[idx % PART_COLORS.length];
            const pageCount = Math.max(0, range.end - range.start + 1);
            return (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${color.bg} ${color.border} ${color.text}`}
              >
                <span>Bagian {idx + 1}:</span>
                <span className="font-mono">Hal {range.start}–{range.end}</span>
                <span className="opacity-60">({pageCount} hal)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-Place High-Res Page Preview Popup Modal */}
      {modalPreviewPage !== null && (
        <PdfPageModalPreview
          pageNum={modalPreviewPage}
          numPages={numPages}
          pdfDoc={pdfDoc}
          pdfBuffer={pdfBuffer}
          partInfo={pageToPartMap.get(modalPreviewPage)}
          onClose={() => setModalPreviewPage(null)}
          onPrevPage={() => setModalPreviewPage((p) => (p && p > 1 ? p - 1 : p))}
          onNextPage={() => setModalPreviewPage((p) => (p && p < numPages ? p + 1 : p))}
          isLight={isLight}
        />
      )}
    </div>
  );
};

interface SplitPageThumbnailProps {
  pageNum: number;
  docReady: boolean;
  thumbData?: string;
  onVisible: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partInfo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colorConfig: any;
  isCutPoint: boolean;
  isLight: boolean;
  onToggleCut: () => void;
  onPreview: () => void;
  isLastPage: boolean;
  isHoveredCut: boolean;
  setHoveredCut: (p: number | null) => void;
}

const SplitPageThumbnail: React.FC<SplitPageThumbnailProps> = ({
  pageNum,
  docReady,
  thumbData,
  onVisible,
  partInfo,
  colorConfig,
  isCutPoint,
  isLight,
  onToggleCut,
  onPreview,
  isLastPage,
  isHoveredCut,
  setHoveredCut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger thumbnail rendering with IntersectionObserver
  useEffect(() => {
    if (!docReady || thumbData) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: "250px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [docReady, thumbData, onVisible]);

  return (
    <div
      id={`pdf-split-page-${pageNum}`}
      ref={containerRef}
      className="relative flex flex-col group"
    >
      {/* Page Card */}
      <div
        className={`relative rounded-xl border-2 transition-all overflow-hidden flex flex-col bg-white select-none ${
          colorConfig
            ? `${colorConfig.border} ${colorConfig.bg} shadow-md`
            : isLight
            ? "border-slate-200 shadow-xs"
            : "border-white/10 bg-white/5"
        }`}
      >
        {/* Top Header Badge */}
        <div className="px-2 py-1 flex items-center justify-between bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-bold z-10">
          <span className="font-mono">Hal {pageNum}</span>
          {partInfo && (
            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-semibold ${colorConfig.badge}`}>
              Part {partInfo.partIndex + 1}
            </span>
          )}
        </div>

        {/* Thumbnail Preview Area */}
        <div className="relative aspect-3/4 w-full flex items-center justify-center bg-zinc-100 overflow-hidden">
          {thumbData ? (
            <Image
              src={thumbData}
              alt={`Page ${pageNum}`}
              fill
              unoptimized
              className="object-contain pointer-events-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 gap-1 p-2">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] font-mono">Memuat...</span>
            </div>
          )}

          {/* Quick Preview Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="p-1.5 rounded-lg bg-white text-zinc-900 hover:scale-110 transition-all cursor-pointer shadow-md"
              title="Lihat & Download Halaman"
            >
              <Eye size={13} />
            </button>
            {thumbData && (
              <a
                href={thumbData}
                download={`halaman_${pageNum}.jpg`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white hover:scale-110 transition-all cursor-pointer shadow-md"
                title={`Unduh Halaman ${pageNum} (.jpg)`}
              >
                <Download size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Part Indicator */}
        {partInfo && (
          <div className={`px-2 py-0.5 text-center text-[9px] font-semibold truncate ${colorConfig.text} bg-black/5`}>
            {partInfo.range.label}
          </div>
        )}
      </div>

      {/* Split Divider / Cut Action Line (placed on the right edge of tile unless last page) */}
      {!isLastPage && (
        <div
          className="absolute -right-2 top-0 bottom-0 w-4 z-20 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setHoveredCut(pageNum)}
          onMouseLeave={() => setHoveredCut(null)}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCut();
          }}
          title={isCutPoint ? "Hapus batas split (Gabung bagian)" : "Potong di sini (Buat bagian baru)"}
        >
          {isCutPoint ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-0.5 h-full bg-rose-500 shadow-sm" />
              <div className="absolute p-1 rounded-full bg-rose-600 text-white shadow-lg scale-110 hover:scale-125 transition-transform">
                <Scissors size={10} />
              </div>
            </div>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center transition-opacity ${
              isHoveredCut ? "opacity-100" : "opacity-0"
            }`}>
              <div className="w-0.5 h-full border-r border-dashed border-rose-400" />
              <div className="absolute p-0.5 rounded-full bg-zinc-800 text-rose-400 border border-rose-500 shadow-md">
                <Plus size={10} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// High-Res Page Preview Popup Modal
interface PdfPageModalPreviewProps {
  pageNum: number;
  numPages: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any;
  pdfBuffer: ArrayBuffer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partInfo?: any;
  onClose: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLight: boolean;
}

const PdfPageModalPreview: React.FC<PdfPageModalPreviewProps> = ({
  pageNum,
  numPages,
  pdfDoc,
  pdfBuffer,
  partInfo,
  onClose,
  onPrevPage,
  onNextPage,
  isLight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadJpg = async () => {
    if (!pdfDoc || isExporting) return;
    try {
      setIsExporting(true);
      const res = await renderPageToJpgBlob(pdfDoc, pageNum, { scale: 1.2, quality: 0.85 });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(res.blob);
      a.download = `halaman_${pageNum}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (err) {
      console.error("Failed to export modal page to JPG:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfBuffer || isExporting) return;
    try {
      setIsExporting(true);
      await handleDownloadSinglePagePdf(pdfBuffer, pageNum - 1);
    } catch (err) {
      console.error("Failed to export modal page to PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Keyboard navigation (Escape to close, Left/Right arrows to flip pages)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onPrevPage();
      } else if (e.key === "ArrowRight") {
        onNextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevPage, onNextPage]);

  // Reset scroll to top when flipping page
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [pageNum]);

  // Render high-resolution page onto modal canvas
  useEffect(() => {
    let cancelled = false;
    const renderModalPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      setLoadingPage(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: zoomScale * 1.35 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const renderTask = page.render({ canvasContext: ctx, viewport } as any);
        await renderTask.promise;

        if (!cancelled) setLoadingPage(false);
      } catch (err) {
        console.error("Failed rendering modal page preview:", err);
        if (!cancelled) setLoadingPage(false);
      }
    };

    renderModalPage();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum, zoomScale]);

  return (
    <div
      className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
          isLight ? "bg-white text-slate-900 border-slate-300" : "bg-zinc-950 text-white border-white/15"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-white/10"
          }`}
        >
          {/* Title & Part Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <FileText size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold font-mono">
                  Halaman {pageNum} / {numPages}
                </h3>
                {partInfo && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                    Bagian {partInfo.partIndex + 1} ({partInfo.range.label})
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-60">Gunakan panah &larr; &rarr; pada keyboard untuk berpindah halaman</p>
            </div>
          </div>

          {/* Navigation & Zoom & Download Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Download Page Buttons */}
            <button
              type="button"
              onClick={handleDownloadJpg}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all"
              title={`Unduh Halaman ${pageNum} sebagai file JPG`}
            >
              <Download size={13} />
              <span>Unduh JPG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all"
              title={`Unduh Halaman ${pageNum} sebagai file PDF`}
            >
              <FileText size={13} />
              <span>Unduh PDF</span>
            </button>

            {/* Prev & Next Buttons */}
            <div className="flex items-center gap-1 border p-0.5 rounded-xl">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={pageNum <= 1}
                className="p-1 rounded-lg hover:bg-black/10 disabled:opacity-30 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5">
                {pageNum} / {numPages}
              </span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={pageNum >= numPages}
                className="p-1 rounded-lg hover:bg-black/10 disabled:opacity-30 cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.5, Number((z - 0.2).toFixed(1))))}
                className="p-1 rounded-lg hover:bg-black/10 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1.0)}
                className="px-1.5 py-0.5 text-[10px] font-mono hover:bg-black/10 rounded-md cursor-pointer"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(3.0, Number((z + 0.2).toFixed(1))))}
                className="p-1 rounded-lg hover:bg-black/10 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-zinc-400 hover:text-white cursor-pointer transition-colors ml-1"
              title="Tutup (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto p-4 md:p-8 bg-zinc-950/95 relative"
        >
          {loadingPage && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-20 text-white gap-2">
              <Loader2 size={24} className="animate-spin text-rose-500" />
              <span className="text-xs font-bold">Memuat Halaman {pageNum}...</span>
            </div>
          )}
          <div className="min-w-fit min-h-full flex items-start justify-center m-auto">
            <div className="shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-white">
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
