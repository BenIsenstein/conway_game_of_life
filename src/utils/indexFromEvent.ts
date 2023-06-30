import React from 'react'
import { GameOfLife } from 'models'

export const indexFromEventHOF = (game: GameOfLife) => {
  const indexFromEvent = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const dpr = window.devicePixelRatio || 1
    const x = e.clientX
    const y = e.clientY
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const canvasX = (x - rect.left) * dpr
    const canvasY = (y - rect.top) * dpr

    if (canvasX < 0 || canvasY < 0) return -1

    const cellWidth = Math.round(canvas.width / game.width) || 1
    const cellHeight = Math.round(canvas.height / game.height) || 1
    const rawColumn = canvasX / cellWidth
    const rawRow = canvasY / cellHeight
    const column =
      rawColumn <= 0
        ? 0
        : rawColumn % 1 > 0
        ? Math.floor(rawColumn)
        : rawColumn - 1
    const row =
      rawRow <= 0 ? 0 : rawRow % 1 > 0 ? Math.floor(rawRow) : rawRow - 1
    const index = row * game.width + column

    return index
  }

  return indexFromEvent
}
