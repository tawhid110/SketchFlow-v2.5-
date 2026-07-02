/** UI for brush size and type selection. */
import React, { FC } from 'react';
import { Pen, Pencil, Paintbrush, Eraser, Edit3, Flame } from 'lucide-react';

interface BrushControlsProps {
  brushType: string;
  brushSize: number;
  onBrushTypeChange: (type: string) => void;
  onBrushSizeChange: (size: number) => void;
}

const BRUSH_TYPES: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'Pen', label: 'Pen', icon: <Pen size={16} /> },
  { id: 'PencilHB', label: 'Pencil (HB)', icon: <Pencil size={16} /> },
  { id: 'Pencil2B', label: 'Pencil (2B)', icon: <Pencil size={16} /> },
  { id: 'Pencil6B', label: 'Pencil (6B)', icon: <Pencil size={16} /> },
  { id: 'Paintbrush', label: 'Paintbrush', icon: <Paintbrush size={16} /> },
  { id: 'Chalk', label: 'Chalk', icon: <Edit3 size={16} /> },
  { id: 'Charcoal', label: 'Charcoal', icon: <Flame size={16} /> },
  { id: 'Eraser', label: 'Eraser', icon: <Eraser size={16} /> },
];

const BRUSH_RANGES: Record<string, { min: number, max: number }> = {
  Pen: { min: 1, max: 6 },
  PencilHB: { min: 2, max: 8 },
  Pencil2B: { min: 2, max: 8 },
  Pencil6B: { min: 2, max: 8 },
  Paintbrush: { min: 6, max: 24 },
  Chalk: { min: 8, max: 20 },
  Charcoal: { min: 10, max: 24 },
  Eraser: { min: 5, max: 20 },
};

const BrushControls: FC<BrushControlsProps> = ({
  brushType,
  brushSize,
  onBrushTypeChange,
  onBrushSizeChange,
}) => {
  const range = BRUSH_RANGES[brushType] || BRUSH_RANGES.Pen;

  const handleTypeChange = (type: string) => {
    onBrushTypeChange(type);
    const newRange = BRUSH_RANGES[type] || BRUSH_RANGES.Pen;
    onBrushSizeChange(newRange.min);
  };

  return (
    <div className="backdrop-blur-md bg-white/30 shadow-md rounded-lg p-4 flex flex-col gap-4 border border-white/40">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">Brush Type</label>
        <div className="flex flex-wrap gap-2">
          {BRUSH_TYPES.map((type) => (
            <button
              key={type.id}
              onPointerDown={() => handleTypeChange(type.id)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all flex flex-col items-center gap-1 active:scale-95 ${
                brushType === type.id
                  ? 'bg-blue-500 text-white font-medium ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                  : 'bg-white/50 text-gray-700 hover:bg-white/80 active:bg-gray-100 border border-gray-200 hover:scale-105'
              }`}
              title={type.label}
            >
              {type.icon}
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <label htmlFor="brush-size" className="text-sm font-semibold text-gray-700">
            Brush Size
          </label>
          <span className="text-xs text-gray-500 font-medium">{brushSize}px</span>
        </div>
        <input
          id="brush-size"
          type="range"
          min={range.min}
          max={range.max}
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};

export default BrushControls;
