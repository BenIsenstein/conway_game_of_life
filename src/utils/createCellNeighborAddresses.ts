export const createCellNeighborAddresses = (height: number) => {
    return [
        -1,
        1,
        -height - 1,
        -height,
        -height + 1,
        height - 1,
        height,
        height + 1,
    ]
}