import { GameOfLife } from 'models'

export const createCellNeighborAddresses = (width: number) => ({
  topLeft: [1, width, width + 1],
  top: [-1, 1, width - 1, width, width + 1],
  topRight: [-1, width - 1, width],
  left: [-width, -width + 1, 1, width, width + 1],
  right: [-width - 1, -width, -1, width - 1, width],
  bottomLeft: [-width, -width + 1, 1],
  bottom: [-width - 1, -width, -width + 1, -1, 1],
  bottomRight: [-width - 1, -width, -1],
  full: [-1, 1, -width - 1, -width, -width + 1, width - 1, width, width + 1],
})

export const statusFromI = (
  i: number,
  game: GameOfLife
): keyof ReturnType<typeof createCellNeighborAddresses> => {
  const { grid, width, wrapGrid } = game

  if (wrapGrid) return 'full'
  if (i === 0) return 'topLeft'
  if (i === width - 1) return 'topRight'
  if (i === grid.length - width) return 'bottomLeft'
  if (i === grid.length - 1) return 'bottomRight'
  if (i < width) return 'top'
  if (i % width === 0) return 'left'
  if (i % width === width - 1) return 'right'
  if (i > grid.length - width) return 'bottom'
  return 'full'
}
