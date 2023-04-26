import { GameOfLife } from 'models'
import React from 'react'
import { usePaintWithArrowKeys } from 'utils'

export const ArrowKeysModeButton = (
    game: GameOfLife,
    arrowKeysState: ReturnType<typeof usePaintWithArrowKeys>,
    setSelf: React.Dispatch<React.SetStateAction<JSX.Element>>
) => (
    <button
        onClick={() => {
            arrowKeysState.current.active = !arrowKeysState.current.active

            if (arrowKeysState.current.cursor !== null) {
                game.enqueueUpdate(arrowKeysState.current.cursor)
            }
            
            setSelf(ArrowKeysModeButton(game, arrowKeysState, setSelf))
        }}
        className="mr-2 bg-purple-800 rounded-md text-white p-1"
    >
        {arrowKeysState.current.active
            ? 'PAINT WITH ARROW KEYS: ON'
            : 'PAINT WITH ARROW KEYS: OFF'
        }
    </button>
)