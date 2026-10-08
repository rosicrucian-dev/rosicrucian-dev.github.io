// The Vault of the Adepti: the seven-sided tomb of Christian Rosenkreuz as
// the Golden Dawn built it for the Adeptus Minor grade. Everything here is
// taken from the 5=6 ritual and the two papers on the Vault in Regardie's
// The Golden Dawn, vol. 2 (1938): the ritual's description of the tomb,
// the plates of the wall, ceiling, floor, altar and pastos, and the
// commentary "On the Symbolism of the Seven Sides".
//
// The room's shape is shared by every design of the tomb; the page
// switches between the Golden Dawn's and a Pansophic reconstruction after
// the Fama (see DESIGNS, and components/vault/pansophic/textures.ts).

import {
  ELEMENT_COLORS,
  PALETTE,
  PLANET_COLORS,
  SEPHIRAH_COLORS,
  SIGN_COLORS,
  colorLabel,
} from './colors'

// ---- Shape ----------------------------------------------------------------

// "Every side was five feet broad, and eight feet high." Units are feet.
export const WALL_WIDTH = 5
export const WALL_HEIGHT = 8
export const SIDES = 7
// A regular heptagon of side 5: its circumradius (centre to a corner) and
// inradius (centre to the middle of a wall).
export const CIRCUMRADIUS = WALL_WIDTH / (2 * Math.sin(Math.PI / SIDES))
export const INRADIUS = WALL_WIDTH / (2 * Math.tan(Math.PI / SIDES))

// ---- Colour ------------------------------------------------------------------

// The Adeptus Minor ritual's "rainbow scale" of the planets, and its
// colours of the signs.
export type PlanetId =
  'saturn' | 'jupiter' | 'mars' | 'sun' | 'venus' | 'mercury' | 'moon'

export interface Planet {
  id: PlanetId
  name: string
  glyph: string
  colorName: string
  color: string
}

export const VAULT_PLANETS: Record<PlanetId, Planet> = {
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    glyph: '♄\uFE0E',
    colorName: colorLabel(PLANET_COLORS.saturn),
    color: PALETTE[PLANET_COLORS.saturn],
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    glyph: '♃\uFE0E',
    colorName: colorLabel(PLANET_COLORS.jupiter),
    color: PALETTE[PLANET_COLORS.jupiter],
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    glyph: '♂\uFE0E',
    colorName: colorLabel(PLANET_COLORS.mars),
    color: PALETTE[PLANET_COLORS.mars],
  },
  sun: {
    id: 'sun',
    name: 'Sun',
    glyph: '☉\uFE0E',
    colorName: colorLabel(PLANET_COLORS.sun),
    color: PALETTE[PLANET_COLORS.sun],
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    glyph: '♀\uFE0E',
    colorName: colorLabel(PLANET_COLORS.venus),
    color: PALETTE[PLANET_COLORS.venus],
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    glyph: '☿\uFE0E',
    colorName: colorLabel(PLANET_COLORS.mercury),
    color: PALETTE[PLANET_COLORS.mercury],
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    glyph: '☽\uFE0E',
    colorName: colorLabel(PLANET_COLORS.moon),
    color: PALETTE[PLANET_COLORS.moon],
  },
}

const SIGN_COLOR = (id: keyof typeof SIGN_COLORS) => PALETTE[SIGN_COLORS[id]]
const SEPHIRAH_COLOR = (id: keyof typeof SEPHIRAH_COLORS) =>
  PALETTE[SEPHIRAH_COLORS[id]]
// Fire red, Water blue, Air yellow; Mercury blue, Sulphur red, Salt yellow.
// Earth, the ritual notes, is missing from the elements; the Ox of the
// Kerubim stands for it, in the dark of Malkuth.
const FORCE_COLOR = (id: keyof typeof ELEMENT_COLORS) =>
  PALETTE[ELEMENT_COLORS[id]]

// ---- The forty squares -------------------------------------------------------

// What a square is drawn with. Glyphs that fonts carry are given as text;
// the rest (the elements, the principles, the Spirit wheel and the Eagle)
// are drawn by hand, see components/vault/golden-dawn/.
export type Emblem =
  | { text: string; hebrew?: boolean }
  | {
      draw:
        | 'fire'
        | 'water'
        | 'air'
        | 'sulphur'
        | 'mercury'
        | 'salt'
        | 'spirit'
        | 'eagle'
    }

export type SquareKind =
  'spirit' | 'kerub' | 'principle' | 'element' | 'sephirah' | 'planet' | 'sign'

