// The Golden Dawn Vault's Pastos: the tomb's head, foot, sides, lid,
// rim and inside.

import type { CanvasTexture } from 'three'
import { complement } from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { letterScale, PALETTE } from '@/lib/colors'
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
// violet, the letter painted in the complement of its ground, and the
// whole set between a white band at the head and a black band at the
// foot -- "the 22 colors of the paths of the letters, between light and
// darkness".
//
// Each side takes a different scale: "The right side is painted in the
// King's color scale", the left in the Queen's, and within, the Emperor's
// to the right and the Empress's to the left.
//
// The plate's Singles put Tzaddi first and Heh among the violets, which
// is Crowley's exchange of the two; here they follow the Golden Dawn's
// own attribution (Heh, Aries, scarlet; Tzaddi, Aquarius, violet). The
// plate also labels the last two Doubles Jupiter and Saturn in that
// order, against its own table of the planets' colours and against the
// colour of the cells themselves; the table is followed.
const SIDE_RANKS = [
  '\u05e9\u05d0\u05de',
  '\u05e4\u05e8\u05d1\u05d3\u05d2\u05ea\u05db',
  '\u05d4\u05d5\u05d6\u05d7\u05d8\u05d9\u05dc\u05e0\u05e1\u05e2\u05e6\u05e7',
]

// The four scales, in the order LETTER_SCALE_NAMES lists them.
export const SCALES = ['king', 'queen', 'emperor', 'empress'] as const
export type Scale = (typeof SCALES)[number]

// How wide the bands of light and darkness are, as a part of the side.
const BAND = 0.055

export function pastosSideTexture(
  length: number,
  height: number,
  fonts: Fonts,
  scale: Scale,
  // True when the head belongs at the right of the canvas.
  headRight: boolean,
): CanvasTexture {
  const { el, ctx } = canvas(length * PASTOS_SCALE, height * PASTOS_SCALE)
  const band = el.width * BAND
  ctx.fillStyle = '#0b0a0d'
  ctx.fillRect(0, 0, el.width, el.height)

  // Light at the head, darkness at the foot.
  ctx.save()
  if (!headRight) {
    ctx.translate(el.width, 0)
    ctx.scale(-1, 1)
  }
  ctx.fillStyle = PALETTE.black
  ctx.fillRect(0, 0, band, el.height)
  ctx.fillStyle = PALETTE.white
  ctx.fillRect(el.width - band, 0, band, el.height)

  const field = el.width - 2 * band
  const rowH = el.height / SIDE_RANKS.length
  const line = Math.max(1, el.height * 0.006)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const column = SCALES.indexOf(scale)
  SIDE_RANKS.forEach((rank, row) => {
    const letters = [...rank]
    const cellW = field / letters.length
    letters.forEach((hebrew, i) => {
      const color = letterScale(hebrew, column)
      // The ranks read from the foot to the head, as the plate has them,
      // so the reddest colour lies nearest the darkness.
      const x = band + i * cellW
      const y = row * rowH
      ctx.fillStyle = color
      ctx.fillRect(x + line / 2, y + line / 2, cellW - line, rowH - line)
      ctx.save()
      ctx.translate(x + cellW / 2, y + rowH / 2)
      if (!headRight) ctx.scale(-1, 1)
      ctx.fillStyle = complement(color)
      ctx.font = `500 ${rowH * 0.6}px ${fonts.hebrew}`
      ctx.fillText(hebrew, 0, 0)
      ctx.restore()
    })
  })
  ctx.restore()
  return texture(el)
}

// The lid. "On the lid are two images. At the head is 'The Higher and
// Divine Genus', and at the foot is 'Restoration'" -- the one the Ben
// Adam among the seven golden light-bearers, with the lightning
// descending into the mended vessels; the other the Justified One
// crucified on the Infernal Rivers of Daath. Both are painted upright
// along the coffin, their heads to the head. Until they load, a plain
// ground with the line between the halves and the rose of the head
// stands in their place.
export function pastosLidTexture(
  length: number,
  width: number,
  onReady: () => void = () => {},
): CanvasTexture {
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
  drawRose49(ctx, el.height * 0.16)
  ctx.restore()

  const t = texture(el)
  // Each painting fills its half of the lid, turned a quarter so that its
  // own top points east, to the head of the coffin, and scaled to cover.
  // The head is to the east and the door is in the west, so whoever comes
  // in stands at the foot and reads both paintings the right way up.
  const half = el.width / 2
  let left = 2
  const place = (image: HTMLImageElement, centre: number) => {
    ctx.save()
    // Neither painting may spill into the other's half.
    ctx.beginPath()
    ctx.rect(centre - half / 2, 0, half, el.height)
    ctx.clip()
    ctx.translate(centre, el.height / 2)
    ctx.rotate(Math.PI / 2)
    // The box is now `el.height` wide and `half` high in the turned frame.
    const k = Math.max(el.height / image.width, half / image.height)
    ctx.drawImage(
      image,
      (-image.width * k) / 2,
      (-image.height * k) / 2,
      image.width * k,
      image.height * k,
    )
    ctx.restore()
    if (--left === 0) {
      t.needsUpdate = true
      onReady()
    }
  }
  const load = (src: string, centre: number) => {
    const image = new Image()
    image.onload = () => place(image, centre)
    image.onerror = () => {
      if (--left === 0) onReady()
    }
    image.src = src
  }
  load('/vault/pastos-lid-foot.png', half / 2)
  load('/vault/pastos-lid-head.png', half + half / 2)
  return t
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
// hollow reads as a hollow. The long sides within carry the Emperor's and
// the Empress's scales; see pastosSideTexture.
export function pastosInsideTexture(): CanvasTexture {
  const { el, ctx } = canvas(4, 64)
  const grad = ctx.createLinearGradient(0, 0, 0, el.height)
  grad.addColorStop(0, '#2c2830')
  grad.addColorStop(1, '#060507')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, el.width, el.height)
  return texture(el)
}

// Within, at either end, a Tree of Life: "The head of the Pastos is
// painted white with a Tree of Life in the King color scale", and "The
// Pastos' foot is painted black with the Tree of Life in the Emperor
// color scale."
export function pastosTreeTexture(
  width: number,
  height: number,
  end: 'head' | 'foot',
  onReady: () => void = () => {},
): CanvasTexture {
  const { el, ctx } = canvas(width * PASTOS_SCALE, height * PASTOS_SCALE)
  ctx.fillStyle = end === 'head' ? PALETTE.white : '#07060a'
  ctx.fillRect(0, 0, el.width, el.height)
  const t = texture(el)
  const image = new Image()
  image.onload = () => {
    const k = Math.min(el.width / image.width, el.height / image.height)
    const w = image.width * k
    const h = image.height * k
    ctx.drawImage(image, (el.width - w) / 2, (el.height - h) / 2, w, h)
    t.needsUpdate = true
    onReady()
  }
  image.src = `/vault/pastos-tree-${end}.png`
  return t
}
