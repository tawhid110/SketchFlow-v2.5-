const fs = require('fs');
const path = require('path');

const files = {
  'src/utils/drawProceduralStroke.ts': `/**
 * Core drawing engine for procedural brushes.
 * Connected to CanvasRenderer.
 */
import { BRUSH_CONFIG } from './brushConfig';
import { hsbToRgba } from './colorUtils';

export const drawProceduralStroke = (
  ctx: CanvasRenderingContext2D,
  mainCtx: CanvasRenderingContext2D,
  brushType: string,
  brushSize: number,
  color: { h: number, s: number, b: number, alpha: number },
  x1: number, y1: number, x2: number, y2: number
) => {
  const config = BRUSH_CONFIG[brushType] || BRUSH_CONFIG['Pen'];
  let targetCtx = ctx;
  if (brushType === 'Eraser') {
    targetCtx = mainCtx;
    targetCtx.globalCompositeOperation = 'destination-out';
  }
  if (!targetCtx) return;
  const rgbaColor = brushType === 'Eraser' ? 'rgba(0,0,0,1)' : hsbToRgba(color.h, color.s, color.b, color.alpha * config.opacity);
  targetCtx.strokeStyle = rgbaColor;
  targetCtx.fillStyle = rgbaColor;
  targetCtx.lineWidth = brushSize;
  targetCtx.lineCap = 'round';
  targetCtx.lineJoin = 'round';
  targetCtx.shadowBlur = config.blurEffect ? brushSize * 0.5 : 0;
  targetCtx.shadowColor = config.blurEffect ? rgbaColor : 'transparent';
  targetCtx.setLineDash(config.dashPattern ? [brushSize * 0.5, brushSize * 1.5] : []);

  const distance = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.floor(distance / (brushSize * 0.2)));
  targetCtx.beginPath();
  if (config.texture === 'fine-grain') {
    for (let i = 0; i <= steps; i++) {
      const cx = x1 + (x2 - x1) * (i / steps);
      const cy = y1 + (y2 - y1) * (i / steps);
      for (let d = 0; d < Math.floor(brushSize); d++) {
        const offsetX = (Math.random() - 0.5) * brushSize;
        const offsetY = (Math.random() - 0.5) * brushSize;
        if (Math.random() > 0.3) targetCtx.fillRect(cx + offsetX, cy + offsetY, 1, 1);
      }
    }
  } else if (config.texture === 'smoky-grain') {
    for (let i = 0; i <= steps; i++) {
      const cx = x1 + (x2 - x1) * (i / steps);
      const cy = y1 + (y2 - y1) * (i / steps);
      const spreadX = (Math.random() - 0.5) * brushSize * 0.5;
      const spreadY = (Math.random() - 0.5) * brushSize * 0.5;
      targetCtx.beginPath();
      targetCtx.arc(cx + spreadX, cy + spreadY, brushSize / 2, 0, Math.PI * 2);
      targetCtx.fill();
    }
  } else if (config.texture === 'coarse-dashed') {
    targetCtx.moveTo(x1, y1); targetCtx.lineTo(x2, y2); targetCtx.stroke();
    for (let i = 0; i <= steps; i++) {
      const cx = x1 + (x2 - x1) * (i / steps); const cy = y1 + (y2 - y1) * (i / steps);
      for (let d = 0; d < Math.floor(brushSize * 0.5); d++) {
        targetCtx.fillRect(cx + (Math.random() - 0.5) * brushSize, cy + (Math.random() - 0.5) * brushSize, 1.5, 1.5);
      }
    }
  } else if (config.texture === 'bristle') {
    for (let i = 0; i <= steps; i++) {
      const cx = x1 + (x2 - x1) * (i / steps); const cy = y1 + (y2 - y1) * (i / steps);
      for(let b=0; b<5; b++) { targetCtx.fillRect(cx + (b - 2) * (brushSize * 0.2), cy + (b - 2) * (brushSize * 0.2), 1, 1); }
    }
    targetCtx.moveTo(x1, y1); targetCtx.lineTo(x2, y2); targetCtx.stroke();
  } else {
    targetCtx.moveTo(x1, y1); targetCtx.lineTo(x2, y2); targetCtx.stroke();
  }
  if (brushType === 'Eraser') targetCtx.globalCompositeOperation = 'source-over';
};
`,
  'src/components/canvas/CanvasObjectOverlay.tsx': `/**
 * Render selection boxes and resize handles.
 * Connects to CanvasRenderer objects.
 */
import React, { useState, useRef, useEffect } from 'react';
import { CanvasObject } from '../../types';

export const CanvasObjectOverlay = ({ item, isActive, brushSize, zIndex, zoom, onChange }: { key?: React.Key, item: CanvasObject, isActive: boolean, brushSize: number, zIndex: number, zoom: number, onChange: (u: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const rafId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent, handle?: string) => {
    if (!isActive) return;
    e.stopPropagation(); setStartPos({ x: e.clientX, y: e.clientY }); setStartDim({ x: item.x, y: item.y, w: item.width, h: item.height });
    if (handle) { setIsResizing(handle); onChange({ isResizing: true }); }
    else setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (isDragging) {
          onChange({ x: startDim.x + (e.clientX - startPos.x) / zoom, y: startDim.y + (e.clientY - startPos.y) / zoom });
        } else if (isResizing) {
          const dx = (e.clientX - startPos.x) / zoom; const dy = (e.clientY - startPos.y) / zoom;
          let { x, y, w, h } = startDim;
          if (isResizing.includes('e')) w += dx;
          if (isResizing.includes('s')) h += dy;
          if (isResizing.includes('w')) { x += dx; w -= dx; }
          if (isResizing.includes('n')) { y += dy; h -= dy; }
          if (w < 20) { if (isResizing.includes('w')) x += (w - 20); w = 20; }
          if (h < 20) { if (isResizing.includes('n')) y += (h - 20); h = 20; }
          onChange({ x, y, width: w, height: h });
        }
      });
    };
    const handleUp = () => { if (isDragging || isResizing) { setIsDragging(false); setIsResizing(null); onChange({ isResizing: false }); } };
    if (isDragging || isResizing) { window.addEventListener('pointermove', handleMove); window.addEventListener('pointerup', handleUp); }
    return () => { window.removeEventListener('pointermove', handleMove); window.removeEventListener('pointerup', handleUp); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [isDragging, isResizing, startPos, startDim, onChange, item, zoom]);

  return (
    <div style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, cursor: isActive ? (isDragging ? 'grabbing' : 'grab') : 'default', border: isActive ? '1px dashed #3b82f6' : 'none', boxSizing: 'border-box', touchAction: 'none', pointerEvents: isActive ? 'auto' : 'none', zIndex }} onPointerDown={(e) => handlePointerDown(e)}>
      {isActive && ['nw', 'ne', 'sw', 'se'].map(handle => (
        <div key={handle} onPointerDown={(e) => handlePointerDown(e, handle)} style={{ position: 'absolute', width: 12, height: 12, backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '50%', [handle[0] === 'n' ? 'top' : 'bottom']: -6, [handle[1] === 'w' ? 'left' : 'right']: -6, cursor: \`\${handle}-resize\` }} />
      ))}
    </div>
  );
};
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log('gen3 complete');
