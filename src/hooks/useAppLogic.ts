import { useState, useRef, useEffect } from 'react';
import { ExportManager, DBManager } from '../utils/ExportManager';
import { CanvasObject, InteractionMode, CanvasRendererRef } from '../types';
import { useUndoRedo } from './useUndoRedo';
import { useContextMenuActions } from './useContextMenuActions';
import { useDeviceInfo } from '../UISettings/deviceInfo';

export function useAppLogic() {
  const [color, setColor] = useState({ h: 0, s: 100, b: 0, alpha: 1.0 });
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState('Pen');
  const [activeTab, setActiveTab] = useState<'paint' | 'insert' | 'export'>('paint');
  const [showGrid, setShowGrid] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [canvasObjects, setCanvasObjects] = useState<CanvasObject[]>([]);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('brush');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [contextMenuState, setContextMenuState] = useState<{ x: number, y: number, targetId: string | null, isOpen: boolean }>({ x: 0, y: 0, targetId: null, isOpen: false });
  const canvasRef = useRef<CanvasRendererRef>(null);
  
  const { undoStack, setUndoStack, currentStateRef, saveStateToUndo, updateCurrentState } = useUndoRedo();
  
  const handleContextMenuAction = useContextMenuActions({ canvasObjects, setCanvasObjects, selectedIds, setSelectedIds, interactionMode, setInteractionMode, saveStateToUndo, updateCurrentState, contextMenuState, setContextMenuState });

  useEffect(() => {
    const handleGlobalClick = () => { if (contextMenuState.isOpen) { setContextMenuState(prev => ({ ...prev, isOpen: false })); if (interactionMode === 'contextMenu') setInteractionMode('brush'); } };
    if (contextMenuState.isOpen) window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenuState.isOpen, interactionMode]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const newUndoStack = [...undoStack]; const poppedState = newUndoStack.pop()!;
    setUndoStack(newUndoStack); setCanvasObjects(poppedState.objects); canvasRef.current?.undo(poppedState.imageDataUrl);
    currentStateRef.current = { imageDataUrl: poppedState.imageDataUrl, objects: poppedState.objects.map(o => ({...o})) };
    if (interactionMode === 'transform') { setSelectedIds([]); setInteractionMode('brush'); }
  };

  const handleClear = () => { saveStateToUndo(); canvasRef.current?.clear(); setCanvasObjects([]); updateCurrentState(null, []); };
  
  const handleSave = async () => { if (currentStateRef.current) { try { await DBManager.saveProject('manual', currentStateRef.current); alert('Project saved successfully!'); } catch (e) { alert('Failed to save project.'); } } };
  
  const handleDownloadPng = () => { const dataUrl = canvasRef.current?.getCurrentData(); if (dataUrl) ExportManager.downloadPng(dataUrl); };
  
  const handleSaveProject = () => {
    const blob = new Blob([JSON.stringify(canvasObjects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.download = 'sketchflow-project.json'; link.href = url;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };
  
  const handleInsertObject = (obj: CanvasObject) => { saveStateToUndo(); const newObjs = [...canvasObjects, obj]; setCanvasObjects(newObjs); updateCurrentState(canvasRef.current?.getCurrentData() || null, newObjs); setSelectedIds([obj.id]); setInteractionMode('transform'); setIsMobileMenuOpen(false); };

  useEffect(() => { const interval = setInterval(async () => { if (currentStateRef.current) try { await DBManager.saveProject('autosave', currentStateRef.current); } catch (e) { } }, 30000); return () => clearInterval(interval); }, [currentStateRef]);
  
  useEffect(() => { const loadAutosave = async () => { try { const saved = await DBManager.loadProject('autosave'); if (saved && saved.imageDataUrl) { currentStateRef.current = saved; setCanvasObjects(saved.objects || []); canvasRef.current?.undo(saved.imageDataUrl); return; } } catch (e) { } if (canvasRef.current && !currentStateRef.current) { const initialData = canvasRef.current.getCurrentData(); if (initialData) currentStateRef.current = { imageDataUrl: initialData, objects: [] }; } }; loadAutosave(); }, [canvasRef, currentStateRef, setCanvasObjects]);

  const deviceInfo = useDeviceInfo();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return {
    color, setColor, customColors, setCustomColors, brushSize, setBrushSize, brushType, setBrushType,
    activeTab, setActiveTab, showGrid, setShowGrid, isMobileMenuOpen, setIsMobileMenuOpen,
    canvasObjects, setCanvasObjects, interactionMode, setInteractionMode, selectedIds, setSelectedIds,
    contextMenuState, setContextMenuState, canvasRef, handleContextMenuAction, handleUndo, handleClear,
    handleSave, handleDownloadPng, handleSaveProject, handleInsertObject, undoStack, saveStateToUndo, updateCurrentState,
    deviceInfo, isInstallable, isInstalled, handleInstallApp
  };
}
