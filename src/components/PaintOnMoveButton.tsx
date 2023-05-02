import React from 'react'
import { usePaintWithArrowKeys } from 'utils'

export const PaintOnMoveButton = (
    arrowKeysState: ReturnType<typeof usePaintWithArrowKeys>,
    setSelf: React.Dispatch<React.SetStateAction<JSX.Element>>
) => (
    <button
        onClick={() => {
            arrowKeysState.current.paintOnMove = !arrowKeysState.current.paintOnMove
            setSelf(PaintOnMoveButton(arrowKeysState, setSelf))
        }}
        className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
        {arrowKeysState.current.paintOnMove
            ? 'PAINT ON MOVE: ON'
            : 'PAINT ON MOVE: OFF'
        }
    </button>
)
