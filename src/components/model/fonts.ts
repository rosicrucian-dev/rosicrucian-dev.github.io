// The typefaces a model paints its surfaces with, as canvas font
// families, and the planet and sign glyphs in Astronomicon.

import { useEffect, useState } from 'react'

// The face for Hebrew letters, as a CSS font family, wherever they are
// set: on a canvas, in SVG or in the page.
export const HEBREW_FONT = `'Times New Roman', 'Arial Hebrew', 'David', serif`

export interface Fonts {
  serif: string
  hebrew: string
  caps: string
  // Astronomicon, for the planet and sign glyphs.
  astro: string
}

// The site's faces, with Astronomicon fetched and registered here, since
// nothing outside the models uses it. Canvas text silently falls back if a
// face hasn't loaded, so surfaces are painted only once this returns.
export function useFonts(): Fonts | null {
  const [fonts, setFonts] = useState<Fonts | null>(null)
  useEffect(() => {
    let live = true
    const style = getComputedStyle(document.documentElement)
    const family = (variable: string, fallback: string) => {
      const value = style.getPropertyValue(variable).trim()
      return value ? `${value}, ${fallback}` : fallback
    }
    const loaded: Fonts = {
      serif: family('--font-instrument-serif', 'serif'),
      hebrew: HEBREW_FONT,
      caps: family('--font-inter', 'system-ui, sans-serif'),
      astro: 'Astronomicon',
    }
    const astro = new FontFace('Astronomicon', 'url(/fonts/Astronomicon.ttf)')
    astro
      .load()
      .then((face) => {
        document.fonts.add(face)
      })
      .catch(() => {
        // Without it the glyphs fall back to the serif face.
        loaded.astro = loaded.serif
      })
      .then(() =>
        Promise.all([
          document.fonts.load(`64px ${loaded.serif}`),
          document.fonts.load(`500 64px ${loaded.caps}`),
        ]),
      )
      .catch(() => {})
      .then(() => {
        if (live) setFonts(loaded)
      })
    return () => {
      live = false
    }
  }, [])
  return fonts
}

// Astronomicon keeps its glyphs on letters: the signs on A–L, the
// planets on Q–Z. Anything else passes through unchanged.
const ASTRONOMICON: Record<string, string> = {
  '☉': 'Q',
  '☽': 'R',
  '☿': 'S',
  '♀': 'T',
  '♂': 'U',
  '♃': 'V',
  '♄': 'W',
  '♈': 'A',
  '♉': 'B',
  '♊': 'C',
  '♋': 'D',
  '♌': 'E',
  '♍': 'F',
  '♎': 'G',
  '♏': 'H',
  '♐': 'I',
  '♑': 'J',
  '♒': 'K',
  '♓': 'L',
}

// The letter Astronomicon draws a glyph on, or the text unchanged.
export function astroGlyph(text: string): string {
  const base = text.replace('︎', '')
  return ASTRONOMICON[base] ?? text
}

// Draws one planet or sign glyph centred on (0, 0), `size` high, in
// Astronomicon where it has the glyph and the serif face otherwise.
export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: string,
  size: number,
  fonts: Fonts,
) {
  const letter = astroGlyph(glyph)
  const inFont = letter !== glyph
  ctx.font = `400 ${size}px ${inFont ? fonts.astro : fonts.serif}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, 0, 0)
}
