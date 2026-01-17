import { useState, useEffect } from 'react'
import { performMove, scrambleCube, isCubeSolved } from '../utils/cubeLogic'
import './ControlPanel.css'

const MOVES = {
  'R': '右面顺时针',
  "R'": '右面逆时针',
  'L': '左面顺时针',
  "L'": '左面逆时针',
  'U': '上面顺时针',
  "U'": '上面逆时针',
  'D': '下面顺时针',
  "D'": '下面逆时针',
  'F': '前面顺时针',
  "F'": '前面逆时针',
  'B': '后面顺时针',
  "B'": '后面逆时针'
}

export default function ControlPanel({ cubeState, setCubeState, setIsAnimating, setAnimationData, initialCube, isAnimating, onSaveState, onLoadState }) {
  const [moveHistory, setMoveHistory] = useState([])
  const [timer, setTimer] = useState(0) // 计时器时间（秒）
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [isSolved, setIsSolved] = useState(true) // 初始状态为已解决

  // 计时器逻辑
  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000))
      }, 100)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, startTime])

  // 检查魔方是否已解决
  useEffect(() => {
    const solved = isCubeSolved(cubeState)
    setIsSolved(solved)
    if (solved && isTimerRunning) {
      setIsTimerRunning(false)
    }
  }, [cubeState, isTimerRunning])

  const scramble = () => {
    setIsAnimating(true)
    const { cube: scrambledCube, sequence } = scrambleCube(cubeState, 20)
    setMoveHistory(sequence)
    // 直接设置最终状态，跳过动画
    setCubeState(scrambledCube)
    setIsSolved(false)
    setIsTimerRunning(false)
    setTimer(0)
    setStartTime(null)
    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }

  const reset = () => {
    setIsAnimating(true)
    setCubeState(initialCube)
    setMoveHistory([])
    setIsSolved(true)
    setIsTimerRunning(false)
    setTimer(0)
    setStartTime(null)
    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }

  const handleMove = (move) => {
    if (isAnimating) return

    setIsAnimating(true)
    const newCube = performMove(cubeState, move)
    setMoveHistory([...moveHistory, move])

    // 如果这是第一次移动且魔方未解决，启动计时器
    if (!isTimerRunning && !isSolved && moveHistory.length === 0) {
      setStartTime(Date.now())
      setIsTimerRunning(true)
    }

    // 启动动画
    setAnimationData({
      face: move.replace("'", ""),
      isPrime: move.endsWith("'"),
      progress: 0,
      duration: 500, // 500ms 动画
      startTime: Date.now(),
      startCube: cubeState,
      endCube: newCube
    })
  }

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="control-panel">
      <h2>魔方控制</h2>

      <div className="moves-section">
        <h3>旋转操作</h3>
        <div className="moves-pad">
          <button
            onClick={() => handleMove('U')}
            className="btn btn-move move-u"
            disabled={isAnimating}
            aria-label={MOVES['U']}
          >
            U
            <span className="move-label">{MOVES['U']}</span>
          </button>
          <button
            onClick={() => handleMove("U'")}
            className="btn btn-move move-up"
            disabled={isAnimating}
            aria-label={MOVES["U'"]}
          >
            U'
            <span className="move-label">{MOVES["U'"]}</span>
          </button>

          <button
            onClick={() => handleMove('L')}
            className="btn btn-move move-l"
            disabled={isAnimating}
            aria-label={MOVES['L']}
          >
            L
            <span className="move-label">{MOVES['L']}</span>
          </button>
          <button
            onClick={() => handleMove("L'")}
            className="btn btn-move move-lp"
            disabled={isAnimating}
            aria-label={MOVES["L'"]}
          >
            L'
            <span className="move-label">{MOVES["L'"]}</span>
          </button>

          <button
            onClick={() => handleMove('R')}
            className="btn btn-move move-r"
            disabled={isAnimating}
            aria-label={MOVES['R']}
          >
            R
            <span className="move-label">{MOVES['R']}</span>
          </button>
          <button
            onClick={() => handleMove("R'")}
            className="btn btn-move move-rp"
            disabled={isAnimating}
            aria-label={MOVES["R'"]}
          >
            R'
            <span className="move-label">{MOVES["R'"]}</span>
          </button>

          <button
            onClick={() => handleMove('F')}
            className="btn btn-move move-f"
            disabled={isAnimating}
            aria-label={MOVES['F']}
          >
            F
            <span className="move-label">{MOVES['F']}</span>
          </button>
          <button
            onClick={() => handleMove("F'")}
            className="btn btn-move move-fp"
            disabled={isAnimating}
            aria-label={MOVES["F'"]}
          >
            F'
            <span className="move-label">{MOVES["F'"]}</span>
          </button>

          <button
            onClick={() => handleMove('B')}
            className="btn btn-move move-b"
            disabled={isAnimating}
            aria-label={MOVES['B']}
          >
            B
            <span className="move-label">{MOVES['B']}</span>
          </button>
          <button
            onClick={() => handleMove("B'")}
            className="btn btn-move move-bp"
            disabled={isAnimating}
            aria-label={MOVES["B'"]}
          >
            B'
            <span className="move-label">{MOVES["B'"]}</span>
          </button>

          <button
            onClick={() => handleMove('D')}
            className="btn btn-move move-d"
            disabled={isAnimating}
            aria-label={MOVES['D']}
          >
            D
            <span className="move-label">{MOVES['D']}</span>
          </button>
          <button
            onClick={() => handleMove("D'")}
            className="btn btn-move move-dp"
            disabled={isAnimating}
            aria-label={MOVES["D'"]}
          >
            D'
            <span className="move-label">{MOVES["D'"]}</span>
          </button>
        </div>
      </div>

      {/* 计时器显示 */}
      <div className="timer-section">
        <div className={`timer ${isSolved ? 'solved' : ''} ${isTimerRunning ? 'running' : ''}`}>
          {formatTime(timer)}
        </div>
        {isSolved && timer > 0 && (
          <div className="solved-message">🎉 恭喜完成！</div>
        )}
      </div>

      <div className="button-group">
        <button
          onClick={scramble}
          className="btn btn-primary"
          disabled={isAnimating}
        >
          打乱魔方
        </button>
        <button
          onClick={reset}
          className="btn btn-secondary"
          disabled={isAnimating}
        >
          重置
        </button>
      </div>

      <div className="button-group">
        <button
          onClick={onSaveState}
          className="btn btn-save"
          disabled={isAnimating}
        >
          💾 保存状态
        </button>
        <button
          onClick={onLoadState}
          className="btn btn-load"
          disabled={isAnimating}
        >
          📁 加载状态
        </button>
      </div>

      {moveHistory.length > 0 && (
        <div className="history-section">
          <h3>操作历史</h3>
          <div className="history-list">
            {moveHistory.map((move, index) => (
              <span key={index} className="history-item">
                {move}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <p>💡 提示：</p>
        <ul>
          <li>拖动鼠标/触摸旋转视角</li>
          <li>滚轮/双指缩放</li>
          <li>点击按钮旋转魔方</li>
          <li className="mobile-only">📱 移动端优化体验</li>
        </ul>
      </div>
    </div>
  )
}
