// The Tree of Life on the sphere: that the rule in treeOfLifeSphere.ts produces
// the structure Mathers describes.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  copiesOfPath,
  formatLongitude,
  MALKUTH_QUARTERS,
  NODES,
  SEGMENTS,
  segmentBand,
  segmentCurve,
  toVector,
  type Vec3,
} from '../src/lib/treeOfLifeSphere.ts'
import { VESSELS } from '../src/lib/vessels.ts'
import { PATHS } from '../src/lib/tree.ts'

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const angleBetween = (a: Vec3, b: Vec3) =>
  (Math.acos(Math.min(1, Math.max(-1, dot(a, b)))) * 180) / Math.PI

const copies = (id: string) => NODES.filter((n) => n.sephirah.id === id)
const longitudes = (id: string) =>
  copies(id)
    .map((n) => n.lon)
    .sort((a, b) => a - b)

test('there are 22 points on the surface', () => {
  assert.equal(NODES.length, 22)
  assert.equal(copies('kether').length, 1)
  assert.equal(copies('malkuth').length, 1)
  assert.equal(copies('tiphareth').length, 4)
  assert.equal(copies('yesod').length, 4)
  for (const id of [
    'chokmah',
    'binah',
    'chesed',
    'geburah',
    'netzach',
    'hod',
  ]) {
    assert.equal(copies(id).length, 2, id)
  }
})

test('the pillars stand where Mathers puts them', () => {
  // Mercy through 15° Virgo and 15° Pisces, Severity through 15° Gemini
  // and 15° Sagittarius, counting 0° Leo (Regulus) as 120°.
  for (const id of ['chokmah', 'chesed', 'netzach']) {
    assert.deepEqual(longitudes(id), [165, 345], id)
  }
  for (const id of ['binah', 'geburah', 'hod']) {
    assert.deepEqual(longitudes(id), [75, 255], id)
  }
  // The Tiphareth and Yesod points sit halfway between, at 0° of the
  // fixed signs.
  assert.deepEqual(longitudes('tiphareth'), [30, 120, 210, 300])
  assert.deepEqual(longitudes('yesod'), [30, 120, 210, 300])
})

test('the rungs of the Tree are 30° of latitude apart', () => {
  const latitude = (id: string) => copies(id)[0].lat
  assert.equal(latitude('kether'), 90)
  assert.equal(latitude('chokmah'), 60)
  assert.equal(latitude('binah'), 60)
  assert.equal(latitude('chesed'), 30)
  assert.equal(latitude('geburah'), 30)
  assert.equal(latitude('tiphareth'), 0)
  assert.equal(latitude('netzach'), -30)
  assert.equal(latitude('hod'), -30)
  assert.equal(latitude('yesod'), -60)
  assert.equal(latitude('malkuth'), -90)
})

test('22 paths make 72 segments: 8 appear twice, 14 four times', () => {
  assert.equal(PATHS.length, 22)
  assert.equal(SEGMENTS.length, 72)
  // Those that touch a pole or run down a side pillar are shared by two
  // Trees: Aleph, Beth, Vav, Cheth, Kaph, Mem, Qoph, Shin.
  const doubled = [11, 12, 16, 18, 21, 23, 29, 31]
  for (const path of PATHS) {
    assert.equal(
      copiesOfPath(path.number),
      doubled.includes(path.number) ? 2 : 4,
      path.name,
    )
  }
})

test('every segment joins a copy of each of its path’s two sephiroth', () => {
  for (const segment of SEGMENTS) {
    assert.equal(segment.a.sephirah.id, segment.path.from, segment.key)
    assert.equal(segment.b.sephirah.id, segment.path.to, segment.key)
    // Never further apart than a quarter turn: each joins neighbours.
    const apart = angleBetween(
      toVector(segment.a.lon, segment.a.lat),
      toVector(segment.b.lon, segment.b.lat),
    )
    assert.ok(apart <= 90.0001, `${segment.key} spans ${apart}°`)
  }
})

