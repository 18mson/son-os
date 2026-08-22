"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, CheckCircle2, Bell, Pin, Volume2, VolumeX, Palette, Trash } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useTranslation } from "@/i18n";

export const SystemNotificationToast: React.FC = () => {
  const { t } = useTranslation();
  const { notification, clearNotification } = useWindowStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "Monitor":
        return <Monitor size={18} className="text-blue-400" />;
      case "Image":
      case "Palette":
        return <Palette size={18} className="text-purple-400" />;
      case "Pin":
        return <Pin size={18} className="text-amber-400" />;
      case "Volume2":
        return <Volume2 size={18} className="text-emerald-400" />;
      case "VolumeX":
        return <VolumeX size={18} className="text-rose-400" />;
      case "Trash":
        return <Trash size={18} className="text-rose-400" />;
      case "CheckCircle2":
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      default:
        return <Bell size={18} className="text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.92 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.05 }}
          className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/95 border border-white/15 shadow-2xl backdrop-blur-xl max-w-xs sm:max-w-sm text-zinc-100 select-none pointer-events-auto shrink-0"
          data-notification-toast
        >
          {/* App / Category Badge Icon */}
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 shrink-0 mt-0.5">
            {renderIcon(notification.icon)}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                {notification.appName || "Son-OS System"}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                {t.notifications.now}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-0.5 truncate leading-snug">
              {notification.title}
            </h4>
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed line-clamp-2">
              {notification.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={clearNotification}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title={t.notifications.dismiss}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
