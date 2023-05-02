import { useCallback, useEffect, useRef, useState } from 'react'
import { indexFromEvent, useMouseDown, usePaintWithArrowKeys } from 'utils'
import { ArrowKeysModeButton, PaintOnMoveButton, Cell } from 'components'
import { GameOfLife } from 'models'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { WrappedWorldButton } from 'components/WrappedWorldButton'

interface IProps {
  xInit: number
  yInit: number
}

const REPO_URL = 'https://github.com/BenIsenstein/conway_game_of_life'

export const GameOfLifeReact = ({ xInit, yInit }: IProps) => {
  const game = useRef(new GameOfLife(xInit, yInit)).current
  const [updateQueue, setUpdateQueue] = useState(game.updateStack)
  const [frameLengthMs, setFrameLengthMs] = useState(game.frameLengthMs)
  const mouseDown = useMouseDown()
  const arrowKeysState = usePaintWithArrowKeys(game)
  const [ArrowKeysButton, setArrowKeysButton] = useState(null as unknown as JSX.Element)
  const [PaintMoveButton, setPaintMoveButton] = useState(null as unknown as JSX.Element)
  const [WrapWorldButton, setWrapWorldButton] = useState(null as unknown as JSX.Element)

  if (!ArrowKeysButton && !PaintMoveButton && !WrapWorldButton) {
    setArrowKeysButton(ArrowKeysModeButton(game, arrowKeysState, setArrowKeysButton))
    setPaintMoveButton(PaintOnMoveButton(arrowKeysState, setPaintMoveButton))
    setWrapWorldButton(WrappedWorldButton(game, setWrapWorldButton))
  }

  const handleCellClick = useCallback((e: React.MouseEvent) => {
    const i = indexFromEvent(e)

    if (arrowKeysState.current.active) {
      game.pushUpdate(arrowKeysState.current.cursor)
      arrowKeysState.current.cursor = i

      if (arrowKeysState.current.paintOnMove) {
        game.toggleCellAlive(i)
        return
      }

      game.pushUpdate(i)
      game.swapUpdateStacks()
      game.runCallbacks()
      return
    }

    game.toggleCellAlive(i)
  }, [])

  const handleCellMouseOver = useCallback((e: React.MouseEvent) => {
    if (mouseDown.current) {
      game.toggleCellAlive(indexFromEvent(e))
    }
  }, [])

  const handleNewFrame = useCallback((game: GameOfLife) => {
    setUpdateQueue(game.updateStack)
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
    const i = game.popUpdate()!
    gridElements[i] = Cell(i, arrowKeysState, game.grid[i], handleCellClick, handleCellMouseOver)
  }

  useEffect(() => {
    game.addCallback(handleNewFrame)

    return () => game.removeCallback(handleNewFrame)
  }, [])

  return (
    <div className="box-border flex w-screen h-screen gap-3 p-4 bg-gray-400">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${xInit}, 1fr)`,
          gridTemplateRows: `repeat(${yInit}, 1fr)`,
          width: 'calc(min(100vw, 100vh) - 2rem)',
          height: 'calc(min(100vw, 100vh) - 2rem)'
        }}
      >
        {gridElements}
      </div>
      <div className="flex flex-col flex-wrap items-start gap-3">
        <button
          onClick={() => game.start()}
          className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
        >
          START
        </button>
        <button
          onClick={() => game.stop()}
          className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
        >
          STOP
        </button>
        <button
          onClick={() => {
            game.reset()
            game.addCallback(handleNewFrame)
            game.runCallbacks()
          }}
          className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
        >
          RESET
        </button>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => game.reverseFrame()}
            className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
          >
            FRAME--
          </button>
          <button
            onClick={() => game.runFrame()}
            className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
          >
            FRAME++
          </button>
          <span className="text-white">FRAME #{game.currentFrame}</span>
        </div>
        {WrapWorldButton}
        {ArrowKeysButton}
        {PaintMoveButton}
        <div className="flex gap-3 items-center">
          <Slider
            min={50}
            max={1000}
            step={10}
            value={frameLengthMs}
            onChange={handleSliderChange}
            className="w-40"
          />
          <span className="text-white">FRAME LENGTH:&nbsp;{frameLengthMs}ms</span>
        </div>
        <h2 className="text-blue-800 text-2xl font-bold mt-16">Tips</h2>
        <hr className="border-blue-800 border-1 w-full"/>
        <ul className="text-white">
          <li>- Paint by clicking cells, or holding mouse and dragging</li>
          <li>- With "paint with arrow keys", spacebar to toggle cells or select "paint on move"</li>
          <li>- With "wrap world", choose whether the game world's edges connect</li>
          <li>- See source code: <a className="text-white hover:text-blue-600" href={REPO_URL}>{REPO_URL}</a></li>
        </ul>
      </div>
    </div>
  )
}
