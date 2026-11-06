// Working out which way a phone is really facing.
//
// A phone reports its attitude as three angles. Android has an event whose
// first angle (alpha) is already measured from north. iOS's alpha instead
// starts from wherever the phone happened to point when the page loaded,
// and slowly drifts; alongside it iOS gives a separate compass heading.
// The job here is to find `yaw`: the correction, in degrees, that turns
// iOS's alpha into a true bearing.
//
// Pure arithmetic, so it can be tested without a phone. The assumptions
// about how iOS behaves have NOT yet been confirmed on a real device.

const DEG = Math.PI / 180

// The compass is only trusted to keep correcting drift while the phone is
// tilted less than about 75° from flat (cos 75° ≈ 0.26), and then only
// gently, a few percent of the gap per reading.
export const COMPASS_TRUST = 0.26
export const COMPASS_EASE = 0.03

export interface PhoneReading {
  // Degrees, as a DeviceOrientationEvent gives them.
  alpha: number
  beta: number
  gamma: number
  // iOS only: degrees clockwise from north, and how far off it may be
  // (negative when the compass has no fix).
  heading?: number
  accuracy?: number
}

// The smaller way round from 0 to `angle`, in degrees: -180 to 180.
export function shortest(angle: number): number {
  return ((((angle + 180) % 360) + 360) % 360) - 180
}

// What this one reading says the correction should be, or null if it has no
// usable compass heading.
//
// The heading is of the phone's top edge, as if laid flat on the ground.
// Tip the phone back past upright to look at the sky and that edge points
// behind you, so the heading reads the opposite way; the cosine of beta
// going negative marks that.
export function measuredYaw(reading: PhoneReading): number | null {
  const { alpha, beta, heading, accuracy } = reading
  if (typeof heading !== 'number' || (accuracy ?? 0) < 0) return null
  return 360 - heading - alpha + (Math.cos(beta * DEG) < 0 ? 180 : 0)
}

// The correction to use after seeing `reading`, given the one in use so far
// (null before the first fix). Null back means there is still no fix.
export function correctYaw(
  yaw: number | null,
  reading: PhoneReading,
): number | null {
  // No compass on this device at all: take alpha as it comes.
  if (typeof reading.heading !== 'number') return yaw ?? 0

  const measured = measuredYaw(reading)
  if (measured === null) return yaw
  // The first fix is taken whole, whatever the tilt: something is better
  // than nothing, and it is refined from there.
  if (yaw === null) return measured
  if (Math.cos(reading.beta * DEG) <= COMPASS_TRUST) return yaw
  return yaw + shortest(measured - yaw) * COMPASS_EASE
}
