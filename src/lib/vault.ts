// The Vault of the Adepti: the seven-sided tomb of Christian Rosenkreuz as
// the Golden Dawn built it for the Adeptus Minor grade. Everything here is
// taken from the Second Order papers -- the 4=7 and 5=6 rituals, the
// Consecration of the Adepts' Vault, and the papers on building and
// furnishing it (walls, floor, ceiling, Pastos, circular altar, Cross of
// Obligation, exterior door, and the Day C checklist) -- with Regardie's
// The Golden Dawn, vol. 2 (1938) behind them. Where the two differ the
// papers are followed, and the comment says so.
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

// ---- Case's ten squares ----------------------------------------------------

// "Paul also chose to 'part each wall into ten squares' as described in
// the Fama rather than into forty squares" (Zalewski, introduction to The
// True and Invisible Rosicrucian Order, 2012). The Fama: "Every side or
// wall is parted into ten squares, every one with their several figures
// and sentences."
//
// What the ten hold is the table the papers give for the Case vault,
// read across and then down -- five rows of two, hung as "lamented
// posters with words and images associated with the wall's planet and
// sephiroth":
//
//     Divine Name                | Archangel
//     The Order of Angels        | The Palace of Assiah
//     The Planetary Symbol       | Hebrew letter & Sephirah
//     Kamea                      | Seal of Planet
//     Zodiacal Exaltation,       | Intelligence and Spirit
//       Church of Assiah &       |   of Planet
//       Zodiacal Rulership       |
//
// Case keeps the forty, but as the wall's area rather than its parts:
// "Every side of the Vault is 5 x 8 feet. Thus the number of square feet
// in every side is 40, the number of the letter Mem" (The True and
// Invisible Rosicrucian Order, ch. 3).
export type CaseSquareKind =
  | 'divineName'
  | 'archangel'
  | 'angels'
  | 'palace'
  | 'glyph'
  | 'letterSephirah'
  | 'kamea'
  | 'seal'
  | 'zodiac'
  | 'intelligence'

export interface CaseSquare {
  kind: CaseSquareKind
  title: string
}

export const CASE_SQUARES: CaseSquare[] = [
  { kind: 'divineName', title: 'Divine Name' },
  { kind: 'archangel', title: 'Archangel' },
  { kind: 'angels', title: 'The Order of Angels' },
  { kind: 'palace', title: 'The Palace of Assiah' },
  { kind: 'glyph', title: 'The Planetary Symbol' },
  { kind: 'letterSephirah', title: 'Hebrew Letter & Sephirah' },
  { kind: 'kamea', title: 'Kamea' },
  { kind: 'seal', title: 'Seal of the Planet' },
  { kind: 'zodiac', title: 'Exaltation, Church & Rulership' },
  { kind: 'intelligence', title: 'Intelligence & Spirit' },
]

