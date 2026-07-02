/**
 * Handles exporting and saving projects using IndexedDB.
 * Used by App.tsx and ExportPanel.tsx.
 */
import { StateSnapshot } from '../types';

export const ExportManager = {
  downloadPng(dataUrl: string, filename = 'sketchflow-export.png') {
    const link = document.createElement('a');
    link.download = filename; link.href = dataUrl;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }
};

export const DBManager = {
  dbName: 'SketchFlowDB', storeName: 'projects',
  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.storeName);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async saveProject(id: string, state: StateSnapshot) {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const req = tx.objectStore(this.storeName).put(state, id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },
  async loadProject(id: string): Promise<StateSnapshot | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};
