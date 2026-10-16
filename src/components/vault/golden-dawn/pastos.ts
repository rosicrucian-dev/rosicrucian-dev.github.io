// The Golden Dawn Vault's Pastos: the tomb's head, foot, sides, lid,
// rim and inside.

import type { CanvasTexture } from 'three'
import { complement } from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { LETTER_COLORS, PALETTE } from '@/lib/colors'
import { type Fonts } from '@/components/model/fonts'
import { drawRose49 } from './plan'

// ---- The Pastos ------------------------------------------------------------

const PASTOS_SCALE = 300 // pixels per foot

// The head of the Pastos: "white, charged with a golden Greek Cross and
// Red Rose of 49 Petals." Drawn after the plate: the rose nearly fills
// the cross, and four long points stand out between its arms. The ritual
// says nothing of the points; the plate hatches them in lines, not the
// dots of gold, and they are taken here as the rose's green sepals, as on
// the floor.
export function pastosHeadTexture(
  width: number,
  height: number,
): CanvasTexture {
  const { el, ctx } = canvas(width * PASTOS_SCALE, height * PASTOS_SCALE)
  ctx.fillStyle = PALETTE.white
  ctx.fillRect(0, 0, el.width, el.height)
  ctx.translate(el.width / 2, el.height / 2)
  const arm = el.height * 0.45 // centre to the end of an arm
  const bar = arm * 0.65
  const gold = PALETTE.gold
  const goldLine = PALETTE.goldShade
  ctx.lineWidth = 2
  ctx.strokeStyle = PALETTE.leafShade
  // The sepals, from under the rose out past the arms' corners.
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.rotate(Math.PI / 4 + (i * Math.PI) / 2)
    ctx.beginPath()
    ctx.moveTo(arm * 0.6, -arm * 0.13)
    ctx.lineTo(arm * 1.18, 0)
    ctx.lineTo(arm * 0.6, arm * 0.13)
    ctx.closePath()
    ctx.fillStyle = PALETTE.leaf
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.strokeStyle = goldLine
  ctx.beginPath()
  ctx.moveTo(-arm, -bar / 2)
  ctx.lineTo(-bar / 2, -bar / 2)
  ctx.lineTo(-bar / 2, -arm)
  ctx.lineTo(bar / 2, -arm)
  ctx.lineTo(bar / 2, -bar / 2)
  ctx.lineTo(arm, -bar / 2)
  ctx.lineTo(arm, bar / 2)
  ctx.lineTo(bar / 2, bar / 2)
  ctx.lineTo(bar / 2, arm)
  ctx.lineTo(-bar / 2, arm)
  ctx.lineTo(-bar / 2, bar / 2)
  ctx.lineTo(-arm, bar / 2)
  ctx.closePath()
  ctx.fillStyle = gold
  ctx.fill()
  ctx.stroke()
  drawRose49(ctx, arm * 0.77, false)
  return texture(el)
}

// The foot: "black with a white Calvary Cross and Circle placed upon a
// pedestal of Two steps." Proportions from the plate, in a frame 0.737
// wide to 1 high: a broad cross with its arms high, the circle round the
// crossing, and two steps on a base.
export function pastosFootTexture(
  width: number,
  height: number,
): CanvasTexture {
  const { el, ctx } = canvas(width * PASTOS_SCALE, height * PASTOS_SCALE)
  ctx.fillStyle = PALETTE.black
  ctx.fillRect(0, 0, el.width, el.height)
  const h = el.height * 0.92
  const w = h * 0.737
  ctx.translate((el.width - w) / 2, (el.height - h) / 2)
  const rect = (x0: number, y0: number, x1: number, y1: number) =>
    ctx.fillRect(x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h)
  ctx.fillStyle = PALETTE.white
  rect(0.4, 0.04, 0.59, 0.77) // upright
  rect(0.17, 0.26, 0.8, 0.39) // arms
  rect(0.25, 0.76, 0.73, 0.84) // upper step
  rect(0.17, 0.83, 0.83, 0.92) // lower step
  rect(0.08, 0.91, 0.93, 1) // base
  ctx.strokeStyle = PALETTE.white
  ctx.lineWidth = w * 0.045
  ctx.beginPath()
  ctx.arc(0.49 * w, 0.325 * h, 0.27 * w, 0, Math.PI * 2)
  ctx.stroke()
  return texture(el)
}

