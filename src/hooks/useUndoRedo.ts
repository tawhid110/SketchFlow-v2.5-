/**
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
