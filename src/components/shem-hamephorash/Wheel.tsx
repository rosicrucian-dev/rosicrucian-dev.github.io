'use client'

// The wheel of the 72 Names with the pentagram inside it, drawn as SVG:
// a flat figure has no need of three.js. Either the wheel turns under an
// upright star or the star turns inside the wheel, as the technique
// describes it; both are the same turn, one way or the other. The labels
// on the wheel lie along its spokes and turn with it; those on the star's
// points are counter-turned to stay upright.
//
// It can be turned by hand, like a dial: dragged round its centre, it
// follows the finger or the mouse; let go slowly, it settles on the
// nearest Name; flicked, it coasts and slows to land on one (see coast in
// src/lib/shemHaMephorash.ts). A scroll wheel or trackpad turns it a Name
// at a time.
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
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { astroGlyph, HEBREW_FONT, useFonts } from '@/components/model/fonts'
import { inkOn, PALETTE } from '@/lib/colors'
import { colorOf, SIGN_WORDS, type PaletteId } from '@/lib/palettes'
import { useSitePalette } from '@/lib/sitePalette'
import {
  coast,
  aspectsAmong,
  formula,
  letterColor,
  longitudeAngle,
  nameAtLongitude,
  nameAtTurn,
  nearestTurn,
  NAMES,
  POINTS,
  SIGNS,
  SLICE,
  sliceMiddle,
  sliceStart,
  snapTurn,
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
// The ring of the planets, inside the Zodiac (or the Names, without it):
// its width, and the size of each planet's disc.
const PLANETS_WIDTH = 46
const PLANET_RADIUS = 15
// The planets from the slowest across the sky to the quickest.
const SLOWEST_FIRST = [
  'Saturn',
  'Jupiter',
  'Mars',
  'Sun',
  'Venus',
  'Mercury',
  'Moon',
]

// The site's sans-serif, for the numbers.
const SANS = 'var(--font-inter), system-ui, sans-serif'

const INK = '#e8e6dc'
const FAINT = 'rgba(255,255,255,0.12)'

// How long a turn to a Name chosen some other way (a key, a tap, a link)
// takes.
const TURN_MS = 700

// How far a press must move, in pixels, before it is a drag rather than a
// tap on a Name.
const DRAG_PX = 6

// How often, at most, a Name reached by hand is passed on to the page
// while the wheel is still turning (the formula beside it follows), in
// milliseconds: often enough to follow, not so often as to make it work
// at every frame of a fast spin.
const REPORT_MS = 150

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

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A Name's three letters, each in its colour. Each letter
// is centred on the line itself: Safari, following SVG 1.1, doesn't pass
// the <text>'s dominant-baseline down to its <tspan>s, and would set them
// on the baseline instead, a third of a letter off the middle.
function Letters({ hebrew, palette }: { hebrew: string; palette: PaletteId }) {
  return [...hebrew].map((letter, i) => (
    <tspan
      key={i}
      dominantBaseline="central"
      fill={letterColor(letter, palette)}
    >
      {letter}
    </tspan>
  ))
}

// The ring: the 72 Names, the Zodiac and the lines between them. It is
// most of what is drawn, so it is kept apart from the turn, which changes
// at every frame of a spin: the ring is turned as a whole, outside it,
// and drawn again only when what it shows changes, which is when a Name
// passes the star (the five lit slices move on, and the labels flip over
// a Name at a time, so `flipTurn` need only be right to the nearest Name).
const Ring = memo(function Ring({
  current,
  flipTurn,
  zodiac,
  palette,
  onPick,
}: {
  // The Name the star stands on, whose formula is lit.
  current: number
  flipTurn: number
  zodiac: boolean
  palette: PaletteId
  onPick: (name: number) => void
}) {
  // Astronomicon, for the sign glyphs; registered by useFonts.
  const fonts = useFonts()
  const touched = new Map<number, PointId>(
    formula(current).map((e) => [e.name.number, e.point.id]),
  )

  return (
    <>
      {/* The 72 Names. */}
      {NAMES.map((n) => {
        const point = touched.get(n.number)
        const middle = sliceMiddle(n.number)
        const letters = at(LETTERS_AT, middle)
        const number = at(NUMBERS_AT, middle)
        return (
          <g
            key={n.number}
            onClick={() => onPick(n.number)}
            className="group cursor-pointer"
          >
            <path
              d={sector(
                NAMES_INNER,
                OUTER,
                sliceStart(n.number),
                sliceStart(n.number) + SLICE,
              )}
              // The five Names of the formula lit alike: the Essential one
              // is marked by Spirit's white disc on the star.
              fill={point ? INK : 'transparent'}
              fillOpacity={point ? 0.16 : 1}
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
              transform={alongSpoke(middle, flipTurn, letters)}
            >
              <Letters hebrew={n.hebrew} palette={palette} />
            </text>
            <text
              x={number[0]}
              y={number[1]}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontFamily={SANS}
              fill={point ? '#fff' : 'rgba(255,255,255,0.45)'}
              transform={alongSpoke(middle, flipTurn, number)}
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
          // Its colour in the King scale, in the palette chosen.
          const color = colorOf(SIGN_WORDS[i], palette)
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
                fill={color}
                opacity={fonts ? 0.85 : 0}
                transform={alongSpoke(a + 15, flipTurn, [x, y])}
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
    </>
  )
})

export function Wheel({
  name,
  turn: what,
  zodiac,
  planetsRing,
  planets,
  aspects,
  onSelect,
  onTurn,
}: {
  name: number
  // What turns: the wheel under the star, or the star in the wheel.
  turn: 'star' | 'wheel'
  zodiac: boolean
  // Whether the planets have their ring, and where they are (none until
  // they are worked out: the ring is kept for them meanwhile, so that the
  // star doesn't shrink when they arrive).
  planetsRing: boolean
  planets: { name: string; glyph: string; color: string; lon: number }[]
  // Lines between the planets for their aspects.
  aspects: boolean
  // A Name reached on the wheel: tapped, or turned to by hand.
  onSelect: (name: number) => void
  // A step round, by a scroll wheel or trackpad.
  onTurn: (direction: 'anticlockwise' | 'clockwise') => void
}) {
  // Astronomicon, for the planets' glyphs.
  const fonts = useFonts()
  // The colours, in the palette chosen for the site.
  const [palette] = useSitePalette()

  // The turn, as starTurn gives it but unwrapped, so that going past
  // Name 72 goes on round rather than spinning back. It changes at every
  // frame of a spin; the ref has it as it is now, for the handlers.
  const [turn, setTurnState] = useState(() => starTurn(name))
  const turnNow = useRef(turn)

  // Whether the wheel is in a hand, or coasting from one; and the Name
  // last passed on to the page, so that when the page hands it back it
  // isn't taken for a new choice to turn to.
  const handled = useRef(false)
  const reported = useRef(name)
  const reportedAt = useRef(0)
  const frame = useRef(0)

  // Moves the turn to `value`. While the wheel is in hand, the Name it
  // reaches is passed on, at most every REPORT_MS and always at the end,
  // with a tick under the finger (where the device can) as each passes.
  const moveTo = useCallback(
    (value: number, last = false) => {
      const before = nameAtTurn(turnNow.current)
      turnNow.current = value
      setTurnState(value)
      if (!handled.current) return
      const now = nameAtTurn(value)
      if (now !== before) navigator.vibrate?.(4)
      const time = performance.now()
      if (
        now !== reported.current &&
        (last || time - reportedAt.current > REPORT_MS)
      ) {
        reported.current = now
        reportedAt.current = time
        onSelect(now)
      }
    },
    [onSelect],
  )

  // Eases the turn to `to` over `duration`, quick to start and settling
  // gently (an ease-out cubic), or at once where motion is unwelcome.
  const easeTo = useCallback(
    (to: number, duration: number) => {
      cancelAnimationFrame(frame.current)
      const from = turnNow.current
      const start = performance.now()
      const still = duration <= 0 || reducedMotion()
      const tick = (time: number) => {
        const k = still ? 1 : Math.min(1, (time - start) / duration)
        // Ending exactly on `to`, not a rounding error short of it.
        moveTo(k === 1 ? to : from + (to - from) * (1 - (1 - k) ** 3), k === 1)
        if (k < 1) frame.current = requestAnimationFrame(tick)
        else handled.current = false
      }
      frame.current = requestAnimationFrame(tick)
    },
    [moveTo],
  )
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // A Name chosen some other way (a key, a button, a tap, a link): turned
  // to, the short way round. Not while the wheel is in hand, and not the
  // Name it passed on itself. A change just after the page loads is the
  // remembered Name replacing the default, so it is taken at once.
  const loadedAt = useRef(0)
  useEffect(() => {
    loadedAt.current = performance.now()
  }, [])
  useEffect(() => {
    if (handled.current || name === reported.current) return
    reported.current = name
    const soon = performance.now() - loadedAt.current < 300
    easeTo(nearestTurn(turnNow.current, starTurn(name)), soon ? 0 : TURN_MS)
  }, [name, easeTo])

  // ---- By hand --------------------------------------------------------------

  const svg = useRef<SVGSVGElement>(null)
  const press = useRef<{
    id: number
    x: number
    y: number
    angle: number
    dragging: boolean
    // Where the turn was, and when, over the last moments of the drag,
    // for the speed it is let go at.
    trail: { time: number; turn: number }[]
  } | null>(null)
  // A drag that ends over a Name isn't a tap on it.
  const dragged = useRef(false)

  // The angle of a pointer round the wheel's centre, clockwise on screen.
  const angleOf = (e: { clientX: number; clientY: number }) => {
    const box = svg.current!.getBoundingClientRect()
    const x = e.clientX - (box.left + box.width / 2)
    const y = e.clientY - (box.top + box.height / 2)
    return (Math.atan2(y, x) * 180) / Math.PI
  }

  // Dragged clockwise, the wheel turns clockwise (its turn grows), and
  // the star too (its turn shrinks: it is turned the other way, see
  // below), so that what turns follows the hand.
  const sign = what === 'wheel' ? 1 : -1

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // A hand on a coasting wheel stops it where it is, as on a real one;
    // let go without turning it, it settles on the nearest Name. Not a tap
    // on a Name, either.
    const caught = handled.current
    if (caught) {
      cancelAnimationFrame(frame.current)
      try {
        svg.current!.setPointerCapture(e.pointerId)
      } catch {
        // As below.
      }
    }
    dragged.current = caught
    press.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      angle: angleOf(e),
      dragging: caught,
      trail: [{ time: performance.now(), turn: turnNow.current }],
    }
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    if (!p.dragging) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < DRAG_PX) return
      // Now a drag: the wheel is in hand. Captured only now, so that a
      // tap still reaches the Name under it.
      p.dragging = true
      dragged.current = true
      handled.current = true
      cancelAnimationFrame(frame.current)
      try {
        svg.current!.setPointerCapture(e.pointerId)
      } catch {
        // The pointer already gone: the drag goes on as long as it moves.
      }
    }
    const angle = angleOf(e)
    // The way round the angle went since the last move, the short way.
    const delta = ((angle - p.angle + 540) % 360) - 180
    p.angle = angle
    const value = turnNow.current + sign * delta
    moveTo(value)
    const time = performance.now()
    p.trail.push({ time, turn: value })
    while (p.trail.length > 2 && time - p.trail[0].time > 100) p.trail.shift()
  }

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = press.current
    if (!p || p.id !== e.pointerId) return
    press.current = null
    if (!p.dragging) return
    // Its speed as it was let go, over the last tenth of a second; none if
    // the hand had stopped before it let go.
    const first = p.trail[0]
    const last = p.trail[p.trail.length - 1]
    const span = performance.now() - first.time
    const speed =
      span > 0 && performance.now() - last.time < 50
        ? (last.turn - first.turn) / span
        : 0
    const { to, duration } = coast(turnNow.current, speed)
    easeTo(to, reducedMotion() ? 0 : duration)
  }

  const onPick = useCallback(
    (n: number) => {
      if (!dragged.current) onSelect(n)
    },
    [onSelect],
  )

  // A scroll wheel or trackpad turns it a Name at a time: down (or right)
  // clockwise. Listened for directly, not through React, which listens
  // passively and so can't keep the page from scrolling.
  const scrolled = useRef(0)
  useEffect(() => {
    const element = svg.current
    if (!element) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Lines and pages, from a mouse's wheel, as pixels.
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
      scrolled.current += (e.deltaY || e.deltaX) * scale
      while (Math.abs(scrolled.current) >= 40) {
        const down = scrolled.current > 0
        scrolled.current -= down ? 40 : -40
        onTurn(down ? 'clockwise' : 'anticlockwise')
      }
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [onTurn])

  // ---- Drawing -----------------------------------------------------------------

  // The Name the star stands on now, mid-turn or at rest.
  const current = nameAtTurn(turn)

  // On screen, clockwise: the wheel turns clockwise by the turn, or the
  // star anticlockwise.
  const wheelRotation = what === 'wheel' ? turn : 0
  const starRotation = what === 'star' ? -turn : 0

  // The rings inside the Names: the Zodiac's, then the planets'.
  const planetsOuter = zodiac ? ZODIAC_INNER : NAMES_INNER
  const planetsInner = planetsOuter - PLANETS_WIDTH
  const innermost = planetsRing ? planetsInner : planetsOuter

  // Each planet on its degree, in the middle of the ring. Two close
  // together (a conjunction) simply overlap, the quicker drawn over the
  // slower, as it passes it.
  const planetsAt = planetsOuter - PLANETS_WIDTH / 2
  const bySpeed = [...planets].sort(
    (a, b) => SLOWEST_FIRST.indexOf(a.name) - SLOWEST_FIRST.indexOf(b.name),
  )

  // The star's points stop short of the ring around them, so that their
  // circles sit just inside it rather than over the signs or the Names.
  const starRadius = innermost - POINT_RADIUS - POINT_STROKE - 4
  // The star drawn as it is traced: Spirit, Fire, Air, Water, Earth.
  const vertices = POINTS.map((p) => at(starRadius, 90 + p.vertex * 72))
  const star = `M ${vertices.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`

  const essential = NAMES[current - 1]

  return (
    <svg
      ref={svg}
      viewBox="-500 -500 1000 1000"
      className="size-full cursor-grab touch-none active:cursor-grabbing"
      aria-hidden="true"
      style={{ fontFamily: HEBREW_FONT }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <g transform={`rotate(${wheelRotation})`}>
        <Ring
          current={current}
          flipTurn={snapTurn(wheelRotation)}
          zodiac={zodiac}
          palette={palette}
          onPick={onPick}
        />

        {/* The planets, each a disc in its Golden Dawn colour with its
            glyph in black or white, whichever reads better on it, at its
            degree. Turned with the wheel, their glyphs kept upright.
            Tapped, the star is set on the Name it is in. */}
        {planetsRing && (
          <circle
            r={planetsInner}
            stroke={FAINT}
            fill="none"
            pointerEvents="none"
          />
        )}
        {/* Their aspects, as lines between them: the harmonious (trine,
            sextile) blue, the hard (square, opposition) red, as charts
            commonly draw them. Under the discs; none for a conjunction,
            whose planets already sit together. */}
        {aspects &&
          aspectsAmong(planets)
            .filter((a) => a.name !== 'conjunction')
            .map(({ between: [a, b], name }) => {
              const lon = (n: string) => planets.find((p) => p.name === n)!.lon
              const [x1, y1] = at(planetsAt, longitudeAngle(lon(a)))
              const [x2, y2] = at(planetsAt, longitudeAngle(lon(b)))
              const hard = name === 'square' || name === 'opposition'
              return (
                <line
                  key={`${a}-${b}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={hard ? PALETTE.scarlet : PALETTE.blue}
                  strokeWidth={name === 'sextile' ? 1.5 : 2.5}
                  opacity={0.7}
                  pointerEvents="none"
                />
              )
            })}
        {bySpeed.map((planet) => {
          const angle = longitudeAngle(planet.lon)
          const [x, y] = at(planetsAt, angle)
          const n = nameAtLongitude(planet.lon)
          return (
            <g
              key={planet.name}
              className="cursor-pointer"
              onClick={() => onPick(n)}
            >
              <title>{`${planet.name}, in Name ${n}`}</title>
              <circle cx={x} cy={y} r={PLANET_RADIUS} fill={planet.color} />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontFamily={fonts ? fonts.astro : undefined}
                fill={inkOn(planet.color)}
                opacity={fonts ? 1 : 0}
                transform={upright(wheelRotation, [x, y])}
              >
                {fonts ? astroGlyph(planet.glyph) : ''}
              </text>
            </g>
          )
        })}
      </g>

      {/* The pentagram, with the letters of Yeheshuah on its points. */}
      <g transform={`rotate(${starRotation})`} pointerEvents="none">
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
        {/* White, Spirit (the Essential Name) a filled disc. */}
        {POINTS.map((p, i) => {
          const [x, y] = vertices[i]
          const essential = p.id === 'spirit'
          return (
            <g key={p.id}>
              <circle
                cx={x}
                cy={y}
                r={POINT_RADIUS}
                fill={essential ? PALETTE.white : '#04050a'}
                stroke={PALETTE.white}
                strokeWidth={POINT_STROKE}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={24}
                fill={essential ? '#04050a' : PALETTE.white}
                transform={upright(starRotation, [x, y])}
              >
                {p.letter}
              </text>
            </g>
          )
        })}
      </g>

      {/* The Essential Name, at the heart of the star. */}
      <g pointerEvents="none">
        <text
          x={0}
          y={-10}
          direction="rtl"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={60}
          fill={INK}
        >
          <Letters hebrew={essential.hebrew} palette={palette} />
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
      </g>
    </svg>
  )
}
