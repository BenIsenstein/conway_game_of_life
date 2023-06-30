import { NewFrameCallback, ISavedGameOfLife, INewGameOfLifeConfig } from 'types'
import { createCellNeighborAddresses, statusFromI } from 'utils'

export class GameOfLife {
  width: number
  height: number
  currentFrame: number
  frameLengthMs: number
  wrapGrid: boolean
  history: number[][]
  updateStack: number[]
  private _gridA: boolean[]
  private _gridB: boolean[]
  private cellNeighborAddresses: ReturnType<typeof createCellNeighborAddresses>
  private callbacks: NewFrameCallback[]
  private intervalId?: number

  constructor(config: INewGameOfLifeConfig | ISavedGameOfLife) {
    if (config.__type === 'NEW') {
      const { xInit, yInit } = config

      this._gridA = Array(xInit * yInit).fill(false)
      this._gridB = Array(xInit * yInit).fill(false)
      this.width = xInit
      this.height = yInit
      this.frameLengthMs = 80
      this.currentFrame = 0
      this.wrapGrid = true
      this.history = []
    } else if (config.__type === 'SAVED') {
      this._gridA = config.grid
      this._gridB = [...config.grid]
      this.width = config.width
      this.height = config.height
      this.frameLengthMs = config.frameLengthMs
      this.currentFrame = config.currentFrame
      this.wrapGrid = config.wrapGrid
      this.history = config.history
    } else {
      throw new Error('GameOfLife config not provided.')
    }

    this.updateStack = []
    this.callbacks = []
    this.intervalId = undefined
    this.cellNeighborAddresses = createCellNeighborAddresses(this.width)
  }

  static restoreFromSave(game: ISavedGameOfLife): GameOfLife {
    return new GameOfLife(game)
  }

  get grid() {
    return this._gridA
  }

  save(): ISavedGameOfLife {
    return {
      __type: 'SAVED',
      width: this.width,
      height: this.height,
      currentFrame: this.currentFrame,
      frameLengthMs: this.frameLengthMs,
      wrapGrid: this.wrapGrid,
      grid: this.grid,
      history: this.history,
    }
  }

  toggleWrap(): void {
    this.wrapGrid = !this.wrapGrid
  }

  swapGrids(): void {
    const tempGrid = this._gridA
    this._gridA = this._gridB
    this._gridB = tempGrid
  }

  syncGrids(): void {
    for (const cell in this._gridA) {
      this._gridB[cell] = this._gridA[cell]
    }
  }

  pushUpdate(i: number) {
    this.updateStack.push(i)
  }

  popUpdate(): number | undefined {
    return this.updateStack.pop()
  }

  addCallback(callback: NewFrameCallback): void {
    this.callbacks.push(callback)
  }

  removeCallback(callback: NewFrameCallback): void {
    this.callbacks.splice(this.callbacks.indexOf(callback), 1)
  }

  runCallbacks(): void {
    for (const callback of this.callbacks) {
      callback(this)
    }
  }

  runFrame(): void {
    this.updateStack.splice(0)

    for (const i in this._gridA) {
      this.computeCellNextState(Number(i))
    }

    this.currentFrame++
    this.updateHistory()
    this.swapGrids()
    this.runCallbacks()
  }

  updateHistory(): void {
    if (this.history.length < 20) {
      this.history.push([...this.updateStack])
      return
    }

    this.history.push(this.history.shift()!)
    this.history[19].splice(0)
    this.history[19].push(...this.updateStack)
  }

  reverseFrame(): void {
    this.updateStack.splice(0)
    const updates = this.history.pop()
    if (!updates || this.currentFrame === 0) return

    for (const i of updates) {
      this._gridA[i] = this._gridB[i] = !this._gridA[i]
    }

    this.currentFrame--
    this.updateStack = updates
    this.runCallbacks()
  }

  start(intervalMs?: number): void {
    const interval = intervalMs || this.frameLengthMs
    clearInterval(this.intervalId)
    this.intervalId = setInterval(
      () => this.runFrame(),
      interval
    ) as unknown as number
  }

  updateInterval(newLength: number) {
    this.frameLengthMs = newLength

    if (this.intervalId) {
      this.start()
    }
  }

  stop(): void {
    clearInterval(this.intervalId)
    this.intervalId = undefined
    this.syncGrids()
  }

  reset(): void {
    this.stop()
    this.callbacks.splice(0)
    this.history.splice(0)
    this.currentFrame = 0

    for (const i in this._gridA) {
      if (!this._gridA[i]) continue

      this._gridA[i] = this._gridB[i] = false
      this.pushUpdate(Number(i))
    }
  }

  toggleCellAlive(i: number): void {
    if (!this.history[0]) this.history.push([])

    this._gridA[i] = this._gridB[i] = !this._gridA[i]
    this.history[this.history.length - 1].push(i)
    this.pushUpdate(i)
    this.runCallbacks()
  }

  computeCellNextState(i: number) {
    const cellStatus = statusFromI(i, this)
    let aliveNeighbors = 0

    for (const address of this.cellNeighborAddresses[cellStatus]) {
      let neighbor = i + address

      if (neighbor < 0) {
        neighbor += this._gridA.length
      }
      if (neighbor >= this._gridA.length) {
        neighbor -= this._gridA.length
      }

      if (this._gridA[neighbor]) {
        aliveNeighbors++
      }
    }

    this._gridB[i] = this._gridA[i]
      ? [2, 3].includes(aliveNeighbors)
      : aliveNeighbors === 3

    if (this._gridB[i] !== this._gridA[i]) {
      this.pushUpdate(i)
    }
  }

  updateWidth(newWidth: number): void {
    const delta = newWidth - this.width

    if (delta > 0) {
      for (let h = this.height; h > 0; h--) {
        this._gridA.splice(h * this.width, 0, ...Array(delta).fill(false))
        this._gridB.splice(h * this.width, 0, ...Array(delta).fill(false))
      }
    } else {
      for (let h = this.height; h > 0; h--) {
        this._gridA.splice(h * this.width + delta, Math.abs(delta))
        this._gridB.splice(h * this.width + delta, Math.abs(delta))
      }
    }

    this.width = newWidth
    this.cellNeighborAddresses = createCellNeighborAddresses(this.width)
  }

  updateHeight(newHeight: number): void {
    const delta = newHeight - this.height

    if (delta > 0) {
      this._gridA.push(...Array(delta * this.width).fill(false))
      this._gridB.push(...Array(delta * this.width).fill(false))
    } else {
      this._gridA.splice(this._gridA.length + delta * this.width)
      this._gridB.splice(this._gridB.length + delta * this.width)
    }

    this.height = newHeight
  }

  updateDimensions({ w, h }: { w?: number; h?: number }): void {
    if (w && w > 0) this.updateWidth(w)
    if (h && h > 0) this.updateHeight(h)
  }
}
