import React from "react";
import { Sliders } from "lucide-react";

export type TargetFormat = "mp3" | "wav" | "ogg" | "aac";
export type BitrateOption = "128k" | "192k" | "256k" | "320k";

interface ConverterOptionsGridProps {
  isLight: boolean;
  targetFormat: TargetFormat;
  setTargetFormat: (fmt: TargetFormat) => void;
  bitrate: BitrateOption;
  setBitrate: (b: BitrateOption) => void;
}

export const ConverterOptionsGrid: React.FC<ConverterOptionsGridProps> = ({
  isLight,
  targetFormat,
  setTargetFormat,
  bitrate,
  setBitrate,
}) => {
  const formats: { id: TargetFormat; label: string; desc: string }[] = [
    { id: "mp3", label: "MP3", desc: "Standar audio paling populer" },
    { id: "wav", label: "WAV", desc: "Uncompressed audio kualitas tinggi" },
    { id: "ogg", label: "OGG Vorbis", desc: "Format open-source serbaguna" },
    { id: "aac", label: "AAC / M4A", desc: "Kompresi modern efisiensi tinggi" },
  ];

  const bitrates: BitrateOption[] = ["128k", "192k", "256k", "320k"];

  return (
    <div
      className={`p-4 rounded-2xl border space-y-3 ${
        isLight ? "bg-white border-slate-300 shadow-xs" : "bg-zinc-900/80 border-white/12"
      }`}
    >
      <div className="flex items-center gap-2">
        <Sliders size={16} className="text-purple-400" />
        <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Format Output &amp; Kualitas</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => setTargetFormat(f.id)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              targetFormat === f.id
                ? "bg-purple-600 border-purple-500 text-white shadow-md"
                : isLight
                ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
                : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            <p className="text-xs font-bold">{f.label}</p>
            <p className="text-[10px] opacity-75 truncate">{f.desc}</p>
          </button>
        ))}
      </div>

      {targetFormat !== "wav" && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-zinc-300"}`}>Bitrate Audio:</span>
          <div className="flex items-center gap-1.5">
            {bitrates.map((b) => (
              <button
                key={b}
                onClick={() => setBitrate(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  bitrate === b
                    ? "bg-purple-600 text-white font-bold"
                    : isLight
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-white/10 text-zinc-400 hover:bg-white/20"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
