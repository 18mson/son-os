"use client";

import React from "react";
import { Layers, Check, AlertTriangle } from "lucide-react";
import { DocumentSummaryInfo, PageDimensionInfo } from "@/lib/pdf/paperSizes";


interface PaperSizePageListProps {
  isLight: boolean;
  summary: DocumentSummaryInfo | null;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PaperSizePageList: React.FC<PaperSizePageListProps> = ({
  isLight,
  summary,
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div
      className={`w-72 border-l shrink-0 flex flex-col h-full overflow-hidden ${
        isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-white/10"
      }`}
    >
      {/* Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-950/60 border-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-indigo-400" />
          <span className="text-xs font-bold">Daftar Halaman ({summary.pageCount})</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100 p-1 cursor-pointer font-bold"
        >
          ✕
        </button>
      </div>

      {/* Summary Alert */}
      <div className="p-3 border-b border-black/5 dark:border-white/5">
        <div
          className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
            summary.isUniform
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
          }`}
        >
          {summary.isUniform ? (
            <Check size={14} className="shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block">
              {summary.isUniform ? "Ukuran Seragam" : "Ukuran Campuran Terdeteksi"}
            </span>
            <span className="text-[10px] opacity-80 block mt-0.5 leading-tight">
              {summary.summaryLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {summary.pages.map((p: PageDimensionInfo) => {
          const isSelected = currentPage === p.pageNumber;
          return (
            <button
              key={p.pageNumber}
              type="button"
              onClick={() => onSelectPage(p.pageNumber)}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? isLight
                    ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs"
                    : "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                  : isLight
                  ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-9 rounded-md border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isLight
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-zinc-800 border-white/10 text-zinc-300"
                  }`}
                >
                  {p.pageNumber}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate">{p.detectedName}</span>
                  </div>
                  <span className="text-[10px] opacity-60 font-mono block">
                    {p.visualWidthMm}×{p.visualHeightMm} mm
                  </span>
                </div>
              </div>

              {/* Orientation & Rotation Badge */}
              <div className="flex flex-col items-end shrink-0 pl-1">
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                    p.orientation === "landscape"
                      ? "bg-sky-500/15 text-sky-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {p.orientation === "landscape" ? "Land" : "Port"}
                </span>
                {p.rotation > 0 && (
                  <span className="text-[8px] font-mono opacity-60 mt-0.5">
                    {p.rotation}°
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
