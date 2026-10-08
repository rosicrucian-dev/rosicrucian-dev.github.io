// Painters for the Pansophic design of the Vault: the tomb as the Fama
// describes it, read as Rafał Prinke reads it ("The Great Work in the
// Theatre of the World", in A Compendium on the Rosicrucian Vault, ed.
// Adam McLean, 1985): a memory theatre after Giulio Camillo's, each wall
// the Tree of Life of one of the seven Measures, the ceiling's triangles
// the seven superior Rulers round the Demiurge, the floor's the Inferior
// Governors. The altar is Abraham von Franckenberg's Tabula Universalis,
// which Prinke found and Samuel Robinson ("What Was the Original Design
// of the Rosicrucian Tomb?", Pansophers, 2017) traces back to Fludd.
//
// This is a draft. What is painted in the squares and the triangles is
// not known, so those spaces are drawn empty and named for what they
// hold.

import type { CanvasTexture } from 'three'
import {
  CIRCUMRADIUS,
  cornerAngle,
  DOOR_INSCRIPTION,
  SIDES,
  WALL_HEIGHT,
  WALL_WIDTH,
  type Wall,
} from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { PALETTE } from '@/lib/colors'
import { type Fonts } from '@/components/model/fonts'
import { WALL_SCALE, PLAN_SIZE, planSetup, heptagonPath } from '../paint'

// The Fama names no colours for the walls, ceiling or floor. These are
// plain neutrals, a light stone for the walls and ceiling and a darker one
// for the floor, so that nothing is claimed for them.
const STONE = '#ddd3bd'
const STONE_PANEL = '#e8e0cc'
const FLOOR_STONE = '#a99d86'
const INK = '#3a3128'
const FAINT = '#8c7f6a'
// The altar and the plate in the floor are "a plate of brass".
export const BRASS = '#c9a052'
const BRASS_SHADE = '#7a5a22'
const WOOD = '#6b4a2e'
const WOOD_SHADE = '#3d2a1a'

// ---- The walls -------------------------------------------------------------------

// The ten squares in Prinke's order, as the Tree of Life ("in the usual
// sequence from Kether above to Malkuth"), each named for its Sephirah:
// the middle
// column holds 1 over the top two rows and 6 over the next two; the left
// column 3, 5, 8, 10 and the right 2, 4, 7, 9, top to bottom.
const SQUARES: { n: number; col: number; row: number; rows: number }[] = [
  { n: 1, col: 1, row: 0, rows: 2 },
  { n: 6, col: 1, row: 2, rows: 2 },
  { n: 3, col: 0, row: 0, rows: 1 },
  { n: 5, col: 0, row: 1, rows: 1 },
  { n: 8, col: 0, row: 2, rows: 1 },
  { n: 10, col: 0, row: 3, rows: 1 },
  { n: 2, col: 2, row: 0, rows: 1 },
  { n: 4, col: 2, row: 1, rows: 1 },
  { n: 7, col: 2, row: 2, rows: 1 },
  { n: 9, col: 2, row: 3, rows: 1 },
]

