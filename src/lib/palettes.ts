// The colours of the four scales, from a palette of twelve.
//
// The Golden Dawn names its colours in words ("sky blue", "deep warm
// olive") rather than fixing them, and every painter of its Tree has read
// the words a little differently. So the colours here are worked out in
// two steps, each kept in one place:
//
//   1. A palette: the twelve colours of the colour wheel (red, red-orange,
//      orange … red-violet). Three are offered, chosen by the visitor and
//      shared across the site (see useSitePalette):
//        - Tailwind: bright screen colours, Tailwind's six at their 500
//          shade with the steps between them blended (as botatoolbox does).
//        - FLO: the Fraternity of the Hidden Light's (BOTA's traditional)
//          painted colours, as botatoolbox has them.
//        - Cicero: the paints Tabatha Cicero recommends in Secrets of a
//          Golden Dawn Temple, from their Munsell values (converted by
//          Hermeticulture, "RGB/Hex Values of the Golden Dawn Colors",
//          2022).
//
//   2. A recipe for each colour the scales name, made from the palette's
//      twelve: "sky blue" is blue, lightened; "deep indigo" is
//      blue-violet, darkened; "rich brown" is orange, much darkened. The
//      recipes are an interpretation, to be tuned; the names they read are
//      the sources' own, so the data below reads like the tables it is
//      taken from. A few colours are not on the wheel (white, black, grey,
//      silver) and are the same in every palette.
//
// A palette only says what "orange" looks like. Which letter or sign is
// orange is a tradition's own: the Golden Dawn's here (LETTER_KING_NAMES,
// SIGN_STEPS); BOTA's, for the models that follow Case, in colors.ts.

// ---- The palettes ---------------------------------------------------------------

export const WHEEL = [
  'red',
  'red-orange',
  'orange',
  'yellow-orange',
  'yellow',
  'yellow-green',
  'green',
  'blue-green',
  'blue',
  'blue-violet',
  'violet',
  'red-violet',
] as const

export type Step = (typeof WHEEL)[number]

export const PALETTES = [
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'flo', label: 'FLO' },
  { id: 'cicero', label: 'Cicero' },
] as const

export type PaletteId = (typeof PALETTES)[number]['id']

export const DEFAULT_PALETTE: PaletteId = 'tailwind'

// Tailwind: the six anchors at their 500 shade (yellow at 400, its 500
// being a dull mustard), each step between two of them their even blend.
const TAILWIND = {
  red: '#FB2C36',
  orange: '#FF6900',
  yellow: '#FDC700',
  green: '#00BC7D', // emerald-500
  blue: '#2B7FFF',
  violet: '#8E51FF',
}

const WHEELS: Record<PaletteId, Record<Step, string>> = {
  tailwind: {
    red: TAILWIND.red,
    'red-orange': mix(TAILWIND.red, TAILWIND.orange, 0.5),
    orange: TAILWIND.orange,
    'yellow-orange': mix(TAILWIND.orange, TAILWIND.yellow, 0.5),
    yellow: TAILWIND.yellow,
    'yellow-green': mix(TAILWIND.yellow, TAILWIND.green, 0.5),
    green: TAILWIND.green,
    'blue-green': mix(TAILWIND.green, TAILWIND.blue, 0.5),
    blue: TAILWIND.blue,
    'blue-violet': mix(TAILWIND.blue, TAILWIND.violet, 0.5),
    violet: TAILWIND.violet,
    'red-violet': mix(TAILWIND.violet, TAILWIND.red, 0.5),
  },
  flo: {
    red: '#AC2721',
    'red-orange': '#B92D1C',
    orange: '#E65C29',
    'yellow-orange': '#E78732',
    yellow: '#F5E652',
    'yellow-green': '#75AC4A',
    green: '#397351',
    'blue-green': '#30608D',
    blue: '#264AA9',
    'blue-violet': '#3C409E',
    violet: '#3C2070',
    'red-violet': '#5B206B',
  },
  // Munsell hue, value and chroma in each comment. Of the two blues given
  // (two of her paints), the lighter cerulean, which reads on the dark.
  cicero: {
    red: '#B5282A', // 6.8R 4/13
    'red-orange': '#E05C31', // 9.5R 5.5/13
    orange: '#FF8F2D', // 3.6YR 7/13
    'yellow-orange': '#FB990D', // 6.2YR 7.1/13
    yellow: '#FADF00', // 6.5Y 8.8/12.5
    'yellow-green': '#7FBF48', // 7.6GY 7/10
    green: '#008A3C', // 1.2G 4.9/10
    'blue-green': '#008B7F', // 3.8BG 5/8
    blue: '#0085B1', // 8.0B 5/9
    'blue-violet': '#4859AE', // 7.6PB 4/12
    violet: '#633375', // 5.0P 3/9
    'red-violet': '#70334C', // 6.5RP 3/5.6
  },
}

