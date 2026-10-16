import { CIRCUMRADIUS, cornerAngle, SIDES } from '@/lib/vault'

// What both designs of the Vault paint with: the scale of their wall
// drawings and the frame of their ceiling and floor plans.

// Pixels per foot. The walls are the surfaces looked at most closely.
export const WALL_SCALE = 320

// The ceiling and floor are each painted on a square canvas this many
// pixels across, the heptagon's corners reaching PLAN_MARGIN of the way
// from its centre to its edge. The room (Room.tsx) maps the canvas back
// onto the heptagon with the same margin, so the two must agree.
export const PLAN_SIZE = 1400
export const PLAN_MARGIN = 0.92

// Both are drawn in plan, as seen from above, with the East corner at the
// top of the canvas and the Venus wall (the door) at the bottom. The scene
// maps the canvas over the heptagon so that world +X runs up the canvas.
export function planSetup(ctx: CanvasRenderingContext2D) {
  const s = PLAN_SIZE / 2
  ctx.translate(s, s)
  // Canvas y down = world +X (east) up: rotate so that angle 0 (east)
  // points to the top of the canvas and angles increase clockwise, as the
  // walls do seen from above.
  ctx.rotate(-Math.PI / 2)
  return (s * PLAN_MARGIN) / CIRCUMRADIUS // pixels per foot
}

export function heptagonPath(ctx: CanvasRenderingContext2D, R: number) {
  ctx.beginPath()
  for (let i = 0; i < SIDES; i++) {
    const a = cornerAngle(i)
    const x = Math.cos(a) * R
    const y = Math.sin(a) * R
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}
