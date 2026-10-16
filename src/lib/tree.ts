import { PALETTE, SEPHIRAH_COLORS } from './colors'
import { LETTERS, type Letter } from './letters'

// The Tree of Life itself, shared by every model that draws it: the ten
// Sephiroth and the twenty-two paths joining them. How a model lays the
// Tree out (flat, on a body, on the sky) is its own business; see
// treeOfLife.ts and treeOfLifeSphere.ts.

// ---- Sephiroth -------------------------------------------------------------

export type SephirahId =
  | 'kether'
  | 'chokmah'
  | 'binah'
  | 'chesed'
  | 'geburah'
  | 'tiphareth'
  | 'netzach'
  | 'hod'
  | 'yesod'
  | 'malkuth'

export type Pillar = 'middle' | 'mercy' | 'severity'

export interface Sephirah {
  id: SephirahId
  number: number
  name: string
  hebrew: string
  meaning: string
  // The traditional sphere of the heavens.
  heavenlySphere: string
  pillar: Pillar
  // Queen scale.
  color: string
  // Legible text colour over `color`.
  ink: string
}

export const SEPHIROTH: Sephirah[] = [
  {
    id: 'kether',
    number: 1,
    name: 'Kether',
    hebrew: 'כתר',
    meaning: 'Crown',
    heavenlySphere: 'the First Swirlings',
    pillar: 'middle',
    color: PALETTE[SEPHIRAH_COLORS.kether],
    ink: '#1b1a17',
  },
  {
    id: 'chokmah',
    number: 2,
    name: 'Chokmah',
    hebrew: 'חכמה',
    meaning: 'Wisdom',
    heavenlySphere: 'the Zodiac',
    pillar: 'mercy',
    color: PALETTE[SEPHIRAH_COLORS.chokmah],
    ink: '#f4f6ff',
  },
  {
    id: 'binah',
    number: 3,
    name: 'Binah',
    hebrew: 'בינה',
    meaning: 'Understanding',
    heavenlySphere: 'Saturn',
    pillar: 'severity',
    color: PALETTE[SEPHIRAH_COLORS.binah],
    ink: '#e9e6dc',
  },
  {
    id: 'chesed',
    number: 4,
    name: 'Chesed',
    hebrew: 'חסד',
    meaning: 'Mercy',
    heavenlySphere: 'Jupiter',
    pillar: 'mercy',
    color: PALETTE[SEPHIRAH_COLORS.chesed],
    ink: '#f4f6ff',
  },
  {
    id: 'geburah',
    number: 5,
    name: 'Geburah',
    hebrew: 'גבורה',
    meaning: 'Severity',
    heavenlySphere: 'Mars',
    pillar: 'severity',
    color: PALETTE[SEPHIRAH_COLORS.geburah],
    ink: '#fff4f1',
  },
  {
    id: 'tiphareth',
    number: 6,
    name: 'Tiphareth',
    hebrew: 'תפארת',
    meaning: 'Beauty',
    heavenlySphere: 'the Sun',
    pillar: 'middle',
    color: PALETTE[SEPHIRAH_COLORS.tiphareth],
    ink: '#f6dc8a',
  },
  {
    id: 'netzach',
    number: 7,
    name: 'Netzach',
    hebrew: 'נצח',
    meaning: 'Victory',
    heavenlySphere: 'Venus',
    pillar: 'mercy',
    color: PALETTE[SEPHIRAH_COLORS.netzach],
    ink: '#f1fff6',
  },
  {
    id: 'hod',
    number: 8,
    name: 'Hod',
    hebrew: 'הוד',
    meaning: 'Splendour',
    heavenlySphere: 'Mercury',
    pillar: 'severity',
    color: PALETTE[SEPHIRAH_COLORS.hod],
    ink: '#fff6ec',
  },
  {
    id: 'yesod',
    number: 9,
    name: 'Yesod',
    hebrew: 'יסוד',
    meaning: 'Foundation',
    heavenlySphere: 'the Moon',
    pillar: 'middle',
    color: PALETTE[SEPHIRAH_COLORS.yesod],
    ink: '#c9b0f2',
  },
  {
    id: 'malkuth',
    number: 10,
    name: 'Malkuth',
    hebrew: 'מלכות',
    meaning: 'Kingdom',
    heavenlySphere: 'the Elements',
    pillar: 'middle',
    color: PALETTE[SEPHIRAH_COLORS.malkuth],
    ink: '#f7f2dc',
  },
]

export const SEPHIRAH_BY_ID = Object.fromEntries(
  SEPHIROTH.map((s) => [s.id, s]),
) as Record<SephirahId, Sephirah>

// ---- Paths -----------------------------------------------------------------

// A path is a letter laid on the Tree, joining two sephiroth.
export interface Path extends Letter {
  from: SephirahId
  to: SephirahId
}

// Which two sephiroth each letter's path joins, by path number.
const JOINS: Record<number, [SephirahId, SephirahId]> = {
  11: ['kether', 'chokmah'], // Aleph
  12: ['kether', 'binah'], // Beth
  13: ['kether', 'tiphareth'], // Gimel
  14: ['chokmah', 'binah'], // Daleth
  15: ['chokmah', 'tiphareth'], // Heh
  16: ['chokmah', 'chesed'], // Vav
  17: ['binah', 'tiphareth'], // Zain
  18: ['binah', 'geburah'], // Cheth
  19: ['chesed', 'geburah'], // Teth
  20: ['chesed', 'tiphareth'], // Yod
  21: ['chesed', 'netzach'], // Kaph
  22: ['geburah', 'tiphareth'], // Lamed
  23: ['geburah', 'hod'], // Mem
  24: ['tiphareth', 'netzach'], // Nun
  25: ['tiphareth', 'yesod'], // Samekh
  26: ['tiphareth', 'hod'], // Ayin
  27: ['netzach', 'hod'], // Peh
  28: ['netzach', 'yesod'], // Tzaddi
  29: ['netzach', 'malkuth'], // Qoph
  30: ['hod', 'yesod'], // Resh
  31: ['hod', 'malkuth'], // Shin
  32: ['yesod', 'malkuth'], // Tav
}

export const PATHS: Path[] = LETTERS.map((l) => {
  const [from, to] = JOINS[l.number]
  return { ...l, from, to }
})

export const PATH_BY_NUMBER = new Map(PATHS.map((p) => [p.number, p]))