// The colours off the wheel, the same in every palette.
const NEUTRALS = {
  white: '#F3EFE4',
  black: '#15151B',
  grey: '#9B9EA6',
  silver: '#C8CCD4',
} as const

type Neutral = keyof typeof NEUTRALS

export function stepColor(step: Step, palette: PaletteId): string {
  return WHEELS[palette][step]
}

// ---- Mixing ----------------------------------------------------------------------

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ]
}

function hex([r, g, b]: number[]): string {
  const h = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}

// `a` moved `t` of the way to `b` (0 is `a`, 1 is `b`), channel by channel.
export function mix(a: string, b: string, t: number): string {
  const [x, y] = [rgb(a), rgb(b)]
  return hex(x.map((v, i) => v + (y[i] - v) * t))
}

// ---- Recipes ---------------------------------------------------------------------

// A colour made from the palette: a step of the wheel (or a neutral),
// moved some way towards another, then lightened (towards white), darkened
// (towards black) or muted (towards grey). Each amount is a share, 0 to 1.
export interface Recipe {
  from: Step | Neutral
  toward?: [Step | Neutral, number]
  lighten?: number
  darken?: number
  mute?: number
}

const isNeutral = (c: string): c is Neutral => c in NEUTRALS

function base(c: Step | Neutral, palette: PaletteId): string {
  return isNeutral(c) ? NEUTRALS[c] : WHEELS[palette][c]
}

export function make(recipe: Recipe, palette: PaletteId): string {
  let color = base(recipe.from, palette)
  if (recipe.toward)
    color = mix(color, base(recipe.toward[0], palette), recipe.toward[1])
  if (recipe.mute) color = mix(color, NEUTRALS.grey, recipe.mute)
  if (recipe.lighten) color = mix(color, '#FFFFFF', recipe.lighten)
  if (recipe.darken) color = mix(color, '#000000', recipe.darken)
  return color
}

