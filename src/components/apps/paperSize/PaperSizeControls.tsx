"use client";

import React from "react";
import {
  FileStack,
  Maximize2,
  Minimize2,
  Crop,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Sliders,
  Sparkles,
  Grid,
  Scissors,
  Printer,
} from "lucide-react";

import {
  STANDARD_PAPER_SIZES,
  ConversionMode,
  TargetOrientation,
  TileOutputMode,
  SizeUnit,
  mmToPt,
  ptToMm,
  inchToPt,
  ptToInch,
} from "@/lib/pdf/paperSizes";

interface PaperSizeControlsProps {
  isLight: boolean;
  targetStandardId: string;
  setTargetStandardId: (id: string) => void;
  customWidth: number;
  setCustomWidth: (w: number) => void;
  customHeight: number;
  setCustomHeight: (h: number) => void;
  customUnit: SizeUnit;
  setCustomUnit: (unit: SizeUnit) => void;
  targetOrientation: TargetOrientation;
  setTargetOrientation: (o: TargetOrientation) => void;
  mode: ConversionMode;
  setMode: (m: ConversionMode) => void;
  tileOutputMode: TileOutputMode;
  setTileOutputMode: (m: TileOutputMode) => void;
  overlapMm: number;
  setOverlapMm: (mm: number) => void;
  targetMarginMm: number;
  setTargetMarginMm: (mm: number) => void;
  pageScope: "all" | "range";
  setPageScope: (scope: "all" | "range") => void;
  pageRange: string;
  setPageRange: (range: string) => void;
  totalPages: number;
  isConverting: boolean;
  onConvert: () => void;
  hasFile: boolean;
}


