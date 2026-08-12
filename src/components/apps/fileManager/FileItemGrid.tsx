import React from "react";
import { Folder, File, Check, Download, Edit2, Trash2, Image as ImageIcon, Music, Film, FileText } from "lucide-react";
import { VirtualItem } from "./fileManagerStorage";

interface FileItemGridProps {
  items: VirtualItem[];
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  handleItemDoubleClick: (item: VirtualItem) => void;
  renamingId: string | null;
  renamingName: string;
  setRenamingId: (id: string | null) => void;
  setRenamingName: (name: string) => void;
  handleRenameSubmit: (item: VirtualItem) => void;
  handleDownloadFile: (item: VirtualItem) => void;
  handleDeleteItem: (id: string) => void;
  isLight: boolean;
}

export const FileItemGrid: React.FC<FileItemGridProps> = ({
  items,
  selectedItemId,
  setSelectedItemId,
  handleItemDoubleClick,
  renamingId,
  renamingName,
  setRenamingId,
  setRenamingName,
  handleRenameSubmit,
  handleDownloadFile,
  handleDeleteItem,
  isLight,
}) => {
  const getItemIcon = (item: VirtualItem) => {
    if (item.isFolder) return <Folder className="text-amber-400 fill-amber-400/20" size={24} />;
    const ext = item.name.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "")) return <ImageIcon className="text-emerald-400" size={22} />;
    if (["mp3", "wav", "ogg", "aac"].includes(ext || "")) return <Music className="text-purple-400" size={22} />;
    if (["mp4", "webm", "mkv"].includes(ext || "")) return <Film className="text-rose-400" size={22} />;
    if (ext === "pdf") return <FileText className="text-red-500" size={22} />;
    return <File className="text-blue-400" size={22} />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => setSelectedItemId(item.id)}
          onDoubleClick={() => handleItemDoubleClick(item)}
          className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-32 ${
            selectedItemId === item.id
              ? "bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30"
              : isLight
              ? "bg-white border-slate-200/90 hover:bg-slate-100"
              : "bg-zinc-900/60 border-white/10 hover:bg-white/5"
          }`}
        >
          <div className="pt-2 pb-1">{getItemIcon(item)}</div>

          {renamingId === item.id ? (
            <div className="flex items-center gap-1 w-full mt-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit(item)}
                className={`w-full px-1.5 py-0.5 rounded text-[11px] border outline-hidden ${
                  isLight ? "bg-white border-blue-500 text-slate-900" : "bg-zinc-950 border-blue-500 text-white"
                }`}
              />
              <button onClick={() => handleRenameSubmit(item)} className="text-emerald-500 p-0.5 cursor-pointer">
                <Check size={12} />
              </button>
            </div>
          ) : (
            <div className="w-full space-y-0.5">
              <p className={`text-xs font-medium truncate px-1 ${isLight ? "text-slate-900" : "text-zinc-100"}`}>
                {item.name}
              </p>
              {!item.isFolder && (
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
                  {formatFileSize(item.size)}
                </p>
              )}
            </div>
          )}

          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {!item.isFolder && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(item);
                }}
                className="p-1 rounded-lg bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                title="Unduh File"
              >
                <Download size={11} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingId(item.id);
                setRenamingName(item.name);
              }}
              className="p-1 rounded-lg bg-black/40 text-white hover:bg-black/60 cursor-pointer"
              title="Ganti Nama"
            >
              <Edit2 size={11} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item.id);
              }}
              className="p-1 rounded-lg bg-rose-500/80 text-white hover:bg-rose-600 cursor-pointer"
              title="Hapus"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
