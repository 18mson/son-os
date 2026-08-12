"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  RotateCw,
  Plus,
  Trash2,
  Type,
  Combine,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

export const PdfApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"viewer" | "watermark" | "merge" | "tools">("viewer");

  // Watermark State
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkFontSize, setWatermarkFontSize] = useState(36);

  // Merge State
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null);

  // Dynamic render page with pdfjs-dist
  useEffect(() => {
    if (!pdfBuffer) return;
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current || isCancelled) return;

      // Cancel any existing render task on the canvas to avoid overlapping renders
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancellation
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
        setNumPages(pdfDoc.numPages);

        const targetPage = Math.min(Math.max(1, currentPage), pdfDoc.numPages);

        const page = await pdfDoc.getPage(targetPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          canvas,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: unknown) {
        if (
          isCancelled ||
          (err && typeof err === "object" && "name" in err && err.name === "RenderingCancelledException")
        ) {
          return;
        }
        console.error("PDF render error:", err);
        setStatusMsg("Gagal merender halaman PDF.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
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
        renderTaskRef.current = null;
      }
    };
  }, [pdfBuffer, currentPage, scale]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        setPdfBuffer(reader.result);
        setCurrentPage(1);
        setStatusMsg(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Add Watermark via pdf-lib
  const handleAddWatermark = async () => {
    if (!pdfBuffer) return;
    try {
      setIsLoading(true);
      const { PDFDocument, rgb, degrees } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: watermarkFontSize,
          color: rgb(0.8, 0.2, 0.2),
          opacity: 0.35,
          rotate: degrees(45),
        });
      }

      const modifiedBytes = await pdfDoc.save();
      const newBuffer = modifiedBytes.buffer as ArrayBuffer;
      setPdfBuffer(newBuffer);
      setStatusMsg("Watermark berhasil ditambahkan!");
    } catch (err: unknown) {
      console.error("Watermark error:", err);
      setStatusMsg("Gagal menambahkan watermark.");
    } finally {
      setIsLoading(false);
    }
  };

  // Rotate Current Page via pdf-lib
  const handleRotatePage = async () => {
    if (!pdfBuffer) return;
    try {
      setIsLoading(true);
      const { PDFDocument, degrees } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
      const pages = pdfDoc.getPages();
      const pageIndex = currentPage - 1;

      if (pages[pageIndex]) {
        const currentRot = pages[pageIndex].getRotation().angle;
        pages[pageIndex].setRotation(degrees((currentRot + 90) % 360));
      }

      const modifiedBytes = await pdfDoc.save();
      const newBuffer = modifiedBytes.buffer as ArrayBuffer;
      setPdfBuffer(newBuffer);
      setStatusMsg(`Halaman ${currentPage} diputar 90 derajat.`);
    } catch (err: unknown) {
      console.error("Rotate error:", err);
      setStatusMsg("Gagal memutar halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Current Page via pdf-lib
  const handleDeletePage = async () => {
    if (!pdfBuffer || numPages <= 1) {
      setStatusMsg("Tidak dapat menghapus halaman terakhir.");
      return;
    }
    try {
      setIsLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0));
      pdfDoc.removePage(currentPage - 1);

      const modifiedBytes = await pdfDoc.save();
      const newBuffer = modifiedBytes.buffer as ArrayBuffer;
      setPdfBuffer(newBuffer);
      if (currentPage > 1) setCurrentPage((p) => p - 1);
      setStatusMsg(`Halaman dihapus.`);
    } catch (err: unknown) {
      console.error("Delete page error:", err);
      setStatusMsg("Gagal menghapus halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  // Merge Multiple PDFs via pdf-lib
  const handleMergeFiles = async () => {
    if (mergeFiles.length < 2) {
      setStatusMsg("Pilih minimal 2 file PDF untuk digabungkan.");
      return;
    }

    try {
      setIsLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const file of mergeFiles) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const newBuffer = mergedBytes.buffer as ArrayBuffer;
      setPdfBuffer(newBuffer);
      setCurrentPage(1);
      setActiveTab("viewer");
      setStatusMsg("Berhasil menggabungkan PDF!");
    } catch (err: unknown) {
      console.error("Merge error:", err);
      setStatusMsg("Gagal menggabungkan file PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  // Download Output PDF
  const handleDownloadPdf = () => {
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile ? `edited-${pdfFile.name}` : `sonos-document-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full w-full select-none overflow-hidden font-sans ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Top Toolbar */}
      <div className={`px-4 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
        isLight ? "bg-slate-200/90 border-slate-300" : "bg-zinc-900/90 border-white/10"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-linear-to-br from-rose-500 to-red-700 text-white shadow-md">
            <FileText size={18} />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>Son-OS PDF Studio</h1>
            <p className={`text-[10px] ${isLight ? "text-slate-600" : "text-zinc-400"}`}>Reader, Watermark, Merge & Editor</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-1 p-1 border rounded-xl ${
          isLight ? "bg-slate-300/60 border-slate-300" : "bg-white/5 border-white/10"
        }`}>
          <button
            onClick={() => setActiveTab("viewer")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "viewer"
                ? "bg-rose-600 text-white shadow-sm"
                : isLight ? "text-slate-700 hover:text-slate-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            Viewer
          </button>
          <button
            onClick={() => setActiveTab("watermark")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "watermark"
                ? "bg-rose-600 text-white shadow-sm"
                : isLight ? "text-slate-700 hover:text-slate-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            Watermark
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "tools"
                ? "bg-rose-600 text-white shadow-sm"
                : isLight ? "text-slate-700 hover:text-slate-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            Rotate/Delete
          </button>
          <button
            onClick={() => setActiveTab("merge")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "merge"
                ? "bg-rose-600 text-white shadow-sm"
                : isLight ? "text-slate-700 hover:text-slate-900" : "text-zinc-400 hover:text-white"
            }`}
          >
            Merge PDFs
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isLight ? "bg-slate-300 hover:bg-slate-400 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Upload size={14} /> Buka PDF
          </button>
          {pdfBuffer && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Download size={14} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Persistent Page & Zoom Control Bar when PDF is loaded */}
      {pdfBuffer && (
        <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
          isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-zinc-900/60 border-white/5 text-zinc-300"
        }`}>
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-[11px] opacity-75">Halaman:</span>
            <div className={`flex items-center gap-1.5 border px-2 py-1 rounded-xl ${
              isLight ? "bg-white border-slate-300" : "bg-white/5 border-white/10"
            }`}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-0.5 rounded-md hover:bg-black/10 disabled:opacity-30 cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono font-bold px-1">
                {currentPage} / {numPages || 1}
              </span>
              <button
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                className="p-0.5 rounded-md hover:bg-black/10 disabled:opacity-30 cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-[11px] opacity-75">Zoom: ({Math.round(scale * 100)}%)</span>
            <div className={`flex items-center gap-1 border p-0.5 rounded-xl ${
              isLight ? "bg-white border-slate-300" : "bg-white/5 border-white/10"
            }`}>
              <button
                onClick={() => setScale((s) => Math.max(0.4, Number((s - 0.2).toFixed(1))))}
                className="p-1.5 rounded-lg hover:bg-black/10 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => setScale(1.2)}
                className="px-2 py-0.5 text-[11px] font-mono hover:bg-black/10 rounded-md cursor-pointer"
                title="Reset Zoom"
              >
                Reset
              </button>
              <button
                onClick={() => setScale((s) => Math.min(3.0, Number((s + 0.2).toFixed(1))))}
                className="p-1.5 rounded-lg hover:bg-black/10 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Status */}
      {statusMsg && (
        <div className="px-4 py-2 bg-rose-500/15 border-b border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle size={14} /> {statusMsg}
          </span>
          <button onClick={() => setStatusMsg(null)} className="opacity-75 hover:opacity-100 text-[10px] cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Controls Sidebar */}
        <div className={`w-full md:w-64 border-r p-4 space-y-4 shrink-0 overflow-y-auto ${
          isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/60 border-white/10"
        }`}>
          {activeTab === "viewer" && (
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>Informasi File</h3>
              {pdfFile ? (
                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                  isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
                }`}>
                  <p className="font-semibold truncate">{pdfFile.name}</p>
                  <p className="opacity-75 text-[11px]">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  <p className="opacity-75 text-[11px]">{numPages} Halaman</p>
                </div>
              ) : (
                <p className="text-xs opacity-75">Buka file PDF dari komputer Anda untuk melihat isi dan informasi dokumen.</p>
              )}
            </div>
          )}

          {activeTab === "watermark" && (
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>Teks Watermark</h3>
              <div>
                <label className="text-xs opacity-75 block mb-1">Teks Watermark</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-hidden focus:border-rose-500 ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/8 border-white/10 text-white"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs opacity-75 block mb-1">Ukuran Font ({watermarkFontSize}px)</label>
                <input
                  type="range"
                  min={18}
                  max={72}
                  value={watermarkFontSize}
                  onChange={(e) => setWatermarkFontSize(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <button
                disabled={!pdfBuffer || isLoading}
                onClick={handleAddWatermark}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Type size={14} /> Terapkan Watermark
              </button>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>Perkakas Halaman</h3>
              <button
                disabled={!pdfBuffer || isLoading}
                onClick={handleRotatePage}
                className={`w-full py-2 px-3 rounded-xl disabled:opacity-40 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                  isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <RotateCw size={14} /> Putar Halaman Ini (+90°)
              </button>

              <button
                disabled={!pdfBuffer || numPages <= 1 || isLoading}
                onClick={handleDeletePage}
                className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-500 disabled:opacity-40 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} /> Hapus Halaman Ini
              </button>
            </div>
          )}

          {activeTab === "merge" && (
            <div className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>Penggabung PDF</h3>
              <input
                ref={mergeInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setMergeFiles(Array.from(e.target.files));
                  }
                }}
              />
              <button
                onClick={() => mergeInputRef.current?.click()}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                  isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-800" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Plus size={14} /> Pilih Beberapa PDF ({mergeFiles.length})
              </button>

              {mergeFiles.length > 0 && (
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto no-scrollbar">
                  {mergeFiles.map((f, idx) => (
                    <div key={idx} className={`p-1.5 rounded-lg truncate text-[11px] ${
                      isLight ? "bg-white border border-slate-200" : "bg-white/5"
                    }`}>
                      {idx + 1}. {f.name}
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={mergeFiles.length < 2 || isLoading}
                onClick={handleMergeFiles}
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Combine size={14} /> Gabungkan ({mergeFiles.length}) PDF
              </button>
            </div>
          )}
        </div>

        {/* PDF Canvas Preview Center */}
        <div className={`flex-1 flex items-center justify-center p-6 overflow-auto relative ${
          isLight ? "bg-slate-200/60" : "bg-black/60"
        }`}>
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 text-white text-xs gap-2">
              <Loader2 className="animate-spin text-rose-500" size={24} /> Memproses PDF...
            </div>
          )}

          {pdfBuffer ? (
            <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-300/50 bg-white">
              <canvas ref={canvasRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-500 gap-3">
              <div className={`p-4 rounded-3xl border ${
                isLight ? "bg-white border-slate-300 shadow-sm" : "bg-white/5 border-white/10"
              }`}>
                <FileText size={40} className="text-rose-500/80" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-zinc-300"}`}>Belum ada file PDF yang dibuka</p>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-zinc-500"}`}>Klik tombol &quot;Buka PDF&quot; di atas untuk mulai membaca atau mengedit.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
