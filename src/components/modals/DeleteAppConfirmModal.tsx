"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useAppStoreStore } from "@/store/appStoreStore";
import { APPS } from "@/config/appsConfig";
import { AppIcon } from "../AppIcon";

export const DeleteAppConfirmModal: React.FC = () => {
  const { pendingUninstallAppId, setPendingUninstallAppId, confirmUninstallApp } = useAppStoreStore();

  if (!pendingUninstallAppId) return null;

  const targetApp = APPS.find((a) => a.id === pendingUninstallAppId);
  if (!targetApp) return null;

  return (
    <div
      className="fixed inset-0 z-90 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setPendingUninstallAppId(null)}
    >
      <div
        className="w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 select-none animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setPendingUninstallAppId(null)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Konfirmasi Hapus Aplikasi</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Tindakan ini memerlukan verifikasi pengguna.</p>
          </div>
        </div>

        {/* App Info Box */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg ${
              targetApp.accentColor || "bg-blue-600"
            }`}
          >
            <AppIcon name={targetApp.icon} size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">{targetApp.title}</h4>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 text-[10px] font-semibold">
                {targetApp.version || "v1.0.0"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{targetApp.description || "Aplikasi Desktop Son-OS"}</p>
          </div>
        </div>

        {/* Warning Text */}
        <p className="text-xs text-zinc-300 leading-relaxed bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          Apakah Anda yakin ingin menghapus <strong className="text-white">{targetApp.title}</strong>? Aplikasi akan di-uninstall, jendela aktif akan ditutup, serta pin di Shelf dan shortcut di Desktop akan dibersihkan secara otomatis.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setPendingUninstallAppId(null)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={confirmUninstallApp}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Hapus Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};
