// Geometry builders for the Tree of Life sphere. Everything here is drawn
// on (or just inside) one sphere and returned as plain three.js buffers;
// the React components in TreeOfLifeSphereCanvas.tsx only decide what to show.

import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  LinearFilter,
  Matrix3,
  SRGBColorSpace,
  Vector3,
} from 'three'

import { toVector, type Vec3 } from '@/lib/treeOfLifeSphere'

export const RADIUS = 10

const DEG = Math.PI / 180
const UP = new Vector3(0, 1, 0)

// Two unit vectors spanning the tangent plane at `center`: the first runs
// along the parallel of latitude, the second points toward Kether. At the
// poles, where neither means anything, the first points at longitude 0°.
function tangentBasis(center: Vector3): [Vector3, Vector3] {
  const e1 = new Vector3().crossVectors(UP, center)
  if (e1.lengthSq() < 1e-8) e1.set(1, 0, 0)
  e1.normalize()
  const e2 = new Vector3().crossVectors(center, e1).normalize()
  return [e1, e2]
}

function pointOnCap(
  center: Vector3,
  [e1, e2]: [Vector3, Vector3],
  radiusDeg: number,
  theta: number,
  r: number,
): Vector3 {
  const sin = Math.sin(radiusDeg * DEG)
  return center
    .clone()
    .multiplyScalar(Math.cos(radiusDeg * DEG))
    .addScaledVector(e1, sin * Math.cos(theta))
    .addScaledVector(e2, sin * Math.sin(theta))
    .multiplyScalar(r)
}

// A disc on the sphere (a spherical cap), or a sector of one. Shaded from
// `color` lightened at the centre to darkened at the rim, which is enough
// to read as the little globes of the Golden Dawn plates.
export function capGeometry(
  center: Vec3,
  radiusDeg: number,
  r: number,
  color: string,
  thetaStart = 0,
  thetaLength = Math.PI * 2,
): BufferGeometry {
  const c = new Vector3(...center)
  const basis = tangentBasis(c)
  const steps = Math.max(8, Math.round((48 * thetaLength) / (Math.PI * 2)))

  const base = new Color(color)
  // Lit in the middle, falling off toward the edge, which is what makes
  // a flat disc read as a ball.
  const inner = base.clone().lerp(new Color('#ffffff'), 0.22)
  const outer = base.clone().lerp(new Color('#000000'), 0.42)

  const positions: number[] = []
  const colors: number[] = []
  const push = (p: Vector3, col: Color) => {
    positions.push(p.x, p.y, p.z)
    colors.push(col.r, col.g, col.b)
  }

  const apex = c.clone().multiplyScalar(r)
  for (let i = 0; i < steps; i++) {
    const t0 = thetaStart + (thetaLength * i) / steps
    const t1 = thetaStart + (thetaLength * (i + 1)) / steps
    push(apex, inner)
    push(pointOnCap(c, basis, radiusDeg, t0, r), outer)
    push(pointOnCap(c, basis, radiusDeg, t1, r), outer)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  )
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(colors), 3),
  )
  return geometry
}

// A soft glow spreading out from the edge of a disc: a band in `color`
// that fades to nothing at `outerDeg`. The alpha is in the vertex colours
// (four components), which three.js picks up on its own.
export function haloGeometry(
  center: Vec3,
  innerDeg: number,
  outerDeg: number,
  r: number,
  color: string,
): BufferGeometry {
  const c = new Vector3(...center)
  const basis = tangentBasis(c)
  const { r: red, g, b } = new Color(color)
  const steps = 64
  const positions: number[] = []
  const colors: number[] = []
  const push = (p: Vector3, alpha: number) => {
    positions.push(p.x, p.y, p.z)
    colors.push(red, g, b, alpha)
  }
  for (let i = 0; i < steps; i++) {
    const t0 = (Math.PI * 2 * i) / steps
    const t1 = (Math.PI * 2 * (i + 1)) / steps
    const a = pointOnCap(c, basis, innerDeg, t0, r)
    const o = pointOnCap(c, basis, outerDeg, t0, r)
    const d = pointOnCap(c, basis, innerDeg, t1, r)
    const e = pointOnCap(c, basis, outerDeg, t1, r)
    push(a, 1)
    push(o, 0)
    push(e, 0)
    push(a, 1)
    push(e, 0)
    push(d, 1)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  )
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(colors), 4),
  )
  return geometry
}

