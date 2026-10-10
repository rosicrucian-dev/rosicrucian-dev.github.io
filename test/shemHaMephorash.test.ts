// The Shem HaMephorash wheel: the 72 Names, the formulas, and the star
// pointing where Moore's chart says it does.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { PALETTES } from '../src/lib/palettes.ts'
import {
  formula,
  gematria,
  letterColor,
  letterMarks,
  letterScales,
  NAMES,
  nameAt,
  nameAtAngle,
  nameAtLongitude,
  aspectsAmong,
  longitudeAngle,
  nameAtTurn,
  nameFromSearch,
  nearestTurn,
  POINTS,
  pointAngle,
  snapTurn,
  coast,
  signOf,
  sliceMiddle,
  spiritAngle,
  starTurn,
} from '../src/lib/shemHaMephorash.ts'

// Rows copied from Moore's chart (Spirit, Fire, Water, Air, Earth), one or
// two from each of its pages.
const CHART_ROWS = [
  [1, 44, 58, 15, 29],
  [5, 48, 62, 19, 33],
  [12, 55, 69, 26, 40],
  [16, 59, 1, 30, 44],
  [21, 64, 6, 35, 49],
  [30, 1, 15, 44, 58],
  [38, 9, 23, 52, 66],
  [45, 16, 30, 59, 1],
  [48, 19, 33, 62, 4],
  [55, 26, 40, 69, 11],
  [64, 35, 49, 6, 20],
  [72, 43, 57, 14, 28],
]

const byId = (n: number) =>
  Object.fromEntries(formula(n).map((e) => [e.point.id, e.name.number]))

test('there are 72 Names, each of three letters', () => {
  assert.equal(NAMES.length, 72)
  NAMES.forEach((name, i) => {
    assert.equal(name.number, i + 1)
    assert.equal([...name.hebrew].length, 3, `Name ${name.number}`)
    assert.ok(name.meaning && name.angel, `Name ${name.number}`)
  })
})

test('the formulas match the chart', () => {
  for (const [spirit, fire, water, air, earth] of CHART_ROWS) {
    assert.deepEqual(
      byId(spirit),
      { spirit, fire, water, air, earth },
      `row ${spirit}`,
    )
  }
})

test("the instructions' example: Healing", () => {
  const healing = formula(5).map((e) => e.name.meaning)
  assert.deepEqual(healing, [
    'Healing',
    'Unity',
    'Connection with God',
    'Enlightened Teacher',
    'Revealing and Overcoming Darkness',
  ])
})

test('every formula has five different Names', () => {
  for (let n = 1; n <= 72; n++) {
    assert.equal(new Set(Object.values(byId(n))).size, 5, `Name ${n}`)
  }
})

test('each point of the star lands in the slice the chart names', () => {
  for (let n = 1; n <= 72; n++) {
    for (const point of POINTS) {
      assert.equal(
        nameAtAngle(pointAngle(n, point)),
        nameAt(n + point.offset).number,
        `Name ${n}, ${point.id}`,
      )
    }
  }
})

test("the wheel matches Moore's: Name 1 at the left, Name 55 at the top", () => {
  assert.equal(nameAtAngle(180.1), 1)
  assert.equal(nameAtAngle(179.9), 72)
  assert.equal(nameAtAngle(90.1), 55)
  assert.equal(nameAtAngle(sliceMiddle(30)), 30)
})

test('the star stands upright on Name 55, as in Moore’s diagram', () => {
  assert.equal(starTurn(55), 0)
  assert.equal(nameAtAngle(spiritAngle(55)), 55)
})

test('stepping round the wheel turns the star the short way', () => {
  const at72 = starTurn(72)
  const to1 = nearestTurn(at72, starTurn(1))
  assert.ok(Math.abs(to1 - at72 - 5) < 1e-9)
  assert.equal(nearestTurn(0, 350), -10)
})

test('six Names to a sign, from Aries', () => {
  assert.equal(signOf(1).name, 'Aries')
  assert.equal(signOf(6).name, 'Aries')
  assert.equal(signOf(7).name, 'Taurus')
  assert.equal(signOf(72).name, 'Pisces')
})

