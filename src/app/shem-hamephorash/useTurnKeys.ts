import { useEffect } from 'react'

export type Direction = 'anticlockwise' | 'clockwise'

// The arrow keys turn the star: left (or up) anticlockwise, right (or
// down) clockwise. A key already handled, by a card that is up, is left
// alone.
export function useTurnKeys(turnBy: (direction: Direction) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') turnBy('anticlockwise')
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        turnBy('clockwise')
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turnBy])
}