// A thin band around a disc: its rim.
export function rimGeometry(
  center: Vec3,
  innerDeg: number,
  outerDeg: number,
  r: number,
): BufferGeometry {
  const c = new Vector3(...center)
  const basis = tangentBasis(c)
  const steps = 64
  const positions: number[] = []
  for (let i = 0; i < steps; i++) {
    const t0 = (Math.PI * 2 * i) / steps
    const t1 = (Math.PI * 2 * (i + 1)) / steps
    const a = pointOnCap(c, basis, innerDeg, t0, r)
    const b = pointOnCap(c, basis, outerDeg, t0, r)
    const d = pointOnCap(c, basis, innerDeg, t1, r)
    const e = pointOnCap(c, basis, outerDeg, t1, r)
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, e.x, e.y, e.z)
    positions.push(a.x, a.y, a.z, e.x, e.y, e.z, d.x, d.y, d.z)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  )
  return geometry
}

// Per-sample sideways direction along a curve on the sphere.
function sideVectors(points: Vector3[]): Vector3[] {
  const last = points.length - 1
  return points.map((p, i) => {
    const tangent = points[Math.min(last, i + 1)]
      .clone()
      .sub(points[Math.max(0, i - 1)])
    return new Vector3().crossVectors(p, tangent).normalize()
  })
}

