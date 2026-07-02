/** UI for paint tools, brushes, and color selection. */
import React, { FC } from 'react';
import ColorPalette from './ColorPalette';
import BrushControls from './BrushControls';
import { hsvToRgb } from '../../utils/colorUtils';

export interface PaintPanelProps {
  color: { h: number; s: number; b: number; alpha: number };
  brushSize: number;
  brushType: string;
  customColors: string[];
  onColorChange: (color: { h: number; s: number; b: number; alpha: number }) => void;
  onAddCustomColor: (color: string) => void;
  onRemoveCustomColor: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushTypeChange: (type: string) => void;
}

const PaintPanel: FC<PaintPanelProps> = ({
  color,
  brushSize,
  brushType,
  customColors,
  onColorChange,
  onAddCustomColor,
  onRemoveCustomColor,
  onBrushSizeChange,
  onBrushTypeChange,
}) => {
  const currentRgb = hsvToRgb(color.h, color.s, color.b);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <BrushControls
        brushSize={brushSize}
        brushType={brushType}
        onBrushSizeChange={onBrushSizeChange}
        onBrushTypeChange={onBrushTypeChange}
      />
      <ColorPalette 
        color={color} 
        onChange={onColorChange}
        customColors={customColors}
        onAddCustomColor={onAddCustomColor}
        onRemoveCustomColor={onRemoveCustomColor}
      />
      {/* Brush Preview Area */}
      <div className="backdrop-blur-md bg-white/30 shadow-md rounded-lg p-4 flex flex-col items-center justify-center border border-white/40 h-32 shrink-0">
        <span className="text-sm font-semibold text-gray-700 w-full mb-2">Brush Preview</span>
        <div 
          className="flex-1 w-full flex items-center justify-center bg-white rounded-md relative border border-gray-200 overflow-hidden"
          style={{
            backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, transparent 0% 50%)',
            backgroundSize: '16px 16px'
          }}
        >
          <div 
             className="rounded-full shrink-0"
             style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                backgroundColor: `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, ${color.alpha})`,
             }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaintPanel;
