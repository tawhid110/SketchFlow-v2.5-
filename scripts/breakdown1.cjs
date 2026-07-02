const fs = require('fs');
const path = require('path');

const files = {
  'src/utils/brushTypes.ts': `/**
 * Defines the brush types and options.
 * Connects to brush implementations.
 */
export type BrushType = 'pen' | 'pencil-hb' | 'pencil-2b' | 'pencil-6b' | 'paintbrush' | 'chalk' | 'charcoal';

export interface BrushOptions {
  hardness?: 'HB' | '2B' | '6B';
  lastX?: number;
  lastY?: number;
}

export function interpolatePoints(
  lastX: number,
  lastY: number,
  x: number,
  y: number,
  stepSize: number,
  callback: (curX: number, curY: number, distance: number) => void
) {
  const dx = x - lastX;
  const dy = y - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.floor(distance / stepSize));
  for (let i = 0; i <= steps; i++) {
    const curX = lastX + dx * (i / steps);
    const curY = lastY + dy * (i / steps);
    callback(curX, curY, distance);
  }
}
`,
  'src/utils/brushes/pen.ts': `/**
 * Pen brush implementation.
 * Connects to Canvas drawing engine.
 */
import { BrushOptions } from '../brushTypes';

export function drawPen(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, color: string, options?: BrushOptions) {
  ctx.lineWidth = size;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
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
`,
  'src/utils/brushes/pencil.ts': `/**
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
`,
  'src/utils/brushes/paintbrush.ts': `/**
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
`,
  'src/utils/brushes/chalk.ts': `/**
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
`,
  'src/utils/brushes/charcoal.ts': `/**
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
`,
  'src/utils/brushUtils.ts': `/**
 * Main export file for brushes.
 * Connects brush implementations to components.
 */
export * from './brushTypes';
export { drawPen } from './brushes/pen';
export { drawPencil } from './brushes/pencil';
export { drawPaintbrush } from './brushes/paintbrush';
export { drawChalk } from './brushes/chalk';
export { drawCharcoal } from './brushes/charcoal';
`
};

for (const [filepath, content] of Object.entries(files)) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content);
}
console.log('Successfully extracted brushUtils');
