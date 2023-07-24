import { useEffect, useRef } from 'react'

export const useMouseDown = () => {
  const mouseDown = useRef(false)

  useEffect(() => {
    const handleMouseDown = () => (mouseDown.current = true)
    const handleMouseUp = () => (mouseDown.current = false)

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return mouseDown
}
