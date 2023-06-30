import { useState } from 'react'
import { IArrowKeysState } from 'types'

interface IProps {
  arrowKeysState: IArrowKeysState
}

export const PaintOnMoveButton = ({ arrowKeysState }: IProps) => {
  const [paintOnMove, setPaintOnMove] = useState(arrowKeysState.paintOnMove)

  return (
    <button
      onClick={() => {
        arrowKeysState.paintOnMove = !arrowKeysState.paintOnMove
        setPaintOnMove(arrowKeysState.paintOnMove)
      }}
      className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
      {paintOnMove ? 'PAINT ON MOVE: ON' : 'PAINT ON MOVE: OFF'}
    </button>
  )
}
