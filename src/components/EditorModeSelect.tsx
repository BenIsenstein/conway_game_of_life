import { CanvasHelper } from 'models'
import React from 'react'
import { EditorMode } from 'types'

interface IProps {
  reRender: () => void
  editorMode: React.MutableRefObject<EditorMode>
  canvasHelper: CanvasHelper
}

const editorModeEntries = Object.entries(EditorMode).slice(4)

export const EditorModeSelect: React.FC<IProps> = ({ editorMode, canvasHelper, reRender }) => {
  const [mode, setMode] = React.useState<EditorMode>(editorMode.current)

  return (
    <select
        className="bg-blue-800 hover:bg-blue-600 active:bg-blue-500 rounded-md text-white p-1"
      value={mode}
      onChange={(e) => {
        editorMode.current = Number(e.target.value as unknown as EditorMode)
        if (canvasHelper.arrowKeysCursor.current) {
          canvasHelper.drawCellGameState(canvasHelper.arrowKeysCursor.current)
          // rePaintMinimap()
        }
        setMode(e.target.value as unknown as EditorMode)
        reRender()
      }}
    >
      {editorModeEntries.map(([key, value]) => (
        <option key={value} value={value}>
          {key}
        </option>
      ))}
    </select>
  )
}
