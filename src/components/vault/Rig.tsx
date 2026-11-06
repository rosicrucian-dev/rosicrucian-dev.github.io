'use client'

// The viewer in the Vault: where they start, how they walk and look
// about, what stops them, and which wall they face.

import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'

import { useLensZoom } from '@/components/model/useLensZoom'
import { ALTAR, INRADIUS, PASTOS, WALL_HEIGHT, wallAngle } from '@/lib/vault'

import type { Furniture, Motion, Move } from './types'

// Where the viewer starts: just inside the door in the West, where the
// Aspirant enters, looking East.
export const EYE_HEIGHT = 5.4
const START = {
  at: new Vector3(-INRADIUS * 0.74, EYE_HEIGHT, 0),
  facing: new Vector3(1, -0.08, 0),
}

const KEYS: Record<string, Move> = {
  KeyW: 'forward',
  KeyS: 'back',
  KeyA: 'left',
  KeyD: 'right',
  KeyE: 'up',
  KeyQ: 'down',
  ArrowLeft: 'turnLeft',
  ArrowRight: 'turnRight',
  ArrowUp: 'lookUp',
  ArrowDown: 'lookDown',
}

// ---- Camera knobs (tweak freely) -----------------------------------------------
const WALK_SPEED = 4 // feet per second
const CLIMB_SPEED = 3
const TURN_SPEED = Math.PI / 2 // radians per second
const TILT_SPEED = Math.PI / 3
const MAX_TILT = (85 * Math.PI) / 180 // furthest the view looks up or down
const MIN_EYE = 0.6 // lowest the eye goes, feet above the floor
const CLEARANCE = 0.4 // nearest the eye comes to a wall or the furniture
export const EPS = 0.001
export const FOV = 70
const FOV_PORTRAIT = 90
const MIN_FOV = 30
const MAX_FOV = 105
const ROTATE_SPEED = 0.35

// Keeps the eye at `p` inside the room, between floor and ceiling, and
// out of the altar and the Pastos. `from` is where it was a moment ago:
// arriving over a piece of furniture from above, it is held on top;
// otherwise it is pushed out sideways.
function confine(p: Vector3, from: Vector3, present: Furniture) {
  p.y = Math.min(WALL_HEIGHT - CLEARANCE, Math.max(MIN_EYE, p.y))
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < 7; i++) {
      const a = wallAngle(i)
      const nx = Math.cos(a)
      const nz = Math.sin(a)
      const over = p.x * nx + p.z * nz - (INRADIUS - CLEARANCE)
      if (over > 0) {
        p.x -= over * nx
        p.z -= over * nz
      }
    }
  }
  // The Pastos: a box along X.
  const top = PASTOS.height + PASTOS.lid + CLEARANCE
  const hx = PASTOS.length / 2 + CLEARANCE
  const hz = PASTOS.width / 2 + CLEARANCE
  if (present.pastos && p.y < top && Math.abs(p.x) < hx && Math.abs(p.z) < hz) {
    if (from.y >= top) p.y = top
    else {
      const dx = hx - Math.abs(p.x)
      const dz = hz - Math.abs(p.z)
      if (dx < dz) p.x = Math.sign(p.x || 1) * hx
      else p.z = Math.sign(p.z || 1) * hz
    }
  }
  // The altar: a drum over the middle of the Pastos.
  if (present.altar) {
    const altarTop = ALTAR.height + CLEARANCE
    const r = ALTAR.radius + CLEARANCE
    const d = Math.hypot(p.x, p.z)
    if (p.y < altarTop && d < r) {
      if (from.y >= altarTop) p.y = altarTop
      else if (d > 1e-6) {
        p.x *= r / d
        p.z *= r / d
      } else p.x = -r
    }
  }
}

