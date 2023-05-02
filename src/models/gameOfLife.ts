import { NewFrameCallback } from 'types'
import { createCellNeighborAddresses } from 'utils'

export class GameOfLife {
    width: number
    height: number
    currentFrame: number
    frameLengthMs: number
    wrapGrid: boolean
    history: number[][]
    private _gridA: boolean[]
    private _gridB: boolean[]
    private _updateStackA: number[]
    private _updateStackB: number[]
    private cellNeighborAddresses: number[]
    private callbacks: NewFrameCallback[]
    private intervalId?: number

    constructor(xInit: number, yInit: number) {
        this._gridA = Array(xInit * yInit).fill(false)
        this._gridB = Array(xInit * yInit).fill(false)
        this.width = xInit
        this.height = yInit
        this.frameLengthMs = 80
        this.currentFrame = 0
        this.wrapGrid = true
        this._updateStackA = []
        this._updateStackB = []
        this.history = []
        this.callbacks = []
        this.intervalId = undefined
        this.cellNeighborAddresses = createCellNeighborAddresses(this.height)
    }

    get grid() {
        return this._gridA
    }

    get updateStack() {
        return this._updateStackA
    }

    toggleWrap(): void {
        this.wrapGrid = !this.wrapGrid
    }

    loadFromGrid(newGrid: boolean[]): void {
        for (const cell in newGrid) {
            this._gridA[cell] = this._gridB[cell] = newGrid[cell]
        }
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

    swapUpdateStacks(): void {
        const tempStack = this._updateStackA
        this._updateStackA = this._updateStackB
        this._updateStackB = tempStack
    }

    pushUpdate(i: number) {
        this._updateStackA.push(i)
        this._updateStackB.push(i)
    }

    popUpdate(): number | undefined {
        this._updateStackB.pop()
        return this._updateStackA.pop()
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
        for (const i in this._gridA) {
            this.computeCellNextState(Number(i))
        }

        this.currentFrame++
        this.updateHistory()
        this.swapUpdateStacks()
        this.swapGrids()
        this.runCallbacks()
    }

    updateHistory(): void {
        if (this.history.length < 20) {
            this.history.push([...this._updateStackA])
            return
        }

        this.history.push(this.history.shift()!)
        this.history[19].splice(0)
        this.history[19].push(...this._updateStackA)
    }
    
    reverseFrame(): void {
        const updates = this.history.pop()
        if (!updates) return

        for (const i of updates) {
            this._gridA[i] = this._gridB[i] = !this._gridA[i]
        }

        this.currentFrame--
        this._updateStackA = updates
        this._updateStackB.splice(0)
        this._updateStackB.push(...updates)
        this.swapUpdateStacks()
        this.runCallbacks()
    }

    start(intervalMs?: number): void {
        const interval = intervalMs || this.frameLengthMs
        clearInterval(this.intervalId)
        this.intervalId = setInterval(() => this.runFrame(), interval) as unknown as number
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

        this.swapUpdateStacks()
    }

    toggleCellAlive(i: number): void {
        if (!this.history[0]) this.history.push([])

        this._gridA[i] = this._gridB[i] = !this._gridA[i]
        this.history[this.history.length - 1].push(i)
        this.pushUpdate(i)
        this.swapUpdateStacks()
        this.runCallbacks()
    }

    computeCellNextState(i: number) {
        let aliveNeighbors = 0

        for (const address of this.cellNeighborAddresses) {
            let index = i + address

            if (this.wrapGrid) {
                if (index < 0) {
                    index += this._gridA.length
                }
                if (index >= this._gridA.length) {
                    index -= this._gridA.length
                }
            }

            if (this._gridA[index]) {
                aliveNeighbors++
            }
        }

        this._gridB[i] = this._gridA[i] ? [2, 3].includes(aliveNeighbors) : aliveNeighbors === 3
        
        if (this._gridB[i] !== this._gridA[i]) {
            this.pushUpdate(i)
        }
    }
}
