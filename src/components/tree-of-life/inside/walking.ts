import {
  tubeEnds,
  SPHERE_BY_ID,
  SPHERE_RADIUS,
  sphereCentre,
  SPHERES,
  TUBE_RADIUS,
  TUBES,
  tubesFrom,
  type Sphere,
  type Tube,
} from '@/lib/treeOfLife'
import { Location } from '../types'

// How near the eye may come to a room's or a tunnel's wall.
const WALL_GAP = 0.45

// Each tunnel as the straight run between its two doorways, on the floor,
// for telling whether a point is inside it.
const RUNS = TUBES.map((tunnel) => {
  const [[ax, , az], [bx, , bz]] = tubeEnds(
    tunnel,
    tunnel.from,
    SPHERE_RADIUS - 0.4,
  )
  return { tunnel, ax, az, bx, bz }
})

// How far a point on the floor lies from a tunnel's run.
function fromRun(run: (typeof RUNS)[number], x: number, z: number): number {
  const dx = run.bx - run.ax
  const dz = run.bz - run.az
  const k = Math.max(
    0,
    Math.min(1, ((x - run.ax) * dx + (z - run.az) * dz) / (dx * dx + dz * dz)),
  )
  return Math.hypot(x - (run.ax + dx * k), z - (run.az + dz * k))
}

const inRoom = (room: Sphere, x: number, z: number) => {
  const [cx, , cz] = sphereCentre(room.id)
  return Math.hypot(x - cx, z - cz) <= SPHERE_RADIUS - WALL_GAP
}

// Where a point on the plan is, for someone `current`ly where they are: in
// a room, in a tunnel, or nowhere (in the walls). A path once entered is
// locked: you can only walk on along it, or out at either end into its
// rooms, never across into a path that crosses it. From a room you may
// enter any of its doorways.
export function whereIs(
  x: number,
  z: number,
  current: Location | null,
): Location | null {
  if (current?.kind === 'tunnel') {
    const run = RUNS.find((r) => r.tunnel === current.tunnel)!
    if (fromRun(run, x, z) <= TUBE_RADIUS - WALL_GAP) return current
    for (const id of [current.tunnel.from, current.tunnel.to]) {
      const room = SPHERE_BY_ID.get(id)!
      if (inRoom(room, x, z)) return { kind: 'room', room }
    }
    return null
  }
  for (const room of SPHERES) {
    if (inRoom(room, x, z)) return { kind: 'room', room }
  }
  if (current?.kind === 'room') {
    for (const tunnel of tubesFrom(current.room.id)) {
      const run = RUNS.find((r) => r.tunnel === tunnel)!
      if (fromRun(run, x, z) <= TUBE_RADIUS - WALL_GAP)
        return { kind: 'tunnel', tunnel }
    }
  }
  return null
}

export const sameLocation = (a: Location | null, b: Location | null) =>
  a?.kind === b?.kind &&
  (a?.kind === 'room'
    ? a.room.id === (b as { room: Sphere }).room.id
    : a?.kind === 'tunnel' &&
      a.tunnel.path.number === (b as { tunnel: Tube }).tunnel.path.number)
