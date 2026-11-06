// The formula at a glance, before its cards: the pentagram alone, upright,
// with the letter of Yeheshuah a little beyond each tip, each in its
// point's colour, and the Name of that point beyond the letter, coloured
// as on the cards, so that each point is seen to point through its letter
// to its Name. No wheel, no Zodiac, no circles on the tips.
//
// Inside, in each arm, is the part that point plays in the formula, as
// Moore's own diagram has it written there.
//
// The star and the letters are SVG; the phrases and the Names are laid
// over them as text, the Names because their colours are the cards' (see
// NameLetters), which SVG text can't take, the phrases so that they wrap
// and take the page's serif. All are placed in the same units, those of
// the viewBox below, the text as shares of its width and height.

import clsx from 'clsx'

import { HEBREW_FONT } from '@/components/model/fonts'
import { PALETTE } from '@/lib/colors'
import {
  POINTS,
  type FormulaEntry,
  type Point,
  type PointId,
} from '@/lib/shemHaMephorash'

import { NameLetters } from './NameLetters'

// The colour of each point's letter, by where the point falls on the star
// drawn upright: Spirit at the top red, Water at the right blue, Fire at
// the bottom right gold, Earth at the bottom left white, Air at the top
// left yellow.
const LETTER_COLOR: Record<PointId, string> = {
  spirit: PALETTE.scarlet,
  water: PALETTE.blue,
  fire: PALETTE.gold,
  earth: PALETTE.white,
  air: PALETTE.yellow,
}

// The part each point plays, written inside its arm as Moore writes it:
// the diagram spells Spirit's out, where POINTS shortens it.
function phraseOf(point: Point): string {
  return point.id === 'spirit' ? 'The Most Essential' : point.role
}

// The star's radius, and the sizes of the letters and of the Names, in the
// viewBox's units.
const RADIUS = 60
const LETTER = 20
const FONT = 24
// Between a tip and the nearest edge of its letter, and between the letter
// and the nearest edge of its Name.
const LETTER_GAP = 5
const GAP = 7
// About half a Name's width and height at that size: three letters of
// Times' Hebrew, and the height of its line.
const HALF_WIDTH = 0.9 * FONT
const HALF_HEIGHT = 0.55 * FONT
// And half of a single letter's, this time what the eye sees of it rather
// than the line it sits in: one of those three letters, and the height it
// stands at in Times, from about a quarter of the way down the line to the
// baseline.
const LETTER_HALF_WIDTH = 0.3 * LETTER
const LETTER_HALF_HEIGHT = 0.33 * LETTER

// The phrases sit in the belly of each arm, between the inner pentagon's
// edge (0.31 of the radius out along the spoke) and the tip, where Moore's
// diagram writes them. How far out each goes is his too: the two side arms
// run with the writing, so their words go well towards the tip; the arms
// that point up and down are written across, so theirs come in to where
// the arm is wide enough to hold a line.
const PHRASE_AT: Record<PointId, number> = {
  spirit: 0.5 * RADIUS,
  air: 0.52 * RADIUS,
  water: 0.52 * RADIUS,
  fire: 0.45 * RADIUS,
  earth: 0.45 * RADIUS,
}
const PHRASE_FONT = 5.6
// The column each is set in: room enough that the single words hold their
// line with something to spare. Spirit's is the only phrase of more than
// one word, and the top arm the narrowest place to write across, so it is
// held to a column that breaks it into three lines, as the diagram has
// it.
const PHRASE_WIDTH = 24
const SPIRIT_PHRASE_WIDTH = 15

// Where a point at radius `r` and `angle` (anticlockwise from the right)
// is.
function at(r: number, angle: number): [number, number] {
  const a = (angle * Math.PI) / 180
  return [r * Math.cos(a), -r * Math.sin(a)]
}

// Upright, Spirit at the top. Drawn as it is traced: Spirit, Fire, Air,
// Water, Earth.
const ANGLES = POINTS.map((p) => 90 + p.vertex * 72)
const VERTICES = ANGLES.map((a) => at(RADIUS, a))
const STAR = `M ${VERTICES.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`

