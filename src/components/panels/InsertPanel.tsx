/**
 * UI for inserting shapes, images, and text onto the canvas.
 * Connected to App.tsx insert tab.
 */
import React, { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon, Square, Circle, Triangle, Minus, ArrowRight, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { CanvasObject } from '../../types';
import { hsvToRgb } from '../../utils/colorUtils';

export default function InsertPanel({ color, onInsertObject }: { color: any, onInsertObject: (obj: CanvasObject) => void }) {
  const [textContent, setTextContent] = useState(''); const [textFont, setTextFont] = useState('sans-serif');
  const [textBold, setTextBold] = useState(false); const [textItalic, setTextItalic] = useState(false); const [textAlign, setTextAlign] = useState<'left'|'center'|'right'>('center');
  const colorStr = `rgba(${hsvToRgb(color.h, color.s, color.b).r}, ${hsvToRgb(color.h, color.s, color.b).g}, ${hsvToRgb(color.h, color.s, color.b).b}, ${color.alpha})`;

  const handleImageUpload = () => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = (e) => { const f = (e.target as any).files?.[0]; if (f) { const r = new FileReader(); r.onload = (e) => { if (e.target?.result) onInsertObject({ id: Date.now().toString(), type: 'image', x: 50, y: 50, width: 200, height: 200, isResizing: false, payload: { src: e.target.result as string } }); }; r.readAsDataURL(f); } }; i.click(); };
  const handleImageUrl = () => { const u = prompt('Enter image URL:'); if (u) onInsertObject({ id: Date.now().toString(), type: 'image', x: 50, y: 50, width: 200, height: 200, isResizing: false, payload: { src: u } }); };
  const insertShape = (shapeType: string) => onInsertObject({ id: Date.now().toString(), type: 'shape', x: 100, y: 100, width: 150, height: 150, isResizing: false, payload: { shapeType, strokeColor: colorStr, fillColor: 'transparent' } });
  const insertText = () => { if (!textContent.trim()) return; onInsertObject({ id: Date.now().toString(), type: 'text', x: 100, y: 100, width: 250, height: 100, isResizing: false, payload: { content: textContent, font: textFont, size: 24, fillColor: colorStr, bold: textBold, italic: textItalic, align: textAlign } }); setTextContent(''); };

  return (
    <div className="space-y-6">
      <div className="space-y-3"><h3 className="text-sm font-semibold text-gray-700">Images</h3><div className="grid grid-cols-2 gap-2">
        <button onPointerDown={handleImageUpload} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><ImageIcon size={20} /><span className="text-xs font-medium">Upload</span></button>
        <button onPointerDown={handleImageUrl} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><LinkIcon size={20} /><span className="text-xs font-medium">URL</span></button>
      </div></div>
      <div className="space-y-3"><h3 className="text-sm font-semibold text-gray-700">Shapes</h3><div className="grid grid-cols-3 gap-2">
        <button onPointerDown={() => insertShape('rectangle')} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><Square size={18} /><span className="text-xs font-medium">Rect</span></button>
        <button onPointerDown={() => insertShape('circle')} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><Circle size={18} /><span className="text-xs font-medium">Circle</span></button>
        <button onPointerDown={() => insertShape('triangle')} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><Triangle size={18} /><span className="text-xs font-medium">Triangle</span></button>
        <button onPointerDown={() => insertShape('line')} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><Minus size={18} /><span className="text-xs font-medium">Line</span></button>
        <button onPointerDown={() => insertShape('arrow')} className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 active:scale-95 text-gray-600 hover:text-blue-600 rounded-lg border border-gray-200 transition-all"><ArrowRight size={18} /><span className="text-xs font-medium">Arrow</span></button>
      </div></div>
      <div className="space-y-3"><h3 className="text-sm font-semibold text-gray-700">Text</h3><div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <input type="text" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Enter text..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        <div className="flex gap-2"><select value={textFont} onChange={(e) => setTextFont(e.target.value)} className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="sans-serif">Sans Serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option><option value="cursive">Cursive</option></select></div>
        <div className="flex justify-between gap-1 border-t border-gray-200 pt-3">
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
            <button onPointerDown={() => setTextBold(!textBold)} className={`p-1.5 hover:bg-gray-100 active:bg-gray-200 ${textBold ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}><Bold size={16} /></button>
            <button onPointerDown={() => setTextItalic(!textItalic)} className={`p-1.5 border-l border-gray-200 hover:bg-gray-100 active:bg-gray-200 ${textItalic ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}><Italic size={16} /></button>
          </div>
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
            <button onPointerDown={() => setTextAlign('left')} className={`p-1.5 hover:bg-gray-100 active:bg-gray-200 ${textAlign === 'left' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}><AlignLeft size={16} /></button>
            <button onPointerDown={() => setTextAlign('center')} className={`p-1.5 border-l border-gray-200 hover:bg-gray-100 active:bg-gray-200 ${textAlign === 'center' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}><AlignCenter size={16} /></button>
            <button onPointerDown={() => setTextAlign('right')} className={`p-1.5 border-l border-gray-200 hover:bg-gray-100 active:bg-gray-200 ${textAlign === 'right' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}><AlignRight size={16} /></button>
          </div>
        </div>
        <button onPointerDown={insertText} disabled={!textContent.trim()} className="w-full py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95 disabled:active:scale-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-all">Add Text</button>
      </div></div>
    </div>
  );
}