// Every colour the scales below name, as a recipe. The names are those of
// Liber 777's columns (which follow the Golden Dawn's own); the readings
// follow the painter's rule of thumb (Sledzinski and Dudschus, Coloring the
// Classic Golden Dawn Tarot): a "glowing" colour leans to its lighter
// neighbour, a "deep" one to its darker.
export const RECIPES = {
  // The wheel's own.
  scarlet: { from: 'red', toward: ['red-orange', 0.25] },
  red: { from: 'red' },
  'red orange': { from: 'red-orange' },
  orange: { from: 'orange' },
  amber: { from: 'yellow-orange' },
  yellow: { from: 'yellow' },
  'greenish yellow': { from: 'yellow', toward: ['yellow-green', 0.3] },
  'yellowish green': { from: 'yellow-green' },
  'emerald green': { from: 'green' },
  green: { from: 'green' },
  'green blue': { from: 'blue-green' },
  blue: { from: 'blue' },
  indigo: { from: 'blue-violet' },
  violet: { from: 'violet' },
  crimson: { from: 'red-violet' },

  // Glowing and deep, light and pale.
  'glowing orange scarlet': { from: 'red', toward: ['red-orange', 0.5] },
  'glowing red': { from: 'red', toward: ['red-orange', 0.2], lighten: 0.05 },
  'brilliant flame': { from: 'red-orange', lighten: 0.12 },
  vermilion: { from: 'red', toward: ['red-orange', 0.4] },
  'venetian red': { from: 'red', toward: ['red-orange', 0.3], darken: 0.2 },
  'bright red': { from: 'red', lighten: 0.1 },
  'bright pale yellow': { from: 'yellow', lighten: 0.45 },
  'gold yellow': { from: 'yellow', toward: ['yellow-orange', 0.5] },
  'rich amber': { from: 'yellow-orange', darken: 0.1 },
  'reddish yellow': { from: 'yellow-orange', toward: ['orange', 0.3] },
  'early spring green': { from: 'yellow-green', lighten: 0.25 },
  'pale green': { from: 'green', lighten: 0.55 },
  'sea green': { from: 'blue-green', toward: ['green', 0.5], lighten: 0.1 },
  'blue emerald green': { from: 'blue-green', toward: ['green', 0.3] },
  'deep blue-green': { from: 'blue-green', darken: 0.35 },
  'sky blue': { from: 'blue', lighten: 0.45 },
  'cold pale blue': { from: 'blue', lighten: 0.6, mute: 0.2 },
  'bright blue': { from: 'blue', lighten: 0.15 },
  'deep blue': { from: 'blue', darken: 0.35 },
  'dark vivid blue': { from: 'blue', darken: 0.25 },
  'deep indigo': { from: 'blue-violet', darken: 0.45 },
  'blue black': { from: 'blue-violet', darken: 0.75 },
  purple: { from: 'violet', toward: ['red-violet', 0.5] },
  'deep purple': { from: 'violet', toward: ['red-violet', 0.4], darken: 0.3 },
  'rich purple': { from: 'violet', toward: ['red-violet', 0.3], darken: 0.1 },
  'bluish mauve': { from: 'violet', toward: ['blue', 0.4], lighten: 0.35 },
  'pale mauve': { from: 'violet', toward: ['red-violet', 0.3], lighten: 0.55 },
  'white tinged purple': { from: 'violet', lighten: 0.85 },
  plum: { from: 'red-violet', toward: ['violet', 0.3], darken: 0.15 },
  cerise: { from: 'red-violet', toward: ['red', 0.5], lighten: 0.2 },
  maroon: { from: 'red', toward: ['red-violet', 0.3], darken: 0.5 },

  // Earths and greys.
  'rich bright russet': {
    from: 'red-orange',
    toward: ['orange', 0.3],
    darken: 0.3,
  },
  'deep warm olive': {
    from: 'yellow-green',
    toward: ['red-orange', 0.2],
    darken: 0.5,
  },
  'deep olive-green': {
    from: 'yellow-green',
    toward: ['green', 0.3],
    darken: 0.5,
  },
  'rich brown': { from: 'orange', darken: 0.55 },
  'dull brown': { from: 'orange', mute: 0.3, darken: 0.5 },
  'very dark brown': { from: 'orange', darken: 0.75 },
  'dark greenish brown': {
    from: 'orange',
    toward: ['green', 0.4],
    darken: 0.6,
  },
  'livid indigo brown': {
    from: 'blue-violet',
    toward: ['orange', 0.4],
    darken: 0.6,
  },
  'new yellow leather': { from: 'yellow-orange', mute: 0.3, lighten: 0.15 },
  buff: { from: 'yellow-orange', mute: 0.4, lighten: 0.55 },
  'light translucent pinkish brown': {
    from: 'orange',
    toward: ['red-violet', 0.3],
    mute: 0.3,
    lighten: 0.35,
  },
  stone: { from: 'grey', toward: ['yellow-orange', 0.15], lighten: 0.1 },
  'reddish grey inclined to mauve': {
    from: 'grey',
    toward: ['red-violet', 0.3],
  },
  'green grey': { from: 'grey', toward: ['green', 0.25] },
  'slate grey': { from: 'grey', toward: ['blue', 0.15], darken: 0.25 },
  'cold dark grey near black': { from: 'grey', darken: 0.7 },
  grey: { from: 'grey' },
  silver: { from: 'silver' },
  white: { from: 'white' },
  black: { from: 'black' },
  gold: { from: 'yellow-orange', toward: ['yellow', 0.3], lighten: 0.1 },
  azure: { from: 'blue', lighten: 0.2 },
} satisfies Record<string, Recipe>

export type ColorWord = keyof typeof RECIPES

export function colorOf(word: ColorWord, palette: PaletteId): string {
  return make(RECIPES[word], palette)
}

// ---- The letters in the four scales ----------------------------------------------

// Each letter's colour in the King scale (Atziluth), the Queen (Briah), the
// Prince (Yetzirah) and the Princess (Assiah), as Liber 777's columns XV–
// XVIII name them. Where a colour is compound ("emerald, flecked gold"),
// its ground is given here and the fleck or ray in LETTER_MARKS.
export const LETTER_SCALE_NAMES: Record<
  string,
  [ColorWord, ColorWord, ColorWord, ColorWord]
