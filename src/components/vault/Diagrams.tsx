'use client'

// The three diagrams hung in the corners of the Vault; see lib/vault for
// which corner each starts in and how its board is cut.
//
// A board is taken hold of the moment the pointer goes down on it, and
// then it follows the pointer round the walls: it slides along them and
// up and down them, always facing the middle of the room and always lying
// against whatever is behind it -- flat on a wall, or standing out across
// a seam far enough for both its ends to clear. A press that lets go
// without having moved is a click, and takes the board down.
//
// So a drag that starts on a board moves the board rather than turning
// the view. A board is a small thing to aim at and the rest of the room
// is not, so there is plenty left to take hold of to look round by.

import { useThree, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Raycaster, Vector2 } from 'three'

import { Highlight, useTouch } from '@/components/model/touch'
import { useTexture } from '@/lib/canvasTexture'
import {
  DIAGRAMS,
  DIAGRAM_CENTRE,
  POSTER_HEIGHT,
  boardWidth,
  cornerAngle,
  diagramPlace,
  wallPoint,
  type Diagram,
} from '@/lib/vault'

import { diagramTexture } from './golden-dawn/diagrams'
import type { Furniture } from './types'

// How far the pointer must travel for a press to count as a drag rather
// than a click. Small enough not to be felt, and enough that a hand that
// shakes on the button still takes the board down.
const SLOP = 6 // px

// Where a board hangs: round the room, and up it. How far out from the
// middle that leaves it follows from the two (see diagramPlace).
interface Place {
  angle: number
  y: number
}

// One press being followed, from the pointer going down to it coming up.
interface Press {
  pointer: number
  // Where it went down, to tell a drag from a click.
  x: number
  y: number
  // How far the board sits from the point on the wall the pointer went
  // down on, so that it keeps the offset it was picked up with instead of
  // jumping its middle to the pointer. Null if the pointer was somehow
  // not on the walls at all, which leaves the press a click.
  grab: Place | null
  // Whether the pointer has travelled far enough to be moving the board.
  dragging: boolean
  move: (e: PointerEvent) => void
  up: () => void
}

