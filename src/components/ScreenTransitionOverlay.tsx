"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenTransitionOverlayProps {
  isVisible: boolean;
  modeText?: string;
}

export const ScreenTransitionOverlay: React.FC<ScreenTransitionOverlayProps> = ({
  isVisible,
  modeText = "Beralih Mode...",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
          className="fixed inset-0 z-9980 bg-zinc-950 flex flex-col items-center justify-center select-none"
        >
          <div className="flex flex-col items-center gap-6">
            {/* ChromeOS / Son-OS Glowing Rings Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-20 h-20 rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
                <div className="w-9 h-9 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center space-y-1"
            >
              <h1 className="text-xl font-bold text-white tracking-wide">Son-OS</h1>
              <p className="text-xs text-zinc-400 tracking-wider uppercase font-mono">{modeText}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
