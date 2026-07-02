/**
 * Chalk brush implementation.
 * Connects to Canvas drawing engine.
 */
import { BrushOptions, interpolatePoints } from '../brushTypes';

export function drawChalk(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, options?: BrushOptions) {
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  const lastX = options?.lastX ?? x;
  const lastY = options?.lastY ?? y;
  const stepSize = Math.max(1, size * 0.3);
  interpolatePoints(lastX, lastY, x, y, stepSize, (curX, curY) => {
    ctx.globalAlpha = alpha * 0.7 * Math.random();
    const particles = Math.floor(size * 1.5);
    for (let i = 0; i < particles; i++) {
      const offsetX = (Math.random() - 0.5) * size * 1.2;
      const offsetY = (Math.random() - 0.5) * size * 1.2;
      const pSize = Math.random() * (size * 0.2);
      ctx.fillRect(curX + offsetX, curY + offsetY, pSize, pSize);
    }
  });
}