// What each wall's planet puts in those squares.
//
// The Divine Name and the Archangel are the pairs the Consecration of the
// Adepts' Vault invokes, wall by wall ("Moon -- SHADDAI EL CHAI --
// GABRIEL", and so on). The Sephirah, its letter and the planet's glyph
// are the Order's own. The Kamea is the planet's magic square, of side 3
// for Saturn up to 9 for the Moon.
//
// The Order of Angels, the Palace of Assiah, the Seal of the Planet, the
// zodiacal square and the Intelligence and Spirit are named by the papers
// but not filled in by them. Rather than put in correspondences from
// nowhere, those squares are drawn with their titles and left empty, as
// the Pansophic design leaves what the Fama does not say.
export interface PlanetLore {
  sephirah: string
  sephirahHebrew: string
  // The Hebrew letter whose path carries the planet, and its name.
  letter: string
  letterName: string
  divineName: string
  // The same name in Hebrew. The Consecration speaks these aloud and so
  // gives them in Roman letters only; the Hebrew is from the lessons that
  // treat each Sephirah, which give the gematria too, so every spelling
  // here has been checked against the number its lesson states.
  divineNameHebrew: string
  archangel: string
  archangelHebrew: string
  // The Choir of Angels of the planet's Sephirah, from the per-Sephirah
  // lessons of the Oracle of Tarot (36-44). Each gives the choir's
  // gematria, and the spelling below sums to it.
  choir: string
  choirHebrew: string
  // The Sphere of Assiah, from "The Ten Palaces of Assiah" in Zelator 1.
  palace: string
  palaceHebrew: string
  // The Church in Asia -- that is, in Assiah -- from the same lesson's
  // table of the Seven Churches, repeated in Zelator 13.
  church: string
  // Rulership and exaltation, from the table in Practical Astrology 15,
  // as sign names; SIGN_GLYPH turns them into the signs themselves.
  rules: string[]
  exalted: string[]
  // The Intelligence and Spirit of the planet, from The Gematria
  // Notebooks of Paul Foster Case, which name all but one of the
  // fourteen. The Notebooks file each entry under its number, so every
  // spelling below has been checked against the section it stands in:
  // Agiel and Zazel at 45, Hismael and Yophiel at 136, Graphiel and
  // Bartzbel at 325 ("the magic line of Mars"), Nakiel at 111 and Sorath
  // at 666, Hagiel at 49 and Kadmael at 175, Tiriel at 260 ("constant
  // summation of the Magic Square of Mercury"), Chasmodai at 369. Five
  // of those numbers are the planet's own Kamea.
  //
  // Note Jupiter: Case gives Hismael as the Intelligence and Yophiel as
  // the Spirit, which is the other way about from Agrippa. This is the
  // Case vault, so Case is followed.
  //
  // The Moon's Intelligence is a sentence rather than a name -- "Queen
  // among the Tarshishim forever, in the spirit of the Dawning (Ones)"
  // -- and the Notebooks warn that "in all printed texts, the Hebrew is
  // corrupt... Some of the printed versions add up correctly, but the
  // words make no sense." The spelling below is the Notebooks' own,
  // taken there from a manuscript source, and it reconstructs to both
  // the numbers they file it under: 3321 counting final Mem as 600, as
  // that section says to, and 2201 counting it as 40, which is the value
  // their cross-reference gives.
  intelligence?: string
  intelligenceHebrew?: string
  spirit?: string
  spiritHebrew?: string
  kamea: number[][]
}

// The Magic Line of a planet: "derived, as our diagram illustrates, by
// joining the consecutive numbers in the Magic Square" (Practicus 4, on
// Mercury). Joining 1 to 2 to 3 and so on to the last cell traces the
// figure the sigils are drawn from, so the seal is computed from the
// kamea rather than copied from a plate.
//
// Returns the cell of each number in turn as [column, row], counting from
// the top left, so a caller can scale them into a square of any size.
export function magicLine(kamea: number[][]): [number, number][] {
  const n = kamea.length
  const cells: [number, number][] = new Array(n * n)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const value = kamea[r][c]
      if (value < 1 || value > n * n) {
        throw new Error(`kamea holds ${value}, outside 1..${n * n}`)
      }
      cells[value - 1] = [c, r]
    }
  }
  return cells
}

// The twelve signs by name, for the squares that name a sign rather than
// draw one.
export const SIGN_GLYPH: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264a',
  Cancer: '\u264b',
  Leo: '\u264c',
  Virgo: '\u264d',
  Libra: '\u264e',
  Scorpio: '\u264f',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
}

// A number as Hebrew letters. The Order's own Kameas are written this
// way -- the Kamea of the Moon is "composed of 81 lesser squares, or
// cells, containing various combinations of Hebrew letters representing
// the numbers from 1 to 81" -- so a wall with no English on it writes
// them so too.
//
// Hundreds, then tens, then units, largest first, except that 15 and 16
// are written 9+6 and 9+7 rather than 10+5 and 10+6, which would spell
// the divine name. The papers' own table happens to print the letters of
// each cell the other way about, smallest first; that reverses no value,
// since the letters are simply added, and reads as a transcription of
// what the plate looks like rather than a different numbering.
const HEBREW_UNITS = '\u05d0\u05d1\u05d2\u05d3\u05d4\u05d5\u05d6\u05d7\u05d8'
const HEBREW_TENS = '\u05d9\u05db\u05dc\u05de\u05e0\u05e1\u05e2\u05e4\u05e6'
const HEBREW_HUNDREDS = '\u05e7\u05e8\u05e9\u05ea'

export function hebrewNumeral(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 499) {
    throw new Error(`no Hebrew numeral for ${n}`)
  }
  let out = ''
  let left = n
  while (left >= 100) {
    const take = Math.min(4, Math.floor(left / 100))
    out += HEBREW_HUNDREDS[take - 1]
    left -= take * 100
  }
  // Fifteen and sixteen are the two exceptions, written 9+6 and 9+7.
  if (left === 15 || left === 16) {
    return out + HEBREW_UNITS[8] + HEBREW_UNITS[left - 15 + 5]
  }
  const tens = Math.floor(left / 10)
  if (tens > 0) out += HEBREW_TENS[tens - 1]
  const units = left % 10
  if (units > 0) out += HEBREW_UNITS[units - 1]
  return out
}

