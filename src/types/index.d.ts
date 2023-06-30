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

export interface IArrowKeysState {
  active: boolean
  cursor: number
  paintOnMove: boolean
}

export interface IHoverState {
  previous: number | null
  current: number | null
}
