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

export const initIndexedDB = (): Promise<IDBDatabase> => {
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

export const fetchFolderItems = async (parentId: string | null): Promise<VirtualItem[]> => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("parentId");
    const request = index.getAll(parentId);

    request.onsuccess = () => {
      const results: VirtualItem[] = request.result || [];
      results.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveVirtualItem = async (item: VirtualItem): Promise<void> => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteVirtualItem = async (id: string): Promise<void> => {
  const db = await initIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
