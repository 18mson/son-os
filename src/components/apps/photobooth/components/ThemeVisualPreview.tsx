// src/components/apps/photobooth/components/ThemeVisualPreview.tsx
"use client";

import React from "react";
import {
  PhotoboothTheme,
  PhotoboothLayout,
} from "../themes/themes.config";

interface ThemeVisualPreviewProps {
  theme: PhotoboothTheme;
  layout?: PhotoboothLayout;
  shotCount?: number;
  compact?: boolean;
}

export const ThemeVisualPreview: React.FC<ThemeVisualPreviewProps> = ({
  theme,
  layout: propLayout,
  shotCount: propShotCount,
  compact = false,
}) => {
  const activeLayout = propLayout || theme.layout;
  const activeShotCount = propShotCount || theme.shotCount;

  // Placeholder photos background gradients to simulate realistic photobooth shots
  const sampleShotGradients = [
    "from-slate-700 via-indigo-900 to-zinc-800",
    "from-rose-900 via-purple-900 to-slate-800",
    "from-amber-900 via-orange-950 to-stone-800",
    "from-emerald-900 via-teal-950 to-zinc-900",
    "from-blue-900 via-cyan-950 to-slate-900",
    "from-fuchsia-900 via-pink-950 to-zinc-800",
  ];

  // Render Theme-Specific CSS/SVG Ornaments
  const renderOrnaments = () => {
    switch (theme.ornamentType) {
      case "sakura-blossom":
        return (
          <>
            {/* Top cherry blossom sprigs */}
            <span className="absolute top-1 left-2 text-xs">🌸</span>
            <span className="absolute top-1.5 left-6 text-[8px] text-pink-400">❀</span>
            <span className="absolute top-1 right-2 text-xs -scale-x-100">🌸</span>
            <span className="absolute top-2 right-6 text-[8px] text-rose-400">❀</span>
            
            {/* Floating falling petals */}
            <span className="absolute top-1/3 left-1 text-[8px] text-pink-400 rotate-45">🌸</span>
            <span className="absolute top-2/3 right-1 text-[9px] text-pink-500 -rotate-12">🌸</span>
            <span className="absolute bottom-6 left-2 text-xs">🌸</span>
            <span className="absolute bottom-6 right-2 text-xs -scale-x-100">🌸</span>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-rose-800 font-serif font-bold">
              桜
            </span>
          </>
        );

      case "pop-art":
        return (
          <>
            {/* Bold Comic Book Boom Star */}
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-red-600 text-yellow-300 font-black text-[8px] rotate-12 rounded border-2 border-black shadow-md uppercase tracking-tighter">
              BOOM!
            </span>
            {/* WOW Comic Speech Bubble */}
            <span className="absolute bottom-6 left-1 px-1.5 py-0.5 bg-blue-500 text-white font-black text-[7px] -rotate-6 rounded-full border border-black shadow">
              WOW!
            </span>
            <span className="absolute top-1 left-1.5 text-[9px] font-black text-amber-500">
              ⚡
            </span>
          </>
        );

      case "kawaii-doodles":
        return (
          <>
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px]">🎀</span>
            <span className="absolute top-1 left-1.5 text-[8px]">🐾</span>
            <span className="absolute top-1 right-1.5 text-[8px]">🐾</span>
            <span className="absolute bottom-5 left-2 text-[8px] text-rose-400">♡</span>
            <span className="absolute bottom-5 right-2 text-[8px] text-rose-400">♡</span>
          </>
        );

      case "y2k-cyber":
        return (
          <>
            <span className="absolute top-1 left-1.5 text-[10px] text-fuchsia-400 animate-pulse">★</span>
            <span className="absolute top-1 right-1.5 text-[10px] text-cyan-300">✦</span>
            <span className="absolute bottom-6 left-2 text-[9px] text-pink-400">♥</span>
            <span className="absolute bottom-6 right-2 text-[9px] text-purple-300">★</span>
          </>
        );

      case "party-confetti":
        return (
          <>
            <span className="absolute top-1 left-2 text-[8px]">🎉</span>
            <span className="absolute top-1 right-2 text-[8px]">✨</span>
            <span className="absolute top-1/2 left-0.5 text-[7px] text-amber-400">●</span>
            <span className="absolute top-1/3 right-1 text-[7px] text-emerald-400">▲</span>
            <span className="absolute bottom-6 right-2 text-[8px]">🎈</span>
          </>
        );

      case "film-roll":
        return (
          <>
            <div className="absolute top-1 bottom-6 left-0.5 w-1.5 flex flex-col justify-between items-center opacity-70">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1 h-1.5 bg-black rounded-[1px] border border-white/20" />
              ))}
            </div>
            <div className="absolute top-1 bottom-6 right-0.5 w-1.5 flex flex-col justify-between items-center opacity-70">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-1 h-1.5 bg-black rounded-[1px] border border-white/20" />
              ))}
            </div>
            <div className="absolute bottom-5 left-3 text-[6px] font-mono text-red-500 font-bold tracking-tighter">
              ► 35MM DX
            </div>
            <div className="absolute bottom-5 right-3 text-[6px] font-mono text-amber-500 font-bold">
              ISO 400
            </div>
          </>
        );

      case "newspaper":
        return (
          <>
            <div className="absolute top-1.5 left-2 right-2 border-b border-stone-400/50 pb-0.5 flex justify-between items-center text-[6px] font-serif text-stone-700">
              <span className="font-bold tracking-widest">GAZETTE</span>
              <span>EST. 2026</span>
            </div>
            <div className="absolute bottom-5 left-2 w-6 h-2 bg-stone-900 opacity-60 flex gap-px p-px">
              <div className="w-0.5 h-full bg-white" />
              <div className="w-px h-full bg-white" />
              <div className="w-0.5 h-full bg-white" />
            </div>
          </>
        );

      case "retro-tokyo":
        return (
          <>
            <span className="absolute top-1 left-2 text-[6px] font-mono text-cyan-400 font-bold">
              ■ REC
            </span>
            <span className="absolute top-1 right-2 text-[6px] font-mono text-pink-400 font-bold">
              1998
            </span>
          </>
        );

      case "botanical-love":
        return (
          <>
            <span className="absolute top-1 left-1.5 text-[8px] text-amber-500">🌿</span>
            <span className="absolute top-1 right-1.5 text-[8px] text-amber-500 -scale-x-100">🌿</span>
            <span className="absolute bottom-5 left-1.5 text-[8px] text-amber-500">🍃</span>
            <span className="absolute bottom-5 right-1.5 text-[8px] text-amber-500 -scale-x-100">🍃</span>
          </>
        );

      default:
        return null;
    }
  };

  // Pattern styling
  const getPatternStyle = () => {
    if (theme.patternType === "dots") {
      return {
        backgroundImage: `radial-gradient(circle, ${theme.secondaryColor || "rgba(255,255,255,0.15)"} 1px, transparent 1px)`,
        backgroundSize: "8px 8px",
      };
    }
    if (theme.patternType === "petals") {
      return {
        backgroundImage: `radial-gradient(ellipse at center, rgba(244,114,182,0.2) 1.5px, transparent 1.5px)`,
        backgroundSize: "14px 14px",
      };
    }
    if (theme.patternType === "halftone") {
      return {
        backgroundImage: `radial-gradient(circle, rgba(220,38,38,0.15) 1.5px, transparent 1.5px)`,
        backgroundSize: "6px 6px",
      };
    }
    if (theme.patternType === "grid") {
      return {
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: "10px 10px",
      };
    }
    if (theme.patternType === "stripes") {
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px)`,
      };
    }
    return {};
  };

  const isPolaroid = activeLayout === "single";
  const is2Col = activeLayout === "grid-2col";
  const is1Row = activeLayout === "strip-1row";

  let containerClasses = "relative rounded-xl overflow-hidden shadow-md flex flex-col justify-between transition-all duration-300 border border-black/10";

  if (compact) {
    if (isPolaroid) {
      containerClasses += " w-28 h-36 p-2";
    } else if (is2Col) {
      containerClasses += " w-28 h-36 p-2";
    } else if (is1Row) {
      containerClasses += " w-36 h-28 p-2";
    } else {
      containerClasses += " w-24 h-40 p-1.5";
    }
  } else {
    if (isPolaroid) {
      containerClasses += " w-44 sm:w-52 h-56 sm:h-64 p-3.5";
    } else if (is2Col) {
      containerClasses += " w-44 sm:w-52 h-56 sm:h-64 p-3";
    } else if (is1Row) {
      containerClasses += " w-56 sm:w-64 h-40 sm:h-44 p-3";
    } else {
      containerClasses += " w-36 sm:w-44 h-64 sm:h-76 p-2.5";
    }
  }

  const effectiveShots = Math.min(activeShotCount, isPolaroid ? 1 : is2Col ? 4 : is1Row ? 3 : 4);
  const isPopArt = theme.ornamentType === "pop-art";

  return (
    <div
      className={containerClasses}
      style={{
        backgroundColor: theme.frameColor,
        ...getPatternStyle(),
      }}
    >
      {renderOrnaments()}

      {/* Photo Slots Area */}
      <div className={`flex-1 min-h-0 flex items-center justify-center ${theme.ornamentType === "newspaper" ? "pt-2" : ""}`}>
        {isPolaroid ? (
          <div className={`w-full aspect-square rounded-lg bg-linear-to-br from-zinc-700 via-indigo-900 to-zinc-900 ${isPopArt ? "border-2 border-black" : "border border-black/20"} shadow-inner flex items-center justify-center relative overflow-hidden`}>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              📷
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ) : is2Col ? (
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5 w-full h-full p-0.5">
            {Array.from({ length: effectiveShots }).map((_, i) => (
              <div
                key={i}
                className={`rounded-md bg-linear-to-br ${sampleShotGradients[i % sampleShotGradients.length]} ${isPopArt ? "border-2 border-black" : "border border-black/15"} shadow-inner flex items-center justify-center relative overflow-hidden aspect-4/3`}
              >
                <span className="text-[7px] text-white/50 font-mono font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        ) : is1Row ? (
          <div className="flex gap-1 sm:gap-1.5 w-full h-full items-center justify-center p-0.5">
            {Array.from({ length: effectiveShots }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-full rounded-md bg-linear-to-br ${sampleShotGradients[i % sampleShotGradients.length]} ${isPopArt ? "border-2 border-black" : "border border-black/15"} shadow-inner flex items-center justify-center relative overflow-hidden aspect-3/4`}
              >
                <span className="text-[7px] text-white/50 font-mono font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:gap-1.5 w-full h-full justify-between p-0.5">
            {Array.from({ length: effectiveShots }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 w-full rounded-md bg-linear-to-br ${sampleShotGradients[i % sampleShotGradients.length]} ${isPopArt ? "border-2 border-black" : "border border-black/15"} shadow-inner flex items-center justify-center relative overflow-hidden`}
              >
                <span className="text-[7px] text-white/50 font-mono font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frame Footer Caption & Date */}
      <div className="pt-1.5 shrink-0 text-center select-none overflow-hidden">
        <p
          className={`text-[7px] sm:text-[8px] font-bold truncate leading-tight tracking-wider ${isPopArt ? "uppercase font-black" : ""}`}
          style={{ color: theme.textColor }}
        >
          {theme.subtext || theme.name.toUpperCase()}
        </p>
        <p
          className="text-[5px] sm:text-[6px] font-mono opacity-60 truncate mt-0.5"
          style={{ color: theme.textColor }}
        >
          SON-OS • 2026
        </p>
      </div>
    </div>
  );
};
