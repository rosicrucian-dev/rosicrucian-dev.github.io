import { type Fonts } from '@/components/model/fonts'
import { useTexture } from '@/lib/canvasTexture'
import {
  doorAngle,
  doorElevation,
  SPHERE_RADIUS,
  sphereCentre,
  TUBE_RADIUS,
  type Tube,
} from '@/lib/treeOfLife'
import type { SephirahId } from '@/lib/tree'
import { DOOR_ANGLE, letterTexture } from '../textures'

// The letter over a doorway, facing into the room.
export function Doorway({
  room,
  tunnel,
  fonts,
}: {
  room: SephirahId
  tunnel: Tube
  fonts: Fonts
}) {
  const letter = useTexture(() =>
    letterTexture(tunnel.path.hebrew, tunnel.color, fonts),
  )
  // Facing the doorway's way out: yaw is three.js's turn about +Y, which
  // runs the other way to our angles from straight ahead.
  const yaw = -doorAngle(room, tunnel)
  const pitch = doorElevation(room, tunnel)
  const r = SPHERE_RADIUS * Math.cos(DOOR_ANGLE) - 0.05
  return (
    <group position={sphereCentre(room)} rotation={[pitch, yaw, 0, 'YXZ']}>
      {/* Well inside the wall, so the sphere's curve doesn't cut it. */}
      <mesh position={[0, TUBE_RADIUS + 0.75, -r + 1.3]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial
          map={letter}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
