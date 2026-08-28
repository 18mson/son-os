import React from "react";
import { Plus, Minus, Trash2, RotateCw, Combine, Scissors, X, Image as ImageIcon, Download, Sparkles, FileText } from "lucide-react";

interface SplitRange {
  start: number;
  end: number;
  label: string;
}

interface PdfSidebarControlsProps {
  isLight: boolean;
  activeTab: "viewer" | "watermark" | "merge" | "tools" | "split" | "jpg" | "compress";
  pdfFile: File | null;
  numPages: number;
  currentPage: number;
  watermarkText: string;
  setWatermarkText: (v: string) => void;
  watermarkFontSize: number;
  setWatermarkFontSize: (v: number) => void;
  handleApplyWatermark: () => void;
  handleRotatePage: () => void;
  handleDeletePage: () => void;
  mergeFiles: File[];
  setMergeFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleMergePdfs: () => void;
  mergeInputRef: React.RefObject<HTMLInputElement | null>;
  handleMergeFilesAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Split props
  splitRanges: SplitRange[];
  setSplitRanges: React.Dispatch<React.SetStateAction<SplitRange[]>>;
  handleSplitPdf: () => void;
  // JPG Export props
  jpgScale?: number;
  setJpgScale?: (scale: number) => void;
  jpgQuality?: number;
  setJpgQuality?: (q: number) => void;
  jpgResizeMode?: "scale" | "width" | "height";
  setJpgResizeMode?: (m: "scale" | "width" | "height") => void;
  jpgCustomWidth?: number;
  setJpgCustomWidth?: (w: number) => void;
  jpgPageScope?: "current" | "all" | "range";
  setJpgPageScope?: (s: "current" | "all" | "range") => void;
  jpgPageRange?: string;
  setJpgPageRange?: (r: string) => void;
  handleDownloadCurrentPageJpg?: () => void;
  handleDownloadCurrentPagePdf?: () => void;
  handleBatchExportJpg?: () => void;
  isJpgConverting?: boolean;
  // Compress PDF props
  pdfCompressScale?: number;
  setPdfCompressScale?: (v: number) => void;
  pdfCompressQuality?: number;
  setPdfCompressQuality?: (v: number) => void;
  handleCompressPdf?: () => void;
  isPdfCompressing?: boolean;
  pdfCompressProgress?: number;
}

