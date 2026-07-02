/**
 * Custom hook for global keyboard shortcuts.
 * Used in App.tsx for undo, redo, delete, etc.
 */
import { useEffect } from 'react';
import { CanvasObject, StateSnapshot } from '../types';

export function useAppHotkeys({
  undoStack, canvasObjects, selectedIds, interactionMode, currentStateRef,
  handleUndo, saveStateToUndo, setCanvasObjects, updateCurrentState, setSelectedIds, setInteractionMode
}: any) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); if (!e.shiftKey) handleUndo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const hasUnlocked = canvasObjects.some((o: CanvasObject) => selectedIds.includes(o.id) && !o.locked);
          if (hasUnlocked) {
            saveStateToUndo();
            const newObjects = canvasObjects.filter((o: CanvasObject) => !selectedIds.includes(o.id) || o.locked);
            setCanvasObjects(newObjects); updateCurrentState(null, newObjects);
            setSelectedIds([]); setInteractionMode('brush');
          }
        }
      } else if (e.key === 'Escape') {
        if (interactionMode === 'transform') {
          e.preventDefault();
          if (currentStateRef.current) setCanvasObjects(currentStateRef.current.objects.map((o: CanvasObject) => ({...o})));
          setSelectedIds([]); setInteractionMode('brush');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, canvasObjects, selectedIds, interactionMode, handleUndo, saveStateToUndo, setCanvasObjects, updateCurrentState, setSelectedIds, setInteractionMode, currentStateRef]);
}
