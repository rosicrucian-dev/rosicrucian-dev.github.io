// The twenty-two letters of the Hebrew alphabet as the Golden Dawn and
// B.O.T.A. use them: each the letter of one path on the Tree of Life, of
// one Tarot key, and of the element, planet or sign it carries. Shared by
// every model that shows the letters, whatever it hangs them on.

import { LETTER_COLORS, PALETTE } from './colors'

// The Sepher Yetzirah's three classes: the three Mothers (the elements),
// the seven Doubles (the planets) and the twelve Singles (the signs).
export type LetterKind = 'mother' | 'double' | 'single'

export interface Letter {
  // The number of its path on the Tree, 11 to 32.
  number: number
  name: string
  hebrew: string
  kind: LetterKind
  // The element, planet or sign, after the Golden Dawn.
  attribution: string
  // The Tarot key on its path: the Golden Dawn attribution, with the
  // cards named as B.O.T.A. names them (The World, not The Universe).
  card: string
  // King scale.
  color: string
}

export const LETTERS: Letter[] = [
  {
    number: 11,
    name: 'Aleph',
    hebrew: 'א',
    kind: 'mother',
    attribution: 'Air',
    card: 'The Fool',
    color: PALETTE[LETTER_COLORS['א']],
  },
  {
    number: 12,
    name: 'Beth',
    hebrew: 'ב',
    kind: 'double',
    attribution: 'Mercury',
    card: 'The Magician',
    color: PALETTE[LETTER_COLORS['ב']],
  },
  {
    number: 13,
    name: 'Gimel',
    hebrew: 'ג',
    kind: 'double',
    attribution: 'Moon',
    card: 'The High Priestess',
    color: PALETTE[LETTER_COLORS['ג']],
  },
  {
    number: 14,
    name: 'Daleth',
    hebrew: 'ד',
    kind: 'double',
    attribution: 'Venus',
    card: 'The Empress',
    color: PALETTE[LETTER_COLORS['ד']],
  },
  {
    number: 15,
    name: 'Heh',
    hebrew: 'ה',
    kind: 'single',
    attribution: 'Aries',
    card: 'The Emperor',
    color: PALETTE[LETTER_COLORS['ה']],
  },
  {
    number: 16,
    name: 'Vav',
    hebrew: 'ו',
    kind: 'single',
    attribution: 'Taurus',
    card: 'The Hierophant',
    color: PALETTE[LETTER_COLORS['ו']],
  },
  {
    number: 17,
    name: 'Zain',
    hebrew: 'ז',
    kind: 'single',
    attribution: 'Gemini',
    card: 'The Lovers',
    color: PALETTE[LETTER_COLORS['ז']],
  },
  {
    number: 18,
    name: 'Cheth',
    hebrew: 'ח',
    kind: 'single',
    attribution: 'Cancer',
    card: 'The Chariot',
    color: PALETTE[LETTER_COLORS['ח']],
  },
  {
    number: 19,
    name: 'Teth',
    hebrew: 'ט',
    kind: 'single',
    attribution: 'Leo',
    card: 'Strength',
    color: PALETTE[LETTER_COLORS['ט']],
  },
  {
    number: 20,
    name: 'Yod',
    hebrew: 'י',
    kind: 'single',
    attribution: 'Virgo',
    card: 'The Hermit',
    color: PALETTE[LETTER_COLORS['י']],
  },
  {
    number: 21,
    name: 'Kaph',
    hebrew: 'כ',
    kind: 'double',
    attribution: 'Jupiter',
    card: 'The Wheel of Fortune',
    color: PALETTE[LETTER_COLORS['כ']],
  },
  {
    number: 22,
    name: 'Lamed',
    hebrew: 'ל',
    kind: 'single',
    attribution: 'Libra',
    card: 'Justice',
    color: PALETTE[LETTER_COLORS['ל']],
  },
  {
    number: 23,
    name: 'Mem',
    hebrew: 'מ',
    kind: 'mother',
    attribution: 'Water',
    card: 'The Hanged Man',
    color: PALETTE[LETTER_COLORS['מ']],
  },
  {
    number: 24,
    name: 'Nun',
    hebrew: 'נ',
    kind: 'single',
    attribution: 'Scorpio',
    card: 'Death',
    color: PALETTE[LETTER_COLORS['נ']],
  },
  {
    number: 25,
    name: 'Samekh',
    hebrew: 'ס',
    kind: 'single',
    attribution: 'Sagittarius',
    card: 'Temperance',
    color: PALETTE[LETTER_COLORS['ס']],
  },
  {
    number: 26,
    name: 'Ayin',
    hebrew: 'ע',
    kind: 'single',
    attribution: 'Capricorn',
    card: 'The Devil',
    color: PALETTE[LETTER_COLORS['ע']],
  },
  {
    number: 27,
    name: 'Peh',
    hebrew: 'פ',
    kind: 'double',
    attribution: 'Mars',
    card: 'The Tower',
    color: PALETTE[LETTER_COLORS['פ']],
  },
  {
    number: 28,
    name: 'Tzaddi',
    hebrew: 'צ',
    kind: 'single',
    attribution: 'Aquarius',
    card: 'The Star',
    color: PALETTE[LETTER_COLORS['צ']],
  },
  {
    number: 29,
    name: 'Qoph',
    hebrew: 'ק',
    kind: 'single',
    attribution: 'Pisces',
    card: 'The Moon',
    color: PALETTE[LETTER_COLORS['ק']],
  },
  {
    number: 30,
    name: 'Resh',
    hebrew: 'ר',
    kind: 'double',
    attribution: 'Sun',
    card: 'The Sun',
    color: PALETTE[LETTER_COLORS['ר']],
  },
  {
    number: 31,
    name: 'Shin',
    hebrew: 'ש',
    kind: 'mother',
    attribution: 'Fire',
    card: 'Judgement',
    color: PALETTE[LETTER_COLORS['ש']],
  },
  {
    number: 32,
    name: 'Tav',
    hebrew: 'ת',
    kind: 'double',
    attribution: 'Saturn',
    card: 'The World',
    color: PALETTE[LETTER_COLORS['ת']],
  },
]

export const LETTER_BY_HEBREW = new Map(LETTERS.map((l) => [l.hebrew, l]))
