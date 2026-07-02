/**
 * Pencil brush implementation.
 * Connects to Canvas drawing engine.
 */
import { BrushOptions, interpolatePoints } from '../brushTypes';

export function drawPencil(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, options?: BrushOptions) {
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  const hardness = options?.hardness || '2B';
  let baseAlpha = 0.6;
  let jitterScale = 1;
  if (hardness === 'HB') {
    baseAlpha = 0.4;
    jitterScale = 0.5;
  } else if (hardness === '6B') {
    baseAlpha = 0.8;
    jitterScale = 1.5;
  }
  const lastX = options?.lastX ?? x;
  const lastY = options?.lastY ?? y;
  const stepSize = Math.max(1, size * 0.2);
  interpolatePoints(lastX, lastY, x, y, stepSize, (curX, curY, distance) => {
    const speedFactor = Math.min(1, Math.max(0.2, 10 / (distance + 1)));
    ctx.globalAlpha = alpha * baseAlpha * speedFactor;
    const jitterX = (Math.random() - 0.5) * size * jitterScale;
    const jitterY = (Math.random() - 0.5) * size * jitterScale;
    const actualSize = size * (0.5 + Math.random() * 0.5);
    ctx.beginPath();
    ctx.arc(curX + jitterX, curY + jitterY, actualSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}
