// src/components/apps/camera/CameraDebugPanel.tsx
"use client";

import React from "react";
import { CameraDiagnostics } from "@/hooks/useCameraStream";
import { X, CheckCircle, AlertTriangle, Cpu, Eye, ShieldCheck, Zap } from "lucide-react";

interface CameraDebugPanelProps {
  diagnostics: CameraDiagnostics | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CameraDebugPanel: React.FC<CameraDebugPanelProps> = ({
  diagnostics,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !diagnostics) return null;

  const {
    deviceProfile,
    activeSettings,
    capabilities,
    trackLabel,
    streamResolution,
    actualFps,
    availableCameras,
    errorLog,
  } = diagnostics;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 overflow-y-auto font-mono text-xs text-zinc-200 select-text flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="text-purple-400" size={16} />
          <span className="font-bold text-white tracking-wide">Camera Hardware Diagnostics</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Device Profile Card */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Active Device Profile
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <span className="text-zinc-400">Profile ID:</span>
            <span className="text-white font-medium">{deviceProfile.id}</span>
            <span className="text-zinc-400">Target Model:</span>
            <span className="text-emerald-400 font-semibold">{deviceProfile.modelName}</span>
            <span className="text-zinc-400">Chipset Tier:</span>
            <span className="text-amber-400 capitalize">{deviceProfile.chipsetTier}</span>
            <span className="text-zinc-400">Hardware OIS:</span>
            <span className={deviceProfile.hasOIS ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {deviceProfile.hasOIS ? "AVAILABLE" : "NONE (Software EIS Active)"}
            </span>
            <span className="text-zinc-400">Display Panel:</span>
            <span className="text-white uppercase">{deviceProfile.displayType}</span>
          </div>
        </div>

        {/* Active Stream Settings */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
            <Eye size={14} /> Real-time Stream Info
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <span className="text-zinc-400">Camera Track:</span>
            <span className="text-white truncate" title={trackLabel}>
              {trackLabel}
            </span>
            <span className="text-zinc-400">Active Resolution:</span>
            <span className="text-emerald-400 font-semibold">
              {streamResolution.width} x {streamResolution.height}
            </span>
            <span className="text-zinc-400">Framerate:</span>
            <span className="text-amber-400 font-semibold">{actualFps ? `${actualFps} fps` : "N/A"}</span>
            <span className="text-zinc-400">Facing Mode:</span>
            <span className="text-white">{activeSettings?.facingMode || "N/A"}</span>
            <span className="text-zinc-400">Aspect Ratio:</span>
            <span className="text-white">
              {activeSettings?.aspectRatio ? activeSettings.aspectRatio.toFixed(2) : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Raw Browser getCapabilities() */}
      <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-pink-300 flex items-center gap-1.5">
          <Zap size={14} /> MediaStreamTrack.getCapabilities()
        </div>
        {capabilities ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">Exposure Mode:</span>
              <span className="text-white">
                {"exposureMode" in capabilities
                  ? JSON.stringify((capabilities as { exposureMode?: unknown }).exposureMode)
                  : "Not exposed"}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">Exposure Comp:</span>
              <span className="text-white">
                {"exposureCompensation" in capabilities
                  ? JSON.stringify((capabilities as { exposureCompensation?: unknown }).exposureCompensation)
                  : "Not exposed"}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">Focus Mode:</span>
              <span className="text-white">
                {"focusMode" in capabilities
                  ? JSON.stringify((capabilities as { focusMode?: unknown }).focusMode)
                  : "Not exposed"}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">Torch / Flash:</span>
              <span className="text-white">
                {"torch" in capabilities ? "Supported" : "Not supported"}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">Zoom Capabilities:</span>
              <span className="text-white">
                {"zoom" in capabilities
                  ? JSON.stringify((capabilities as { zoom?: unknown }).zoom)
                  : "Not exposed"}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-zinc-400 block">White Balance:</span>
              <span className="text-white">
                {"whiteBalanceMode" in capabilities
                  ? JSON.stringify((capabilities as { whiteBalanceMode?: unknown }).whiteBalanceMode)
                  : "Not exposed"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-amber-400 text-[11px] flex items-center gap-1.5">
            <AlertTriangle size={14} /> Browser tidak mengekspos getCapabilities() untuk track ini.
          </div>
        )}
      </div>

      {/* Hardware Cameras Enumerate */}
      <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-zinc-300">
          Detected Hardware Video Inputs ({availableCameras.length})
        </div>
        <div className="flex flex-col gap-1 text-[10px]">
          {availableCameras.map((cam, idx) => (
            <div key={cam.deviceId || idx} className="p-1.5 rounded bg-black/40 flex items-center gap-2">
              <CheckCircle size={12} className="text-emerald-400 shrink-0" />
              <span className="text-white truncate">{cam.label || `Camera ${idx + 1}`}</span>
              <span className="text-zinc-500 ml-auto text-[9px]">{cam.deviceId.slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error / Fallback Logs */}
      {errorLog.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold text-rose-300">Ladder Fallback Warning Logs</div>
          {errorLog.map((log, i) => (
            <div key={i} className="text-[10px] text-rose-200/80">
              • {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
