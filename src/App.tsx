import { useEffect, useRef, useState } from 'react'
import { GameOfLife } from './models'
import { useMouseDown, useViewportDimensions } from './utils'
import clsx from 'clsx'

interface IProps {
  xInit: number
  yInit: number
}

function App({ xInit, yInit }: IProps) {
  const game = useRef(new GameOfLife(xInit, yInit)).current
  const toggleCell = (e: React.MouseEvent) => game.toggleCellAlive(e.target.dataset.x, e.target.dataset.y)
  const [grid, setGrid] = useState(game.currentGrid)
  const { width, height } = useViewportDimensions()
  const mouseDown = useMouseDown()
  const minSideLength = Math.min(width, height)
  const frameLengthMs = 125
  const gridElements: JSX.Element[] = []
  
  for (const x in grid) {
    for (const y in grid[x]) {
      gridElements.push(
        <div
          key={`x${x}y${y}`}
          className={clsx('cursor-none', grid[x][y] ? 'bg-white' : 'bg-black hover:bg-gray-500')}
          data-x={x}
          data-y={y}
          onClick={toggleCell}
          onMouseOver={mouseDown ? toggleCell : undefined}
        />
      )
    }
  }

  useEffect(() => {
    game.addCallback(setGrid)
    return () => game.removeCallback(setGrid)
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
            game.addCallback(setGrid)
            setGrid(game.currentGrid)
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
        <span className="text-white">FRAME:&nbsp;{game.currentFrame}</span>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${xInit}, 1fr)`,
          gridTemplateRows: `repeat(${yInit}, 1fr)`,
          width: minSideLength,
          height: minSideLength
        }}
      >
        {gridElements}
      </div>
    </div>
  )
}

export default App
