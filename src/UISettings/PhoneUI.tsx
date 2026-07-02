import React from 'react';
import PaintPanel from '../components/panels/PaintPanel';
import InsertPanel from '../components/panels/InsertPanel';
import CanvasRenderer from '../components/CanvasRenderer';
import ActionBar from '../components/ActionBar';
import { ExportPanel } from '../components/panels/ExportPanel';
import { Palette, Layers, Check, Menu, X, Grid3x3, Download } from 'lucide-react';
import { ContextMenu } from '../components/ContextMenu';

export function PhoneUI(props: any) {
  const {
    color, setColor, customColors, setCustomColors, brushSize, setBrushSize, brushType, setBrushType,
    activeTab, setActiveTab, showGrid, setShowGrid, isMobileMenuOpen, setIsMobileMenuOpen,
    canvasObjects, setCanvasObjects, interactionMode, setInteractionMode, selectedIds, setSelectedIds,
    contextMenuState, setContextMenuState, canvasRef, handleContextMenuAction, handleUndo, handleClear,
    handleSave, handleDownloadPng, handleSaveProject, handleInsertObject, undoStack, saveStateToUndo, updateCurrentState,
    isInstallable, isInstalled, handleInstallApp
  } = props;

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center bg-white p-2 shadow-sm z-10 border-b border-gray-200 flex-wrap gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <button className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-md" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMobileMenuOpen((prev: any) => !prev); }}><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-gray-800">SketchFlow (Mobile)</h1>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          {isInstallable && (
            <button
              onClick={handleInstallApp}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-md shadow-sm animate-pulse"
              title="Download SketchFlow App"
            >
              <Download size={20} />
            </button>
          )}
          {interactionMode === 'transform' && ( <button onClick={() => { saveStateToUndo(); setCanvasObjects((prev: any) => { const n = prev.map((o: any) => selectedIds.includes(o.id) ? { ...o, isResizing: false } : o); updateCurrentState(canvasRef.current?.getCurrentData() || null, n); return n; }); setInteractionMode('brush'); setSelectedIds([]); }} className="w-12 h-12 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium rounded-md text-xs"><Check size={24} /></button> )}
          <ActionBar onUndo={handleUndo} onClear={handleClear} onSave={handleSave} canUndo={undoStack.length > 0} />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-2 gap-2 relative min-h-0">
        <ContextMenu state={contextMenuState} canvasObjects={canvasObjects} selectedIds={selectedIds} onAction={handleContextMenuAction} />
        <div className={`${isMobileMenuOpen ? 'flex absolute inset-x-2 top-2 bottom-2 z-50' : 'hidden'} flex-col w-auto shrink-0 h-auto`}>
          <div className="w-full h-full flex flex-col overflow-hidden bg-white rounded-xl border border-gray-200 shadow-xl transition-opacity duration-300 z-20" style={{ opacity: interactionMode === 'transform' ? 0.5 : 1, pointerEvents: interactionMode === 'transform' ? 'none' : 'auto' }}>
            <div className="flex border-b border-gray-200 p-2 gap-1 relative items-center">
              <button onClick={() => setActiveTab('paint')} className={`w-12 h-12 flex items-center justify-center rounded-md text-sm font-medium ${activeTab === 'paint' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Palette size={24} /></button>
              <button onClick={() => setActiveTab('insert')} className={`w-12 h-12 flex items-center justify-center rounded-md text-sm font-medium ${activeTab === 'insert' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Layers size={24} /></button>
              <button onClick={() => setActiveTab('export')} className={`w-12 h-12 flex items-center justify-center rounded-md text-sm font-medium ${activeTab === 'export' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Check size={24} /></button>
              <button className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200 rounded-md shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMobileMenuOpen(false); }}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              {activeTab === 'paint' ? <PaintPanel color={color} brushSize={brushSize} brushType={brushType} customColors={customColors} onColorChange={setColor} onAddCustomColor={(c: any) => !customColors.includes(c) && setCustomColors([...customColors, c])} onRemoveCustomColor={(c: any) => setCustomColors(customColors.filter((cc: any) => cc !== c))} onBrushSizeChange={setBrushSize} onBrushTypeChange={setBrushType} /> : activeTab === 'insert' ? <InsertPanel color={color} onInsertObject={handleInsertObject} /> : <ExportPanel onDownloadPng={handleDownloadPng} onSaveProject={handleSaveProject} isInstallable={isInstallable} isInstalled={isInstalled} onInstallApp={handleInstallApp} />}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-200/50 rounded-xl p-1 relative flex flex-col min-h-0 min-w-0">
          <div className="absolute bottom-2 right-2 z-20 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden text-sm flex">
             <button onClick={() => setShowGrid(!showGrid)} className={`w-12 h-12 flex items-center justify-center ${showGrid ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}><Grid3x3 size={24} /></button>
          </div>
          <CanvasRenderer isMobile={true} ref={canvasRef} brushSize={brushSize} brushType={brushType} color={color} onStrokeEnd={(data: any) => { saveStateToUndo(); updateCurrentState(data, canvasObjects); }} canvasObjects={canvasObjects} interactionMode={interactionMode} selectedIds={selectedIds} showGrid={showGrid} onUpdateCanvasObject={(id: any, u: any) => setCanvasObjects((prev: any) => prev.map((o: any) => o.id === id ? { ...o, ...u } : o))} onUpdateCanvasObjects={(b: any) => setCanvasObjects((prev: any) => { let n = [...prev]; b.forEach(({id, updates}: any) => { const i = n.findIndex((o: any) => o.id === id); if (i !== -1) n[i] = { ...n[i], ...updates }; }); return n; })} onSelectObjectForTransform={(id: any, multi: any) => { const obj = canvasObjects.find((o: any) => o.id === id); if (obj && !obj.locked) { setSelectedIds((prev: any) => { const toAdd = obj.groupId ? canvasObjects.filter((o: any) => o.groupId === obj.groupId).map((o: any) => o.id) : [id]; if (multi) { return prev.includes(id) ? prev.filter((i: any) => !toAdd.includes(i)) : [...new Set([...prev, ...toAdd])]; } return toAdd; }); setInteractionMode('transform'); } }} onSelectMultipleObjects={(ids: any, append: any) => setSelectedIds((prev: any) => append ? Array.from(new Set([...prev, ...ids])) : ids)} onContextMenuOpen={(x: any, y: any, id: any) => { setContextMenuState({ x, y, targetId: id, isOpen: true }); setInteractionMode('contextMenu'); }} />
        </div>
      </div>
    </div>
  );
}
