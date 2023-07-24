import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { NOOP, indexFromEventHOF, stageSideLengthJS } from 'utils'
import { Camera2D, CanvasHelper, GameOfLife } from 'models'
import { IHoverState, EditorMode } from 'types'
import { useMouseDown } from '.'

type CanvasMouseEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>
type CanvasScrollEvent = React.WheelEvent<HTMLCanvasElement>

const PAINT_KEY_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']
const NAVIGATE_KEY_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

export const useCanvasEventHandlers = () => {
  const [gameDimensions, setGameDimensions] = useState({
    __type: 'NEW' as const,
    xInit: 100,
    yInit: 100,
  })
  const game = useMemo(() => new GameOfLife(gameDimensions), [])
  const camera = useMemo(() => new Camera2D(game), [game])
  const minimapCamera = useMemo(() => new Camera2D(game, game.width), [game])
  const [canvasHelper, setCanvasHelper] = useState<CanvasHelper>()
  const [minimapHelper, setMinimapHelper] = useState<CanvasHelper>()
  const [currentFrame, setCurrentFrame] = useState(game.currentFrame)
  const [fps, setFps] = useState(1000 / game.frameLengthMs)
  const mouseDown = useMouseDown()
  const hoverState = useRef<IHoverState>({
    previous: null,
    current: null,
  }).current
  const editorMode = useRef<EditorMode>(EditorMode.MOUSE_PAINT)
  const arrowKeysCursor = useRef(camera.getLowestIndex())
  const indexFromEvent = useMemo(
    () => indexFromEventHOF(game, camera),
    [game, camera]
  )

  const initCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return

      setCanvasHelper(
        new CanvasHelper(
          canvas,
          game,
          camera,
          editorMode,
          arrowKeysCursor,
          hoverState
        )
      )
    },
    [game, camera]
  )

  const initMinimap = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return

      const helper = new CanvasHelper(
        canvas,
        game,
        minimapCamera,
        editorMode,
        arrowKeysCursor,
        hoverState,
        300,
        300
      )

      helper?.setColor('rgb(156, 163, 175, 0.4)')
      helper?.ctx?.fillRect(
        camera.x / game.width * helper?.canvas.width!,
        camera.y / game.height * helper?.canvas.height!,
        camera.sideLength / game.width * helper?.canvas.width!,
        camera.sideLength / game.height * helper?.canvas.height!,
      )

      setMinimapHelper(helper)
    },
    [game, minimapCamera, camera]
  )

  const handleSliderChange = useCallback((val: number | number[]) => {
    const newFps = Array.isArray(val) ? val[0] : val
    game.updateInterval(1000 / newFps)
    setFps(newFps)
  }, [])

  const updateWidth = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newX = parseInt(e.target.value)
      let shouldRePaintGame = false
      let shouldRePaintCursor = false

      if (!Number.isSafeInteger(newX)) return

      game.updateDimensions({ w: newX })

      if (!camera.isCameraInGame()) {
        camera.reset()
        shouldRePaintGame = true
      }

      if (!camera.isIndexInCamera(arrowKeysCursor.current)) {
        arrowKeysCursor.current = camera.getLowestIndex()
        shouldRePaintCursor = true
      }

      setGameDimensions((prev) => ({ ...prev, xInit: newX }))

      if (canvasHelper) {
        if (shouldRePaintGame) {
          canvasHelper.syncCellSize()
          canvasHelper.rePaintGame()
          return
        }
        if (shouldRePaintCursor) {
          canvasHelper.drawCellGameState(arrowKeysCursor.current)
        }
      }
    },
    [canvasHelper]
  )

  const updateHeight = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newY = parseInt(e.target.value)
      let shouldRePaintGame = false
      let shouldRePaintCursor = false

      if (!Number.isSafeInteger(newY)) return

      game.updateDimensions({ h: newY })

      if (!camera.isCameraInGame()) {
        camera.reset()
        shouldRePaintGame = true
      }

      if (!camera.isIndexInCamera(arrowKeysCursor.current)) {
        arrowKeysCursor.current = camera.getLowestIndex()
        shouldRePaintCursor = true
      }

      setGameDimensions((prev) => ({ ...prev, yInit: newY }))

      if (canvasHelper) {
        if (shouldRePaintGame) {
          canvasHelper.syncCellSize()
          canvasHelper.rePaintGame()
          return
        }
        if (shouldRePaintCursor) {
          canvasHelper.drawCellGameState(arrowKeysCursor.current)
        }
      }
    },
    [canvasHelper]
  )

  const rePaintMinimap = useCallback(() => {
    minimapHelper?.syncCellSize()
    minimapHelper?.rePaintGame()
    minimapHelper?.setColor('rgb(156, 163, 175, 0.4)')
    minimapHelper?.ctx?.fillRect(
      camera.x / game.width * minimapHelper?.canvas.width!,
      camera.y / game.height * minimapHelper?.canvas.height!,
      camera.sideLength / game.width * minimapHelper?.canvas.width!,
      camera.sideLength / game.height * minimapHelper?.canvas.height!,
    )
  }, [minimapHelper, camera, game])

  const eventHandlers = useMemo(() => {
    const clearHover = () => {
      // const prevI = hoverState.previous!
      hoverState.previous = null
      hoverState.current = null
      // canvasHelper?.drawCellGameState(prevI)
      // minimapHelper?.drawCellGameState(prevI)
      canvasHelper?.rePaintGame()
      rePaintMinimap()
    }

    const rePaintHover = (e: CanvasMouseEvent) => {
      const currI = indexFromEvent(e)
      const prevI = hoverState.previous
      if (currI < 0 || currI === prevI) return
      hoverState.current = currI
      hoverState.previous = currI
      // if (prevI !== null) {
      //   canvasHelper?.drawCellGameState(prevI)
      //   minimapHelper?.drawCellGameState(prevI)
      // }
      // canvasHelper?.drawCellGameState(currI)
      // minimapHelper?.drawCellGameState(currI)
      canvasHelper?.rePaintGame()
      rePaintMinimap()
    }

    const handleScroll = (e: CanvasScrollEvent) => {
      requestIdleCallback(() => {
        e.stopPropagation()
        const { deltaY } = e
        if (deltaY > 0) camera.zoomOut()
        if (deltaY < 0) camera.zoomIn()
        canvasHelper?.syncCellSize()
        canvasHelper?.rePaintGame()
        rePaintMinimap()
      })
    }

    const map = {
      [EditorMode.MOUSE_PAINT]: {
        mouseLeave: clearHover,
        mouseDown: (e: CanvasMouseEvent) => {
          const i = indexFromEvent(e)
          if (i < 0) return
          game.toggleCellAlive(i)
        },
        mouseMove: (e: CanvasMouseEvent) => {
          const currI = indexFromEvent(e)
          const prevI = hoverState.previous
          if (currI < 0 || currI === prevI) return
          hoverState.current = currI
          hoverState.previous = currI
          // if (prevI !== null) {
          //   canvasHelper?.drawCellGameState(prevI)
          // }
          if (mouseDown.current) {
            game.toggleCellAlive(currI)
            return
          } else {
            canvasHelper?.rePaintGame()
            rePaintMinimap()
          }
          // canvasHelper?.drawCellGameState(currI)
        },
        keyDown: NOOP,
        scroll: handleScroll,
      },
      [EditorMode.ARROW_KEYS_PAINT_ON_MOVE]: {
        mouseLeave: clearHover,
        mouseDown: (e: CanvasMouseEvent) => {
          const i = indexFromEvent(e)
          if (i < 0) return
          //game.pushUpdate(arrowKeysCursor.current)
          arrowKeysCursor.current = i
          game.toggleCellAlive(i)
        },
        mouseMove: rePaintHover,
        keyDown: (e: KeyboardEvent) => {
          if (!PAINT_KEY_CODES.includes(e.key)) return
          const prevCursor = arrowKeysCursor.current
          let nextCursor: number

          switch (e.key) {
            case 'ArrowUp':
              nextCursor = arrowKeysCursor.current - game.width
              break
            case 'ArrowDown':
              nextCursor = arrowKeysCursor.current + game.width
              break
            case 'ArrowLeft':
              nextCursor = arrowKeysCursor.current - 1
              break
            case 'ArrowRight':
              nextCursor = arrowKeysCursor.current + 1
              break
            case ' ':
              game.toggleCellAlive(arrowKeysCursor.current)
              return
            default:
              throw new Error('Invalid key')
          }

          const leftFromGameLeft = nextCursor % game.width
          const topFromGameTop = Math.floor(nextCursor / game.width)
          const isFlushWithLeftEdge = leftFromGameLeft + 1 === camera.x
          const isOutOfCameraOnLeft = leftFromGameLeft + 1 < camera.x
          const isFlushWithRightEdge = leftFromGameLeft === camera.x + camera.sideLength
          const isOutOfCameraOnRight = leftFromGameLeft > camera.x + camera.sideLength
          const isFlushWithTopEdge = topFromGameTop + 1 === camera.y
          const isOutOfCameraOnTop = topFromGameTop + 1 < camera.y
          const isFlushWithBottomEdge = topFromGameTop === camera.y + camera.sideLength
          const isOutOfCameraOnBottom = topFromGameTop > camera.y + camera.sideLength

          if (isFlushWithLeftEdge) {
            nextCursor += camera.sideLength
          }
          if (isOutOfCameraOnLeft) {
            nextCursor += Math.ceil(camera.sideLength) + 1
          }
          if (isFlushWithRightEdge) {
            nextCursor -= camera.sideLength
          }
          if (isOutOfCameraOnRight) {
            nextCursor -= Math.ceil(camera.sideLength) + 1
          }
          if (isFlushWithTopEdge) {
            nextCursor += game.width * camera.sideLength
          }
          if (isOutOfCameraOnTop) {
            nextCursor += game.width * (Math.ceil(camera.sideLength) + 1)
          }
          if (isFlushWithBottomEdge) {
            nextCursor -= game.width * camera.sideLength
          }
          if (isOutOfCameraOnBottom) {
            nextCursor -= game.width * (Math.ceil(camera.sideLength) + 1)
          }

          arrowKeysCursor.current = nextCursor
          //game.pushUpdate(prevCursor)
          game.toggleCellAlive(nextCursor)
        },
        scroll: handleScroll,
      },
      [EditorMode.ARROW_KEYS_PAINT_WITH_SPACE]: {
        mouseLeave: clearHover,
        mouseDown: (e: CanvasMouseEvent) => {
          const i = indexFromEvent(e)
          if (i < 0) return
          //game.pushUpdate(arrowKeysCursor.current)
          arrowKeysCursor.current = i
          //game.pushUpdate(i)
          game.runCallbacks()
        },
        mouseMove: rePaintHover,
        keyDown: (e: KeyboardEvent) => {
          if (!PAINT_KEY_CODES.includes(e.key)) return
          const prevCursor = arrowKeysCursor.current
          let nextCursor: number

          switch (e.key) {
            case 'ArrowUp':
              nextCursor = arrowKeysCursor.current - game.width
              break
            case 'ArrowDown':
              nextCursor = arrowKeysCursor.current + game.width
              break
            case 'ArrowLeft':
              nextCursor = arrowKeysCursor.current - 1
              break
            case 'ArrowRight':
              nextCursor = arrowKeysCursor.current + 1
              break
            case ' ':
              game.toggleCellAlive(arrowKeysCursor.current)
              return
            default:
              throw new Error('Invalid key')
          }

          const leftFromGameLeft = nextCursor % game.width
          const topFromGameTop = Math.floor(nextCursor / game.width)
          const isFlushWithLeftEdge = leftFromGameLeft + 1 === camera.x
          const isOutOfCameraOnLeft = leftFromGameLeft + 1 < camera.x
          const isFlushWithRightEdge = leftFromGameLeft === camera.x + camera.sideLength
          const isOutOfCameraOnRight = leftFromGameLeft > camera.x + camera.sideLength
          const isFlushWithTopEdge = topFromGameTop + 1 === camera.y
          const isOutOfCameraOnTop = topFromGameTop + 1 < camera.y
          const isFlushWithBottomEdge = topFromGameTop === camera.y + camera.sideLength
          const isOutOfCameraOnBottom = topFromGameTop > camera.y + camera.sideLength

          if (isFlushWithLeftEdge) {
            nextCursor += camera.sideLength
          }
          if (isOutOfCameraOnLeft) {
            nextCursor += Math.ceil(camera.sideLength) + 1
          }
          if (isFlushWithRightEdge) {
            nextCursor -= camera.sideLength
          }
          if (isOutOfCameraOnRight) {
            nextCursor -= Math.ceil(camera.sideLength) + 1
          }
          if (isFlushWithTopEdge) {
            nextCursor += game.width * camera.sideLength
          }
          if (isOutOfCameraOnTop) {
            nextCursor += game.width * (Math.ceil(camera.sideLength) + 1)
          }
          if (isFlushWithBottomEdge) {
            nextCursor -= game.width * camera.sideLength
          }
          if (isOutOfCameraOnBottom) {
            nextCursor -= game.width * (Math.ceil(camera.sideLength) + 1)
          }

          arrowKeysCursor.current = nextCursor
          //game.pushUpdate(prevCursor)
          //game.pushUpdate(nextCursor)
          game.runCallbacks()
        },
        scroll: handleScroll,
      },
      [EditorMode.NAVIGATE]: {
        mouseLeave: NOOP,
        mouseDown: NOOP,
        mouseMove: (e: CanvasMouseEvent) => {
          if (!mouseDown.current) return
          const dpr = window.devicePixelRatio || 1
          const k = 1.5
          const { movementX, movementY } = e
          const deltaX = Math.abs(movementX) * dpr * k / canvasHelper?.cellWidth!
          const deltaY = Math.abs(movementY) * dpr * k / canvasHelper?.cellHeight!
          if (movementX > 0) camera.moveLeft(deltaX)
          if (movementX < 0) camera.moveRight(deltaX)
          if (movementY > 0) camera.moveUp(deltaY)
          if (movementY < 0) camera.moveDown(deltaY)
          canvasHelper?.rePaintGame()
          rePaintMinimap()
        },
        keyDown: (e: KeyboardEvent) => {
          if (!NAVIGATE_KEY_CODES.includes(e.key)) return

          switch (e.key) {
            case 'ArrowUp':
              camera.moveUp()
              break
            case 'ArrowDown':
              camera.moveDown()
              break
            case 'ArrowLeft':
              camera.moveLeft()
              break
            case 'ArrowRight':
              camera.moveRight()
              break
            default:
              throw new Error('Invalid key')
          }

          canvasHelper?.rePaintGame()
          rePaintMinimap()
        },
        scroll: handleScroll,
      },
    }

    return map
  }, [game, indexFromEvent, canvasHelper, camera, rePaintMinimap])

  const handleScroll = useCallback(
    (e: CanvasScrollEvent) => {
      eventHandlers[editorMode.current].scroll(e)
    },
    [eventHandlers]
  )

  const handleMouseMove = useCallback(
    (e: CanvasMouseEvent) => {
      eventHandlers[editorMode.current].mouseMove(e)
    },
    [eventHandlers]
  )

  const handleMouseLeave = useCallback(() => {
    eventHandlers[editorMode.current].mouseLeave()
  }, [eventHandlers])

  const handleMouseDown = useCallback(
    (e: CanvasMouseEvent) => {
      eventHandlers[editorMode.current].mouseDown(e)
    },
    [eventHandlers]
  )

  const dispatchZoom = useCallback((direction: boolean) => {
    const e = {
      stopPropagation: NOOP,
      deltaY: direction ? 2 : -2
    } as unknown as CanvasScrollEvent

    for (let count = 0; count < 30; count++) {
      eventHandlers[EditorMode.NAVIGATE].scroll(e)
    }
  }, [canvasHelper])

  const handleNewFrame = useCallback(
    (game: GameOfLife) => {
      canvasHelper?.rePaintGame()
      rePaintMinimap()
      if (game?.currentFrame) {
        setCurrentFrame(game.currentFrame)
      }
    },
    [canvasHelper, game, rePaintMinimap]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      eventHandlers[editorMode.current].keyDown(e)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [eventHandlers])

  useEffect(() => {
    const handleResize = () => {
      if (canvasHelper) {
        const maxSidelength = stageSideLengthJS()
        const dpr = window.devicePixelRatio || 1

        canvasHelper.canvas.width = Math.floor(maxSidelength * dpr)
        canvasHelper.canvas.height = Math.floor(maxSidelength * dpr)
        canvasHelper.syncCellSize()
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
    initMinimap,
    handleMouseDown,
    handleMouseMove,
    handleMouseLeave,
    handleNewFrame,
    handleSliderChange,
    handleScroll,
    updateWidth,
    updateHeight,
    dispatchZoom,
    arrowKeysCursor,
    currentFrame,
    fps,
    gameDimensions,
    canvasHelper,
    editorMode,
  }
}