// One wall: "parted into ten squares, every one with their several
// figures and sentences", and below them the chest "wherein there lay
// divers things, especially all our books". Prinke's sketch gives the
// order, not the sizes: here the squares take a little under two thirds
// of the wall and the chest the rest. The door carries the Fama's
// inscription in its top margin, as in the Golden Dawn design.
export function pansophicWallTexture(wall: Wall, fonts: Fonts): CanvasTexture {
  const w = WALL_WIDTH * WALL_SCALE
  const h = WALL_HEIGHT * WALL_SCALE
  const { el, ctx } = canvas(w, h)
  ctx.fillStyle = STONE
  ctx.fillRect(0, 0, w, h)

  const side = WALL_SCALE * 0.22
  const top = WALL_SCALE * 0.5
  const bottom = WALL_SCALE * 0.22
  const gap = WALL_SCALE * 0.07
  const gridH = WALL_SCALE * 4.6
  const cellW = (w - 2 * side - 2 * gap) / 3
  const cellH = (gridH - 3 * gap) / 4

  ctx.lineWidth = 3
  for (const { n, col, row, rows } of SQUARES) {
    const x = side + col * (cellW + gap)
    const y = top + row * (cellH + gap)
    const ch = rows * cellH + (rows - 1) * gap
    ctx.fillStyle = STONE_PANEL
    ctx.fillRect(x, y, cellW, ch)
    ctx.strokeStyle = FAINT
    ctx.strokeRect(x, y, cellW, ch)
    // Numbered as on Prinke's sketch; he reads the squares as the
    // Sephiroth, but the reading isn't settled enough to name them.
    ctx.fillStyle = FAINT
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.font = `500 ${WALL_SCALE * 0.13}px ${fonts.caps}`
    ctx.fillText(String(n), x + WALL_SCALE * 0.08, y + WALL_SCALE * 0.07)
  }

  // The chest's panel.
  const py = top + gridH + gap
  const ph = h - py - bottom
  ctx.fillStyle = STONE_PANEL
  ctx.fillRect(side, py, w - 2 * side, ph)
  ctx.strokeStyle = FAINT
  ctx.strokeRect(side, py, w - 2 * side, ph)
  drawChest(ctx, w / 2, py + ph * 0.56, (w - 2 * side) * 0.62, ph * 0.56)

  if (wall.door) {
    ctx.font = `600 ${top * 0.34}px ${fonts.caps}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = INK
    ctx.fillText(DOOR_INSCRIPTION, w / 2, top / 2)
  }
  return texture(el)
}

// A plain chest seen from the front, centred on (cx, cy): its body, a
// lid band, iron bands near the ends and a lock plate.
function drawChest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
) {
  const x = cx - cw / 2
  const y = cy - ch / 2
  const lid = ch * 0.26
  ctx.lineWidth = 4
  ctx.strokeStyle = WOOD_SHADE
  ctx.fillStyle = WOOD
  ctx.fillRect(x, y, cw, ch)
  ctx.strokeRect(x, y, cw, ch)
  ctx.beginPath()
  ctx.moveTo(x, y + lid)
  ctx.lineTo(x + cw, y + lid)
  ctx.stroke()
  // Iron bands near the ends.
  for (const bx of [x + cw * 0.12, x + cw * 0.88]) {
    ctx.fillStyle = WOOD_SHADE
    ctx.fillRect(bx - cw * 0.015, y, cw * 0.03, ch)
  }
  // The lock plate.
  ctx.fillStyle = BRASS
  ctx.strokeStyle = BRASS_SHADE
  const lw = cw * 0.09
  const lh = ch * 0.3
  ctx.fillRect(cx - lw / 2, y + lid - lh * 0.35, lw, lh)
  ctx.strokeRect(cx - lw / 2, y + lid - lh * 0.35, lw, lh)
  ctx.fillStyle = WOOD_SHADE
  ctx.beginPath()
  ctx.arc(cx, y + lid + lh * 0.1, lw * 0.14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(cx - lw * 0.05, y + lid + lh * 0.1, lw * 0.1, lh * 0.25)
}

// ---- Ceiling and floor -------------------------------------------------------------

// The seven triangles, one on each wall, meeting at the centre: the
// heptagon's outline and a line from each corner in to `inner`.
function trianglesPath(
  ctx: CanvasRenderingContext2D,
  R: number,
  inner: number,
) {
  heptagonPath(ctx, R)
  for (let i = 0; i < SIDES; i++) {
    const a = cornerAngle(i)
    ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R)
    ctx.lineTo(Math.cos(a) * inner, Math.sin(a) * inner)
  }
}

const PLAN_LINE = 7

// The ceiling, "divided according to the seven sides in the triangle",
// and lit by "another sun ... in the upper part in the centre of the
// ceiling".
export function pansophicCeilingTexture(): CanvasTexture {
  const { el, ctx } = canvas(PLAN_SIZE, PLAN_SIZE)
  ctx.fillStyle = STONE
  ctx.fillRect(0, 0, PLAN_SIZE, PLAN_SIZE)
  const ppf = planSetup(ctx)
  const R = CIRCUMRADIUS * ppf - PLAN_LINE
  const sun = ppf * 0.75

  ctx.strokeStyle = INK
  ctx.lineWidth = PLAN_LINE
  ctx.lineJoin = 'miter'
  // The lines run in under the sun, so the triangles meet at its centre.
  trianglesPath(ctx, R, 0)
  ctx.stroke()

  // The sun: a disc and its rays, straight and waved by turns.
  ctx.fillStyle = PALETTE.gold
  ctx.strokeStyle = PALETTE.goldShade
  ctx.lineWidth = 3
  const rays = 28
  ctx.beginPath()
  for (let i = 0; i < rays * 2; i++) {
    const a = (i * Math.PI) / rays
    const r = i % 2 ? sun * 1.05 : sun * (i % 4 ? 1.55 : 1.75)
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, sun, 0, Math.PI * 2)
  ctx.fillStyle = '#f6d36a'
  ctx.fill()
  ctx.stroke()
  return texture(el)
}

// The floor, divided as the ceiling, its seven triangles meeting under
// the altar. Under the altar is the grave, covered with "a strong plate
// of brass": "we removed the altar aside; there we lifted up a strong
// plate of brass, and found a fair and worthy body". The Fama gives it
// no shape; Prinke reads the whole vault as an alchemist's furnace, "the
// grave in the bottom part ... the alchemical retort or philosophical egg
// buried in the earth or sand, its neck extending into the main chamber
// above as the altar and hermetically sealed with the brass plate". So
// the plate is round, as wide as the altar, and seals a short neck that
// opens into a globe below. Feet.
export const GRAVE = {
  plateRadius: 1.5,
  neck: 0.7,
  globeRadius: 3,
}

export function pansophicFloorTexture(): CanvasTexture {
  const { el, ctx } = canvas(PLAN_SIZE, PLAN_SIZE)
  ctx.fillStyle = FLOOR_STONE
  ctx.fillRect(0, 0, PLAN_SIZE, PLAN_SIZE)
  const ppf = planSetup(ctx)
  const R = CIRCUMRADIUS * ppf - PLAN_LINE

  ctx.strokeStyle = INK
  ctx.lineWidth = PLAN_LINE
  ctx.lineJoin = 'miter'
  trianglesPath(ctx, R, 0)
  ctx.stroke()
  return texture(el)
}

// The plate over the grave: a brass disc with a raised rim and a ring
// to lift it by.
export function pansophicPlateTexture(): CanvasTexture {
  const size = 512
  const { el, ctx } = canvas(size, size)
  const r = size / 2
  ctx.translate(r, r)
  const shine = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
  shine.addColorStop(0, '#e2c27a')
  shine.addColorStop(1, BRASS)
  ctx.fillStyle = shine
  ctx.fillRect(-r, -r, size, size)
  ctx.strokeStyle = BRASS_SHADE
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(0, 0, r - 5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(r * 0.5, 0, r * 0.1, 0, Math.PI * 2)
  ctx.stroke()
  return texture(el)
}

// The grave's stone: grey, darkening from `top` to `bottom`, for the
// neck and the globe.
export function pansophicGraveTexture(
  top: string,
  bottom: string,
): CanvasTexture {
  const { el, ctx } = canvas(8, 128)
  const grad = ctx.createLinearGradient(0, 0, 0, el.height)
  grad.addColorStop(0, top)
  grad.addColorStop(1, bottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, el.width, el.height)
  return texture(el)
}

// ---- The altar ----------------------------------------------------------------------

// The altar top: Franckenberg's Tabula Universalis engraved on the brass,
// with "Jesus mihi omnia" lettered "about the circle of brim". The plate
// is a photograph of the engraving, cropped to its circle, cleaned and
// tinted as brass, and turned so that the figure of Christ in the middle
// (engraved at a slant) stands upright at the top of the canvas, which the
// scene turns to the East: he faces anyone entering by the door in the
// West. The plate as a whole sits 45° clockwise of how it was
// printed. (Its corner directions can't all be matched to the room
// anyway: they run mirrored.) It loads after the rim is
// drawn; `onReady` asks for a frame once it is in.
export function pansophicAltarTexture(
  fonts: Fonts,
  onReady: () => void,
): CanvasTexture {
  const size = 1200
  const { el, ctx } = canvas(size, size)
  const R = size / 2
  const FIELD = 0.86
  ctx.translate(R, R)
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fillStyle = BRASS_SHADE
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, R * 0.985, 0, Math.PI * 2)
  ctx.fillStyle = BRASS
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, R * FIELD, 0, Math.PI * 2)
  ctx.lineWidth = 4
  ctx.strokeStyle = BRASS_SHADE
  ctx.stroke()

  // The inscription spaced evenly round the whole rim, read clockwise
  // from the East with the feet of the letters toward the centre.
  const words = 'JESUS · MIHI · OMNIA · '
  const chars = [...words.repeat(2)]
  const r = R * (1 + FIELD) * 0.49
  ctx.font = `600 ${R * 0.085}px ${fonts.caps}`
  ctx.fillStyle = '#3d2a12'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  chars.forEach((c, i) => {
    ctx.save()
    ctx.rotate((i * 2 * Math.PI) / chars.length)
    ctx.translate(0, -r)
    ctx.fillText(c, 0, 0)
    ctx.restore()
  })

  const t = texture(el)
  const image = new Image()
  image.onload = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 0, R * FIELD - 3, 0, Math.PI * 2)
    ctx.clip()
    const d = R * FIELD * 2
    ctx.drawImage(image, -d / 2, -d / 2, d, d)
    ctx.restore()
    t.needsUpdate = true
    onReady()
  }
  image.src = '/vault/franckenberg-altar.jpg'
  return t
}
