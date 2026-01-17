import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'

const COLORS = {
  white: '#ffffff',
  yellow: '#ffd700',
  red: '#ff0000',
  orange: '#ff8800',
  green: '#00ff00',
  blue: '#0000ff',
  black: '#1a1a1a'
}

// 创建单个小方块
function Cubelet({ position, colors, onDoubleClick }) {
  const { size } = useThree()

  const geometry = useMemo(() => new THREE.BoxGeometry(0.9, 0.9, 0.9), [])

  const thickEdges = useMemo(() => {
    const edges = new THREE.EdgesGeometry(geometry, 1)
    const g = new LineSegmentsGeometry()
    g.setPositions(edges.attributes.position.array)

    const m = new LineMaterial({
      color: new THREE.Color('#111111'),
      transparent: true,
      opacity: 0.95,
      // NOTE: this is in screen-space (px) when resolution is set
      linewidth: 9.5
    })

    const line = new LineSegments2(g, m)
    line.computeLineDistances()
    line.scale.set(1.01, 1.01, 1.01)
    return { line, material: m, geometry: g, edges }
  }, [geometry])

  useEffect(() => {
    thickEdges.material.resolution.set(size.width, size.height)
  }, [size.width, size.height, thickEdges])

  useEffect(() => {
    return () => {
      thickEdges.geometry.dispose()
      thickEdges.edges.dispose()
      thickEdges.material.dispose()
    }
  }, [thickEdges])

  const materials = useMemo(() => {
    const makeMat = (color) =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: 0,
        roughness: 0.9,
        emissive: color,
        emissiveIntensity: 0.08
      })

    return [
      makeMat(colors.right || COLORS.black), // right
      makeMat(colors.left || COLORS.black), // left
      makeMat(colors.top || COLORS.black), // top
      makeMat(colors.bottom || COLORS.black), // bottom
      makeMat(colors.front || COLORS.black), // front
      makeMat(colors.back || COLORS.black) // back
    ]
  }, [colors])

  return (
    <group position={position}>
      <mesh
        geometry={geometry}
        material={materials}
        castShadow
        receiveShadow
        onDoubleClick={onDoubleClick}
      />
      <primitive object={thickEdges.line} />
    </group>
  )
}

const getFaceCenterNormal = (position) => {
  const [x, y, z] = position
  // 面中心块：一个坐标为 ±1，另外两个为 0
  if (x === 1 && y === 0 && z === 0) return [1, 0, 0]
  if (x === -1 && y === 0 && z === 0) return [-1, 0, 0]
  if (x === 0 && y === 1 && z === 0) return [0, 1, 0]
  if (x === 0 && y === -1 && z === 0) return [0, -1, 0]
  if (x === 0 && y === 0 && z === 1) return [0, 0, 1]
  if (x === 0 && y === 0 && z === -1) return [0, 0, -1]
  return null
}

// 获取某个面上需要旋转的cubelets
const getFaceCubelets = (face, cubeState) => {
  const faceCubelets = []
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (x === 1 && y === 1 && z === 1) continue // 跳过中心块

        let isOnFace = false
        switch (face) {
          case 'R': isOnFace = (x === 2); break
          case 'L': isOnFace = (x === 0); break
          case 'U': isOnFace = (y === 2); break
          case 'D': isOnFace = (y === 0); break
          case 'F': isOnFace = (z === 2); break
          case 'B': isOnFace = (z === 0); break
        }

        if (isOnFace) {
          faceCubelets.push({
            cubelet: cubeState[x][y][z],
            coords: [x, y, z]
          })
        }
      }
    }
  }
  return faceCubelets
}

export default function RubiksCube({ cubeState, isAnimating, animationData, onSetLogicalFront }) {
  const faceGroupRef = useRef()

  // 让动画旋转方向与 cubeLogic 的 MOVE_CONFIG 保持一致：
  // 正法向面的顺时针为 -90°（R/U/F），负法向面为 +90°（L/D/B）
  const faceDirection = animationData
    ? ({ R: -1, L: 1, U: -1, D: 1, F: -1, B: 1 }[animationData.face] ?? 1)
    : 1

  useFrame(() => {
    // 处理旋转动画
    if (animationData && faceGroupRef.current) {
      const elapsed = Date.now() - animationData.startTime
      const progress = Math.min(elapsed / animationData.duration, 1)
      const angle = progress * (Math.PI / 2) * faceDirection * (animationData.isPrime ? -1 : 1)

      // 根据面设置旋转轴
      switch (animationData.face) {
        case 'R':
        case 'L':
          faceGroupRef.current.rotation.set(angle, 0, 0)
          break
        case 'U':
        case 'D':
          faceGroupRef.current.rotation.set(0, angle, 0)
          break
        case 'F':
        case 'B':
          faceGroupRef.current.rotation.set(0, 0, angle)
          break
      }
    } else if (faceGroupRef.current) {
      faceGroupRef.current.rotation.set(0, 0, 0)
    }
  })

  const { staticCubelets, animatingCubelets } = useMemo(() => {
    if (!cubeState) return { staticCubelets: [], animatingCubelets: [] }

    const staticCubeletsArr = []
    const animatingCubeletsArr = []

    if (animationData) {
      const faceCubelets = getFaceCubelets(animationData.face, cubeState)
      const faceIds = new Set(faceCubelets.map(item => item.cubelet.id))

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            if (x === 1 && y === 1 && z === 1) continue
            const cubelet = cubeState[x][y][z]

            if (faceIds.has(cubelet.id)) {
              animatingCubeletsArr.push(
                <Cubelet
                  key={cubelet.id}
                  position={cubelet.position}
                  colors={cubelet.colors}
                />
              )
            } else {
              const normal = getFaceCenterNormal(cubelet.position)
              staticCubeletsArr.push(
                <Cubelet
                  key={cubelet.id}
                  position={cubelet.position}
                  colors={cubelet.colors}
                  onDoubleClick={(e) => {
                    if (!normal) return
                    e.stopPropagation()
                    onSetLogicalFront?.(normal)
                  }}
                />
              )
            }
          }
        }
      }
    } else {
      // 没有动画时，所有cubelets都是静态的
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            if (x === 1 && y === 1 && z === 1) continue
            const cubelet = cubeState[x][y][z]
            const normal = getFaceCenterNormal(cubelet.position)
            staticCubeletsArr.push(
              <Cubelet
                key={cubelet.id}
                position={cubelet.position}
                colors={cubelet.colors}
                onDoubleClick={(e) => {
                  if (!normal) return
                  e.stopPropagation()
                  onSetLogicalFront?.(normal)
                }}
              />
            )
          }
        }
      }
    }

    return { staticCubelets: staticCubeletsArr, animatingCubelets: animatingCubeletsArr }
  }, [cubeState, animationData])

  return (
    <group>
      {staticCubelets}
      <group ref={faceGroupRef}>
        {animatingCubelets}
      </group>
    </group>
  )
}
