/**
 * Geometry and hit testing helpers.
 * Used by CanvasRenderer.
 */
import { CanvasObject } from '../types';

export const isPointInsideBox = (x: number, y: number, obj: CanvasObject) => {
  return x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height;
};
