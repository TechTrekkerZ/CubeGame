import { useState, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import RubiksCube from './components/RubiksCube'
import ControlPanel from './components/ControlPanel'
import { initializeCube } from './utils/cubeLogic'
import './App.css'

const V = {
  XP: [1, 0, 0],
  XN: [-1, 0, 0],
  YP: [0, 1, 0],
  YN: [0, -1, 0],
  ZP: [0, 0, 1],
  ZN: [0, 0, -1]
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
]
const sameVec = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

const WORLD_DIRS = [V.XP, V.XN, V.YP, V.YN, V.ZP, V.ZN]

const generateOrientations = () => {
  const orientations = []
  for (const right of WORLD_DIRS) {
    for (const up of WORLD_DIRS) {
      if (dot(right, up) !== 0) continue
      const front = cross(right, up)
      // right x up must be a valid cardinal direction
      const isCardinal = WORLD_DIRS.some((d) => sameVec(d, front))
      if (!isCardinal) continue
      orientations.push({ right, up, front })
    }
  }
  return orientations
}

const ALL_ORIENTATIONS = generateOrientations()

const DEFAULT_ORIENTATION = { right: V.XP, up: V.YP, front: V.ZP }

const pickOrientationWithFront = (current, newFront) => {
  let best = null
  let bestScore = -Infinity
  let bestScore2 = -Infinity

  for (const o of ALL_ORIENTATIONS) {
    if (!sameVec(o.front, newFront)) continue
    const score = dot(o.up, current.up) // preserve current up as much as possible
    const score2 = dot(o.right, current.right)
    if (score > bestScore || (score === bestScore && score2 > bestScore2)) {
      best = o
      bestScore = score
      bestScore2 = score2
    }
  }

  return best || current
}

function App() {
  const initialCube = useMemo(() => initializeCube(), [])
  const [cubeState, setCubeState] = useState(initialCube)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationData, setAnimationData] = useState(null) // { face, isPrime, progress, duration, startTime, startCube, endCube }

  // 逻辑朝向（不改变视觉渲染，只影响按钮对应的转动面）
  const [orientation, setOrientation] = useState(DEFAULT_ORIENTATION)

  const handleSetLogicalFront = (worldNormal) => {
    if (sameVec(worldNormal, V.YP)) {
      alert('这是顶面无法置为正面，换一个面吧')
      return
    }
    if (sameVec(worldNormal, V.YN)) {
      alert('这是底面无法置为正面，换一个面吧')
      return
    }
    setOrientation((prev) => pickOrientationWithFront(prev, worldNormal))
  }

  // 处理动画结束
  useEffect(() => {
    if (animationData) {
      const timer = setTimeout(() => {
        setCubeState(animationData.endCube)
        setAnimationData(null)
        setIsAnimating(false)
      }, animationData.duration)

      return () => clearTimeout(timer)
    }
  }, [animationData])

  // 保存魔方状态到localStorage
  const handleSaveState = () => {
    try {
      const gameState = {
        cubeState,
        timestamp: Date.now()
      }
      localStorage.setItem('rubiks-cube-state', JSON.stringify(gameState))
      alert('魔方状态已保存！')
    } catch (error) {
      alert('保存失败：' + error.message)
    }
  }

  // 从localStorage加载魔方状态
  const handleLoadState = () => {
    try {
      const savedState = localStorage.getItem('rubiks-cube-state')
      if (savedState) {
        const gameState = JSON.parse(savedState)
        setCubeState(gameState.cubeState)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 100)
        alert('魔方状态已加载！')
      } else {
        alert('没有找到保存的状态')
      }
    } catch (error) {
      alert('加载失败：' + error.message)
    }
  }

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          onCreated={({ gl }) => {
            // 改善移动端渲染
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            // 整体提亮：启用更友好的 tone mapping 并提高曝光
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.0
          }}
        >
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          {/* 更均匀的补光，让六个面亮度更接近 */}
          <ambientLight intensity={0.75} />
          <hemisphereLight intensity={0.45} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, 10, -5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.25} />
          <RubiksCube
            cubeState={cubeState}
            isAnimating={isAnimating}
            animationData={animationData}
            onSetLogicalFront={handleSetLogicalFront}
          />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={10}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            touchAction='none'
          />
        </Canvas>
      </div>
      <ControlPanel
        cubeState={cubeState}
        setCubeState={setCubeState}
        setIsAnimating={setIsAnimating}
        setAnimationData={setAnimationData}
        initialCube={initialCube}
        isAnimating={isAnimating}
        orientation={orientation}
        onSaveState={handleSaveState}
        onLoadState={handleLoadState}
      />
    </div>
  )
}

export default App