// A band of constant angular width following `points` (unit vectors).
export function ribbonGeometry(
  points: Vec3[],
  halfWidthDeg: number,
  r: number,
): BufferGeometry {
  const curve = points.map((p) => new Vector3(...p))
  const sides = sideVectors(curve)
  const offset = Math.tan(halfWidthDeg * DEG)

  const positions = new Float32Array(curve.length * 6)
  curve.forEach((p, i) => {
    const left = p.clone().addScaledVector(sides[i], offset).normalize()
    const right = p.clone().addScaledVector(sides[i], -offset).normalize()
    positions.set([left.x * r, left.y * r, left.z * r], i * 6)
    positions.set([right.x * r, right.y * r, right.z * r], i * 6 + 3)
  })

  const index: number[] = []
  for (let i = 0; i < curve.length - 1; i++) {
    const a = i * 2
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setIndex(index)
  return geometry
}

// ---- Sky -------------------------------------------------------------------

// Rough star colour from the B-V index: blue-white through to orange.
const BV_STOPS: [number, Color][] = [
  [-0.3, new Color('#a9c1ff')],
  [0.0, new Color('#d5e0ff')],
  [0.4, new Color('#fbf8ff')],
  [0.8, new Color('#ffe9c9')],
  [1.4, new Color('#ffc890')],
  [2.0, new Color('#ffa868')],
]

function starColor(bv: number, target: Color): Color {
  if (bv <= BV_STOPS[0][0]) return target.copy(BV_STOPS[0][1])
  for (let i = 1; i < BV_STOPS.length; i++) {
    const [b, color] = BV_STOPS[i]
    if (bv <= b) {
      const [a, from] = BV_STOPS[i - 1]
      return target.copy(from).lerp(color, (bv - a) / (b - a))
    }
  }
  return target.copy(BV_STOPS[BV_STOPS.length - 1][1])
}

// `stars` is the flat [lon, lat, magnitude, B-V, …] run from sky.json.
export function starsGeometry(stars: number[], r: number): BufferGeometry {
  const count = stars.length / 4
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const color = new Color()
  for (let i = 0; i < count; i++) {
    const [lon, lat, mag, bv] = stars.slice(i * 4, i * 4 + 4)
    const [x, y, z] = toVector(lon, lat)
    positions.set([x * r, y * r, z * r], i * 3)
    // Fainter stars are both smaller and dimmer.
    const brightness = Math.min(1, Math.max(0.22, 1.05 - mag * 0.14))
    starColor(bv, color)
    colors.set(
      [color.r * brightness, color.g * brightness, color.b * brightness],
      i * 3,
    )
    sizes[i] = Math.min(11, Math.max(1.4, 8.2 - mag * 1.15))
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('starColor', new BufferAttribute(colors, 3))
  geometry.setAttribute('size', new BufferAttribute(sizes, 1))
  return geometry
}

// Constellation stick figures as line segments. A straight chord between
// two stars projects, from the centre, onto the great circle joining them.
export function constellationLinesGeometry(
  lines: { paths: number[][] }[],
  r: number,
): BufferGeometry {
  const positions: number[] = []
  for (const { paths } of lines) {
    for (const path of paths) {
      for (let i = 0; i + 3 < path.length; i += 2) {
        const a = toVector(path[i], path[i + 1])
        const b = toVector(path[i + 2], path[i + 3])
        positions.push(a[0] * r, a[1] * r, a[2] * r)
        positions.push(b[0] * r, b[1] * r, b[2] * r)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  )
  return geometry
}

// A constellation figure, pinned to the sky by three stars. Each anchor is
// [pixelX, pixelY, lon, lat], pixels from the image's top left. The three
// stars define a flat sheet in space that the image is laid on; pushing
// that sheet out radially wraps it onto the sphere. (This is how
// Stellarium places the same artwork.)
export function artGeometry(
  anchors: number[][],
  [width, height]: [number, number],
  r: number,
): BufferGeometry {
  const pixels = new Matrix3().set(
    anchors[0][0],
    anchors[1][0],
    anchors[2][0],
    anchors[0][1],
    anchors[1][1],
    anchors[2][1],
    1,
    1,
    1,
  )
  const v = anchors.map(([, , lon, lat]) => toVector(lon, lat))
  const sky = new Matrix3().set(
    v[0][0],
    v[1][0],
    v[2][0],
    v[0][1],
    v[1][1],
    v[2][1],
    v[0][2],
    v[1][2],
    v[2][2],
  )
  const pixelToSky = sky.multiply(pixels.invert())

  const grid = 12
  const positions: number[] = []
  const uvs: number[] = []
  const p = new Vector3()
  for (let j = 0; j <= grid; j++) {
    for (let i = 0; i <= grid; i++) {
      const x = (width * i) / grid
      const y = (height * j) / grid
      p.set(x, y, 1).applyMatrix3(pixelToSky).normalize().multiplyScalar(r)
      positions.push(p.x, p.y, p.z)
      uvs.push(i / grid, 1 - j / grid)
    }
  }
  const index: number[] = []
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const a = j * (grid + 1) + i
      const b = a + grid + 1
      index.push(a, b, a + 1, a + 1, b, b + 1)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positions), 3),
  )
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(index)
  return geometry
}

// ---- Labels ----------------------------------------------------------------

export interface LabelStyle {
  font: string
  color: string
  // CSS letter-spacing, in em.
  tracking?: number
  uppercase?: boolean
  weight?: number
  // A soft dark halo keeps text legible over stars and bands. Text that
  // sits on a disc of its own doesn't want one.
  halo?: boolean
}

// Text rendered once to a canvas, for a sprite. Returns the texture and
// its width / height so the sprite can keep the text's proportions.
export function labelTexture(
  text: string,
  {
    font,
    color,
    tracking = 0,
    uppercase = false,
    weight = 400,
    halo = true,
  }: LabelStyle,
): { texture: CanvasTexture; aspect: number } {
  const size = 64
  const pad = size * 0.3
  const content = uppercase ? text.toUpperCase() : text

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const setFont = () => {
    ctx.font = `${weight} ${size}px ${font}`
    // Not in every browser yet; where it's missing the text just sets tight.
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${tracking * size}px`
  }
  setFont()
  canvas.width = Math.ceil(ctx.measureText(content).width + pad * 2)
  canvas.height = Math.ceil(size * 1.5)
  // Resizing a canvas resets its context.
  setFont()
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  if (halo) {
    ctx.shadowColor = 'rgba(2, 3, 8, 0.9)'
    ctx.shadowBlur = size * 0.16
    // Drawn twice so the halo builds up enough to hold against a star.
    ctx.fillText(content, canvas.width / 2, canvas.height / 2)
  }
  ctx.fillText(content, canvas.width / 2, canvas.height / 2)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.generateMipmaps = false
  return { texture, aspect: canvas.width / canvas.height }
}
