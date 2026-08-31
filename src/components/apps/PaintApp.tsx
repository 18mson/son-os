"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, Download, Undo2 } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

const COLORS = [
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#000000",
];

const BRUSH_SIZES = [2, 5, 10, 20, 30];

export const PaintApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState<string>("#3b82f6");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Setup Canvas Dimensions on Mount and Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high resolution canvas dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      // Set canvas background
      ctx.fillStyle = isLight ? "#ffffff" : "#09090b";
      ctx.fillRect(0, 0, width, height);

      // Save initial canvas state
      const initialData = ctx.getImageData(0, 0, width, height);
      setHistory([initialData]);
    }
  }, [isLight]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), state]); // Keep last 15 states
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    if (tool === "eraser") {
      ctx.strokeStyle = isLight ? "#ffffff" : "#09090b";
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = isLight ? "#ffffff" : "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `son-os-artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={`flex flex-col h-full select-none p-3 sm:p-4 gap-3 font-sans transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Toolbar Controls */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3 shrink-0 ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        {/* Tools & Size */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("brush")}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === "brush"
                ? "bg-blue-600 text-white shadow-md"
                : isLight
                ? "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Kuas"
          >
            <Paintbrush size={16} /> Brush
          </button>

          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              tool === "eraser"
                ? "bg-amber-600 text-white shadow-md"
                : isLight
                ? "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Penghapus"
          >
            <Eraser size={16} /> Eraser
          </button>

          {/* Brush Sizes */}
          <div className={`h-5 w-px mx-1 hidden sm:block ${isLight ? "bg-slate-300" : "bg-white/15"}`} />

          <div className="flex items-center gap-1">
            {BRUSH_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  brushSize === sz
                    ? isLight
                      ? "bg-slate-200 text-slate-900 ring-2 ring-blue-500"
                      : "bg-white/20 text-white ring-2 ring-blue-400"
                    : isLight
                    ? "text-slate-500 hover:bg-slate-200"
                    : "text-zinc-400 hover:bg-white/10"
                }`}
                title={`Ukuran ${sz}px`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: Math.min(sz, 14), height: Math.min(sz, 14) }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        {tool === "brush" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform border cursor-pointer ${
                  isLight ? "border-slate-300" : "border-white/20"
                } ${
                  color === c
                    ? "scale-125 ring-2 ring-blue-500 ring-offset-2 " + (isLight ? "ring-offset-slate-100" : "ring-offset-zinc-950")
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden"
              title="Pilih Warna Kustom"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className={`p-2 rounded-xl disabled:opacity-40 transition-colors cursor-pointer ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                : "bg-white/5 hover:bg-white/10 text-zinc-300"
            }`}
            title="Urungkan (Undo)"
          >
            <Undo2 size={16} />
          </button>

          <button
            onClick={handleClear}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? "bg-white hover:bg-rose-100 text-rose-600 border border-rose-200"
                : "bg-white/5 hover:bg-rose-600/30 text-rose-400 hover:text-rose-200"
            }`}
            title="Bersihkan Canvas"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Unduh Gambar PNG"
          >
            <Download size={16} /> Unduh
          </button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div ref={containerRef} className={`flex-1 w-full h-full rounded-2xl overflow-hidden border relative cursor-crosshair touch-none shadow-sm ${
        isLight ? "bg-white border-slate-300" : "bg-zinc-950 border-white/10"
      }`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block touch-none"
        />
      </div>
    </div>
  );
};
