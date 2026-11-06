import { PALETTE } from './colors'
import {
  PATHS,
  SEPHIROTH,
  type Path,
  type Sephirah,
  type SephirahId,
} from './tree'

// The Tree of Life projected onto a sphere, after S. L. MacGregor Mathers'
// Golden Dawn paper "The Tree of Life in the Celestial Heavens Projected as
// if in a Solid Sphere" (Regardie, The Golden Dawn, vol. 4).
//
// The sphere is the sky in ecliptic coordinates:
//
//   - Kether is the north pole of the ecliptic, Malkuth the south pole, and
//     the Middle Pillar is the axis between them. Tiphareth is the centre
//     of the sphere, which is where the viewer stands.
//   - Longitude is counted from Regulus as 0° Leo, so signs and
//     constellations coincide.
//   - The side pillars become four meridians 90° apart, alternating
//     Severity and Mercy. Tiphareth and Yesod, hidden on the axis, are
//     each "indicated" at four points on the meridians halfway between.
//   - The rungs of the Tree are 30° of latitude apart.
//
// Read together, that is four ordinary flat Trees wrapped around the ball
// like the segments of an orange, neighbours mirrored and sharing a side
// pillar. This module derives every copy of every sephirah and path from
// that one rule; nothing here is positioned by hand.

export type Vec3 = [number, number, number]

const DEG = Math.PI / 180

export const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]

// 165 -> "15° Virgo"
export function formatLongitude(lon: number): string {
  const l = ((lon % 360) + 360) % 360
  return `${Math.round(l % 30)}° ${SIGNS[Math.floor(l / 30)]}`
}

export function formatLatitude(lat: number): string {
  if (lat === 0) return 'on the ecliptic'
  if (Math.abs(lat) === 90) return lat > 0 ? 'the north pole' : 'the south pole'
  return `${Math.abs(lat)}° ${lat > 0 ? 'north' : 'south'} of the ecliptic`
}

// Sphere longitude/latitude (degrees) -> a unit vector, +Y to Kether.
// Longitude runs so that, seen from the centre with north up, it increases
// to the left, the way the real sky does. From outside the sphere is
// therefore a celestial globe, mirrored like the Golden Dawn plates.
export function toVector(lon: number, lat: number): Vec3 {
  const cosLat = Math.cos(lat * DEG)
  return [
    cosLat * Math.cos(lon * DEG),
    Math.sin(lat * DEG),
    -cosLat * Math.sin(lon * DEG),
  ]
}

// ---- Sephiroth on the sphere ------------------------------------------------

// A Sephirah as placed on the sphere.
export interface SphereSephirah extends Sephirah {
  latitude: number
  // Angular radius as drawn on the sphere, degrees.
  radius: number
  // Tiphareth and Yesod are not on the surface at all. They lie hidden on
  // the axis (Tiphareth at the very centre), and Mathers gives them no
  // radius, only four points each where their influence is indicated. So
  // they are drawn as a point, and `radius` is just the small clearing
  // kept around it where the paths stop.
  indicated?: boolean
}

// Mathers gives every sephirah on the surface a radius of 10°, and names
// the stars that fall inside each. Drawn any smaller, some of those stars
// (Polaris in Binah, Arcturus in Chesed) end up outside their sephirah.
const SURFACE_RADIUS = 10
const POINT_CLEARING = 3.2

const ON_SPHERE: Record<
  SephirahId,
  { latitude: number; radius: number; indicated?: boolean }
> = {
  kether: { latitude: 90, radius: SURFACE_RADIUS },
  chokmah: { latitude: 60, radius: SURFACE_RADIUS },
  binah: { latitude: 60, radius: SURFACE_RADIUS },
  chesed: { latitude: 30, radius: SURFACE_RADIUS },
  geburah: { latitude: 30, radius: SURFACE_RADIUS },
  tiphareth: { latitude: 0, radius: POINT_CLEARING, indicated: true },
  netzach: { latitude: -30, radius: SURFACE_RADIUS },
  hod: { latitude: -30, radius: SURFACE_RADIUS },
  yesod: { latitude: -60, radius: POINT_CLEARING, indicated: true },
  malkuth: { latitude: -90, radius: SURFACE_RADIUS },
}

