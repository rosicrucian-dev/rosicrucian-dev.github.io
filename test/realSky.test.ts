// Lining the sphere up with a real observer's sky, checked against an
// independent ephemeris (astronomy-engine).
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import * as Astronomy from 'astronomy-engine'

import {
  fromHorizon,
  skyBasis,
  sphereFromEquatorial,
  toLocalSky,
} from '../src/lib/realSky.ts'
import type { Vec3 } from '../src/lib/treeOfLifeSphere.ts'

const DEG = Math.PI / 180
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const separation = (a: Vec3, b: Vec3) =>
  Math.acos(Math.min(1, Math.max(-1, dot(a, b)))) / DEG

// J2000 right ascension (hours) and declination (degrees).
const STARS: Record<string, [number, number]> = {
  Regulus: [10.1395, 11.9672],
  Vega: [18.6156, 38.7837],
  Polaris: [2.5303, 89.2641],
  Sirius: [6.7525, -16.7161],
  Achernar: [1.6286, -57.2367],
  Arcturus: [14.261, 19.1825],
}
const PLACES: Record<string, [number, number]> = {
  'New York': [40.71, -74.01],
  Sydney: [-33.87, 151.21],
  Quito: [-0.18, -78.47],
  Tromsø: [69.65, 18.96],
}
const DATES = [
  new Date('2026-10-06T22:30:00Z'),
  new Date('2027-03-21T04:00:00Z'),
  new Date('2000-01-01T12:00:00Z'),
]

// A star's place on the sphere, from its catalogue position.
function onSphere([raHours, dec]: [number, number]) {
  const ra = raHours * 15 * DEG
  const d = dec * DEG
  return sphereFromEquatorial(
    Math.cos(d) * Math.cos(ra),
    Math.cos(d) * Math.sin(ra),
    Math.sin(d),
  )
}

test('Regulus is 0° Leo, on the ecliptic', () => {
  const { lon, lat } = onSphere(STARS.Regulus)
  assert.ok(Math.abs(lon - 120) < 0.01, `longitude ${lon}`)
  assert.ok(Math.abs(lat - 0.465) < 0.01, `latitude ${lat}`)
})

test('stars land where an independent ephemeris puts them', () => {
  let worst = 0
  for (const date of DATES) {
    for (const [latitude, longitude] of Object.values(PLACES)) {
      for (const [raHours, dec] of Object.values(STARS)) {
        const { lon, lat } = onSphere([raHours, dec])
        const mine = toLocalSky(lon, lat, date, { latitude, longitude })

        const observer = new Astronomy.Observer(latitude, longitude, 0)
        Astronomy.DefineStar(Astronomy.Body.Star1, raHours, dec, 1000)
        const eq = Astronomy.Equator(
          Astronomy.Body.Star1,
          date,
          observer,
          true,
          false,
        )
        const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec)
        worst = Math.max(
          worst,
          separation(mine, fromHorizon(hor.azimuth, hor.altitude)),
        )
      }
    }
  }
  // Phone compasses are good to a few degrees; this is far inside that.
  assert.ok(worst < 0.02, `worst disagreement ${worst}°`)
})

test('the pole star stands as high as the observer’s latitude', () => {
  const { lon, lat } = onSphere(STARS.Polaris)
  const [, up] = toLocalSky(lon, lat, DATES[0], {
    latitude: 40.71,
    longitude: -74.01,
  })
  const altitude = Math.asin(up) / DEG
  // Polaris is three quarters of a degree off the true pole.
  assert.ok(Math.abs(altitude - 40.71) < 1, `altitude ${altitude}`)
})

test('placing the sphere is a pure rotation', () => {
  const [x, y, z] = skyBasis(DATES[0], { latitude: 40.71, longitude: -74.01 })
  for (const axis of [x, y, z]) assert.ok(Math.abs(dot(axis, axis) - 1) < 1e-9)
  assert.ok(Math.abs(dot(x, y)) < 1e-9)
  assert.ok(Math.abs(dot(y, z)) < 1e-9)
  assert.ok(Math.abs(dot(x, z)) < 1e-9)
  // Right-handed: a rotation, not a mirror image.
  assert.ok(Math.abs(dot(cross(x, y), z) - 1) < 1e-9)
})

test('the local frame is east, up, south', () => {
  const is = (v: Vec3, expected: Vec3, name: string) =>
    assert.ok(separation(v, expected) < 1e-6, name)
  is(fromHorizon(0, 0), [0, 0, -1], 'north')
  is(fromHorizon(90, 0), [1, 0, 0], 'east')
  is(fromHorizon(0, 90), [0, 1, 0], 'overhead')
})
