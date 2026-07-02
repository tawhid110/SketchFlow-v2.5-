/**
 * Core drawing engine for procedural brushes.
 * Connected to CanvasRenderer.
 */
import { BRUSH_CONFIG } from './brushConfig';

function hsbToRgba(h: number, s: number, b: number, a: number): string {
  s /= 100; b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  const r = Math.round(255 * f(5)); const g = Math.round(255 * f(3)); const blue = Math.round(255 * f(1));
  return `rgba(${r}, ${g}, ${blue}, ${a})`;
}

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
