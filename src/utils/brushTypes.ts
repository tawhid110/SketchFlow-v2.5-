/**
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
