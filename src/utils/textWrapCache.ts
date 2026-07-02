/**
 * Text wrapping and measurement caches to fix lag.
 * Connects to Canvas drawing engine.
 */
export const imageCache = new Map<string, HTMLImageElement>();
export const textMeasureCache100 = new Map<string, number>();
export const textWrapCache = new Map<string, { lines: string[], totalHeight: number }>();
