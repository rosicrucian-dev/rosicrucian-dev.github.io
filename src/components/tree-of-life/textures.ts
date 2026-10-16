// The painted surfaces of the walkable Tree: the inside of each Sephirah's
// sphere, the streaming light of a tunnel, and the letter over a doorway.

import { RepeatWrapping, type CanvasTexture } from 'three'

import { drawGlyph, type Fonts } from '@/components/model/fonts'
import { BOTA_POSTER_PALETTE } from '@/lib/colors'
import { canvas, texture } from '@/lib/canvasTexture'
import {
  doorAngle,
  doorElevation,
  MALKUTH_CROSS,
  SPHERE_RADIUS,
  TUBE_RADIUS,
  tubesFrom,
  type Sphere,
} from '@/lib/treeOfLife'
import { SEPHIRAH_BY_ID } from '@/lib/tree'

// The angular radius of a doorway, seen from the centre of a room.
export const DOOR_ANGLE = Math.asin(TUBE_RADIUS / SPHERE_RADIUS)

// Where on a sphere's texture (0 to 1 across) a direction on the floor
// falls: three.js wraps a sphere's u round from -X through +Z, so a
// heading `a` (radians from straight ahead, towards Kether, positive to
// the right) lies at u = (3π/2 − a) / 2π.
function uOf(a: number): number {
  const u = ((1.5 * Math.PI - a) / (2 * Math.PI)) % 1
  return u < 0 ? u + 1 : u
}

// Mixes a hex colour towards white (t > 0) or black (t < 0).
function shade(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16)
  const target = t > 0 ? 255 : 0
  const k = Math.abs(t)
  const mix = (c: number) => Math.round(c + (target - c) * k)
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
}

