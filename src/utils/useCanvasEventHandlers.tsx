import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  indexFromEventHOF,
  useMouseDown,
  usePaintWithArrowKeys,
  stageSideLengthJS,
} from 'utils'
import { CanvasHelper, GameOfLife } from 'models'
import { IHoverState } from 'types'

type CanvasMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>

export const useCanvasEventHandlers = () => {
  const [gameDimensions, setGameDimensions] = useState({
    __type: 'NEW' as const,
    xInit: 100,
    yInit: 100,
  })
  const game = useMemo(() => new GameOfLife(gameDimensions), [])
  const indexFromEvent = useMemo(() => indexFromEventHOF(game), [])
  const [canvasHelper, setCanvasHelper] = useState<CanvasHelper>()
  const [currentFrame, setCurrentFrame] = useState(game.currentFrame)
  const [fps, setFps] = useState(1000 / game.frameLengthMs)
  const mouseDown = useMouseDown()
  const arrowKeysState = usePaintWithArrowKeys(game).current
  const hoverState = useRef<IHoverState>({
    previous: null,
    current: null,
  }).current

  const initCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return

      setCanvasHelper(
        new CanvasHelper(canvas, game, arrowKeysState, hoverState)
      )
    },
    [game]
  )

  const handleCellClick = useCallback(
    (e: CanvasMouseEvent) => {
      const i = indexFromEvent(e)

      if (i < 0) return

      if (arrowKeysState.active) {
        game.pushUpdate(arrowKeysState.cursor)
        arrowKeysState.cursor = i

        if (arrowKeysState.paintOnMove) {
          game.toggleCellAlive(i)
          return
        }

        game.pushUpdate(i)
        game.runCallbacks()
        return
      }

      game.toggleCellAlive(i)
    },
    [game]
  )

  const handleCellMouseOver = useCallback(
    (e: CanvasMouseEvent) => {
      const currI = indexFromEvent(e)

      if (currI < 0) return

      const prevI = hoverState.previous

      if (currI === prevI) return

      hoverState.current = currI

      if (prevI !== null) {
        canvasHelper?.drawCellGameState(prevI)
      }

      if (mouseDown.current) {
        game.toggleCellAlive(currI)
      } else {
        canvasHelper?.drawCellGameState(currI)
      }

      hoverState.previous = currI
    },
    [canvasHelper, game]
  )

  const handleMouseLeave = useCallback(() => {
    const prevI = hoverState.previous!
    hoverState.previous = null
    hoverState.current = null
    canvasHelper?.drawCellGameState(prevI)
  }, [canvasHelper])

  const handleSliderChange = useCallback((val: number | number[]) => {
    const newInterval = Array.isArray(val) ? val[0] : val
    game.updateInterval(1000 / newInterval)
    setFps(newInterval)
  }, [])

  const updateWidth = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newX = parseInt(e.target.value)

      if (!Number.isSafeInteger(newX)) return

      game.updateDimensions({ w: newX })

      if (arrowKeysState.cursor > game.grid.length) {
        arrowKeysState.cursor = 0
      }

      setGameDimensions((prev) => ({ ...prev, xInit: newX }))

      if (canvasHelper) {
        canvasHelper.cellWidth =
          Math.round(canvasHelper.canvas.width / game.width) || 1
        canvasHelper.rePaintGame()
      }
    },
    [canvasHelper]
  )

  const updateHeight = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newY = parseInt(e.target.value)

      if (!Number.isSafeInteger(newY)) return

      game.updateDimensions({ h: newY })

      if (arrowKeysState.cursor > game.grid.length) {
        arrowKeysState.cursor = 0
      }

      setGameDimensions((prev) => ({ ...prev, yInit: newY }))

      if (canvasHelper) {
        canvasHelper.cellHeight =
          Math.round(canvasHelper.canvas.height / game.height) || 1
        canvasHelper.rePaintGame()
      }
    },
    [canvasHelper]
  )

  const handleNewFrame = useCallback(
    (game: GameOfLife) => {
      canvasHelper?.commitNewFrame()
      setCurrentFrame(game.currentFrame)
    },
    [canvasHelper]
  )

  useEffect(() => {
    const handleResize = () => {
      if (canvasHelper) {
        const maxSidelength = stageSideLengthJS()
        const dpr = window.devicePixelRatio || 1

        canvasHelper.canvas.width = Math.floor(maxSidelength * dpr)
        canvasHelper.canvas.height = Math.floor(maxSidelength * dpr)
        canvasHelper.cellWidth =
          Math.round(canvasHelper.canvas.width / game.width) || 1
        canvasHelper.cellHeight =
          Math.round(canvasHelper.canvas.height / game.width) || 1

        canvasHelper.rePaintGame()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasHelper])

  useEffect(() => {
    game.addCallback(handleNewFrame)
    return () => game.removeCallback(handleNewFrame)
  }, [game, handleNewFrame])

  return {
    game,
    initCanvas,
    handleCellClick,
    handleCellMouseOver,
    handleMouseLeave,
    handleNewFrame,
    handleSliderChange,
    updateWidth,
    updateHeight,
    arrowKeysState,
    currentFrame,
    fps,
    gameDimensions,
    canvasHelper,
  }
}
