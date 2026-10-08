'use client'

// The fabric of the Vault: its seven walls (one of them the door), its
// ceiling and its floor, each painted by whichever design is shown.

import { useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import {
  BufferAttribute,
  DoubleSide,
  Path,
  Shape,
  ShapeGeometry,
  type CanvasTexture,
  type Group,
} from 'three'

import type { Fonts } from '@/components/model/fonts'
import { Highlight, useTouch } from '@/components/model/touch'
import { useTexture } from '@/lib/canvasTexture'
import {
  CIRCUMRADIUS,
  cornerAngle,
  INRADIUS,
  WALL_HEIGHT,
  WALL_WIDTH,
  wallAngle,
  type Wall,
} from '@/lib/vault'
import { PLAN_MARGIN } from './paint'

// How each design paints a wall.
type WallPainter = (wall: Wall, fonts: Fonts) => CanvasTexture

export function WallPanel({
  wall,
  fonts,
  paint,
}: {
  wall: Wall
  fonts: Fonts
  paint: WallPainter
}) {
  const map = useTexture(() => paint(wall, fonts))
  const angle = wallAngle(wall.index)
  const position: [number, number, number] = [
    Math.cos(angle) * INRADIUS,
    WALL_HEIGHT / 2,
    Math.sin(angle) * INRADIUS,
  ]
  // A plane faces +Z; turn it to face the centre of the room.
  const rotation: [number, number, number] = [
    0,
    Math.atan2(-Math.cos(angle), -Math.sin(angle)),
    0,
  ]
  if (wall.door) return <Door map={map} angle={angle} rotation={rotation} />
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
      <meshLambertMaterial map={map} />
    </mesh>
  )
}

// The Venus wall is the door, "hinged as a whole". A click swings it a
// little way out of the Vault, and another closes it.
const DOOR_AJAR = (32 * Math.PI) / 180

function Door({
  map,
  angle,
  rotation,
}: {
  map: CanvasTexture
  angle: number
  rotation: [number, number, number]
}) {
  const { lit, handlers } = useTouch('door')
  const { doorOpen } = useContext(DoorContext)
  const invalidate = useThree((state) => state.invalidate)
  const hinge = useRef<Group>(null)
  const swing = useRef(0)
  // The hinge is the wall's left edge, seen from inside.
  const [hx, hz] = [
    Math.cos(angle) * INRADIUS + Math.cos(rotation[1]) * (-WALL_WIDTH / 2),
    Math.sin(angle) * INRADIUS - Math.sin(rotation[1]) * (-WALL_WIDTH / 2),
  ]
  useFrame((_, delta) => {
    const goal = doorOpen ? DOOR_AJAR : 0
    const gap = goal - swing.current
    if (Math.abs(gap) < 1e-4) return
    swing.current += gap * Math.min(1, delta * 6)
    if (Math.abs(goal - swing.current) < 1e-4) swing.current = goal
    if (hinge.current) hinge.current.rotation.y = rotation[1] + swing.current
    invalidate()
  })
  useEffect(() => invalidate(), [doorOpen, invalidate])
  return (
    <group ref={hinge} position={[hx, WALL_HEIGHT / 2, hz]} rotation={rotation}>
      <mesh position={[WALL_WIDTH / 2, 0, 0]} {...handlers}>
        <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
        <meshLambertMaterial map={map} side={DoubleSide} />
        {lit && (
          <Highlight>
            <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
          </Highlight>
        )}
      </mesh>
    </group>
  )
}

export const DoorContext = createContext({ doorOpen: false })

// A heptagon in the XZ plane at height `y`, with the plan canvas laid
// over it: canvas up = world +X (east), canvas right = world +Z (south)
// as seen from above.
function useHeptagon(y: number, facingDown: boolean, holeRadius = 0) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    for (let i = 0; i < 7; i++) {
      const a = cornerAngle(i)
      const x = Math.cos(a) * CIRCUMRADIUS
      const z = Math.sin(a) * CIRCUMRADIUS
      if (i === 0) shape.moveTo(x, z)
      else shape.lineTo(x, z)
    }
    shape.closePath()
    // A round hole cut in the middle of the floor.
    if (holeRadius) {
      const cut = new Path()
      cut.absarc(0, 0, holeRadius, 0, Math.PI * 2, true)
      shape.holes.push(cut)
    }
    const g = new ShapeGeometry(shape)
    // ShapeGeometry lies in XY; its y is our z. Rotate into XZ below, and
    // give it UVs that match the plan canvas.
    const pos = g.attributes.position
    const uv = new Float32Array(pos.count * 2)
    const s = CIRCUMRADIUS / PLAN_MARGIN
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getY(i)
      // Canvas: east is up (v = 1), south is right (u = 1).
      uv[i * 2] = 0.5 + z / (2 * s)
      uv[i * 2 + 1] = 0.5 + x / (2 * s)
    }
    g.setAttribute('uv', new BufferAttribute(uv, 2))
    return g
  }, [holeRadius])
  useEffect(() => () => geometry.dispose(), [geometry])
  // Lay the XY shape flat: +Y of the shape becomes +Z of the world.
  const rotation: [number, number, number] = [
    facingDown ? Math.PI / 2 : -Math.PI / 2,
    0,
    0,
  ]
  // With that rotation the shape's y maps to -z (facing up) or +z (facing
  // down); flip the geometry's z so south stays south either way.
  const scale: [number, number, number] = [1, facingDown ? 1 : -1, 1]
  return {
    geometry,
    position: [0, y, 0] as [number, number, number],
    rotation,
    scale,
  }
}

export function Ceiling({ paint }: { paint: () => CanvasTexture }) {
  const map = useTexture(paint)
  const { geometry, position, rotation, scale } = useHeptagon(WALL_HEIGHT, true)
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Drawings, not surfaces to be shaded: lit evenly so they read. */}
      <meshBasicMaterial map={map} color="#e4e0d6" side={DoubleSide} />
    </mesh>
  )
}

export function Floor({
  paint,
  hole,
}: {
  paint: () => CanvasTexture
  hole?: number
}) {
  const map = useTexture(paint)
  const { geometry, position, rotation, scale } = useHeptagon(0, false, hole)
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshBasicMaterial map={map} color="#d8d4ca" side={DoubleSide} />
    </mesh>
  )
}