export const PLANET_LORE: Record<PlanetId, PlanetLore> = {
  saturn: {
    sephirah: 'Binah',
    sephirahHebrew: '\u05d1\u05d9\u05e0\u05d4',
    letter: '\u05ea',
    letterName: 'Tav',
    divineName: 'ELOHIM',
    divineNameHebrew: '\u05d0\u05dc\u05d4\u05d9\u05dd',
    archangel: 'TZAPHQIEL',
    archangelHebrew: '\u05e6\u05e4\u05e7\u05d9\u05d0\u05dc',
    choir: 'Aralim',
    choirHebrew: '\u05d0\u05e8\u05d0\u05dc\u05d9\u05dd',
    palace: 'Shabbathai',
    palaceHebrew: '\u05e9\u05d1\u05ea\u05d0\u05d9',
    church: 'Ephesus',
    rules: ['Capricorn', 'Aquarius'],
    exalted: ['Libra'],
    intelligence: 'Agiel',
    intelligenceHebrew: '\u05d0\u05d2\u05d9\u05d0\u05dc',
    spirit: 'Zazel',
    spiritHebrew: '\u05d6\u05d6\u05d0\u05dc',
    kamea: [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6],
    ],
  },
  jupiter: {
    sephirah: 'Chesed',
    sephirahHebrew: '\u05d7\u05e1\u05d3',
    letter: '\u05db',
    letterName: 'Kaph',
    divineName: 'EL',
    divineNameHebrew: '\u05d0\u05dc',
    archangel: 'TZADKIEL',
    archangelHebrew: '\u05e6\u05d3\u05e7\u05d9\u05d0\u05dc',
    choir: 'Chasmalim',
    choirHebrew: '\u05d7\u05e9\u05de\u05dc\u05d9\u05dd',
    palace: 'Tzedek',
    palaceHebrew: '\u05e6\u05d3\u05e7',
    church: 'Pergamos',
    rules: ['Sagittarius', 'Pisces'],
    exalted: ['Cancer'],
    intelligence: 'Hismael',
    intelligenceHebrew: '\u05d4\u05e1\u05de\u05d0\u05dc',
    spirit: 'Yophiel',
    spiritHebrew: '\u05d9\u05d4\u05e4\u05d9\u05d0\u05dc',
    kamea: [
      [4, 14, 15, 1],
      [9, 7, 6, 12],
      [5, 11, 10, 8],
      [16, 2, 3, 13],
    ],
  },
  mars: {
    sephirah: 'Geburah',
    sephirahHebrew: '\u05d2\u05d1\u05d5\u05e8\u05d4',
    letter: '\u05e4',
    letterName: 'Peh',
    divineName: 'ELOHIM GIBOR',
    divineNameHebrew: '\u05d0\u05dc\u05d4\u05d9\u05dd \u05d2\u05d1\u05d5\u05e8',
    archangel: 'KAMAEL',
    archangelHebrew: '\u05db\u05de\u05d0\u05dc',
    choir: 'Seraphim',
    choirHebrew: '\u05e9\u05e8\u05e4\u05d9\u05dd',
    palace: 'Madim',
    palaceHebrew: '\u05de\u05d0\u05d3\u05d9\u05dd',
    church: 'Smyrna',
    rules: ['Aries', 'Scorpio'],
    exalted: ['Capricorn'],
    intelligence: 'Graphiel',
    intelligenceHebrew: '\u05d2\u05e8\u05d0\u05e4\u05d9\u05d0\u05dc',
    spirit: 'Bartzbel',
    spiritHebrew: '\u05d1\u05e8\u05e6\u05d1\u05d0\u05dc',
    kamea: [
      [11, 24, 7, 20, 3],
      [4, 12, 25, 8, 16],
      [17, 5, 13, 21, 9],
      [10, 18, 1, 14, 22],
      [23, 6, 19, 2, 15],
    ],
  },
  sun: {
    sephirah: 'Tiphareth',
    sephirahHebrew: '\u05ea\u05e4\u05d0\u05e8\u05ea',
    letter: '\u05e8',
    letterName: 'Resh',
    divineName: 'IHVH ELOAH VA-DAATH',
    divineNameHebrew:
      '\u05d9\u05d4\u05d5\u05d4 \u05d0\u05dc\u05d5\u05d4 \u05d5\u05d3\u05e2\u05ea',
    archangel: 'MICHAEL',
    archangelHebrew: '\u05de\u05d9\u05db\u05d0\u05dc',
    choir: 'Melakim',
    choirHebrew: '\u05de\u05dc\u05db\u05d9\u05dd',
    palace: 'Shemesh',
    palaceHebrew: '\u05e9\u05de\u05e9',
    church: 'Thyatira',
    rules: ['Leo'],
    exalted: ['Aries'],
    intelligence: 'Nakiel',
    intelligenceHebrew: '\u05e0\u05db\u05d9\u05d0\u05dc',
    spirit: 'Sorath',
    spiritHebrew: '\u05e1\u05d5\u05e8\u05ea',
    kamea: [
      [6, 32, 3, 34, 35, 1],
      [7, 11, 27, 28, 8, 30],
      [19, 14, 16, 15, 23, 24],
      [18, 20, 22, 21, 17, 13],
      [25, 29, 10, 9, 26, 12],
      [36, 5, 33, 4, 2, 31],
    ],
  },
  venus: {
    sephirah: 'Netzach',
    sephirahHebrew: '\u05e0\u05e6\u05d7',
    letter: '\u05d3',
    letterName: 'Daleth',
    divineName: 'IHVH TZABAOTH',
    divineNameHebrew: '\u05d9\u05d4\u05d5\u05d4 \u05e6\u05d1\u05d0\u05d5\u05ea',
    archangel: 'HANIEL',
    archangelHebrew: '\u05d4\u05d0\u05e0\u05d9\u05d0\u05dc',
    choir: 'Elohim',
    choirHebrew: '\u05d0\u05dc\u05d4\u05d9\u05dd',
    palace: 'Nogah',
    palaceHebrew: '\u05e0\u05d5\u05d2\u05d4',
    church: 'Sardis',
    rules: ['Taurus', 'Libra'],
    exalted: ['Pisces'],
    intelligence: 'Hagiel',
    intelligenceHebrew: '\u05d4\u05d9\u05d2\u05d0\u05dc',
    spirit: 'Kadmael',
    spiritHebrew: '\u05e7\u05d3\u05de\u05d0\u05dc',
    kamea: [
      [22, 47, 16, 41, 10, 35, 4],
      [5, 23, 48, 17, 42, 11, 29],
      [30, 6, 24, 49, 18, 36, 12],
      [13, 31, 7, 25, 43, 19, 37],
      [38, 14, 32, 1, 26, 44, 20],
      [21, 39, 8, 33, 2, 27, 45],
      [46, 15, 40, 9, 34, 3, 28],
    ],
  },
  mercury: {
    sephirah: 'Hod',
    sephirahHebrew: '\u05d4\u05d5\u05d3',
    letter: '\u05d1',
    letterName: 'Beth',
    divineName: 'ELOHIM TZABAOTH',
    divineNameHebrew:
      '\u05d0\u05dc\u05d4\u05d9\u05dd \u05e6\u05d1\u05d0\u05d5\u05ea',
    archangel: 'RAPHAEL',
    archangelHebrew: '\u05e8\u05e4\u05d0\u05dc',
    choir: 'Beni Elohim',
    choirHebrew: '\u05d1\u05e0\u05d9 \u05d0\u05dc\u05d4\u05d9\u05dd',
    palace: 'Kokab',
    palaceHebrew: '\u05db\u05d5\u05db\u05d1',
    church: 'Laodicea',
    rules: ['Gemini', 'Virgo'],
    exalted: ['Virgo', 'Aquarius'],
    intelligence: 'Tiriel',
    intelligenceHebrew: '\u05d8\u05d9\u05e8\u05d9\u05d0\u05dc',
    spirit: 'Taphthartharath',
    spiritHebrew: '\u05ea\u05e4\u05ea\u05e8\u05ea\u05e8\u05ea',
    kamea: [
      [8, 58, 59, 5, 4, 62, 63, 1],
      [49, 15, 14, 52, 53, 11, 10, 56],
      [41, 23, 22, 44, 45, 19, 18, 48],
      [32, 34, 35, 29, 28, 38, 39, 25],
      [40, 26, 27, 37, 36, 30, 31, 33],
      [17, 47, 46, 20, 21, 43, 42, 24],
      [9, 55, 54, 12, 13, 51, 50, 16],
      [64, 2, 3, 61, 60, 6, 7, 57],
    ],
  },
  moon: {
    sephirah: 'Yesod',
    sephirahHebrew: '\u05d9\u05e1\u05d5\u05d3',
    letter: '\u05d2',
    letterName: 'Gimel',
    divineName: 'SHADDAI EL CHAI',
    divineNameHebrew: '\u05e9\u05d3\u05d9 \u05d0\u05dc \u05d7\u05d9',
    archangel: 'GABRIEL',
    archangelHebrew: '\u05d2\u05d1\u05e8\u05d9\u05d0\u05dc',
    choir: 'Kerabim',
    choirHebrew: '\u05db\u05e8\u05d1\u05d9\u05dd',
    palace: 'Levanah',
    palaceHebrew: '\u05dc\u05d1\u05e0\u05d4',
    church: 'Philadelphia',
    rules: ['Cancer'],
    exalted: ['Taurus'],
    intelligence: 'Malka be-Tarshishim ad be-Ruach Shacharim',
    intelligenceHebrew:
      '\u05de\u05dc\u05db\u05d0 \u05d1\u05ea\u05e8\u05e9\u05d9\u05e9\u05d9\u05dd \u05e2\u05d3 \u05d1\u05e8\u05d5\u05d7 \u05e9\u05d7\u05e8\u05d9\u05dd',
    spirit: 'Chasmodai',
    spiritHebrew: '\u05d7\u05e9\u05de\u05d5\u05d3\u05d0\u05d9',
    kamea: [
      [37, 78, 29, 70, 21, 62, 13, 54, 5],
      [6, 38, 79, 30, 71, 22, 63, 14, 46],
      [47, 7, 39, 80, 31, 72, 23, 55, 15],
      [16, 48, 8, 40, 81, 32, 64, 24, 56],
      [57, 17, 49, 9, 41, 73, 33, 65, 25],
      [26, 58, 18, 50, 1, 42, 74, 34, 66],
      [67, 27, 59, 10, 51, 2, 43, 75, 35],
      [36, 68, 19, 60, 11, 52, 3, 44, 76],
      [77, 28, 69, 20, 61, 12, 53, 4, 45],
    ],
  },
}

