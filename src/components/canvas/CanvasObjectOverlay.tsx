/**
 * Render selection boxes and resize handles.
 * Connects to CanvasRenderer objects.
 */
import React, { useState, useRef, useEffect } from 'react';
import { CanvasObject } from '../../types';

export const CanvasObjectOverlay = ({ item, isActive, isPending = false, pan, brushSize, zIndex, zoom, onChange }: { key?: React.Key, item: CanvasObject, isActive: boolean, isPending?: boolean, pan: {x: number, y: number}, brushSize: number, zIndex: number, zoom: number, onChange: (u: any) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ x: 0, y: 0, w: 0, h: 0, rot: 0, cx: 0, cy: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent, handle?: string) => {
    if (!isActive) return;
    e.stopPropagation(); 
    const rect = ref.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : 0;
    const centerY = rect ? rect.top + rect.height / 2 : 0;
    setStartPos({ x: e.clientX, y: e.clientY }); 
    setStartDim({ x: item.x, y: item.y, w: item.width, h: item.height, rot: item.rotation || 0, cx: centerX, cy: centerY });
    if (handle === 'rotate') { setIsRotating(true); onChange({ isResizing: true }); }
    else if (handle) { setIsResizing(handle); onChange({ isResizing: true }); }
    else setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (isDragging) {
          onChange({ x: startDim.x + (e.clientX - startPos.x) / zoom, y: startDim.y + (e.clientY - startPos.y) / zoom });
        } else if (isResizing) {
          const dx = (e.clientX - startPos.x) / zoom; const dy = (e.clientY - startPos.y) / zoom;
          let { x, y, w, h } = startDim;
          if (isResizing.includes('e')) w += dx;
          if (isResizing.includes('s')) h += dy;
          if (w < 20) w = 20; if (h < 20) h = 20;
          onChange({ x, y, width: w, height: h });
        } else if (isRotating) {
          const { cx, cy } = startDim;
          const initialAngle = Math.atan2(startPos.y - cy, startPos.x - cx);
          const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
          const deltaDegrees = (currentAngle - initialAngle) * (180 / Math.PI);
          onChange({ rotation: (startDim.rot + deltaDegrees + 360) % 360 });
        }
      });
    };
    const handleUp = () => { if (isDragging || isResizing || isRotating) { setIsDragging(false); setIsResizing(null); setIsRotating(false); onChange({ isResizing: false }); } };
    if (isDragging || isResizing || isRotating) { window.addEventListener('pointermove', handleMove); window.addEventListener('pointerup', handleUp); }
    return () => { window.removeEventListener('pointermove', handleMove); window.removeEventListener('pointerup', handleUp); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [isDragging, isResizing, isRotating, startPos, startDim, onChange, item, zoom]);

  return (
    <div ref={ref} className={isPending ? 'animate-pulse' : ''} style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, cursor: isActive ? (isDragging ? 'grabbing' : 'grab') : 'default', border: isActive ? '1px dashed #3b82f6' : (isPending ? '2px solid #3b82f6' : 'none'), boxSizing: 'border-box', touchAction: 'none', pointerEvents: (isActive || isPending) ? 'auto' : 'none', zIndex, transform: `rotate(${item.rotation || 0}deg)` }} onPointerDown={(e) => handlePointerDown(e)}>
      {(isActive && !isPending) && (
        <>
          <div onPointerDown={(e) => handlePointerDown(e, 'se')} style={{ position: 'absolute', width: 48, height: 48, backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '50%', bottom: -24, right: -24, cursor: 'nwse-resize' }} />
          <div onPointerDown={(e) => handlePointerDown(e, 'rotate')} style={{ position: 'absolute', width: 48, height: 48, backgroundColor: '#3b82f6', border: '2px solid #fff', borderRadius: '50%', top: -60, left: '50%', marginLeft: -24, cursor: 'grab' }} />
        </>
      )}
    </div>
  );
};
