const fs = require('fs');
const path = require('path');

const files = {
  'src/hooks/useAppHotkeys.ts': `/**
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
`,
  'src/hooks/useContextMenuActions.ts': `/**
 * Hook to handle context menu actions on canvas objects.
 * Connects to App.tsx context menu UI.
 */
import { CanvasObject } from '../types';

export function useContextMenuActions({ canvasObjects, setCanvasObjects, selectedIds, setSelectedIds, interactionMode, setInteractionMode, saveStateToUndo, updateCurrentState, contextMenuState, setContextMenuState }: any) {
  return (action: string) => {
    const targetIdx = canvasObjects.findIndex((o: CanvasObject) => o.id === contextMenuState.targetId);
    if (targetIdx === -1) return;
    const target = canvasObjects[targetIdx]; let newObjects = [...canvasObjects];
    const commit = (objs: CanvasObject[]) => { setCanvasObjects(objs); updateCurrentState(null, objs); };

    if (action === 'transform') {
      if (!target.locked) {
        if (target.groupId) setSelectedIds(canvasObjects.filter((o: CanvasObject) => o.groupId === target.groupId).map((o: CanvasObject) => o.id));
        else setSelectedIds([target.id]);
        setInteractionMode('transform');
      }
    } else if (action === 'duplicate') {
      saveStateToUndo();
      newObjects.push({ ...target, id: Date.now().toString(), x: target.x + 20, y: target.y + 20 });
      commit(newObjects); setInteractionMode('brush');
    } else if (action === 'delete') {
      if (!target.locked) {
         saveStateToUndo(); newObjects.splice(targetIdx, 1); commit(newObjects);
         if (selectedIds.includes(target.id)) setSelectedIds(selectedIds.filter((id: string) => id !== target.id));
      }
      setInteractionMode('brush');
    } else if (action === 'toggleLock') {
      saveStateToUndo(); newObjects[targetIdx] = { ...target, locked: !target.locked }; commit(newObjects); setInteractionMode('brush');
    } else if (action === 'toggleVisible') {
      saveStateToUndo(); newObjects[targetIdx] = { ...target, visible: target.visible === false ? true : false }; commit(newObjects); setInteractionMode('brush');
    } else if (action === 'bringForward' && targetIdx < newObjects.length - 1) {
      saveStateToUndo(); [newObjects[targetIdx], newObjects[targetIdx + 1]] = [newObjects[targetIdx + 1], newObjects[targetIdx]]; commit(newObjects);
    } else if (action === 'sendBackward' && targetIdx > 0) {
      saveStateToUndo(); [newObjects[targetIdx - 1], newObjects[targetIdx]] = [newObjects[targetIdx], newObjects[targetIdx - 1]]; commit(newObjects);
    } else if (action === 'bringToFront' && targetIdx < newObjects.length - 1) {
      saveStateToUndo(); newObjects.splice(targetIdx, 1); newObjects.push(target); commit(newObjects);
    } else if (action === 'sendToBack' && targetIdx > 0) {
      saveStateToUndo(); newObjects.splice(targetIdx, 1); newObjects.unshift(target); commit(newObjects);
    }
    setContextMenuState((prev: any) => ({ ...prev, isOpen: false }));
  };
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log('gen4 complete');
