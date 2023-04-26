import React from 'react'
import { usePaintWithArrowKeys } from 'utils'

export const ToggleOnMoveButton = (
    arrowKeysState: ReturnType<typeof usePaintWithArrowKeys>,
    setSelf: React.Dispatch<React.SetStateAction<JSX.Element>>
) => (
    <button
        onClick={() => {
            arrowKeysState.current.toggleOnMove = !arrowKeysState.current.toggleOnMove
            setSelf(ToggleOnMoveButton(arrowKeysState, setSelf))
        }}
        className="mr-2 bg-purple-800 rounded-md text-white p-1"
    >
        {arrowKeysState.current.toggleOnMove
            ? 'TOGGLE ON MOVE: ON'
            : 'TOGGLE ON MOVE: OFF'
        }
    </button>
)
