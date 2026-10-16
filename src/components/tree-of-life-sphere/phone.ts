// Turning a phone's reported attitude into a camera orientation.

import { Euler, Quaternion, Vector3 } from 'three'

const DEG = Math.PI / 180
const euler = new Euler()
const twist = new Quaternion()
// The camera looks out of the back of the phone, not out of its top edge.
const BACK_OF_PHONE = new Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2)
const SCREEN_AXIS = new Vector3(0, 0, 1)

// A phone's attitude (degrees, alpha measured from north) as a camera
// orientation in the local frame X east, Y up, Z south, so that the camera
// sees what a window in the phone's place would. `screen` is how far the
// page is rotated from the phone's natural upright. (The standard
// conversion, as in three.js's DeviceOrientationControls.)
export function setFromPhone(
  target: Quaternion,
  alpha: number,
  beta: number,
  gamma: number,
  screen: number,
): Quaternion {
  euler.set(beta * DEG, alpha * DEG, -gamma * DEG, 'YXZ')
  return target
    .setFromEuler(euler)
    .multiply(BACK_OF_PHONE)
    .multiply(twist.setFromAxisAngle(SCREEN_AXIS, -screen * DEG))
}

// How far the page is currently rotated from the phone's natural upright.
export function screenAngle(): number {
  return (
    window.screen.orientation?.angle ??
    (window as { orientation?: number }).orientation ??
    0
  )
}
