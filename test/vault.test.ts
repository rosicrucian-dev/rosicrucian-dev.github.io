// The Vault's data tables.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  CANDLESTICK_WALLS,
  CASE_SQUARES,
  CEILING_BOARDS,
  DIAGRAMS,
  DIAGRAM_CENTRE,
  DIAGRAM_GAP,
  INRADIUS,
  CIRCUMRADIUS,
  POSTER_HEIGHT,
  WALL_HEIGHT,
  SIDES,
  diagramPlace,
  wallAngle,
  wallPoint,
  wallReach,
  FLOOR_POINTS,
  PLANET_LORE,
  SIGN_GLYPH,
  SPECTRUM_WALLS,
  boardWidth,
  cornerAngle,
  hebrewNumeral,
  magicLine,
} from '../src/lib/vault.ts'

// Every planet's kamea must be a true magic square before anything is
// drawn from it: the seal is traced through these numbers, so a slip in
// transcription would draw a figure that is simply wrong.
test('each kamea is a magic square', () => {
  for (const [id, lore] of Object.entries(PLANET_LORE)) {
    const k = lore.kamea
    const n = k.length
    const constant = (n * (n * n + 1)) / 2

    assert.ok(
      k.every((row) => row.length === n),
      `${id}: not square`,
    )
    assert.deepEqual(
      [...k.flat()].sort((a, b) => a - b),
      Array.from({ length: n * n }, (_, i) => i + 1),
      `${id}: entries are not exactly 1..${n * n}`,
    )

    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
    for (let i = 0; i < n; i++) {
      assert.equal(sum(k[i]), constant, `${id}: row ${i}`)
      assert.equal(sum(k.map((row) => row[i])), constant, `${id}: column ${i}`)
    }
    assert.equal(sum(k.map((row, i) => row[i])), constant, `${id}: diagonal`)
    assert.equal(
      sum(k.map((row, i) => row[n - 1 - i])),
      constant,
      `${id}: anti-diagonal`,
    )
  }
})

// The magic line must visit every cell exactly once, or the seal drawn
// from it would skip part of the square.
test('the magic line visits every cell once', () => {
  for (const [id, lore] of Object.entries(PLANET_LORE)) {
    const n = lore.kamea.length
    const line = magicLine(lore.kamea)
    assert.equal(line.length, n * n, `${id}: wrong length`)
    const seen = new Set(line.map(([c, r]) => `${c},${r}`))
    assert.equal(seen.size, n * n, `${id}: repeats a cell`)
    // Each step lands on the cell holding the next number.
    line.forEach(([c, r], i) => {
      assert.equal(lore.kamea[r][c], i + 1, `${id}: step ${i}`)
    })
  }
})

// Case parts each wall into ten, two across and five down.
test('Case has ten squares', () => {
  assert.equal(CASE_SQUARES.length, 10)
  assert.equal(new Set(CASE_SQUARES.map((s) => s.kind)).size, 10)
})

// The ceiling and floor are reflections of each other, so the Sephiroth
// and their averse forms must run in step, corner for corner. Case's
// Figure 4 fixes where the sequence starts: Chesed at the East.
test('the ceiling and floor agree, Chesed first', () => {
  assert.equal(CEILING_BOARDS.length, 7)
  assert.equal(FLOOR_POINTS.length, 7)
  assert.equal(CEILING_BOARDS[0], 'חסד')
  assert.equal(FLOOR_POINTS[0], 'געשכלה')
})

// Both designs seat all seven planets, and both hang the door on Venus.
test('both designs seat the seven planets', () => {
  for (const walls of [SPECTRUM_WALLS, CANDLESTICK_WALLS]) {
    assert.equal(walls.length, 7)
    assert.equal(new Set(walls.map((w) => w.planet.id)).size, 7)
    assert.equal(walls.filter((w) => w.door).length, 1)
    assert.equal(walls.find((w) => w.door)?.planet.id, 'venus')
  }
})

