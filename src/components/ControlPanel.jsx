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
  const [scrambleSequence, setScrambleSequence] = useState([])
  const [roundStartCube, setRoundStartCube] = useState(null)
  const [timer, setTimer] = useState(0) // 计时器时间（秒）
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [isTimerFinished, setIsTimerFinished] = useState(false)
  const [showTimerActions, setShowTimerActions] = useState(false)
  const [hasTimerStarted, setHasTimerStarted] = useState(false)
  const [solveMoveCount, setSolveMoveCount] = useState(0)
  const [records, setRecords] = useState([])
  const [hasSavedResult, setHasSavedResult] = useState(false)
  const [isSolved, setIsSolved] = useState(true) // 初始状态为已解决

  const cloneCube = (cube) => JSON.parse(JSON.stringify(cube))

  // 战绩（本地存储）
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rubiks-cube-records')
      if (raw) setRecords(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

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
    // 仅在“确实进行过操作”后，复原时自动停表
    if (solved && isTimerRunning && moveHistory.length > 0) {
      setIsTimerRunning(false)
    }
  }, [cubeState, isTimerRunning, moveHistory.length])

  const scramble = () => {
    setIsAnimating(true)
    const { cube: scrambledCube, sequence } = scrambleCube(initialCube, 20)
    setScrambleSequence(sequence)
    setMoveHistory([])
    setRoundStartCube(scrambledCube)
    // 直接设置最终状态，跳过动画
    setCubeState(scrambledCube)
    setIsSolved(false)
    setIsTimerRunning(false)
    setIsTimerFinished(false)
    setShowTimerActions(false)
    setHasTimerStarted(false)
    setSolveMoveCount(0)
    setHasSavedResult(false)
    setTimer(0)
    setStartTime(null)
    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }

  const startGame = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const { cube: scrambledCube, sequence } = scrambleCube(initialCube, 20)
    setScrambleSequence(sequence)
    setMoveHistory([])
    setRoundStartCube(scrambledCube)
    // 直接设置最终状态，跳过动画
    setCubeState(scrambledCube)
    setIsSolved(false)

    setShowTimerActions(false)
    setSolveMoveCount(0)
    setHasSavedResult(false)
    setIsTimerFinished(false)
    setTimer(0)

    const now = Date.now()
    setStartTime(now)
    setIsTimerRunning(true)
    setHasTimerStarted(true)

    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }

  const reset = () => {
    setIsAnimating(true)
    setCubeState(initialCube)
    setMoveHistory([])
    setScrambleSequence([])
    setRoundStartCube(null)
    setIsSolved(true)
    setIsTimerRunning(false)
    setIsTimerFinished(false)
    setShowTimerActions(false)
    setHasTimerStarted(false)
    setSolveMoveCount(0)
    setHasSavedResult(false)
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
    if (hasTimerStarted) {
      setSolveMoveCount((c) => c + 1)
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

  const startOrResumeTimer = () => {
    const baseMs = timer * 1000
    setStartTime(Date.now() - baseMs)
    setIsTimerRunning(true)
    setHasTimerStarted(true)
    setHasSavedResult(false)
    setIsTimerFinished(false)

    // 如果本轮还没有“初始状态”，以第一次开始计时的状态为准
    if (!roundStartCube) {
      setRoundStartCube(cloneCube(cubeState))
    }
  }

  const handleTimerClick = () => {
    // 正在计时：点击即暂停，并直接展示“继续/完成”
    if (isTimerRunning && !isTimerFinished) {
      setIsTimerRunning(false)
      setShowTimerActions(true)
      return
    }

    // 已展开则再次点击收起
    if (showTimerActions) {
      setShowTimerActions(false)
      return
    }

    // 初始态：直接开始
    if (timer === 0 && !isTimerRunning && !isTimerFinished) {
      startGame()
      return
    }

    // 已经开始过：点击弹出“暂停/继续/完成”选择
    setShowTimerActions(true)
  }

  const pauseTimer = ({ keepActionsOpen = false } = {}) => {
    setIsTimerRunning(false)
    setShowTimerActions(keepActionsOpen)
  }

  const finishTimer = () => {
    setIsTimerRunning(false)
    setIsTimerFinished(true)
    // 直接展示“完成后”的结果面板（保存战绩 / 再来一次 / 下一关）
    setShowTimerActions(true)
  }

  const saveRecord = () => {
    if (timer <= 0) return
    if (hasSavedResult) return

    const record = {
      id: Date.now(),
      timeSeconds: timer,
      moves: solveMoveCount,
      finishedAt: new Date().toISOString(),
      scramble: scrambleSequence
    }
    const next = [record, ...records].slice(0, 20)
    setRecords(next)
    setHasSavedResult(true)
    try {
      localStorage.setItem('rubiks-cube-records', JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const clearRecords = () => {
    setRecords([])
    try {
      localStorage.removeItem('rubiks-cube-records')
    } catch {
      // ignore
    }
  }

  const restartNewRound = (mode) => {
    // mode:
    // - 'same': 恢复本轮初始状态（同一个 scramble）
    // - 'newScramble': 生成新的 scramble
    if (mode === 'newScramble') {
      startGame()
      return
    }

    setIsAnimating(true)
    const base = roundStartCube ? cloneCube(roundStartCube) : cloneCube(cubeState)
    setCubeState(base)
    setMoveHistory([])
    setIsTimerRunning(false)
    setIsTimerFinished(false)
    setShowTimerActions(false)
    setHasTimerStarted(false)
    setSolveMoveCount(0)
    setHasSavedResult(false)
    setTimer(0)
    setStartTime(null)
    setTimeout(() => setIsAnimating(false), 100)
  }

  const restartSameAndStart = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const base = roundStartCube ? cloneCube(roundStartCube) : cloneCube(cubeState)
    setCubeState(base)
    setMoveHistory([])
    setIsTimerFinished(false)
    setShowTimerActions(false)
    setSolveMoveCount(0)
    setHasSavedResult(false)
    setTimer(0)

    const now = Date.now()
    setStartTime(now)
    setIsTimerRunning(true)
    setHasTimerStarted(true)

    setTimeout(() => setIsAnimating(false), 100)
  }

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="control-panel">
      {/* <h2>魔方控制</h2> */}
      {/* 计时器显示 */}
      <div
        className="timer-section"
        role="button"
        tabIndex={0}
        onClick={handleTimerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleTimerClick()
        }}
        aria-label={timer === 0 && !isTimerRunning && !isTimerFinished ? '开始游戏' : '计时选项'}
      >
        <div className={`timer ${isTimerRunning ? 'running' : ''}`}>
          {timer === 0 && !isTimerRunning && !isTimerFinished ? '开始游戏' : formatTime(timer)}
        </div>

        {showTimerActions && (
          <div className="timer-actions" onClick={(e) => e.stopPropagation()}>
            {!isTimerFinished ? (
              <>
                <button
                  type="button"
                  className="timer-action-btn"
                  onClick={() => {
                    if (isTimerRunning) pauseTimer({ keepActionsOpen: true })
                    else {
                      setShowTimerActions(false)
                      startOrResumeTimer()
                    }
                  }}
                >
                  {isTimerRunning ? '暂停' : '继续'}
                </button>
                <button
                  type="button"
                  className="timer-action-btn"
                  onClick={restartSameAndStart}
                >
                  重开
                </button>
                <button
                  type="button"
                  className="timer-action-btn timer-action-finish"
                  onClick={finishTimer}
                >
                  完成
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="timer-action-btn timer-action-save"
                  onClick={saveRecord}
                >
                  {hasSavedResult ? '已保存' : '保存战绩'}
                </button>
                <button
                  type="button"
                  className="timer-action-btn timer-action-finish"
                  onClick={() => restartNewRound('same')}
                >
                  再来一次
                </button>
                <button
                  type="button"
                  className="timer-action-btn"
                  onClick={() => restartNewRound('newScramble')}
                >
                  下一关
                </button>
              </>
            )}
          </div>
        )}

        {isTimerFinished && (
          <div className="solved-message">🎉 恭喜完成！</div>
        )}
      </div>

      <div className="moves-section">
        {/* <h3>旋转操作</h3> */}
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

      {records.length > 0 && (
        <div className="records-section">
          <div className="records-header">
            <h3>战绩</h3>
            <button type="button" className="records-clear" onClick={clearRecords}>
              清空
            </button>
          </div>
          <div className="records-list">
            {records.slice(0, 5).map((r) => (
              <div key={r.id} className="record-item">
                <span className="record-time">{formatTime(r.timeSeconds)}</span>
                <span className="record-meta">步数 {r.moves}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <li>触摸/拖动鼠标旋转视角</li>
          <li>双指/滚轮缩放</li>
        </ul>
      </div>
    </div>
  )
}
