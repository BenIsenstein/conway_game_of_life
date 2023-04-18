import { GOLGrid, XVal, YVal, NewGridCallback } from '../types'
import { GOLCell } from "./golCell"

/* TODO 

- resize grid when props change

*/

export class GameOfLife {
    currentGrid: GOLGrid
    stagingGrid: GOLGrid
    currentFrame: number
    callbacks: NewGridCallback[]
    private intervalId?: number

    constructor(xInit: XVal, yInit: YVal) {
        this.currentGrid = {}
        this.stagingGrid = {}
        this.currentFrame = 0
        this.callbacks = []
        this.intervalId = undefined

        for (let x = 0; x < xInit; x++) {
            this.currentGrid[x] = {}
            this.stagingGrid[x] = {}

            for (let y = 0; y < yInit; y++) {
                this.currentGrid[x][y] = new GOLCell(this, x, y, false)
                this.stagingGrid[x][y] = new GOLCell(this, x, y, false)
            }
        }
    }

    swapGrids(): void {
        const tempGrid = this.currentGrid
        this.currentGrid = this.stagingGrid
        this.stagingGrid = tempGrid
    }

    addCallback(callback: NewGridCallback): void {
        this.callbacks.push(callback)
    }

    removeCallback(callback: NewGridCallback): void {
        const callbackIndex = this.callbacks.indexOf(callback)
        this.callbacks.splice(callbackIndex, 1)
    }

    runCallbacks(): void {
        for (const callback of this.callbacks) {
            callback(this.currentGrid)
        }
    }

    runFrame(): void {
        for (const x in this.currentGrid) {
            const yMap = this.currentGrid[x]

            for (const y in yMap) {
                yMap[y].calculateNextState()
            }
        }

        this.currentFrame++
        this.swapGrids()
        this.runCallbacks()
    }

    start(intervalMs = 250): void {
        this.intervalId = setInterval(() => this.runFrame(), intervalMs) as unknown as number
    }

    stop(): void {
        clearInterval(this.intervalId)
        this.intervalId = undefined
    }

    reset(): void {
        this.callbacks = []
        this.currentFrame = 0

        if (this.intervalId) {
            this.stop()
        }

        for (const grid of [this.currentGrid, this.stagingGrid]) {
            for (const x in grid) {
                const yMap = grid[x]
    
                for (const y in yMap) {
                    yMap[y].alive = false
                }
            }
        }

        this.swapGrids()
    }
}
