import { useCanvasEventHandlers } from 'utils'
import { EditorPanel } from 'components'
import { EditorMode } from 'types'
import clsx from 'clsx'
import { useCallback, useState } from 'react'

const GITHUB_URL = 'https://github.com/BenIsenstein'
const REPO_URL = `${GITHUB_URL}/conway_game_of_life`

export const GameOfLifeReact = () => {
  const {
    game,
    currentFrame,
    fps,
    gameDimensions,
    arrowKeysCursor,
    editorMode,
    canvasHelper,
    initCanvas,
    initMinimap,
    handleMouseDown,
    handleMouseMove,
    handleMouseLeave,
    handleSliderChange,
    handleNewFrame,
    handleScroll,
    dispatchZoom,
    updateWidth,
    updateHeight,
  } = useCanvasEventHandlers()
  const [, setRender] = useState(0)
  const reRender = useCallback(() => {
    // @ts-ignore
    handleNewFrame()
    setRender((r) => r + 1)
  }, [handleNewFrame])

  return (
    <div className="box-border overflow-hidden flex w-screen h-screen gap-3 p-4 bg-zinc-100">
      <canvas
        className={clsx('bg-black', editorMode.current === EditorMode.NAVIGATE ? 'cursor-move' : 'cursor-none')}
        ref={initCanvas}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onWheel={handleScroll}
      >
        John Conway's Game of Life, built with TypeScript and React
      </canvas>
      <div className="flex flex-col flex-wrap items-start gap-3">
        <EditorPanel
          game={game}
          editorMode={editorMode}
          canvasHelper={canvasHelper!}
          handleNewFrame={handleNewFrame}
          dispatchZoom={dispatchZoom}
          handleSliderChange={handleSliderChange}
          fps={fps}
          reRender={reRender}
        />
        <div className="flex flex-col items-start gap-3">
          <canvas
            className='bg-black'
            ref={initMinimap}
          >
            John Conway's Game of Life, implemented in TypeScript and React
          </canvas>
          <span>
            Frontend web app was built by&nbsp;
            <a className="hover:text-blue-600 hover:underline" href={GITHUB_URL}>Ben Isenstein</a>
          </span>
          <a className="hover:text-blue-600 hover:underline" href={REPO_URL}>
            See source code
          </a>
        </div>
      </div>
    </div>
  )
}