// The inside of a room: its colour, a little brighter overhead and deeper
// below so the sphere reads as a space rather than a flat field, with a hole cut
// where each tunnel leaves and a ring of the tunnel's colour round it.
// Malkuth is painted in its four quarters.
export function sphereTexture(
  room: Sphere,
  // Seen from outside the doorways' glows would show through the sphere
  // as a lopsided brightness, so the outside is painted without them.
  // Without `doors`, no doorways are cut at all: on the Tree laid on the
  // body they would stand where the paths leave on the drawn Tree, and
  // twice too wide on its larger spheres; from outside the paths run on
  // into the spheres regardless.
  { glows = true, doors = true }: { glows?: boolean; doors?: boolean } = {},
): CanvasTexture {
  const W = 2048
  const H = 1024
  const { el, ctx } = canvas(W, H)

  const band = (color: string, u0: number, u1: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    // Just enough shading to read as a space, keeping the colour itself
    // vivid: the colours are the point. Seen from outside the sphere is
    // shaded by its light instead, and painted flat: its top, which the
    // view from above looks straight at, would otherwise be washed pale.
    const lift = glows ? 0.18 : 0
    const sink = glows ? -0.2 : 0
    grad.addColorStop(0, shade(color, lift))
    grad.addColorStop(0.5, color)
    grad.addColorStop(1, shade(color, sink))
    ctx.fillStyle = grad
    ctx.fillRect(u0 * W, 0, (u1 - u0) * W + 1, H)
  }
  if (room.id === 'malkuth') {
    // Each quarter painted between its angles, across the seam at u = 0.
    for (const q of MALKUTH_CROSS) {
      const steps = 64
      for (let i = 0; i < steps; i++) {
        const a0 = q.from + ((q.to - q.from) * i) / steps
        const a1 = q.from + ((q.to - q.from) * (i + 1)) / steps
        const u0 = uOf(a1)
        const u1 = uOf(a0)
        // A strip that crosses the seam at u = 0 is painted in two parts.
        if (u1 > u0) band(q.color, u0, u1)
        else {
          band(q.color, u0, 1)
          band(q.color, 0, u1)
        }
      }
    }
  } else {
    band(room.color, 0, 1)
  }

  // The doorways: a soft ring of the tunnel's colour, then the hole.
  const rx = (DOOR_ANGLE / (2 * Math.PI)) * W
  const ry = (DOOR_ANGLE / Math.PI) * H
  for (const tunnel of doors ? tubesFrom(room.id) : []) {
    const u = uOf(doorAngle(room.id, tunnel))
    // A doorway up or down a sloping path sits that far above or below the
    // sphere's equator (canvas top is the sphere's top).
    const v = 0.5 - doorElevation(room.id, tunnel) / Math.PI
    const color = tunnel.color
    for (const x of [u * W, u * W - W, u * W + W]) {
      ctx.save()
      ctx.translate(x, v * H)
      ctx.scale(1, ry / rx)
      if (glows) {
        const glow = ctx.createRadialGradient(0, 0, rx * 0.9, 0, 0, rx * 1.6)
        glow.addColorStop(0, color)
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, 0, rx * 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(0, 0, rx, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
  return texture(el)
}

// A tunnel's inside, painted as BOTA paints its paths: two strands of
// light wound round each other in a spiral along the tunnel's length. The
// texture wraps round the tube (u) and along it (v); a strand is a
// diagonal across the tile, so tiled it winds as a helix, and sliding the
// texture along the tunnel makes the strands turn and advance. The ground
// is the path's own colour at full strength, solid, so the colour stays
// as vivid and clear as Case asks it to be visualised.
export function tubeTexture(color: string): CanvasTexture {
  const W = 256
  const H = 256
  const { el, ctx } = canvas(W, H)
  // Each strand painted as one smooth band of light, brightest along its
  // middle and fading softly to either edge, so it shimmers like BOTA's
  // airbrushed spiral rather than reading as stripes laid side by side.
  // A strand climbs one tile's height across its width; the distance to
  // the nearer strand is measured with the tile's wrap, so the bands run
  // on unbroken across its edges.
  const n = parseInt(color.slice(1), 16)
  const base = [n >> 16, (n >> 8) & 255, n & 255]
  const image = ctx.createImageData(W, H)
  const strands = [0, H / 2]
  const width = H * 0.09 // the band's half-width, across the strand
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let near = Infinity
      for (const y0 of strands) {
        const d = (((y - x - y0) % H) + H) % H
        near = Math.min(near, Math.min(d, H - d) / Math.SQRT2)
      }
      // A glow across the band, and a brighter core along its middle.
      const k = near / width
      const glow = Math.exp(-k * k * 1.8) * 0.32
      const core = Math.exp(-k * k * 7) * 0.22
      const lift = Math.min(1, glow + core)
      const o = (y * W + x) * 4
      // Lifted towards a pale tint of the path's own colour rather than
      // pure white, so the spiral carries the colour with it.
      for (let c = 0; c < 3; c++) {
        const tint = base[c] + (255 - base[c]) * 0.72
        image.data[o + c] = Math.round(base[c] + (tint - base[c]) * lift * 1.3)
      }
      image.data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)

  const t = texture(el)
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  return t
}

// A Hebrew letter in white, edged in its path's colour, on a clear ground.
export function letterTexture(
  hebrew: string,
  color: string,
  fonts: Fonts,
): CanvasTexture {
  const size = 256
  const { el, ctx } = canvas(size, size)
  ctx.font = `600 ${size * 0.72}px ${fonts.hebrew}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = size * 0.07
  ctx.strokeStyle = shade(color, -0.35)
  ctx.strokeText(hebrew, size / 2, size * 0.54)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(hebrew, size / 2, size * 0.54)
  return texture(el)
}

// ---- Labels painted on the spheres -----------------------------------------------

// The span, in radians either way from its middle, of the patch of a
// sphere a label is painted on.
export const LABEL_SPAN = 1.0

// Each sphere's symbol, as BOTA paints it under the number: the planets of
// the seven, Saturn for Binah; the zodiac wheel for Chokmah, the first
// swirlings for Kether, and the four elements for Malkuth.
const SYMBOLS: Record<string, string> = {
  binah: '♄',
  chesed: '♃',
  geburah: '♂',
  tiphareth: '☉',
  netzach: '♀',
  hod: '☿',
  yesod: '☽',
}

// The ink: the sphere's complement on BOTA's colour wheel, the colour
// straight across from it (red and green, orange and blue, yellow and
// violet), so the lettering stands out vividly from its ground, as on
// BOTA's painting: orange on blue Mercy, blue on orange Splendour, red on
// green Victory, violet on yellow Beauty, green on red Severity and yellow
// on violet Foundation. The spheres without a hue take plain dark or
// light ink.
const COMPLEMENTS: Partial<Record<string, string>> = {
  geburah: BOTA_POSTER_PALETTE.green,
  chesed: BOTA_POSTER_PALETTE.orange,
  tiphareth: BOTA_POSTER_PALETTE.violet,
  netzach: BOTA_POSTER_PALETTE.red,
  hod: BOTA_POSTER_PALETTE.blue,
  yesod: '#ffe24a',
}

// How each complement is set against its sphere, lighter or darker, so it
// both pops and reads: dark green on red, deep violet on yellow; the rest
// as they are, or a touch brighter where the ground is dark.
const INK_SHADE: Partial<Record<string, number>> = {
  geburah: -0.45,
  tiphareth: -0.15,
  netzach: 0.05,
  hod: -0.1,
  chesed: 0.12,
}

function inkFor(room: Sphere): string {
  switch (room.id) {
    case 'kether':
    case 'chokmah':
      return '#1b1a20'
    case 'binah':
    case 'malkuth':
      return '#f4f1e8'
  }
  const ink = COMPLEMENTS[room.id] ?? '#1b1a20'
  return shade(ink, INK_SHADE[room.id] ?? 0)
}

// A sphere's label after BOTA's lettering: its name in Hebrew, its meaning
// in English, and its symbol. Painted on a square canvas whose
// sides span LABEL_SPAN either way round the sphere; the scene wraps it
// onto the sphere, so it curves with it like writing on a ball.
export function labelTexture(room: Sphere, fonts: Fonts): CanvasTexture {
  const S = 1024
  const { el, ctx } = canvas(S, S)
  const sephirah = SEPHIRAH_BY_ID[room.id]
  const ink = inkFor(room)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const c = S / 2

  // Three rows, each as large as sits comfortably within the ball, the
  // English name in the middle (the number is left off, for room): the
  // canvas reaches a radian round the sphere either way from the middle,
  // and the rows fill nearly all of it: they reach to about four fifths
  // of the way to the sphere's visible edge.
  // Malkuth's rows sit a little lower, to leave room above for the
  // triangle of Air, as BOTA letters the Kingdom.
  const kingdom = room.id === 'malkuth'
  const drop = kingdom ? S * 0.06 : 0
  ctx.font = `600 ${S * 0.2}px ${fonts.hebrew}`
  ctx.fillText(sephirah.hebrew, c, S * 0.255 + drop)

  // The English name, as large as fits.
  const word = sephirah.meaning.toUpperCase()
  let size = S * 0.31
  ctx.font = `400 ${size}px ${fonts.serif}`
  const fit = S * 0.95
  const w = ctx.measureText(word).width
  if (w > fit) size *= fit / w
  ctx.font = `400 ${size}px ${fonts.serif}`
  ctx.lineWidth = size * 0.035
  ctx.lineJoin = 'round'
  ctx.strokeText(word, c, S * 0.5 + drop)
  ctx.fillText(word, c, S * 0.5 + drop)

  // The four elements round the name, as BOTA places them on the
  // Kingdom: Air above the Hebrew, Fire below the name to the left, Water
  // to the right, and Earth beneath, in the middle.
  if (kingdom) {
    const h = S * 0.055
    ctx.lineWidth = S * 0.012
    ctx.lineJoin = 'round'
    const element = (x: number, y: number, up: boolean, bar: boolean) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()
      ctx.moveTo(0, up ? -h : h)
      ctx.lineTo(h * 1.05, up ? h * 0.8 : -h * 0.8)
      ctx.lineTo(-h * 1.05, up ? h * 0.8 : -h * 0.8)
      ctx.closePath()
      if (bar) {
        ctx.moveTo(-h * 0.85, up ? h * 0.25 : -h * 0.25)
        ctx.lineTo(h * 0.85, up ? h * 0.25 : -h * 0.25)
      }
      ctx.stroke()
      ctx.restore()
    }
    element(c, S * 0.13, true, true) // Air
    element(S * 0.2, S * 0.75, true, false) // Fire
    element(S * 0.8, S * 0.75, false, false) // Water
    element(c, S * 0.88, false, true) // Earth
    return texture(el)
  }

  ctx.save()
  ctx.translate(c, S * 0.79)
  // The symbols below are drawn for the old size; scaled up together.
  ctx.scale(3.1, 3.1)
  const glyph = SYMBOLS[room.id]
  if (glyph) drawGlyph(ctx, glyph + '\uFE0E', S * 0.09, fonts)
  else if (room.id === 'kether') {
    // The first swirlings: a spiral.
    ctx.lineWidth = S * 0.007
    ctx.beginPath()
    for (let t = 0; t <= 1; t += 0.01) {
      const a = t * Math.PI * 5
      const r = t * S * 0.035
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  } else if (room.id === 'chokmah') {
    // The zodiac: a wheel of twelve spokes meeting at its hub.
    const r = S * 0.035
    ctx.lineWidth = S * 0.006
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.stroke()
  }
  ctx.restore()
  return texture(el)
}
