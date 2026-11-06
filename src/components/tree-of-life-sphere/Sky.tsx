// The fixed sky: stars, and the constellations' lines, figures and names.

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AdditiveBlending,
  DoubleSide,
  SRGBColorSpace,
  TextureLoader,
  type PerspectiveCamera,
  type ShaderMaterial,
  type Texture,
} from 'three'

import { toVector } from '@/lib/treeOfLifeSphere'

import {
  artGeometry,
  constellationLinesGeometry,
  starsGeometry,
} from './geometry'
import type { Fonts } from '@/components/model/fonts'

import { Label } from './Label'
import {
  INSIDE_FOV,
  ORDER,
  R_ART,
  R_LABELS,
  R_LINES,
  R_STARS,
  scaled,
  useDispose,
} from './layout'

// Baked by scripts/gen-sky.ts, already in the sphere's own coordinates.
export interface Sky {
  // Flat [lon, lat, magnitude, B-V, …].
  stars: number[]
  lines: { id: string; paths: number[][] }[]
  names: { id: string; name: string; lon: number; lat: number }[]
  art: {
    id: string
    file: string
    size: [number, number]
    zodiac: boolean
    anchors: number[][]
  }[]
}

const SKY_URL = '/tree-of-life-sphere/sky.json'
const ART_URL = '/tree-of-life-sphere/art'

export function useSky(): Sky | null {
  const [sky, setSky] = useState<Sky | null>(null)
  useEffect(() => {
    let live = true
    fetch(SKY_URL)
      .then((res) => res.json())
      .then((data: Sky) => {
        if (live) setSky(data)
      })
      // The Tree stands on its own; a missing sky just leaves it unlit.
      .catch((error) => console.warn('Tree of Life sphere: no sky', error))
    return () => {
      live = false
    }
  }, [])
  return sky
}

const STAR_VERTEX = /* glsl */ `
  uniform float uScale;
  attribute float size;
  attribute vec3 starColor;
  varying vec3 vColor;
  void main() {
    vColor = starColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uScale;
  }
`

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(vColor * smoothstep(0.5, 0.05, d), 1.0);
  }
`

export function Stars({ stars }: { stars: number[] }) {
  const geometry = useMemo(() => starsGeometry(stars, R_STARS), [stars])
  useDispose(geometry)
  const uniforms = useMemo(() => ({ uScale: { value: 1 } }), [])
  const material = useRef<ShaderMaterial>(null)
  // Stars grow a little as you zoom in, the way they seem to in a telescope.
  useFrame(({ camera, gl }) => {
    if (!material.current) return
    const { fov } = camera as PerspectiveCamera
    material.current.uniforms.uScale.value =
      gl.getPixelRatio() * Math.sqrt(INSIDE_FOV / fov)
  })
  return (
    <points geometry={geometry} renderOrder={ORDER.stars}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={STAR_VERTEX}
        fragmentShader={STAR_FRAGMENT}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function ConstellationLines({ lines }: { lines: Sky['lines'] }) {
  const geometry = useMemo(
    () => constellationLinesGeometry(lines, R_LINES),
    [lines],
  )
  useDispose(geometry)
  return (
    <lineSegments geometry={geometry} renderOrder={ORDER.lines}>
      <lineBasicMaterial
        color="#7c98d4"
        transparent
        opacity={0.32}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

export function ConstellationNames({
  names,
  fonts,
}: {
  names: Sky['names']
  fonts: Fonts
}) {
  // Serpens is two patches of sky under one name, hence the index in the key.
  return names.map((c, i) => (
    <Label
      key={`${c.id}-${i}`}
      text={c.name}
      position={scaled(toVector(c.lon, c.lat), R_LABELS)}
      height={0.3}
      font={fonts.caps}
      color="#9db3e0"
      weight={500}
      tracking={0.2}
      uppercase
      opacity={0.6}
    />
  ))
}

// One constellation figure. The art is white ink on black, so adding it to
// what's behind leaves the black invisible. Each loads on its own and
// simply stays absent if its image fails.
export function Figure({ art }: { art: Sky['art'][number] }) {
  const invalidate = useThree((s) => s.invalidate)
  const [texture, setTexture] = useState<Texture | null>(null)
  useEffect(() => {
    let live = true
    let loaded: Texture | null = null
    new TextureLoader().load(`${ART_URL}/${art.file}`, (t) => {
      if (!live) return t.dispose()
      t.colorSpace = SRGBColorSpace
      loaded = t
      setTexture(t)
      invalidate()
    })
    return () => {
      live = false
      loaded?.dispose()
    }
  }, [art.file, invalidate])

  const geometry = useMemo(
    () => artGeometry(art.anchors, art.size, R_ART),
    [art.anchors, art.size],
  )
  useDispose(geometry)

  if (!texture) return null
  return (
    <mesh geometry={geometry} renderOrder={ORDER.art}>
      <meshBasicMaterial
        map={texture}
        // The zodiac stands out warm against the rest of the sky. The cool
        // tint reads dimmer than the warm one at the same strength, so the
        // other figures are drawn a little stronger to stay visible.
        color={art.zodiac ? '#ecd398' : '#a3b6e2'}
        transparent
        opacity={art.zodiac ? 0.36 : 0.46}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
