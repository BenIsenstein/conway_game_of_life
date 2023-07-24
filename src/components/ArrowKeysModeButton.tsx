import { useState } from 'react'
import { GameOfLife } from 'models'
import { EditorMode } from 'types'

interface IProps {
  game: GameOfLife
  arrowKeysCursor: React.MutableRefObject<number | null>
  editorMode: React.MutableRefObject<EditorMode>
}

export const ArrowKeysModeButton = (props: IProps) => {
  const { game, arrowKeysCursor, editorMode } = props
  const isPaintWithArrowKeys = () =>
    [
      EditorMode.ARROW_KEYS_PAINT_ON_MOVE,
      EditorMode.ARROW_KEYS_PAINT_WITH_SPACE,
    ].includes(editorMode.current)
  const [active, setActive] = useState(isPaintWithArrowKeys())

  return (
    <button
      onClick={() => {
        if (isPaintWithArrowKeys()) {
          editorMode.current = EditorMode.MOUSE_PAINT
        } else {
          editorMode.current = EditorMode.ARROW_KEYS_PAINT_WITH_SPACE
        }

        if (arrowKeysCursor.current !== null) {
          game.pushUpdate(arrowKeysCursor.current)
          game.runCallbacks()
          setActive(isPaintWithArrowKeys())
        }
      }}
      className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
    >
      {active ? 'PAINT WITH ARROW KEYS: ON' : 'PAINT WITH ARROW KEYS: OFF'}
    </button>
  )
}
