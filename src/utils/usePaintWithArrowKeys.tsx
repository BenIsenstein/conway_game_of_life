import { useEffect, useRef } from 'react'
import { GameOfLife } from 'models'
import { IArrowKeysState } from 'types'

const KEY_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']

export const usePaintWithArrowKeys = (game: GameOfLife) => {
  const state = useRef<IArrowKeysState>({
    active: false,
    cursor: 0,
    paintOnMove: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!KEY_CODES.includes(e.key)) return
      if (!state.current.active) return

      const prevCursor = state.current.cursor
      let nextCursor: number

      switch (e.key) {
        case 'ArrowUp':
          nextCursor = state.current.cursor - game.width
          break
        case 'ArrowDown':
          nextCursor = state.current.cursor + game.width
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
      if (nextCursor >= game.grid.length)
        nextCursor = nextCursor - game.grid.length

      state.current.cursor = nextCursor

      if (state.current.paintOnMove) {
        game.pushUpdate(prevCursor)
        game.toggleCellAlive(nextCursor)
        return
      }

      game.pushUpdate(prevCursor)
      game.pushUpdate(nextCursor)
      game.swapUpdateStacks()
      game.runCallbacks()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return state
}
