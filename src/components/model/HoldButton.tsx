import clsx from 'clsx'
import type { ReactNode } from 'react'

// What is being held down, shared between the page's buttons (and keys)
// and the canvas: the set of moves held, and `wakers` the canvas fills
// to be asked for frames again, since it draws only on demand.
export interface Held<T> {
  held: Set<T>
  wakers: Set<() => void>
}

// A button held down to keep moving, for touch and mouse. Pressing
// captures the pointer, so that sliding off the button still lets go.
export function HoldButton<T>({
  move,
  holding,
  label,
  className,
  children,
}: {
  move: T
  holding: Held<T>
  label: string
  // Its size, if not the usual size-10, and where it sits.
  className?: string
  children: ReactNode
}) {
  const release = () => holding.held.delete(move)
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        holding.held.add(move)
        holding.wakers.forEach((wake) => wake())
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
      className={clsx(
        'flex size-10 touch-none items-center justify-center rounded-lg text-olive-200 transition-colors hover:bg-white/10 hover:text-white active:bg-white/15',
        className,
      )}
    >
      {children}
    </button>
  )
}
