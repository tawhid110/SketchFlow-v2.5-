# SketchFlow Application Handoff Documentation

Welcome to **SketchFlow**, a highly responsive full-stack graphic drawing canvas application optimized for both Desktop and Mobile interfaces. It allows users to paint using procedural brushes, construct vector objects (shapes, images, text), organize elements via groups/layers, and transform (rotate, scale, pan) items with interactive custom overlays.

---

## 1. High-Level App Architecture

SketchFlow is organized as a modular React 18 single-page application bundled via Vite. The core state is separated cleanly into independent custom React hooks, UI panels, layout containers, rendering pipelines, and vector drawing utilities.

```
                  +--------------------------------+
                  |         src/main.tsx           |
                  +---------------+----------------+
                                  |
                                  v
                  +---------------+----------------+
                  |          src/App.tsx           |
                  +---------------+----------------+
                                  |
                  +---------------+---------------+
                  |                               | (Device detection)
                  v                               v
       +----------+-----------+       +-----------+----------+
       | src/UISettings/PcUI  |       | src/UISettings/PhoneUI|
       +----------+-----------+       +-----------+----------+
                  |                               |
                  +---------------+---------------+
                                  | (Loads core canvas controls)
                                  v
                  +---------------+----------------+
                  |  src/components/CanvasRenderer | <---+ (useCanvasCore hook)
                  +---------------+----------------+     |
                                  |                      | (useContextMenuActions hook)
                     +------------+------------+         |
                     |                         |         | (useUndoRedo hook)
                     v                         v         |
     +---------------+---------------+ +-------+-------+ |
     | CanvasObjectOverlay (Resizes/ | | Static HTML5  | |
     | rotates objects interactively)| | Canvas Layers | |
     +-------------------------------+ +---------------+ |
                                                         |
  +------------------------------------------------------+
  |
  v
+------------------+     +------------------+     +------------------+
|    src/hooks/    |     |   src/utils/     |     |   src/types.ts   |
| State management |     | Render Engines,  |     | Shared types,    |
| & active inputs  |     | Brush algorithms |     | interfaces, enums|
+------------------+     +------------------+     +------------------+
```

---

## 2. Directory Structure and Module Responsibilities

### `/src` (Root Files)
*   **`App.tsx`**: The main bootstrap file. It performs device routing, checking whether to mount `PcUI` (desktop) or `PhoneUI` (mobile layout). It initializes the primary state managers and routes them to panels.
*   **`types.ts`**: Holds all TypeScript definitions, structural configurations, interface schemas (`CanvasObject`, `StateSnapshot`, `BrushType`), and callback contracts.
*   **`index.css`**: Configures Tailwind CSS styling rules.
*   **`main.tsx`**: The browser execution entrypoint.

---

### `/src/UISettings` (Layout and Interface Wrappers)
This directory isolates responsive user experiences tailored to screen real estate:
*   **`PcUI.tsx`**: A desktop-friendly, multi-pane drawing studio layout with collapsible side panels, toolbars, and rich keyboard hotkeys.
*   **`PhoneUI.tsx`**: A mobile-optimized touch environment featuring:
    *   **Minimum touch targets of 48px * 48px** on all navigation, tab switching, and operational buttons to prevent accidental clicks.
    *   Responsive sliders and a toggleable panel drawer to maximize drawing canvas workspace.
*   **`deviceInfo.ts`**: Quick helper checks for user-agent flags.

---

### `/src/components` (Reusable React Components)
*   **`CanvasRenderer.tsx`**: The core component containing the layered visual interface. It sandwiches static backdrop layers, active drawing stroke surfaces, guideline meshes, and interactive HTML5 vector overlays.
*   **`ActionBar.tsx`**: Control bar mapping standard operations (Clear, Undo, Save Project, Export PNG).
*   **`ContextMenu.tsx`**: Custom mouse/touch context menu popup containing layer hierarchy actions.

