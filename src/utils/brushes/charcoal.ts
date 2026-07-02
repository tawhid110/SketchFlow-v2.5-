/**
 * Charcoal brush implementation.
 * Connects to Canvas drawing engine.
 */
import { BrushOptions, interpolatePoints } from '../brushTypes';

export function drawCharcoal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, options?: BrushOptions) {
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  const lastX = options?.lastX ?? x;
  const lastY = options?.lastY ?? y;
  const stepSize = Math.max(1, size * 0.15);
  interpolatePoints(lastX, lastY, x, y, stepSize, (curX, curY) => {
    ctx.globalAlpha = alpha * (0.5 + Math.random() * 0.4);
    const offsetX = (Math.random() - 0.5) * size * 0.8;
    const offsetY = (Math.random() - 0.5) * size * 0.8;
    ctx.beginPath();
    ctx.ellipse(curX + offsetX, curY + offsetY, size * 0.6, size * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    if (Math.random() > 0.5) {
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillRect(curX + (Math.random() - 0.5) * size, curY + (Math.random() - 0.5) * size, size * 0.1, size * 0.1);
    }
  });
}
