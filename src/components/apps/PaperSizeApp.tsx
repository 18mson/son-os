"use client";

import React, { useState, useRef } from "react";
import {
  FileStack,
  Upload,
  Download,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/data/apps";
import { useTranslation, getAppTranslation } from "@/i18n";
import { saveVirtualItem, VirtualItem } from "./fileManager/fileManagerStorage";
import {
  ConversionMode,
  TargetOrientation,
  TileOutputMode,
  SizeUnit,
  DocumentSummaryInfo,
  analyzeDocumentDimensions,
  STANDARD_PAPER_SIZES,
} from "@/lib/pdf/paperSizes";

import { convertPdfPaperSize, ConvertPdfResult } from "@/lib/pdf/paperConverter";
import { PaperSizeControls } from "./paperSize/PaperSizeControls";
import { PaperSizePreview } from "./paperSize/PaperSizePreview";
import { PaperSizePageList } from "./paperSize/PaperSizePageList";

export const PaperSizeApp: React.FC = () => {
  const { theme, openWindow, showNotification } = useWindowStore();
  const { language } = useTranslation();
  const isLight = theme === "light";

  // File state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [docSummary, setDocSummary] = useState<DocumentSummaryInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Conversion options
  const [targetStandardId, setTargetStandardId] = useState<string>("a4");
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [customUnit, setCustomUnit] = useState<SizeUnit>("mm");
  const [targetOrientation, setTargetOrientation] = useState<TargetOrientation>("match_original");
  const [mode, setMode] = useState<ConversionMode>("fit");
  const [tileOutputMode, setTileOutputMode] = useState<TileOutputMode>("single_pdf");
  const [overlapMm, setOverlapMm] = useState<number>(0);
  const [targetMarginMm, setTargetMarginMm] = useState<number>(0);
  const [pageScope, setPageScope] = useState<"all" | "range">("all");
  const [pageRange, setPageRange] = useState<string>("");


  // UI state
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertProgress, setConvertProgress] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isPageListOpen, setIsPageListOpen] = useState<boolean>(false);
  const [lastConvertedResult, setLastConvertedResult] = useState<ConvertPdfResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss status toast after 5s for success or error
  React.useEffect(() => {
    if (statusMsg && (statusMsg.type === "success" || statusMsg.type === "error")) {
      const timer = setTimeout(() => {
        setStatusMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);


  // Load and inspect PDF file
  const handleLoadPdf = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setStatusMsg({ type: "error", text: "File harus berformat PDF." });
      return;
    }

    try {
      setStatusMsg({ type: "info", text: "Membaca dan menganalisis ukuran halaman PDF..." });
      const buffer = await file.arrayBuffer();

      const { PDFDocument } = await import("pdf-lib");
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
      } catch (err: unknown) {
        console.error("Encrypted or invalid PDF:", err);
        setStatusMsg({
          type: "error",
          text: "PDF terenkripsi atau terproteksi password. Harap buka kunci terlebih dahulu.",
        });
        return;
      }

      const pages = pdfDoc.getPages();
      if (pages.length === 0) {
        setStatusMsg({ type: "error", text: "PDF tidak memiliki halaman." });
        return;
      }

      const rawPagesData = pages.map((p) => {
        const size = p.getSize();
        return {
          width: size.width,
          height: size.height,
          rotation: p.getRotation().angle,
        };
      });

      const summary = analyzeDocumentDimensions(rawPagesData);
      setPdfFile(file);
      setPdfBuffer(buffer);
      setDocSummary(summary);
      setCurrentPage(1);
      setLastConvertedResult(null);
      setStatusMsg(null);
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Gagal memproses file PDF." });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLoadPdf(file);
  };

  // Convert handler
  const handleConvert = async () => {
    if (!pdfBuffer || !pdfFile) return;

    setIsConverting(true);
    setConvertProgress(0);
    setStatusMsg({ type: "info", text: "Memulai proses konversi ukuran kertas..." });

    try {
      let customWidthPt = customWidth;
      let customHeightPt = customHeight;
      if (customUnit === "mm") {
        customWidthPt = customWidth * (72 / 25.4);
        customHeightPt = customHeight * (72 / 25.4);
      } else if (customUnit === "inch") {
        customWidthPt = customWidth * 72;
        customHeightPt = customHeight * 72;
      }

      const result = await convertPdfPaperSize(pdfBuffer, pdfFile.name, {
        targetStandardId,
        customWidthPt,
        customHeightPt,
        targetOrientation,
        mode,
        tileOutputMode,
        overlapMm,
        targetMarginMm,
        pageScope,
        pageRange,
        onProgress: (cur, tot, percent) => {
          setConvertProgress(percent);
          setStatusMsg({
            type: "info",
            text: `Memproses ${cur} dari ${tot} (${percent}%)...`,
          });
        },
      });


      setLastConvertedResult(result);

      // Auto-save to SonOS virtual file system (IndexedDB)
      try {
        if (result.tileFiles && result.tileFiles.length > 0) {
          // Save all individual tile files
          for (let i = 0; i < result.tileFiles.length; i++) {
            const tile = result.tileFiles[i];
            const virtualTile: VirtualItem = {
              id: `pdf-tile-${Date.now()}-${i}`,
              parentId: null,
              name: tile.fileName,
              isFolder: false,
              size: tile.blob.size,
              type: "application/pdf",
              blob: tile.blob,
              createdAt: Date.now(),
            };
            await saveVirtualItem(virtualTile);
          }
        }

        // Also save primary combined PDF
        const virtualFile: VirtualItem = {
          id: `pdf-conv-${Date.now()}`,
          parentId: null, // Root folder
          name: result.fileName,
          isFolder: false,
          size: result.blob.size,
          type: "application/pdf",
          blob: result.blob,
          createdAt: Date.now(),
        };
        await saveVirtualItem(virtualFile);

        showNotification(
          "PDF Berhasil Dikonversi",
          `Disimpan ke File Manager: ${result.fileName}`,
          "Paper Size",
          "FileStack"
        );
      } catch (err) {
        console.warn("Could not auto-save to virtual_fs:", err);
      }

      const finishMsg =
        result.tileFiles && result.tileFiles.length > 0
          ? `Konversi selesai! ${result.tileFiles.length} file tile disimpan ke File Manager.`
          : `Konversi selesai! Disimpan ke virtual file system (${result.fileName}).`;

      setStatusMsg({
        type: "success",
        text: finishMsg,
      });
    } catch (err: unknown) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Gagal mengonversi PDF. Periksa opsi yang dipilih." });
    } finally {
      setIsConverting(false);
    }
  };

  // Download converted file (and separate tile files if applicable)
  const handleDownload = (resultToDownload?: ConvertPdfResult | null) => {
    const res = resultToDownload || lastConvertedResult;
    if (!res) return;

    if (res.tileFiles && res.tileFiles.length > 0) {
      // Download all tile files sequentially
      res.tileFiles.forEach((tf, index) => {
        setTimeout(() => {
          const url = URL.createObjectURL(tf.blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = tf.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, index * 300);
      });
      return;
    }

    const url = URL.createObjectURL(res.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // Open converted in PDF Studio app
  const handleOpenInPdfStudio = () => {
    const pdfApp = APPS.find((a) => a.id === "pdf");
    if (pdfApp) {
      const appMeta = getAppTranslation("pdf", language);
      openWindow({ ...pdfApp, title: appMeta?.title || pdfApp.title });
    }
  };

  const currentPageInfo = docSummary?.pages[currentPage - 1] || null;

  return (
    <div
      className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${isLight ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-zinc-100"
        }`}
    >
      {/* Top Header Bar */}
      <div
        className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 shrink-0 ${isLight ? "bg-white/90 border-slate-200" : "bg-zinc-900/90 border-white/10"
          }`}
      >
        {/* Left: App Title & File Meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <FileStack size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">Paper Size Converter</span>
              {pdfFile && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-50 ${isLight ? "bg-slate-200 text-slate-700" : "bg-zinc-800 text-zinc-300"
                    }`}
                >
                  {pdfFile.name}
                </span>
              )}
            </div>

            {docSummary && (
              <div className="flex items-center gap-2 text-[10px] opacity-70 mt-0.5">
                <span>{docSummary.summaryLabel}</span>
                <span>•</span>
                <span>{docSummary.pageCount} Halaman</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {pdfBuffer && (
            <>
              <button
                type="button"
                onClick={() => setIsPageListOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isPageListOpen
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : isLight
                      ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      : "bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700"
                  }`}
              >
                <Layers size={13} />
                <span className="hidden sm:inline">Daftar Halaman</span>
              </button>

              {lastConvertedResult && (
                <button
                  type="button"
                  onClick={() => handleDownload()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title="Unduh PDF hasil konversi"
                >
                  <Download size={13} />
                  <span>Unduh</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isLight
                ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                : "bg-white/10 border-white/15 text-white hover:bg-white/15"
              }`}
          >
            <Upload size={13} />
            <span>{pdfBuffer ? "Ganti File" : "Buka PDF"}</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Converting Progress Overlay Modal */}
        {isConverting && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-40 flex items-center justify-center p-6">
            <div
              className={`max-w-xs w-full p-5 rounded-3xl border shadow-2xl flex flex-col items-center text-center space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-white/10"
                }`}
            >
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Mengonversi Dokumen PDF...</h4>
                <p className="text-[11px] opacity-70 mt-0.5">
                  Menyesuaikan ukuran kertas ke {targetStandardId.toUpperCase()}
                </p>
              </div>
              <div className="w-full space-y-1">
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                    style={{ width: `${convertProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-70">
                  <span>Progress</span>
                  <span>{convertProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Toast Alert */}
        {statusMsg && !isConverting && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl border flex items-center gap-2.5 transition-all backdrop-blur-md ${
              statusMsg.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30"
                : statusMsg.type === "error"
                  ? "bg-rose-950/90 text-rose-300 border-rose-500/30"
                  : "bg-zinc-900/90 text-zinc-200 border-white/15"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            ) : statusMsg.type === "error" ? (
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
            ) : (
              <Loader2 size={15} className="animate-spin text-indigo-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
            {lastConvertedResult && statusMsg.type === "success" && (
              <button
                type="button"
                onClick={handleOpenInPdfStudio}
                className="ml-2 underline text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 shrink-0"
              >
                Buka di PDF Studio <ExternalLink size={11} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="ml-1 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer shrink-0"
              title="Tutup Notifikasi"
            >
              <X size={13} />
            </button>
          </div>
        )}



        {pdfBuffer ? (
          <>
            {/* Sidebar Controls */}
            <PaperSizeControls
              isLight={isLight}
              targetStandardId={targetStandardId}
              setTargetStandardId={setTargetStandardId}
              customWidth={customWidth}
              setCustomWidth={setCustomWidth}
              customHeight={customHeight}
              setCustomHeight={setCustomHeight}
              customUnit={customUnit}
              setCustomUnit={setCustomUnit}
              targetOrientation={targetOrientation}
              setTargetOrientation={setTargetOrientation}
              mode={mode}
              setMode={setMode}
              tileOutputMode={tileOutputMode}
              setTileOutputMode={setTileOutputMode}
              overlapMm={overlapMm}
              setOverlapMm={setOverlapMm}
              targetMarginMm={targetMarginMm}
              setTargetMarginMm={setTargetMarginMm}
              pageScope={pageScope}
              setPageScope={setPageScope}
              pageRange={pageRange}
              setPageRange={setPageRange}
              totalPages={docSummary?.pageCount || 1}
              isConverting={isConverting}
              onConvert={handleConvert}
              hasFile={!!pdfBuffer}
            />

            {/* Preview Section */}
            <PaperSizePreview
              isLight={isLight}
              pdfBuffer={pdfBuffer}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={docSummary?.pageCount || 1}
              currentPageInfo={currentPageInfo}
              targetStandardId={targetStandardId}
              customWidth={customWidth}
              customHeight={customHeight}
              targetOrientation={targetOrientation}
              mode={mode}
              overlapMm={overlapMm}
              targetMarginMm={targetMarginMm}
            />



            {/* Pages Drawer */}
            <PaperSizePageList
              isLight={isLight}
              summary={docSummary}
              currentPage={currentPage}
              onSelectPage={(pageNum) => setCurrentPage(pageNum)}
              isOpen={isPageListOpen}
              onClose={() => setIsPageListOpen(false)}
            />
          </>
        ) : (
          /* Empty / Upload Dropzone */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleLoadPdf(file);
              }}
              className={`max-w-md w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${isLight
                  ? "border-slate-300 bg-white/70 hover:bg-slate-100 hover:border-indigo-500 shadow-sm"
                  : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-indigo-500 shadow-xl"
                }`}
            >
              <div className="p-4 rounded-3xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 mb-4 shadow-inner">
                <FileStack size={44} />
              </div>
              <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                Pilih atau Tarik File PDF ke Sini
              </h3>
              <p
                className={`text-xs mt-1.5 max-w-xs leading-relaxed ${isLight ? "text-slate-500" : "text-zinc-400"
                  }`}
              >
                Mendeteksi ukuran kertas halaman (A4, Letter, Legal, A3, A5) dan mengonversi ke ukuran baru secara 100% aman di browser Anda.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Upload size={14} /> Pilih File PDF
                </button>
              </div>

              {/* Supported standard badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 opacity-60">
                {STANDARD_PAPER_SIZES.slice(0, 5).map((s) => (
                  <span
                    key={s.id}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10"
                  >
                    {s.name}
                  </span>
                ))}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                  Custom
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