function Plate({
  diagram,
  place,
  onPlace,
}: {
  diagram: Diagram
  place: Place
  onPlace: (place: Place) => void
}) {
  const invalidate = useThree((state) => state.invalidate)
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  // OrbitControls, which turns the view on a drag. While a board is being
  // moved the view has to hold still, or the board would run away under a
  // turning camera.
  const controls = useThree((state) => state.controls) as {
    enabled: boolean
  } | null
  const map = useTexture(() => diagramTexture(diagram, invalidate))
  const { lit, handlers } = useTouch(diagram.id)
  const [holding, setHolding] = useState(false)

  const { angle, y, reach } = diagramPlace(diagram, place.angle, place.y)
  const size: [number, number] = [boardWidth(diagram), POSTER_HEIGHT]

  // Where on the walls the pointer is: cast a ray through it and see
  // which wall it leaves by. The board itself is not consulted, so it can
  // be dragged out from under the pointer without losing hold of it.
  const caster = useRef(new Raycaster())
  const ndc = useRef(new Vector2())
  const under = useCallback(
    (cx: number, cy: number) => {
      const box = gl.domElement.getBoundingClientRect()
      if (!box.width || !box.height) return null
      ndc.current.set(
        ((cx - box.left) / box.width) * 2 - 1,
        -((cy - box.top) / box.height) * 2 + 1,
      )
      caster.current.setFromCamera(ndc.current, camera)
      const { origin, direction } = caster.current.ray
      return wallPoint(origin, direction)
    },
    [gl, camera],
  )

  // The press in hand, and the values its listeners need. Both are refs:
  // the listeners are put on the window when the pointer goes down and
  // have to see the board as it is now, not as it was then.
  const press = useRef<Press | null>(null)
  const live = useRef({ angle, y, onPlace, under, controls, invalidate })
  useEffect(() => {
    live.current = { angle, y, onPlace, under, controls, invalidate }
  })

  // True from the moment a board is taken hold of until the pointer goes
  // down again, so that letting go does not also count as a click and
  // take the board down.
  const moved = useRef(false)

  const release = useCallback(() => {
    const p = press.current
    if (!p) return
    press.current = null
    window.removeEventListener('pointermove', p.move)
    window.removeEventListener('pointerup', p.up)
    window.removeEventListener('pointercancel', p.up)
    if (p.grab && live.current.controls) live.current.controls.enabled = true
    setHolding(false)
  }, [])

  // A board taken down mid-drag must not leave the view turned off.
  useEffect(() => release, [release])

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const native = e.nativeEvent
    // The left button alone; a right-click is the browser's.
    if (native.pointerType === 'mouse' && native.button !== 0) return
    release()
    moved.current = false
    // Where on the walls the board was taken hold of, measured now so
    // that the board follows the pointer from the first pixel.
    const at = under(native.clientX, native.clientY)
    const turn = at ? angle - at.angle : 0
    const p: Press = {
      pointer: native.pointerId,
      x: native.clientX,
      y: native.clientY,
      grab: at
        ? {
            // Round the short way, so a board near due west is not
            // dragged the whole way round the room on being picked up.
            angle: Math.atan2(Math.sin(turn), Math.cos(turn)),
            y: y - at.y,
          }
        : null,
      dragging: false,
      move: (ev: PointerEvent) => {
        const held = press.current
        if (!held || ev.pointerId !== held.pointer || !held.grab) return
        if (
          !held.dragging &&
          Math.abs(ev.clientX - held.x) <= SLOP &&
          Math.abs(ev.clientY - held.y) <= SLOP
        ) {
          return // not yet far enough to be anything but a click
        }
        if (!held.dragging) {
          held.dragging = true
          // Letting go must not now also count as a click.
          moved.current = true
          setHolding(true)
        }
        const spot = live.current.under(ev.clientX, ev.clientY)
        if (!spot) return
        live.current.onPlace({
          angle: spot.angle + held.grab.angle,
          y: spot.y + held.grab.y,
        })
        live.current.invalidate()
      },
      up: release,
    }
    // The view holds still while a board is in hand, from the outset: a
    // board moving under a turning camera would run away from the hand.
    if (p.grab && live.current.controls) live.current.controls.enabled = false
    press.current = p
    window.addEventListener('pointermove', p.move)
    window.addEventListener('pointerup', p.up)
    window.addEventListener('pointercancel', p.up)
  }

  return (
    <mesh
      position={[Math.cos(angle) * reach, y, Math.sin(angle) * reach]}
      // A plane faces +Z; turn it to look at the middle of the room, so
      // that it lies along the wall it hangs on, or bisects the seam.
      rotation={[0, Math.atan2(-Math.cos(angle), -Math.sin(angle)), 0]}
      {...handlers}
      onPointerDown={onPointerDown}
      onClick={(e) => {
        if (moved.current) {
          e.stopPropagation()
          return
        }
        handlers.onClick(e)
      }}
    >
      <planeGeometry args={size} />
      <meshLambertMaterial map={map} />
      {/* Held, it stays marked however the pointer wanders off it. */}
      {(lit || holding) && (
        <Highlight>
          <planeGeometry args={size} />
        </Highlight>
      )}
    </mesh>
  )
}

// The three boards hang across the seams where walls meet. A corner here
// is 128.6 degrees, so a board across one lies nearly in the plane of
// both walls and takes about eight inches from each. Cutting the board to
// its plate rather than leaving it a full 22 inches wide is what keeps
// that number down.
//
// Where each has been moved to is kept here rather than in the boards, so
// that one taken down and put back comes back where it was left.
export function Diagrams({ present }: { present: Furniture }) {
  const [places, setPlaces] = useState<Record<string, Place>>(() =>
    Object.fromEntries(
      DIAGRAMS.map((d) => [
        d.id,
        { angle: cornerAngle(d.corner), y: DIAGRAM_CENTRE },
      ]),
    ),
  )
  return (
    <>
      {DIAGRAMS.filter((d) => present[d.id]).map((d) => (
        <Plate
          key={d.id}
          diagram={d}
          place={places[d.id]}
          onPlace={(place) => setPlaces((all) => ({ ...all, [d.id]: place }))}
        />
      ))}
    </>
  )
}
