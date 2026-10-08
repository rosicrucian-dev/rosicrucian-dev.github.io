// The Golden Dawn Vault's ceiling and floor, painted in plan as the
// plates in Regardie draw them.

import type { CanvasTexture } from 'three'
import {
  CIRCUMRADIUS,
  cornerAngle,
  CORNERS,
  ROSE_PETALS,
  SIDES,
  SUPERNALS,
  wallAngle,
  WALLS,
} from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { PALETTE } from '@/lib/colors'
import { drawGlyph, type Fonts } from '@/components/model/fonts'
import { PLAN_SIZE, planSetup, heptagonPath } from '../paint'

// ---- Plan drawings (ceiling and floor) -------------------------------------------

// The heptagram as the plates draw it: each corner joined to the second
// from it (the {7/2} star), which leaves a wide seven-sided space in the
// middle that the triangle sits inside without touching the star.
function heptagramPath(ctx: CanvasRenderingContext2D, R: number) {
  ctx.beginPath()
  let i = 0
  for (let k = 0; k <= SIDES; k++) {
    const a = cornerAngle(i)
    const x = Math.cos(a) * R
    const y = Math.sin(a) * R
    if (k === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
    i = (i + 2) % SIDES
  }
  ctx.closePath()
}

// The line width of the figures on the ceiling and floor, in pixels.
const PLAN_LINE = 9

// The radius to draw the heptagon at so that the OUTER edge of its
// outline, not its centre-line, meets the walls: the outline's mitred
// corner reaches half a line width further out along the corner's
// radius, divided by the sine of half the interior angle.
function figureRadius(roomR: number): number {
  const halfInterior = (Math.PI * (SIDES - 2)) / (2 * SIDES)
  return roomR - PLAN_LINE / 2 / Math.sin(halfInterior)
}

// How far from the centre the star's inner edge lies along the ray at
// angle `a`: the nearest crossing of that ray with any of the star's
// chords, pulled in by half the line width so the result is the edge of
// the drawn line, not its centre.
function starInnerEdge(a: number, R: number): number {
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  let nearest = Infinity
  for (let i = 0; i < SIDES; i++) {
    const a0 = cornerAngle(i)
    const a1 = cornerAngle((i + 2) % SIDES)
    const x0 = Math.cos(a0) * R
    const y0 = Math.sin(a0) * R
    const ex = Math.cos(a1) * R - x0
    const ey = Math.sin(a1) * R - y0
    // Solve t·(dx, dy) = (x0, y0) + u·(ex, ey) for t and u.
    const det = dx * ey - dy * ex
    if (Math.abs(det) < 1e-9) continue
    const t = (x0 * ey - y0 * ex) / det
    const u = (x0 * dy - y0 * dx) / det
    if (t > 0 && u >= 0 && u <= 1) {
      // The chord's inner edge is half a line width nearer along the
      // ray, scaled by the angle at which the ray meets it.
      const len = Math.hypot(ex, ey)
      const sinTheta = Math.abs(det) / len
      nearest = Math.min(nearest, t - PLAN_LINE / 2 / sinTheta)
    }
  }
  return nearest
}

// The triangle, with each corner exactly on the inner edge of the star's
// line, so the two figures meet flush, as on the plates. Drawn as a filled
// shape with its outline inset, so nothing pokes past the star.
function trianglePath(ctx: CanvasRenderingContext2D, R: number, up: boolean) {
  const corners: [number, number][] = []
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + (up ? 0 : Math.PI)
    const r = starInnerEdge(a, R)
    corners.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  // The outline, PLAN_LINE wide, inset so its outer edge is the corner.
  const inset = (pts: [number, number][], d: number) => {
    const cx = pts.reduce((s, p) => s + p[0], 0) / 3
    const cy = pts.reduce((s, p) => s + p[1], 0) / 3
    return pts.map(([x, y]) => {
      const dx = x - cx
      const dy = y - cy
      const len = Math.hypot(dx, dy)
      // A corner of an equilateral triangle moves 2d inward for an
      // outline of width d.
      return [x - (dx / len) * 2 * d, y - (dy / len) * 2 * d] as [
        number,
        number,
      ]
    })
  }
  const inner = inset(corners, PLAN_LINE)
  ctx.beginPath()
  corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
  inner.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

// Text laid along a radius at `angle`, `r` from the centre, reading
// outward.
// `mirror` flips the glyphs in place, for a surface seen from the other
// side than the plan is drawn from (the ceiling, seen from below).
function radialText(
  ctx: CanvasRenderingContext2D,
  text: string,
  angle: number,
  r: number,
  font: string,
  color: string,
  mirror = false,
) {
  ctx.save()
  ctx.rotate(angle)
  ctx.translate(r, 0)
  ctx.rotate(Math.PI / 2)
  if (mirror) ctx.scale(-1, 1)
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

// The Red Rose of seven times seven petals, centred on (0, 0), with four
// green sepals between the outer petals unless `sepals` is false. Used on
// the floor and on the head of the Pastos.
export function drawRose49(
  ctx: CanvasRenderingContext2D,
  roseR: number,
  sepals = true,
) {
  // Sepals: four green points showing between the outer petals, one in
  // each angle of the cross. The ritual says nothing of them; they
  // follow how the Rose is drawn elsewhere in the Order, and their size
  // is a drawing choice.
  for (let i = 0; sepals && i < 4; i++) {
    const a = (i * 2 * Math.PI) / 4 + Math.PI / 4
    ctx.save()
    ctx.rotate(a)
    ctx.beginPath()
    ctx.moveTo(roseR * 0.6, -roseR * 0.24)
    ctx.quadraticCurveTo(roseR * 1.1, -roseR * 0.12, roseR * 1.38, 0)
    ctx.quadraticCurveTo(roseR * 1.1, roseR * 0.12, roseR * 0.6, roseR * 0.24)
    ctx.closePath()
    ctx.fillStyle = PALETTE.leaf
    ctx.fill()
    ctx.strokeStyle = PALETTE.leafShade
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  }
  // Seven rings of seven petals, outermost first so inner petals lie on
  // top; each ring turned a little from the last, as petals are.
  ctx.lineWidth = 1.5
  ctx.strokeStyle = PALETTE.roseShade
  for (let ring = 6; ring >= 0; ring--) {
    const r1 = roseR * ((ring + 1) / 7)
    const r0 = ring === 0 ? 0 : roseR * (ring / 7) - roseR * 0.05
    const start = ring * (Math.PI / 7)
    for (let i = 0; i < 7; i++) {
      const a0 = start + (i * 2 * Math.PI) / 7
      petalPath(ctx, r0, r1, a0, a0 + (2 * Math.PI) / 7)
      ctx.fillStyle = ring % 2 ? PALETTE.rose : PALETTE.roseLight
      ctx.fill()
      ctx.stroke()
    }
  }
}

// One petal: a sector of a ring from angle a0 to a1, between radii r0
// and r1, with the two outer corners rounded off. With r0 = 0 the petal
// comes to a point at the centre.
function petalPath(
  ctx: CanvasRenderingContext2D,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const rad = Math.min((r1 - r0) * 0.38, ((a1 - a0) * r1) / 2.6)
  const p = (r: number, a: number): [number, number] => [
    Math.cos(a) * r,
    Math.sin(a) * r,
  ]
  const [ox0, oy0] = p(r1, a0)
  const [ox1, oy1] = p(r1, a1)
  const da = rad / r1
  // The arc along the outer edge ends where the second rounded corner
  // begins, so only the first corner's end point is needed.
  const [ax0, ay0] = p(r1, a0 + da)
  const [sx0, sy0] = p(r1 - rad, a0)
  const [sx1, sy1] = p(r1 - rad, a1)
  ctx.beginPath()
  if (r0 > 0) ctx.arc(0, 0, r0, a1, a0, true)
  else ctx.moveTo(0, 0)
  ctx.lineTo(sx0, sy0)
  ctx.quadraticCurveTo(ox0, oy0, ax0, ay0)
  ctx.arc(0, 0, r1, a0 + da, a1 - da)
  ctx.quadraticCurveTo(ox1, oy1, sx1, sy1)
  ctx.closePath()
}

// The Rose of 22 petals as the plate draws it, in the same ink as the
// lines on the white ground (the ritual gives the ceiling's rose no
// colour; only the floor's and the pastos's are red): a round rosette of
// three concentric rings divided into 3, 7 and 12 petals, a letter in
// each. The innermost three meet at the centre like slices of a pie; every petal's
// two outer corners are rounded, which is what makes the rings read as
// petals rather than as a divided circle. The outer ring's edge touches
// the sides of the triangle. `outer` is the rose's outer radius; `mirror`
// flips the letters for a surface seen from the far side.
function drawRose(
  ctx: CanvasRenderingContext2D,
  outer: number,
  fonts: Fonts,
  mirror: boolean,
) {
  // Ring boundaries, from the centre out.
  const bounds = [0, outer * 0.36, outer * 0.67, outer]
  const ink = PALETTE.black
  ctx.lineWidth = Math.max(2, outer * 0.025)
  ctx.strokeStyle = ink
  ctx.lineJoin = 'round'

  const petal = (r0: number, r1: number, a0: number, a1: number) =>
    petalPath(ctx, r0, r1, a0, a1)
  // Outer ring first, each ring's inner edge reaching a little under the
  // ring inside it, so the inner petals lie over the gaps between the
  // outer ones' rounded corners.
  const overlap = outer * 0.06
  for (let ring = ROSE_PETALS.length - 1; ring >= 0; ring--) {
    const letters = ROSE_PETALS[ring]
    const r0 = ring === 0 ? 0 : bounds[ring] - overlap
    const r1 = bounds[ring + 1]
    const n = letters.length
    // Each ring starts a half-cell round, so a petal is centred on the
    // East (the triangle's apex).
    const start = -Math.PI / 2 - Math.PI / n
    letters.forEach((letter, k) => {
      const a0 = start + (k * 2 * Math.PI) / n
      const a1 = a0 + (2 * Math.PI) / n
      petal(r0, r1, a0, a1)
      ctx.fillStyle = PALETTE.white
      ctx.fill()
      ctx.stroke()

      const am = (a0 + a1) / 2
      const rm = r0 === 0 ? r1 * 0.55 : (bounds[ring] + r1) / 2
      ctx.save()
      ctx.translate(Math.cos(am) * rm, Math.sin(am) * rm)
      // Each letter stands with its top toward the centre of the flower
      // (text's up is -y, so turning by the petal's angle plus a quarter
      // turn points it inward).
      ctx.rotate(am + Math.PI / 2)
      if (mirror) ctx.scale(-1, 1)
      ctx.font = `500 ${(r1 - r0) * 0.58}px ${fonts.hebrew}`
      ctx.fillStyle = ink
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(letter, 0, 0)
      ctx.restore()
    })
  }
}

// White; a triangle enclosing a Rose of 22 petals, within a heptagram
// reflected from the seven angles of the wall. The planets of the walls
// sit in the compartments along the sides, the lower seven Sephiroth in
// the seven points, and the Supernals on the triangle, as on the plate.
export function ceilingTexture(fonts: Fonts): CanvasTexture {
  const { el, ctx } = canvas(PLAN_SIZE, PLAN_SIZE)
  ctx.fillStyle = PALETTE.white
  ctx.fillRect(0, 0, PLAN_SIZE, PLAN_SIZE)
  const ppf = planSetup(ctx)
  const R = figureRadius(CIRCUMRADIUS * ppf)

  ctx.strokeStyle = PALETTE.black
  ctx.lineWidth = PLAN_LINE
  heptagonPath(ctx, R)
  ctx.stroke()
  heptagramPath(ctx, R)
  ctx.stroke()
  trianglePath(ctx, R, true)
  ctx.fillStyle = PALETTE.black
  ctx.fill('evenodd')

  // Planets by their walls, each in the middle of its side compartment:
  // the triangle between the heptagon's edge and the two star chords that
  // meet there, whose centroid is 0.83R from the centre.
  WALLS.forEach((wall, i) => {
    ctx.save()
    ctx.rotate(wallAngle(i))
    ctx.translate(R * 0.83, 0)
    ctx.rotate(Math.PI / 2)
    ctx.scale(-1, 1)
    ctx.fillStyle = PALETTE.black
    drawGlyph(ctx, wall.planet.glyph, R * 0.08, fonts)
    ctx.restore()
  })
  // The lower Sephiroth in the points.
  CORNERS.forEach(({ sephirah }, i) => {
    radialText(
      ctx,
      sephirah,
      cornerAngle(i),
      R * 0.78,
      `500 ${R * 0.058}px ${fonts.hebrew}`,
      PALETTE.black,
      true,
    )
  })
  // Kether at the apex; Chokmah and Binah inside the base corners.
  const supernalFont = `500 ${R * 0.05}px ${fonts.hebrew}`
  radialText(
    ctx,
    SUPERNALS[0].sephirah,
    0,
    R * 0.36,
    `500 ${R * 0.058}px ${fonts.hebrew}`,
    PALETTE.black,
    true,
  )
  radialText(
    ctx,
    SUPERNALS[1].sephirah,
    (2 * Math.PI) / 3,
    R * 0.34,
    supernalFont,
    PALETTE.black,
    true,
  )
  radialText(
    ctx,
    SUPERNALS[2].sephirah,
    (4 * Math.PI) / 3,
    R * 0.34,
    supernalFont,
    PALETTE.black,
    true,
  )

  // The rose fills the triangle's inscribed circle: for an equilateral
  // triangle that is half the distance from the centre to a corner, less
  // the triangle's line.
  const triangleInradius =
    [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
      .map((a) => starInnerEdge(a, R))
      .reduce((p, q) => p + q, 0) /
      3 /
      2 -
    PLAN_LINE
  drawRose(ctx, triangleInradius * 0.96, fonts, true)

  return texture(el)
}

// Black; the triangle, inverted, within the heptagram, bearing the titles
// of the averse Sephiroth and the Great Red Dragon of seven heads, and
// within the triangle the rescuing symbol of the golden cross united to
// the red rose of forty-nine petals.
export function floorTexture(fonts: Fonts): CanvasTexture {
  const { el, ctx } = canvas(PLAN_SIZE, PLAN_SIZE)
  ctx.fillStyle = PALETTE.black
  ctx.fillRect(0, 0, PLAN_SIZE, PLAN_SIZE)
  const ppf = planSetup(ctx)
  const R = figureRadius(CIRCUMRADIUS * ppf)

  ctx.strokeStyle = PALETTE.white
  ctx.lineWidth = PLAN_LINE
  heptagonPath(ctx, R)
  ctx.stroke()
  heptagramPath(ctx, R)
  ctx.stroke()

  // The Great Red Dragon of seven heads, as the plate draws it: a round
  // body lying in the space of the star, passing under the three corners
  // of the triangle, with seven necks reaching out from it into the seven
  // points, a head at the end of each. The triangle is drawn after it,
  // over everything.
  const bodyR = R * 0.5
  const bodyW = R * 0.045
  // `scales`, if given, is the part of the path that carries scales;
  // a neck leaves its head bare so it reads as a head.
  const drawSerpent = (path: () => void, scales: () => void = path) => {
    path()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = PALETTE.dragon
    ctx.lineWidth = bodyW
    ctx.stroke()
    scales()
    ctx.strokeStyle = PALETTE.dragonLight
    ctx.lineWidth = bodyW * 0.3
    ctx.setLineDash([bodyW * 0.5, bodyW * 0.5])
    ctx.stroke()
    ctx.setLineDash([])
  }
  // The ring of the body.
  drawSerpent(() => {
    ctx.beginPath()
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2)
  })

  // Seven necks. Each is a branch that keeps travelling the way the ring
  // runs: it lifts off the ring at the near edge of its point, climbs
  // outward, and levels off again so that by the far edge the head is
  // running parallel to the ring, only further out. So every head faces
  // the same way round the circle and none turns back. The heads face
  // counter-clockwise, as in the Pansophers' vault (the text gives no
  // direction). The necks lie over
  // the triangle, as on the plate. A head is just the body's rounded end,
  // with an eye.
  const sector = (2 * Math.PI) / SIDES
  for (let k = 0; k < SIDES; k++) {
    const a = cornerAngle(k)
    // Take-off, on the ring, a little before the point; touchdown, out
    // in the point, a little past it: the neck spans most of the point's
    // width.
    const aStart = a + sector * 0.48
    const aEnd = a - sector * 0.12
    const rStart = bodyR
    const rEnd = R * 0.74
    const sx = Math.cos(aStart) * rStart
    const sy = Math.sin(aStart) * rStart
    const ex = Math.cos(aEnd) * rEnd
    const ey = Math.sin(aEnd) * rEnd
    // Tangent directions (the body runs counter-clockwise, decreasing
    // angle) at both ends, so the curve leaves and arrives running along
    // the ring.
    const reach = R * 0.22
    const c1x = sx - Math.cos(aStart + Math.PI / 2) * reach
    const c1y = sy - Math.sin(aStart + Math.PI / 2) * reach
    const c2x = ex + Math.cos(aEnd + Math.PI / 2) * reach
    const c2y = ey + Math.sin(aEnd + Math.PI / 2) * reach
    // The curve, sampled, so the scales can stop a head's length short
    // of the end.
    const bez = (t: number): [number, number] => {
      const u = 1 - t
      return [
        u * u * u * sx +
          3 * u * u * t * c1x +
          3 * u * t * t * c2x +
          t * t * t * ex,
        u * u * u * sy +
          3 * u * u * t * c1y +
          3 * u * t * t * c2y +
          t * t * t * ey,
      ]
    }
    const samples: [number, number][] = []
    for (let i = 0; i <= 40; i++) samples.push(bez(i / 40))
    // Walk back from the end until a head's length (1.6 body widths) of
    // arc has been left bare.
    let bare = 0
    let cut = samples.length - 1
    while (cut > 0 && bare < bodyW * 1.6) {
      bare += Math.hypot(
        samples[cut][0] - samples[cut - 1][0],
        samples[cut][1] - samples[cut - 1][1],
      )
      cut--
    }
    drawSerpent(
      () => {
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey)
      },
      () => {
        ctx.beginPath()
        samples.slice(0, cut + 1).forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
      },
    )
    // The eye, on the outer side of the head, a little back from the end.
    const heading = aEnd - Math.PI / 2
    ctx.beginPath()
    ctx.arc(
      ex - Math.cos(heading) * bodyW * 0.3 + Math.cos(aEnd) * bodyW * 0.22,
      ey - Math.sin(heading) * bodyW * 0.3 + Math.sin(aEnd) * bodyW * 0.22,
      bodyW * 0.11,
      0,
      Math.PI * 2,
    )
    ctx.fillStyle = PALETTE.white
    ctx.fill()
  }

  // The triangle lies over the whole dragon, body and necks alike.
  trianglePath(ctx, R, false)
  ctx.fillStyle = PALETTE.white
  ctx.fill('evenodd')

  // Each name sits in its point between the head and the tip.
  CORNERS.forEach(({ qlippah }, i) => {
    radialText(
      ctx,
      qlippah,
      cornerAngle(i),
      R * 0.86,
      `500 ${R * 0.05}px ${fonts.hebrew}`,
      PALETTE.white,
    )
  })
  // The three averse Supernals along the sides of the inverted triangle.
  radialText(
    ctx,
    SUPERNALS[0].qlippah,
    Math.PI,
    R * 0.42,
    `500 ${R * 0.05}px ${fonts.hebrew}`,
    PALETTE.white,
  )
  radialText(
    ctx,
    SUPERNALS[1].qlippah,
    Math.PI / 3,
    R * 0.4,
    `500 ${R * 0.045}px ${fonts.hebrew}`,
    PALETTE.white,
  )
  radialText(
    ctx,
    SUPERNALS[2].qlippah,
    -Math.PI / 3,
    R * 0.4,
    `500 ${R * 0.045}px ${fonts.hebrew}`,
    PALETTE.white,
  )

  // "The rescuing symbol of the Golden Cross united to the Red Rose of
  // Seven times Seven Petals": a gold Calvary cross, its head toward the
  // East, with the rose at its crossing, seven rings of seven red petals
  // round a centre, drawn like the ceiling's rose but without letters,
  // and green sepals showing between the outermost petals.
  // The Calvary cross of six squares, which the ritual names: one square
  // above the crossbar, three across it, two below. Its head is toward
  // the East (up the canvas); the rose sits on the centre square.
  const sq = R * 0.1
  // "Golden": a bright gold, distinct from the yellow of the Mercury wall.
  ctx.fillStyle = PALETTE.gold
  ctx.strokeStyle = PALETTE.goldShade
  ctx.lineWidth = 2
  // Drawn as one outline: upright of four squares (one above the centre,
  // the centre, two below) and the crossbar of three.
  // In the plan frame +x is East, so the single square of the head lies
  // at +x and the two of the foot at -x.
  ctx.beginPath()
  ctx.moveTo(-sq * 2.5, -sq / 2)
  ctx.lineTo(-sq / 2, -sq / 2)
  ctx.lineTo(-sq / 2, -sq * 1.5)
  ctx.lineTo(sq / 2, -sq * 1.5)
  ctx.lineTo(sq / 2, -sq / 2)
  ctx.lineTo(sq * 1.5, -sq / 2)
  ctx.lineTo(sq * 1.5, sq / 2)
  ctx.lineTo(sq / 2, sq / 2)
  ctx.lineTo(sq / 2, sq * 1.5)
  ctx.lineTo(-sq / 2, sq * 1.5)
  ctx.lineTo(-sq / 2, sq / 2)
  ctx.lineTo(-sq * 2.5, sq / 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  drawRose49(ctx, sq * 0.95)

  return texture(el)
}
