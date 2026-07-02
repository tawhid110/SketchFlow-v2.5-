const fs = require('fs');
const path = require('path');

const files = {
  'src/types.ts': `/**
 * Core type definitions for SketchFlow.
 * Connects to App.tsx, CanvasRenderer.tsx, and panels.
 */
export interface ColorHSB { h: number; s: number; b: number; alpha: number; }
export interface CanvasObject {
  id: string; type: 'image' | 'shape' | 'text';
  x: number; y: number; width: number; height: number;
  isResizing: boolean; locked?: boolean; visible?: boolean; groupId?: string;
  payload: { src?: string; shapeType?: string; content?: string; font?: string; size?: number; strokeColor?: string; fillColor?: string; bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right'; };
}
export interface StateSnapshot { imageDataUrl: string | null; objects: CanvasObject[]; }
export type InteractionMode = 'brush' | 'transform' | 'contextMenu' | 'idle';
`,
  'src/utils/ExportManager.ts': `/**
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
`,
  'src/utils/geometryUtils.ts': `/**
 * Geometry and hit testing helpers.
 * Used by CanvasRenderer.
 */
import { CanvasObject } from '../types';

export const isPointInsideBox = (x: number, y: number, obj: CanvasObject) => {
  return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
};
`,
  'src/hooks/useUndoRedo.ts': `/**
 * Custom hook for handling Undo/Redo logic.
 * Used in App.tsx.
 */
import { useState, useRef } from 'react';
import { StateSnapshot, CanvasObject } from '../types';

export function useUndoRedo() {
  const [undoStack, setUndoStack] = useState<StateSnapshot[]>([]);
  const currentStateRef = useRef<StateSnapshot | null>(null);

  const saveStateToUndo = () => {
    if (currentStateRef.current) {
      const snap = { 
        imageDataUrl: currentStateRef.current.imageDataUrl, 
        objects: currentStateRef.current.objects.map(o => ({...o})) 
      };
      setUndoStack(prev => {
        const newStack = [...prev, snap];
        if (newStack.length > 30) return newStack.slice(newStack.length - 30);
        return newStack;
      });
    }
  };

  const updateCurrentState = (dataUrl: string | null, objs: CanvasObject[]) => {
    currentStateRef.current = { imageDataUrl: dataUrl, objects: objs.map(o => ({...o})) };
  };

  return { undoStack, setUndoStack, currentStateRef, saveStateToUndo, updateCurrentState };
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log('gen1 complete');
