import React from "react";
import { Plus, Minus, Trash2, RotateCw, Combine, Scissors, X } from "lucide-react";

interface SplitRange {
  start: number;
  end: number;
  label: string;
}

interface PdfSidebarControlsProps {
  isLight: boolean;
  activeTab: "viewer" | "watermark" | "merge" | "tools" | "split";
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
    </div>
  );
};
