import { GameOfLife } from '.'
import { IHoverState, IArrowKeysState } from 'types'
import { stageSideLengthJS } from 'utils'

const COLORS = {
  alive: 'white',
  dead: 'black',
  cursor: 'red',
  hover: 'rgb(156, 163, 175)',
}

export class CanvasHelper {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  game: GameOfLife
  arrowKeysState: IArrowKeysState
  hoverState: IHoverState
  cellWidth: number
  cellHeight: number

  constructor(
    canvas: HTMLCanvasElement,
    game: GameOfLife,
    arrowKeysState: IArrowKeysState,
    hoverState: IHoverState
  ) {
    const maxSidelength = stageSideLengthJS()
    const dpr = window.devicePixelRatio || 1

    this.canvas = canvas
    this.canvas.width = Math.floor(maxSidelength * dpr)
    this.canvas.height = Math.floor(maxSidelength * dpr)
    this.cellWidth = Math.round(canvas.width / game.width) || 1
    this.cellHeight = Math.round(canvas.height / game.height) || 1
    this.ctx = canvas.getContext('2d', { alpha: false })!
    this.game = game
    this.arrowKeysState = arrowKeysState
    this.hoverState = hoverState
  }

  originFromIndex(i: number): [number, number] {
    const x = (i! % this.game.width) * this.cellWidth
    const y = Math.floor(i! / this.game.width) * this.cellHeight

    return [x, y]
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
    if (this.hoverState.current === i) {
      this.setColor(COLORS.hover)
    } else if (this.arrowKeysState.cursor === i && this.arrowKeysState.active) {
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
      this.drawCellGameState(this.game.popUpdate()!)
    }
  }

  rePaintGame() {
    this.clearGame()

    for (let i = 0; i < this.game.grid.length; i++) {
      this.drawCellGameState(i)
    }
  }
}
