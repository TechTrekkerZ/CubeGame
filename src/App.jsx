import { useState, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import RubiksCube from './components/RubiksCube'
import ControlPanel from './components/ControlPanel'
import { initializeCube } from './utils/cubeLogic'
import './App.css'

function App() {
  const initialCube = useMemo(() => initializeCube(), [])
  const [cubeState, setCubeState] = useState(initialCube)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationData, setAnimationData] = useState(null) // { face, isPrime, progress, duration, startTime, startCube, endCube }

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
          }}
        >
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <RubiksCube
            cubeState={cubeState}
            isAnimating={isAnimating}
            animationData={animationData}
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
        onSaveState={handleSaveState}
        onLoadState={handleLoadState}
      />
    </div>
  )
}

export default App