export const PaperSizeControls: React.FC<PaperSizeControlsProps> = ({
  isLight,
  targetStandardId,
  setTargetStandardId,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
  customUnit,
  setCustomUnit,
  targetOrientation,
  setTargetOrientation,
  mode,
  setMode,
  tileOutputMode,
  setTileOutputMode,
  overlapMm,
  setOverlapMm,
  targetMarginMm,
  setTargetMarginMm,
  pageScope,
  setPageScope,
  pageRange,
  setPageRange,
  totalPages,
  isConverting,
  onConvert,
  hasFile,
}) => {

  const isCustom = targetStandardId === "custom";

  // Handle unit changes while preserving physical size
  const handleUnitChange = (newUnit: SizeUnit) => {
    if (newUnit === customUnit) return;

    let widthPt = customWidth;
    let heightPt = customHeight;

    if (customUnit === "mm") {
      widthPt = mmToPt(customWidth);
      heightPt = mmToPt(customHeight);
    } else if (customUnit === "inch") {
      widthPt = inchToPt(customWidth);
      heightPt = inchToPt(customHeight);
    }

    if (newUnit === "mm") {
      setCustomWidth(ptToMm(widthPt));
      setCustomHeight(ptToMm(heightPt));
    } else if (newUnit === "inch") {
      setCustomWidth(ptToInch(widthPt));
      setCustomHeight(ptToInch(heightPt));
    } else {
      setCustomWidth(Number(widthPt.toFixed(1)));
      setCustomHeight(Number(heightPt.toFixed(1)));
    }

    setCustomUnit(newUnit);
  };

  return (
    <div
      className={`w-80 sm:w-88 md:w-96 flex flex-col border-r shrink-0 overflow-y-auto ${
        isLight ? "bg-slate-100/90 border-slate-200" : "bg-zinc-900/90 border-white/10"
      }`}
    >
      <div className="p-4 space-y-5">
        {/* Section 1: Target Paper Size */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <FileStack size={14} className="text-indigo-400" />
              <span>Target Ukuran Kertas</span>
            </label>
            {isCustom && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Custom Dimension
              </span>
            )}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {STANDARD_PAPER_SIZES.map((std) => {
              const isSelected = targetStandardId === std.id;
              return (
                <button
                  key={std.id}
                  type="button"
                  onClick={() => setTargetStandardId(std.id)}
                  className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col ${
                    isSelected
                      ? isLight
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-indigo-600/90 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                      : isLight
                      ? "bg-white border-slate-300/80 text-slate-800 hover:bg-slate-50 hover:border-slate-400"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{std.name}</span>
                    {isSelected && <CheckCircle2 size={12} className="shrink-0" />}
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? "text-indigo-100" : isLight ? "text-slate-500" : "text-zinc-400"
                    }`}
                  >
                    {std.widthMm}×{std.heightMm} mm
                  </span>
                </button>
              );
            })}

            {/* Custom Button */}
            <button
              type="button"
              onClick={() => setTargetStandardId("custom")}
              className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-center ${
                isCustom
                  ? isLight
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-indigo-600/90 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                  : isLight
                  ? "bg-white border-slate-300/80 text-slate-800 hover:bg-slate-50 hover:border-slate-400"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">Custom</span>
                {isCustom && <CheckCircle2 size={12} className="shrink-0" />}
              </div>
              <span
                className={`text-[10px] mt-0.5 ${
                  isCustom ? "text-indigo-100" : isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                Atur P × L
              </span>
            </button>
          </div>

          {/* Custom Size Inputs */}
          {isCustom && (
            <div
              className={`p-3 rounded-2xl border space-y-3 mt-2 ${
                isLight ? "bg-white border-slate-300/80" : "bg-zinc-800/60 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold opacity-70">Satuan Dimensi</span>
                <div className="flex items-center gap-1 bg-black/10 p-0.5 rounded-lg">
                  {(["mm", "inch", "pt"] as SizeUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleUnitChange(unit)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        customUnit === unit
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium opacity-70 block mb-1">
                    Lebar ({customUnit})
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={customUnit === "inch" ? 0.1 : 1}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(1, parseFloat(e.target.value) || 1))}
                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold outline-hidden transition-all ${
                      isLight
                        ? "bg-slate-50 border-slate-300 focus:border-indigo-500 text-slate-800"
                        : "bg-zinc-900 border-white/10 focus:border-indigo-500 text-zinc-100"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium opacity-70 block mb-1">
                    Tinggi ({customUnit})
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={customUnit === "inch" ? 0.1 : 1}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(1, parseFloat(e.target.value) || 1))}
                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold outline-hidden transition-all ${
                      isLight
                        ? "bg-slate-50 border-slate-300 focus:border-indigo-500 text-slate-800"
                        : "bg-zinc-900 border-white/10 focus:border-indigo-500 text-zinc-100"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Target Orientation */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
            <ArrowRightLeft size={14} className="text-sky-400" />
            <span>Orientasi Target</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "portrait", label: "Portrait", desc: "Vertikal" },
              { id: "landscape", label: "Landscape", desc: "Horizontal" },
              { id: "match_original", label: "Auto", desc: "Ikuti Asli" },
            ].map((ori) => {
              const isSelected = targetOrientation === ori.id;
              return (
                <button
                  key={ori.id}
                  type="button"
                  onClick={() => setTargetOrientation(ori.id as TargetOrientation)}
                  className={`px-2.5 py-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? isLight
                        ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                        : "bg-sky-600/90 text-white border-sky-500 shadow-md shadow-sky-600/20"
                      : isLight
                      ? "bg-white border-slate-300/80 text-slate-800 hover:bg-slate-50"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="font-bold text-xs">{ori.label}</span>
                  <span
                    className={`text-[9px] mt-0.5 ${
                      isSelected ? "text-sky-100" : isLight ? "text-slate-500" : "text-zinc-400"
                    }`}
                  >
                    {ori.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Conversion Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Sliders size={14} className="text-emerald-400" />
              <span>Mode Penyesuaian Konten</span>
            </label>
          </div>

          <div className="space-y-2">
            {/* Mode: FIT */}
            <div
              onClick={() => setMode("fit")}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "fit"
                  ? isLight
                    ? "bg-emerald-50 border-emerald-500/80 ring-2 ring-emerald-500/20"
                    : "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20"
                  : isLight
                  ? "bg-white border-slate-300/80 hover:bg-slate-50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-9 h-11 rounded-lg border-2 border-dashed flex items-center justify-center shrink-0 ${
                  mode === "fit"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-zinc-500/40 text-zinc-400"
                }`}
              >
                <Minimize2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    Fit (Proporsional)
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-500 font-bold">
                      Disarankan
                    </span>
                  </span>
                  {mode === "fit" && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-tight ${
                    isLight ? "text-slate-600" : "text-zinc-400"
                  }`}
                >
                  Skala konten pas di dalam kertas tanpa distorsi. Sisa ruang menjadi margin putih.
                </p>
              </div>
            </div>

            {/* Mode: STRETCH */}
            <div
              onClick={() => setMode("stretch")}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "stretch"
                  ? isLight
                    ? "bg-amber-50 border-amber-500/80 ring-2 ring-amber-500/20"
                    : "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20"
                  : isLight
                  ? "bg-white border-slate-300/80 hover:bg-slate-50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  mode === "stretch"
                    ? "border-amber-500 bg-amber-500/20 text-amber-400"
                    : "border-zinc-500/40 text-zinc-400"
                }`}
              >
                <Maximize2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Stretch (Penuh Kertas)</span>
                  {mode === "stretch" && <CheckCircle2 size={14} className="text-amber-400 shrink-0" />}
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-tight ${
                    isLight ? "text-slate-600" : "text-zinc-400"
                  }`}
                >
                  Menyesuaikan lebar & tinggi penuh ke ukuran baru. Bentuk bisa sedikit meregang.
                </p>
              </div>
            </div>

            {/* Mode: CROP & PAD */}
            <div
              onClick={() => setMode("crop_pad")}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "crop_pad"
                  ? isLight
                    ? "bg-purple-50 border-purple-500/80 ring-2 ring-purple-500/20"
                    : "bg-purple-500/10 border-purple-500/50 ring-2 ring-purple-500/20"
                  : isLight
                  ? "bg-white border-slate-300/80 hover:bg-slate-50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-9 h-11 rounded-lg border-2 border-dotted flex items-center justify-center shrink-0 ${
                  mode === "crop_pad"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-zinc-500/40 text-zinc-400"
                }`}
              >
                <Crop size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Crop & Pad (1:1 Skala Asli)</span>
                  {mode === "crop_pad" && <CheckCircle2 size={14} className="text-purple-400 shrink-0" />}
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-tight ${
                    isLight ? "text-slate-600" : "text-zinc-400"
                  }`}
                >
                  Tanpa penskalaan. Dipotong jika target lebih kecil, atau ditambah padding jika lebih besar.
                </p>
              </div>
            </div>

            {/* Mode: TILE / SPLIT (POSTER GRID) */}
            <div
              onClick={() => setMode("tile_split")}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "tile_split"
                  ? isLight
                    ? "bg-rose-50 border-rose-500/80 ring-2 ring-rose-500/20"
                    : "bg-rose-500/10 border-rose-500/50 ring-2 ring-rose-500/20"
                  : isLight
                  ? "bg-white border-slate-300/80 hover:bg-slate-50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-9 h-11 rounded-lg border-2 border-dashed flex flex-col items-center justify-center shrink-0 gap-0.5 ${
                  mode === "tile_split"
                    ? "border-rose-500 bg-rose-500/20 text-rose-400"
                    : "border-zinc-500/40 text-zinc-400"
                }`}
              >
                <Grid size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    Tile / Split (Poster)
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-500 font-bold">
                      A2→4×A4
                    </span>
                  </span>
                  {mode === "tile_split" && <CheckCircle2 size={14} className="text-rose-400 shrink-0" />}
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-tight ${
                    isLight ? "text-slate-600" : "text-zinc-400"
                  }`}
                >
                  Pecah halaman besar menjadi potongan grid terpisah (poster tile) seukuran target.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-options for Tile / Split */}
          {mode === "tile_split" && (
            <div
              className={`p-3 rounded-2xl border space-y-3 mt-2 ${
                isLight ? "bg-rose-50/50 border-rose-200" : "bg-rose-950/20 border-rose-500/20"
              }`}
            >
              {/* Output format option */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold opacity-80 block">Opsi Output Tile</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTileOutputMode("single_pdf")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                      tileOutputMode === "single_pdf"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : isLight
                        ? "bg-white border-slate-300 text-slate-700"
                        : "bg-zinc-900 border-white/10 text-zinc-300"
                    }`}
                  >
                    1 File Multi-Hal
                  </button>
                  <button
                    type="button"
                    onClick={() => setTileOutputMode("separate_files")}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                      tileOutputMode === "separate_files"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : isLight
                        ? "bg-white border-slate-300 text-slate-700"
                        : "bg-zinc-900 border-white/10 text-zinc-300"
                    }`}
                  >
                    Pisah per Tile
                  </button>
                </div>
              </div>

              {/* Overlap / Bleed option */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold opacity-80 flex items-center gap-1">
                    <Scissors size={12} className="text-rose-400" />
                    <span>Overlap / Bleed Margin</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold">{overlapMm} mm</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[0, 5, 10].map((mm) => (
                    <button
                      key={mm}
                      type="button"
                      onClick={() => setOverlapMm(mm)}
                      className={`py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        overlapMm === mm
                          ? "bg-rose-600 text-white border-rose-600"
                          : isLight
                          ? "bg-white border-slate-300 text-slate-700"
                          : "bg-zinc-900 border-white/10 text-zinc-300"
                      }`}
                    >
                      {mm === 0 ? "Tanpa Overlap" : `${mm} mm`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Print Margin (Safe Area) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Printer size={14} className="text-emerald-400" />
              <span>Margin Cetak (Safe Area)</span>
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {targetMarginMm} mm
            </span>
          </div>

          <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Ruang tepi aman agar konten tidak terpotong oleh batas margin fisik printer. Ukuran kertas target tetap akurat.
          </p>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { mm: 0, label: "0 mm", desc: "Borderless" },
              { mm: 3, label: "3 mm", desc: "Minimal" },
              { mm: 5, label: "5 mm", desc: "Standar" },
              { mm: 10, label: "10 mm", desc: "Lebar" },
            ].map((opt) => (
              <button
                key={opt.mm}
                type="button"
                onClick={() => setTargetMarginMm(opt.mm)}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  targetMarginMm === opt.mm
                    ? isLight
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                      : "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : isLight
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <div className="text-[11px] font-bold">{opt.label}</div>
                <div className="text-[9px] opacity-70 leading-tight">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={targetMarginMm}
              onChange={(e) => setTargetMarginMm(Number(e.target.value))}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min="0"
                max="50"
                value={targetMarginMm}
                onChange={(e) => setTargetMarginMm(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                className={`w-13 px-1.5 py-1 rounded-lg border text-xs font-mono text-center outline-none ${
                  isLight
                    ? "bg-white border-slate-300 text-slate-900 focus:border-emerald-500"
                    : "bg-zinc-900 border-white/15 text-white focus:border-emerald-500"
                }`}
              />
              <span className="text-xs font-mono opacity-60">mm</span>
            </div>
          </div>
        </div>

        {/* Section 5: Page Scope Selection */}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-80">
            <Layers size={14} className="text-amber-400" />
            <span>Halaman yang Diterapkan</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPageScope("all")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                pageScope === "all"
                  ? isLight
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-amber-600 text-white border-amber-500"
                  : isLight
                  ? "bg-white border-slate-300 text-slate-700"
                  : "bg-white/5 border-white/10 text-zinc-300"
              }`}
            >
              Semua ({totalPages} Hal)
            </button>
            <button
              type="button"
              onClick={() => setPageScope("range")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                pageScope === "range"
                  ? isLight
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-amber-600 text-white border-amber-500"
                  : isLight
                  ? "bg-white border-slate-300 text-slate-700"
                  : "bg-white/5 border-white/10 text-zinc-300"
              }`}
            >
              Pilih Rentang
            </button>
          </div>

          {pageScope === "range" && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Mis. 1-3, 5, 7"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium outline-hidden transition-all ${
                  isLight
                    ? "bg-white border-slate-300 focus:border-amber-500 text-slate-800"
                    : "bg-zinc-900 border-white/10 focus:border-amber-500 text-zinc-100"
                }`}
              />
              <span
                className={`text-[10px] block mt-1 ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                Gunakan koma untuk pisah halaman dan tanda hubung untuk rentang.
              </span>
            </div>
          )}
        </div>

        {/* Convert Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onConvert}
            disabled={!hasFile || isConverting}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              !hasFile || isConverting
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-indigo-600/25"
            }`}
          >
            <Sparkles size={16} />
            <span>{isConverting ? "Mengonversi Ukuran..." : "Konversi Ukuran Kertas"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
