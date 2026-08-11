"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "./AppIcon";

export const Launcher: React.FC = () => {
  const { launcherOpen, closeLauncher, openWindow } = useWindowStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = APPS.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {launcherOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => closeLauncher()}
          className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-2xl flex flex-col items-center pt-16 sm:pt-24 px-4 pb-28 overflow-y-auto select-none"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.08 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex flex-col items-center gap-8"
          >
            {/* Search Bar */}
            <div className="w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search apps, projects..."
                aria-label="Search apps and projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 text-white placeholder-zinc-400 border border-white/15 outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all shadow-xl backdrop-blur-md text-base"
              />
            </div>

            {/* Apps Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app);
                    setSearchQuery("");
                  }}
                  aria-label={`Open ${app.title}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 min-h-[110px]"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <AppIcon name={app.icon} size={28} />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-white block">
                      {app.title}
                    </span>
                    {app.description && (
                      <span className="text-[11px] text-zinc-400 line-clamp-1 block mt-0.5">
                        {app.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {filteredApps.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-400 text-sm">
                  No apps found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