// The long sides: the 22 letters on the colours of their paths, in three
// ranks after the plate: the three Mothers, the seven Doubles, and the
// twelve Singles, each rank in the order of its colours from red to
// violet, the letter painted in the complement of its ground. The plate's
// Singles put Tzaddi first and Heh among the violets, which is Crowley's
// exchange of the two; here they follow the Golden Dawn's own
// attribution (Heh, Aries, scarlet; Tzaddi, Aquarius, violet). Read left
// to right from outside the coffin on either side.
const SIDE_RANKS = ['שאמ', 'פרבדגתכ', 'הוזחטילנסעצק']

export function pastosSideTexture(
  length: number,
  height: number,
  fonts: Fonts,
): CanvasTexture {
  const { el, ctx } = canvas(length * PASTOS_SCALE, height * PASTOS_SCALE)
  ctx.fillStyle = '#0b0a0d'
  ctx.fillRect(0, 0, el.width, el.height)
  const rowH = el.height / SIDE_RANKS.length
  const line = Math.max(1, el.height * 0.006)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  SIDE_RANKS.forEach((rank, row) => {
    const letters = [...rank]
    const cellW = el.width / letters.length
    letters.forEach((hebrew, i) => {
      const color = PALETTE[LETTER_COLORS[hebrew]]
      const x = i * cellW
      const y = row * rowH
      ctx.fillStyle = color
      ctx.fillRect(x + line / 2, y + line / 2, cellW - line, rowH - line)
      ctx.fillStyle = complement(color)
      ctx.font = `500 ${rowH * 0.6}px ${fonts.hebrew}`
      ctx.fillText(hebrew, x + cellW / 2, y + rowH / 2)
    })
  })
  return texture(el)
}

// The lid. Its lower half bears "the Image of the Justified One,
// crucified on the Infernal Rivers of DAATH", its upper half "One like
// unto the Ben Adam" among seven golden light-bearers. Those are not drawn
// yet, so the lid carries a plain ground with the line between the halves
// and the rose of the head, as a placeholder.
export function pastosLidTexture(length: number, width: number): CanvasTexture {
  const { el, ctx } = canvas(length * PASTOS_SCALE, width * PASTOS_SCALE)
  ctx.fillStyle = '#1a1716'
  ctx.fillRect(0, 0, el.width, el.height)
  ctx.strokeStyle = PALETTE.gold
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, el.width - 24, el.height - 24)
  ctx.beginPath()
  ctx.moveTo(el.width / 2, 12)
  ctx.lineTo(el.width / 2, el.height - 12)
  ctx.stroke()
  // The head is at the right of the canvas.
  ctx.save()
  ctx.translate(el.width * 0.75, el.height / 2)
  const r = el.height * 0.16
  drawRose49(ctx, r)
  ctx.restore()
  return texture(el)
}

// The top of the open Pastos: the edges of its boards round a clear
// opening. `wall` is the boards' thickness, feet.
export function pastosRimTexture(
  length: number,
  width: number,
  wall: number,
): CanvasTexture {
  const { el, ctx } = canvas(length * PASTOS_SCALE, width * PASTOS_SCALE)
  const w = wall * PASTOS_SCALE
  ctx.fillStyle = '#5a5048'
  ctx.fillRect(0, 0, el.width, el.height)
  ctx.clearRect(w, w, el.width - 2 * w, el.height - 2 * w)
  return texture(el)
}

// The inner walls of the Pastos, darkening towards its floor so that the
// hollow reads as a hollow.
export function pastosInsideTexture(): CanvasTexture {
  const { el, ctx } = canvas(4, 64)
  const grad = ctx.createLinearGradient(0, 0, 0, el.height)
  grad.addColorStop(0, '#2c2830')
  grad.addColorStop(1, '#060507')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, el.width, el.height)
  return texture(el)
}
