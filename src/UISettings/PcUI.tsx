import React from 'react';
import PaintPanel from '../components/panels/PaintPanel';
import InsertPanel from '../components/panels/InsertPanel';
import CanvasRenderer from '../components/CanvasRenderer';
import ActionBar from '../components/ActionBar';
import { ExportPanel } from '../components/panels/ExportPanel';
import { Palette, Layers, Check, Grid3x3, Download } from 'lucide-react';
import { ContextMenu } from '../components/ContextMenu';

export function PcUI(props: any) {
  const {
    color, setColor, customColors, setCustomColors, brushSize, setBrushSize, brushType, setBrushType,
    activeTab, setActiveTab, showGrid, setShowGrid, canvasObjects, setCanvasObjects,
    interactionMode, setInteractionMode, selectedIds, setSelectedIds, contextMenuState, setContextMenuState,
    canvasRef, handleContextMenuAction, handleUndo, handleClear, handleSave, handleDownloadPng,
    handleSaveProject, handleInsertObject, undoStack, saveStateToUndo, updateCurrentState,
    isInstallable, isInstalled, handleInstallApp
  } = props;

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center bg-white p-4 shadow-sm z-10 border-b border-gray-200 gap-2">
        <div className="flex items-center gap-3 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">SketchFlow (PC)</h1>
        </div>
        <div className="flex gap-4 items-center shrink-0">
          {isInstallable && (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-md font-semibold shadow-sm hover:shadow-md transition duration-200 cursor-pointer animate-pulse"
              title="Download SketchFlow as a Desktop App"
            >
              <Download size={16} />
              <span>Download App</span>
            </button>
          )}
          {interactionMode === 'transform' && ( <button onClick={() => { saveStateToUndo(); setCanvasObjects((prev: any) => { const n = prev.map((o: any) => selectedIds.includes(o.id) ? { ...o, isResizing: false } : o); updateCurrentState(canvasRef.current?.getCurrentData() || null, n); return n; }); setInteractionMode('brush'); setSelectedIds([]); }} className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md text-base"><Check size={16} /> Apply</button> )}
          <ActionBar onUndo={handleUndo} onClear={handleClear} onSave={handleSave} canUndo={undoStack.length > 0} />
        </div>
      </div>
      <div className="flex flex-row flex-1 p-4 gap-4 relative min-h-0">
        <ContextMenu state={contextMenuState} canvasObjects={canvasObjects} selectedIds={selectedIds} onAction={handleContextMenuAction} />
        <div className={`static flex flex-col w-72 shrink-0 h-full`}>
          <div className="w-full h-full flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm transition-opacity duration-300 z-20" style={{ opacity: interactionMode === 'transform' ? 0.5 : 1, pointerEvents: interactionMode === 'transform' ? 'none' : 'auto' }}>
            <div className="flex border-b border-gray-200 p-2 gap-1 relative items-center">
              <button onClick={() => setActiveTab('paint')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium ${activeTab === 'paint' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Palette size={16} /> <span>Paint</span></button>
              <button onClick={() => setActiveTab('insert')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium ${activeTab === 'insert' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Layers size={16} /> <span>Insert</span></button>
              <button onClick={() => setActiveTab('export')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium ${activeTab === 'export' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}><Check size={16} /> <span>Export</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              {activeTab === 'paint' ? <PaintPanel color={color} brushSize={brushSize} brushType={brushType} customColors={customColors} onColorChange={setColor} onAddCustomColor={(c: any) => !customColors.includes(c) && setCustomColors([...customColors, c])} onRemoveCustomColor={(c: any) => setCustomColors(customColors.filter((cc: any) => cc !== c))} onBrushSizeChange={setBrushSize} onBrushTypeChange={setBrushType} /> : activeTab === 'insert' ? <InsertPanel color={color} onInsertObject={handleInsertObject} /> : <ExportPanel onDownloadPng={handleDownloadPng} onSaveProject={handleSaveProject} isInstallable={isInstallable} isInstalled={isInstalled} onInstallApp={handleInstallApp} />}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-200/50 rounded-xl p-2 relative flex flex-col min-h-0 min-w-0">
          <div className="absolute bottom-4 right-4 z-20 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden text-sm flex">
             <button onClick={() => setShowGrid(!showGrid)} className={`px-3 py-1.5 flex items-center gap-1.5 ${showGrid ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}><Grid3x3 size={16} /> <span>Grid</span></button>
          </div>
          <CanvasRenderer isMobile={false} ref={canvasRef} brushSize={brushSize} brushType={brushType} color={color} onStrokeEnd={(data: any) => { saveStateToUndo(); updateCurrentState(data, canvasObjects); }} canvasObjects={canvasObjects} interactionMode={interactionMode} selectedIds={selectedIds} showGrid={showGrid} onUpdateCanvasObject={(id: any, u: any) => setCanvasObjects((prev: any) => prev.map((o: any) => o.id === id ? { ...o, ...u } : o))} onUpdateCanvasObjects={(b: any) => setCanvasObjects((prev: any) => { let n = [...prev]; b.forEach(({id, updates}: any) => { const i = n.findIndex((o: any) => o.id === id); if (i !== -1) n[i] = { ...n[i], ...updates }; }); return n; })} onSelectObjectForTransform={(id: any, multi: any) => { const obj = canvasObjects.find((o: any) => o.id === id); if (obj && !obj.locked) { setSelectedIds((prev: any) => { const toAdd = obj.groupId ? canvasObjects.filter((o: any) => o.groupId === obj.groupId).map((o: any) => o.id) : [id]; if (multi) { return prev.includes(id) ? prev.filter((i: any) => !toAdd.includes(i)) : [...new Set([...prev, ...toAdd])]; } return toAdd; }); setInteractionMode('transform'); } }} onSelectMultipleObjects={(ids: any, append: any) => setSelectedIds((prev: any) => append ? Array.from(new Set([...prev, ...ids])) : ids)} onContextMenuOpen={(x: any, y: any, id: any) => { setContextMenuState({ x, y, targetId: id, isOpen: true }); setInteractionMode('contextMenu'); }} />
        </div>
      </div>
    </div>
  );
}
