/**
 * Core type definitions for SketchFlow.
 * Connects to App.tsx, CanvasRenderer.tsx, and panels.
 */
export interface ColorHSB { h: number; s: number; b: number; alpha: number; }
export interface CanvasObject {
  id: string; type: 'image' | 'shape' | 'text';
  x: number; y: number; width: number; height: number;
  isResizing: boolean; locked?: boolean; visible?: boolean; groupId?: string; rotation?: number;
  payload: { src?: string; shapeType?: string; content?: string; font?: string; size?: number; strokeColor?: string; fillColor?: string; bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right'; };
}
export interface StateSnapshot { imageDataUrl: string | null; objects: CanvasObject[]; }
export type InteractionMode = 'brush' | 'transform' | 'contextMenu' | 'idle';

export interface CanvasRendererProps {
  brushType: string; brushSize: number; color: ColorHSB; onStrokeEnd: (dataUrl: string) => void;
  canvasObjects?: CanvasObject[]; interactionMode?: InteractionMode; selectedIds?: string[];
  showGrid?: boolean; onUpdateCanvasObject?: (id: string, updates: Partial<CanvasObject>) => void;
  onUpdateCanvasObjects?: (updates: {id: string, updates: Partial<CanvasObject>}[]) => void;
  onSelectObjectForTransform?: (id: string, multiSelect?: boolean) => void;
  onSelectMultipleObjects?: (ids: string[], append: boolean) => void;
  onContextMenuOpen?: (x: number, y: number, targetId: string | null) => void;
  isMobile?: boolean;
  pendingActivationId?: string | null;
  pan: { x: number, y: number };
}

export interface CanvasRendererRef {
  undo: (imageDataUrl: string | null) => void;
  clear: () => void;
  save: () => void;
  getCurrentData: () => string | null;
}
