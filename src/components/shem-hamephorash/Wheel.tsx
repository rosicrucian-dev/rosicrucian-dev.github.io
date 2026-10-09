'use client'

// The wheel of the 72 Names with the pentagram inside it, drawn as SVG:
// a flat figure has no need of three.js. Either the star turns inside the
// wheel, as the technique describes it, or the wheel turns under an
// upright star; both are the same turn, one way or the other. The labels
// on the wheel lie along its spokes and turn with it; those on the star's
// points are counter-turned to stay upright.
//
// Units are those of the viewBox, centred on the wheel. Angles come from
// src/lib/shemHaMephorash.ts, anticlockwise from the right; SVG turns
// clockwise, hence the signs below.
//
// The turns are SVG transform attributes, eased by script, not CSS
// transitions: turning a label about its own centre in CSS needs
// `transform-box: fill-box`, which Safari gets wrong on SVG text (it
// turns the label about the middle of the wheel, so the letters on the
// star's points swing away from them).

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { astroGlyph, HEBREW_FONT, useFonts } from '@/components/model/fonts'
import { PALETTE, SIGN_COLORS } from '@/lib/colors'
import {
  formula,
  letterColor,
  nearestTurn,
  NAMES,
  POINTS,
  SIGNS,
  SLICE,
  sliceMiddle,
  sliceStart,
  starTurn,
  type PointId,
} from '@/lib/shemHaMephorash'

const OUTER = 490
const NAMES_INNER = 395
const ZODIAC_INNER = 345
const LETTERS_AT = 458
const NUMBERS_AT = 412
// The circles holding the letters on the star's points.
const POINT_RADIUS = 20
const POINT_STROKE = 3

// The site's sans-serif, for the numbers.
const SANS = 'var(--font-inter), system-ui, sans-serif'

const INK = '#e8e6dc'
const FAINT = 'rgba(255,255,255,0.12)'

// Where a point at radius `r` and `angle` is, rounded to a thousandth of
// a unit: the server and the browser can differ in the last digit of a
// sine, and the page they draw must match to the character, or React
// reports a hydration mismatch.
function at(r: number, angle: number): [number, number] {
  const a = (angle * Math.PI) / 180
  const round = (v: number) => Math.round(v * 1000) / 1000 || 0
  return [round(r * Math.cos(a)), round(-r * Math.sin(a))]
}

