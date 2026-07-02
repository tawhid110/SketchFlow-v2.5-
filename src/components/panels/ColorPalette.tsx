/**
 * Color picker UI with predefined palettes and custom color support.
 * Connected to PaintPanel.tsx.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { hsvToRgb, rgbToHex, hexToRgb, rgbToHsv } from '../../utils/colorUtils';
const PRESET_COLORS = [
  '#000000', '#4b5563', '#9ca3af', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
  '#57534e', '#78716c', '#a8a29e', '#d6d3d1'
];
interface ColorPaletteProps {
  color: { h: number, s: number, b: number, alpha: number };
  customColors: string[];
  onChange: (color: { h: number, s: number, b: number, alpha: number }) => void;
  onAddCustomColor: (hex: string) => void;
  onRemoveCustomColor: (hex: string) => void;
}
export default function ColorPalette({ color, customColors, onChange, onAddCustomColor, onRemoveCustomColor }: ColorPaletteProps) {
  const [hexInput, setHexInput] = useState('');
  const sbRef = useRef<HTMLDivElement>(null); const hRef = useRef<HTMLDivElement>(null); const aRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const rgb = hsvToRgb(color.h, color.s, color.b); setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase()); }, [color]);
  const handleHexSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let hex = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
      if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) { const rgb = hexToRgb(hex); if (rgb) { const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b); onChange({ h: hsv.h, s: hsv.s, b: hsv.v, alpha: color.alpha }); } }
      else { const rgb = hsvToRgb(color.h, color.s, color.b); setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase()); }
    }
  };
  const selectColor = (hex: string) => { const rgb = hexToRgb(hex); if (rgb) { const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b); onChange({ h: hsv.h, s: hsv.s, b: hsv.v, alpha: color.alpha }); } };
  const handleSlider = (ref: React.RefObject<HTMLDivElement>, e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, type: 'sb' | 'h' | 'a') => {
    if (!ref.current) return; const rect = ref.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;
    let x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    let y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    if (type === 'sb') onChange({ ...color, s: x * 100, b: (1 - y) * 100 });
    else if (type === 'h') onChange({ ...color, h: x * 360 });
    else if (type === 'a') onChange({ ...color, alpha: x });
  };
  const useDrag = (ref: React.RefObject<HTMLDivElement>, type: 'sb' | 'h' | 'a') => {
    useEffect(() => {
      const el = ref.current; if (!el) return;
      let isDragging = false;
      const down = (e: Event) => { isDragging = true; handleSlider(ref, e as any, type); };
      const move = (e: Event) => { if (isDragging) handleSlider(ref, e as any, type); };
      const up = () => { isDragging = false; };
      el.addEventListener('mousedown', down); el.addEventListener('touchstart', down, { passive: true });
      window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, { passive: true });
      window.addEventListener('mouseup', up); window.addEventListener('touchend', up);
      return () => { el.removeEventListener('mousedown', down); el.removeEventListener('touchstart', down); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
    }, [color]);
  };
  useDrag(sbRef, 'sb'); useDrag(hRef, 'h'); useDrag(aRef, 'a');
  const curRgb = hsvToRgb(color.h, color.s, color.b);
  const hueRgb = hsvToRgb(color.h, 100, 100);

  const isSelected = (hex: string) => {
    const formattedHex = hexInput.startsWith('#') ? hexInput : '#' + hexInput;
    return formattedHex.toUpperCase() === hex.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => <button key={c} onClick={() => selectColor(c)} className={`w-6 h-6 rounded-md shadow-sm border border-gray-200 transition-all ${isSelected(c) ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />)}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-semibold text-gray-700">Custom Colors</h3><button onClick={() => onAddCustomColor('#' + hexInput)} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-md"><Plus size={14} /> Add Current</button></div>
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {customColors.map(c => (
            <div key={c} className={`group relative w-7 h-7 rounded-md transition-all ${isSelected(c) ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'hover:scale-105'}`}>
              <button onClick={() => selectColor(c)} className="w-full h-full rounded-md shadow-sm border border-gray-200" style={{ backgroundColor: c }} />
              <button onClick={() => onRemoveCustomColor(c)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
            </div>
          ))}
          {customColors.length === 0 && <div className="text-xs text-gray-400 italic py-1">No custom colors saved</div>}
        </div>
      </div>
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md shadow-inner border border-gray-200 shrink-0" style={{ backgroundColor: `rgba(${curRgb.r}, ${curRgb.g}, ${curRgb.b}, ${color.alpha})` }} />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 flex-1"><span className="text-gray-500 text-sm font-mono">#</span><input type="text" value={hexInput} onChange={e => setHexInput(e.target.value)} onBlur={() => handleHexSubmit({ key: 'Enter' } as any)} onKeyDown={handleHexSubmit} className="w-full bg-transparent border-none focus:outline-none text-sm font-mono py-1.5 uppercase" spellCheck={false} /></div>
        </div>
        <div ref={sbRef} className="w-full h-32 rounded-md relative cursor-crosshair overflow-hidden shadow-inner" style={{ backgroundColor: `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, #000 100%)' }} />
          <div className="absolute w-4 h-4 -ml-2 -mt-2 border-2 border-white rounded-full shadow-md pointer-events-none" style={{ left: `${color.s}%`, top: `${100 - color.b}%`, backgroundColor: `rgb(${curRgb.r}, ${curRgb.g}, ${curRgb.b})` }} />
        </div>
        <div className="space-y-1"><div className="flex justify-between"><label className="text-xs text-gray-500 font-medium">Hue</label><span className="text-xs text-gray-400 font-mono">{Math.round(color.h)}°</span></div><div ref={hRef} className="w-full h-4 rounded-md relative cursor-pointer shadow-inner" style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}><div className="absolute w-3 h-5 -ml-1.5 -mt-0.5 bg-white border border-gray-300 rounded-sm shadow-sm pointer-events-none" style={{ left: `${(color.h / 360) * 100}%` }} /></div></div>
        <div className="space-y-1"><div className="flex justify-between"><label className="text-xs text-gray-500 font-medium">Opacity</label><span className="text-xs text-gray-400 font-mono">{Math.round(color.alpha * 100)}%</span></div><div className="w-full h-4 rounded-md relative cursor-pointer shadow-inner overflow-hidden" style={{ backgroundImage: 'conic-gradient(gray 25%, white 25% 50%, gray 50% 75%, white 75%)', backgroundSize: '8px 8px' }}><div ref={aRef} className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(${curRgb.r}, ${curRgb.g}, ${curRgb.b}, 0) 0%, rgba(${curRgb.r}, ${curRgb.g}, ${curRgb.b}, 1) 100%)` }}><div className="absolute w-3 h-5 -ml-1.5 -mt-0.5 bg-white border border-gray-300 rounded-sm shadow-sm pointer-events-none" style={{ left: `${color.alpha * 100}%` }} /></div></div></div>
      </div>
    </div>
  );
}