export const SPHERE_SEPHIROTH: SphereSephirah[] = SEPHIROTH.map((s) => ({
  ...s,
  ...ON_SPHERE[s.id],
}))

const SPHERE_SEPHIRAH_BY_ID = Object.fromEntries(
  SPHERE_SEPHIROTH.map((s) => [s.id, s]),
) as Record<SephirahId, SphereSephirah>

// Malkuth's four quarters, each an element, turned to face the thing on
// the sphere that carries that element. The four Tiphareth points sit at
// 0° of the four fixed signs, one per element (Mathers places the central
// cross of each elemental Tablet on them), so each quarter faces its
// own sign across the sphere, with the pillars as the boundaries between
// quarters. Citrine, the "top" of Malkuth on the flat glyph, faces
// Aquarius.
export interface MalkuthQuarter {
  color: string
  element: string
  // The longitude the quarter is centred on.
  lon: number
}

export const MALKUTH_QUARTERS: MalkuthQuarter[] = [
  { color: PALETTE.citrine, element: 'Air', lon: 300 }, // citrine, 0° Aquarius
  { color: PALETTE.olive, element: 'Water', lon: 210 }, // olive, 0° Scorpio
  { color: PALETTE.russet, element: 'Fire', lon: 120 }, // russet, 0° Leo
  { color: PALETTE.black, element: 'Earth', lon: 30 }, // black, 0° Taurus
]

// ---- The four Trees --------------------------------------------------------

// Mathers: Mercy runs through 15° Virgo and 15° Pisces, Severity through
// 15° Gemini and 15° Sagittarius.
const MERCY_MERIDIANS = [165, 345]

// The meridian each pillar of one Tree runs along.
interface Tree {
  middle: number
  mercy: number
  severity: number
}

// One Tree per fixed sign, its Tiphareth point at that sign's first
// degree: Taurus, Leo (Regulus), Scorpio, Aquarius.
const TREES: Tree[] = [30, 120, 210, 300].map((middle) => {
  const before = (middle + 315) % 360
  const after = (middle + 45) % 360
  const mercyIsBefore = MERCY_MERIDIANS.includes(before)
  return {
    middle,
    mercy: mercyIsBefore ? before : after,
    severity: mercyIsBefore ? after : before,
  }
})

// ---- Nodes: every copy of every sephirah on the surface ---------------------

export interface SphereNode {
  key: string
  sephirah: SphereSephirah
  lon: number
  lat: number
}

function meridianOf(tree: Tree, sephirah: SphereSephirah): number | null {
  if (Math.abs(sephirah.latitude) === 90) return null
  return tree[sephirah.pillar]
}

function nodeKey(tree: Tree, sephirah: SphereSephirah): string {
  const meridian = meridianOf(tree, sephirah)
  return meridian === null ? sephirah.id : `${sephirah.id}@${meridian}`
}

function buildNodes(): SphereNode[] {
  const byKey = new Map<string, SphereNode>()
  for (const tree of TREES) {
    for (const sephirah of SPHERE_SEPHIROTH) {
      const key = nodeKey(tree, sephirah)
      // A copy shared by neighbouring Trees is only made once.
      if (byKey.has(key)) continue
      byKey.set(key, {
        key,
        sephirah,
        lon: meridianOf(tree, sephirah) ?? 0,
        lat: sephirah.latitude,
      })
    }
  }
  return [...byKey.values()]
}

export const NODES: SphereNode[] = buildNodes()

const NODE_BY_KEY = new Map(NODES.map((n) => [n.key, n]))

// ---- Segments: every copy of every path ------------------------------------

export interface Segment {
  key: string
  path: Path
  a: SphereNode
  b: SphereNode
}

// Paths that touch a pole or run down a side pillar are shared between two
// Trees and so appear twice; the rest appear once in each Tree, four
// times. Mathers' text counts Gimel among the doubled paths, but his
// plates draw it to each of the four Tiphareth points, as here.
function buildSegments(): Segment[] {
  const byKey = new Map<string, Segment>()
  for (const tree of TREES) {
    for (const path of PATHS) {
      const a = nodeKey(tree, SPHERE_SEPHIRAH_BY_ID[path.from])
      const b = nodeKey(tree, SPHERE_SEPHIRAH_BY_ID[path.to])
      const key = `${path.number}:${a}|${b}`
      if (byKey.has(key)) continue
      byKey.set(key, {
        key,
        path,
        a: NODE_BY_KEY.get(a)!,
        b: NODE_BY_KEY.get(b)!,
      })
    }
  }
  return [...byKey.values()]
}