// A slice of a ring, from angle `a` to angle `b`, anticlockwise.
function sector(inner: number, outer: number, a: number, b: number): string {
  const [x1, y1] = at(outer, a)
  const [x2, y2] = at(outer, b)
  const [x3, y3] = at(inner, b)
  const [x4, y4] = at(inner, a)
  const large = b - a > 180 ? 1 : 0
  return [
    `M ${x1} ${y1}`,
    `A ${outer} ${outer} 0 ${large} 0 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${inner} ${inner} 0 ${large} 1 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

const TURN_MS = 700

// `target`, eased towards over TURN_MS whenever it changes, unless the
// visitor would rather nothing moved. A change just after the page loads
// is the remembered Name replacing the default, so it is taken at once
// rather than turned to.
function useEased(target: number): number {
  const [value, setValue] = useState(target)
  const current = useRef(target)
  const loadedAt = useRef(0)
  useEffect(() => {
    loadedAt.current = performance.now()
  }, [])
  useEffect(() => {
    const from = current.current
    if (from === target) return
    const still =
      performance.now() - loadedAt.current < 300 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const k = still ? 1 : Math.min(1, (now - start) / TURN_MS)
      // Ease out: quick to start, settling gently.
      const next = from + (target - from) * (1 - (1 - k) ** 3)
      current.current = next
      setValue(next)
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

// Turns a label at (x, y), at `angle` on a wheel turned by `turn`, to
// lie along its spoke the right way up. On the right half of the wheel,
// as it stands on screen, the numbers read outwards from the centre and
// the Names, read right to left, inwards towards it; on the left half
// each is turned half round, so that nothing is upside down. (A label
// crossing the top or bottom as the wheel turns flips over there.)
function alongSpoke(
  angle: number,
  turn: number,
  [x, y]: [number, number],
): string {
  const onScreen = (((angle - turn) % 360) + 360) % 360
  const flip = onScreen > 90 && onScreen < 270 ? 180 : 0
  return `rotate(${-angle + flip} ${x} ${y})`
}

// Turns a label at (x, y) back by `turn`, so it stays upright on
// something turned by `turn`.
function upright(turn: number, [x, y]: [number, number]): string {
  return `rotate(${-turn} ${x} ${y})`
}

// A Name's three letters, each in its colour if `colours`. Each letter
// is centred on the line itself: Safari, following SVG 1.1, doesn't pass
// the <text>'s dominant-baseline down to its <tspan>s, and would set them
// on the baseline instead, a third of a letter off the middle.
function Letters({ hebrew, colours }: { hebrew: string; colours: boolean }) {
  return [...hebrew].map((letter, i) => (
    <tspan
      key={i}
      dominantBaseline="central"
      fill={colours ? letterColor(letter) : undefined}
    >
      {letter}
    </tspan>
  ))
}

export function Wheel({
  name,
  turn,
  colours,
  zodiac,
  onSelect,
}: {
  name: number
  turn: 'star' | 'wheel'
  colours: boolean
  zodiac: boolean
  onSelect: (name: number) => void
}) {
  // Astronomicon, for the sign glyphs; registered by useFonts.
  const fonts = useFonts()

  // The turn taken to the chosen Name, kept unwrapped, so that stepping
  // past 72 goes on round rather than spinning back (see nearestTurn).
  const [shown, setShown] = useState(() => ({ name, turn: starTurn(name) }))
  if (shown.name !== name) {
    setShown({ name, turn: nearestTurn(shown.turn, starTurn(name)) })
  }
  const t = useEased(shown.turn)

  // On screen, clockwise: the star turns anticlockwise by t, or the wheel
  // clockwise by t.
  const starRotation = turn === 'star' ? -t : 0
  const wheelRotation = turn === 'wheel' ? t : 0

  const touched = new Map<number, PointId>(
    formula(name).map((e) => [e.name.number, e.point.id]),
  )
  const colorOf = (id: PointId) => POINTS.find((p) => p.id === id)!.color

  // The star's points stop short of the ring around them, so that their
  // circles sit just inside it rather than over the signs or the Names.
  const starRadius =
    (zodiac ? ZODIAC_INNER : NAMES_INNER) - POINT_RADIUS - POINT_STROKE - 4
  // The star drawn as it is traced: Spirit, Fire, Air, Water, Earth.
  const vertices = POINTS.map((p) => at(starRadius, 90 + p.vertex * 72))
  const star = `M ${vertices.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`

  const essential = NAMES[name - 1]

  return (
    <svg
      viewBox="-500 -500 1000 1000"
      className="size-full"
      aria-hidden="true"
      style={{ fontFamily: HEBREW_FONT }}
    >
      <g transform={`rotate(${wheelRotation})`}>
        {/* The 72 Names. */}
        {NAMES.map((n) => {
          const point = touched.get(n.number)
          const middle = sliceMiddle(n.number)
          const letters = at(LETTERS_AT, middle)
          const number = at(NUMBERS_AT, middle)
          return (
            <g
              key={n.number}
              onClick={() => onSelect(n.number)}
              className="group cursor-pointer"
            >
              <path
                d={sector(
                  NAMES_INNER,
                  OUTER,
                  sliceStart(n.number),
                  sliceStart(n.number) + SLICE,
                )}
                fill={point ? colorOf(point) : 'transparent'}
                fillOpacity={point ? 0.28 : 1}
                className={clsx(!point && 'group-hover:fill-white/10')}
              />
              <text
                x={letters[0]}
                y={letters[1]}
                direction="rtl"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={30}
                fill={INK}
                fontWeight={point ? 700 : 400}
                transform={alongSpoke(middle, wheelRotation, letters)}
              >
                <Letters hebrew={n.hebrew} colours={colours} />
              </text>
              <text
                x={number[0]}
                y={number[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontFamily={SANS}
                fill={point ? '#fff' : 'rgba(255,255,255,0.45)'}
                transform={alongSpoke(middle, wheelRotation, number)}
              >
                {n.number}
              </text>
            </g>
          )
        })}

        {/* The Zodiac, six Names to a sign. */}
        {zodiac &&
          SIGNS.map((sign, i) => {
            const a = sliceStart(i * 6 + 1)
            const [x, y] = at((ZODIAC_INNER + NAMES_INNER) / 2, a + 15)
            const color =
              PALETTE[
                SIGN_COLORS[sign.name.toLowerCase() as keyof typeof SIGN_COLORS]
              ]
            return (
              <g key={sign.name}>
                <path
                  d={sector(ZODIAC_INNER, NAMES_INNER, a, a + 30)}
                  fill="transparent"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                  fontFamily={fonts ? fonts.astro : undefined}
                  fill={colours ? color : INK}
                  opacity={fonts ? 0.85 : 0}
                  transform={alongSpoke(a + 15, wheelRotation, [x, y])}
                >
                  {fonts ? astroGlyph(sign.glyph) : ''}
                </text>
              </g>
            )
          })}

        {/* The rings and the lines between the slices, each drawn once:
            outlining every slice would draw each shared edge twice, and the
            faint strokes, laid one over another, would show brighter there
            than on the innermost circle. */}
        <g stroke={FAINT} fill="none" pointerEvents="none">
          {[OUTER, NAMES_INNER, ...(zodiac ? [ZODIAC_INNER] : [])].map((r) => (
            <circle key={r} r={r} />
          ))}
          {NAMES.map((n) => {
            const [x1, y1] = at(NAMES_INNER, sliceStart(n.number))
            const [x2, y2] = at(OUTER, sliceStart(n.number))
            return <line key={n.number} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
          {zodiac &&
            SIGNS.map((sign, i) => {
              const a = sliceStart(i * 6 + 1)
              const [x1, y1] = at(ZODIAC_INNER, a)
              const [x2, y2] = at(NAMES_INNER, a)
              return <line key={sign.name} x1={x1} y1={y1} x2={x2} y2={y2} />
            })}
        </g>
      </g>

      {/* The pentagram, with the letters of Yeheshuah on its points. */}
      <g transform={`rotate(${starRotation})`}>
        <path
          d={star}
          fill="none"
          stroke={PALETTE.white}
          strokeWidth={5}
          strokeLinejoin="round"
          // A little dimmed, so that Spirit's ring, in the same white,
          // stands out at the top.
          opacity={0.75}
        />
        {POINTS.map((p, i) => {
          const [x, y] = vertices[i]
          return (
            <g key={p.id}>
              <circle
                cx={x}
                cy={y}
                r={POINT_RADIUS}
                fill="#04050a"
                stroke={p.color}
                strokeWidth={POINT_STROKE}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={24}
                fill={p.color}
                transform={upright(starRotation, [x, y])}
              >
                {p.letter}
              </text>
            </g>
          )
        })}
      </g>

      {/* The Essential Name, at the heart of the star. */}
      <text
        x={0}
        y={-10}
        direction="rtl"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={60}
        fill={INK}
      >
        <Letters hebrew={essential.hebrew} colours={colours} />
      </text>
      <text
        x={0}
        y={38}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={17}
        fontFamily={SANS}
        fill="rgba(255,255,255,0.6)"
      >
        {essential.number}
      </text>
    </svg>
  )
}
