/**
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
    } else if (action === 'group') {
      if (selectedIds.length > 1) {
        saveStateToUndo();
        const groupId = Date.now().toString();
        newObjects = newObjects.map(o => selectedIds.includes(o.id) ? { ...o, groupId } : o);
        commit(newObjects);
        setInteractionMode('brush');
      }
    } else if (action === 'ungroup') {
      if (target.groupId) {
        saveStateToUndo();
        const groupId = target.groupId;
        newObjects = newObjects.map(o => o.groupId === groupId ? { ...o, groupId: undefined } : o);
        commit(newObjects);
        setInteractionMode('brush');
      }
    }
    setContextMenuState((prev: any) => ({ ...prev, isOpen: false }));
  };
}
