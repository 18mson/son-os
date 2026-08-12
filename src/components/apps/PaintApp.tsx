"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, Download, Undo2 } from "lucide-react";

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

      // Set default dark canvas background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      // Save initial canvas state
      const initialData = ctx.getImageData(0, 0, width, height);
      setHistory([initialData]);
    }
  }, []);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentData]); // Keep last 15 states
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#09090b" : color;
    ctx.lineWidth = brushSize;

    setIsDrawing(true);
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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
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

    ctx.fillStyle = "#09090b";
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

    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
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
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none p-3 sm:p-4 gap-3">
      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
        {/* Tools & Size */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("brush")}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tool === "brush" ? "bg-blue-600 text-white shadow-md" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Kuas"
          >
            <Paintbrush size={16} /> Brush
          </button>

          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              tool === "eraser" ? "bg-amber-600 text-white shadow-md" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
            title="Penghapus"
          >
            <Eraser size={16} /> Eraser
          </button>

          {/* Brush Sizes */}
          <div className="h-5 w-px bg-white/15 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1">
            {BRUSH_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  brushSize === sz ? "bg-white/20 text-white ring-2 ring-blue-400" : "text-zinc-400 hover:bg-white/10"
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
                className={`w-6 h-6 rounded-full transition-transform border border-white/20 ${
                  color === c ? "scale-125 ring-2 ring-blue-400 ring-offset-2 ring-offset-zinc-950" : "hover:scale-110"
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-zinc-300 transition-colors"
            title="Urungkan (Undo)"
          >
            <Undo2 size={16} />
          </button>

          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-600/30 text-rose-400 hover:text-rose-200 transition-colors"
            title="Bersihkan Canvas"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            title="Unduh Gambar PNG"
          >
            <Download size={16} /> Unduh
          </button>
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 relative cursor-crosshair touch-none">
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