// ---- The seven walls -----------------------------------------------------------

export interface Wall {
  index: number
  planet: Planet
  // Compass direction of the wall's centre, for the reader.
  bearing: string
  // The Venus wall carries the door.
  door: boolean
}

// The planets are placed by the Seven Branched Candlestick, not by the
// spectrum. Lay the lamps out as a line --
//
//     Saturn  Jupiter  Mars  [Sun]  Venus  Mercury  Moon
//
// -- bend it into a ring so that its two ends, Saturn and Moon, meet at a
// corner, and turn the whole about until Venus, which is the door, stands
// due West. The Sun, the middle lamp, then stands opposite that corner,
// and the East is a corner too, with Jupiter to the north of it and
// Saturn to the south.
//
// Read the ring the other way and it is the order the Consecration walks
// the walls in: "turns to each panel and performs the applicable
// Heptagram, starting with the Moon ... after completing the circle" --
// Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn, one wall after the
// next. The three diagrams hung inside name their corners by the same
// arrangement: the Mountain of Abiegnus due east, "where the Jupiter and
// Saturn walls meet".
//
// Regardie's rule gives another placement, the planetary colours in the
// order of the solar spectrum bent into a ring and turned until its two
// ends -- Mars and Jupiter -- meet at the Eastern point. Case "decided
// the placement of the vault walls were not correct and chose to
// substitute the arrangement based on the 'Seven Branched Candlestick'
// for the 'ROYGBIV' of the Order of the Golden Dawn vault" (Zalewski,
// introduction to The True and Invisible Rosicrucian Order, 2012), and
// the Second Order papers draw it his way.
// Regardie's placement, kept for the design that bears his name: the
// planetary colours in the order of the solar spectrum, bent into a ring
// and turned until the two ends of the series -- Mars, red, and Jupiter,
// violet -- meet at the Eastern point. Venus is the door in both.
const SPECTRUM: [PlanetId, string][] = [
  ['jupiter', 'east-south-east'],
  ['saturn', 'south'],
  ['moon', 'south-west'],
  ['venus', 'west'],
  ['mercury', 'north-west'],
  ['sun', 'north'],
  ['mars', 'east-north-east'],
]

