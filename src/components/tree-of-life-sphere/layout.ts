// Where things sit on the sphere, and in what order they are drawn.

import { useEffect } from 'react'

import type { Vec3 } from '@/lib/treeOfLifeSphere'

import { RADIUS } from './geometry'

// Everything sits on one sphere, so what draws over what is decided by
// draw order alone (nothing but the occluder writes depth). The radii only
// step inward a little to keep the layers from fighting over one surface.
export const R_ART = RADIUS
export const R_LINES = RADIUS * 0.998
export const R_STARS = RADIUS * 0.997
export const R_ZODIAC = RADIUS * 0.994
export const R_PATHS = RADIUS * 0.99
export const R_NODES = RADIUS * 0.988
export const R_LABELS = RADIUS * 0.98
// Hides the far side of the sphere in the outside view. Front faces only,
// so from the centre it is culled away entirely. It sits as close under
// the layers as it can, or the far side would show in a ring at the limb.
export const R_OCCLUDER = RADIUS * 0.975
export const R_HORIZON = RADIUS * 0.96

export const ORDER = {
  art: 1,
  lines: 2,
  stars: 3,
  zodiac: 4,
  paths: 10,
  nodes: 12,
  rims: 13,
  planets: 16,
  labels: 30,
  ground: 40,
  horizon: 41,
}

// Inside, the camera sits this far off the centre and is turned in place
// (the same trick as the Cube of Space).
export const EPS = 0.001
// The field of view the inside view opens at on a wide screen, and so the
// one everything is sized to look right at.
export const INSIDE_FOV = 72

// Within a layer, things with the same renderOrder are drawn back to
// front by the depth of their bounding-sphere centres, which changes as
// the camera moves, so two crossing paths swap places as you orbit. This
// gives the i-th thing in a layer its own fixed place just above the
// layer's base, so the order never changes.
export function stacked(base: number, i: number): number {
  return base + (i + 1) * 0.001
}

export function scaled([x, y, z]: Vec3, r: number): Vec3 {
  return [x * r, y * r, z * r]
}

export function useDispose(resource: { dispose: () => void }) {
  useEffect(() => () => resource.dispose(), [resource])
}
