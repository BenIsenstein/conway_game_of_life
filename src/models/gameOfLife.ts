import { NewFrameCallback } from 'types'
import { createCellNeighborAddresses } from 'utils'

/* TODO 
- resize grid when props change
- add shapes from a library w drag and drop
*/

export class GameOfLife {
    grid: boolean[]
    stagingGrid: boolean[]
    width: number
    height: number
    currentFrame: number
    wrapGrid: boolean
    updateQueueA: number[]
    private cellNeighborAddresses: number[]
    private updateQueueB: number[]
    private callbacks: NewFrameCallback[]
    private intervalId?: number

    constructor(xInit: number, yInit: number) {
        this.grid = Array(xInit * yInit).fill(false)
        this.stagingGrid = Array(xInit * yInit).fill(false)
        this.width = xInit
        this.height = yInit
        this.currentFrame = 0
        this.wrapGrid = true
        this.updateQueueA = []
        this.updateQueueB = []
        this.callbacks = []
        this.intervalId = undefined
        this.cellNeighborAddresses = createCellNeighborAddresses(this.height)
    }

    toggleWrap(): void {
        this.wrapGrid = !this.wrapGrid
    }

    loadFromGrid(newGrid: boolean[]): void {
        // resize?
        this.grid = newGrid
        this.syncGrids()
    }

    swapGrids(): void {
        const tempGrid = this.grid
        this.grid = this.stagingGrid
        this.stagingGrid = tempGrid
    }

    syncGrids(): void {
        for (const cell in this.grid) {
            this.stagingGrid[cell] = this.grid[cell]
        }
    }

    swapUpdateQueues(): void {
        const tempQueue = this.updateQueueA
        this.updateQueueA = this.updateQueueB
        this.updateQueueB = tempQueue
    }

    enqueueUpdate(i: number) {
        this.updateQueueA.push(i)
        this.updateQueueB.push(i)
    }

    dequeueUpdate(): number | undefined {
        this.updateQueueB.shift()
        return this.updateQueueA.shift()
    }

    addCallback(callback: NewFrameCallback): void {
        this.callbacks.push(callback)
    }

    removeCallback(callback: NewFrameCallback): void {
        const callbackIndex = this.callbacks.indexOf(callback)
        this.callbacks.splice(callbackIndex, 1)
    }

    runCallbacks(): void {
        for (const callback of this.callbacks) {
            callback(this)
        }
    }

    runFrame(): void {
        for (const i in this.grid) {
            this.calculateCellNextState(Number(i))
        }

        this.swapUpdateQueues()
        this.swapGrids()

        this.currentFrame++
        this.runCallbacks()
    }
    
    start(intervalMs = 250): void {
        if (this.intervalId) return
        this.intervalId = setInterval(() => this.runFrame(), intervalMs) as unknown as number
    }

    updateInterval(intervalMs: number): void {
        if (!this.intervalId) return
        clearInterval(this.intervalId)
        this.intervalId = setInterval(() => this.runFrame(), intervalMs) as unknown as number
    }

    stop(): void {
        clearInterval(this.intervalId)
        this.intervalId = undefined
        this.syncGrids()
    }

    reset(): void {
        this.stop()
        this.callbacks.splice(0)
        this.currentFrame = 0

        for (const i in this.grid) {
            if (!this.grid[i]) continue

            this.grid[i] = this.stagingGrid[i] = false
            this.enqueueUpdate(Number(i))
        }

        this.swapUpdateQueues()
    }

    toggleCellAlive(i: number): void {
        this.grid[i] = this.stagingGrid[i] = !this.grid[i]
        this.enqueueUpdate(i)
        this.swapUpdateQueues()
        this.runCallbacks()
    }

    calculateCellNextState(i: number) {
        let aliveNeighbors = 0

        for (const address of this.cellNeighborAddresses) {
            let index = i + address
            if (index < 0) index = this.grid.length + index
            if (index >= this.grid.length) index = index - this.grid.length
            if (this.grid[index]) aliveNeighbors++
        }

        const currentValue = this.grid[i]
        const nextValue = currentValue ? [2, 3].includes(aliveNeighbors) : aliveNeighbors === 3

        this.stagingGrid[i] = nextValue

        if (nextValue !== currentValue) {
            this.enqueueUpdate(i)
        }
    }
}
