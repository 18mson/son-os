import React from "react";
import { Plus, Trash2, RotateCw, Combine } from "lucide-react";

interface PdfSidebarControlsProps {
  isLight: boolean;
  activeTab: "viewer" | "watermark" | "merge" | "tools";
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
}) => {
  return (
    <div
      className={`w-full md:w-64 border-r p-4 space-y-4 shrink-0 overflow-y-auto ${
        isLight ? "bg-slate-100/90 border-slate-300" : "bg-zinc-900/60 border-white/10"
      }`}
    >
      {activeTab === "viewer" && (
        <div className="space-y-4">
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
        <div className="space-y-4">
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
        <div className="space-y-4">
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Hapus Halaman Ini
          </button>
        </div>
      )}

      {activeTab === "merge" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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

          <div className="space-y-2 max-h-48 overflow-y-auto">
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

          <button
            onClick={handleMergePdfs}
            disabled={mergeFiles.length < 2}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Combine size={14} /> Gabungkan {mergeFiles.length} File
          </button>
        </div>
      )}
    </div>
  );
};