> = {
  א: ['bright pale yellow', 'sky blue', 'blue emerald green', 'emerald green'],
  ב: ['yellow', 'purple', 'grey', 'indigo'],
  ג: ['blue', 'silver', 'cold pale blue', 'silver'],
  ד: ['emerald green', 'sky blue', 'early spring green', 'cerise'],
  ה: ['scarlet', 'red', 'brilliant flame', 'glowing red'],
  ו: ['red orange', 'deep indigo', 'deep warm olive', 'rich brown'],
  ז: [
    'orange',
    'pale mauve',
    'new yellow leather',
    'reddish grey inclined to mauve',
  ],
  ח: ['amber', 'maroon', 'rich bright russet', 'dark greenish brown'],
  ט: ['greenish yellow', 'deep purple', 'grey', 'reddish yellow'],
  י: ['yellowish green', 'slate grey', 'green grey', 'plum'],
  כ: ['violet', 'blue', 'rich purple', 'bright blue'],
  ל: ['emerald green', 'blue', 'deep blue-green', 'pale green'],
  מ: ['deep blue', 'sea green', 'deep olive-green', 'white'],
  נ: ['green blue', 'dull brown', 'very dark brown', 'livid indigo brown'],
  ס: ['blue', 'yellow', 'green', 'dark vivid blue'],
  ע: ['indigo', 'black', 'blue black', 'cold dark grey near black'],
  פ: ['scarlet', 'red', 'venetian red', 'bright red'],
  צ: ['violet', 'sky blue', 'bluish mauve', 'white tinged purple'],
  ק: ['crimson', 'buff', 'light translucent pinkish brown', 'stone'],
  ר: ['orange', 'gold yellow', 'rich amber', 'amber'],
  ש: ['glowing orange scarlet', 'vermilion', 'scarlet', 'vermilion'],
  ת: ['indigo', 'black', 'blue black', 'black'],
}

export type Scale = 'king' | 'queen' | 'prince' | 'princess'

export const SCALES: Scale[] = ['king', 'queen', 'prince', 'princess']

export interface Mark {
  kind: 'fleck' | 'ray'
  colors: ColorWord[]
}

// The flecks and rays of the compound colours, by letter and scale:
// "emerald, flecked gold" is Aleph's Princess colour. Where 777 gives a
// choice ("rayed azure or emerald"), the first is taken. Tinges ("white,
// tinged purple") are not marks: the colour above is the tinged one.
export const LETTER_MARKS: Record<string, Partial<Record<Scale, Mark>>> = {
  א: { princess: { kind: 'fleck', colors: ['gold'] } },
  ב: { princess: { kind: 'ray', colors: ['violet'] } },
  ג: { princess: { kind: 'ray', colors: ['sky blue'] } },
  ד: { princess: { kind: 'ray', colors: ['pale green'] } },
  כ: { princess: { kind: 'ray', colors: ['yellow'] } },
  מ: { princess: { kind: 'fleck', colors: ['purple'] } },
  פ: { princess: { kind: 'ray', colors: ['azure'] } },
  ק: { queen: { kind: 'fleck', colors: ['silver'] } },
  ר: { princess: { kind: 'ray', colors: ['red'] } },
  ש: {
    prince: { kind: 'fleck', colors: ['gold'] },
    princess: { kind: 'fleck', colors: ['crimson', 'emerald green'] },
  },
  ת: { princess: { kind: 'ray', colors: ['blue'] } },
}

// ---- The signs and planets ---------------------------------------------------------

// The signs on the wheel in the Golden Dawn's King scale, Aries to
// Pisces: the twelve steps in order, from Aries' scarlet.
export const SIGN_WORDS: ColorWord[] = [
  'scarlet',
  'red orange',
  'orange',
  'amber',
  'greenish yellow',
  'yellowish green',
  'emerald green',
  'green blue',
  'blue',
  'indigo',
  'violet',
  'crimson',
]

// The planets in the King scale, as the paths they rule.
export const PLANET_WORDS: Record<string, ColorWord> = {
  Sun: 'orange',
  Moon: 'blue',
  Mercury: 'yellow',
  Venus: 'emerald green',
  Mars: 'scarlet',
  Jupiter: 'violet',
  Saturn: 'indigo',
}
