// Paul Foster Case's wall: "parted into ten squares" after the Fama
// rather than into the Golden Dawn's forty. Case gives the geometry
// himself -- "dividing each wall by a vertical line through the center
// and crossing this with four equidistant horizontal lines" (The True and
// Invisible Rosicrucian Order, 4th ed., p. 126) -- so two across and five
// down. What the ten hold is in CASE_SQUARES and PLANET_LORE; this file
// only draws them.
//
// The squares are hung two across and five down on the wall's own
// planetary colour, each a pale panel like the "lamented posters" the
// papers describe, headed with its title.

import type { CanvasTexture } from 'three'
import {
  CASE_SQUARES,
  PLANET_LORE,
  SIGN_GLYPH,
  hebrewNumeral,
  magicLine,
  WALL_HEIGHT,
  WALL_WIDTH,
  type CaseSquareKind,
  type PlanetLore,
  type Wall,
} from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { inkOn } from '@/lib/colors'
import { drawGlyph, type Fonts } from '@/components/model/fonts'
import { WALL_SCALE } from '../paint'

const COLS = 2
const ROWS = 5

// The panel's paper, and the ink on it.
const PAPER = '#efe9da'
const INK = '#17161c'
const FAINT = '#8d8779'

// ---- One rule for every square ------------------------------------------------
//
// Each panel holds a mark and a gloss, and nothing else.
//
// The MARK is what was on the wall: a Hebrew name, a glyph, a seal, a
// Kamea. It is large, in ink, and sits in the middle of the panel.
//
// The GLOSS is the help: the mark said in Roman letters, small and faint,
// directly under it. It appears only when English is on, and it is the
// only thing English adds to the body of a square.
//
// So every square reads the same way down the panel -- title, mark,
// gloss -- and turning English off takes the glosses away without ever
// moving a mark or changing what a square means.

// The mark's height and the gloss's, as parts of the body's height.
const MARK = 0.46
const GLOSS = 0.15

// Sets `text` at `size`, shrinking it until it fits `w`, and breaking it
// at a space if shrinking alone will not do. Returns nothing; draws
// centred on (0, y).
function fitted(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  size: number,
  min: number,
  font: string,
  weight: number,
  y: number,
): void {
  let s = size
  const set = () => (ctx.font = `${weight} ${s}px ${font}`)
  set()
  while (s > min && ctx.measureText(text).width > w) {
    s *= 0.92
    set()
  }
  if (ctx.measureText(text).width <= w || !text.includes(' ')) {
    ctx.fillText(text, 0, y)
    return
  }
  const words = text.split(' ')
  const half = Math.ceil(words.length / 2)
  const rows = [words.slice(0, half).join(' '), words.slice(half).join(' ')]
  while (s > min * 0.7 && rows.some((r) => ctx.measureText(r).width > w)) {
    s *= 0.92
    set()
  }
  rows.forEach((row, i) => ctx.fillText(row, 0, y + (i - 0.5) * s * 1.12))
}

// A mark with its gloss under it, centred on (0, `y`) in a box `w` wide
// and `h` tall. `scale` shrinks the pair where a square holds two of
// them side by side.
function mark(
  ctx: CanvasRenderingContext2D,
  hebrew: string,
  roman: string,
  w: number,
  h: number,
  fonts: Fonts,
  english: boolean,
  y = 0,
  scale = 1,
): void {
  // Without a gloss the mark has the box to itself and sits in its
  // middle; with one it lifts to leave room underneath.
  const lift = english ? h * 0.11 * scale : 0
  ctx.fillStyle = INK
  fitted(
    ctx,
    hebrew,
    w * 0.94,
    h * MARK * scale,
    h * 0.16 * scale,
    fonts.hebrew,
    500,
    y - lift,
  )
  if (!english) return
  ctx.fillStyle = FAINT
  fitted(
    ctx,
    roman.toUpperCase(),
    w * 0.94,
    h * GLOSS * scale,
    h * 0.075 * scale,
    fonts.caps,
    600,
    y + h * 0.2 * scale,
  )
}

// A gloss with no Hebrew above it: for the squares whose mark is a
// figure rather than a name.
function gloss(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  h: number,
  fonts: Fonts,
  y: number,
): void {
  ctx.fillStyle = FAINT
  fitted(
    ctx,
    text.toUpperCase(),
    w * 0.94,
    h * GLOSS,
    h * 0.075,
    fonts.caps,
    600,
    y,
  )
}

