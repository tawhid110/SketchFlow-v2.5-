/**
 * Core drawing logic for shapes, images, and text.
 * Used by Canvas layers to render objects.
 */
import { CanvasObject } from '../types';
import { imageCache, textMeasureCache100, textWrapCache } from './textWrapCache';

export const drawCanvasObject = (ctx: CanvasRenderingContext2D, item: CanvasObject, brushSize: number) => {
  const rotation = item.rotation || 0;
  ctx.save();
  if (rotation !== 0) {
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * Math.PI / 180);
    const localItem = {
      ...item,
      x: -item.width / 2,
      y: -item.height / 2
    };
    if (localItem.type === 'image' && localItem.payload.src) {
      const img = imageCache.get(localItem.payload.src);
      if (img) ctx.drawImage(img, localItem.x, localItem.y, localItem.width, localItem.height);
    } else if (localItem.type === 'shape') {
      drawShape(ctx, localItem, brushSize);
    } else if (localItem.type === 'text') {
      drawText(ctx, localItem);
    }
  } else {
    if (item.type === 'image' && item.payload.src) {
      const img = imageCache.get(item.payload.src);
      if (img) ctx.drawImage(img, item.x, item.y, item.width, item.height);
    } else if (item.type === 'shape') {
      drawShape(ctx, item, brushSize);
    } else if (item.type === 'text') {
      drawText(ctx, item);
    }
  }
  ctx.restore();
};

function drawShape(ctx: CanvasRenderingContext2D, item: CanvasObject, brushSize: number) {
  ctx.beginPath();
  ctx.strokeStyle = item.payload.strokeColor || '#000';
  ctx.fillStyle = item.payload.fillColor || 'transparent';
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (item.payload.shapeType) {
    case 'rectangle': ctx.rect(item.x, item.y, item.width, item.height); break;
    case 'circle': ctx.ellipse(item.x + item.width/2, item.y + item.height/2, Math.max(0, item.width/2 - brushSize/2), Math.max(0, item.height/2 - brushSize/2), 0, 0, Math.PI * 2); break;
    case 'triangle':
      ctx.moveTo(item.x + item.width/2, item.y); ctx.lineTo(item.x + item.width, item.y + item.height); ctx.lineTo(item.x, item.y + item.height); ctx.closePath(); break;
    case 'line':
      ctx.moveTo(item.x, item.y + item.height/2); ctx.lineTo(item.x + item.width, item.y + item.height/2); break;
    case 'arrow':
      ctx.moveTo(item.x, item.y + item.height/2); ctx.lineTo(item.x + item.width, item.y + item.height/2);
      ctx.lineTo(item.x + item.width - 15, item.y + item.height/2 - 10); ctx.moveTo(item.x + item.width, item.y + item.height/2);
      ctx.lineTo(item.x + item.width - 15, item.y + item.height/2 + 10); break;
  }
  if (item.payload.fillColor !== 'transparent') ctx.fill();
  ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, item: CanvasObject) {
  let fontStyle = '';
  if (item.payload.bold) fontStyle += 'bold ';
  if (item.payload.italic) fontStyle += 'italic ';
  const fontFamily = item.payload.font || 'sans-serif';
  const content = item.payload.content || '';
  const cacheKey100 = `${content}_${fontFamily}_${fontStyle}`;
  let textWidth100 = textMeasureCache100.get(cacheKey100);
  if (!textWidth100) {
      ctx.font = `${fontStyle}100px ${fontFamily}`;
      textWidth100 = ctx.measureText(content).width;
      textMeasureCache100.set(cacheKey100, textWidth100);
      if (textMeasureCache100.size > 500) textMeasureCache100.delete(textMeasureCache100.keys().next().value!);
  }
  const padding = 4;
  const availableWidth = Math.max(1, item.width - padding * 2);
  const availableHeight = Math.max(1, item.height - padding * 2);
  const calculatedSize = Math.min((availableWidth / Math.max(1, textWidth100)) * 100, availableHeight * 0.8);
  let finalSize = calculatedSize; let shouldWrap = false;
  if (calculatedSize < 12) { finalSize = 12; shouldWrap = true; }
  ctx.font = `${fontStyle}${finalSize}px ${fontFamily}`;
  ctx.fillStyle = item.payload.fillColor || '#000';
  ctx.textAlign = (item.payload.align as CanvasTextAlign) || 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 4; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  if (shouldWrap) {
      const wrapCacheKey = `${content}_${finalSize}_${fontFamily}_${fontStyle}_${availableWidth}`;
      let cachedWrap = textWrapCache.get(wrapCacheKey);
      if (!cachedWrap) {
          const words = content.split(' '); const lines = []; let currentLine = words[0] || '';
          for (let i = 1; i < words.length; i++) {
              const width = ctx.measureText(currentLine + " " + words[i]).width;
              if (width < availableWidth) currentLine += " " + words[i];
              else { lines.push(currentLine); currentLine = words[i]; }
          }
          lines.push(currentLine);
          cachedWrap = { lines, totalHeight: lines.length * (finalSize * 1.2) };
          textWrapCache.set(wrapCacheKey, cachedWrap);
      }
      const { lines, totalHeight } = cachedWrap;
      const startY = item.y + (item.height / 2) - (totalHeight / 2) + ((finalSize * 1.2) / 2);
      ctx.save(); ctx.beginPath(); ctx.rect(item.x, item.y, item.width, item.height); ctx.clip();
      lines.forEach((line, index) => {
          let textX = item.x + item.width / 2;
          if (ctx.textAlign === 'left') textX = item.x + padding;
          if (ctx.textAlign === 'right') textX = item.x + item.width - padding;
          ctx.fillText(line, textX, startY + (index * (finalSize * 1.2)));
      });
      ctx.restore();
  } else {
      let textX = item.x + item.width / 2;
      if (ctx.textAlign === 'left') textX = item.x + padding;
      if (ctx.textAlign === 'right') textX = item.x + item.width - padding;
      ctx.fillText(content, textX, item.y + item.height / 2);
  }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
}
