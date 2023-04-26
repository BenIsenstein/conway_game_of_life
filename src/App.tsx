import { useCallback, useEffect, useRef, useState } from 'react'
import { indexFromEvent, useMouseDown, usePaintWithArrowKeys } from 'utils'
import { ArrowKeysModeButton, ToggleOnMoveButton, Cell } from 'components'
import { GameOfLife } from 'models'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface IProps {
  xInit: number
  yInit: number
}

export const App = ({ xInit, yInit }: IProps) => {
  const game = useRef(new GameOfLife(xInit, yInit)).current
  const [updateQueue, setUpdateQueue] = useState(game.updateQueueA)
  const [frameLengthMs, setFrameLengthMs] = useState(80)
  const mouseDown = useMouseDown()
  const arrowKeysState = usePaintWithArrowKeys(game)
  const [ArrowKeysButton, setArrowKeysButton] = useState(null as unknown as JSX.Element)
  const [ToggleMoveButton, setToggleMoveButton] = useState(null as unknown as JSX.Element)

  if (!ArrowKeysButton) {
    setArrowKeysButton(ArrowKeysModeButton(game, arrowKeysState, setArrowKeysButton))
  }
  if (!ToggleMoveButton) {
    setToggleMoveButton(ToggleOnMoveButton(arrowKeysState, setToggleMoveButton))
  }

  const handleCellClick = useCallback((e: React.MouseEvent) => {
    const i = indexFromEvent(e)

    if (arrowKeysState.current.active) {
      if (arrowKeysState.current.cursor !== null) {
        game.enqueueUpdate(arrowKeysState.current.cursor)
      }

      arrowKeysState.current.cursor = i

      if (arrowKeysState.current.toggleOnMove) {
        game.toggleCellAlive(i)
        return
      }

      game.enqueueUpdate(i)
      game.swapUpdateQueues()
      game.runCallbacks()
      return
    }

    game.toggleCellAlive(i)
  }, [])

  const handleCellMouseOver = useCallback((e: React.MouseEvent) => {
    if (mouseDown.current) game.toggleCellAlive(indexFromEvent(e))
  }, [])

  const handleNewFrame = useCallback((game: GameOfLife) => {
    setUpdateQueue(game.updateQueueA)
  }, [])

  const handleSliderChange = useCallback((val: number | number[]) => {
    const newInterval = Array.isArray(val) ? val[0] : val
    game.updateInterval(newInterval)
    setFrameLengthMs(newInterval)
  }, [])

  const gridElements = useRef(
    game.grid.map((cell, i) => Cell(i, arrowKeysState, cell, handleCellClick, handleCellMouseOver))
  ).current

  while (updateQueue.length) {
    const i = game.dequeueUpdate()!
    gridElements[i] = Cell(i, arrowKeysState, game.grid[i], handleCellClick, handleCellMouseOver)
  }

  useEffect(() => {
    game.addCallback(handleNewFrame)

    return () => game.removeCallback(handleNewFrame)
  }, [])

  return (
    <div className="box-border flex flex-col w-screen h-screen p-4 bg-gray-500">
      <div className="flex items-center mb-4">
        <button
          onClick={() => game.start(frameLengthMs)}
          className="mr-2 bg-purple-800 rounded-md text-white p-1"
        >
          START
        </button>
        <button
          onClick={() => game.stop()}
          className="mr-2 bg-purple-800 rounded-md text-white p-1"
        >
          STOP
        </button>
        <button
          onClick={() => {
            game.reset()
            game.addCallback(handleNewFrame)
            game.runCallbacks()
          }}
          className="mr-2 bg-purple-800 rounded-md text-white p-1"
        >
          RESET
        </button>
        <button
          onClick={() => game.runFrame()}
          className="mr-2 bg-purple-800 rounded-md text-white p-1"
        >
          FRAME++
        </button>
        {ArrowKeysButton}
        {ToggleMoveButton}
        <span className="mr-2 text-white">FRAME:&nbsp;{game.currentFrame}&nbsp;|</span>
        <span className="mr-2 text-white">FRAME LENGTH:&nbsp;{frameLengthMs}&nbsp;|</span>
        <Slider
          min={50}
          max={1000}
          step={10}
          value={frameLengthMs}
          onChange={handleSliderChange}
          className="mr-2 w-40"
        />
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${xInit}, 1fr)`,
          gridTemplateRows: `repeat(${yInit}, 1fr)`,
          width: 'min(100vw, 100vh)',
          height: 'min(100vw, 100vh)'
        }}
      >
        {gridElements}
      </div>
    </div>
  )
}