// Draws the body of one square, in a box `w` by `h` with (0, 0) at its
// middle.
function drawBody(
  ctx: CanvasRenderingContext2D,
  kind: CaseSquareKind,
  lore: PlanetLore,
  wall: Wall,
  w: number,
  h: number,
  fonts: Fonts,
  english: boolean,
): void {
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  switch (kind) {
    case 'divineName':
      mark(ctx, lore.divineNameHebrew, lore.divineName, w, h, fonts, english)
      return
    case 'archangel':
      mark(ctx, lore.archangelHebrew, lore.archangel, w, h, fonts, english)
      return
    case 'angels':
      mark(ctx, lore.choirHebrew, lore.choir, w, h, fonts, english)
      return
    case 'palace':
      mark(ctx, lore.palaceHebrew, lore.palace, w, h, fonts, english)
      return

    case 'glyph': {
      // The mark is the planet's own sign, so it takes the place the
      // Hebrew takes elsewhere.
      ctx.save()
      ctx.translate(0, english ? -h * 0.1 : 0)
      drawGlyph(ctx, wall.planet.glyph, h * (english ? 0.66 : 0.78), fonts)
      ctx.restore()
      if (english) gloss(ctx, wall.planet.name, w, h, fonts, h * 0.3)
      return
    }

    case 'letterSephirah': {
      // Two marks side by side, each with its own gloss: the letter on
      // the left, the Sephirah its path leads to on the right. The
      // letter is a single character and the Sephirah a word, so the
      // Sephirah gets the wider half and the smaller size.
      ctx.save()
      ctx.translate(-w * 0.27, 0)
      mark(ctx, lore.letter, lore.letterName, w * 0.4, h, fonts, english)
      ctx.restore()
      ctx.save()
      ctx.translate(w * 0.2, 0)
      mark(
        ctx,
        lore.sephirahHebrew,
        lore.sephirah,
        w * 0.52,
        h,
        fonts,
        english,
        0,
        0.84,
      )
      ctx.restore()
      return
    }

    case 'kamea': {
      const n = lore.kamea.length
      const side = Math.min(w, h * (english ? 0.84 : 1)) * 0.94
      const cell = side / n
      ctx.save()
      ctx.translate(-side / 2, -side / 2 - (english ? h * 0.08 : 0))
      ctx.strokeStyle = FAINT
      ctx.lineWidth = Math.max(0.6, side * 0.004)
      ctx.font = english
        ? `500 ${cell * 0.56}px ${fonts.caps}`
        : `500 ${cell * 0.62}px ${fonts.hebrew}`
      ctx.fillStyle = INK
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          ctx.strokeRect(c * cell, r * cell, cell, cell)
          const value = lore.kamea[r][c]
          ctx.fillText(
            english ? String(value) : hebrewNumeral(value),
            (c + 0.5) * cell,
            (r + 0.54) * cell,
          )
        }
      }
      ctx.restore()
      // Its gloss is the number every line of it comes to, which is the
      // whole point of the square.
      if (english) {
        const sum = (n * (n * n + 1)) / 2
        gloss(ctx, `every line ${sum}`, w, h, fonts, h * 0.4)
      }
      return
    }

    case 'seal': {
      // The Magic Line: join the cells holding 1, 2, 3 ... in order.
      const line = magicLine(lore.kamea)
      const n = lore.kamea.length
      const side = Math.min(w, h * (english ? 0.84 : 1)) * 0.94
      const cell = side / n
      ctx.save()
      ctx.translate(-side / 2, -side / 2 - (english ? h * 0.08 : 0))
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = Math.max(0.5, side * 0.003)
      for (let i = 0; i <= n; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cell, 0)
        ctx.lineTo(i * cell, side)
        ctx.moveTo(0, i * cell)
        ctx.lineTo(side, i * cell)
        ctx.stroke()
      }
      ctx.strokeStyle = INK
      ctx.lineWidth = Math.max(1, side * 0.012)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()
      line.forEach(([c, r], i) => {
        const x = (c + 0.5) * cell
        const y = (r + 0.5) * cell
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.fillStyle = INK
      for (const [c, r] of [line[0], line[line.length - 1]]) {
        ctx.beginPath()
        ctx.arc((c + 0.5) * cell, (r + 0.5) * cell, cell * 0.16, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      if (english) gloss(ctx, 'the magic line', w, h, fonts, h * 0.4)
      return
    }

    case 'zodiac': {
      // Three things in one square, where every other square holds one.
      // The panel is twice as wide as it is tall, so they do not stack:
      // the signs the planet is exalted in and the signs it rules sit
      // side by side across the top, each group with its own gloss under
      // it, and the Church takes the full width below them -- a town in
      // Asia Minor with neither Hebrew nor glyph, so its name is its mark
      // and it keeps it either way, and a name as long as Philadelphia
      // needs the whole width to be set at a readable size.
      //
      // The bands are measured out from the top rather than placed by
      // eye, so that nothing is squeezed against what is under it.
      const GLYPH = h * (english ? 0.3 : 0.36)
      const LEAD = h * 0.03 // a group of signs to its own gloss
      const CHURCH = h * 0.2
      const GAP = h * 0.12 // the signs to the Church
      const band = english ? GLYPH + LEAD + h * GLOSS : GLYPH
      const top = -(band + GAP + CHURCH) / 2

      const signs = (names: string[], x: number, label: string) => {
        if (names.length === 0) return
        names.forEach((name, j) => {
          ctx.save()
          ctx.translate(
            x + (j - (names.length - 1) / 2) * GLYPH * 1.15,
            top + GLYPH / 2,
          )
          ctx.fillStyle = INK
          drawGlyph(ctx, SIGN_GLYPH[name], GLYPH, fonts)
          ctx.restore()
        })
        if (!english) return
        ctx.save()
        ctx.translate(x, 0)
        gloss(
          ctx,
          label,
          w * 0.6,
          h,
          fonts,
          top + GLYPH + LEAD + (h * GLOSS) / 2,
        )
        ctx.restore()
      }
      signs(lore.exalted, -w * 0.25, 'exalted in')
      signs(lore.rules, w * 0.25, 'rules')

      ctx.fillStyle = INK
      fitted(
        ctx,
        lore.church.toUpperCase(),
        w * 0.94,
        CHURCH,
        h * 0.1,
        fonts.caps,
        600,
        top + band + GAP + CHURCH / 2,
      )
      return
    }

    case 'intelligence': {
      // Two names in one square, so each takes half of it. The gloss
      // names the office as well as the angel, since the title over the
      // panel cannot say which of the two is which.
      const roles: [string, string, string][] = [
        [
          'Intelligence',
          lore.intelligence ?? '',
          lore.intelligenceHebrew ?? '',
        ],
        ['Spirit', lore.spirit ?? '', lore.spiritHebrew ?? ''],
      ]
      roles.forEach(([role, name, heb], i) => {
        if (!heb) return
        mark(
          ctx,
          heb,
          `${role} · ${name}`,
          w,
          h,
          fonts,
          english,
          (i - 0.5) * h * 0.52,
          0.62,
        )
      })
      return
    }
  }
}

export function caseWallTexture(
  wall: Wall,
  fonts: Fonts,
  english: boolean,
): CanvasTexture {
  const w = WALL_WIDTH * WALL_SCALE
  const h = WALL_HEIGHT * WALL_SCALE
  const { el, ctx } = canvas(w, h)
  const lore = PLANET_LORE[wall.planet.id]

  ctx.fillStyle = wall.planet.color
  ctx.fillRect(0, 0, w, h)

  // The same margins as the forty-square wall, so the two designs sit the
  // same way in the room.
  const side = WALL_SCALE * 0.22
  const top = WALL_SCALE * 0.5
  const bottom = WALL_SCALE * 0.22
  const gap = WALL_SCALE * 0.09
  const cellW = (w - 2 * side - (COLS - 1) * gap) / COLS
  const cellH = (h - top - bottom - (ROWS - 1) * gap) / ROWS

  CASE_SQUARES.forEach((square, i) => {
    const c = i % COLS
    const r = Math.floor(i / COLS)
    const x = side + c * (cellW + gap)
    const y = top + r * (cellH + gap)

    ctx.fillStyle = PAPER
    ctx.fillRect(x, y, cellW, cellH)
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = Math.max(1, WALL_SCALE * 0.008)
    ctx.strokeRect(x, y, cellW, cellH)

    // The title across the head of the panel, where there is English to
    // put there. Without it the panel is given over to its figure.
    const head = english ? cellH * 0.22 : 0
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cellW, cellH)
    ctx.clip()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (english) {
      ctx.fillStyle = FAINT
      // Measured in the capitals it is set in: capitals are wider than
      // the mixed case the titles are written in, so measuring the one
      // and drawing the other shrinks a long title too little and the
      // clip above cuts its ends off.
      const title = square.title.toUpperCase()
      let size = head * 0.46
      ctx.font = `600 ${size}px ${fonts.caps}`
      while (size > head * 0.2 && ctx.measureText(title).width > cellW * 0.88) {
        size *= 0.92
        ctx.font = `600 ${size}px ${fonts.caps}`
      }
      ctx.fillText(title, x + cellW / 2, y + head * 0.55)
      ctx.beginPath()
      ctx.moveTo(x + cellW * 0.1, y + head)
      ctx.lineTo(x + cellW * 0.9, y + head)
      ctx.strokeStyle = FAINT
      ctx.lineWidth = Math.max(0.6, WALL_SCALE * 0.004)
      ctx.stroke()
    }

    // The body, under the title.
    const bodyH = cellH - head
    ctx.save()
    ctx.translate(x + cellW / 2, y + head + bodyH / 2)
    drawBody(
      ctx,
      square.kind,
      lore,
      wall,
      cellW * 0.86,
      bodyH * 0.8,
      fonts,
      english,
    )
    ctx.restore()
    ctx.restore()
  })

  // The wall's planet named along the foot, in the complement of its
  // colour, so a visitor can tell the seven apart. The planet has its own
  // square and its own colour, so a wall with no English on it does not
  // need naming.
  if (english) {
    ctx.fillStyle = inkOn(wall.planet.color)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `600 ${bottom * 0.5}px ${fonts.caps}`
    ctx.globalAlpha = 0.75
    ctx.fillText(wall.planet.name.toUpperCase(), w / 2, h - bottom / 2)
    ctx.globalAlpha = 1
  }

  return texture(el)
}
