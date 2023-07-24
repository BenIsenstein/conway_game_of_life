import React from 'react'
import { Camera2D, GameOfLife } from 'models'

export const indexFromEventHOF = (game: GameOfLife, camera: Camera2D) => {
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

    const cellWidth = canvas.width / camera.sideLength
    const cellHeight = canvas.height / camera.sideLength
    const rawColumn = canvasX / cellWidth + camera.x
    const rawRow = canvasY / cellHeight + camera.y
    const column =
      rawColumn <= camera.x
        ? camera.x
        : rawColumn % 1 > 0
        ? Math.floor(rawColumn)
        : rawColumn - 1
    const row =
      rawRow <= camera.y
        ? camera.y
        : rawRow % 1 > 0
        ? Math.floor(rawRow)
        : rawRow - 1
    const index = row * game.width + column

    return index
  }

  return indexFromEvent
}
