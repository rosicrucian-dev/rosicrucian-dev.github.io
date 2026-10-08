import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ComponentRef } from 'react'
import { Euler, Vector3, type PerspectiveCamera } from 'three'
import { useLensZoom } from '@/components/model/useLensZoom'
import { sphereCentre, type TreeLayout } from '@/lib/treeOfLife'
import type { SephirahId } from '@/lib/tree'
import { sameLocation, whereIs } from './inside/walking'
import {
  FRAME_PADDING,
  HEADER_HEIGHT,
  OVERVIEW_FOV,
  overviewFrame,
} from './layout'
import { Location, Stride, Strides, View } from './types'

// ---- Camera knobs (tweak freely) -----------------------------------------------
export const FOV = 75
const FOV_PORTRAIT = 95
const MIN_FOV = 35
const MAX_FOV = 110
// Turning with the arrow keys, radians per second.
const TURN_SPEED = 1.6
const TILT_SPEED = 1.1
const MAX_TILT = (80 * Math.PI) / 180
// Dragging: radians per pixel at the standard field of view.
const DRAG_SPEED = 0.0042
// Walking, units per second: a slow, even pace, so you can take a path as
// slowly as you like and stop anywhere along it.
const WALK_SPEED = 3.2

export function Rig({
  view,
  room,
  layout,
  strides,
  resets,
  onArrive,
  onLocation,
}: {
  view: View
  room: SephirahId
  layout: TreeLayout
  strides: Strides
  resets: number
  onArrive: (id: SephirahId) => void
  onLocation: (location: Location) => void
}) {
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const fov = useRef<number | null>(null)
  const yaw = useRef(0)
  const pitch = useRef(0)
  const held = useRef(new Set<string>())
  const where = useRef<Location | null>(null)
  const inside = view === 'inside'

  const place = useMemo(() => new Vector3(), [])
  const euler = useMemo(() => new Euler(0, 0, 0, 'YXZ'), [])

  // Telling the page where you are, when that changes; arriving in a room
  // is remembered as the room to start in next time.
  const locate = () => {
    const now = whereIs(place.x, place.z, where.current)
    if (!now || sameLocation(now, where.current)) return
    where.current = now
    onLocation(now)
    if (now.kind === 'room') onArrive(now.room.id)
  }

  // Start (and come back from the overview) standing at the centre of the
  // chosen room, facing towards Kether.
  useEffect(() => {
    if (!inside) return
    const current = where.current
    if (current?.kind !== 'room' || current.room.id !== room) {
      place.set(...sphereCentre(room))
      yaw.current = 0
      pitch.current = 0
      where.current = null
      locate()
    } else if (place.lengthSq() === 0) {
      place.set(...sphereCentre(room))
    }
    const camera = get().camera as PerspectiveCamera
    if (fov.current === null) {
      const { clientWidth, clientHeight } = gl.domElement
      fov.current = clientWidth < clientHeight ? FOV_PORTRAIT : FOV
    }
    camera.fov = fov.current
    camera.updateProjectionMatrix()
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inside, room])

  // The page's buttons ask for frames when pressed.
  useEffect(() => {
    strides.wakers.add(invalidate)
    return () => {
      strides.wakers.delete(invalidate)
    }
  }, [strides, invalidate])

  // The keyboard: W A S D walk, for as long as they are held; the arrows
  // look round.
  useEffect(() => {
    if (!inside) return
    const KEYS: Record<string, Stride> = {
      KeyW: 'forward',
      KeyS: 'back',
      KeyA: 'left',
      KeyD: 'right',
    }
    const typing = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      return !!t?.closest('input, textarea, select, button')
    }
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e)) return
      if (KEYS[e.code]) {
        e.preventDefault()
        strides.held.add(KEYS[e.code])
        invalidate()
      } else if (e.code.startsWith('Arrow')) {
        e.preventDefault()
        held.current.add(e.code)
        invalidate()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      held.current.delete(e.code)
      if (KEYS[e.code]) strides.held.delete(KEYS[e.code])
    }
    const release = () => {
      held.current.clear()
      strides.held.clear()
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', release)
      release()
    }
  }, [inside, strides, invalidate])

  // Dragging looks round, at a rate that tracks the pointer whatever the
  // zoom.
  useEffect(() => {
    if (!inside) return
    const el = gl.domElement
    let last: { x: number; y: number; id: number } | null = null
    let fingers = 0
    const onDown = (e: PointerEvent) => {
      fingers++
      last =
        fingers === 1 ? { x: e.clientX, y: e.clientY, id: e.pointerId } : null
    }
    const onMove = (e: PointerEvent) => {
      if (!last || e.pointerId !== last.id) return
      const k = (DRAG_SPEED * (fov.current ?? FOV)) / FOV
      yaw.current += (e.clientX - last.x) * k
      pitch.current = Math.max(
        -MAX_TILT,
        Math.min(MAX_TILT, pitch.current + (e.clientY - last.y) * k),
      )
      last = { x: e.clientX, y: e.clientY, id: e.pointerId }
      invalidate()
    }
    const onUp = () => {
      fingers = Math.max(0, fingers - 1)
      last = null
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [inside, gl, invalidate])

  useLensZoom({
    enabled: inside,
    fov,
    min: MIN_FOV,
    max: MAX_FOV,
    fallback: FOV,
  })

  // The overview: the whole floor plan from above and behind Malkuth, to
  // turn round and zoom like a model in the hand.
  const orbit = useRef<ComponentRef<typeof OrbitControls>>(null)
  // The canvas's size: a new size (a phone turned, a window resized)
  // frames the Tree afresh.
  const size = useThree((s) => s.size)
  const { middle, width, height } = useMemo(
    () => overviewFrame(layout),
    [layout],
  )
  useEffect(() => {
    if (inside) return
    const camera = get().camera as PerspectiveCamera
    // Straight down on the whole Tree, Kether at the top, as BOTA paints
    // it: far enough back for the Tree and its glow to fill the window
    // below the header.
    const { clientWidth, clientHeight } = gl.domElement
    // Fitted into the window below the header, with a little clear space
    // all round, and centred there rather than in the whole window.
    const header =
      document.querySelector('header')?.getBoundingClientRect().bottom ??
      HEADER_HEIGHT
    const tall = clientHeight - header - 2 * FRAME_PADDING
    const wide = clientWidth - 2 * FRAME_PADDING
    const tan = Math.tan(((OVERVIEW_FOV / 2) * Math.PI) / 180)
    const distance = Math.max(
      (height * clientHeight) / (2 * tan * tall),
      (width * clientHeight) / (2 * tan * wide),
    )
    const perPixel = (2 * distance * tan) / clientHeight
    // Looking at a point half the header's height above the middle (up
    // the screen is towards Kether, -Z), so the middle sits midway down
    // the space below the header.
    const target = middle
      .clone()
      .add(new Vector3(0, 0, (-header / 2) * perPixel))
    camera.fov = OVERVIEW_FOV
    camera.updateProjectionMatrix()
    // A hair towards Malkuth, so that "up" on the screen is towards
    // Kether and the turning controls have a direction to start from.
    camera.position.set(target.x, distance, target.z + distance * 1e-4)
    camera.lookAt(target)
    if (orbit.current) {
      orbit.current.target.copy(target)
      orbit.current.minDistance = distance * 0.35
      orbit.current.maxDistance = distance * 2.5
      orbit.current.update()
    }
    invalidate()
    // `size` and `resets` aren't read, but a new size or a press of the
    // reset button frames it again.
  }, [inside, get, gl, invalidate, middle, width, height, size, resets])

  // A trackpad sends both its pinch and its two-finger scroll as wheel
  // events, which the turning controls would both take for zoom. The pinch
  // comes with ctrlKey set and is left to them; a scroll slides the view
  // instead, as on a map. A mouse wheel, which moves in whole notches,
  // still zooms.
  useEffect(() => {
    if (inside) return
    const canvas = gl.domElement
    const right = new Vector3()
    const up = new Vector3()
    const onWheel = (e: WheelEvent) => {
      const controls = orbit.current
      if (!controls || e.ctrlKey || e.deltaMode !== 0) return
      // Trackpads report a wheelDelta three times the pixel delta; a
      // mouse reports it in notches of 120.
      const notch = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
      const trackpad =
        e.deltaX !== 0 ||
        (notch !== undefined
          ? notch === -3 * e.deltaY
          : !Number.isInteger(e.deltaY))
      if (!trackpad) return
      // Taken before the controls, which listen further out, see it.
      e.preventDefault()
      e.stopPropagation()
      const camera = get().camera as PerspectiveCamera
      const distance = camera.position.distanceTo(controls.target)
      const perPixel =
        (2 * distance * Math.tan(((camera.fov / 2) * Math.PI) / 180)) /
        canvas.clientHeight
      right.setFromMatrixColumn(camera.matrix, 0)
      up.setFromMatrixColumn(camera.matrix, 1)
      const shift = right
        .multiplyScalar(e.deltaX * perPixel)
        .addScaledVector(up, -e.deltaY * perPixel)
      camera.position.add(shift)
      controls.target.add(shift)
      controls.update()
      invalidate()
    }
    canvas.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => canvas.removeEventListener('wheel', onWheel, { capture: true })
  }, [inside, get, gl, invalidate])

  useFrame(({ camera }, delta) => {
    if (!inside) return
    const dt = Math.min(delta, 0.05)
    const keys = held.current
    let moving = false
    if (keys.size) {
      const turn =
        (keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)
      const tilt =
        (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)
      yaw.current += turn * TURN_SPEED * dt
      pitch.current = Math.max(
        -MAX_TILT,
        Math.min(MAX_TILT, pitch.current + tilt * TILT_SPEED * dt),
      )
      moving = true
    }

    // Walking on the level, relative to where you look; at a wall you
    // slide along it rather than stop.
    const b = strides.held
    const ahead = (b.has('forward') ? 1 : 0) - (b.has('back') ? 1 : 0)
    const side = (b.has('right') ? 1 : 0) - (b.has('left') ? 1 : 0)
    if (ahead || side) {
      const fx = -Math.sin(yaw.current)
      const fz = -Math.cos(yaw.current)
      let mx = fx * ahead - fz * side
      let mz = fz * ahead + fx * side
      const len = Math.hypot(mx, mz)
      mx = (mx / len) * WALK_SPEED * dt
      mz = (mz / len) * WALK_SPEED * dt
      const { x, y, z } = place
      const tryStep = (nx: number, nz: number) => {
        if (!whereIs(nx, nz, where.current)) return false
        place.set(nx, y, nz)
        return true
      }
      if (!tryStep(x + mx, z + mz)) if (!tryStep(x + mx, z)) tryStep(x, z + mz)
      locate()
      moving = true
    }

    camera.position.copy(place)
    euler.set(pitch.current, yaw.current, 0)
    camera.quaternion.setFromEuler(euler)
    if (moving) invalidate()
  })

  return inside ? null : (
    <OrbitControls
      ref={orbit}
      makeDefault
      target={middle}
      // Zooming closes in on whatever is under the pointer, as on a map;
      // a right-drag, or two fingers, slides the view.
      zoomToCursor
      enablePan
      screenSpacePanning
      rotateSpeed={0.6}
      zoomSpeed={0.8}
    />
  )
}
