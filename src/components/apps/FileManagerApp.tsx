"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Folder,
  File,
  ChevronRight,
  FolderPlus,
  Upload,
  Trash2,
  Edit2,
  Download,
  Home,
  HardDrive,
  Check,
  X,
  FileText,
  Image as ImageIcon,
  Music,
  Film,
} from "lucide-react";

export interface VirtualItem {
  id: string;
  parentId: string | null;
  name: string;
  isFolder: boolean;
  size?: number;
  type?: string;
  blob?: Blob;
  createdAt: number;
}

const DB_NAME = "sonos_filemanager_db";
const DB_VERSION = 1;
const STORE_NAME = "virtual_fs";

const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("parentId", "parentId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/data/apps";

export const FileManagerApp: React.FC = () => {
  const openWindow = useWindowStore((s) => s.openWindow);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Home" },
  ]);
  const [items, setItems] = useState<VirtualItem[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleItemDoubleClick = (item: VirtualItem) => {
    if (item.isFolder) {
      handleOpenFolder(item);
    } else {
      const ext = item.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || item.type?.includes("pdf")) {
        const pdfApp = APPS.find((a) => a.id === "pdf");
        if (pdfApp) openWindow(pdfApp);
      } else if (["mp3", "wav", "ogg", "aac"].includes(ext || "") || item.type?.startsWith("audio/")) {
        const audioApp = APPS.find((a) => a.id === "audio-converter") || APPS.find((a) => a.id === "music");
        if (audioApp) openWindow(audioApp);
      } else if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "") || item.type?.startsWith("image/")) {
        const galleryApp = APPS.find((a) => a.id === "gallery");
        if (galleryApp) openWindow(galleryApp);
      } else if (["txt", "md", "json", "js", "ts"].includes(ext || "") || item.type?.startsWith("text/")) {
        const notesApp = APPS.find((a) => a.id === "notes");
        if (notesApp) openWindow(notesApp);
      } else {
        handleDownloadFile(item);
      }
    }
  };

  // Fetch items for current directory
  const loadItems = useCallback(async (parentId: string | null) => {
    try {
      const db = await initIndexedDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("parentId");

      const request = index.getAll(parentId);
      request.onsuccess = () => {
        const loaded: VirtualItem[] = request.result || [];

        // Populate initial default folders if root is completely empty
        if (parentId === null && loaded.length === 0) {
          const defaultFolders: VirtualItem[] = [
            { id: "dir-docs", parentId: null, name: "Dokumen", isFolder: true, createdAt: Date.now() },
            { id: "dir-[pics]", parentId: null, name: "Gambar", isFolder: true, createdAt: Date.now() },
            { id: "dir-downloads", parentId: null, name: "Unduhan", isFolder: true, createdAt: Date.now() },
          ];

          const writeTx = db.transaction(STORE_NAME, "readwrite");
          const writeStore = writeTx.objectStore(STORE_NAME);
          defaultFolders.forEach((f) => writeStore.put(f));
          writeTx.oncomplete = () => {
            setItems(defaultFolders);
          };
        } else {
          setItems(loaded);
        }
      };
    } catch (err) {
      console.error("IndexedDB error:", err);
    }
  }, []);

  useEffect(() => {
    loadItems(currentParentId);
  }, [currentParentId, loadItems]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newItem: VirtualItem = {
      id: `folder-${Date.now()}`,
      parentId: currentParentId,
      name: newFolderName.trim(),
      isFolder: true,
      createdAt: Date.now(),
    };

    try {
      const db = await initIndexedDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(newItem);
      tx.oncomplete = () => {
        setNewFolderName("");
        setIsCreatingFolder(false);
        loadItems(currentParentId);
      };
    } catch (err) {
      console.error("Create folder error:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const db = await initIndexedDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      Array.from(files).forEach((file) => {
        const newItem: VirtualItem = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          parentId: currentParentId,
          name: file.name,
          isFolder: false,
          size: file.size,
          type: file.type,
          blob: file,
          createdAt: Date.now(),
        };
        store.put(newItem);
      });

      tx.oncomplete = () => {
        loadItems(currentParentId);
      };
    } catch (err) {
      console.error("File upload error:", err);
    }
  };

  const handleRename = async (id: string) => {
    if (!renamingName.trim()) return;
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const updated = { ...target, name: renamingName.trim() };

    try {
      const db = await initIndexedDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(updated);
      tx.oncomplete = () => {
        setRenamingId(null);
        setRenamingName("");
        loadItems(currentParentId);
      };
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleDelete = async (item: VirtualItem) => {
    try {
      const db = await initIndexedDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(item.id);

      tx.oncomplete = () => {
        loadItems(currentParentId);
        if (selectedItemId === item.id) setSelectedItemId(null);
      };
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleOpenFolder = (item: VirtualItem) => {
    if (!item.isFolder) return;
    setCurrentParentId(item.id);
    setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    setSelectedItemId(null);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentParentId(target.id);
    setSelectedItemId(null);
  };

  const handleDownloadFile = (item: VirtualItem) => {
    if (!item.blob) return;
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (item: VirtualItem) => {
    if (item.isFolder) return <Folder className="text-amber-400 fill-amber-400/20" size={20} />;
    if (item.type?.startsWith("image/")) return <ImageIcon className="text-emerald-400" size={20} />;
    if (item.type?.startsWith("audio/")) return <Music className="text-purple-400" size={20} />;
    if (item.type?.startsWith("video/")) return <Film className="text-blue-400" size={20} />;
    if (item.type?.includes("pdf")) return <FileText className="text-rose-400" size={20} />;
    return <File className="text-zinc-400" size={20} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="px-5 py-3 border-b border-white/10 bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-linear-to-br from-amber-500 to-yellow-600 text-white shadow-md">
            <HardDrive size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Son-OS File Manager</h1>
            <p className="text-[10px] text-zinc-400">IndexedDB Virtual File System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <FolderPlus size={14} className="text-amber-400" /> Buat Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
          >
            <Upload size={14} /> Upload File
          </button>
        </div>
      </div>

      {/* Breadcrumbs Bar */}
      <div className="px-5 py-2 border-b border-white/5 bg-zinc-900/40 flex items-center gap-1 text-xs overflow-x-auto no-scrollbar shrink-0">
        <Home size={14} className="text-zinc-400 shrink-0" />
        {breadcrumbs.map((b, idx) => (
          <React.Fragment key={b.id || "root"}>
            <ChevronRight size={12} className="text-zinc-600 shrink-0" />
            <button
              onClick={() => handleNavigateBreadcrumb(idx)}
              className={`px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer font-medium whitespace-nowrap ${
                idx === breadcrumbs.length - 1 ? "text-amber-400 font-semibold" : "text-zinc-300"
              }`}
            >
              {b.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Inline Form to Create Folder */}
      {isCreatingFolder && (
        <form onSubmit={handleCreateFolder} className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 shrink-0">
          <FolderPlus size={16} className="text-amber-400" />
          <input
            type="text"
            placeholder="Nama folder baru..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
            className="flex-1 px-3 py-1 text-xs rounded-lg bg-zinc-900 border border-amber-500/30 text-white outline-hidden"
          />
          <button type="submit" className="p-1 text-emerald-400 hover:bg-white/10 rounded-md cursor-pointer">
            <Check size={16} />
          </button>
          <button type="button" onClick={() => setIsCreatingFolder(false)} className="p-1 text-rose-400 hover:bg-white/10 rounded-md cursor-pointer">
            <X size={16} />
          </button>
        </form>
      )}

      {/* Main File Items Grid */}
      <div className="flex-1 p-5 overflow-y-auto max-h-full no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 gap-3">
            <Folder size={44} className="text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-400">Folder ini kosong</p>
            <p className="text-xs text-zinc-600">Buat folder baru atau upload file untuk mengisi lokasi ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isRenaming = renamingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 shadow-lg shadow-amber-500/10"
                      : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {getFileIcon(item)}

                    {/* Action buttons on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingId(item.id);
                          setRenamingName(item.name);
                        }}
                        title="Rename"
                        className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white"
                      >
                        <Edit2 size={12} />
                      </button>

                      {!item.isFolder && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(item);
                          }}
                          title="Download"
                          className="p-1 rounded-md hover:bg-white/10 text-emerald-400"
                        >
                          <Download size={12} />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                        title="Delete"
                        className="p-1 rounded-md hover:bg-rose-500/20 text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    {isRenaming ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={renamingName}
                          onChange={(e) => setRenamingName(e.target.value)}
                          className="w-full px-1.5 py-0.5 text-xs bg-black rounded-md border border-amber-400 text-white outline-hidden"
                          autoFocus
                        />
                        <button onClick={() => handleRename(item.id)} className="text-emerald-400">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xs font-semibold text-white tracking-wide truncate">{item.name}</h2>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">
                          {item.isFolder ? "Folder" : formatFileSize(item.size)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
