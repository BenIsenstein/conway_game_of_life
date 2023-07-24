import { GameOfLife } from 'models'

export type NewFrameCallback = (game: GameOfLife) => void

export interface INewGameOfLifeConfig {
  __type: 'NEW'
  xInit: number
  yInit: number
}

export interface ISavedGameOfLife {
  __type: 'SAVED'
  width: number
  height: number
  currentFrame: number
  frameLengthMs: number
  wrapGrid: boolean
  grid: boolean[]
  history: number[][]
}

export interface IHoverState {
  previous: number | null
  current: number | null
}

export enum EditorMode {
  MOUSE_PAINT,
  ARROW_KEYS_PAINT_WITH_SPACE,
  ARROW_KEYS_PAINT_ON_MOVE,
  NAVIGATE,
}
