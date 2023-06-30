import { useState } from 'react'
import { GameOfLife } from 'models'

interface IProps {
  game: GameOfLife
}

export const WrappedWorldButton = ({ game }: IProps) => {
  const [wrapGrid, setWrapGrid] = useState(game.wrapGrid)

  return (
    <button
      onClick={() => {
        game.toggleWrap()
        setWrapGrid(game.wrapGrid)
      }}
      className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
      WRAP WORLD:{wrapGrid ? ' ON' : ' OFF'}
    </button>
  )
}
