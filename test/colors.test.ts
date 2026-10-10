// One palette for the whole site: the same thing is the same colour on
// the Tree, on the sphere's planets, and in the Vault.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { inkOn, LETTER_COLORS, PALETTE } from '../src/lib/colors.ts'
import { PLANETS as SKY_PLANETS } from '../src/lib/planets.ts'
import { PATHS, SEPHIROTH } from '../src/lib/tree.ts'
import { VAULT_PLANETS, WALL_SQUARES } from '../src/lib/vault.ts'

const pathColor = (hebrew: string) =>
  PATHS.find((p) => p.hebrew === hebrew)!.color

test('every path takes its colour from the palette', () => {
  assert.equal(PATHS.length, 22)
  for (const path of PATHS) {
    assert.equal(path.color, PALETTE[LETTER_COLORS[path.hebrew]], path.name)
  }
})

test('a planet is the colour of its path, on the sphere and in the Vault', () => {
  const letters: Record<string, string> = {
    saturn: 'ת',
    jupiter: 'כ',
    mars: 'פ',
    sun: 'ר',
    venus: 'ד',
    mercury: 'ב',
    moon: 'ג',
  }
  for (const [id, letter] of Object.entries(letters)) {
    const vault = VAULT_PLANETS[id as keyof typeof VAULT_PLANETS]
    assert.equal(vault.color, pathColor(letter), `Vault ${id}`)
    const sky = SKY_PLANETS.find((p) => p.name === vault.name)!
    assert.equal(sky.color, pathColor(letter), `sphere ${id}`)
  }
})

test('the signs on the Vault walls are the colours of their paths', () => {
  const letters: Record<string, string> = {
    Aries: 'ה',
    Taurus: 'ו',
    Gemini: 'ז',
    Cancer: 'ח',
    Leo: 'ט',
    Virgo: 'י',
    Libra: 'ל',
    Scorpio: 'נ',
    Sagittarius: 'ס',
    Capricorn: 'ע',
    Aquarius: 'צ',
    Pisces: 'ק',
  }
  const signs = WALL_SQUARES.flat().filter((s) => s.kind === 'sign')
  assert.equal(signs.length, 12)
  for (const sign of signs) {
    assert.equal(sign.force, pathColor(letters[sign.name]), sign.name)
  }
})

test('the Sephiroth on the Vault walls match the Tree', () => {
  const squares = WALL_SQUARES.flat().filter((s) => s.kind === 'sephirah')
  assert.equal(squares.length, 10)
  for (const square of squares) {
    const sephirah = SEPHIROTH.find((s) => s.name === square.name)!
    assert.equal(square.force, sephirah.color, square.name)
  }
})

test('ink reads on its colour: black on the light, white on the dark', () => {
  assert.equal(inkOn('#ffffff'), '#000000')
  assert.equal(inkOn('#000000'), '#ffffff')
  assert.equal(inkOn(PALETTE.yellow), '#000000')
  assert.equal(inkOn(PALETTE.indigo), '#ffffff')
})
