import { useCanvasEventHandlers } from 'utils'
import {
  ArrowKeysModeButton,
  PaintOnMoveButton,
  WrappedWorldButton,
} from 'components'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const REPO_URL = 'https://github.com/BenIsenstein/conway_game_of_life'

export const GameOfLifeReact = () => {
  const {
    game,
    currentFrame,
    fps,
    gameDimensions,
    arrowKeysState,
    initCanvas,
    handleCellClick,
    handleCellMouseOver,
    handleMouseLeave,
    handleSliderChange,
    handleNewFrame,
    updateWidth,
    updateHeight,
  } = useCanvasEventHandlers()

  return (
    <div className="box-border flex w-screen h-screen gap-3 p-4 bg-gray-400">
      <canvas
        className="bg-black cursor-none"
        ref={initCanvas}
        onMouseMove={handleCellMouseOver}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleCellClick}
      >
        John Conway's Game of Life, implemented in TypeScript and React
      </canvas>
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
          <span className="text-white">FRAME #{currentFrame}</span>
        </div>
        <WrappedWorldButton game={game} />
        <ArrowKeysModeButton game={game} arrowKeysState={arrowKeysState} />
        <PaintOnMoveButton arrowKeysState={arrowKeysState} />
        <div className="flex gap-3 items-center">
          <Slider
            min={1}
            max={60}
            step={1}
            value={fps}
            onChange={handleSliderChange}
            className="w-40"
          />
          <span className="text-white">Frame Rate:&nbsp;{fps}fps</span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            className="w-20"
            value={gameDimensions.xInit}
            onChange={updateWidth}
          />
          <span className="text-white">
            Game Width:&nbsp;{gameDimensions.xInit}
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            min={1}
            className="w-20"
            value={gameDimensions.yInit}
            onChange={updateHeight}
          />
          <span className="text-white">
            Game Height:&nbsp;{gameDimensions.yInit}
          </span>
        </div>
        <h2 className="text-blue-800 text-2xl font-bold mt-16">Tips</h2>
        <hr className="border-blue-800 border-1 w-full" />
        <ul className="text-white">
          <li>- Paint by clicking cells, or holding mouse and dragging</li>
          <li>
            - With "paint with arrow keys", spacebar to toggle cells or select
            "paint on move"
          </li>
          <li>
            - With "wrap world", choose whether the game world's edges connect
          </li>
          <li>
            - See source code:{' '}
            <a className="text-white hover:text-blue-600" href={REPO_URL}>
              {REPO_URL}
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