// Case's placement, by the candlestick.
const CANDLESTICK: [PlanetId, string][] = [
  ['saturn', 'east-south-east'],
  ['moon', 'south'],
  ['mercury', 'south-west'],
  ['venus', 'west'],
  ['sun', 'north-west'],
  ['mars', 'north'],
  ['jupiter', 'east-north-east'],
]

const seat = (order: [PlanetId, string][]): Wall[] =>
  order.map(([id, bearing], index) => ({
    index,
    planet: VAULT_PLANETS[id],
    bearing,
    door: id === 'venus',
  }))

export const SPECTRUM_WALLS = seat(SPECTRUM)
export const CANDLESTICK_WALLS = seat(CANDLESTICK)

// Which seven walls a design stands up. The Pansophic design paints no
// planets on its walls, so the placement is immaterial there; it takes
// Case's so that the door falls where the other two put it.
export function wallsOf(design: VaultDesignId): Wall[] {
  return design === 'regardie' ? SPECTRUM_WALLS : CANDLESTICK_WALLS
}

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

// ---- The three diagrams -------------------------------------------------------------

// The three drawings: "Where the Saturn and Moon wall meet is Miniature
// World or Tree of Life, mounted to a black poster board. The Mountain of
// the Philosopher's image is due east, where the Jupiter and Saturn walls
// meet. Where the Mars and Jupiter wall meet is the serpent coiled around
// the Tree of Life mounted to a black poster board."
//
// Each starts across the seam where its two walls meet, bisecting the
// corner. A board hung flat on one wall would cover a foot and a half of
// that wall alone; across the seam it takes about eight inches from each,
// and leaves both readable. Either way it covers something -- the walls
// are hung with posters floor to ceiling and there is nowhere in a Vault
// for a board to go that is not in front of something -- so each can be
// taken down on its own, and moved round the walls to see what is under
// it (see wallReach for how it hangs wherever it is put).

