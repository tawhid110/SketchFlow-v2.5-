/**
 * Core hook managing canvas interactions.
 * Connects CanvasRenderer to user inputs.
 */
import React, { useState, useRef, useEffect } from 'react';
import { CanvasObject } from '../types';
import { isPointInsideBox } from '../utils/geometryUtils';
import { drawProceduralStroke } from '../utils/drawProceduralStroke';

export function useCanvasCore({ canvasObjects, interactionMode, brushType, brushSize, color, onSelectObjectForTransform, onSelectMultipleObjects, onContextMenuOpen, onStrokeEnd, mainCanvasRef, activeCanvasRef, isMobile }: any) {
  const isDrawing = useRef(false); const hasDragged = useRef(false); const lastPos = useRef<any>(null); const nextPos = useRef<any>(null); const rafId = useRef<any>(null);
  const [marqueeStart, setMarqueeStart] = useState<any>(null); const [marqueeEnd, setMarqueeEnd] = useState<any>(null);
  const [pendingActivationId, setPendingActivationId] = useState<string | null>(null);
  const [touchPoints, setTouchPoints] = useState<any>({});
  const [pan, setPan] = useState({ x: 0, y: 0 }); const [zoom, setZoom] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false); const isPanning = useRef(false); const panStartPos = useRef<any>(null); const initialPan = useRef<any>(null);
  const lastTapRef = useRef<any>(null); const longPressTimer = useRef<any>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect();
      const zf = -e.deltaY * 0.01; const nz = Math.max(0.1, Math.min(zoom * (1 + zf), 10));
      setZoom(nz); setPan({ x: pan.x - ((e.clientX - rect.left) - pan.x) * (nz / zoom - 1), y: pan.y - ((e.clientY - rect.top) - pan.y) * (nz / zoom - 1) });
    } else if (isSpacePressed) { e.preventDefault(); setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY })); }
  };

  useEffect(() => {
    const kdown = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement) return; if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setIsSpacePressed(true); } else if (e.code === 'Digit0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(1); setPan({ x: 0, y: 0 }); } };
    const kup = (e: KeyboardEvent) => { if (e.code === 'Space') { setIsSpacePressed(false); isPanning.current = false; } };
    window.addEventListener('keydown', kdown); window.addEventListener('keyup', kup);
    return () => { window.removeEventListener('keydown', kdown); window.removeEventListener('keyup', kup); };
  }, []);

  const getPos = (e: any) => { const r = activeCanvasRef.current.getBoundingClientRect(); return { x: (e.clientX - r.left) * (activeCanvasRef.current.width / r.width), y: (e.clientY - r.top) * (activeCanvasRef.current.height / r.height) }; };

  const startDrawing = (e: any) => {
    if (interactionMode === 'contextMenu') return;
    if (isSpacePressed) { isPanning.current = true; panStartPos.current = { x: e.clientX, y: e.clientY }; initialPan.current = { ...pan }; e.currentTarget.setPointerCapture(e.pointerId); return; }
    const { x, y } = getPos(e); let hit = null;
    for (let i = canvasObjects.length - 1; i >= 0; i--) { const o = canvasObjects[i]; if (o.visible !== false && !o.locked && isPointInsideBox(x, y, o)) { hit = o; break; } }
    
    lastPos.current = {x,y}; nextPos.current = {x,y}; // Set these early for timer threshold checks
    
    if (interactionMode === 'transform') { 
      if (hit) {
        if (isMobile && (e.pointerType === 'touch' || e.pointerType === 'pen')) {
          setPendingActivationId(hit.id);
          longPressTimer.current = setTimeout(() => { 
            setPendingActivationId(null);
            onSelectObjectForTransform?.(hit.id, e.shiftKey); 
          }, 300);
        } else {
          onSelectObjectForTransform?.(hit.id, e.shiftKey); 
        }
      } else { 
        setMarqueeStart({x,y}); setMarqueeEnd({x,y}); activeCanvasRef.current.setPointerCapture(e.pointerId); 
      }
      return; 
    }
    
    const now = Date.now(); let double = false; if (lastTapRef.current && now - lastTapRef.current.time < 300 && Math.hypot(x - lastTapRef.current.x, y - lastTapRef.current.y) < 20) double = true; lastTapRef.current = { time: now, x, y };
    if (double && hit && !hit.locked) { onSelectObjectForTransform?.(hit.id, e.shiftKey); return; }
    
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      if (hit && !hit.locked && isMobile) setPendingActivationId(hit.id);
      longPressTimer.current = setTimeout(() => { 
        setPendingActivationId(null);
        if (isMobile && hit && !hit.locked) {
          onSelectObjectForTransform?.(hit.id, e.shiftKey);
        } else {
          onContextMenuOpen?.(e.clientX, e.clientY, hit ? hit.id : null); 
        }
        isDrawing.current = false; 
      }, isMobile ? 300 : 600);
    }
    
    activeCanvasRef.current.setPointerCapture(e.pointerId); isDrawing.current = true; hasDragged.current = false; activeCanvasRef.current.getContext('2d')?.clearRect(0, 0, activeCanvasRef.current.width, activeCanvasRef.current.height);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const renderLoop = () => { if (!isDrawing.current) return; if (lastPos.current && nextPos.current && (Math.abs(nextPos.current.x - lastPos.current.x) > 0.1 || Math.abs(nextPos.current.y - lastPos.current.y) > 0.1)) { drawProceduralStroke(activeCanvasRef.current.getContext('2d'), mainCanvasRef.current.getContext('2d', { willReadFrequently: true }), brushType, brushSize, color, lastPos.current.x, lastPos.current.y, nextPos.current.x, nextPos.current.y); lastPos.current = { ...nextPos.current }; } rafId.current = requestAnimationFrame(renderLoop); };
    renderLoop();
  };

  const draw = (e: any) => {
    if (interactionMode === 'contextMenu') return;
    if (isPanning.current && panStartPos.current) { setPan({ x: initialPan.current.x + e.clientX - panStartPos.current.x, y: initialPan.current.y + e.clientY - panStartPos.current.y }); return; }
    if (isSpacePressed) return;
    const { x, y } = getPos(e);
    if (interactionMode === 'transform') { if (marqueeStart) setMarqueeEnd({x,y}); return; }
    if (longPressTimer.current && lastPos.current && Math.hypot(x - lastPos.current.x, y - lastPos.current.y) > 10) { 
      clearTimeout(longPressTimer.current); longPressTimer.current = null; setPendingActivationId(null);
    }
    if (!isDrawing.current) return;
    if (!hasDragged.current && lastPos.current && Math.hypot(x - lastPos.current.x, y - lastPos.current.y) > 2) hasDragged.current = true;
    nextPos.current = {x,y};
  };

  const stopDrawing = (e: any) => {
    if (isPanning.current) { isPanning.current = false; e.currentTarget.releasePointerCapture(e.pointerId); return; }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; setPendingActivationId(null); }
    if (interactionMode === 'transform') {
       if (marqueeStart && marqueeEnd) {
          const [minX, maxX, minY, maxY] = [Math.min(marqueeStart.x, marqueeEnd.x), Math.max(marqueeStart.x, marqueeEnd.x), Math.min(marqueeStart.y, marqueeEnd.y), Math.max(marqueeStart.y, marqueeEnd.y)];
          if (maxX - minX > 2 || maxY - minY > 2) onSelectMultipleObjects?.(canvasObjects.filter((o: any) => o.visible !== false && !o.locked && !(o.x > maxX || o.x + o.width < minX || o.y > maxY || o.y + o.height < minY)).map((o: any) => o.id), e.shiftKey);
          else if (!e.shiftKey) onSelectMultipleObjects?.([], false);
          setMarqueeStart(null); setMarqueeEnd(null); activeCanvasRef.current?.releasePointerCapture(e.pointerId);
       } return;
    }
    if (!isDrawing.current || interactionMode === 'contextMenu') return;
    isDrawing.current = false; activeCanvasRef.current?.releasePointerCapture(e.pointerId); if (rafId.current) cancelAnimationFrame(rafId.current);
    if (!hasDragged.current) { activeCanvasRef.current?.getContext('2d')?.clearRect(0,0,activeCanvasRef.current.width,activeCanvasRef.current.height); return; }
    if (lastPos.current && nextPos.current) drawProceduralStroke(activeCanvasRef.current.getContext('2d'), mainCanvasRef.current.getContext('2d', { willReadFrequently: true }), brushType, brushSize, color, lastPos.current.x, lastPos.current.y, nextPos.current.x, nextPos.current.y);
    const mainCtx = mainCanvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (mainCtx && activeCanvasRef.current) {
      if (brushType !== 'Eraser') { mainCtx.drawImage(activeCanvasRef.current, 0, 0); }
      activeCanvasRef.current.getContext('2d')?.clearRect(0,0,activeCanvasRef.current.width,activeCanvasRef.current.height);
      onStrokeEnd(mainCanvasRef.current.toDataURL('image/png'));
    }
  };

  const handleContextMenu = (e: any) => { e.preventDefault(); const { x, y } = getPos(e); let hit = null; for (let i = canvasObjects.length - 1; i >= 0; i--) { const o = canvasObjects[i]; if (o.visible !== false && !o.locked && isPointInsideBox(x, y, o)) { hit = o; break; } } onContextMenuOpen?.(e.clientX, e.clientY, hit ? hit.id : null); };
  const hTS = (e: any) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') { const r = e.currentTarget.getBoundingClientRect(); setTouchPoints((p: any) => ({ ...p, [e.pointerId]: { x: e.clientX - r.left, y: e.clientY - r.top } })); } };
  const hTM = (e: any) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') { const r = e.currentTarget.getBoundingClientRect(); setTouchPoints((p: any) => p[e.pointerId] ? { ...p, [e.pointerId]: { x: e.clientX - r.left, y: e.clientY - r.top } } : p); } };
  const hTE = (e: any) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') { setTouchPoints((p: any) => { const n = { ...p }; delete n[e.pointerId]; return n; }); } };
  
  return { pan, zoom, isSpacePressed, isPanning, marqueeStart, marqueeEnd, pendingActivationId, touchPoints, handleWheel, startDrawing, draw, stopDrawing, handleContextMenu, hTS, hTM, hTE };
}
