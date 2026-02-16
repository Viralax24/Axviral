import { openDB } from 'idb';

const DB_NAME = 'AxViral24DB';
const STORE_NAME = 'media';

export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'image';
  sourceType: 'file' | 'url';
  file?: Blob; // Only if sourceType is 'file'
  remoteUrl?: string; // Only if sourceType is 'url'
  thumbnail?: string; // URL for thumbnail
  createdAt: number;
  views: number;
}

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
};

export const addMedia = async (media: MediaItem) => {
  const db = await initDB();
  return db.add(STORE_NAME, media);
};

export const getAllMedia = async () => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'createdAt');
};

export const getMediaById = async (id: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const deleteMedia = async (id: string) => {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
}
