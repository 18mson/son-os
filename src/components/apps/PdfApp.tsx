"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useTranslation } from "@/i18n";
import { PdfSidebarControls } from "./pdf/PdfSidebarControls";
import { PdfHeaderToolbar } from "./pdf/PdfHeaderToolbar";
import { PdfSplitView } from "./pdf/PdfSplitView";
import {
  handleApplyWatermark,
  handleMergePdfs,
  handleDeletePage,
  handleSplitPdf,
  handleDownloadSinglePageJpg,
  handleDownloadSinglePagePdf,
  handleConvertPdfToJpgBatch,
  handleCompressPdf,
} from "./pdf/pdfOperations";
import { saveVirtualItem, VirtualItem } from "./fileManager/fileManagerStorage";

export const PdfApp: React.FC = () => {
  const { theme, showNotification } = useWindowStore();
  const { language } = useTranslation();
  const isEn = language === "en";
  const isLight = theme === "light";

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.9);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"viewer" | "watermark" | "merge" | "tools" | "split" | "jpg" | "compress">("viewer");

  // Split State
  const [splitRanges, setSplitRanges] = useState<{ start: number; end: number; label: string }[]>([
    { start: 1, end: 1, label: "part1" },
  ]);

  // Watermark State
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkFontSize, setWatermarkFontSize] = useState(36);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // JPG Export State
  const [jpgScale, setJpgScale] = useState<number>(0.75); // default 75% for good balance
  const [jpgQuality, setJpgQuality] = useState<number>(0.8); // 80% JPEG quality
  const [jpgResizeMode, setJpgResizeMode] = useState<"scale" | "width" | "height">("scale");
  const [jpgCustomWidth, setJpgCustomWidth] = useState<number>(1200);
  const [jpgPageScope, setJpgPageScope] = useState<"current" | "all" | "range">("current");
  const [jpgPageRange, setJpgPageRange] = useState<string>("");
  const [isJpgConverting, setIsJpgConverting] = useState<boolean>(false);
  const [jpgConvertProgress, setJpgConvertProgress] = useState<number>(0);
  const [renderedResolution, setRenderedResolution] = useState<{ width: number; height: number } | null>(null);

  // Compress PDF State
  const [pdfCompressScale, setPdfCompressScale] = useState<number>(0.85);
  const [pdfCompressQuality, setPdfCompressQuality] = useState<number>(0.7);
  const [isPdfCompressing, setIsPdfCompressing] = useState<boolean>(false);
  const [pdfCompressProgress, setPdfCompressProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null);

  // Load PDF document metadata (numPages & default split ranges) whenever pdfBuffer changes
  useEffect(() => {
    if (!pdfBuffer) return;
    let isCancelled = false;

    const loadDocInfo = async () => {
      try {
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
        const total = pdfDoc.numPages;
        setNumPages(total);

        // Initialize split ranges
        setSplitRanges([
          { start: 1, end: Math.max(1, Math.min(total, 2)), label: "part1" },
          { start: Math.min(total, 3), end: total, label: "part2" },
        ]);
      } catch (err) {
        console.error("Failed to parse PDF metadata:", err);
      }
    };

    loadDocInfo();
    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer]);

  // Single page canvas render for Viewer/Watermark/Tools/JPG tabs
  useEffect(() => {
    if (!pdfBuffer || !canvasRef.current || activeTab === "split") return;
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || isCancelled) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      try {
        setIsLoading(true);
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

        const targetPage = Math.min(Math.max(1, currentPage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(targetPage);
        if (isCancelled) return;

        // When in JPG tab, use the active jpgScale or scale factor
        const effectiveScale = activeTab === "jpg" ? Math.max(0.3, jpgScale) : scale;
        const viewport = page.getViewport({ scale: effectiveScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setRenderedResolution({ width: Math.round(viewport.width), height: Math.round(viewport.height) });

        // Fill white background (ensures JPEG looks clean)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = { canvasContext: ctx, viewport, canvas };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const task = page.render(renderContext as any);
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
        if (!isCancelled) setIsLoading(false);
      } catch (err: unknown) {
        if ((err as { name?: string }).name !== "RenderingCancelledException") {
          console.error("PDF Render Error:", err);
          setStatusMsg("Gagal memuat halaman PDF.");
        }
        if (!isCancelled) setIsLoading(false);
      }
    };

    render();
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
  }, [pdfBuffer, currentPage, scale, activeTab, jpgScale]);

  const handleFileLoad = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setStatusMsg("Format file harus PDF.");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMsg(null);
      setPdfFile(file);

      const buffer = await file.arrayBuffer();
      setPdfBuffer(buffer);
      setCurrentPage(1);
    } catch {
      setStatusMsg("Gagal membaca file PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileLoad(file);
  };

  const handleMergeFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setMergeFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleApplyWatermarkAction = async () => {
    setIsLoading(true);
    setStatusMsg("Menerapkan watermark...");
    try {
      const res = await handleApplyWatermark(pdfBuffer, watermarkText, watermarkFontSize, pdfFile);
      if (res) {
        setPdfBuffer(res.newBuffer);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.blob);
        a.download = res.downloadName;
        a.click();
        setStatusMsg("Watermark berhasil diterapkan!");
      }
    } catch {
      setStatusMsg("Gagal menerapkan watermark.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMergeAction = async () => {
    setIsLoading(true);
    setStatusMsg("Menggabungkan file PDF...");
    try {
      const res = await handleMergePdfs(mergeFiles);
      if (res) {
        setPdfBuffer(res.newBuffer);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(res.blob);
        a.download = res.downloadName;
        a.click();
        setStatusMsg("Penggabungan PDF berhasil!");
      }
    } catch {
      setStatusMsg("Gagal menggabungkan PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePageAction = async () => {
    if (!pdfBuffer) return;
    setIsLoading(true);
    setStatusMsg("Menghapus halaman...");
    try {
      const res = await handleDeletePage(pdfBuffer, currentPage - 1);
      if (res) {
        setPdfBuffer(res.newBuffer);
        setCurrentPage((p) => Math.min(p, numPages - 1));
        setStatusMsg("Halaman berhasil dihapus!");
      } else {
        setStatusMsg("Tidak bisa menghapus satu-satunya halaman.");
      }
    } catch {
      setStatusMsg("Gagal menghapus halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitAction = async () => {
    if (!pdfBuffer) return;
    setIsLoading(true);
    setStatusMsg("Memisahkan PDF...");
    try {
      await handleSplitPdf(pdfBuffer, pdfFile, splitRanges);
      setStatusMsg(`${splitRanges.length} file berhasil dipisahkan!`);
    } catch {
      setStatusMsg("Gagal memisahkan PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  // Download Single Page as JPG handler
  const handleDownloadCurrentPageJpgAction = async () => {
    if (!pdfBuffer) return;
    setIsJpgConverting(true);
    setStatusMsg(`Mengonversi halaman ${currentPage} ke JPG...`);
    try {
      const res = await handleDownloadSinglePageJpg(
        pdfBuffer,
        currentPage,
        {
          scale: jpgScale,
          quality: jpgQuality,
          resizeMode: jpgResizeMode,
          customWidth: jpgCustomWidth,
        },
        pdfFile?.name
      );

      // Auto save to virtual file system
      try {
        const item: VirtualItem = {
          id: `jpg-page-${Date.now()}-${currentPage}`,
          parentId: null,
          name: res.downloadName,
          isFolder: false,
          size: res.sizeBytes,
          type: "image/jpeg",
          blob: res.blob,
          createdAt: Date.now(),
        };
        await saveVirtualItem(item);
        showNotification(
          "JPG Berhasil Diunduh",
          `Tersimpan ke File Manager: ${res.downloadName} (${(res.sizeBytes / 1024).toFixed(1)} KB)`,
          "PDF Studio",
          "FileText"
        );
      } catch (e) {
        console.warn("Could not save to virtual_fs:", e);
      }

      setStatusMsg(`Halaman ${currentPage} berhasil diunduh sebagai JPG (${(res.sizeBytes / 1024).toFixed(1)} KB)!`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal mengonversi halaman ke JPG.");
    } finally {
      setIsJpgConverting(false);
    }
  };

  // Download Single Page as PDF handler
  const handleDownloadCurrentPagePdfAction = async () => {
    if (!pdfBuffer) return;
    setIsLoading(true);
    setStatusMsg(`Mengekstrak halaman ${currentPage} ke file PDF...`);
    try {
      const res = await handleDownloadSinglePagePdf(pdfBuffer, currentPage - 1, pdfFile?.name);

      // Auto save to virtual file system
      try {
        const item: VirtualItem = {
          id: `pdf-page-${Date.now()}-${currentPage}`,
          parentId: null,
          name: res.downloadName,
          isFolder: false,
          size: res.blob.size,
          type: "application/pdf",
          blob: res.blob,
          createdAt: Date.now(),
        };
        await saveVirtualItem(item);
        showNotification(
          "Halaman PDF Berhasil Diunduh",
          `Tersimpan ke File Manager: ${res.downloadName}`,
          "PDF Studio",
          "FileText"
        );
      } catch (e) {
        console.warn("Could not save to virtual_fs:", e);
      }

      setStatusMsg(`Halaman ${currentPage} berhasil diunduh sebagai PDF!`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal mengekstrak halaman PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse page range string like "1-3, 5, 8-10"
  const parsePageRange = (rangeStr: string, total: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(/[,;\s]+/);
    for (const part of parts) {
      if (!part.trim()) continue;
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e)) {
          const from = Math.max(1, Math.min(s, e));
          const to = Math.min(total, Math.max(s, e));
          for (let i = from; i <= to; i++) pages.add(i);
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) pages.add(p);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  // Batch JPG export handler
  const handleBatchExportJpgAction = async () => {
    if (!pdfBuffer) return;

    let targetPages: number[] = [];
    if (jpgPageScope === "all") {
      targetPages = Array.from({ length: numPages }, (_, i) => i + 1);
    } else if (jpgPageScope === "range") {
      targetPages = parsePageRange(jpgPageRange, numPages);
      if (targetPages.length === 0) {
        setStatusMsg("Format rentang halaman tidak valid (contoh: 1-3, 5).");
        return;
      }
    } else {
      targetPages = [currentPage];
    }

    setIsJpgConverting(true);
    setJpgConvertProgress(0);
    setStatusMsg(`Mengonversi ${targetPages.length} halaman ke JPG...`);

    try {
      const results = await handleConvertPdfToJpgBatch(pdfBuffer, pdfFile, {
        pagesToConvert: targetPages,
        scale: jpgScale,
        quality: jpgQuality,
        resizeMode: jpgResizeMode,
        customWidth: jpgCustomWidth,
        onProgress: (cur, tot, percent) => {
          setJpgConvertProgress(percent);
          setStatusMsg(`Mengonversi ${cur} dari ${tot} halaman (${percent}%)...`);
        },
      });

      // Save to virtual file system
      for (const item of results) {
        try {
          const vItem: VirtualItem = {
            id: `jpg-batch-${Date.now()}-${item.pageNum}`,
            parentId: null,
            name: item.fileName,
            isFolder: false,
            size: item.blob.size,
            type: "image/jpeg",
            blob: item.blob,
            createdAt: Date.now(),
          };
          await saveVirtualItem(vItem);
        } catch (e) {
          console.warn("Could not save to virtual_fs:", e);
        }
      }

      showNotification(
        "Batch Export JPG Selesai",
        `${results.length} gambar JPG berhasil diunduh & disimpan ke File Manager`,
        "PDF Studio",
        "FileText"
      );

      setStatusMsg(`Sukses mengonversi dan mengunduh ${results.length} file JPG!`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal melakukan batch export ke JPG.");
    } finally {
      setIsJpgConverting(false);
    }
  };

  const handleDownloadOriginal = () => {
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = pdfFile ? pdfFile.name : "document.pdf";
    a.click();
  };

  const handleCompressPdfAction = async () => {
    if (!pdfBuffer) return;
    setIsPdfCompressing(true);
    setPdfCompressProgress(0);
    setStatusMsg("Mengompresi PDF...");
    try {
      const res = await handleCompressPdf(
        pdfBuffer,
        pdfFile,
        pdfCompressScale,
        pdfCompressQuality,
        (current, total) => setPdfCompressProgress(Math.round((current / total) * 100))
      );
      const savedMb = ((res.originalSize - res.compressedSize) / 1024 / 1024).toFixed(1);
      const ratio = Math.round((1 - res.compressedSize / res.originalSize) * 100);
      showNotification(
        "PDF Berhasil Dikompres",
        `${res.downloadName} — Hemat ${ratio}% (${savedMb} MB)`,
        "PDF Studio",
        "FileText"
      );
      setStatusMsg(`Selesai! Ukuran berkurang ${ratio}% (hemat ${savedMb} MB)`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Gagal mengompresi PDF.");
    } finally {
      setIsPdfCompressing(false);
      setPdfCompressProgress(0);
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}
    >
      <PdfHeaderToolbar
        isLight={isLight}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pdfBuffer={pdfBuffer}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        handleDownloadPdf={handleDownloadOriginal}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        numPages={numPages}
        scale={scale}
        setScale={setScale}
        statusMsg={statusMsg}
        setStatusMsg={setStatusMsg}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Batch Converting Progress Overlay */}
        {isJpgConverting && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
            <div
              className={`max-w-xs w-full p-5 rounded-3xl border shadow-2xl flex flex-col items-center text-center space-y-3 ${
                isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-white/10"
              }`}
            >
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-500">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Mengonversi ke Gambar JPG...</h4>
                <p className="text-[11px] opacity-70 mt-0.5">
                  Skala {Math.round(jpgScale * 100)}% • Kualitas {Math.round(jpgQuality * 100)}%
                </p>
              </div>
              <div className="w-full space-y-1">
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${jpgConvertProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-70">
                  <span>Progress</span>
                  <span>{jpgConvertProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <PdfSidebarControls
          isLight={isLight}
          activeTab={activeTab}
          pdfFile={pdfFile}
          numPages={numPages}
          currentPage={currentPage}
          watermarkText={watermarkText}
          setWatermarkText={setWatermarkText}
          watermarkFontSize={watermarkFontSize}
          setWatermarkFontSize={setWatermarkFontSize}
          handleApplyWatermark={handleApplyWatermarkAction}
          handleRotatePage={() => {}}
          handleDeletePage={handleDeletePageAction}
          mergeFiles={mergeFiles}
          setMergeFiles={setMergeFiles}
          handleMergePdfs={handleMergeAction}
          mergeInputRef={mergeInputRef}
          handleMergeFilesAdd={handleMergeFilesAdd}
          splitRanges={splitRanges}
          setSplitRanges={setSplitRanges}
          handleSplitPdf={handleSplitAction}
          // JPG Props
          jpgScale={jpgScale}
          setJpgScale={setJpgScale}
          jpgQuality={jpgQuality}
          setJpgQuality={setJpgQuality}
          jpgResizeMode={jpgResizeMode}
          setJpgResizeMode={setJpgResizeMode}
          jpgCustomWidth={jpgCustomWidth}
          setJpgCustomWidth={setJpgCustomWidth}
          jpgPageScope={jpgPageScope}
          setJpgPageScope={setJpgPageScope}
          jpgPageRange={jpgPageRange}
          setJpgPageRange={setJpgPageRange}
          handleDownloadCurrentPageJpg={handleDownloadCurrentPageJpgAction}
          handleDownloadCurrentPagePdf={handleDownloadCurrentPagePdfAction}
          handleBatchExportJpg={handleBatchExportJpgAction}
          isJpgConverting={isJpgConverting}
          // Compress PDF Props
          pdfCompressScale={pdfCompressScale}
          setPdfCompressScale={setPdfCompressScale}
          pdfCompressQuality={pdfCompressQuality}
          setPdfCompressQuality={setPdfCompressQuality}
          handleCompressPdf={handleCompressPdfAction}
          isPdfCompressing={isPdfCompressing}
          pdfCompressProgress={pdfCompressProgress}
        />

        {activeTab === "split" && pdfBuffer ? (
          <div className="flex-1 flex overflow-hidden relative">
            {statusMsg && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-zinc-900/90 text-white text-xs font-semibold border border-white/10 shadow-xl flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-400" />
                <span>{statusMsg}</span>
              </div>
            )}
            <PdfSplitView
              pdfBuffer={pdfBuffer}
              numPages={numPages}
              splitRanges={splitRanges}
              setSplitRanges={setSplitRanges}
              isLight={isLight}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto flex flex-col items-center relative">
            {statusMsg && (
              <div className="sticky top-2 z-20 px-4 py-2 rounded-2xl bg-zinc-900/90 text-white text-xs font-semibold border border-white/10 shadow-xl flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-400" />
                <span>{statusMsg}</span>
              </div>
            )}

            {pdfBuffer ? (
              <div className="flex flex-col items-center space-y-3 max-w-full py-4">
                {/* Mode info banner when in JPG tab */}
                {activeTab === "jpg" && (
                  <div
                    className={`px-3.5 py-1.5 rounded-2xl border text-xs flex items-center gap-2 shadow-sm ${
                      isLight
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-200"
                    }`}
                  >
                    <ImageIcon size={14} className="text-amber-500" />
                    <span>
                      Preview JPG: <strong>Hal. {currentPage}</strong> • Skala{" "}
                      <strong>{Math.round(jpgScale * 100)}%</strong> • Kualitas{" "}
                      <strong>{Math.round(jpgQuality * 100)}%</strong> (
                      {renderedResolution ? `${renderedResolution.width} × ${renderedResolution.height} px` : "..."})
                    </span>
                  </div>
                )}

                {/* Canvas Container */}
                <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-white">
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 text-white gap-2">
                      <Loader2 size={24} className="animate-spin text-rose-500" />
                      <span className="text-xs font-bold">Memuat Halaman...</span>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="max-w-full h-auto block" />
                </div>

                {/* Bottom Quick Page Download Bar (Always accessible under canvas) */}
                <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
                  <span className="opacity-60 text-[11px]">{isEn ? `Download page ${currentPage}:` : `Download halaman ${currentPage}:`}</span>
                  <button
                    type="button"
                    onClick={handleDownloadCurrentPageJpgAction}
                    disabled={isJpgConverting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                      isLight
                        ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    <Download size={13} className="text-amber-500" />
                    <span>JPG ({Math.round(jpgScale * 100)}% / {Math.round(jpgQuality * 100)}% Q)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCurrentPagePdfAction}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                      isLight
                        ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    <FileText size={13} className="text-rose-500" />
                    <span>{isEn ? "PDF (Single Page)" : "PDF (Halaman Tunggal)"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full flex items-center justify-center py-10">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isLight ? "border-slate-300 bg-white/60 hover:bg-slate-100" : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 mb-3">
                    <FileText size={40} />
                  </div>
                  <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {isEn ? "Select a PDF file to open" : "Pilih file PDF untuk dibuka"}
                  </h3>
                  <p className={`text-xs mt-1 max-w-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    {isEn
                      ? "Supports fast viewing, JPG conversion, PDF compression, watermarking, page splitting, and merging."
                      : "Mendukung pembacaan cepat, konversi ke JPG dengan kompresi, kompresi ukuran PDF, watermark, pemisahan halaman, dan penggabungan PDF."}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload size={14} /> {isEn ? "Choose PDF File" : "Pilih File PDF"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