export const SEGMENTS: Segment[] = buildSegments()

export function copiesOfPath(number: number): number {
  return SEGMENTS.filter((s) => s.path.number === number).length
}

// ---- Curves ----------------------------------------------------------------

function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const angle = Math.acos(dot)
  if (angle < 1e-6) return a
  const wa = Math.sin((1 - t) * angle) / Math.sin(angle)
  const wb = Math.sin(t * angle) / Math.sin(angle)
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb]
}

// How a path gets from one sephirah to the other. Mathers gives the
// positions of the sephiroth and nothing about the curve of the paths.
// Every path here takes the shortest way across the sphere (an arc of a
// great circle, the sphere's own straight line: what a straightedge
// pressed against a ball would draw), except that the three horizontal
// paths, Daleth, Teth and Peh, may instead stay "level": following their
// parallel of latitude, as the horizontal rungs of the flat Tree, so that
// their copies close into rings around the sphere.
//
//   - `level`: the horizontal paths follow their parallel.
//   - `direct`: they too take the shortest way, bowing toward the pole.
//
// The two differ by up to 9° on those three paths and nowhere else.
export type PathCurve = 'level' | 'direct'

// Unit vectors along a segment, `from` first.
export function segmentCurve(
  segment: Segment,
  from: SphereNode = segment.a,
  stepDeg = 1.5,
  curve: PathCurve = 'level',
): Vec3[] {
  const to = from === segment.a ? segment.b : segment.a
  const points: Vec3[] = []

  if (curve === 'level' && from.lat === to.lat) {
    const dLon = ((to.lon - from.lon + 540) % 360) - 180
    const steps = Math.max(
      2,
      Math.ceil((Math.abs(dLon) * Math.cos(from.lat * DEG)) / stepDeg),
    )
    for (let i = 0; i <= steps; i++) {
      points.push(toVector(from.lon + (dLon * i) / steps, from.lat))
    }
    return points
  }

  const a = toVector(from.lon, from.lat)
  const b = toVector(to.lon, to.lat)
  const angle =
    Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])) / DEG
  const steps = Math.max(2, Math.ceil(angle / stepDeg))
  for (let i = 0; i <= steps; i++) points.push(slerp(a, b, i / steps))
  return points
}

// A segment's curve with the stretches hidden under its two sephiroth cut
// away, so the band runs from rim to rim. Each end is cut exactly where
// the curve crosses the sephirah's edge (a little inside it, so the band
// tucks under the disc), not at the nearest sample point, which could
// leave a visible gap of up to one sample step.
export function segmentBand(
  segment: Segment,
  curve: PathCurve = 'level',
): Vec3[] {
  const points = segmentCurve(segment, segment.a, 0.75, curve)
  const distance = (p: Vec3, node: SphereNode) => {
    const c = toVector(node.lon, node.lat)
    return Math.acos(Math.min(1, p[0] * c[0] + p[1] * c[1] + p[2] * c[2])) / DEG
  }
  // The point on the arc from `inside` to `outside` that is exactly `edge`
  // degrees from the node, by bisection.
  const crossing = (inside: Vec3, outside: Vec3, node: SphereNode): Vec3 => {
    const edge = node.sephirah.radius - 0.3
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (distance(slerp(inside, outside, mid), node) < edge) lo = mid
      else hi = mid
    }
    return slerp(inside, outside, (lo + hi) / 2)
  }
  const clearOf = (p: Vec3, node: SphereNode) =>
    distance(p, node) >= node.sephirah.radius - 0.3

  const first = points.findIndex((p) => clearOf(p, segment.a))
  let last = points.length - 1
  while (last > first && !clearOf(points[last], segment.b)) last--
  if (first < 1 || last >= points.length - 1 || first > last) {
    return points.filter((p) => clearOf(p, segment.a) && clearOf(p, segment.b))
  }
  return [
    crossing(points[first - 1], points[first], segment.a),
    ...points.slice(first, last + 1),
    crossing(points[last + 1], points[last], segment.b),
  ]
}
