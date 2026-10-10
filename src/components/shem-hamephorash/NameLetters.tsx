// A Name's letters in Moore's colouring: each letter shaded down through
// its four colour scales, King at the top to Princess at the bottom, with
// a thin gold outline, as on his cards. Large enough (on a card) they also
// carry their scales' flecks and rays.

import type { CSSProperties } from 'react'

import { HEBREW_FONT } from '@/components/model/fonts'
import { PALETTE, type Mark } from '@/lib/colors'
import { letterMarks, letterScales } from '@/lib/shemHaMephorash'

// Where each colour is centred, down the letter's box (its font's
// ascent and descent, as an inline box has): each on its quarter of the
// letters' height, which in Times runs from about a quarter of the way
// down to the baseline, at about five-sixths. So a tall letter shows all
// four, as Moore's do, and a short one high in the line (Yod) the upper
// ones.
const STOPS = [31, 46, 62, 77]

// Where each colour's band begins and ends, half-way between the stops,
// for the marks that belong to one band.
const BANDS = [0, 38.5, 54, 69.5, 100]

// The box the stops are measured in, as a line height: the ascent and
// descent of Times. A letter laid out as a grid item (to stack its marks
// over it) takes its line height as its box, so it is set to this to
// match a plain inline letter's.
const CONTENT_HEIGHT = 1.107

const clipToText: CSSProperties = {
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

function scaled(letter: string): CSSProperties {
  const [king, queen, prince, princess] = letterScales(letter)
  return {
    ...clipToText,
    backgroundImage: `linear-gradient(to bottom, ${king} ${STOPS[0]}%, ${queen} ${STOPS[1]}%, ${prince} ${STOPS[2]}%, ${princess} ${STOPS[3]}%)`,
    WebkitTextStroke: `0.75px ${PALETTE.gold}`,
  }
}

// The pattern of a mark, in ems so that it scales with the letter: small
// round flecks scattered on two grids, so that they don't fall in rows;
// or fine slanting rays.
function pattern({ kind, colors }: Mark): CSSProperties {
  if (kind === 'ray') {
    const c = colors[0]
    return {
      backgroundImage: `repeating-linear-gradient(105deg, transparent 0 0.024em, ${c} 0.024em 0.032em)`,
    }
  }
  const [a, b = a] = colors
  const dot = (c: string) =>
    `radial-gradient(circle, ${c} 0 0.008em, transparent 0.012em)`
  return {
    backgroundImage: `${dot(a)}, ${dot(b)}`,
    backgroundSize: '0.06em 0.06em, 0.085em 0.085em',
    backgroundPosition: '0 0, 0.03em 0.04em',
  }
}

// How far, either side of a band's edge, its marks fade in or out, as a
// share of the letter's box: as far as the colours themselves blend, so
// that flecks thin out where their colour gives way to the next, rather
// than stopping in a row of half-dots.
const FEATHER = 6

// Shows a mark only within its colour's band, fading at its edges (but
// not at the top or bottom of the letter, where there is no next colour).
function band(scale: number): CSSProperties {
  const [top, bottom] = [BANDS[scale], BANDS[scale + 1]]
  const stops = [
    top > 0
      ? `transparent ${top - FEATHER}%, #000 ${top + FEATHER}%`
      : '#000 0%',
    bottom < 100
      ? `#000 ${bottom - FEATHER}%, transparent ${bottom + FEATHER}%`
      : '#000 100%',
  ]
  const mask = `linear-gradient(to bottom, ${stops.join(', ')})`
  return { WebkitMaskImage: mask, maskImage: mask }
}

const layer = 'col-start-1 row-start-1'

export function NameLetters({
  hebrew,
  marks = false,
}: {
  hebrew: string
  // The flecks and rays: only where the letters are large enough to show
  // them.
  marks?: boolean
}) {
  return (
    <span dir="rtl" lang="he" style={{ fontFamily: HEBREW_FONT }}>
      {[...hebrew].map((letter, i) => {
        const found = marks ? letterMarks(letter) : []
        if (found.length === 0)
          return (
            <span key={i} style={scaled(letter)}>
              {letter}
            </span>
          )
        // The letter, and over it the same letter once for each mark,
        // its pattern clipped to the letter's shape and to the band.
        return (
          <span
            key={i}
            className="inline-grid"
            style={{ lineHeight: CONTENT_HEIGHT }}
          >
            <span className={layer} style={scaled(letter)}>
              {letter}
            </span>
            {found.map(({ scale, mark }) => (
              <span
                key={scale}
                aria-hidden="true"
                className={layer}
                style={{ ...clipToText, ...pattern(mark), ...band(scale) }}
              >
                {letter}
              </span>
            ))}
          </span>
        )
      })}
    </span>
  )
}