export interface Square {
  kind: SquareKind
  // What it stands for, for labels.
  name: string
  emblem: Emblem
  // The colour of the force in this square, before the wall's planet
  // tints it. Null for the Spirit, which stays white on every wall.
  force: string | null
  // For the planets' own squares: which planet, so that its wall can show
  // it unmixed.
  planet?: PlanetId
}

const S = (
  kind: SquareKind,
  name: string,
  emblem: Emblem,
  force: string | null,
  planet?: PlanetId,
): Square => ({ kind, name, emblem, force, planet })

// The glyphs carry U+FE0E so that fonts draw them as text, not emoji.
const sign = (id: keyof typeof SIGN_COLORS, name: string, glyph: string) =>
  S('sign', name, { text: glyph + '\uFE0E' }, SIGN_COLOR(id))
const kerub = (
  name: string,
  emblem: Emblem,
  element: keyof typeof ELEMENT_COLORS,
) => S('kerub', name, emblem, FORCE_COLOR(element))
const sephirah = (
  id: keyof typeof SEPHIRAH_COLORS,
  name: string,
  letter: string,
) => S('sephirah', name, { text: letter, hebrew: true }, SEPHIRAH_COLOR(id))
const planet = (id: PlanetId) =>
  S(
    'planet',
    VAULT_PLANETS[id].name,
    { text: VAULT_PLANETS[id].glyph },
    VAULT_PLANETS[id].color,
    id,
  )

// Eight ranks of five, top to bottom, left to right, as on the plate "The
// Wall of the Vault". The ten salient squares are the Sephiroth, each
// marked with the first letter of its name and laid out as the Tree of
// Life; each planet sits beside its own Sephirah. The four Kerubim run
// along the top in the order of the letters of the Name read in Hebrew.
// The twelve signs fill the 5th, 7th and 8th ranks: Kerubic, Cardinal and
// Mutable, in earthy, airy, watery and fiery columns.
export const WALL_SQUARES: Square[][] = [
  [
    kerub('Ox', { text: '♉\uFE0E' }, 'earth'),
    kerub('Man', { text: '♒\uFE0E' }, 'air'),
    S('spirit', 'Spirit', { draw: 'spirit' }, null),
    kerub('Eagle', { draw: 'eagle' }, 'water'),
    kerub('Lion', { text: '♌\uFE0E' }, 'fire'),
  ],
  [
    S('principle', 'Salt', { draw: 'salt' }, FORCE_COLOR('salt')),
    S('principle', 'Mercury', { draw: 'mercury' }, FORCE_COLOR('mercury')),
    sephirah('kether', 'Kether', 'כ'),
    S('element', 'Water', { draw: 'water' }, FORCE_COLOR('water')),
    S('element', 'Air', { draw: 'air' }, FORCE_COLOR('air')),
  ],
  [
    S('principle', 'Sulphur', { draw: 'sulphur' }, FORCE_COLOR('sulphur')),
    sephirah('binah', 'Binah', 'ב'),
    planet('saturn'),
    sephirah('chokmah', 'Chokmah', 'ח'),
    S('element', 'Fire', { draw: 'fire' }, FORCE_COLOR('fire')),
  ],
  [
    planet('mars'),
    sephirah('geburah', 'Geburah', 'ג'),
    planet('sun'),
    sephirah('chesed', 'Chesed', 'ח'),
    planet('jupiter'),
  ],
  [
    sign('taurus', 'Taurus', '♉'),
    sign('aquarius', 'Aquarius', '♒'),
    sephirah('tiphareth', 'Tiphareth', 'ת'),
    sign('scorpio', 'Scorpio', '♏'),
    sign('leo', 'Leo', '♌'),
  ],
  [
    planet('mercury'),
    sephirah('hod', 'Hod', 'ה'),
    planet('moon'),
    sephirah('netzach', 'Netzach', 'נ'),
    planet('venus'),
  ],
  [
    sign('capricorn', 'Capricorn', '♑'),
    sign('libra', 'Libra', '♎'),
    sephirah('yesod', 'Yesod', 'י'),
    sign('cancer', 'Cancer', '♋'),
    sign('aries', 'Aries', '♈'),
  ],
  [
    sign('virgo', 'Virgo', '♍'),
    sign('gemini', 'Gemini', '♊'),
    sephirah('malkuth', 'Malkuth', 'מ'),
    sign('pisces', 'Pisces', '♓'),
    sign('sagittarius', 'Sagittarius', '♐'),
  ],
]

// ---- The seven walls -----------------------------------------------------------

export interface Wall {
  index: number
  planet: Planet
  // Compass direction of the wall's centre, for the reader.
  bearing: string
  // The Venus wall carries the door.
  door: boolean
}