// Out from the tip of point `i` along its spoke: `outX` where the spoke
// leans across, `outY` where it leans down, so that each thing set beyond
// a tip keeps its gap whichever way its spoke runs.
function beyond(i: number, outX: number, outY: number): [number, number] {
  const [tx, ty] = VERTICES[i]
  const [ux, uy] = at(1, ANGLES[i])
  return [tx + ux * outX, ty + uy * outY]
}

// The letter stands a gap from the tip; the Name begins a further gap
// beyond the whole of the letter. Each is measured to the middle of what
// is set there, so the gaps are reckoned to its near edge and half of it
// added back.
const LETTERS_AT = POINTS.map((_, i) =>
  beyond(i, LETTER_GAP + LETTER_HALF_WIDTH, LETTER_GAP + LETTER_HALF_HEIGHT),
)
const NAMES_AT = POINTS.map((_, i) =>
  beyond(
    i,
    LETTER_GAP + 2 * LETTER_HALF_WIDTH + GAP + HALF_WIDTH,
    LETTER_GAP + 2 * LETTER_HALF_HEIGHT + GAP + HALF_HEIGHT,
  ),
)

// The box: the Names at their full width and height, which reach further
// out than anything else, and a little air around them.
const MARGIN = 3
const BOX = (() => {
  const xs = NAMES_AT.flatMap(([x]) => [x - HALF_WIDTH, x + HALF_WIDTH])
  const ys = NAMES_AT.flatMap(([, y]) => [y - HALF_HEIGHT, y + HALF_HEIGHT])
  const left = Math.floor(Math.min(...xs) - MARGIN)
  const top = Math.floor(Math.min(...ys) - MARGIN)
  return {
    left,
    top,
    width: Math.ceil(Math.max(...xs) + MARGIN) - left,
    height: Math.ceil(Math.max(...ys) + MARGIN) - top,
  }
})()

export function FormulaStar({
  entries,
  className,
}: {
  entries: FormulaEntry[]
  // Its size: given a width or a height, it takes the other from its
  // shape.
  className?: string
}) {
  return (
    <div
      className={clsx('@container relative', className)}
      style={{ aspectRatio: `${BOX.width} / ${BOX.height}` }}
    >
      <svg
        viewBox={`${BOX.left} ${BOX.top} ${BOX.width} ${BOX.height}`}
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d={STAR}
          fill="none"
          stroke={PALETTE.gold}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* The letters of Yeheshuah, each in its point's colour. */}
        {entries.map(({ point }, i) => {
          const [x, y] = LETTERS_AT[i]
          return (
            <text
              key={point.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={LETTER}
              fontFamily={HEBREW_FONT}
              fill={LETTER_COLOR[point.id]}
            >
              {point.letter}
            </text>
          )
        })}
      </svg>
      {/* The part each point plays, inside its arm. Text, not SVG, so
          that it wraps and takes the page's serif. */}
      {entries.map(({ point }, i) => {
        const [x, y] = at(PHRASE_AT[point.id], ANGLES[i])
        return (
          <span
            key={point.id}
            className="font-display absolute -translate-x-1/2 -translate-y-1/2 text-center leading-[1.1] text-balance text-white/90"
            style={{
              left: `${((x - BOX.left) / BOX.width) * 100}%`,
              top: `${((y - BOX.top) / BOX.height) * 100}%`,
              width: `${((point.id === 'spirit' ? SPIRIT_PHRASE_WIDTH : PHRASE_WIDTH) / BOX.width) * 100}%`,
              fontSize: `${(PHRASE_FONT / BOX.width) * 100}cqw`,
            }}
          >
            {phraseOf(point)}
          </span>
        )
      })}
      {entries.map(({ point, name }, i) => {
        const [x, y] = NAMES_AT[i]
        return (
          <span
            key={point.id}
            title={`${point.element}: ${point.letterName} · ${name.number} · ${name.meaning}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 leading-none"
            style={{
              left: `${((x - BOX.left) / BOX.width) * 100}%`,
              top: `${((y - BOX.top) / BOX.height) * 100}%`,
              fontSize: `${(FONT / BOX.width) * 100}cqw`,
            }}
          >
            <NameLetters hebrew={name.hebrew} />
          </span>
        )
      })}
    </div>
  )
}
