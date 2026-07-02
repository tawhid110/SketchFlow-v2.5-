/**
 * Context menu UI for canvas objects.
 * Used in App.tsx.
 */
import React from 'react';
import { Move, Copy, Lock, Unlock, Eye, EyeOff, FolderPlus, FolderOutput, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine, Trash2 } from 'lucide-react';
import { CanvasObject } from '../types';

export function ContextMenu({ state, canvasObjects, selectedIds, onAction }: any) {
  if (!state.isOpen) return null;
  const target = canvasObjects.find((o: CanvasObject) => o.id === state.targetId);
  return (
    <div style={{ left: state.x, top: state.y }} className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]" onPointerDown={(e) => e.stopPropagation()}>
      {target ? (
        <>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('transform'); }}><Move size={14} /> Transform</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('duplicate'); }}><Copy size={14} /> Duplicate</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('toggleLock'); }}>
            {target.locked ? <><Unlock size={14} /> Unlock</> : <><Lock size={14} /> Lock</>}
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('toggleVisible'); }}>
            {target.visible === false ? <><Eye size={14} /> Show</> : <><EyeOff size={14} /> Hide</>}
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          {selectedIds.length > 1 && (
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('group'); }}><FolderPlus size={14} /> Group Selected</button>
          )}
          {target.groupId && (
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('ungroup'); }}><FolderOutput size={14} /> Ungroup</button>
          )}
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('bringForward'); }}><ArrowUp size={14} /> Bring Forward</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('sendBackward'); }}><ArrowDown size={14} /> Send Backward</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('bringToFront'); }}><ArrowUpToLine size={14} /> Bring to Front</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 active:bg-gray-200 text-sm flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('sendToBack'); }}><ArrowDownToLine size={14} /> Send to Back</button>
          <div className="border-t border-gray-200 my-1"></div>
          <button className="w-full text-left px-4 py-2 hover:bg-red-50 active:bg-red-100 text-sm text-red-600 flex items-center gap-2 transition-colors" onPointerDown={(e) => { e.stopPropagation(); onAction('delete'); }}><Trash2 size={14} /> Delete</button>
        </>
      ) : (<div className="px-4 py-2 text-sm text-gray-500">No object selected</div>)}
    </div>
  );
}
