// The Cube of Space: Paul Foster Case's arrangement of the twenty-two
// Hebrew letters on a cube, after the Sepher Yetzirah's "boundaries" of
// space. The seven double letters are its six faces (and its centre); the
// twelve single letters are its twelve edges, each with a direction in
// which its current flows; the three Mother letters are the axes joining
// opposite faces. The attributions and flow directions are BOTA's, as
// botatoolbox's cube-of-space.json gives them; the cards are the Tarot
// keys Case gives each letter.

export type CubeDirection =
  'above' | 'below' | 'east' | 'west' | 'north' | 'south'
export type FlowDirection = 'up' | 'down' | 'east' | 'west' | 'north' | 'south'

// The Tarot keys and their images are shared (lib/tarot.ts). The cube
// paints eighteen of them: the Fool, the Hanged Man, Judgement and the
// World belong to the Mother letters and the centre, which the cube marks
// but does not paint.
export {
  CARD_STYLES,
  keyLetter,
  type CardStyle,
  TAROT as CARDS,
  tarotImage as cardImage,
} from './tarot'

// The twelve edges, named for where they run: T- and B- along the top
// and bottom faces, NE/SE/SW/NW the four upright corners.
export type EdgeId =
  | 'T-N'
  | 'T-E'
  | 'T-S'
  | 'T-W'
  | 'B-N'
  | 'B-E'
  | 'B-S'
  | 'B-W'
  | 'NE'
  | 'SE'
  | 'SW'
  | 'NW'

export interface CubeEdge {
  id: EdgeId
  letter: string
  // What the letter rules (its zodiac sign).
  sign: string
  flow: FlowDirection
}

export const EDGES: CubeEdge[] = [
  { id: 'T-N', letter: 'ט', sign: 'Leo', flow: 'west' },
  { id: 'T-E', letter: 'ז', sign: 'Gemini', flow: 'north' },
  { id: 'T-S', letter: 'צ', sign: 'Aquarius', flow: 'east' },
  { id: 'T-W', letter: 'ס', sign: 'Sagittarius', flow: 'south' },
  { id: 'B-N', letter: 'י', sign: 'Virgo', flow: 'west' },
  { id: 'B-E', letter: 'ח', sign: 'Cancer', flow: 'south' },
  { id: 'B-S', letter: 'ק', sign: 'Pisces', flow: 'east' },
  { id: 'B-W', letter: 'ע', sign: 'Capricorn', flow: 'south' },
  { id: 'NE', letter: 'ה', sign: 'Aries', flow: 'down' },
  { id: 'SE', letter: 'ו', sign: 'Taurus', flow: 'up' },
  { id: 'SW', letter: 'נ', sign: 'Scorpio', flow: 'up' },
  { id: 'NW', letter: 'ל', sign: 'Libra', flow: 'down' },
]

export const EDGE_BY_ID = Object.fromEntries(
  EDGES.map((e) => [e.id, e]),
) as Record<EdgeId, CubeEdge>

export interface CubeFace {
  id: CubeDirection
  letter: string
  // What the letter rules (its planet).
  planet: string
  // The edges round the face, as seen from inside the cube looking at it.
  borders: Record<'top' | 'bottom' | 'left' | 'right', EdgeId>
}

export const FACES: CubeFace[] = [
  {
    id: 'east',
    letter: 'ד',
    planet: 'Venus',
    borders: { top: 'T-E', bottom: 'B-E', right: 'SE', left: 'NE' },
  },
  {
    id: 'west',
    letter: 'כ',
    planet: 'Jupiter',
    borders: { top: 'T-W', bottom: 'B-W', right: 'NW', left: 'SW' },
  },
  {
    id: 'above',
    letter: 'ב',
    planet: 'Mercury',
    borders: { top: 'T-S', bottom: 'T-N', right: 'T-E', left: 'T-W' },
  },
  {
    id: 'below',
    letter: 'ג',
    planet: 'Moon',
    borders: { top: 'B-N', bottom: 'B-S', right: 'B-E', left: 'B-W' },
  },
  {
    id: 'north',
    letter: 'פ',
    planet: 'Mars',
    borders: { top: 'T-N', bottom: 'B-N', right: 'NE', left: 'NW' },
  },
  {
    id: 'south',
    letter: 'ר',
    planet: 'Sun',
    borders: { top: 'T-S', bottom: 'B-S', right: 'SW', left: 'SE' },
  },
]

// The three Mother letters run between the centres of opposite faces, and
// Tav, the seventh double letter, is the centre itself, as Case teaches.
// Not drawn in the scene (botatoolbox doesn't draw them either); kept here
// so the page can name them.
export const AXES = [
  { letter: 'א', name: 'Aleph', element: 'Air', between: ['above', 'below'] },
  { letter: 'מ', name: 'Mem', element: 'Water', between: ['east', 'west'] },
  { letter: 'ש', name: 'Shin', element: 'Fire', between: ['north', 'south'] },
] as const

export const CENTRE = { letter: 'ת', name: 'Tav', planet: 'Saturn' } as const
