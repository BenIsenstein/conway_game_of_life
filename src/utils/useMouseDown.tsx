import { useEffect, useState } from "react"

export const useMouseDown = () => {
    const [mouseDown, setMouseDown] = useState(false)

    useEffect(() => {
        const handleMouseDown = () => setMouseDown(true)
        const handleMouseUp = () => setMouseDown(false)

        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    return mouseDown
}