#### `/src/components/canvas` (Active Manipulation Overlay)
*   **`CanvasObjectOverlay.tsx`**: Renders the dynamic bounding boxes that wrap currently active shapes, text, or images. It implements our custom touch and mouse manipulation handlers:
    *   **Single-Balloon Resizing**: Resizing from *any direction/dimension* is aggregated to a single, easily touchable circular handle at the bottom-right corner (`se` corner).
    *   **Rotation Balloon**: A prominent header-balloon at the top of the bounding box that maps absolute pointer offsets to real-time radial coordinates.
    *   **Minimum Target Sizes**: All control balloons are styled with a minimum clickable footprint of **48px * 48px** to guarantee seamless operation on high-density phone displays.

#### `/src/components/panels` (Utility and Drawing Customizers)
*   **`PaintPanel.tsx`**: Mounts paintbrush style toggles and color select sliders.
*   **`ColorPalette.tsx`**: Manages hex colors and custom palette saves.
*   **`BrushControls.tsx`**: Manages brush tip thickness and opacity settings.
*   **`InsertPanel.tsx`**: Enables insertion of dynamic vector layers (Shapes, Text elements, Images).
*   **`ExportPanel.tsx`**: Download formats and backup workflows.

---

### `/src/hooks` (State Management & Reactive Interactivity)
This folder separates business logic from UI rendering:
*   **`useAppLogic.ts`**: The main visual coordinator. It handles object array populations, active selection indexes, layer shifts, custom object property modification, and undo states.
*   **`useCanvasCore.ts`**: Maps low-level pointer, touch, and mouse wheel input into physical operations (panning across the infinite canvas, scaling via pinch-to-zoom, and tracking raw marquee selections).
*   **`useAppHotkeys.ts`**: Listens for system global events (such as `Ctrl+Z`, `Ctrl+Y`, `Del`, `Spacebar` for panning, arrow keys for precision nudges).
*   **`useContextMenuActions.ts`**: Coordinates layer order modifications (e.g., `Send to Back`, `Bring to Front`, grouping items, locking dimensions).
*   **`useUndoRedo.ts`**: Maintains a double-stack array sequence of previous canvas snap states for deep transactional linear history rollbacks.

---

### `/src/utils` (Low-Level Algorithmic Helpers)
*   **`drawObject.ts`**: Contains the canvas drawing functions. Reads an object's properties (type, coordinates, colors, fonts, size, payload, and custom **rotation angle in degrees**) and translates the canvas context matrix (`ctx.translate`, `ctx.rotate`, `ctx.drawImage`) to render shape paths, text, or images under any dynamic orientation.
*   **`drawProceduralStroke.ts`**: Core engine powering dynamic, procedurally generated organic brush tips (like Fur, Spray-paint, Ribbons, Pixels).
*   **`ExportManager.ts`**: Combines vector elements, rotated items, background grids, and raw pixel drawing steps into an offline, high-fidelity PNG stream for output downloading.
*   **`geometryUtils.ts`**: Calculates spatial collision equations, line bounds, and canvas element intersections for point hit-testing.
*   **`textWrapCache.ts`**: Boosts text rendering speeds by caching dynamic wrapping paths and font measurements.
*   **`colorUtils.ts`**: Provides Hex/RGBA conversions and smart contrast matches.

---

## 3. How Modules Connect

1.  **Canvas Pointer Interactivity**: 
    When the user touches/clicks the canvas wrapper in `CanvasRenderer`, pointer events are processed through `useCanvasCore` to extract coordinate deltas.
2.  **Object Transformations (Move, Scale, Rotate)**: 
    *   If an object is selected under *Transform Mode*, `CanvasObjectOverlay` handles the UI balloons.
    *   Dragging the `se` balloon modifies coordinates `x`, `y`, `width`, and `height`.
    *   Dragging the `rotate` balloon calculates `atan2(deltaY, deltaX)` relative to the object's center, scaling the angle output into degrees ($0 \rightarrow 359^\circ$) and assigning it to the object's `rotation` metadata attribute.
    *   This state change dispatches to `useAppLogic` which updates the persistent state, and `drawObject.ts` applies the matrix transformation on the underlying render loop inside `CanvasRenderer`.
3.  **Action Persistence**:
    Any completed stroke, object resize, rotation, or deletion triggers a state push into `useUndoRedo` to maintain snapshot alignment.