// The three are named so that each can be taken down on its own.
export type DiagramId = 'abiegnus' | 'minutum-mundum' | 'sword-serpent'

export interface Diagram {
  id: DiagramId
  name: string
  // The name on its own, for a button that puts it back.
  short: string
  // The corner it hangs in, counted as cornerAngle() counts them from the
  // East.
  corner: number
  src: string
  // The plate's own proportions, width over height, measured from the
  // file. The board is cut to the plate, so this sets its shape.
  aspect: number
}

export const DIAGRAMS: Diagram[] = [
  {
    id: 'abiegnus',
    short: 'Mountain of Abiegnus',
    name: 'The Mountain of Abiegnus',
    // Due east, where the Jupiter and Saturn walls meet.
    corner: 0,
    src: '/vault/diagram-abiegnus.png',
    aspect: 611 / 981,
  },
  {
    id: 'minutum-mundum',
    short: 'Minutum Mundum',
    name: 'The Minutum Mundum',
    // Where the Saturn and Moon walls meet.
    corner: 1,
    src: '/vault/diagram-minutum-mundum.png',
    aspect: 541 / 1087,
  },
  {
    id: 'sword-serpent',
    short: 'Sword and Serpent',
    name: 'The Sword and the Serpent',
    // Where the Mars and Jupiter walls meet.
    corner: 6,
    src: '/vault/diagram-sword-serpent.png',
    aspect: 753 / 1134,
  },
]

// A poster board is 22 by 28 inches and these hang portrait, so 28 inches
// sets the height. The board is then cut to the plate rather than left
// full width: a plate mounted on an uncut board carries four inches of
// black down either side, and every inch of that is a square it hides for
// nothing.
export const POSTER_HEIGHT = 28 / 12

// What is left of the board around the plate, feet. Half an inch: enough
// edge to read as a board mounted on the wall rather than a picture
// painted on it, and no more, because every inch of it stands in front of
// a square. It is a fixed width rather than a part of the board, so that
// the narrow plate does not end up framed more heavily than the wide one.
export const DIAGRAM_MOUNT = 0.5 / 12

// The width of one board, cut to its plate.
export function boardWidth(diagram: Diagram): number {
  return (
    (POSTER_HEIGHT - 2 * DIAGRAM_MOUNT) * diagram.aspect + 2 * DIAGRAM_MOUNT
  )
}

// How high off the floor the middle of a board sits to begin with, feet.
export const DIAGRAM_CENTRE = 4.4

// The gap a board keeps off whatever it hangs against: a quarter of an
// inch, enough that it reads as a board on the wall and not as paint.
export const DIAGRAM_GAP = 0.25 / 12

