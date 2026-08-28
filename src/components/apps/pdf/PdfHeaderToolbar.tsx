import React from "react";
import {
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from "lucide-react";

interface PdfHeaderToolbarProps {
  isLight: boolean;
  activeTab: "viewer" | "watermark" | "merge" | "tools" | "split";
  setActiveTab: (tab: "viewer" | "watermark" | "merge" | "tools" | "split") => void;
  pdfBuffer: ArrayBuffer | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadPdf: () => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  numPages: number;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  statusMsg: string | null;
  setStatusMsg: (msg: string | null) => void;
  numPagesTotal?: number;
}

export const PdfHeaderToolbar: React.FC<PdfHeaderToolbarProps> = ({
  isLight,
  activeTab,
  setActiveTab,
  pdfBuffer,
  fileInputRef,
  handleFileChange,
  handleDownloadPdf,
  currentPage,
  setCurrentPage,
  numPages,
  scale,
  setScale,
  statusMsg,
  setStatusMsg,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  numPagesTotal,
}) => {
  return (
    <>
      {/* Compact Header Bar */}
      <div
        className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
          isLight ? "bg-slate-200/90 border-slate-300" : "bg-zinc-900/90 border-white/10"
        }`}
      >
        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-1 p-1 border rounded-xl overflow-x-auto no-scrollbar max-w-full ${
            isLight ? "bg-slate-300/60 border-slate-300" : "bg-white/5 border-white/10"
          }`}
        >
          {(["viewer", "watermark", "tools", "merge", "split"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? "bg-rose-600 text-white shadow-sm"
                  : isLight
                  ? "text-slate-700 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "tools" ? "Rotate/Delete" : tab === "merge" ? "Merge" : tab === "split" ? "Split" : tab}
            </button>
          ))}
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

      {/* Persistent Page & Zoom Control Bar (hidden in split tab as split view has its own grid density controls) */}
      {pdfBuffer && activeTab !== "split" && (
        <div
          className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
            isLight ? "bg-slate-100 border-slate-300 text-slate-800" : "bg-zinc-900/60 border-white/5 text-zinc-300"
          }`}
        >
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-[11px] opacity-75">Halaman:</span>
            <div
              className={`flex items-center gap-1.5 border px-2 py-1 rounded-xl ${
                isLight ? "bg-white border-slate-300" : "bg-white/5 border-white/10"
              }`}
            >
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
            <div
              className={`flex items-center gap-1 border p-0.5 rounded-xl ${
                isLight ? "bg-white border-slate-300" : "bg-white/5 border-white/10"
              }`}
            >
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
          <button
            onClick={() => setStatusMsg(null)}
            className="opacity-75 hover:opacity-100 text-[10px] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}
    </>
  );
};
