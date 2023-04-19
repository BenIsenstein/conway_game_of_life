import { Cell, Grid, NewGridCallback } from '../types'
/* TODO 
- resize grid when props change
- compare performance of concurrent grids vs. stringify and parse each time
*/

export class GameOfLife {
    currentGrid: Grid
    stagingGrid: Grid
    currentFrame: number
    wrapGrid: boolean
    callbacks: NewGridCallback[]
    private intervalId?: number

    constructor(xInit: number, yInit: number) {
        this.currentGrid = []
        this.stagingGrid = []
        this.currentFrame = 0
        this.wrapGrid = true
        this.callbacks = []
        this.intervalId = undefined

        for (let i = 0; i < xInit; i++) {
            this.currentGrid.push(Array(yInit).fill(0))
            this.stagingGrid.push(Array(yInit).fill(0))
        }
    }

    toggleWrap(): void {
        this.wrapGrid = !this.wrapGrid
    }

    copyGrid(): Grid {
        return JSON.parse(JSON.stringify(this.currentGrid))
    }

    swapGrids(): void {
        const tempGrid = this.currentGrid
        this.currentGrid = this.stagingGrid
        this.stagingGrid = tempGrid
    }

    syncGrids(): void {
        for (const x in this.currentGrid) {
            const currentCol = this.currentGrid[x]
            const stagingCol = this.stagingGrid[x]

            for (const y in currentCol) {
                stagingCol[y] = currentCol[y]
            }
        }
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
            const col = this.currentGrid[x]

            for (const y in col) {
                this.calculateCellNextState(Number(x), Number(y))
            }
        }

        this.currentFrame++
        this.swapGrids()
        this.runCallbacks()
    }

    start(intervalMs = 250): void {
        if (this.intervalId) return
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

        for (const col of this.currentGrid) col.fill(0)
        for (const col of this.stagingGrid) col.fill(0)

        this.swapGrids()
    }

    toggleCellAlive(x: number, y: number): void {
        this.currentGrid[x][y] = this.stagingGrid[x][y] = Number(!this.currentGrid[x][y]) as Cell
        this.swapGrids()
        this.runCallbacks()
    }

    calculateCellNextState(x: number, y: number) {
        let aliveNeighbors = 0
    
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i === x && j === y) continue
                
                if (this.wrapGrid) {
                    const wrappedX = i === -1 ? this.currentGrid.length - 1 : i === this.currentGrid.length ? 0 : i
                    const wrappedY = j === -1 ? this.currentGrid[0].length - 1 : j === this.currentGrid[0].length ? 0 : j
                    if (this.currentGrid[wrappedX][wrappedY]) aliveNeighbors++
                } else {
                    if (this.currentGrid[i]?.[j]) aliveNeighbors++
                }
            }
        }

        this.stagingGrid[x][y] = Number(
            this.currentGrid[x][y] ? [2, 3].includes(aliveNeighbors) : aliveNeighbors === 3
        ) as Cell
    }
}
