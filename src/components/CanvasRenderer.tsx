/** Main Canvas rendering React component. Connects to useCanvasCore and draw utils. */
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { CanvasObject, CanvasRendererProps, CanvasRendererRef } from '../types';
import { drawCanvasObject } from '../utils/drawObject';
import { CanvasObjectOverlay } from './canvas/CanvasObjectOverlay';
import { useCanvasCore } from '../hooks/useCanvasCore';
import { imageCache } from '../utils/textWrapCache';

const CanvasRenderer = forwardRef<CanvasRendererRef, CanvasRendererProps>(({
  brushType, brushSize, color, onStrokeEnd, canvasObjects = [], interactionMode = 'brush', selectedIds = [],
  showGrid = false, onUpdateCanvasObject, onUpdateCanvasObjects, onSelectObjectForTransform, onSelectMultipleObjects, onContextMenuOpen, isMobile = false, pendingActivationId = null
}, ref) => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null); const activeCanvasRef = useRef<HTMLCanvasElement>(null);
  const staticObjectsCanvasRef = useRef<HTMLCanvasElement>(null); const activeObjectsCanvasRef = useRef<HTMLCanvasElement>(null); const guidesCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoadCount, setImageLoadCount] = useState(0);

  const core = useCanvasCore({ canvasObjects, interactionMode, brushType, brushSize, color, onSelectObjectForTransform, onSelectMultipleObjects, onContextMenuOpen, onStrokeEnd, mainCanvasRef, activeCanvasRef, isMobile });
  
  useEffect(() => {
    let newImagesLoaded = false;
    canvasObjects.forEach(obj => { if (obj.type === 'image' && obj.payload.src && !imageCache.has(obj.payload.src)) { const img = new Image(); img.onload = () => setImageLoadCount(c => c + 1); img.src = obj.payload.src; imageCache.set(obj.payload.src, img); newImagesLoaded = true; } });
  }, [canvasObjects]);

  useImperativeHandle(ref, () => ({
    undo: (dataUrl) => { const c = mainCanvasRef.current?.getContext('2d', { willReadFrequently: true }); if (c && mainCanvasRef.current) { c.clearRect(0,0,mainCanvasRef.current.width,mainCanvasRef.current.height); if (dataUrl) { const img = new Image(); img.onload = () => c.drawImage(img, 0, 0); img.src = dataUrl; } } },
    clear: () => { const m = mainCanvasRef.current; if (m) { m.getContext('2d')?.clearRect(0,0,m.width,m.height); onStrokeEnd(m.toDataURL('image/png')); } },
    save: () => { const m = mainCanvasRef.current; if (m) { const t = document.createElement('canvas'); t.width = m.width; t.height = m.height; const tc = t.getContext('2d'); if (tc) { tc.fillStyle='#fff'; tc.fillRect(0,0,t.width,t.height); canvasObjects.forEach(o => { if (o.visible !== false) drawCanvasObject(tc, o, brushSize); }); tc.drawImage(m, 0, 0); const l = document.createElement('a'); l.download = `sketchflow-${Date.now()}.png`; l.href = t.toDataURL('image/png'); l.click(); } } },
    getCurrentData: () => mainCanvasRef.current?.toDataURL('image/png') || null
  }));

  useEffect(() => {
    const resize = () => { const m = mainCanvasRef.current; const a = activeCanvasRef.current; if (m && a && m.parentElement) { const r = m.parentElement.getBoundingClientRect(); if (m.width !== r.width || m.height !== r.height) { const c = m.getContext('2d', { willReadFrequently: true }); const o = m.toDataURL(); m.width = r.width; m.height = r.height; a.width = r.width; a.height = r.height; if (c) { c.clearRect(0,0,m.width,m.height); const img = new Image(); img.onload = () => c.drawImage(img, 0, 0); img.src = o; } } } };
    resize(); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const [s, a, g] = [staticObjectsCanvasRef.current, activeObjectsCanvasRef.current, guidesCanvasRef.current];
    if (s && a && g && s.parentElement) {
      const r = s.parentElement.getBoundingClientRect();
      if (s.width !== r.width || s.height !== r.height) { s.width = r.width; s.height = r.height; a.width = r.width; a.height = r.height; g.width = r.width; g.height = r.height; }
      const sCtx = s.getContext('2d'); const aCtx = a.getContext('2d');
      if (sCtx) { sCtx.clearRect(0,0,s.width,s.height); if (showGrid) { sCtx.fillStyle = 'rgba(0,0,0,0.15)'; for (let x=0; x<s.width; x+=20) for (let y=0; y<s.height; y+=20) { sCtx.beginPath(); sCtx.arc(x,y,1.5,0,Math.PI*2); sCtx.fill(); } } canvasObjects.forEach(o => { if (o.visible !== false && !selectedIds.includes(o.id)) drawCanvasObject(sCtx, o, brushSize); }); }
      if (aCtx) { aCtx.clearRect(0,0,a.width,a.height); if (interactionMode === 'transform') { canvasObjects.forEach(o => { if (o.visible !== false && selectedIds.includes(o.id)) drawCanvasObject(aCtx, o, brushSize); }); } }
    }
  }, [canvasObjects, selectedIds, interactionMode, brushSize, showGrid, imageLoadCount]);

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-md overflow-hidden" onPointerDownCapture={core.hTS} onPointerMoveCapture={core.hTM} onPointerUpCapture={core.hTE} onPointerCancelCapture={core.hTE} onPointerLeave={core.hTE} onWheel={core.handleWheel} style={{ cursor: core.isSpacePressed ? (core.isPanning.current ? 'grabbing' : 'grab') : undefined }}>
      <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${core.pan.x}px, ${core.pan.y}px) scale(${core.zoom})` }}>
        <canvas ref={staticObjectsCanvasRef} className="absolute inset-0 block touch-none pointer-events-none" />
        <canvas ref={activeObjectsCanvasRef} className="absolute inset-0 block touch-none pointer-events-none" />
        <canvas ref={mainCanvasRef} className="absolute inset-0 block touch-none pointer-events-none" />
        <canvas ref={guidesCanvasRef} className="absolute inset-0 block touch-none pointer-events-none" />
        <canvas ref={activeCanvasRef} className={`absolute inset-0 block touch-none ${core.isSpacePressed ? '' : (interactionMode === 'transform' || interactionMode === 'contextMenu' ? 'cursor-default' : 'cursor-crosshair')}`} onPointerDown={core.startDrawing} onPointerMove={core.draw} onPointerUp={core.stopDrawing} onPointerLeave={core.stopDrawing} onPointerCancel={core.stopDrawing} onContextMenu={core.handleContextMenu} />
        {core.marqueeStart && core.marqueeEnd && interactionMode === 'transform' && !core.isSpacePressed && (<div className="absolute border border-blue-500 bg-blue-500/20 pointer-events-none" style={{ left: Math.min(core.marqueeStart.x, core.marqueeEnd.x), top: Math.min(core.marqueeStart.y, core.marqueeEnd.y), width: Math.abs(core.marqueeEnd.x - core.marqueeStart.x), height: Math.abs(core.marqueeEnd.y - core.marqueeStart.y), zIndex: 9999 }} />)}
        {canvasObjects.map((obj, i) => obj.visible !== false && (
          <CanvasObjectOverlay key={obj.id} item={obj} isActive={interactionMode === 'transform' && selectedIds.includes(obj.id)} isPending={obj.id === core.pendingActivationId} pan={core.pan} brushSize={brushSize} zIndex={i + 10} zoom={core.zoom} onChange={(u) => { if (selectedIds.includes(obj.id)) { const dx = u.x !== undefined ? u.x - obj.x : 0; const dy = u.y !== undefined ? u.y - obj.y : 0; if (dx !== 0 || dy !== 0) { const b: any[] = []; selectedIds.forEach(id => { const t = canvasObjects.find(o => o.id === id); if (t) b.push({id, updates: { x: t.x + dx, y: t.y + dy }}); }); if (onUpdateCanvasObjects) onUpdateCanvasObjects(b); else b.forEach(B => onUpdateCanvasObject?.(B.id, B.updates)); } else onUpdateCanvasObject?.(obj.id, u); } else onUpdateCanvasObject?.(obj.id, u); }} />
        ))}
      </div>
      {Object.entries(core.touchPoints).map(([id, p]: any) => ( <div key={id} className="absolute pointer-events-none z-[9999] rounded-full border-2 border-blue-400 bg-blue-400/30 md:hidden" style={{ left: p.x, top: p.y, width: 48, height: 48, transform: 'translate(-50%, -50%)', boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }}> <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full" style={{ transform: 'translate(-50%, -50%)' }} /> </div> ))}
    </div>
  );
});

export default CanvasRenderer;
