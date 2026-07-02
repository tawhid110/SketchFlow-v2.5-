/** Configuration for brush properties (texture, blur, dash). Used by drawing logic. */
export interface BrushConfigOptions {
  opacity: number;
  texture: string;
  blendMode: string;
  blurEffect?: boolean;
  dashPattern?: boolean;
}

export const BRUSH_CONFIG: Record<string, BrushConfigOptions> = {
  Pen: { opacity: 1.0, texture: "none", blendMode: "source-over" },
  PencilHB: { opacity: 0.3, texture: "fine-grain", blendMode: "multiply" },
  Pencil2B: { opacity: 0.5, texture: "fine-grain", blendMode: "multiply" },
  Pencil6B: { opacity: 0.7, texture: "fine-grain", blendMode: "multiply" },
  Paintbrush: { opacity: 1.0, texture: "bristle", blendMode: "source-over", blurEffect: true },
  Chalk: { opacity: 0.6, texture: "coarse-dashed", blendMode: "source-over", dashPattern: true },
  Charcoal: { opacity: 0.8, texture: "smoky-grain", blendMode: "source-over", blurEffect: true },
  Eraser: { opacity: 1.0, texture: "none", blendMode: "destination-out" },
};
