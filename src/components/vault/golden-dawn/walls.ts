// Painters for the surfaces of the Vault. Each draws one surface onto a
// canvas, which the scene wraps round a plane or the altar top.
//
// This file: the walls and the emblems painted on their squares.

import type { CanvasTexture } from 'three'
import {
  DOOR_INSCRIPTION,
  complement,
  paintWall,
  WALL_HEIGHT,
  WALL_WIDTH,
  type Emblem,
  type Wall,
} from '@/lib/vault'
import { canvas, texture } from '@/lib/canvasTexture'
import { drawGlyph, type Fonts } from '@/components/model/fonts'
import { WALL_SCALE } from '../paint'

// ---- Emblems -------------------------------------------------------------------

// Draws an emblem centred on (0, 0) in a box `size` across, in `ink`.
function drawEmblem(
  ctx: CanvasRenderingContext2D,
  emblem: Emblem,
  size: number,
  ink: string,
  fonts: Fonts,
) {
  ctx.save()
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = size * 0.07
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const h = size * 0.3

  if ('text' in emblem) {
    if (emblem.hebrew) {
      ctx.font = `500 ${size * 0.62}px ${fonts.hebrew}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(emblem.text, 0, size * 0.04)
    } else {
      drawGlyph(ctx, emblem.text, size * 0.62, fonts)
    }
    ctx.restore()
    return
  }

  const triangle = (up: boolean, bar: boolean) => {
    ctx.beginPath()
    ctx.moveTo(0, up ? -h : h)
    ctx.lineTo(h * 1.05, up ? h * 0.8 : -h * 0.8)
    ctx.lineTo(-h * 1.05, up ? h * 0.8 : -h * 0.8)
    ctx.closePath()
    ctx.stroke()
    if (bar) {
      ctx.beginPath()
      ctx.moveTo(-h * 0.85, up ? h * 0.25 : -h * 0.25)
      ctx.lineTo(h * 0.85, up ? h * 0.25 : -h * 0.25)
      ctx.stroke()
    }
  }
  const cross = (y: number, arm: number) => {
    ctx.beginPath()
    ctx.moveTo(0, y - arm)
    ctx.lineTo(0, y + arm)
    ctx.moveTo(-arm * 0.8, y)
    ctx.lineTo(arm * 0.8, y)
    ctx.stroke()
  }

  switch (emblem.draw) {
    case 'fire':
      triangle(true, false)
      break
    case 'water':
      triangle(false, false)
      break
    case 'air':
      triangle(true, true)
      break
    case 'sulphur':
      // A triangle over a cross.
      ctx.save()
      ctx.translate(0, -h * 0.5)
      ctx.scale(0.7, 0.7)
      triangle(true, false)
      ctx.restore()
      cross(h * 0.55, h * 0.5)
      break
    case 'mercury': {
      // Horns over a circle over a cross.
      ctx.beginPath()
      ctx.arc(0, -h * 0.15, h * 0.42, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -h * 0.95, h * 0.42, Math.PI * 0.15, Math.PI * 0.85)
      ctx.stroke()
      cross(h * 0.7, h * 0.42)
      break
    }
    case 'salt': {
      // A circle crossed by a bar.
      ctx.beginPath()
      ctx.arc(0, 0, h * 0.85, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-h * 0.85, 0)
      ctx.lineTo(h * 0.85, 0)
      ctx.stroke()
      break
    }
    case 'spirit': {
      // The eight-spoked wheel.
      ctx.beginPath()
      ctx.arc(0, 0, h * 0.95, 0, Math.PI * 2)
      ctx.stroke()
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4
        ctx.beginPath()
        ctx.moveTo(-Math.cos(a) * h * 0.95, -Math.sin(a) * h * 0.95)
        ctx.lineTo(Math.cos(a) * h * 0.95, Math.sin(a) * h * 0.95)
        ctx.stroke()
      }
      break
    }
    case 'eagle': {
      // An eagle's head in profile, facing left: crown, hooked beak, eye.
      ctx.beginPath()
      ctx.moveTo(h * 0.9, -h * 0.2)
      ctx.quadraticCurveTo(h * 0.6, -h * 1.0, -h * 0.2, -h * 0.75)
      ctx.quadraticCurveTo(-h * 0.8, -h * 0.6, -h * 1.0, -h * 0.1)
      ctx.quadraticCurveTo(-h * 1.0, h * 0.35, -h * 0.55, h * 0.3)
      ctx.lineTo(-h * 0.35, h * 0.05)
      ctx.quadraticCurveTo(h * 0.2, h * 0.55, h * 0.9, h * 0.75)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-h * 0.35, -h * 0.35, h * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }
  ctx.restore()
}

// ---- Walls ---------------------------------------------------------------------

// One wall: five squares across, eight down, in the wall's own colours.
// One wall: a field in the planet's own colour, with the forty squares
// inset from its edges and a little apart from each other, so the wall's
// colour shows as a border round and between them (as the walls are
// built). The Venus wall carries the Fama's inscription in its top
// margin: it is the door, hinged as a whole, and inside it is painted
// like any other wall.
export function wallTexture(wall: Wall, fonts: Fonts): CanvasTexture {
  const w = WALL_WIDTH * WALL_SCALE
  const h = WALL_HEIGHT * WALL_SCALE
  const { el, ctx } = canvas(w, h)
  const painted = paintWall(wall)

  ctx.fillStyle = wall.planet.color
  ctx.fillRect(0, 0, w, h)

  // Margins: the sides and bottom narrow, the top deeper, for the
  // inscription on the door and to match across the seven walls.
  const side = WALL_SCALE * 0.22
  const top = WALL_SCALE * 0.5
  const bottom = WALL_SCALE * 0.22
  const gap = WALL_SCALE * 0.07
  const cellW = (w - 2 * side - 4 * gap) / 5
  const cellH = (h - top - bottom - 7 * gap) / 8
  const cell = Math.min(cellW, cellH)

  painted.forEach((rank, r) => {
    rank.forEach(({ square, ground, ink }, c) => {
      const x = side + c * (cellW + gap) + (cellW - cell) / 2
      const y = top + r * (cellH + gap) + (cellH - cell) / 2
      ctx.fillStyle = ground
      ctx.fillRect(x, y, cell, cell)
      ctx.save()
      ctx.translate(x + cell / 2, y + cell / 2)
      drawEmblem(ctx, square.emblem, cell * 0.78, ink, fonts)
      ctx.restore()
    })
  })

  if (wall.door) {
    ctx.font = `600 ${top * 0.34}px ${fonts.caps}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = complement(wall.planet.color)
    ctx.fillText(DOOR_INSCRIPTION, w / 2, top / 2)
  }

  return texture(el)
}
