/**
 * Paintbrush implementation.
 * Connects to Canvas drawing engine.
 */
import { BrushOptions } from '../brushTypes';

export function drawPaintbrush(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, options?: BrushOptions) {
  ctx.lineWidth = size * 1.5;
  ctx.globalAlpha = alpha * 0.7; // wet look
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = size * 0.5; // Gaussian blur effect
  ctx.shadowColor = color;
  ctx.setLineDash([]);
  ctx.beginPath();
  if (options?.lastX !== undefined && options?.lastY !== undefined) {
    ctx.moveTo(options.lastX, options.lastY);
  } else {
    ctx.moveTo(x, y);
  }
  ctx.lineTo(x, y);
  ctx.stroke();
}
