const fs = require('fs');
const path = require('path');

const typesTs = `/**
 * Core type definitions for SketchFlow.
 * Connects to App.tsx, CanvasRenderer.tsx, and panels.
 * Contains the main StateSnapshot and CanvasObject structures.
 */
export interface ColorHSB { h: number; s: number; b: number; alpha: number; }
export interface CanvasObject {
  id: string; type: 'image' | 'shape' | 'text';
  x: number; y: number; width: number; height: number;
  isResizing: boolean; locked?: boolean; visible?: boolean; groupId?: string;
  payload: { src?: string; shapeType?: string; content?: string; font?: string; size?: number; strokeColor?: string; fillColor?: string; bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right'; };
}
export interface StateSnapshot { imageDataUrl: string | null; objects: CanvasObject[]; }
export type InteractionMode = 'brush' | 'transform' | 'contextMenu' | 'idle';
`;

fs.writeFileSync('src/types.ts', typesTs);
console.log('types.ts created');
