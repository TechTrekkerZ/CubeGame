# CubeGames AI Coding Guidelines

## Project Overview
CubeGames is a 3D Rubik's Cube interactive game built with React 18, Vite, and Three.js. The application uses `@react-three/fiber` for React-Three.js integration and supports PWA capabilities (currently disabled in vite.config.js).

## Architecture & Data Flow

### State Management Pattern
The cube's complete state lives in [src/App.jsx](src/App.jsx) as a 3D array: `cubeState[x][y][z]` representing a 3×3×3 cube. Each cubelet contains:
```javascript
{ position: [x-1, y-1, z-1], colors: {...}, id: "x-y-z" }
```

Key state properties:
- `cubeState`: 3×3×3 nested array of cubelet objects
- `animationData`: Object tracking current face rotation (face, isPrime, progress, duration, startTime, startCube, endCube)
- `isAnimating`: Boolean to prevent moves during animation

### Component Hierarchy
- **[App.jsx](src/App.jsx)**: Root component managing cube state and animation lifecycle. Uses `useEffect` to complete animation when `animationData` is set, then applies the final state.
- **[RubiksCube.jsx](src/components/RubiksCube.jsx)**: Three.js renderer using `@react-three/fiber`. Splits cubelets into static (non-animating) and animating groups. The animating group rotates around the appropriate axis based on `animationData.face`.
- **[ControlPanel.jsx](src/components/ControlPanel.jsx)**: UI controls for moves, scramble, reset, history, and timer. Calls `performMove()` which returns new cube state and triggers animation.

### Face Color Mapping
[cubeLogic.js](src/utils/cubeLogic.js) defines:
```javascript
FACE_COLORS: { front: red, back: orange, top: yellow, bottom: white, left: green, right: blue }
```
Colors are assigned based on position (x=0→left, x=2→right, y=0→bottom, y=2→top, z=0→back, z=2→front).

## Critical Patterns & Conventions

### Cube State Updates
**Pattern**: Always use `JSON.parse(JSON.stringify(cube))` for deep cloning before mutations:
```javascript
// ✓ Correct in cubeLogic.js
const newCube = JSON.parse(JSON.stringify(cube))
// Modify newCube, return it
```

### Move Notation & Execution
- Standard notation: R, L, U, D, F, B (and prime variants with `'`)
- `performMove(cubeState, moveName)` in [cubeLogic.js](src/utils/cubeLogic.js) returns **new state**, doesn't mutate input
- Animation controlled separately in [App.jsx](src/App.jsx) with 500ms duration via `setAnimationData()`

### Animation Pipeline
1. `ControlPanel` calls `performMove()` → sets `animationData` with face and `isPrime` flag
2. `RubiksCube.useFrame()` reads `animationData`, calculates rotation angle: `progress * (π/2) * (isPrime ? -1 : 1)`
3. When animation completes, `App.useEffect` applies final state and clears animation

### Rotation Logic Details
Each face rotation (R, L, U, D, F, B):
1. Rotates the 3×3 face matrix (inner 2D transformation)
2. Cycles the 4 adjacent edge rows/columns

Example: Right face (x=2) rotates around x-axis; uses y-z plane. See [cubeLogic.js lines 54-106](src/utils/cubeLogic.js#L54-L106).

## Build & Development Workflow

### Essential Commands
```bash
npm run dev        # Start dev server at http://localhost:5173 with hot reload
npm run build      # Vite bundle to dist/ (production optimized)
npm run preview    # Preview production build locally
```

### Build Configuration
- **Base path**: [vite.config.js](vite.config.js) uses `base: '/'` (change to `'/CubeGames/'` for GitHub Pages)
- **PWA plugin**: Currently disabled; uncomment VitePWA in [vite.config.js](vite.config.js) if re-enabling
- **Pixel ratio**: Clamped to 2 in [App.jsx](src/App.jsx) for mobile performance

### Three.js & React Integration
- Use `useFrame()` for per-frame animations (rotation, orbital motion)
- `useRef()` for mesh references; avoid state for every frame update
- `useMemo()` for expensive computations (geometry, materials)
- `OrbitControls` configured in Canvas with `enablePan={false}`, `dampingFactor={0.05}`

## Utilities & Helper Functions

### cubeLogic.js Exports
- `initializeCube()`: Returns solved 3×3×3 cube state
- `rotateFaceClockwise(cube, face)`: Internal; handles face + edge rotation
- `performMove(cube, move)`: Public API; applies move notation
- `scrambleCube(cube, moveCount)`: Returns {cube, sequence} for random scrambles
- `isCubeSolved(cube)`: Checks if cube matches initial state

### localStorage Integration
[App.jsx](src/App.jsx) uses `localStorage` key `'rubiks-cube-state'` to save/load game state. Wrapped in try-catch with user alerts.

## Testing & Validation Hints

- **Cube consistency**: After any move, all 54 sticker positions should be accounted for; no color loss
- **Animation jank**: Check `useFrame()` performance; avoid heavy computation in animation loop
- **Move reversibility**: `move + move'` should restore state (except scrambles which are sequential)
- **Solved detection**: `isCubeSolved()` compares current colors against initial FACE_COLORS mapping

## Integration Points

### External Dependencies
- **@react-three/fiber 8.15.11**: Canvas & useFrame provider
- **@react-three/drei 9.92.7**: OrbitControls, PerspectiveCamera
- **three 0.159.0**: 3D primitives (BoxGeometry, MeshStandardMaterial)
- **vite-plugin-pwa 0.17.4**: PWA support (currently disabled)

### CSS Structure
- [App.css](src/App.css): Canvas container styling
- [ControlPanel.css](src/components/ControlPanel.css): Button layout and animations
- [index.css](src/index.css): Global styles

## Deployment Notes

- **GitHub Pages**: Requires updating `base` in [vite.config.js](vite.config.js) to repository name (e.g., `'/CubeGames/'`)
- **dist/ directory**: Gitignored; generated by `npm run build`
- See [DEPLOY.md](DEPLOY.md) for GitHub Actions and gh-pages manual deployment options

## When Adding Features

1. **New cube move**: Add rotation logic to `rotateFaceClockwise()` + test with `performMove()` tests
2. **UI control**: Add button in [ControlPanel.jsx](src/components/ControlPanel.jsx), wire move via `handleMove()`
3. **3D visualization**: Modify cubelet rendering in `Cubelet()` component or add geometries to `RubiksCube`
4. **Performance**: Profile with DevTools; avoid re-renders in `useFrame()`, memoize expensive computations
5. **State persistence**: Use localStorage pattern in [App.jsx](src/App.jsx) with JSON serialization
