"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Folder,
  ChevronRight,
  FolderPlus,
  Upload,
  HardDrive,
  X,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/data/apps";
import {
  VirtualItem,
  fetchFolderItems,
  saveVirtualItem,
  deleteVirtualItem,
} from "./fileManager/fileManagerStorage";
import { FileItemGrid } from "./fileManager/FileItemGrid";
import { useTranslation, getAppTranslation } from "@/i18n";

export const FileManagerApp: React.FC = () => {
  const { t, language } = useTranslation();
  const { theme, openWindow } = useWindowStore();
  const isLight = theme === "light";

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

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchFolderItems(currentParentId);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [currentParentId]);

  useEffect(() => {
    let ignore = false;
    fetchFolderItems(currentParentId)
      .then((data) => {
        if (!ignore) setItems(data);
      })
      .catch(() => {
        if (!ignore) setItems([]);
      });
    return () => {
      ignore = true;
    };
  }, [currentParentId]);

  const handleOpenFolder = (folder: VirtualItem) => {
    setCurrentParentId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSelectedItemId(null);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentParentId(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSelectedItemId(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: VirtualItem = {
      id: `folder-${Date.now()}`,
      parentId: currentParentId,
      name: newFolderName.trim(),
      isFolder: true,
      createdAt: Date.now(),
    };

    await saveVirtualItem(newFolder);
    setNewFolderName("");
    setIsCreatingFolder(false);
    loadItems();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newItem: VirtualItem = {
        id: `file-${Date.now()}-${i}`,
        parentId: currentParentId,
        name: file.name,
        isFolder: false,
        size: file.size,
        type: file.type,
        blob: file,
        createdAt: Date.now(),
      };
      await saveVirtualItem(newItem);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    loadItems();
  };

  const handleDeleteItem = async (id: string) => {
    await deleteVirtualItem(id);
    if (selectedItemId === id) setSelectedItemId(null);
    loadItems();
  };

  const handleRenameSubmit = async (item: VirtualItem) => {
    if (!renamingName.trim() || renamingName.trim() === item.name) {
      setRenamingId(null);
      return;
    }

    const updated: VirtualItem = { ...item, name: renamingName.trim() };
    await saveVirtualItem(updated);
    setRenamingId(null);
    loadItems();
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

  const handleItemDoubleClick = (item: VirtualItem) => {
    if (item.isFolder) {
      handleOpenFolder(item);
    } else {
      const ext = item.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || item.type?.includes("pdf")) {
        const pdfApp = APPS.find((a) => a.id === "pdf");
        if (pdfApp) {
          const appMeta = getAppTranslation("pdf", language);
          openWindow({ ...pdfApp, title: appMeta?.title || pdfApp.title });
        }
      } else if (["mp3", "wav", "ogg", "aac"].includes(ext || "") || item.type?.startsWith("audio/")) {
        const audioApp = APPS.find((a) => a.id === "audio-converter") || APPS.find((a) => a.id === "music");
        if (audioApp) {
          const appMeta = getAppTranslation(audioApp.id, language);
          openWindow({ ...audioApp, title: appMeta?.title || audioApp.title });
        }
      } else if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || "") || item.type?.startsWith("image/")) {
        const galleryApp = APPS.find((a) => a.id === "gallery");
        if (galleryApp) {
          const appMeta = getAppTranslation("gallery", language);
          openWindow({ ...galleryApp, title: appMeta?.title || galleryApp.title });
        }
      } else if (["txt", "md", "json", "js", "ts"].includes(ext || "") || item.type?.startsWith("text/")) {
        const notesApp = APPS.find((a) => a.id === "notes");
        if (notesApp) {
          const appMeta = getAppTranslation("notes", language);
          openWindow({ ...notesApp, title: appMeta?.title || notesApp.title });
        }
      } else {
        handleDownloadFile(item);
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full select-none font-sans ${
        isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}
    >
      {/* Top Header & Breadcrumb Toolbar */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-b shrink-0 ${
          isLight ? "bg-white/90 border-slate-300" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={14} className="text-zinc-500 shrink-0" />}
              <button
                type="button"
                onClick={() => handleNavigateBreadcrumb(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold max-w-32 truncate transition-colors cursor-pointer ${
                  idx === breadcrumbs.length - 1
                    ? "bg-blue-600 text-white shadow-sm"
                    : isLight ? "hover:bg-slate-300 text-slate-700" : "hover:bg-white/10 text-zinc-300"
                }`}
              >
                {bc.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => setIsCreatingFolder(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-100" : "bg-white/10 border-white/10 text-white hover:bg-white/20"
            }`}
          >
            <FolderPlus size={14} className="text-amber-400" /> {t.fileManagerApp.newFolder}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Upload size={14} /> {t.fileManagerApp.uploadFile}
          </button>
        </div>
      </div>

      {/* Main File Explorer View */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isCreatingFolder && (
          <form
            onSubmit={handleCreateFolder}
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in-95 ${
              isLight ? "bg-white border-slate-300 shadow-md" : "bg-zinc-900 border-white/15"
            }`}
          >
            <Folder className="text-amber-400 shrink-0" size={24} />
            <input
              type="text"
              autoFocus
              placeholder={language === "en" ? "New folder name..." : "Nama Folder Baru..."}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className={`flex-1 px-3 py-1.5 rounded-xl border text-xs outline-hidden focus:border-blue-500 ${
                isLight ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-white/5 border-white/10 text-white"
              }`}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 cursor-pointer"
            >
              {t.common.save}
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className={`p-1.5 rounded-xl border cursor-pointer ${
                isLight ? "bg-slate-100 border-slate-300 hover:bg-slate-200" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <X size={14} />
            </button>
          </form>
        )}

        {items.length === 0 && !isCreatingFolder ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 mb-3">
              <HardDrive size={36} />
            </div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{t.fileManagerApp.emptyFolder}</h3>
            <p className={`text-xs mt-1 max-w-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              {language === "en" ? "Upload new files or create folders to store documents in Son-OS." : "Unggah file baru atau buat folder untuk mulai menyimpan dokumen di Son-OS."}
            </p>
          </div>
        ) : (
          <FileItemGrid
            items={items}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            handleItemDoubleClick={handleItemDoubleClick}
            renamingId={renamingId}
            renamingName={renamingName}
            setRenamingId={setRenamingId}
            setRenamingName={setRenamingName}
            handleRenameSubmit={handleRenameSubmit}
            handleDownloadFile={handleDownloadFile}
            handleDeleteItem={handleDeleteItem}
            isLight={isLight}
          />
        )}
      </div>
    </div>
  );
};
