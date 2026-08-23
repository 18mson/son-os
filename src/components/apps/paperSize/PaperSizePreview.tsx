"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowRight,
  Eye,
  Columns,
  Layers,
  Loader2,
  FileCheck,
  Grid,
  Move,
  Printer,
} from "lucide-react";
import {
  PageDimensionInfo,
  ConversionMode,
  TargetOrientation,
  STANDARD_PAPER_SIZES,
  ptToMm,
  mmToPt,
  calculateTileGrid,
} from "@/lib/pdf/paperSizes";
import { computeTransform } from "@/lib/pdf/paperConverter";

interface PaperSizePreviewProps {
  isLight: boolean;
  pdfBuffer: ArrayBuffer | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  currentPageInfo: PageDimensionInfo | null;
  targetStandardId: string;
  customWidth: number;
  customHeight: number;
  targetOrientation: TargetOrientation;
  mode: ConversionMode;
  overlapMm?: number;
  targetMarginMm?: number;
}

export const PaperSizePreview: React.FC<PaperSizePreviewProps> = ({
  isLight,
  pdfBuffer,
  currentPage,
  setCurrentPage,
  totalPages,
  currentPageInfo,
  targetStandardId,
  customWidth,
  customHeight,
  targetOrientation,
  mode,
  overlapMm = 0,
  targetMarginMm = 0,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [previewLayout, setPreviewLayout] = useState<"side_by_side" | "single_after">("side_by_side");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null);

  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Center / reset view
  const handleCenterView = () => {
    setZoom(0.85);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Compute target dimensions in PT
  let targetWidthPt: number;
  let targetHeightPt: number;
  let targetName: string;

  if (targetStandardId !== "custom") {
    const std = STANDARD_PAPER_SIZES.find((s) => s.id === targetStandardId) || STANDARD_PAPER_SIZES[0];
    const baseW = Math.min(std.widthPt, std.heightPt);
    const baseH = Math.max(std.widthPt, std.heightPt);
    targetName = std.name;

    const isLandscape =
      targetOrientation === "landscape" ||
      (targetOrientation === "match_original" && currentPageInfo?.orientation === "landscape");

    targetWidthPt = isLandscape ? baseH : baseW;
    targetHeightPt = isLandscape ? baseW : baseH;
  } else {
    const baseW = Math.min(customWidth, customHeight);
    const baseH = Math.max(customWidth, customHeight);
    targetName = `Custom (${ptToMm(customWidth)}×${ptToMm(customHeight)} mm)`;

    const isLandscape =
      targetOrientation === "landscape" ||
      (targetOrientation === "match_original" && currentPageInfo?.orientation === "landscape");

    targetWidthPt = isLandscape ? baseH : baseW;
    targetHeightPt = isLandscape ? baseW : baseH;
  }

  const targetWidthMm = ptToMm(targetWidthPt);
  const targetHeightMm = ptToMm(targetHeightPt);

  // Calculate Tile Grid
  const tileGrid = useMemo(() => {
    if (!currentPageInfo) return null;
    return calculateTileGrid(
      currentPageInfo.visualWidthPt,
      currentPageInfo.visualHeightPt,
      targetWidthPt,
      targetHeightPt,
      mmToPt(overlapMm),
      mmToPt(targetMarginMm)
    );
  }, [currentPageInfo, targetWidthPt, targetHeightPt, overlapMm, targetMarginMm]);

  const safeTileIndex = tileGrid && tileGrid.totalTiles > 0
    ? Math.min(selectedTileIndex, tileGrid.totalTiles - 1)
    : 0;

  // Visual display scale based on zoom (independent from high-DPI rendering)
  const displayScale = zoom * 0.7;
  const sourceDisplayW = currentPageInfo ? Math.round(currentPageInfo.visualWidthPt * displayScale) : 320;
  const sourceDisplayH = currentPageInfo ? Math.round(currentPageInfo.visualHeightPt * displayScale) : 450;
  const targetDisplayW = Math.round(targetWidthPt * displayScale);
  const targetDisplayH = Math.round(targetHeightPt * displayScale);

  // Render preview onto canvases (crisp fixed 2x resolution via Offscreen Canvas)
  useEffect(() => {

    if (!pdfBuffer || !currentPageInfo) return;
    let isCancelled = false;

    const renderPreview = async () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      try {
        setIsRendering(true);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const bufferCopy = pdfBuffer.slice(0);
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(bufferCopy),
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });

        const pdfDoc = await loadingTask.promise;
        if (isCancelled) return;

        const targetPageNum = Math.min(Math.max(1, currentPage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled) return;

        // 1. Render source page to Offscreen Canvas
        const renderScale = 2.0;
        const sourceViewport = page.getViewport({ scale: renderScale });

        const offscreenSource = document.createElement("canvas");
        offscreenSource.width = sourceViewport.width;
        offscreenSource.height = sourceViewport.height;

        const offscreenCtx = offscreenSource.getContext("2d");
        if (!offscreenCtx) return;

        const renderContext = {
          canvasContext: offscreenCtx,
          viewport: sourceViewport,
          canvas: offscreenSource,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const task = page.render(renderContext as any);
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
        if (isCancelled) return;

        const pxPerPt = sourceViewport.width / currentPageInfo.visualWidthPt;
        const targetCanvasW = Math.round(targetWidthPt * pxPerPt);
        const targetCanvasH = Math.round(targetHeightPt * pxPerPt);
        const targetMarginPx = mmToPt(targetMarginMm) * pxPerPt;
        const origW = offscreenSource.width;
        const origH = offscreenSource.height;

        // 2. Draw onto Source Canvas if currently mounted in DOM (Side-by-side mode)
        const sourceCanvas = sourceCanvasRef.current;
        if (sourceCanvas) {
          sourceCanvas.width = offscreenSource.width;
          sourceCanvas.height = offscreenSource.height;

          const sourceCtx = sourceCanvas.getContext("2d");
          if (sourceCtx) {
            sourceCtx.drawImage(offscreenSource, 0, 0);

            // Draw Grid Lines on Source Canvas if mode is tile_split
            if (mode === "tile_split" && tileGrid) {
              const usableTargetW_px = targetCanvasW - 2 * targetMarginPx;
              const usableTargetH_px = targetCanvasH - 2 * targetMarginPx;
              const overlapPx = mmToPt(overlapMm) * pxPerPt;
              const stepW_px = usableTargetW_px - overlapPx;
              const stepH_px = usableTargetH_px - overlapPx;

              sourceCtx.save();
              for (let r = 0; r < tileGrid.rows; r++) {
                for (let c = 0; c < tileGrid.cols; c++) {
                  const tileIdx = r * tileGrid.cols + c;
                  const tileX = c * stepW_px;
                  const tileY = r * stepH_px;

                  const isCurrentTile = tileIdx === safeTileIndex;

                  sourceCtx.strokeStyle = isCurrentTile ? "#e11d48" : "rgba(225, 29, 72, 0.6)";
                  sourceCtx.lineWidth = isCurrentTile ? 3.5 : 2;
                  sourceCtx.setLineDash(isCurrentTile ? [] : [8, 5]);
                  sourceCtx.strokeRect(tileX, tileY, usableTargetW_px, usableTargetH_px);

                  sourceCtx.fillStyle = isCurrentTile ? "rgba(225, 29, 72, 0.95)" : "rgba(24, 24, 27, 0.75)";
                  sourceCtx.fillRect(tileX + 8, tileY + 8, 105, 26);

                  sourceCtx.fillStyle = "#ffffff";
                  sourceCtx.font = "bold 13px sans-serif";
                  sourceCtx.setLineDash([]);
                  sourceCtx.fillText(`Tile ${tileIdx + 1} (R${r + 1}C${c + 1})`, tileX + 14, tileY + 26);
                }
              }
              sourceCtx.restore();
            }
          }
        }

        // 3. Draw onto Target Canvas (Always mounted in both layouts!)
        const targetCanvas = targetCanvasRef.current;
        if (targetCanvas) {
          targetCanvas.width = targetCanvasW;
          targetCanvas.height = targetCanvasH;

          const targetCtx = targetCanvas.getContext("2d");
          if (targetCtx) {
            // White paper sheet background
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(0, 0, targetCanvasW, targetCanvasH);

            if (mode === "tile_split" && tileGrid) {
              const usableTargetW_px = targetCanvasW - 2 * targetMarginPx;
              const usableTargetH_px = targetCanvasH - 2 * targetMarginPx;
              const overlapPx = mmToPt(overlapMm) * pxPerPt;
              const stepW_px = usableTargetW_px - overlapPx;
              const stepH_px = usableTargetH_px - overlapPx;

              const activeRow = Math.floor(safeTileIndex / tileGrid.cols);
              const activeCol = safeTileIndex % tileGrid.cols;

              const tileOffsetX = targetMarginPx - activeCol * stepW_px;
              const tileOffsetY = targetMarginPx - activeRow * stepH_px;

              targetCtx.save();
              targetCtx.beginPath();
              targetCtx.rect(targetMarginPx, targetMarginPx, usableTargetW_px, usableTargetH_px);
              targetCtx.clip();

              targetCtx.drawImage(offscreenSource, tileOffsetX, tileOffsetY, origW, origH);
              targetCtx.restore();
            } else {
              // Standard modes: Fit, Stretch, Crop & Pad
              const { x, y, xScale, yScale } = computeTransform(
                mode,
                origW,
                origH,
                targetCanvasW,
                targetCanvasH,
                targetMarginPx
              );

              targetCtx.save();
              targetCtx.beginPath();
              targetCtx.rect(
                targetMarginPx,
                targetMarginPx,
                targetCanvasW - 2 * targetMarginPx,
                targetCanvasH - 2 * targetMarginPx
              );
              targetCtx.clip();

              targetCtx.drawImage(offscreenSource, x, y, origW * xScale, origH * yScale);
              targetCtx.restore();
            }

            // Draw safe printable margin border guideline if margin > 0
            if (targetMarginPx > 0) {
              targetCtx.save();
              targetCtx.strokeStyle = "rgba(16, 185, 129, 0.6)"; // Emerald dashed line
              targetCtx.lineWidth = 1.5;
              targetCtx.setLineDash([6, 4]);
              targetCtx.strokeRect(
                targetMarginPx,
                targetMarginPx,
                targetCanvasW - 2 * targetMarginPx,
                targetCanvasH - 2 * targetMarginPx
              );
              targetCtx.restore();
            }

            // Draw subtle outer border guide
            targetCtx.strokeStyle = "rgba(0, 0, 0, 0.08)";
            targetCtx.lineWidth = 1;
            targetCtx.strokeRect(0, 0, targetCanvasW, targetCanvasH);
          }
        }
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "RenderingCancelledException") {
          console.error("Preview render error:", err);
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderPreview();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [
    pdfBuffer,
    currentPage,
    currentPageInfo,
    targetWidthPt,
    targetHeightPt,
    mode,
    safeTileIndex,
    overlapMm,
    targetMarginMm,
    tileGrid,
    previewLayout,
  ]);


  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Preview Control Bar */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between gap-3 shrink-0 ${
          isLight ? "bg-white/90 border-slate-200" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        {/* Page Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold px-2 py-0.5 min-w-18.75 text-center">
            Hal {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Halaman Berikutnya"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Tile Navigator when in tile_split mode */}
        {mode === "tile_split" && tileGrid && (
          <div className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
            <Grid size={13} className="text-rose-400 shrink-0" />
            <button
              type="button"
              disabled={safeTileIndex <= 0}
              onClick={() => setSelectedTileIndex((i) => Math.max(0, i - 1))}
              className="p-0.5 rounded text-rose-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-[11px] font-bold text-rose-400">
              Tile {safeTileIndex + 1} / {tileGrid.totalTiles}
            </span>
            <button
              type="button"
              disabled={safeTileIndex >= tileGrid.totalTiles - 1}
              onClick={() => setSelectedTileIndex((i) => Math.min(tileGrid.totalTiles - 1, i + 1))}
              className="p-0.5 rounded text-rose-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* View Layout Toggle */}
        <div className="flex items-center gap-1 bg-black/10 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setPreviewLayout("side_by_side")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewLayout === "side_by_side"
                ? "bg-indigo-600 text-white shadow-xs"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Columns size={13} />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewLayout("single_after")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewLayout === "single_after"
                ? "bg-indigo-600 text-white shadow-xs"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <Eye size={13} />
            <span className="hidden sm:inline">Hasil Saja</span>
          </button>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.15).toFixed(2))))}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 min-w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleCenterView}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Reset Zoom & Pusatkan (85%)"
          >
            <Maximize size={13} />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll & Pan Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 overflow-auto relative select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {isRendering && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 text-white text-xs font-semibold border border-white/10 shadow-xl flex items-center gap-2">
            <Loader2 size={13} className="animate-spin text-indigo-400" />
            <span>Memperbarui Preview...</span>
          </div>
        )}

        {/* Drag Helper Tooltip */}
        <div
          className={`absolute bottom-3 right-4 z-10 px-2.5 py-1 rounded-xl text-[10px] font-medium border flex items-center gap-1.5 pointer-events-none transition-all ${
            isLight
              ? "bg-white/80 text-slate-500 border-slate-200"
              : "bg-zinc-900/80 text-zinc-400 border-white/10"
          }`}
        >
          <Move size={11} className="text-indigo-400" />
          <span>Klik & Geser untuk Pan Area</span>
        </div>

        {/* Centered Scrollable Canvas Wrapper */}
        <div className="min-w-full min-h-full w-max h-max flex items-center justify-center p-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* BEFORE: Source Page */}
            {previewLayout === "side_by_side" && (
              <div className="flex flex-col items-center gap-3 shrink-0">
                {/* Badge info */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20 flex items-center gap-1.5">
                    <Layers size={11} />
                    <span>Sebelum: {currentPageInfo?.detectedName}</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-60">
                    {currentPageInfo?.visualWidthMm} × {currentPageInfo?.visualHeightMm} mm
                  </span>
                </div>

                {/* Canvas Paper Sheet */}
                <div className="p-1 rounded-2xl bg-slate-200/50 dark:bg-zinc-800/40 shadow-2xl border border-black/5 dark:border-white/10">
                  <div
                    style={{ width: `${sourceDisplayW}px`, height: `${sourceDisplayH}px` }}
                    className="rounded-xl overflow-hidden bg-white shadow-md relative transition-all duration-150"
                  >
                    <canvas ref={sourceCanvasRef} style={{ width: "100%", height: "100%" }} className="block" />
                  </div>
                </div>
              </div>
            )}

            {/* Arrow Divider */}
            {previewLayout === "side_by_side" && (
              <div className="hidden lg:flex flex-col items-center justify-center p-3 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <ArrowRight size={20} />
              </div>
            )}

            {/* AFTER: Target Page */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              {/* Badge info */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    mode === "tile_split"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                  }`}
                >
                  <FileCheck size={11} />
                  <span>
                    {mode === "tile_split"
                      ? `Hasil: Tile ${safeTileIndex + 1} (${targetName})`
                      : `Target: ${targetName}`}
                  </span>
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  {targetWidthMm} × {targetHeightMm} mm
                  {mode === "tile_split" && tileGrid
                    ? ` (Grid ${tileGrid.cols}×${tileGrid.rows})`
                    : ` (${mode.toUpperCase()})`}
                </span>
                {targetMarginMm > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Printer size={10} />
                    <span>Margin {targetMarginMm}mm</span>
                  </span>
                )}
              </div>

              {/* Canvas Paper Sheet */}
              <div
                className={`p-1 rounded-2xl shadow-2xl border ${
                  mode === "tile_split"
                    ? "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30"
                    : "bg-indigo-500/10 dark:bg-indigo-950/40 border-indigo-500/30"
                }`}
              >
                <div
                  style={{ width: `${targetDisplayW}px`, height: `${targetDisplayH}px` }}
                  className="rounded-xl overflow-hidden bg-white shadow-md relative transition-all duration-150"
                >
                  <canvas ref={targetCanvasRef} style={{ width: "100%", height: "100%" }} className="block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
