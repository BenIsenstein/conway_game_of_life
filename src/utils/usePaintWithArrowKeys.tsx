import { useEffect, useRef } from "react"
import { GameOfLife } from "models"

const KEY_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']

export const usePaintWithArrowKeys = (game: GameOfLife) => {
    const state = useRef({
        active: false,
        cursor: null as null | number,
        toggleOnMove: false
    })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!KEY_CODES.includes(e.key)) return
            if (!state.current.active) return
            if (state.current.cursor === null) return

            const prevCursor = state.current.cursor
            let nextCursor: number

            switch (e.key) {
                case 'ArrowUp':
                    nextCursor = state.current.cursor - game.height
                    break
                case 'ArrowDown':
                    nextCursor = state.current.cursor + game.height
                    break
                case 'ArrowLeft':
                    nextCursor = state.current.cursor - 1
                    break
                case 'ArrowRight':
                    nextCursor = state.current.cursor + 1
                    break
                case ' ':
                    game.toggleCellAlive(state.current.cursor)
                    return
                default:
                    throw new Error('Invalid key')
            }

            if (nextCursor < 0) nextCursor = game.grid.length + nextCursor
            if (nextCursor >= game.grid.length) nextCursor = nextCursor - game.grid.length

            state.current.cursor = nextCursor

            if (state.current.toggleOnMove) {
                game.enqueueUpdate(prevCursor)
                game.toggleCellAlive(nextCursor)
                return
            }

            game.enqueueUpdate(prevCursor)
            game.enqueueUpdate(nextCursor)
            game.swapUpdateQueues()
            game.runCallbacks()
        }

        window.addEventListener('keydown', handleKeyDown)
        
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return state
}
