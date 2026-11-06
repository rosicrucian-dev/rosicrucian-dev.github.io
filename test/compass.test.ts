// Which way the phone is facing: the compass correction, and the
// conversion from a phone's attitude to where the camera looks.
//
// These pin down what the code assumes. Whether iOS really behaves this
// way has not been confirmed on a device.
//
//   npm test

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Quaternion, Vector3 } from 'three'

import { setFromPhone } from '../src/components/tree-of-life-sphere/phone.ts'
import {
  COMPASS_EASE,
  correctYaw,
  measuredYaw,
  shortest,
} from '../src/lib/compass.ts'

// Where a camera with this attitude is looking, in east / up / south.
function looking(alpha: number, beta: number, gamma = 0, screen = 0) {
  const q = setFromPhone(new Quaternion(), alpha, beta, gamma, screen)
  return new Vector3(0, 0, -1).applyQuaternion(q)
}
const close = (v: Vector3, [x, y, z]: number[], message?: string) =>
  assert.ok(
    v.distanceTo(new Vector3(x, y, z)) < 1e-6,
    message ?? v.toArray().join(', '),
  )

test('a phone held upright looks out of its back, along the ground', () => {
  close(looking(0, 90), [0, 0, -1], 'facing north')
  // Alpha counts anticlockwise, so 270° is a quarter turn to the east.
  close(looking(270, 90), [1, 0, 0], 'facing east')
  close(looking(180, 90), [0, 0, 1], 'facing south')
})

test('a phone lying flat, screen up, looks at the ground', () => {
  close(looking(0, 0), [0, -1, 0])
})

test('tipping the phone back raises the view by the same angle', () => {
  const s = Math.sin((40 * Math.PI) / 180)
  const c = Math.cos((40 * Math.PI) / 180)
  close(looking(0, 130), [0, s, -c], '40° above the northern horizon')
})

test('turning the screen sideways does not change where it looks', () => {
  close(looking(0, 90, 0, 90), [0, 0, -1])
})

test('shortest takes the smaller way round', () => {
  assert.equal(shortest(10), 10)
  assert.equal(shortest(350), -10)
  assert.equal(shortest(-190), 170)
  assert.equal(shortest(540), -180)
})

test('with no compass at all, alpha is taken as it comes', () => {
  assert.equal(correctYaw(null, { alpha: 50, beta: 40, gamma: 0 }), 0)
  assert.equal(correctYaw(12, { alpha: 50, beta: 40, gamma: 0 }), 12)
})

test('the first fix is taken whole', () => {
  // Heading 90° (east), alpha 30°: true alpha should be 270°, so add 240°.
  const reading = { alpha: 30, beta: 40, gamma: 0, heading: 90, accuracy: 10 }
  assert.equal(measuredYaw(reading), 240)
  assert.equal(correctYaw(null, reading), 240)
})

test('a heading with no fix is ignored', () => {
  const reading = { alpha: 30, beta: 40, gamma: 0, heading: 90, accuracy: -1 }
  assert.equal(measuredYaw(reading), null)
  assert.equal(correctYaw(null, reading), null)
  assert.equal(correctYaw(200, reading), 200)
})

test('tipped back past upright, the heading is read the other way round', () => {
  const flat = { alpha: 30, beta: 40, gamma: 0, heading: 90, accuracy: 10 }
  const raised = { ...flat, beta: 130 }
  assert.equal(measuredYaw(raised)! - measuredYaw(flat)!, 180)
})

test('later fixes ease in gently, and only while the phone is fairly flat', () => {
  const reading = { alpha: 0, beta: 40, gamma: 0, heading: 260, accuracy: 10 }
  // Measured 100°, in use 90°: move a small part of the 10° gap.
  assert.ok(
    Math.abs(correctYaw(90, reading)! - (90 + 10 * COMPASS_EASE)) < 1e-9,
  )
  // Held up at the sky the compass is not trusted to correct anything.
  assert.equal(correctYaw(90, { ...reading, beta: 100 }), 90)
  assert.equal(correctYaw(90, { ...reading, beta: 130 }), 90)
})

test('easing goes the short way across north', () => {
  // Measured 5°, in use 355°: the gap is +10°, not -350°.
  const reading = { alpha: 0, beta: 40, gamma: 0, heading: 355, accuracy: 10 }
  assert.equal(shortest(measuredYaw(reading)!), 5)
  const next = correctYaw(355, reading)!
  assert.ok(next > 355 && next < 356, `${next}`)
})