// A board hangs against whatever is behind it wherever it is put, and no
// part of it may ever cross a wall. Swept right round the room, every
// board must stay inside all seven walls, and must be hard against at
// least one of them -- hanging further in than it needs to would leave it
// floating in the room.
test('a board hangs against the walls without crossing one', () => {
  const STEPS = 360
  for (const d of DIAGRAMS) {
    const half = boardWidth(d) / 2
    for (let k = 0; k < STEPS; k++) {
      const angle = (k * 2 * Math.PI) / STEPS
      const reach = wallReach(angle, half, DIAGRAM_GAP)
      assert.ok(reach > 0, `${d.id}: no room at ${k}`)
      // The board's two ends, in plan.
      const ends = [half, -half].map((t) => [
        Math.cos(angle) * reach - Math.sin(angle) * t,
        Math.sin(angle) * reach + Math.cos(angle) * t,
      ])
      let touching = false
      for (let i = 0; i < SIDES; i++) {
        const a = wallAngle(i)
        for (const [x, z] of ends) {
          const into = x * Math.cos(a) + z * Math.sin(a)
          assert.ok(
            into <= INRADIUS - DIAGRAM_GAP + 1e-9,
            `${d.id}: through wall ${i} at ${k}`,
          )
          if (into > INRADIUS - DIAGRAM_GAP - 1e-9) touching = true
        }
      }
      assert.ok(touching, `${d.id}: floating free at ${k}`)
    }
  }
})

// Each board starts in its corner, bisecting the seam. A board in a
// corner has to stand out into the room far enough for both its ends to
// clear the two walls, but only just: a few inches, not a foot.
test('each board starts tucked into its corner', () => {
  for (const d of DIAGRAMS) {
    const { reach } = diagramPlace(d, cornerAngle(d.corner), DIAGRAM_CENTRE)
    const out = CIRCUMRADIUS - reach
    assert.ok(out > 0, `${d.id}: outside the corner`)
    assert.ok(out < 0.5, `${d.id}: stands ${(out * 12).toFixed(1)} in out`)
  }
})

// However far up or down a board is dragged it stays on the wall, whole:
// its own height keeps its middle away from the floor and the ceiling.
test('a board stays between the floor and the ceiling', () => {
  for (const d of DIAGRAMS) {
    for (const asked of [-40, 0, 1, DIAGRAM_CENTRE, 7, 8, 99]) {
      const { y } = diagramPlace(d, 0, asked)
      assert.ok(y - POSTER_HEIGHT / 2 >= 0, `${d.id}: through the floor`)
      assert.ok(
        y + POSTER_HEIGHT / 2 <= WALL_HEIGHT,
        `${d.id}: through the ceiling`,
      )
    }
  }
})

// What a board is dragged by: a ray cast from the eye through the pointer
// finds the wall it is aimed at. From the middle of the room, level, a
// ray along a wall's own bearing must land in the middle of that wall.
test('a ray from inside finds the wall it points at', () => {
  for (let i = 0; i < SIDES; i++) {
    const a = wallAngle(i)
    const hit = wallPoint(
      { x: 0, y: DIAGRAM_CENTRE, z: 0 },
      { x: Math.cos(a), y: 0, z: Math.sin(a) },
    )
    assert.ok(hit, `wall ${i}: missed`)
    // Angles come back from atan2, so compare them the short way round.
    const off = Math.atan2(Math.sin(hit.angle - a), Math.cos(hit.angle - a))
    assert.ok(Math.abs(off) < 1e-9, `wall ${i}: off bearing`)
    assert.equal(hit.y, DIAGRAM_CENTRE, `wall ${i}: off height`)
  }
  // A ray cast straight up meets no wall at all.
  assert.equal(wallPoint({ x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }), null)
})

// Three corners, three diagrams, no two in the same one.
test('the diagrams hang in three different corners', () => {
  assert.equal(DIAGRAMS.length, 3)
  assert.equal(new Set(DIAGRAMS.map((d) => d.corner)).size, 3)
})