// "Take the planetary colours, arrange them in the order of the solar
// spectrum, bend the series into a ring and make the chain into a
// Heptagram, and turn the whole about until the two ends of the series
// meet at the Eastern point." So the East is a corner, with Mars (red) on
// one side of it and Jupiter (violet) on the other, and Venus (green) is
// the wall opposite, in the West, where the door is. The Chief Adept
// stands at the East facing the door, with Mars at his right hand and
// Jupiter at his left: Jupiter is therefore the wall to the south of the
// East corner, and the walls run on from it clockwise.
export const WALLS: Wall[] = (
  [
    ['jupiter', 'east-south-east'],
    ['saturn', 'south'],
    ['moon', 'south-west'],
    ['venus', 'west'],
    ['mercury', 'north-west'],
    ['sun', 'north'],
    ['mars', 'east-north-east'],
  ] as [PlanetId, string][]
).map(([id, bearing], index) => ({
  index,
  planet: VAULT_PLANETS[id],
  bearing,
  door: id === 'venus',
}))

// Where a wall stands. The East corner is at angle 0; walls follow it
// clockwise as seen from above. +X is east, +Z is south.
export function wallAngle(index: number): number {
  return ((index + 0.5) * 2 * Math.PI) / SIDES
}

export function cornerAngle(index: number): number {
  return (index * 2 * Math.PI) / SIDES
}

// ---- The colour of a square ----------------------------------------------------

