// The seven classical planets on the sphere.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import * as Astronomy from 'astronomy-engine'

import { placePlanets, PLANETS } from '../src/lib/planets.ts'
import { fromHorizon, toLocalSky } from '../src/lib/realSky.ts'
import { type Vec3 } from '../src/lib/treeOfLifeSphere.ts'
import { PATH_BY_NUMBER } from '../src/lib/tree.ts'

const DEG = Math.PI / 180
const separation = (a: Vec3, b: Vec3) =>
  Math.acos(
    Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])),
  ) / DEG

test('the seven are in their Golden Dawn colours', () => {
  assert.deepEqual(
    PLANETS.map((p) => p.name),
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'],
  )
  // Each takes the colour of its own path on the Tree.
  const pathOf = {
    Sun: 30,
    Moon: 13,
    Mercury: 12,
    Venus: 14,
    Mars: 27,
    Jupiter: 21,
    Saturn: 32,
  }
  for (const planet of PLANETS) {
    const path = pathOf[planet.name as keyof typeof pathOf]
    assert.equal(planet.color, PATH_BY_NUMBER.get(path)!.color, planet.name)
  }
})

test('the planets keep to the zodiac', async () => {
  const placed = await placePlanets(new Date('2026-10-06T22:30:00Z'))
  assert.equal(placed.length, 7)
  for (const planet of placed) {
    assert.ok(planet.lon >= 0 && planet.lon < 360, planet.name)
    // None strays more than about 9° from the ecliptic.
    assert.ok(Math.abs(planet.lat) < 9, `${planet.name} at ${planet.lat}°`)
  }
  const sun = placed.find((p) => p.name === 'Sun')!
  assert.ok(Math.abs(sun.lat) < 0.01, `the Sun is on the ecliptic: ${sun.lat}`)
})

test('at the March equinox the Sun is at 29.8° of Aquarius', async () => {
  // The Sun's ordinary (tropical) longitude is 0° then. The sphere counts
  // from Regulus instead, which sits 149.83° on in the year 2000, less the
  // 0.37° the equinox has slipped back since: 360 - 149.83 - 0.37 + 120.
  const equinox = Astronomy.Seasons(2026).mar_equinox.date
  const sun = (await placePlanets(equinox)).find((p) => p.name === 'Sun')!
  assert.ok(Math.abs(sun.lon - 329.8) < 0.02, `longitude ${sun.lon}`)
})

test('each is found where an observer would actually see it', async () => {
  const date = new Date('2027-03-21T04:00:00Z')
  const [latitude, longitude] = [-33.87, 151.21]
  const observer = new Astronomy.Observer(latitude, longitude, 0)
  for (const planet of await placePlanets(date)) {
    const mine = toLocalSky(planet.lon, planet.lat, date, {
      latitude,
      longitude,
    })
    const body = Astronomy.Body[planet.name as keyof typeof Astronomy.Body]
    const eq = Astronomy.Equator(body, date, observer, true, true)
    const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec)
    const gap = separation(mine, fromHorizon(hor.azimuth, hor.altitude))
    // The Moon is close enough that where you stand on the Earth shifts it
    // by up to a degree; positions here are from the Earth's centre.
    const allowed = planet.name === 'Moon' ? 1.1 : 0.02
    assert.ok(gap < allowed, `${planet.name} is ${gap}° off`)
  }
})
