// Surfaces painted on a 2D canvas and handed to three.js as textures, as
// every model paints its walls, floors and plates.

import { useEffect, useState } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

// A blank canvas of the given size, in pixels, and its 2D context.
export function canvas(width: number, height: number) {
  const el = document.createElement('canvas')
  el.width = width
  el.height = height
  const ctx = el.getContext('2d')!
  return { el, ctx }
}

// A finished canvas as a texture, in the sRGB colours it was painted in,
// kept sharp when seen at a slant.
export function texture(el: HTMLCanvasElement): CanvasTexture {
  const t = new CanvasTexture(el)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 8
  return t
}

// Paints a surface once, and lets the texture go when it is no longer
// shown. `make` is called on first render only.
export function useTexture<T extends { dispose: () => void }>(
  make: () => T,
): T {
  const [t] = useState(make)
  useEffect(() => () => t.dispose(), [t])
  return t
}
