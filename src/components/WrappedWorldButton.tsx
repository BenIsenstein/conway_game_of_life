import React from 'react'
import { GameOfLife } from 'models'

export const WrappedWorldButton = (
    game: GameOfLife,
    setSelf: React.Dispatch<React.SetStateAction<JSX.Element>>
) => (
    <button
        onClick={() => {
            game.toggleWrap()
            setSelf(WrappedWorldButton(game, setSelf))
        }}
        className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
        {game.wrapGrid
            ? 'WRAP WORLD: ON'
            : 'WRAP WORLD: OFF'
        }
    </button>
)
