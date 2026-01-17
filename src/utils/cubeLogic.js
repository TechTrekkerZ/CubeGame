// 魔方旋转逻辑

const COLORS = {
  white: '#ffffff',
  yellow: '#ffd700',
  red: '#ff0000',
  orange: '#ff8800',
  green: '#00ff00',
  blue: '#0000ff',
  black: '#1a1a1a'
}

const FACE_COLORS = {
  front: COLORS.red,
  back: COLORS.orange,
  top: COLORS.yellow,
  bottom: COLORS.white,
  left: COLORS.green,
  right: COLORS.blue
}

const FACE_NORMALS = {
  right: [1, 0, 0],
  left: [-1, 0, 0],
  top: [0, 1, 0],
  bottom: [0, -1, 0],
  front: [0, 0, 1],
  back: [0, 0, -1]
}

const MOVE_CONFIG = {
  R: { axis: 'x', layer: 1, direction: -1 },
  L: { axis: 'x', layer: -1, direction: 1 },
  U: { axis: 'y', layer: 1, direction: -1 },
  D: { axis: 'y', layer: -1, direction: 1 },
  F: { axis: 'z', layer: 1, direction: -1 },
  B: { axis: 'z', layer: -1, direction: 1 }
}

function rotateVector(vec, axis, angleSign) {
  const [x, y, z] = vec

  switch (axis) {
    case 'x':
      return angleSign === 1 ? [x, -z, y] : [x, z, -y]
    case 'y':
      return angleSign === 1 ? [z, y, -x] : [-z, y, x]
    case 'z':
      return angleSign === 1 ? [-y, x, z] : [y, -x, z]
    default:
      return vec
  }
}

function findFaceByNormal(normal) {
  return Object.keys(FACE_NORMALS).find(key => {
    const ref = FACE_NORMALS[key]
    return ref[0] === normal[0] && ref[1] === normal[1] && ref[2] === normal[2]
  })
}

function rotateCubeletColors(cubelet, axis, angleSign) {
  const newColors = {}

  for (const [face, color] of Object.entries(cubelet.colors)) {
    const normal = FACE_NORMALS[face]
    if (!normal) {
      newColors[face] = color
      continue
    }

    const rotated = rotateVector(normal, axis, angleSign)
    const newFace = findFaceByNormal(rotated) || face
    newColors[newFace] = color
  }

  cubelet.colors = newColors
}

function rotatePosition(position, axis, angleSign) {
  const [x, y, z] = position

  switch (axis) {
    case 'x':
      return [x, angleSign === 1 ? -z : z, angleSign === 1 ? y : -y]
    case 'y':
      return [angleSign === 1 ? z : -z, y, angleSign === 1 ? -x : x]
    case 'z':
      return [angleSign === 1 ? -y : y, angleSign === 1 ? x : -x, z]
    default:
      return position
  }
}

function getAxisValue(position, axis) {
  switch (axis) {
    case 'x':
      return position[0]
    case 'y':
      return position[1]
    case 'z':
      return position[2]
    default:
      return 0
  }
}

function positionToIndices(position) {
  return position.map(coord => coord + 1)
}

function createEmptyCube() {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => Array(3).fill(null))
  )
}

// 初始化魔方状态（3x3x3）
export function initializeCube() {
  const cube = []
  for (let x = 0; x < 3; x++) {
    cube[x] = []
    for (let y = 0; y < 3; y++) {
      cube[x][y] = []
      for (let z = 0; z < 3; z++) {
        const colors = {}

        if (x === 0) colors.left = FACE_COLORS.left
        if (x === 2) colors.right = FACE_COLORS.right
        if (y === 0) colors.bottom = FACE_COLORS.bottom
        if (y === 2) colors.top = FACE_COLORS.top
        if (z === 0) colors.back = FACE_COLORS.back
        if (z === 2) colors.front = FACE_COLORS.front

        cube[x][y][z] = {
          position: [x - 1, y - 1, z - 1],
          colors,
          id: `${x}-${y}-${z}`
        }
      }
    }
  }
  return cube
}

// 旋转一个面的小方块（顺时针90度）
function rotateFaceClockwise(cube, face) {
  const config = MOVE_CONFIG[face]
  if (!config) return cube

  const { axis, layer, direction } = config
  const rotatedCube = createEmptyCube()

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const cubelet = JSON.parse(JSON.stringify(cube[x][y][z]))

        if (getAxisValue(cubelet.position, axis) === layer) {
          cubelet.position = rotatePosition(cubelet.position, axis, direction)
          rotateCubeletColors(cubelet, axis, direction)
        }

        const [nx, ny, nz] = positionToIndices(cubelet.position)
        rotatedCube[nx][ny][nz] = cubelet
      }
    }
  }

  return rotatedCube
}

// 执行魔方移动
export function performMove(cube, move) {
  let newCube = cube

  if (move.endsWith("'")) {
    const face = move[0]
    newCube = rotateFaceClockwise(newCube, face)
    newCube = rotateFaceClockwise(newCube, face)
    newCube = rotateFaceClockwise(newCube, face)
  } else {
    newCube = rotateFaceClockwise(newCube, move)
  }

  return newCube
}

// 打乱魔方
// 规则：通过“合法转动序列”来生成打乱结果，因此（从可复原状态出发）一定可复原。
// 额外约束：避免连续同面、避免立刻执行上一步的逆操作，让打乱更自然。
export function scrambleCube(cube, numMoves = 20) {
  const allMoves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"]
  let scrambledCube = JSON.parse(JSON.stringify(cube))
  const scrambleSequence = []

  const inverseMove = (move) => (move.endsWith("'") ? move[0] : `${move}'`)
  const moveFace = (move) => move[0]
  const moveAxis = (move) => MOVE_CONFIG[moveFace(move)]?.axis

  let prevMove = null
  let prevFace = null
  let prevAxis = null

  for (let i = 0; i < numMoves; i++) {
    let candidates = allMoves

    if (prevFace) {
      candidates = candidates.filter(m => moveFace(m) !== prevFace)
    }

    if (prevMove) {
      const inv = inverseMove(prevMove)
      candidates = candidates.filter(m => m !== inv)
    }

    // 轴去重不是必须，但能减少“来回拧同一根轴”的观感。
    // 如果过滤后没得选，就回退到只做“同面/逆操作”过滤。
    const axisFiltered = prevAxis
      ? candidates.filter(m => moveAxis(m) !== prevAxis)
      : candidates
    if (axisFiltered.length > 0) {
      candidates = axisFiltered
    }

    const randomMove = candidates[Math.floor(Math.random() * candidates.length)]
    scrambledCube = performMove(scrambledCube, randomMove)
    scrambleSequence.push(randomMove)

    prevMove = randomMove
    prevFace = moveFace(randomMove)
    prevAxis = moveAxis(randomMove)
  }

  return { cube: scrambledCube, sequence: scrambleSequence }
}

// 检查魔方是否已解决
export function isCubeSolved(cube) {
  const solvedCube = initializeCube()

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        const currentColors = cube[x][y][z].colors
        const solvedColors = solvedCube[x][y][z].colors

        for (const face in currentColors) {
          if (currentColors[face] !== solvedColors[face]) {
            return false
          }
        }
      }
    }
  }

  return true
}
