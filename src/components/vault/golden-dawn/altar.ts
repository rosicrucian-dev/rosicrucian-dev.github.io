// The Golden Dawn Vault's altar top.

import type { CanvasTexture } from 'three'
import { ALTAR } from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { PALETTE } from '@/lib/colors'
import { drawGlyph, type Fonts } from '@/components/model/fonts'

// ---- The altar --------------------------------------------------------------------

// The altar top: the dedication round the rim, "Yeheshua mihi omnia" in
// the next ring, the four Kerubim in circles with their sentences, and
// Shin in the midst.
export function altarTexture(fonts: Fonts): CanvasTexture {
  const size = 1024
  const { el, ctx } = canvas(size, size)
  const R = size / 2
  ctx.translate(R, R)

  // A heavy black edge, then the white rim in two tracks (outer from
  // 0.97R to 0.885R, inner from 0.885R to 0.8R), then the black field.
  const EDGE = 0.97
  const DIVIDE = 0.885
  const FIELD = 0.8
  ctx.beginPath()
  ctx.arc(0, 0, R, 0, Math.PI * 2)
  ctx.fillStyle = '#121014'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, R * EDGE, 0, Math.PI * 2)
  ctx.fillStyle = PALETTE.white
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, R * FIELD, 0, Math.PI * 2)
  ctx.fillStyle = '#121014'
  ctx.fill()

  // A word along a circle of radius `r`, centred at `angle` (0 at the
  // top, clockwise), its letters following the curve with their feet
  // toward the centre.
  const arcWord = (
    text: string,
    r: number,
    angle: number,
    font: string,
    color: string,
  ) => {
    ctx.save()
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const chars = [...text]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const total = widths.reduce((s, w) => s + w, 0)
    let a = angle - total / r / 2
    chars.forEach((c, i) => {
      a += widths[i] / r / 2
      ctx.save()
      ctx.rotate(a)
      ctx.translate(0, -r)
      ctx.fillText(c, 0, 0)
      ctx.restore()
      a += widths[i] / r / 2
    })
    ctx.restore()
  }
  // A sentence arched over the top of a small circle, filling `arc`.
  const ringText = (
    text: string,
    r: number,
    font: string,
    color: string,
    start: number,
    arc: number,
  ) => {
    ctx.save()
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const chars = [...text]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const inked = widths.reduce((s, w) => s + w, 0)
    const slack = Math.min(
      (arc * r - inked) / (chars.length - 1),
      inked / chars.length,
    )
    const span = inked + slack * (chars.length - 1)
    let a = start - span / r / 2
    chars.forEach((c, i) => {
      a += widths[i] / r / 2
      ctx.save()
      ctx.rotate(a)
      ctx.translate(0, -r)
      ctx.fillText(c, 0, 0)
      ctx.restore()
      a += widths[i] / r / 2 + slack / r
    })
    ctx.restore()
  }

  // Each word sits on the centre line of its track, its letters a little
  // over half the track's height, so there is room above and below.
  const DEG = Math.PI / 180
  const outerR = (R * (EDGE + DIVIDE)) / 2
  const innerR = (R * (DIVIDE + FIELD)) / 2
  const outerFont = `600 ${R * (EDGE - DIVIDE) * 0.58}px ${fonts.caps}`
  const innerFont = `600 ${R * (DIVIDE - FIELD) * 0.58}px ${fonts.caps}`
  for (const w of ALTAR.outer) {
    arcWord(w.text, outerR, w.angle * DEG, outerFont, '#121014')
  }
  // The thin line between the tracks.
  ctx.strokeStyle = '#121014'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, R * DIVIDE, 0, Math.PI * 2)
  ctx.stroke()
  for (const w of ALTAR.inner) {
    arcWord(w.text, innerR, w.angle * DEG, innerFont, '#121014')
  }

  // The four Kerubim, Lion at the top and on round clockwise: Ox, Man,
  // Eagle.
  ALTAR.kerubim.forEach((k, i) => {
    const a = (i * Math.PI) / 2 - Math.PI / 2
    const cx = Math.cos(a) * R * 0.46
    const cy = Math.sin(a) * R * 0.46
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.2, 0, Math.PI * 2)
    ctx.fillStyle = PALETTE.white
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.15, 0, Math.PI * 2)
    ctx.strokeStyle = '#121014'
    ctx.lineWidth = 3
    ctx.stroke()
    // Each sentence is arched over the top of its circle and reads left
    // to right from the door; the figure stands upright beneath it. The
    // texture is mounted with its top toward the East, which from the
    // door is "away", i.e. the top of the view, so the texture's own
    // up is the viewer's up.
    ctx.save()
    ctx.translate(cx, cy)
    ringText(
      k.text,
      R * 0.175,
      `600 ${R * 0.036}px ${fonts.caps}`,
      '#121014',
      0,
      Math.PI * 0.9,
    )
    ctx.fillStyle = '#121014'
    ctx.save()
    ctx.translate(0, R * 0.02)
    drawGlyph(ctx, k.glyph, R * 0.12, fonts)
    ctx.restore()
    ctx.font = `500 ${R * 0.05}px ${fonts.hebrew}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(k.letter, 0, -R * 0.105)
    ctx.restore()
  })

  ctx.font = `500 ${R * 0.22}px ${fonts.hebrew}`
  ctx.fillStyle = PALETTE.white
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ALTAR.centre, 0, R * 0.02)

  return texture(el)
}
