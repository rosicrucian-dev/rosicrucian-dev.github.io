import { Vector3 } from 'three'
import {
  BODY_HALF_SPAN,
  BODY_HEIGHT,
  BODY_SOLES,
  SPHERE_RADIUS,
  sphereCentre,
  SPHERES,
  type TreeLayout,
} from '@/lib/treeOfLife'

// On the body the spheres are drawn twice their size, glows and all; the
// paths keep theirs and simply run further into them.
const BODY_SPHERE_SCALE = 2

export function sphereScale(layout: TreeLayout): number {
  return layout === 'body' ? BODY_SPHERE_SCALE : 1
}

// The overview's field of view, in degrees.
export const OVERVIEW_FOV = 45

// What the overview frames: everything that shows, and no more. Kether's
// short rays above it, the glows to either side, Malkuth's rainbow below
// it; on the body, also the figure's outspread hands and its feet. In
// sphere radii, as each reaches past its sphere's centre (Kether's upward
// ray runs to 1.6 radii, the coloured glows fade out by about 1.4, the
// rainbow by 1.6).
const FRAME_ABOVE = 1.75
const FRAME_BESIDE = 1.45
const FRAME_BELOW = 1.65

export function overviewFrame(layout: TreeLayout) {
  const centres = SPHERES.map((r) => new Vector3(...sphereCentre(r.id, layout)))
  const radius = SPHERE_RADIUS * sphereScale(layout)
  const xs = centres.map((c) => c.x)
  const zs = centres.map((c) => c.z)
  let left = Math.min(...xs) - radius * FRAME_BESIDE
  let right = Math.max(...xs) + radius * FRAME_BESIDE
  const top = Math.min(...zs) - radius * FRAME_ABOVE
  let bottom = Math.max(...zs) + radius * FRAME_BELOW
  if (layout === 'body') {
    left = Math.min(left, -BODY_HALF_SPAN * BODY_HEIGHT)
    right = Math.max(right, BODY_HALF_SPAN * BODY_HEIGHT)
    bottom = Math.max(bottom, BODY_SOLES)
  }
  return {
    middle: new Vector3((left + right) / 2, 0, (top + bottom) / 2),
    width: right - left,
    height: bottom - top,
  }
}

// The clear space kept between what the overview frames and the window's
// edges (below the header, at the top), in pixels.
export const FRAME_PADDING = 24
// The header's height, should it not be found.
export const HEADER_HEIGHT = 56