test('every letter of every Name has its four colours, the King’s first, in every palette', () => {
  for (const { id } of PALETTES) {
    for (const name of NAMES) {
      for (const letter of name.hebrew) {
        const scales = letterScales(letter, id)
        assert.equal(scales.length, 4, letter)
        assert.equal(scales[0], letterColor(letter, id), letter)
        for (const color of scales)
          assert.match(color, /^#[0-9a-f]{6}$/i, `${letter} in ${id}`)
      }
    }
  }
})

test('a link can ask for a Name, and only one of the 72', () => {
  assert.equal(nameFromSearch('?name=33'), 33)
  assert.equal(nameFromSearch('?x=1&name=72'), 72)
  assert.equal(nameFromSearch(''), null)
  for (const bad of ['0', '73', '99', 'abc', '3.5', '-4', ''])
    assert.equal(nameFromSearch(`?name=${bad}`), null, bad)
})

test("gematria: Moore's chart, read from its first column", () => {
  // Name: value, or [value, value with the final letter as a final].
  const CHART: Record<number, number | [number, number]> = {
    1: 17,
    3: 79,
    4: [140, 700],
    5: 345,
    8: 425,
    16: [145, 705],
    21: [100, 580],
    25: 455,
    27: 610,
    30: [47, 607],
    38: [118, 678],
    42: 70,
    47: 400,
    52: [150, 710],
    // The chart has 130-960, a slip for 690.
    57: [130, 690],
    66: 190,
    70: 52,
    72: [86, 646],
  }
  for (const [n, expected] of Object.entries(CHART)) {
    const [value, final] = Array.isArray(expected) ? expected : [expected]
    assert.deepEqual(
      gematria(nameAt(Number(n)).hebrew),
      final === undefined ? { value } : { value, final },
      `Name ${n}`,
    )
  }
})

test('the compound colours carry their marks', () => {
  // Mem's Princess colour: white, flecked purple.
  assert.deepEqual(
    letterMarks('ם', 'tailwind').map(({ scale, kind }) => [scale, kind]),
    [[3, 'fleck']],
  )
  // Shin: scarlet flecked gold (Prince); vermilion flecked crimson and
  // emerald (Princess).
  assert.deepEqual(
    letterMarks('ש', 'tailwind').map(({ scale, colors }) => [
      scale,
      colors.length,
    ]),
    [
      [2, 1],
      [3, 2],
    ],
  )
  assert.deepEqual(letterMarks('ה', 'tailwind'), [])
})

test('a turn by hand comes back to the Name it stands on', () => {
  for (let n = 1; n <= 72; n++) {
    for (const k of [-2, 0, 3]) {
      const turn = starTurn(n) + 360 * k
      assert.equal(nameAtTurn(turn), n, `Name ${n}, ${k} turns`)
      assert.equal(snapTurn(turn), turn)
      // Up to half a Name either side still stands on it.
      assert.equal(nameAtTurn(turn + 2.4), n)
      assert.equal(nameAtTurn(turn - 2.4), n)
    }
  }
  assert.equal(snapTurn(starTurn(10) + 2), starTurn(10))
  assert.equal(snapTurn(starTurn(10) + 3), starTurn(11))
})

test('let go slowly, the wheel settles; flicked, it coasts to a Name', () => {
  const at = starTurn(5) + 1.5
  const slow = coast(at, 0.1)
  assert.equal(slow.to, starTurn(5))

  const fast = coast(at, 1.5)
  // About 1.5 × 325 ≈ 490° on, and on a Name.
  assert.ok(fast.to - at > 450 && fast.to - at < 530, String(fast.to - at))
  assert.equal(snapTurn(fast.to), fast.to)
  assert.ok(fast.duration > 250 && fast.duration <= 2500)

  const back = coast(at, -1.5)
  assert.ok(back.to < at)
  assert.equal(snapTurn(back.to), back.to)
})

test('each Name rules five degrees of the zodiac, from 0° Aries', () => {
  assert.equal(nameAtLongitude(0), 1)
  assert.equal(nameAtLongitude(4.99), 1)
  assert.equal(nameAtLongitude(5), 2)
  // 16° Libra: Libra starts at 180°, Name 37.
  assert.equal(nameAtLongitude(196), 40)
  assert.equal(nameAtLongitude(359.9), 72)
  assert.equal(nameAtLongitude(-1), 72)
  // A longitude falls in its Name's slice on the wheel.
  for (const lon of [0.5, 123.4, 359.5]) {
    assert.equal(nameAtAngle(longitudeAngle(lon)), nameAtLongitude(lon))
  }
})

test('aspects: each pair once, in its closest aspect within its orb', () => {
  const found = aspectsAmong([
    { name: 'Sun', lon: 10 },
    { name: 'Moon', lon: 128 }, // 118° from the Sun: a trine, 2° off
    { name: 'Mars', lon: 191 }, // 181° from the Sun: an opposition, 1° off
    { name: 'Venus', lon: 15 }, // 5° from the Sun: a conjunction
    { name: 'Saturn', lon: 357 }, // 13° from the Sun: nothing
  ])
  const by = (a: string, b: string) =>
    found.find((x) => x.between.join() === [a, b].join())
  assert.equal(by('Sun', 'Moon')?.name, 'trine')
  assert.equal(by('Sun', 'Mars')?.name, 'opposition')
  assert.equal(by('Sun', 'Venus')?.name, 'conjunction')
  assert.equal(by('Sun', 'Saturn'), undefined)
  // Moon at 128°, Mars at 191°: 63° apart, a sextile 3° off.
  assert.equal(by('Moon', 'Mars')?.name, 'sextile')
  // Across 0° Aries: 357° and 15° are 18° apart, nothing.
  assert.equal(by('Venus', 'Saturn'), undefined)
})