export const PdfSidebarControls: React.FC<PdfSidebarControlsProps> = ({
  isLight,
  activeTab,
  pdfFile,
  numPages,
  currentPage,
  watermarkText,
  setWatermarkText,
  watermarkFontSize,
  setWatermarkFontSize,
  handleApplyWatermark,
  handleRotatePage,
  handleDeletePage,
  mergeFiles,
  setMergeFiles,
  handleMergePdfs,
  mergeInputRef,
  handleMergeFilesAdd,
  splitRanges,
  setSplitRanges,
  handleSplitPdf,
  jpgScale,
  setJpgScale,
  jpgQuality,
  setJpgQuality,
  jpgResizeMode,
  setJpgResizeMode,
  jpgCustomWidth,
  setJpgCustomWidth,
  jpgPageScope,
  setJpgPageScope,
  jpgPageRange,
  setJpgPageRange,
  handleDownloadCurrentPageJpg,
  handleDownloadCurrentPagePdf,
  handleBatchExportJpg,
  isJpgConverting,
  pdfCompressScale,
  setPdfCompressScale,
  pdfCompressQuality,
  setPdfCompressQuality,
  handleCompressPdf,
  isPdfCompressing,
  pdfCompressProgress,
}) => {
  const addSplitRange = () => {
    setSplitRanges((prev) => [
      ...prev,
      { start: 1, end: numPages || 1, label: `part${prev.length + 1}` },
    ]);
  };

  const removeSplitRange = (idx: number) => {
    setSplitRanges((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSplitRange = (idx: number, field: keyof SplitRange, value: string | number) => {
    setSplitRanges((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div
      className={`w-full md:w-64 border-r p-4 shrink-0 flex flex-col h-full overflow-hidden ${
        isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/60 border-white/10"
      }`}
    >
      {activeTab === "viewer" && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            Informasi File
          </h3>
          {pdfFile ? (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
              }`}
            >
              <p className="font-semibold truncate">{pdfFile.name}</p>
              <p className="opacity-75 text-[11px]">{(pdfFile.size / 1024).toFixed(1)} KB</p>
              <p className="opacity-75 text-[11px]">{numPages} Halaman</p>
            </div>
          ) : (
            <p className="text-xs opacity-75">Buka file PDF dari komputer Anda untuk melihat isi dokumen.</p>
          )}
        </div>
      )}

      {activeTab === "watermark" && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            Teks Watermark
          </h3>
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
            onClick={handleApplyWatermark}
            disabled={!pdfFile}
            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Terapkan ke Semua Halaman
          </button>
        </div>
      )}

      {activeTab === "tools" && (
        <div className="flex-1 overflow-y-auto space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            Edit Halaman ({currentPage})
          </h3>

          <button
            onClick={handleRotatePage}
            disabled={!pdfFile}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight ? "bg-white border-slate-300 hover:bg-slate-50" : "bg-white/10 border-white/10 hover:bg-white/15"
            }`}
          >
            <RotateCw size={14} /> Putar Halaman (90°)
          </button>

          <button
            onClick={handleDeletePage}
            disabled={!pdfFile || numPages <= 1}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
          >
            <Trash2 size={14} /> Hapus Halaman Ini
          </button>
        </div>
      )}

      {activeTab === "merge" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              Gabung PDF
            </h3>
            <input
              ref={mergeInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleMergeFilesAdd}
              className="hidden"
            />
            <button
              onClick={() => mergeInputRef.current?.click()}
              className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
              title="Tambah PDF"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-0.5">
            {mergeFiles.length === 0 ? (
              <p className="text-xs opacity-75">Klik + untuk menambah file PDF yang ingin digabungkan.</p>
            ) : (
              mergeFiles.map((file, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => setMergeFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-rose-400 hover:text-rose-300 p-0.5 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 pt-2 border-t border-white/5">
            <button
              onClick={handleMergePdfs}
              disabled={mergeFiles.length < 2}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Combine size={14} /> Gabungkan {mergeFiles.length} File
            </button>
          </div>
        </div>
      )}

      {activeTab === "split" && (
        <div className="flex flex-col h-full overflow-hidden space-y-3">
          {/* Top Fixed Header & Presets */}
          <div className="space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Pisahkan PDF
              </h3>
              <button
                onClick={addSplitRange}
                className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                title="Tambah Range"
              >
                <Plus size={14} />
              </button>
            </div>

            {!pdfFile && (
              <p className="text-xs opacity-75">Buka file PDF terlebih dahulu untuk menggunakan fitur split.</p>
            )}

            {pdfFile && (
              <>
                <div
                  className={`px-3 py-2 rounded-xl border text-[11px] ${
                    isLight ? "bg-white/70 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-zinc-400"
                  }`}
                >
                  Total: <span className="font-semibold text-rose-500">{numPages} halaman</span>.
                  <p className="text-[10px] opacity-75 mt-0.5">
                    Atur rentang atau klik garis gunting pada preview halaman.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Full-Height Scrollable Range Cards List */}
          {pdfFile && (
            <>
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 min-h-0">
                {splitRanges.map((range, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border space-y-2 ${
                      isLight ? "bg-white border-slate-200" : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="text-[11px] font-bold">Bagian {idx + 1}</span>
                        <span className="text-[10px] opacity-60">
                          ({Math.max(0, range.end - range.start + 1)} hal)
                        </span>
                      </div>
                      {splitRanges.length > 1 && (
                        <button
                          onClick={() => removeSplitRange(idx)}
                          className="text-rose-400 hover:text-rose-300 p-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] opacity-60 block mb-0.5">Dari hal.</label>
                        <div
                          className={`flex items-center rounded-lg border overflow-hidden transition-colors ${
                            isLight
                              ? "bg-slate-50 border-slate-300 focus-within:border-rose-500"
                              : "bg-white/8 border-white/15 focus-within:border-rose-500"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateSplitRange(idx, "start", Math.max(1, range.start - 1))}
                            disabled={range.start <= 1}
                            className="px-1.5 py-1 hover:bg-black/10 disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Kurang 1 Halaman"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={numPages || 1}
                            value={range.start}
                            onChange={(e) =>
                              updateSplitRange(
                                idx,
                                "start",
                                Math.max(1, Math.min(numPages || 1, Number(e.target.value) || 1))
                              )
                            }
                            className={`w-full text-center py-1 text-xs font-mono font-bold outline-hidden bg-transparent ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => updateSplitRange(idx, "start", Math.min(range.end, range.start + 1))}
                            disabled={range.start >= range.end}
                            className="px-1.5 py-1 hover:bg-black/10 disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Tambah 1 Halaman"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] opacity-60 block mb-0.5">Sampai hal.</label>
                        <div
                          className={`flex items-center rounded-lg border overflow-hidden transition-colors ${
                            isLight
                              ? "bg-slate-50 border-slate-300 focus-within:border-rose-500"
                              : "bg-white/8 border-white/15 focus-within:border-rose-500"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateSplitRange(idx, "end", Math.max(range.start, range.end - 1))}
                            disabled={range.end <= range.start}
                            className="px-1.5 py-1 hover:bg-black/10 disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Kurang 1 Halaman"
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={numPages || 1}
                            value={range.end}
                            onChange={(e) =>
                              updateSplitRange(
                                idx,
                                "end",
                                Math.max(1, Math.min(numPages || 1, Number(e.target.value) || 1))
                              )
                            }
                            className={`w-full text-center py-1 text-xs font-mono font-bold outline-hidden bg-transparent ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => updateSplitRange(idx, "end", Math.min(numPages || 1, range.end + 1))}
                            disabled={range.end >= (numPages || 1)}
                            className="px-1.5 py-1 hover:bg-black/10 disabled:opacity-30 cursor-pointer text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Tambah 1 Halaman"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] opacity-60 block mb-0.5">Nama file</label>
                      <input
                        type="text"
                        value={range.label}
                        onChange={(e) => updateSplitRange(idx, "label", e.target.value)}
                        className={`w-full px-2 py-1 rounded-lg border text-xs outline-hidden focus:border-rose-500 ${
                          isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-white/8 border-white/15 text-white"
                        }`}
                        placeholder="e.g. bab1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button Docked at Bottom */}
              <div className="shrink-0 pt-2 border-t border-white/5">
                <button
                  onClick={handleSplitPdf}
                  disabled={splitRanges.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Scissors size={14} /> Split {splitRanges.length} Bagian
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "jpg" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden space-y-3">
          <div className="shrink-0 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"} flex items-center gap-1.5`}>
                <ImageIcon size={14} className="text-rose-500" /> Export ke JPG
              </h3>
              {pdfFile && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-semibold">
                  Hal {currentPage}/{numPages}
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-75">
              Ubah ukuran (resize) dan atur kompresi kualitas gambar agar ukuran file kecil.
            </p>
          </div>

          {!pdfFile ? (
            <p className="text-xs opacity-75">Buka file PDF terlebih dahulu untuk mengonversi ke JPG.</p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-3.5 min-h-0 text-xs">
              {/* Page Scope Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold block opacity-80">Pilihan Halaman</label>
                <div
                  className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                    isLight ? "bg-slate-200/80 border-slate-300" : "bg-white/5 border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setJpgPageScope?.("current")}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      jpgPageScope === "current"
                        ? "bg-rose-600 text-white shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:text-slate-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Hal Ini ({currentPage})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJpgPageScope?.("all")}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      jpgPageScope === "all"
                        ? "bg-rose-600 text-white shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:text-slate-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Semua ({numPages})
                  </button>
                  <button
                    type="button"
                    onClick={() => setJpgPageScope?.("range")}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      jpgPageScope === "range"
                        ? "bg-rose-600 text-white shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:text-slate-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Rentang
                  </button>
                </div>

                {jpgPageScope === "range" && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Contoh: 1-3, 5, 7-10"
                      value={jpgPageRange || ""}
                      onChange={(e) => setJpgPageRange?.(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-hidden focus:border-rose-500 font-mono ${
                        isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/8 border-white/10 text-white"
                      }`}
                    />
                    <span className="text-[10px] opacity-60 mt-0.5 block">
                      Pisahkan dengan koma atau tanda minus (-)
                    </span>
                  </div>
                )}
              </div>

              {/* Resize & Resolution Settings */}
              <div
                className={`p-3 rounded-2xl border space-y-2.5 ${
                  isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold opacity-90 flex items-center gap-1">
                    <Sparkles size={12} className="text-rose-500" /> Resolusi / Resize
                  </label>
                  <span className="text-[10px] font-mono font-bold text-rose-500">
                    {Math.round((jpgScale || 1.0) * 100)}% ({((jpgScale || 1.0)).toFixed(2)}x)
                  </span>
                </div>

                {/* Mode Selector */}
                <div
                  className={`grid grid-cols-2 gap-1 p-0.5 rounded-xl border ${
                    isLight ? "bg-slate-100 border-slate-200" : "bg-black/20 border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setJpgResizeMode?.("scale")}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      (jpgResizeMode || "scale") === "scale"
                        ? "bg-rose-600 text-white shadow-xs"
                        : isLight
                        ? "text-slate-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Skala Persen (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJpgResizeMode?.("width")}
                    className={`py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      jpgResizeMode === "width"
                        ? "bg-rose-600 text-white shadow-xs"
                        : isLight
                        ? "text-slate-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Lebar Pixel (px)
                  </button>
                </div>

                {(jpgResizeMode || "scale") === "scale" ? (
                  <>
                    {/* Preset Scale Badges */}
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "50%", scale: 0.5, desc: "Kecil" },
                        { label: "75%", scale: 0.75, desc: "Sedang" },
                        { label: "100%", scale: 1.0, desc: "Standar" },
                        { label: "150%", scale: 1.5, desc: "HD" },
                      ].map((p) => {
                        const isSelected = Math.abs((jpgScale || 1.0) - p.scale) < 0.05;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setJpgResizeMode?.("scale");
                              setJpgScale?.(p.scale);
                            }}
                            className={`px-1.5 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-rose-500/15 border-rose-500 text-rose-500 font-bold"
                                : isLight
                                ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                            }`}
                          >
                            <div className="text-[10px] font-bold leading-tight">{p.label}</div>
                            <div className="text-[8px] opacity-60 leading-tight">{p.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Scale Range Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] opacity-75 mb-1">
                        <span>Skala Kustom (25% - 200%)</span>
                        <span className="font-mono">{Math.round((jpgScale || 1.0) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={200}
                        step={5}
                        value={Math.round((jpgScale || 1.0) * 100)}
                        onChange={(e) => {
                          setJpgResizeMode?.("scale");
                          setJpgScale?.(Number(e.target.value) / 100);
                        }}
                        className="w-full accent-rose-500 cursor-pointer h-1.5"
                      />
                      <div className="flex justify-between text-[9px] opacity-50 font-mono mt-0.5">
                        <span>Hemat (25%)</span>
                        <span>100%</span>
                        <span>HD (200%)</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] opacity-75 block">Lebar Target (Pixel)</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[600, 1000, 1600].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setJpgCustomWidth?.(w)}
                          className={`py-1 rounded-lg border text-[10px] font-mono font-semibold cursor-pointer transition-all ${
                            jpgCustomWidth === w
                              ? "bg-rose-500/15 border-rose-500 text-rose-500"
                              : isLight
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white/5 border-white/10 text-zinc-300"
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={200}
                      max={4000}
                      step={50}
                      value={jpgCustomWidth || 1200}
                      onChange={(e) => setJpgCustomWidth?.(Number(e.target.value))}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-hidden focus:border-rose-500 font-mono ${
                        isLight ? "bg-white border-slate-300 text-slate-900" : "bg-white/8 border-white/10 text-white"
                      }`}
                      placeholder="Lebar (px)"
                    />
                  </div>
                )}

                {/* Estimated Dimension badge */}
                <div
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] flex items-center justify-between ${
                    isLight ? "bg-slate-100 text-slate-700" : "bg-black/20 text-zinc-300"
                  }`}
                >
                  <span className="opacity-75">Target Dimensi:</span>
                  <span className="font-mono font-bold text-rose-500">
                    {jpgResizeMode === "width"
                      ? `± ${jpgCustomWidth || 1200} × ${Math.round((jpgCustomWidth || 1200) * 1.414)} px`
                      : `± ${Math.round(595 * (jpgScale || 1.0))} × ${Math.round(842 * (jpgScale || 1.0))} px`}
                  </span>
                </div>
              </div>

              {/* Compression & Quality Settings */}
              <div
                className={`p-3 rounded-2xl border space-y-2.5 ${
                  isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold opacity-90">Kualitas Kompresi JPG</label>
                  <span className="text-[10px] font-mono font-bold text-amber-500">
                    {Math.round((jpgQuality || 0.8) * 100)}%
                  </span>
                </div>

                {/* Quality Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: "35%", val: 0.35, text: "Kecil" },
                    { label: "65%", val: 0.65, text: "Sedang" },
                    { label: "85%", val: 0.85, text: "Jernih" },
                    { label: "95%", val: 0.95, text: "Maks" },
                  ].map((q) => {
                    const isSelected = Math.abs((jpgQuality || 0.8) - q.val) < 0.05;
                    return (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => setJpgQuality?.(q.val)}
                        className={`px-1.5 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-500 font-bold"
                            : isLight
                            ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-[10px] font-bold leading-tight">{q.label}</div>
                        <div className="text-[8px] opacity-60 leading-tight">{q.text}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Quality Slider */}
                <div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={5}
                    value={Math.round((jpgQuality || 0.8) * 100)}
                    onChange={(e) => setJpgQuality?.(Number(e.target.value) / 100)}
                    className="w-full accent-amber-500 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[9px] opacity-50 font-mono mt-0.5">
                    <span>File Super Ringan</span>
                    <span>Kualitas Tinggi</span>
                  </div>
                </div>

                <p className="text-[10px] opacity-70 leading-relaxed">
                  💡 Gunakan kualitas <strong>35%–65%</strong> dan skala <strong>50%–75%</strong> untuk menghasilkan ukuran file JPG yang sangat kecil & hemat memori.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                {jpgPageScope === "current" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadCurrentPageJpg}
                      disabled={isJpgConverting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                    >
                      <Download size={14} /> Unduh Halaman {currentPage} (.jpg)
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCurrentPagePdf}
                      disabled={isJpgConverting}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                      }`}
                    >
                      <FileText size={14} className="text-rose-400" /> Unduh Halaman {currentPage} (.pdf)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBatchExportJpg}
                      disabled={isJpgConverting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                    >
                      <Download size={14} />{" "}
                      {jpgPageScope === "all"
                        ? `Unduh Semua ${numPages} Halaman (.jpg)`
                        : `Unduh Rentang Halaman (.jpg)`}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCurrentPageJpg}
                      disabled={isJpgConverting}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                      }`}
                    >
                      <Download size={13} /> Hanya Halaman Ini ({currentPage}) (.jpg)
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === "compress" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden space-y-3">
          <div className="shrink-0 space-y-1">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              <Sparkles size={12} className="text-rose-500" /> Kompres Ukuran PDF
            </h3>
            <p className={`text-[10px] leading-relaxed ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Kecilkan ukuran file (misal 100MB menjadi ~10MB). Output tetap dalam format <strong>.pdf</strong>.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {/* Compression Presets */}
            <div className={`p-3 rounded-2xl border space-y-2.5 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"}`}>
              <label className="text-[11px] font-bold opacity-90 block">Level Kompresi</label>
              <div className="space-y-1.5">
                {[
                  {
                    label: "Ekstrem (Ukuran Sangat Kecil)",
                    desc: "Hemat s/d 85-90% • Cocok untuk upload cepat / email",
                    scale: 0.7,
                    quality: 0.45,
                  },
                  {
                    label: "Sedang (Rekomendasi)",
                    desc: "Hemat s/d 60-75% • Teks & gambar tetap tajam",
                    scale: 0.85,
                    quality: 0.7,
                  },
                  {
                    label: "Ringan (Kualitas Maksimal)",
                    desc: "Hemat s/d 30-50% • Kualitas gambar mendekati asli",
                    scale: 1.0,
                    quality: 0.85,
                  },
                ].map((p) => {
                  const isSelected =
                    Math.abs((pdfCompressScale || 0.85) - p.scale) < 0.05 &&
                    Math.abs((pdfCompressQuality || 0.7) - p.quality) < 0.05;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setPdfCompressScale?.(p.scale);
                        setPdfCompressQuality?.(p.quality);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose-500/15 border-rose-500 text-rose-500"
                          : isLight
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{p.label}</div>
                      <div className="text-[9px] opacity-60 leading-tight mt-0.5">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Sliders */}
            <div className={`p-3 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-white/5 border-white/10"}`}>
              <label className="text-[11px] font-bold opacity-90 block">Kustomisasi Manual</label>

              {/* Resolution / Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] opacity-75">
                  <span>Skala Resolusi Halaman</span>
                  <span className="font-mono font-bold text-rose-500">{Math.round((pdfCompressScale || 0.85) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={120}
                  step={5}
                  value={Math.round((pdfCompressScale || 0.85) * 100)}
                  onChange={(e) => setPdfCompressScale?.(Number(e.target.value) / 100)}
                  className="w-full accent-rose-500 cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[9px] opacity-50 font-mono">
                  <span>50% (Kecil)</span>
                  <span>100% (Asli)</span>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] opacity-75">
                  <span>Kualitas Gambar (JPEG Quality)</span>
                  <span className="font-mono font-bold text-rose-500">{Math.round((pdfCompressQuality || 0.7) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={95}
                  step={5}
                  value={Math.round((pdfCompressQuality || 0.7) * 100)}
                  onChange={(e) => setPdfCompressQuality?.(Number(e.target.value) / 100)}
                  className="w-full accent-rose-500 cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[9px] opacity-50 font-mono">
                  <span>20% (Kecil)</span>
                  <span>95% (HD)</span>
                </div>
              </div>
            </div>

            {/* Progress indicator during compression */}
            {isPdfCompressing && (
              <div className={`p-3 rounded-2xl border space-y-2 ${isLight ? "bg-amber-50 border-amber-200" : "bg-amber-500/10 border-amber-500/20"}`}>
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-500">
                  <span>Mengompresi PDF...</span>
                  <span className="font-mono">{pdfCompressProgress || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-rose-500 to-amber-500 transition-all duration-200 rounded-full"
                    style={{ width: `${pdfCompressProgress || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="shrink-0 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleCompressPdf}
              disabled={isPdfCompressing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {isPdfCompressing ? (
                <>Memproses ({pdfCompressProgress || 0}%)...</>
              ) : (
                <><Download size={14} /> Kompres &amp; Unduh PDF</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
