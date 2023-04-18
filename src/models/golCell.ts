import { XVal, YVal } from "../types"
import { GameOfLife } from "./gameOfLife"

export class GOLCell {
    game: GameOfLife
    x: XVal
    y: YVal
    alive: boolean

    constructor(game: GameOfLife, x: XVal, y: YVal, alive: boolean) {
        this.game = game
        this.x = x
        this.y = y
        this.alive = alive
    }

    calculateNextState() {
        let aliveNeighbors = 0
    
        for (let x = this.x - 1; x <= this.x + 1; x++) {
            for (let y = this.y - 1; y <= this.y + 1; y++) {
                if (x === this.x && y === this.y) continue
                if (this.game.currentGrid[x]?.[y]?.alive) aliveNeighbors++
            }
        }

        this.game.stagingGrid[this.x][this.y].alive = (
            this.alive ? [2, 3].includes(aliveNeighbors) : aliveNeighbors === 3
        )
    }

    toggleAlive() {
        const { x, y } = this
        const nextNode = this.game.stagingGrid[x][y]

        nextNode.alive = this.alive = !this.alive
        this.game.swapGrids()
        this.game.runCallbacks()
    }
}
