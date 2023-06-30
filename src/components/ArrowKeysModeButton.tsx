import { useState } from 'react'
import { GameOfLife } from 'models'
import { IArrowKeysState } from 'types'

interface IProps {
  game: GameOfLife
  arrowKeysState: IArrowKeysState
}

export const ArrowKeysModeButton = (props: IProps) => {
  const { game, arrowKeysState } = props
  const [active, setActive] = useState(arrowKeysState.active)

  return (
    <button
      onClick={() => {
        arrowKeysState.active = !arrowKeysState.active

        if (arrowKeysState.cursor !== null) {
          game.pushUpdate(arrowKeysState.cursor)
          game.runCallbacks()
          setActive(arrowKeysState.active)
        }
      }}
      className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
      {active ? 'PAINT WITH ARROW KEYS: ON' : 'PAINT WITH ARROW KEYS: OFF'}
    </button>
  )
}
