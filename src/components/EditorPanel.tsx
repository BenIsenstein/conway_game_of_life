import { GameOfLife, CanvasHelper } from "models"
import { useRef, useState } from "react"
import { EditorMode } from 'types'
import Slider from 'rc-slider'
import { Menu } from '@headlessui/react'
import clsx from 'clsx'
import 'rc-slider/assets/index.css'
import './editor-panel.css'

type Props = {
    game: GameOfLife
    editorMode: React.MutableRefObject<EditorMode>
    canvasHelper: CanvasHelper
    handleNewFrame: (game: GameOfLife) => void
    dispatchZoom: (direction: boolean) => void
    handleSliderChange: (val: number | number[]) => void
    fps: number
    reRender: () => void
}

export const EditorPanel = ({
    game,
    handleNewFrame,
    dispatchZoom,
    handleSliderChange,
    reRender,
    fps,
    editorMode,
    canvasHelper
}: Props) => {
    const [wrapGrid, setWrapGrid] = useState(game.wrapGrid)
    const paintMode = useRef<null | HTMLButtonElement>(null)
    const clickPaintButton = () => paintMode.current?.click()
 
    return (
        <div className="w-[400px] bg-zinc-300 box-border p-12 flex flex-col items-center gap-9">
            <div className="flex gap-3">
                <button
                    onClick={() => game.start()}
                    className="bg-zinc-800 hover:bg-zinc-600 active:bg-zinc-500 rounded-md text-white p-3 text-lg font-medium"
                >
                    START
                </button>
                <button
                    onClick={() => game.stop()}
                    className="bg-zinc-800 hover:bg-zinc-600 active:bg-zinc-500 rounded-md text-white p-3 text-lg font-medium"
                >
                    STOP
                </button>
                <button
                    onClick={() => {
                        game.reset()
                        game.addCallback(handleNewFrame)
                        game.runCallbacks()
                    }}
                    className="bg-zinc-800 hover:bg-zinc-600 active:bg-zinc-500 rounded-md text-white p-3 text-lg font-medium"
                >
                    RESET
                </button>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <button
                        onClick={() => game.reverseFrame()}
                        className="bg-white hover:bg-zinc-200 active:bg-zinc-100 rounded-md text-zinc-800 p-1.5 w-28"
                    >
                        FRAME--
                    </button>
                    <button
                        onClick={() => game.runFrame()}
                        className="bg-white hover:bg-zinc-200 active:bg-zinc-100 rounded-md text-zinc-800 p-1.5 w-28"
                    >
                        FRAME++
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => dispatchZoom(true)}
                        className="bg-white hover:bg-zinc-200 active:bg-zinc-100 rounded-md text-zinc-800 p-1.5 w-28"
                    >
                        ZOOM OUT
                    </button>
                    <button
                        onClick={() => dispatchZoom(false)}
                        className="bg-white hover:bg-zinc-200 active:bg-zinc-100 rounded-md text-zinc-800 p-1.5 w-28"
                    >
                        ZOOM IN
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-1 self-start relative left-[15%]">
                <div className="flex gap-8">
                    <span className="text-zinc-800 font-medium">
                        WRAP WORLD:
                    </span>
                    <input
                        className=""
                        type='checkbox'
                        checked={wrapGrid}
                        onClick={() => {
                            game.toggleWrap()
                            setWrapGrid(game.wrapGrid)
                        }}
                    />
                </div>
                <div className="flex gap-3 items-center">
                    <span className="text-zinc-800 font-medium">{fps} FPS</span>
                    <Slider
                        min={1}
                        max={25}
                        step={1}
                        value={fps}
                        onChange={handleSliderChange}
                        className='slider'
                    />
                </div>
            </div>
            <div className="w-56 h-48 box-border flex justify-center gap-3 bg-none">
                <Menu as='div' className="flex flex-col w-24">
                    <Menu.Button ref={paintMode} className={({ open }) => clsx(open || editorMode.current !== EditorMode.NAVIGATE ? 'bg-zinc-100' : 'bg-white', 'w-24 h-10 mb-6 rounded-md text-zinc-800 p-1.5')} onMouseEnter={clickPaintButton}>
                        PAINT
                    </Menu.Button>
                    <Menu.Items className="flex flex-col w-72 box-border relative right-10" onMouseLeave={clickPaintButton}>
                        <svg width="10" height="10" className="absolute top-[-10px] left-10">
                            <polygon points="5,0 0,10 10,10" fill="white" />
                        </svg>
                        <Menu.Item
                            as='span'
                            className={({ active }) => clsx(active || editorMode.current === EditorMode.MOUSE_PAINT ? 'bg-zinc-200' : 'bg-white', 'flex items-center cursor-pointer h-8 box-border px-3 rounded-t-md overflow-hidden whitespace-nowrap text-ellipsis')}
                            onClick={() => {
                                    editorMode.current = EditorMode.MOUSE_PAINT
                                    if (canvasHelper.arrowKeysCursor.current) {
                                      canvasHelper.drawCellGameState(canvasHelper.arrowKeysCursor.current)
                                      // rePaintMinimap()
                                    }
                                    reRender()
                            }}
                        >
                            Paint with mouse
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            className={({ active }) => clsx(active || editorMode.current === EditorMode.ARROW_KEYS_PAINT_WITH_SPACE ? 'bg-zinc-200' : 'bg-white', 'flex items-center cursor-pointer h-8 box-border px-3 overflow-hidden whitespace-nowrap text-ellipsis')}
                            onClick={() => {
                                    editorMode.current = EditorMode.ARROW_KEYS_PAINT_WITH_SPACE
                                    if (canvasHelper.arrowKeysCursor.current) {
                                      canvasHelper.drawCellGameState(canvasHelper.arrowKeysCursor.current)
                                      // rePaintMinimap()
                                    }
                                    reRender()
                            }}
                        >
                            Paint with arrow keys and space
                        </Menu.Item>
                        <Menu.Item
                            as='span'
                            className={({ active }) => clsx(active || editorMode.current === EditorMode.ARROW_KEYS_PAINT_ON_MOVE ? 'bg-zinc-200' : 'bg-white', 'flex items-center cursor-pointer h-8 box-border px-3 rounded-b-md overflow-hidden whitespace-nowrap text-ellipsis')}
                            onClick={() => {
                                    editorMode.current = EditorMode.ARROW_KEYS_PAINT_ON_MOVE
                                    if (canvasHelper.arrowKeysCursor.current) {
                                      canvasHelper.drawCellGameState(canvasHelper.arrowKeysCursor.current)
                                      // rePaintMinimap()
                                    }
                                    reRender()
                            }}
                        >
                            Paint with arrow keys on move
                        </Menu.Item>
                    </Menu.Items>
                </Menu>
                <button
                    className={clsx(editorMode.current === EditorMode.NAVIGATE ? 'bg-zinc-100' : 'bg-white', 'hover:bg-zinc-200 active:bg-zinc-100 w-24 h-10 rounded-md text-zinc-800 p-1.5')}
                    onClick={() => {
                        editorMode.current = EditorMode.NAVIGATE
                        if (canvasHelper.arrowKeysCursor.current) {
                          canvasHelper.drawCellGameState(canvasHelper.arrowKeysCursor.current)
                          // rePaintMinimap()
                        }
                        reRender()
                    }}
                >
                    NAVIGATE
                </button>
            </div>
        </div>
    )
}