// Every Hebrew name on a wall is set in both scripts, so the wall reads
// one way throughout rather than Hebrew in some squares and Roman in
// others. Anything that is not a Hebrew name -- the Churches, the signs
// of the zodiac -- is Roman alone, which is correct.
test('Hebrew names carry their Hebrew', () => {
  const hebrew = /^[\u0590-\u05FF\s]+$/
  for (const [id, lore] of Object.entries(PLANET_LORE)) {
    const pairs: [string, string, string][] = [
      ['divine name', lore.divineName, lore.divineNameHebrew],
      ['archangel', lore.archangel, lore.archangelHebrew],
      ['choir', lore.choir, lore.choirHebrew],
      ['palace', lore.palace, lore.palaceHebrew],
    ]
    for (const [what, roman, heb] of pairs) {
      assert.ok(roman.length > 0, `${id}: no ${what}`)
      assert.ok(hebrew.test(heb), `${id}: ${what} "${heb}" is not Hebrew`)
    }
    assert.ok(hebrew.test(lore.letter), `${id}: letter`)
    assert.ok(hebrew.test(lore.sephirahHebrew), `${id}: sephirah`)
  }
})

// A Hebrew numeral must add back to the number it stands for; that is
// what makes a Kamea written in letters still a magic square. Checked
// over every value any of the seven Kameas holds.
test('Hebrew numerals add back to their number', () => {
  const VALUE: Record<string, number> = {}
  const letters = 'אבגדהוזחט'
  letters.split('').forEach((c, i) => (VALUE[c] = i + 1))
  'יכלמנסעפצ'.split('').forEach((c, i) => (VALUE[c] = (i + 1) * 10))
  'קרשת'.split('').forEach((c, i) => (VALUE[c] = (i + 1) * 100))

  const gematria = (w: string) =>
    [...w].reduce((sum, c) => sum + (VALUE[c] ?? 0), 0)

  const biggest = Math.max(
    ...Object.values(PLANET_LORE).map((l) => l.kamea.length ** 2),
  )
  for (let n = 1; n <= biggest; n++) {
    const word = hebrewNumeral(n)
    assert.equal(gematria(word), n, `${n} -> ${word}`)
  }
  // The two that must not spell the divine name.
  assert.equal(hebrewNumeral(15), 'טו')
  assert.equal(hebrewNumeral(16), 'טז')
})

// Every sign a planet rules or is exalted in must have a glyph to draw.
test('every sign named has a glyph', () => {
  for (const [id, lore] of Object.entries(PLANET_LORE)) {
    for (const s of [...lore.rules, ...lore.exalted]) {
      assert.ok(SIGN_GLYPH[s], `${id}: no glyph for ${s}`)
    }
  }
})

// The Gematria Notebooks name an Intelligence and a Spirit for every one
// of the seven. A name and its Hebrew always travel together.
test('every planet has its Intelligence and its Spirit', () => {
  const hebrew = /^[\u0590-\u05FF\s]+$/
  for (const [id, lore] of Object.entries(PLANET_LORE)) {
    assert.ok(lore.spirit, `${id}: no Spirit`)
    assert.ok(hebrew.test(lore.spiritHebrew ?? ''), `${id}: Spirit Hebrew`)
    assert.equal(
      lore.intelligence === undefined,
      lore.intelligenceHebrew === undefined,
      `${id}: Intelligence and its Hebrew must come together`,
    )
    if (lore.intelligence) {
      assert.ok(
        hebrew.test(lore.intelligenceHebrew ?? ''),
        `${id}: Intelligence Hebrew`,
      )
    }
  }
  const named = Object.values(PLANET_LORE).filter((l) => l.intelligence)
  assert.equal(named.length, 7, 'all seven are named')
})

// The Moon's Intelligence is the one name the Notebooks warn is corrupt
// in print. Their manuscript spelling reconstructs to both the numbers
// they file it under -- 3321 counting final Mem as 600, 2201 counting it
// as 40 -- which is what tells us this spelling is the right one.
test("the Moon's Intelligence reconstructs to both its numbers", () => {
  const plain: Record<string, number> = {}
  'אבגדהוזחט'.split('').forEach((c, i) => (plain[c] = i + 1))
  'יכלמנסעפצ'.split('').forEach((c, i) => (plain[c] = (i + 1) * 10))
  'קרשת'.split('').forEach((c, i) => (plain[c] = (i + 1) * 100))
  plain['ם'] = 40

  const name = PLANET_LORE.moon.intelligenceHebrew ?? ''
  const sum = (finalMem: number) =>
    [...name].reduce((t, c) => t + (c === 'ם' ? finalMem : (plain[c] ?? 0)), 0)
  assert.equal(sum(600), 3321)
  assert.equal(sum(40), 2201)
})
