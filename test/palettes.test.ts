// The palettes and the colours of the four scales made from them.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  colorOf,
  LETTER_MARKS,
  LETTER_SCALE_NAMES,
  mix,
  PALETTES,
  PLANET_WORDS,
  RECIPES,
  SIGN_WORDS,
  stepColor,
  WHEEL,
  type ColorWord,
} from '../src/lib/palettes.ts'

const HEX = /^#[0-9A-F]{6}$/

test('each palette is a full wheel of twelve', () => {
  for (const { id } of PALETTES)
    for (const step of WHEEL)
      assert.match(stepColor(step, id), HEX, `${id} ${step}`)
})

test('the Tailwind wheel blends its anchors for the steps between', () => {
  assert.equal(
    stepColor('red-orange', 'tailwind'),
    mix('#FB2C36', '#FF6900', 0.5),
  )
  assert.equal(stepColor('orange', 'tailwind'), '#FF6900')
})

test('Cicero’s wheel is her paints’, as converted from their Munsell values', () => {
  assert.equal(stepColor('green', 'cicero'), '#008A3C')
  assert.equal(stepColor('blue', 'cicero'), '#0085B1')
})

test('every colour the scales name has a recipe, and makes a colour in every palette', () => {
  const words = new Set<ColorWord>([
    ...Object.values(LETTER_SCALE_NAMES).flat(),
    ...Object.values(LETTER_MARKS).flatMap((m) =>
      Object.values(m).flatMap((mark) => mark!.colors),
    ),
    ...SIGN_WORDS,
    ...Object.values(PLANET_WORDS),
  ])
  for (const word of words) {
    assert.ok(word in RECIPES, word)
    for (const { id } of PALETTES)
      assert.match(colorOf(word, id), HEX, `${word} in ${id}`)
  }
  assert.equal(Object.keys(LETTER_SCALE_NAMES).length, 22)
})

test('the readings keep their sense: light is lighter, deep is darker', () => {
  const lum = (hex: string) =>
    [1, 3, 5].reduce((sum, i) => sum + parseInt(hex.slice(i, i + 2), 16), 0)
  for (const { id } of PALETTES) {
    assert.ok(lum(colorOf('sky blue', id)) > lum(colorOf('blue', id)), id)
    assert.ok(lum(colorOf('deep blue', id)) < lum(colorOf('blue', id)), id)
    assert.ok(
      lum(colorOf('pale green', id)) > lum(colorOf('emerald green', id)),
      id,
    )
  }
})

test('the signs run round the wheel, from Aries’ scarlet', () => {
  assert.equal(SIGN_WORDS.length, 12)
  assert.equal(colorOf(SIGN_WORDS[2], 'flo'), stepColor('orange', 'flo'))
  assert.equal(colorOf(SIGN_WORDS[8], 'cicero'), stepColor('blue', 'cicero'))
})
