// The formula at a glance, before its cards: the pentagram alone, upright,
// with the Name of each point beyond its tip, coloured as on the cards,
// so that each point is seen to point to its Name. No wheel, no Zodiac,
// no circles on the tips.
//
// The star is SVG; the Names are laid over it as text, for their colours
// are the cards' (see NameLetters), which SVG text can't take. Both are
// placed in the same units, those of the viewBox below, the Names as
// shares of its width and height.

import clsx from 'clsx'

import { PALETTE } from '@/lib/colors'
import { POINTS, type FormulaEntry } from '@/lib/shemHaMephorash'

import { NameLetters } from './NameLetters'

// The star's radius, and the Names' size and room, in the viewBox's units.
const RADIUS = 60
const FONT = 24
// Between a tip and the nearest edge of its Name.
const GAP = 7
// About half a Name's width and height at that size: three letters of
// Times' Hebrew, and the height of its line.
const HALF_WIDTH = 0.9 * FONT
const HALF_HEIGHT = 0.55 * FONT

const BOX = { left: -122, top: -96, width: 244, height: 178 }

// Where a point at radius `r` and `angle` (anticlockwise from the right)
// is.
function at(r: number, angle: number): [number, number] {
  const a = (angle * Math.PI) / 180
  return [r * Math.cos(a), -r * Math.sin(a)]
}

export function FormulaStar({
  entries,
  className,
}: {
  entries: FormulaEntry[]
  // Its size: given a width or a height, it takes the other from its
  // shape.
  className?: string
}) {
  const angles = POINTS.map((p) => 90 + p.vertex * 72)
  const vertices = angles.map((a) => at(RADIUS, a))
  // Drawn as it is traced: Spirit, Fire, Air, Water, Earth.
  const star = `M ${vertices.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`

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
          d={star}
          fill="none"
          stroke={PALETTE.gold}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
      {entries.map(({ point, name }, i) => {
        // Out from the tip along its spoke, then on by half the Name's
        // width or height, whichever way the spoke leans, so that its
        // nearest edge, not its middle, is a gap from the tip.
        const [tx, ty] = vertices[i]
        const [ux, uy] = at(1, angles[i])
        const x = tx + ux * (GAP + HALF_WIDTH)
        const y = ty + uy * (GAP + HALF_HEIGHT)
        return (
          <span
            key={point.id}
            title={`${point.element}: ${name.number} · ${name.meaning}`}
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
