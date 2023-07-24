import { useState } from 'react'
import { EditorMode } from 'types'

interface IProps {
  editorMode: React.MutableRefObject<EditorMode>
}

export const PaintOnMoveButton = ({ editorMode }: IProps) => {
  const [paintOnMove, setPaintOnMove] = useState(
    editorMode.current === EditorMode.ARROW_KEYS_PAINT_ON_MOVE
  )

  return (
    <button
      onClick={() => {
        editorMode.current = paintOnMove
          ? EditorMode.ARROW_KEYS_PAINT_WITH_SPACE
          : EditorMode.ARROW_KEYS_PAINT_ON_MOVE
        setPaintOnMove(
          editorMode.current === EditorMode.ARROW_KEYS_PAINT_ON_MOVE
        )
      }}
      className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
      {paintOnMove ? 'PAINT ON MOVE: ON' : 'PAINT ON MOVE: OFF'}
    </button>
  )
}
