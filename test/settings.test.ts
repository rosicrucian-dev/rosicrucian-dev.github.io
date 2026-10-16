import assert from 'node:assert/strict'
import { test } from 'node:test'

import { bool, oneOf, parseSwitches } from '../src/lib/settings.ts'

test('bool keeps a stored boolean and otherwise falls back', () => {
  assert.equal(bool(false, true), false)
  assert.equal(bool(true, false), true)
  for (const junk of [undefined, null, 'true', 1, {}]) {
    assert.equal(bool(junk, true), true)
  }
})

test('oneOf keeps a stored option and otherwise falls back', () => {
  const views = ['inside', 'outside'] as const
  assert.equal(oneOf('inside', views, 'outside'), 'inside')
  // An option a page once had, since removed, falls back too.
  for (const junk of ['overview', undefined, null, 3, {}]) {
    assert.equal(oneOf(junk, views, 'outside'), 'outside')
  }
})

test('parseSwitches keeps each valid switch and defaults the rest', () => {
  const defaults = { a: true, b: false, c: true }
  assert.deepEqual(parseSwitches({ a: false, b: 'yes', d: true }, defaults), {
    a: false,
    b: false,
    c: true,
  })
  assert.deepEqual(parseSwitches(null, defaults), defaults)
})
