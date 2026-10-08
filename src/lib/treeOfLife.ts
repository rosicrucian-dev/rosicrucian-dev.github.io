// The Tree of Life laid out as a place to walk through, after Paul Foster
// Case's path exercises (The School of Ageless Wisdom, Section C): each
// Sephirah a sphere of coloured light large enough to stand in, each path
// a tunnel of its colour joining two of them.
//
// The Tree lies flat, as a floor plan, at eye level: Malkuth at the near
// end, Kether straight ahead (world -Z), the Pillar of Mercy (Chokmah,
// Chesed, Netzach) on the right as you face Kether. The page shows it
// from outside, either as BOTA paints it or laid on a human figure; the
// walk through it from inside is built but not yet offered.

import {
  BOTA_LETTER_COLORS,
  BOTA_POSTER_PALETTE,
  BOTA_SEPHIRAH_COLORS,
} from './colors'
import {
  PATHS,
  SEPHIRAH_BY_ID,
  SEPHIROTH,
  type Path,
  type SephirahId,
} from './tree'

// Feet are not meant; one unit is about a step.
export const SPHERE_RADIUS = 5
// As thick as the paths can be and still not touch where they leave a
// sphere: the closest leave 30° apart, which on a sphere of radius 5
// allows a radius of 1.29 (and the paths across are drawn 12% fuller from
// outside).
export const TUBE_RADIUS = 1.1
// How far apart the Tree's pillars stand, in units.
const SCALE = 16

// The Tree's usual proportions: the pillars a unit apart either side of
// the middle, the levels at multiples of √3/3, as the diagram is drawn on
// interlaced triangles. [across (right +), along (towards Malkuth +)].
const LAYOUT: Record<SephirahId, [number, number]> = {
  kether: [0, 0],
  chokmah: [1, 0.577],
  binah: [-1, 0.577],
  chesed: [1, 1.732],
  geburah: [-1, 1.732],
  tiphareth: [0, 2.309],
  netzach: [1, 2.887],
  hod: [-1, 2.887],
  yesod: [0, 3.464],
  malkuth: [0, 4.619],
}

export type Vec3 = [number, number, number]

// Where the Sephiroth stand: as the Tree is drawn (`tree`), or on a human
// body (`body`).
export type TreeLayout = 'tree' | 'body'

// The Tree on the body, as the Golden Dawn places it (in the Middle Pillar
// exercise and the Qabalistic Cross): Kether just above the crown, Chokmah
// and Binah beside the head (the path between them level with the nose),
// Chesed and Geburah on the left and right
// shoulders, Tiphareth at the heart, Netzach and Hod at the left and right
// of the belly (the path between them a couple of inches below the navel),
// Yesod at the genitals, Malkuth at the feet. The body faces the
// viewer, so its left side (Mercy) is on the viewer's right, as on the
// drawn Tree. The side pillars stay straight, as on the drawn Tree: each
// stands at the shoulder points, a little wide of them, so Chokmah and
// Binah stand out from the head and Netzach and Hod at the sides of the
// belly.
// [across (right +), up from the soles] as fractions of the body's height
// to the crown, measured on Blender's base meshes (both figures' shoulder
// points lie 0.11 out, 0.82 up; Chesed and Geburah sit a little lower, in
// the shoulder joints rather than on top of them).
const BODY_PILLAR = 0.12
const ON_BODY: Record<SephirahId, [number, number]> = {
  kether: [0, 1.065],
  chokmah: [BODY_PILLAR, 0.92],
  binah: [-BODY_PILLAR, 0.92],
  chesed: [BODY_PILLAR, 0.775],
  geburah: [-BODY_PILLAR, 0.775],
  tiphareth: [0, 0.695],
  netzach: [BODY_PILLAR, 0.57],
  hod: [-BODY_PILLAR, 0.57],
  yesod: [0, 0.465],
  malkuth: [0, 0.02],
}

// The body's height to the crown, in units: tall enough that the spheres,
// at their usual size, fit about the head.
export const BODY_HEIGHT = 160

