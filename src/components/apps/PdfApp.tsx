"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { PdfSidebarControls } from "./pdf/PdfSidebarControls";
import { PdfHeaderToolbar } from "./pdf/PdfHeaderToolbar";
import { PdfSplitView } from "./pdf/PdfSplitView";
import { handleApplyWatermark, handleMergePdfs, handleDeletePage, handleSplitPdf } from "./pdf/pdfOperations";

export const PdfApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.9);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"viewer" | "watermark" | "merge" | "tools" | "split">("viewer");

  // Split State
  const [splitRanges, setSplitRanges] = useState<{ start: number; end: number; label: string }[]>([{ start: 1, end: 1, label: "part1" }]);

  // Watermark State
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkFontSize, setWatermarkFontSize] = useState(36);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

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

  // Single page canvas render for Viewer/Watermark/Tools tabs
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

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

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
  }, [pdfBuffer, currentPage, scale, activeTab]);

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

  const handleDownloadOriginal = () => {
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = pdfFile ? pdfFile.name : "document.pdf";
    a.click();
  };

  return (
    <div className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
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

      <div className="flex-1 flex overflow-hidden">
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
          <div className="flex-1 p-4 overflow-auto flex flex-col items-center justify-center relative">
            {statusMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-zinc-900/90 text-white text-xs font-semibold border border-white/10 shadow-xl flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-400" />
                <span>{statusMsg}</span>
              </div>
            )}

            {pdfBuffer ? (
              <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/10 bg-white">
                {isLoading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 text-white gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <span className="text-xs font-bold">Memuat Halaman...</span>
                  </div>
                )}
                <canvas ref={canvasRef} className="max-w-full h-auto block" />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isLight ? "border-slate-300 bg-white/60 hover:bg-slate-100" : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="p-4 rounded-3xl bg-red-500/10 text-red-500 mb-3">
                  <FileText size={40} />
                </div>
                <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Pilih file PDF untuk dibaca</h3>
                <p className={`text-xs mt-1 max-w-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Mendukung pembacaan cepat, penambahan watermark, pemisahan halaman, dan penggabungan PDF.
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={14} /> Pilih File PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
