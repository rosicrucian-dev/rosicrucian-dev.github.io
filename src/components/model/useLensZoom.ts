// Zooming the lens from inside a model: the mouse wheel and a two-finger
// pinch widen and narrow the camera's field of view, rather than moving
// it, as the models are seen from a standpoint within them.

import { useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import type { PerspectiveCamera } from 'three'

export function useLensZoom({
  enabled = true,
  fov,
  min,
  max,
  fallback,
  onZoom,
}: {
  // Off, the wheel and pinch are left to whatever else listens.
  enabled?: boolean
  // The field of view in degrees, held by the caller so it survives a
  // change of view; null until the caller has chosen one.
  fov: RefObject<number | null>
  min: number
  max: number
  // What to start from if `fov` is still null.
  fallback: number
  // Called with the new field of view after each step, for the caller to
  // match anything that depends on it (a drag turning more slowly when
  // zoomed in, so it still tracks what is under the finger).
  onZoom?: (fov: number) => void
}) {
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  // Read at the moment of zooming, so a new callback each render doesn't
  // tear the listeners down and up again.
  const zoomed = useRef(onZoom)
  useEffect(() => {
    zoomed.current = onZoom
  })

  useEffect(() => {
    if (!enabled) return
    const el = gl.domElement
    const camera = get().camera as PerspectiveCamera

    const zoomTo = (next: number) => {
      const clamped = Math.min(max, Math.max(min, next))
      fov.current = clamped
      camera.fov = clamped
      camera.updateProjectionMatrix()
      zoomed.current?.(clamped)
      invalidate()
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomTo((fov.current ?? fallback) * Math.exp(e.deltaY * 0.0012))
    }

    const fingers = new Map<number, { x: number; y: number }>()
    let pinch: { spread: number; fov: number } | null = null
    const spread = () => {
      const [a, b] = [...fingers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      fingers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (fingers.size === 2) {
        pinch = { spread: spread(), fov: fov.current ?? fallback }
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!fingers.has(e.pointerId)) return
      fingers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pinch && fingers.size === 2) {
        zoomTo((pinch.fov * pinch.spread) / Math.max(1, spread()))
      }
    }
    const onPointerUp = (e: PointerEvent) => {
      fingers.delete(e.pointerId)
      if (fingers.size < 2) pinch = null
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [enabled, fov, min, max, fallback, get, gl, invalidate])
}
