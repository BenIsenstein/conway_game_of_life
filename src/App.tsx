import { useEffect, useRef, useState } from 'react'
import { GameOfLife } from './models'
import { useViewportDimensions } from './utils'

interface IProps {
  xInit: number
  yInit: number
}

function App({ xInit, yInit }: IProps) {
  const game = useRef(new GameOfLife(xInit, yInit)).current
  const { width, height } = useViewportDimensions()
  const [grid, setGrid] = useState(game.currentGrid)
  const gridElements: JSX.Element[] = []
  const minSize = Math.min(width, height)

  for (const x in grid) {
    for (const y in grid[x]) {
      const node = grid[x][y]

      gridElements.push(
        <div
          key={`x:${x},y:${y}`}
          className={node.alive ? 'bg-white' : 'bg-black hover:bg-gray-400'}
          style={{ gridColumnStart: Number(x) + 1, gridRowStart: Number(y) + 1 }}
          onClick={() => node.toggleAlive()}
        />
      )
    }
  }

  useEffect(() => {
    game.addCallback(setGrid)

    return () => game.removeCallback(setGrid)
  }), []

  return (
    <div className="box-border flex flex-col w-screen h-screen p-4">
      <div className="flex mb-4">
        <button
          onClick={() => game.start()}
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
            setGrid(game.currentGrid)
          }}
          className="bg-purple-800 rounded-md text-white p-1"
        >
          RESET
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${xInit}, 1fr)`,
          gridTemplateRows: `repeat(${yInit}, 1fr)`,
          width: minSize,
          height: minSize
        }}
      >
        {gridElements}
      </div>
    </div>
  )
}

export default App
