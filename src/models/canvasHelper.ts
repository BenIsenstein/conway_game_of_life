import { MutableRefObject } from 'react'
import { GameOfLife, Camera2D } from '.'
import { IHoverState, EditorMode } from 'types'
import { stageSideLengthJS } from 'utils'

const COLORS = {
  alive: 'white',
  dead: 'black',
  cursor: 'red',
  hover: 'rgb(156, 163, 175)'
}

export class CanvasHelper {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  game: GameOfLife
  camera: Camera2D
  editorMode: MutableRefObject<EditorMode>
  arrowKeysCursor: MutableRefObject<number | null>
  hoverState: IHoverState
  cellWidth: number
  cellHeight: number

  constructor(
    canvas: HTMLCanvasElement,
    game: GameOfLife,
    camera: Camera2D,
    editorMode: MutableRefObject<EditorMode>,
    arrowKeysCursor: MutableRefObject<number | null>,
    hoverState: IHoverState,
    canvasWidth?: number,
    canvasHeight?: number
  ) {
    const maxSidelength = stageSideLengthJS()
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.floor((canvasWidth || maxSidelength) * dpr)
    canvas.height = Math.floor((canvasHeight || maxSidelength) * dpr)
    
    this.canvas = canvas
    this.cellWidth = canvas.width / camera.sideLength
    this.cellHeight = canvas.height / camera.sideLength
    this.ctx = canvas.getContext('2d', { alpha: false })!
    this.game = game
    this.camera = camera
    this.editorMode = editorMode
    this.arrowKeysCursor = arrowKeysCursor
    this.hoverState = hoverState
  }

  originFromIndex(i: number): [number, number] {
    const leftFromGameLeft = i! % this.game.width
    const topFromGameTop = Math.floor(i! / this.game.width)
    const x = (leftFromGameLeft - this.camera.x) * this.cellWidth
    const y = (topFromGameTop - this.camera.y) * this.cellHeight
    
    return [x, y]
  }

  syncCellSize() {
    this.cellWidth = this.canvas.width / this.camera.sideLength
    this.cellHeight = this.canvas.height / this.camera.sideLength
  }

  drawCell(i: number) {
    this.ctx.fillRect(
      ...this.originFromIndex(i),
      this.cellWidth,
      this.cellHeight
    )
  }

  setColor(color: string) {
    this.ctx.fillStyle = color
  }

  drawCellGameState(i: number) {
    const isPaintWithArrowKeys = this.editorMode.current === EditorMode.ARROW_KEYS_PAINT_WITH_SPACE || this.editorMode.current === EditorMode.ARROW_KEYS_PAINT_ON_MOVE

    if (this.hoverState.current === i) {
      this.setColor(COLORS.hover)
    } else if (this.arrowKeysCursor.current === i && isPaintWithArrowKeys) {
      this.setColor(COLORS.cursor)
    } else if (this.game.grid[i]) {
      this.setColor(COLORS.alive)
    } else {
      this.setColor(COLORS.dead)
    }

    this.drawCell(i)
  }

  clearGame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  commitNewFrame() {
    while (this.game.updateStack.length) {
      const i = this.game.popUpdate()!
      if (this.camera.isIndexInCamera(i)) this.drawCellGameState(i)
    }
  }

  rePaintGame() {
    this.clearGame()
    for (let i = 0; i < this.game.grid.length; i++) {
      if (this.camera.isIndexInCamera(i)) this.drawCellGameState(i)
    }
  }
}