// How far from the middle of the room a board of half-width `half` can
// hang, facing the middle along `angle`, before any part of it comes
// within `gap` of a wall. Against the flat of a wall that is the wall
// itself; across a seam the board has to stand out into the room far
// enough for its ends to clear both walls, which is why a board in a
// corner is further in than one on a wall.
export function wallReach(angle: number, half: number, gap: number): number {
  const limit = INRADIUS - gap
  // Out along the board's own radial, and across the board's width.
  const ux = Math.cos(angle)
  const uz = Math.sin(angle)
  const tx = -uz
  const tz = ux
  let reach = Infinity
  for (let i = 0; i < SIDES; i++) {
    const a = wallAngle(i)
    const nx = Math.cos(a)
    const nz = Math.sin(a)
    const toward = ux * nx + uz * nz
    if (toward <= 1e-9) continue // this wall is behind the board
    const across = tx * nx + tz * nz
    for (const end of [half, -half]) {
      reach = Math.min(reach, (limit - end * across) / toward)
    }
  }
  return Math.max(0, reach)
}

// Where a board hangs: the angle round the room and the height of its
// middle, kept against the walls and clear of the floor and the ceiling.
// `reach` is how far out from the middle of the room that leaves it.
export function diagramPlace(
  diagram: Diagram,
  angle: number,
  y: number,
): { angle: number; y: number; reach: number } {
  const rise = POSTER_HEIGHT / 2 + DIAGRAM_GAP
  const turn =
    ((((angle + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
    Math.PI
  return {
    angle: turn,
    y: Math.min(WALL_HEIGHT - rise, Math.max(rise, y)),
    reach: wallReach(turn, boardWidth(diagram) / 2, DIAGRAM_GAP),
  }
}

// Where a ray cast from inside the room meets a wall, as the angle round
// the room and the height up it, or null for a ray that meets none. The
// room is convex, so the wall the ray leaves by is simply the nearest of
// the seven it runs towards -- no need to ask which wall is which.
export function wallPoint(
  from: { x: number; y: number; z: number },
  along: { x: number; y: number; z: number },
): { angle: number; y: number } | null {
  let t = Infinity
  for (let i = 0; i < SIDES; i++) {
    const a = wallAngle(i)
    const nx = Math.cos(a)
    const nz = Math.sin(a)
    const toward = along.x * nx + along.z * nz
    if (toward <= 1e-9) continue
    const d = (INRADIUS - (from.x * nx + from.z * nz)) / toward
    if (d > 0 && d < t) t = d
  }
  if (!Number.isFinite(t)) return null
  return {
    angle: Math.atan2(from.z + t * along.z, from.x + t * along.x),
    y: from.y + t * along.y,
  }
}

// ---- Ceiling, floor, altar ----------------------------------------------------------

// The lower seven Sephiroth, clockwise from the East.
//
// The ceiling plate in the papers letters these along the boards starting
// Malkuth at the East, which is one step round from the floor plate -- and
// the papers themselves call the floor and ceiling "reflections of each
// other", so one of the two is miscopied. Case settles it. Figure 4 of
// The True and Invisible Rosicrucian Order (4th ed., 1985, p. 126) is a
// diagram of this ceiling, and numbers the heptagram's points 4 at the
// East corner, then 10, 9, 8, 7, 6, 5 round to it again: Chesed first and
// Malkuth beside it. That is the floor plate's order exactly, so the
// floor is right and the ceiling plate is the miscopy. Both surfaces now
// follow it, and the two are reflections as the text says they are.
export const CEILING_BOARDS: string[] = [
  'חסד', // Chesed
  'מלכות', // Malkuth
  'יסוד', // Yesod
  'הוד', // Hod
  'נצח', // Netzach
  'תפארת', // Tiphareth
  'גבורה', // Geburah
]

export const FLOOR_POINTS: string[] = [
  'געשכלה', // Gha'agsheblah, averse Chesed
  'לילית', // Lilith, averse Malkuth
  'גמליאל', // Gamaliel, averse Yesod
  'סמאל', // Samael, averse Hod
  'ערב זרק', // Harab Serapel, averse Netzach
  'תגרירון', // Thagirion, averse Tiphareth
  'גולחב', // Golachab, averse Geburah
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

// The Pastos, the coffin of C.R.C., which stands in the middle of the
// floor with its head to the East and the circular altar on its lid.
// "The coffin is 6 feet long and 24 inches on each side. This is a triple
// cube." Its long sides are built an inch taller than its ends, so that
// air passes under the lid; the lid itself laps half an inch beyond the
// sides and further at head and foot, to hide the slits. Units are feet.
export const PASTOS = {
  length: 6,
  width: 2,
  height: 2,
  lid: 0.15,
  // How far the lid laps past the box: a little at the sides, more at the
  // head and foot.
  lidSide: 0.5 / 12,
  lidEnd: 1.5 / 12,
  // The long sides stand this much above the ends, for the air slits.
  vent: 1 / 12,
}

// The depth of the altar's drum under its painted top.
const ALTAR_DEPTH = 0.5

export const ALTAR = {
  // The white rim is divided by a thin line into two tracks, with the
  // words placed round them as the plate has them: angle clockwise from
  // the head (the East), in degrees. Every word runs clockwise with its
  // feet toward the centre, so those at the foot read upside-down from
  // the door, as on the plate.
  outer: [
    { text: 'A.G.R.C. — A.C.R.G.', angle: 0 },
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
  // The four Kerubim in circles, each with its letter of the Name, its
  // sentence, and the flashing pair it is painted in: the beast and its
  // wreath stand in the complement of their ground. Lion at the head
  // (East), then clockwise Ox, Man, Eagle, as on the plate. The grounds
  // are named by the implements set on them: "Water Cup of Blue Circle,
  // Air Dagger of Yellow Circle, Candle on Red Circle, Long Chain on
  // Black Circle."
  kerubim: [
    {
      letter: 'י',
      name: 'Lion',
      glyph: '♌\uFE0E',
      text: 'NEQUAQUAM VACUUM',
      ground: PALETTE.scarlet,
      figure: PALETTE.emerald,
    },
    {
      letter: 'ה',
      name: 'Ox',
      glyph: '♉\uFE0E',
      text: 'LEGIS JUGUM',
      ground: PALETTE.black,
      figure: PALETTE.white,
    },
    {
      letter: 'ו',
      name: 'Man',
      glyph: '♒\uFE0E',
      text: 'DEI GLORIA INTACTA',
      ground: PALETTE.yellow,
      figure: PALETTE.violet,
    },
    {
      letter: 'ה',
      name: 'Eagle',
      glyph: '♏\uFE0E',
      text: 'LIBERTAS EVANGELII',
      ground: PALETTE.blue,
      figure: PALETTE.orange,
    },
  ],
  // "And in the midst of all is Shin, the Letter of the Spirit."
  centre: 'ש',
  // "The altar top is cabinet-grade plywood about two and a half to three
  // feet in diameter." It is no table of its own: it stands on the lid of
  // the closed Pastos, and is rolled aside to open it.
  radius: 1.5,
  // The depth of the drum under the top.
  depth: ALTAR_DEPTH,
  // The height of the painted top above the floor, standing where it
  // stands: on the lid of the closed Pastos.
  height: PASTOS.height + PASTOS.lid + ALTAR_DEPTH,
}

// When the Pastos is carried out of the Vault the circular altar is set
// on "a small altar near the entrance of the Vault", and on Day C on a
// "Black Altar at the Vault's center covering the rose petals on the
// floor". That is the black Neophyte altar: here it stands in for the
// Pastos so that the circular altar keeps its height.
export const BLACK_ALTAR = {
  side: 2,
  height: PASTOS.height + PASTOS.lid,
}

// On the outside of the door, "in large letters ... with the year of the
// Lord under it", on the brass plate that betrayed the hidden door.
export const DOOR_INSCRIPTION = 'POST CENTUM VIGINTI ANNOS PATEBO'
export const DOOR_YEAR = '1484'

// ---- Designs ----------------------------------------------------------------------

export type VaultDesignId = 'regardie' | 'case' | 'pansophic'

interface VaultDesign {
  id: VaultDesignId
  name: string
  // For narrow screens.
  shortName: string
  // Not offered in the tabs: a draft, reachable only by ?design= or by
  // having been chosen before.
  hidden?: boolean
}

export const DESIGNS: VaultDesign[] = [
  // The Vault as Regardie publishes it: the walls placed by the solar
  // spectrum, each parted into forty squares.
  { id: 'regardie', name: 'Regardie', shortName: 'Reg' },
  // The Vault as Paul Foster Case revised it: the walls placed by the
  // Seven Branched Candlestick, each parted into ten squares after the
  // Fama rather than into forty. Everything else -- ceiling, floor,
  // Pastos, altar, door -- is the same: "The Paul Foster Case vault is
  // the same as the Golden Dawn except for the wall illustrations."
  { id: 'case', name: 'Case', shortName: 'PFC' },
  // A draft: the tomb as the Fama describes it, read after Rafal Prinke's
  // reconstruction: a memory theatre after Giulio Camillo's, each wall a
  // Tree of Life, the altar Franckenberg's Tabula Universalis. What fills
  // the squares and triangles is not yet known, so it is kept back.
  { id: 'pansophic', name: 'Pansophic', shortName: 'Pan', hidden: true },
]
