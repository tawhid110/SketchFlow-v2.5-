const fs = require('fs');
const path = require('path');

const files = {
  'src/components/ContextMenu.tsx': `/**
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
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('transform')}><Move size={14} /> Transform</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('duplicate')}><Copy size={14} /> Duplicate</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('toggleLock')}>
            {target.locked ? <><Unlock size={14} /> Unlock</> : <><Lock size={14} /> Lock</>}
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('toggleVisible')}>
            {target.visible === false ? <><Eye size={14} /> Show</> : <><EyeOff size={14} /> Hide</>}
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          {selectedIds.length > 1 && (
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('group')}><FolderPlus size={14} /> Group Selected</button>
          )}
          {target.groupId && (
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('ungroup')}><FolderOutput size={14} /> Ungroup</button>
          )}
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('bringForward')}><ArrowUp size={14} /> Bring Forward</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('sendBackward')}><ArrowDown size={14} /> Send Backward</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('bringToFront')}><ArrowUpToLine size={14} /> Bring to Front</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2" onClick={() => onAction('sendToBack')}><ArrowDownToLine size={14} /> Send to Back</button>
          <div className="border-t border-gray-200 my-1"></div>
          <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2" onClick={() => onAction('delete')}><Trash2 size={14} /> Delete</button>
        </>
      ) : (<div className="px-4 py-2 text-sm text-gray-500">No object selected</div>)}
    </div>
  );
}
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log('gen5 complete');