// How far the figure's outspread hands reach to either side, as a fraction
// of its height (Blender's base meshes stand in an A-pose).
export const BODY_HALF_SPAN = 0.27

// Where the body's soles stand: Kether in the same place as on the drawn
// Tree.
export const BODY_SOLES = ON_BODY.kether[1] * BODY_HEIGHT

export function sphereCentre(
  id: SephirahId,
  layout: TreeLayout = 'tree',
): Vec3 {
  if (layout === 'body') {
    const [x, up] = ON_BODY[id]
    return [x * BODY_HEIGHT, 0, BODY_SOLES - up * BODY_HEIGHT]
  }
  const [x, z] = LAYOUT[id]
  return [x * SCALE, 0, z * SCALE]
}

export interface Sphere {
  id: SephirahId
  name: string
  hebrew: string
  // The colour of the light within; Malkuth's is its colour-cross.
  color: string
}

export const SPHERES: Sphere[] = SEPHIROTH.map(({ id }) => ({
  id,
  name: SEPHIRAH_BY_ID[id].name,
  hebrew: SEPHIRAH_BY_ID[id].hebrew,
  color:
    id === 'malkuth' ? BOTA_SEPHIRAH_COLORS.citrine : BOTA_SEPHIRAH_COLORS[id],
}))

export const SPHERE_BY_ID = new Map(SPHERES.map((r) => [r.id, r]))

// A path as a tunnel. `from` and `to` run along the Way of Return, the
// direction of Case's exercises: up the Tree, from the Sephirah nearer
// Malkuth to the one nearer Kether. A path across the Tree runs from the
// Pillar of Severity to the Pillar of Mercy, as Case draws the 27th "across
// the Tree of Life from Hod to Netzach".
export interface Tube {
  path: Path
  from: SephirahId
  to: SephirahId
  // The path's colour on Case's (BOTA's) wheel.
  color: string
}

function wayOfReturn(path: Path): Tube {
  const [ax, az] = LAYOUT[path.from]
  const [bx, bz] = LAYOUT[path.to]
  const forward = Math.abs(az - bz) > 1e-6 ? az > bz : ax < bx
  const color = BOTA_POSTER_PALETTE[BOTA_LETTER_COLORS[path.hebrew]]
  return forward
    ? { path, from: path.from, to: path.to, color }
    : { path, from: path.to, to: path.from, color }
}

export const TUBES: Tube[] = PATHS.map(wayOfReturn)

// ---- Crossings -----------------------------------------------------------------

// Laid flat, the Tree's three paths across it cross paths that run up it:
// Daleth crosses Gimel, Teth crosses Gimel, Heh and Zain, and Peh crosses
// Samekh. The tunnels are never shown meeting. Walking a path, the paths
// that cross it are hidden, so it runs on alone; from outside, the paths
// across are drawn whole and those they cross seem to pass into them.

type Point = [number, number]
const flat = (id: SephirahId): Point => {
  const [x, , z] = sphereCentre(id)
  return [x, z]
}

// Whether two segments cross (meeting at an end is not crossing).
function crosses(a: Point, b: Point, c: Point, d: Point): boolean {
  const rx = b[0] - a[0]
  const rz = b[1] - a[1]
  const sx = d[0] - c[0]
  const sz = d[1] - c[1]
  const den = rx * sz - rz * sx
  if (Math.abs(den) < 1e-9) return false
  const t = ((c[0] - a[0]) * sz - (c[1] - a[1]) * sx) / den
  const u = ((c[0] - a[0]) * rz - (c[1] - a[1]) * rx) / den
  const inside = (v: number) => v > 1e-3 && v < 1 - 1e-3
  return inside(t) && inside(u)
}

// Whether a tunnel runs across the Tree, level from pillar to pillar.
export function isAcross(tunnel: Tube): boolean {
  return Math.abs(flat(tunnel.from)[1] - flat(tunnel.to)[1]) < 1e-6
}

// For each tunnel, the tunnels it crosses.
export const CROSSINGS = new Map<number, Tube[]>(
  TUBES.map((tunnel) => [
    tunnel.path.number,
    TUBES.filter(
      (other) =>
        other !== tunnel &&
        crosses(
          flat(tunnel.from),
          flat(tunnel.to),
          flat(other.from),
          flat(other.to),
        ),
    ),
  ]),
)