function hex(color: string): [number, number, number] {
  const n = parseInt(color.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

function mix(a: string, b: string, t = 0.5): string {
  const x = hex(a)
  const y = hex(b)
  return toHex([
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t,
  ])
}

// The "flashing" complement: the opposite hue, lightness nudged the other
// way so the emblem stands out from its ground while staying a colour.
export function complement(color: string): string {
  const [r, g, b] = hex(color).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = (((h * 60) % 360) + 360) % 360
  }
  // The opposite hue, kept fully coloured: the lightness moves only as
  // far from the ground's as it needs to stand out, and never to the
  // white or black that would wash the hue out.
  const h2 = (h + 180) % 360
  const l2 = l > 0.5 ? Math.max(0.32, l - 0.28) : Math.min(0.68, l + 0.28)
  const s2 = Math.max(0.8, s)
  const c = (1 - Math.abs(2 * l2 - 1)) * s2
  const x = c * (1 - Math.abs(((h2 / 60) % 2) - 1))
  const m = l2 - c / 2
  const [r1, g1, b1] =
    h2 < 60
      ? [c, x, 0]
      : h2 < 120
        ? [x, c, 0]
        : h2 < 180
          ? [0, c, x]
          : h2 < 240
            ? [0, x, c]
            : h2 < 300
              ? [x, 0, c]
              : [c, 0, x]
  return toHex([(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255])
}

export interface PaintedSquare {
  square: Square
  ground: string
  ink: string
}

// "The ground colour is a compound of the colour of the Planet of the side
// tinting the colour of the Force to which the Square is allotted. Each
// side has the Square of its own planet in its own unmixed colour. The
// emblem colour is always complementary to the ground colour." And the
// Spirit square "is always depicted unchanged in black upon white".
export function paintSquare(square: Square, wall: Wall): PaintedSquare {
  if (square.force === null) {
    return { square, ground: PALETTE.white, ink: '#111111' }
  }
  const ground =
    square.planet === wall.planet.id
      ? wall.planet.color
      : mix(square.force, wall.planet.color, 0.5)
  return { square, ground, ink: complement(ground) }
}

export function paintWall(wall: Wall): PaintedSquare[][] {
  return WALL_SQUARES.map((rank) =>
    rank.map((square) => paintSquare(square, wall)),
  )
}

// ---- Ceiling, floor, altar ----------------------------------------------------------

// On the ceiling plate the planets sit in the compartments along the
// seven sides, by their walls, and the lower seven Sephiroth in the seven
// points of the heptagram, one at each corner: Chesed in the East point,
// and then round. The floor carries the averse Sephirah of each beneath
// it, so the two are listed together, corner by corner, clockwise from
// the East.
export const CORNERS: { sephirah: string; qlippah: string }[] = [
  { sephirah: 'חסד', qlippah: 'געשכלה' }, // Chesed · Gha'agsheblah
  { sephirah: 'מלכות', qlippah: 'לילית' }, // Malkuth · Lilith
  { sephirah: 'יסוד', qlippah: 'גמליאל' }, // Yesod · Gamaliel
  { sephirah: 'הוד', qlippah: 'סמאל' }, // Hod · Samael
  { sephirah: 'נצח', qlippah: 'ערב זרק' }, // Netzach · Harab Serapel
  { sephirah: 'תפארת', qlippah: 'תגרירון' }, // Tiphareth · Thagirion
  { sephirah: 'גבורה', qlippah: 'גולחב' }, // Geburah · Golachab
]

// The Supernals on the ceiling's triangle (Kether at the East apex,
// Chokmah to the south, Binah to the north) and their averse forms on the
// floor's inverted triangle.
export const SUPERNALS = [
  { sephirah: 'כתר', qlippah: 'תאומיאל' }, // Kether · Thaumiel
  { sephirah: 'חכמה', qlippah: 'עוגיאל' }, // Chokmah · Ghogiel
  { sephirah: 'בינה', qlippah: 'סתריאל' }, // Binah · Satariel
]

// The 22 letters on the petals of the Rose: three Mothers, seven Doubles,
// twelve Simples, from the centre outward.
export const ROSE_PETALS = [
  ['א', 'מ', 'ש'],
  ['ב', 'ג', 'ד', 'כ', 'פ', 'ר', 'ת'],
  ['ה', 'ו', 'ז', 'ח', 'ט', 'י', 'ל', 'נ', 'ס', 'ע', 'צ', 'ק'],
]

// A word on one of the altar's rim tracks: its angle clockwise from the
// head, and whether it is written to be read from the far side.
export interface RimWord {
  text: string
  angle: number
  inverted?: boolean
}

export const ALTAR = {
  // The white rim is divided by a thin line into two tracks, with the
  // words placed round them as the plate has them: angle clockwise from
  // the head (the East), in degrees. Every word runs clockwise with its
  // feet toward the centre, so those at the foot read upside-down from
  // the door, as on the plate.
  outer: [
    { text: 'A.C.R.C. — A.G.R.C.', angle: 0 },
    { text: 'HOC', angle: 55 },
    { text: 'UNIVERSI', angle: 95 },
    { text: 'COMPENDIUM', angle: 135 },
    { text: 'UNIUS', angle: 180 },
    { text: 'MIHI', angle: 225 },
    { text: 'SEPULCHRUM', angle: 270 },
    { text: 'FECI', angle: 320 },
  ] as RimWord[],
  inner: [
    { text: 'יהשוה', angle: 0 },
    { text: 'MIHI', angle: 160 },
    { text: 'OMNIA', angle: 205 },
  ] as RimWord[],
  // The four Kerubim in circles, each with its letter of the Name and its
  // sentence: Lion at the head (East), then clockwise Ox, Man, Eagle, as
  // on the plate.
  kerubim: [
    { letter: 'י', name: 'Lion', glyph: '♌\uFE0E', text: 'NEQUAQUAM VACUUM' },
    { letter: 'ה', name: 'Ox', glyph: '♉\uFE0E', text: 'LEGIS JUGUM' },
    { letter: 'ו', name: 'Man', glyph: '♒\uFE0E', text: 'DEI GLORIA INTACTA' },
    {
      letter: 'ה',
      name: 'Eagle',
      glyph: '♏\uFE0E',
      text: 'LIBERTAS EVANGELII',
    },
  ],
  // "And in the midst of all is Shin, the Letter of the Spirit."
  centre: 'ש',
  radius: 1.5,
  height: 3,
}

// The Pastos, the coffin of C.R.C., lies under the altar with its head to
// the East. The ritual gives its painting but not its size: these are
// assumptions, long enough and wide enough for a man to lie in.
export const PASTOS = {
  length: 6.5,
  width: 2,
  height: 1.5,
  lid: 0.15,
}

// On the door.
export const DOOR_INSCRIPTION = 'POST CXX ANNOS PATEBO'

// ---- Designs ----------------------------------------------------------------------

export type VaultDesignId = 'golden-dawn' | 'pansophic'

interface VaultDesign {
  id: VaultDesignId
  name: string
  // For narrow screens.
  shortName: string
}

export const DESIGNS: VaultDesign[] = [
  // The Vault of the Adepti of the Adeptus Minor grade, after Regardie's
  // The Golden Dawn (1938).
  { id: 'golden-dawn', name: 'Golden Dawn', shortName: 'GD' },
  // A draft: the tomb as the Fama describes it, read after Rafał Prinke's
  // reconstruction: a memory theatre after Giulio Camillo's, each wall a
  // Tree of Life, the altar Franckenberg's Tabula Universalis. What fills
  // the squares and triangles is not yet known.
  { id: 'pansophic', name: 'Pansophic', shortName: 'Pan' },
]
