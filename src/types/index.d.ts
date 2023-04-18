import { GOLCell } from "../models"

export type XVal = number
export type YVal = number

export type GOLGrid = Record<XVal, Record<YVal, GOLCell>>

export type NewGridCallback = (newGrid: GOLGrid) => void