// Painting the three diagrams. Which corner each hangs in, how wide its
// board is cut and why, is in lib/vault; this file only draws them.
//
// The 5=6 calls them part of the furniture of the Vault: the Minutum
// Mundum, "the Small Universe, or the Foundation of Color"; the Mountain
// of Abiegnus, "the symbolic Mountain of God in the center of the
// universe"; and the Sword and Serpent, "for in it are resumed all the
// mysteries of our Fraternity". The officers point to each in turn.

import type { CanvasTexture } from 'three'
import { canvas, texture } from '@/lib/canvasTexture'
import {
  DIAGRAM_MOUNT,
  POSTER_HEIGHT,
  boardWidth,
  type Diagram,
} from '@/lib/vault'

const DIAGRAM_SCALE = 300 // pixels per foot

const BOARD = '#0a090c'

// The board, with the plate mounted on it once it loads. The board is cut
// to the plate, so the plate fills it but for the mount: drawn to the
// margin on every side, never cropped.
export function diagramTexture(
  diagram: Diagram,
  onReady: () => void,
): CanvasTexture {
  const { el, ctx } = canvas(
    Math.round(boardWidth(diagram) * DIAGRAM_SCALE),
    Math.round(POSTER_HEIGHT * DIAGRAM_SCALE),
  )
  ctx.fillStyle = BOARD
  ctx.fillRect(0, 0, el.width, el.height)
  const t = texture(el)
  const image = new Image()
  image.onload = () => {
    ctx.fillStyle = BOARD
    ctx.fillRect(0, 0, el.width, el.height)
    const inset = DIAGRAM_MOUNT * DIAGRAM_SCALE
    ctx.drawImage(
      image,
      inset,
      inset,
      el.width - 2 * inset,
      el.height - 2 * inset,
    )
    t.needsUpdate = true
    onReady()
  }
  image.src = diagram.src
  return t
}