// The tunnels that open from a room, whichever way they run.
export function tubesFrom(id: SephirahId): Tube[] {
  return TUBES.filter((t) => t.from === id || t.to === id)
}

// The room at the other end of a tunnel.
export function otherEnd(tunnel: Tube, id: SephirahId): SephirahId {
  return tunnel.from === id ? tunnel.to : tunnel.from
}

// Unit direction, on the floor, from one room's centre to another's.
export function heading(a: SephirahId, b: SephirahId): [number, number] {
  const [ax, , az] = sphereCentre(a)
  const [bx, , bz] = sphereCentre(b)
  const len = Math.hypot(bx - ax, bz - az)
  return [(bx - ax) / len, (bz - az) / len]
}

// Malkuth's colour-cross, laid round its sphere in four equal quarters:
// citrine ahead (towards Kether), slate to the right, black behind, russet
// to the left. Angles in radians, measured on the floor from straight ahead,
// positive to the right.
export const MALKUTH_CROSS: { color: string; from: number; to: number }[] = [
  { color: BOTA_SEPHIRAH_COLORS.citrine, from: -Math.PI / 4, to: Math.PI / 4 },
  {
    color: BOTA_SEPHIRAH_COLORS.slate,
    from: Math.PI / 4,
    to: (3 * Math.PI) / 4,
  },
  {
    color: BOTA_SEPHIRAH_COLORS.black,
    from: (3 * Math.PI) / 4,
    to: (5 * Math.PI) / 4,
  },
  {
    color: BOTA_SEPHIRAH_COLORS.russet,
    from: (5 * Math.PI) / 4,
    to: (7 * Math.PI) / 4,
  },
]

// Where a tunnel's doorway stands in a room, as an angle on the floor from
// straight ahead: the way to the room at the other end, so every tunnel
// runs straight. In Malkuth all three paths head within 30° of straight
// ahead and so leave through its upper quarter, as BOTA's own painting of
// the Tree shows them. (Case's "from the citrine segment" and "from the
// russet segment" describe the image to hold in meditation, not where the
// paths meet the sphere.)
export function doorAngle(room: SephirahId, tunnel: Tube): number {
  const [dx, dz] = heading(room, otherEnd(tunnel, room))
  return Math.atan2(dx, -dz)
}

// The unit direction, in space, from a room's centre to the room at the
// other end of a tunnel: the way out through its doorway.
function doorDirection(
  room: SephirahId,
  tunnel: Tube,
  layout: TreeLayout = 'tree',
): Vec3 {
  const a = sphereCentre(room, layout)
  const b = sphereCentre(otherEnd(tunnel, room), layout)
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const len = Math.hypot(d[0], d[1], d[2])
  return [d[0] / len, d[1] / len, d[2] / len]
}

// How far above level a doorway looks out: radians, up positive.
export function doorElevation(room: SephirahId, tunnel: Tube): number {
  return Math.asin(doorDirection(room, tunnel)[1])
}

// A point `distance` out from a room's centre towards a tunnel's far room.
function outFrom(
  room: SephirahId,
  tunnel: Tube,
  distance: number,
  layout: TreeLayout = 'tree',
): Vec3 {
  const [x, y, z] = sphereCentre(room, layout)
  const [dx, dy, dz] = doorDirection(room, tunnel, layout)
  return [x + dx * distance, y + dy * distance, z + dz * distance]
}

// A tunnel's two ends, from the doorway in `start` to the doorway in the
// room at the other end, each `inset` from its room's centre. Every
// doorway faces its far room, so a tunnel runs straight between them.
export function tubeEnds(
  tunnel: Tube,
  start: SephirahId,
  inset: number,
  layout: TreeLayout = 'tree',
): [Vec3, Vec3] {
  return [
    outFrom(start, tunnel, inset, layout),
    outFrom(otherEnd(tunnel, start), tunnel, inset, layout),
  ]
}
