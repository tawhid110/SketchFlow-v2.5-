/** Top action bar UI (Undo, Clear, Save). */
import React, { FC } from 'react';
import { Undo2, Trash2, Save } from 'lucide-react';

interface ActionBarProps {
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  canUndo: boolean;
}

const ActionBar: FC<ActionBarProps> = ({ onUndo, onClear, onSave, canUndo }) => {
  return (
    <div className="flex gap-1 md:gap-2">
      <button 
        className="flex items-center gap-1.5 px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 size={16} />
        <span className="hidden sm:inline">Undo</span>
      </button>
      <button 
        className="flex items-center gap-1.5 px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium transition"
        onClick={onClear}
        title="Clear"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Clear</span>
      </button>
      <button 
        className="flex items-center gap-1.5 px-2 md:px-4 py-1 md:py-1.5 text-xs md:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition"
        onClick={onSave}
        title="Save"
      >
        <Save size={16} />
        <span className="hidden sm:inline">Save</span>
      </button>
    </div>
  );
};

export default ActionBar;