test('the sphere is the sky as seen from inside, not mirrored', () => {
  // Kether, the north pole, is straight up.
  assert.ok(angleBetween(toVector(0, 90), [0, 1, 0]) < 1e-6)
  // Facing longitude 0° with Kether up, a higher longitude is to the left,
  // as it is in the real sky.
  const facing = toVector(0, 0)
  const right = cross(facing, [0, 1, 0])
  assert.ok(dot(toVector(10, 0), right) < 0)
})

test('a path’s band runs from rim to rim, not under its sephiroth', () => {
  for (const segment of SEGMENTS) {
    const band = segmentBand(segment)
    assert.ok(band.length > 2, segment.key)
    for (const [end, node] of [
      [band[0], segment.a],
      [band[band.length - 1], segment.b],
    ] as const) {
      const fromCentre = angleBetween(end, toVector(node.lon, node.lat))
      assert.ok(
        fromCentre >= node.sephirah.radius - 0.5,
        `${segment.key} reaches ${fromCentre}° from ${node.key}`,
      )
    }
  }
})

test('level, the horizontal paths keep to their parallel; direct, they bow poleward', () => {
  const latitude = (p: Vec3) => (Math.asin(p[1]) * 180) / Math.PI
  // Midway between two sephiroth a quarter turn apart on one parallel, the
  // direct route sits at atan(tan(latitude) / cos 45°), not on the parallel.
  const expected = {
    14: { level: 60, direct: 67.79 },
    19: { level: 30, direct: 39.23 },
    27: { level: -30, direct: -39.23 },
  }
  for (const [number, by] of Object.entries(expected)) {
    for (const segment of SEGMENTS.filter(
      (s) => s.path.number === Number(number),
    )) {
      for (const curve of ['level', 'direct'] as const) {
        // The midpoint is where the path strays furthest from the equator.
        const furthest = segmentCurve(segment, segment.a, 0.5, curve)
          .map(latitude)
          .reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a))
        assert.ok(
          Math.abs(furthest - by[curve]) < 0.05,
          `${segment.key} ${curve} reaches ${furthest}°`,
        )
      }
    }
  }
})

test('the two conventions agree on every path but the three horizontal ones', () => {
  for (const segment of SEGMENTS) {
    if (segment.a.lat === segment.b.lat) continue
    // Each point of the one curve lies on the other (sampled finely enough
    // that the nearest sample is within a tenth of a degree).
    const level = segmentCurve(segment, segment.a, 1, 'level')
    const direct = segmentCurve(segment, segment.a, 0.1, 'direct')
    for (const p of level) {
      const gap = Math.min(...direct.map((q) => angleBetween(p, q)))
      assert.ok(gap < 0.06, `${segment.key} strays ${gap}°`)
    }
  }
})

test('the vessels are the article’s six, each made of real paths', () => {
  assert.deepEqual(
    VESSELS.map((v) => v.number),
    [1, 2, 3, 4, 5, 6],
  )
  const numbers = new Set(PATHS.map((p) => p.number))
  for (const vessel of VESSELS) {
    assert.ok(vessel.paths.length > 0)
    for (const path of vessel.paths) assert.ok(numbers.has(path))
  }
})

test('longitudes read as degrees of a sign, from Regulus at 0° Leo', () => {
  assert.equal(formatLongitude(120), '0° Leo')
  assert.equal(formatLongitude(165), '15° Virgo')
  assert.equal(formatLongitude(345), '15° Pisces')
})

test('Malkuth’s quarters face the fixed signs, bounded by the pillars', () => {
  const byElement = Object.fromEntries(
    MALKUTH_QUARTERS.map((q) => [q.element, q.lon]),
  )
  assert.deepEqual(byElement, { Air: 300, Water: 210, Fire: 120, Earth: 30 })
  // Each centre is a Tiphareth point, and each boundary (45° either side)
  // is a pillar meridian.
  const tiphareth = new Set([30, 120, 210, 300])
  const pillars = new Set([75, 165, 255, 345])
  for (const { lon } of MALKUTH_QUARTERS) {
    assert.ok(tiphareth.has(lon))
    assert.ok(pillars.has((lon + 45) % 360))
    assert.ok(pillars.has((lon + 315) % 360))
  }
})
