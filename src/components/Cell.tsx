import React from 'react'
import clsx from 'clsx'
import { usePaintWithArrowKeys } from 'utils'

export const Cell = (
  i: number,
  { current: { cursor, active }}: ReturnType<typeof usePaintWithArrowKeys>,
  alive: boolean,
  handleClick: React.MouseEventHandler,
  handleMouseOver: React.MouseEventHandler
) => (
  <div
    key={i}
    data-i={i}
    onClick={handleClick}
    onMouseOver={handleMouseOver}
    className={clsx(
      'cursor-none hover:bg-gray-400',
      alive ? 'bg-white' : 'bg-black',
      active && cursor === i ? 'animate-cursor' : ''
    )}
  />
)
