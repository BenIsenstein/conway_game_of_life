import { GameOfLife } from './gameOfLife'

const backupSideLengthFromSmallestSide = (smallestSide: number) => Math.ceil(Math.sqrt(smallestSide))
const STEP_TO_SIDELENGTH_RATIO = 0.02
const SIDELENGTH_GROWTH_FACTOR = 1.02

export class Camera2D {
  game: GameOfLife
  x: number
  y: number
  step: number
  sideLength: number

  constructor(game: GameOfLife, sideLength?: number) {
    const smallestSide = Math.min(game.width, game.height)
    const backupSideLength = backupSideLengthFromSmallestSide(smallestSide)
    const sidelengthInvalid = !sideLength || sideLength <= 0 || sideLength > smallestSide
    const sl = sidelengthInvalid ? backupSideLength : sideLength

    this.game = game
    this.x = (game.width - sl) / 2
    this.y = (game.height - sl) / 2
    this.step = sl * STEP_TO_SIDELENGTH_RATIO
    this.sideLength = sl
  }

  getLowestIndex() {
    return this.game.width * Math.ceil(this.y) + Math.ceil(this.x)
  }

  getHighestIndex() {
    return this.game.width * Math.floor(this.y + this.sideLength) + Math.floor(this.x + this.sideLength)
  }

  isIndexInCamera(index: number) {
    const leftFromGameLeft = index % this.game.width
    const topFromGameTop = Math.floor(index / this.game.width)

    return (
      leftFromGameLeft + 1 > this.x &&
      leftFromGameLeft < this.x + this.sideLength &&
      topFromGameTop + 1 > this.y &&
      topFromGameTop < this.y + this.sideLength
    )
  }

  isCameraInGame() {
    return (
      this.x >= 0 &&
      this.y >= 0 &&
      this.x + this.sideLength - 1 <= this.game.width &&
      this.y + this.sideLength - 1 <= this.game.height
    )
  }

  reset() {
    const smallestSide = Math.min(this.game.width, this.game.height)
    const sideLength = backupSideLengthFromSmallestSide(smallestSide)

    this.x = Math.round((this.game.width - sideLength) / 2)
    this.y = Math.round((this.game.height - sideLength) / 2)
    this.step = sideLength * STEP_TO_SIDELENGTH_RATIO
    this.sideLength = sideLength
  }

  moveUp(step = this.step) {
    if (this.y - step >= 0) {
      this.y = Math.max(this.y - step, 0)
      return
    }
    if (this.y > 0) this.y = 0
  }

  moveDown(step = this.step) {
    if (this.y + this.sideLength + step <= this.game.height) {
      this.y += step

      if (this.y + this.sideLength > this.game.height) {
        this.y = this.game.height - this.sideLength
      }
      return
    }
    if (this.y + this.sideLength < this.game.height) {
      this.y = this.game.height - this.sideLength
    }
  }

  moveLeft(step = this.step) {
    if (this.x - step >= 0) {
      this.x = Math.max(this.x - step, 0)
      return
    }
    if (this.x > 0) this.x = 0
  }

  moveRight(step = this.step) {
    if (this.x + this.sideLength + step <= this.game.width) {
      this.x += step

      if (this.x + this.sideLength > this.game.width) {
        this.x = this.game.width - this.sideLength
      }
      return
    }
    if (this.x + this.sideLength < this.game.width) {
      this.x = this.game.width - this.sideLength
    }
  }

  syncStepSize() {
    this.step = this.sideLength * STEP_TO_SIDELENGTH_RATIO
  }

  zoomIn() {
    const sideLengthDelta = this.sideLength * (1 - 1 / SIDELENGTH_GROWTH_FACTOR)

    if (this.sideLength - sideLengthDelta >= 1) {
      this.sideLength = Math.max(this.sideLength - sideLengthDelta, 1)
      this.y += sideLengthDelta / 2
      this.x += sideLengthDelta / 2
      this.syncStepSize()
    }
  }

  zoomOut() {
    let sideLengthDelta = this.sideLength * (SIDELENGTH_GROWTH_FACTOR - 1)
    const smallerSide = Math.min(this.game.width, this.game.height)

    if (this.sideLength + sideLengthDelta <= smallerSide) {
      this.sideLength = Math.min(this.sideLength + sideLengthDelta, smallerSide)
    } else if (this.sideLength < smallerSide) {
      sideLengthDelta = smallerSide - this.sideLength
      this.sideLength = smallerSide
    }

    const edgesColliding = {
      top: this.y < 0,
      right: this.x + this.sideLength > this.game.width,
      bottom: this.y + this.sideLength > this.game.height,
      left: this.x < 0
    }
    let anyEdgeColliding = false

    for (const key in edgesColliding) {
      // @ts-ignore
      if (edgesColliding[key]) anyEdgeColliding = true
    }

    if (anyEdgeColliding) {
      if (edgesColliding.right) this.x = this.game.width - this.sideLength
      if (edgesColliding.bottom) this.y = this.game.height - this.sideLength
    } else {
      this.y = Math.max(this.y - sideLengthDelta / 2, 0)
      this.x = Math.max(this.x - sideLengthDelta / 2, 0)
    }

    this.syncStepSize()
  }
}
