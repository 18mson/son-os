"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "@/store/windowStore";

export const BootScreen: React.FC = () => {
  const { booted, setBooted } = useWindowStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooted(true);
    }, 1400);

    return () => clearTimeout(timer);
  }, [setBooted]);

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-9999 bg-zinc-950 flex flex-col items-center justify-center select-none"
        >
          <div className="flex flex-col items-center gap-6">
            {/* ChromeOS / Son-OS Glowing Rings Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-20 h-20 rounded-3xl bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
                <div className="w-9 h-9 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center space-y-1"
            >
              <h1 className="text-xl font-bold text-white tracking-wide">Son-OS</h1>
              <p className="text-xs text-zinc-400 tracking-wider uppercase font-mono">ChromeOS Desktop Portfolio</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
