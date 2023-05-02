export const createCellNeighborAddresses = (height: number) => [
    -1,
    1,
    -height - 1,
    -height,
    -height + 1,
    height - 1,
    height,
    height + 1,
]
