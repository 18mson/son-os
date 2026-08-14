// src/components/apps/photobooth/components/CountdownOverlay.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownOverlayProps {
  countdown: number;
  isCapturing: boolean;
  shotIndex: number;
  totalShots: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  countdown,
  isCapturing,
  shotIndex,
  totalShots,
}) => {
  return (
    <>
      {/* Screen White Flash Effect upon Capture */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 z-40 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Countdown Timer Display */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
        {countdown > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={countdown}
              initial={{ scale: 0.4, opacity: 0, y: 20 }}
              animate={{ scale: 1.2, opacity: 1, y: 0 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-7xl sm:text-9xl font-black text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] font-mono tracking-tighter">
                {countdown}
              </span>
              <span className="text-xs sm:text-sm font-bold text-purple-300 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full backdrop-blur-md mt-2 border border-purple-500/30">
                Bersiaplah...
              </span>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-4xl sm:text-6xl font-black text-pink-400 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] tracking-tight">
              SMILE! 📸
            </span>
          </motion.div>
        )}

        {/* Current Shot Badge Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>
            Foto {shotIndex + 1} dari {totalShots}
          </span>
        </div>
      </div>
    </>
  );
};