export function Rig({
  present,
  motion,
}: {
  present: Furniture
  motion: Motion
}) {
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const fov = useRef<number | null>(null)

  // Stand at the start, looking the way the room is used.
  useEffect(() => {
    const camera = get().camera as PerspectiveCamera
    if (fov.current === null) {
      const { clientWidth, clientHeight } = gl.domElement
      fov.current = clientWidth < clientHeight ? FOV_PORTRAIT : FOV
    }
    const { at, facing } = START
    camera.position.copy(at).addScaledVector(facing.clone().normalize(), -EPS)
    camera.fov = fov.current
    camera.updateProjectionMatrix()
    if (controls.current) {
      controls.current.target.copy(at)
      controls.current.rotateSpeed = (-ROTATE_SPEED * fov.current) / FOV
      controls.current.update()
    }
    invalidate()
  }, [get, gl, invalidate])

  // The keyboard. Keys typed into a field, or Space and Enter on a
  // button, are left alone; letting go of the window lets go of all.
  useEffect(() => {
    motion.wakers.add(invalidate)
    const typing = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return false
      if (t.closest('input, textarea, select, [contenteditable="true"]'))
        return true
      return (e.code === 'Space' || e.code === 'Enter') && !!t.closest('button')
    }
    const onDown = (e: KeyboardEvent) => {
      const move = KEYS[e.code]
      if (!move || e.metaKey || e.ctrlKey || e.altKey || typing(e)) return
      e.preventDefault()
      motion.held.add(move)
      invalidate()
    }
    const onUp = (e: KeyboardEvent) => {
      const move = KEYS[e.code]
      if (move) motion.held.delete(move)
    }
    const release = () => motion.held.clear()
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', release)
      motion.wakers.delete(invalidate)
      release()
    }
  }, [motion, invalidate])

  // Gliding while a move is held: the look point and the eye move
  // together, so the view turns no differently.
  const step = useRef({
    forward: new Vector3(),
    right: new Vector3(),
    from: new Vector3(),
    to: new Vector3(),
  })
  useFrame(({ camera }, delta) => {
    const held = motion.held
    const orbit = controls.current
    if (!held.size || !orbit) return
    const dt = Math.min(delta, 0.05)
    const { forward, right, from, to } = step.current
    camera.getWorldDirection(forward)
    forward.y = 0
    if (forward.lengthSq() < 1e-8) forward.set(1, 0, 0)
    forward.normalize()
    right.set(-forward.z, 0, forward.x)
    const ahead = (held.has('forward') ? 1 : 0) - (held.has('back') ? 1 : 0)
    const side = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0)
    const climb = (held.has('up') ? 1 : 0) - (held.has('down') ? 1 : 0)
    const turn =
      (held.has('turnRight') ? 1 : 0) - (held.has('turnLeft') ? 1 : 0)
    const tilt = (held.has('lookUp') ? 1 : 0) - (held.has('lookDown') ? 1 : 0)
    // Turning: swing the eye round the look point (they are a hair apart),
    // keeping the view from tipping over the vertical.
    if (turn || tilt) {
      const look = to.copy(orbit.target).sub(camera.position)
      const yaw = Math.atan2(look.z, look.x) + turn * TURN_SPEED * dt
      const pitch = Math.min(
        MAX_TILT,
        Math.max(
          -MAX_TILT,
          Math.asin(look.y / look.length()) + tilt * TILT_SPEED * dt,
        ),
      )
      look.set(
        Math.cos(pitch) * Math.cos(yaw),
        Math.sin(pitch),
        Math.cos(pitch) * Math.sin(yaw),
      )
      camera.position.copy(orbit.target).addScaledVector(look, -EPS)
      camera.getWorldDirection(forward)
      forward.y = 0
      if (forward.lengthSq() < 1e-8) forward.set(1, 0, 0)
      forward.normalize()
      right.set(-forward.z, 0, forward.x)
    }
    from.copy(orbit.target)
    to.copy(from)
      .addScaledVector(forward, ahead * WALK_SPEED * dt)
      .addScaledVector(right, side * WALK_SPEED * dt)
    to.y += climb * CLIMB_SPEED * dt
    confine(to, from, present)
    camera.position.add(to.sub(from))
    orbit.target.add(to)
    orbit.update()
    invalidate()
  })

  // The wheel and a pinch zoom the lens; a drag turns more slowly when
  // zoomed in, so it still tracks what is under the pointer.
  useLensZoom({
    fov,
    min: MIN_FOV,
    max: MAX_FOV,
    fallback: FOV,
    onZoom: (next) => {
      if (controls.current) {
        controls.current.rotateSpeed = (-ROTATE_SPEED * next) / FOV
      }
    },
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={false}
      minDistance={EPS}
      maxDistance={EPS}
    />
  )
}
