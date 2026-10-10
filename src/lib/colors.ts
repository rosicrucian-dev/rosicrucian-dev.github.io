// The colours that carry meaning on the site, so that the same thing is
// the same colour wherever it appears. There are two traditions here, and
// a model follows one or the other:
//
//   Golden Dawn  PALETTE and the scales built on it (PLANET_COLORS,
//                SIGN_COLORS, LETTER_COLORS, SEPHIRAH_COLORS,
//                ELEMENT_COLORS, and LETTER_SCALES for the letters in all
//                four scales). The Vault, the Tree of Life Sphere and the
//                Shem HaMephorash.
//   BOTA         Paul Foster Case's colour wheel: BOTA_SCREEN_PALETTE (the
//                Cube of Space), BOTA_POSTER_PALETTE and
//                BOTA_SEPHIRAH_COLORS, sampled from BOTA's painting of the
//                Tree (the Tree of Life). BOTA_LETTER_COLORS gives each
//                letter its step on the wheel.
//
// The Golden Dawn names its colours rather than mixing them, so each
// entry is one reading of a name, chosen once and used everywhere. The
// names are those of its scales: the King scale for the paths (and so
// for the planets, signs and elements they carry) and the Queen scale for
// the Sephiroth.
//
// Colours that only serve the drawing (backgrounds, ink, the sky, the
// page) stay with the code that draws them.

export const PALETTE = {
  white: '#f3efe4',
  grey: '#9b9ea6',
  black: '#15151b',

  scarlet: '#e2262b',
  orangeScarlet: '#f0491f', // "glowing orange scarlet", Shin
  redOrange: '#ee5a24',
  orange: '#f28c1c',
  amber: '#f5ab1f',
  paleYellow: '#f5ea7c', // "bright pale yellow", Aleph
  yellow: '#f1d01c',
  greenishYellow: '#d8dc2c',
  yellowishGreen: '#9bcb30',
  emerald: '#1aa35f',
  greenBlue: '#169c9e',
  blue: '#3b6ee0',
  deepBlue: '#2748c4', // Mem
  indigo: '#4a3cae',
  violet: '#9257d1',
  crimson: '#c81d5e',

  // Malkuth's four quarters, and the four taken together.
  citrine: '#c8b13c',
  olive: '#66772f',
  russet: '#8b4a2b',
  malkuth: '#8c7f3a',

  // The furnishings of the Vault: the golden crosses, the Red Rose and
  // its sepals, and the Red Dragon.
  gold: '#e8b820',
  goldShade: '#8a6a10',
  rose: '#c8232a',
  roseLight: '#d62f36',
  roseShade: '#5a0d12',
  leaf: '#2f7a3a',
  leafShade: '#1b4a22',
  dragon: '#b4161c',
  dragonLight: '#d8323a',
} as const

export type ColorName = keyof typeof PALETTE

// How the palette's names read aloud, for labels.
export const COLOR_LABELS: Partial<Record<ColorName, string>> = {
  orangeScarlet: 'orange scarlet',
  redOrange: 'red-orange',
  paleYellow: 'pale yellow',
  greenishYellow: 'greenish yellow',
  yellowishGreen: 'yellowish green',
  greenBlue: 'green-blue',
  deepBlue: 'deep blue',
}

export function colorLabel(name: ColorName): string {
  return COLOR_LABELS[name] ?? name
}

// ---- The King scale: the paths and what they carry ---------------------------

export const PLANET_COLORS = {
  saturn: 'indigo',
  jupiter: 'violet',
  mars: 'scarlet',
  sun: 'orange',
  venus: 'emerald',
  mercury: 'yellow',
  moon: 'blue',
} as const satisfies Record<string, ColorName>

export const SIGN_COLORS = {
  aries: 'scarlet',
  taurus: 'redOrange',
  gemini: 'orange',
  cancer: 'amber',
  leo: 'greenishYellow',
  virgo: 'yellowishGreen',
  libra: 'emerald',
  scorpio: 'greenBlue',
  sagittarius: 'blue',
  capricorn: 'indigo',
  aquarius: 'violet',
  pisces: 'crimson',
} as const satisfies Record<string, ColorName>

// The three Mother letters' elements, as paths.
export const MOTHER_COLORS = {
  air: 'paleYellow',
  water: 'deepBlue',
  fire: 'orangeScarlet',
} as const satisfies Record<string, ColorName>

// The path of each Hebrew letter, by what it carries.
export const LETTER_COLORS: Record<string, ColorName> = {
  א: MOTHER_COLORS.air,
  ב: PLANET_COLORS.mercury,
  ג: PLANET_COLORS.moon,
  ד: PLANET_COLORS.venus,
  ה: SIGN_COLORS.aries,
  ו: SIGN_COLORS.taurus,
  ז: SIGN_COLORS.gemini,
  ח: SIGN_COLORS.cancer,
  ט: SIGN_COLORS.leo,
  י: SIGN_COLORS.virgo,
  כ: PLANET_COLORS.jupiter,
  ל: SIGN_COLORS.libra,
  מ: MOTHER_COLORS.water,
  נ: SIGN_COLORS.scorpio,
  ס: SIGN_COLORS.sagittarius,
  ע: SIGN_COLORS.capricorn,
  פ: PLANET_COLORS.mars,
  צ: SIGN_COLORS.aquarius,
  ק: SIGN_COLORS.pisces,
  ר: PLANET_COLORS.sun,
  ש: MOTHER_COLORS.fire,
  ת: PLANET_COLORS.saturn,
}

// ---- The Queen scale: the Sephiroth ------------------------------------------

export const SEPHIRAH_COLORS = {
  kether: 'white',
  chokmah: 'grey',
  binah: 'black',
  chesed: 'blue',
  geburah: 'scarlet',
  tiphareth: 'yellow',
  netzach: 'emerald',
  hod: 'orange',
  yesod: 'violet',
  malkuth: 'malkuth',
} as const satisfies Record<string, ColorName>

// ---- The elements as the Order paints its weapons and Kerubim -----------------

// Fire red, Water blue, Air yellow, Earth black; and the three alchemical
// principles after them: Sulphur red, Mercury blue, Salt yellow.
export const ELEMENT_COLORS = {
  fire: 'scarlet',
  water: 'blue',
  air: 'yellow',
  earth: 'black',
  sulphur: 'scarlet',
  mercury: 'blue',
  salt: 'yellow',
} as const satisfies Record<string, ColorName>

// ---- The letters in all four scales ---------------------------------------------

// Each letter's colour in the three scales below the King's: the Queen
// (Briah), the Prince (Yetzirah) and the Princess (Assiah), for showing a
// letter as its power comes down through the four worlds (the King's is
// LETTER_COLORS). The names are those of Liber 777's columns XVI–XVIII,
// which follow the Golden Dawn's own scales; each reading of a name is a
// choice made here, as for PALETTE. Where a colour is compound ("emerald,
// flecked gold"), its ground colour is given here and the fleck or ray in
// LETTER_MARKS below.
// The colours below that more than one letter shares.
const SCALE = {
  skyBlue: '#7ec0ee',
  red: '#d02020',
  purple: '#7b3fa8',
  blueBlack: '#141a33',
} as const

export const LETTER_SCALES: Record<
  string,
  { queen: string; prince: string; princess: string }
> = {
  // Sky blue; blue emerald green; emerald, flecked gold.
  א: { queen: SCALE.skyBlue, prince: '#1aa38a', princess: PALETTE.emerald },
  // Purple; grey; indigo, rayed violet.
  ב: { queen: SCALE.purple, prince: PALETTE.grey, princess: PALETTE.indigo },
  // Silver; cold pale blue; silver, rayed sky blue.
  ג: { queen: '#c8ccd4', prince: '#a9c6e8', princess: '#d4dbe6' },
  // Sky blue; early spring green; bright rose or cerise, rayed pale green.
  ד: { queen: SCALE.skyBlue, prince: '#8fd16a', princess: '#e0457b' },
  // Red; brilliant flame; glowing red.
  ה: { queen: SCALE.red, prince: '#ff6a1a', princess: '#ff3b2f' },
  // Deep indigo; deep warm olive; rich brown.
  ו: { queen: '#2e2470', prince: '#6b6a2a', princess: '#6b3a1e' },
  // Pale mauve; new yellow leather; reddish grey inclined to mauve.
  ז: { queen: '#c9a6d6', prince: '#d9b26a', princess: '#9a7f86' },
  // Maroon; rich bright russet; dark greenish brown.
  ח: { queen: '#7a1f2b', prince: '#b0532a', princess: '#4a4a2a' },
  // Deep purple; grey; reddish yellow.
  ט: { queen: '#4e1f6e', prince: PALETTE.grey, princess: '#e8a02a' },
  // Slate grey; green grey; plum.
  י: { queen: '#6b7280', prince: '#7f8c7a', princess: '#8e4585' },
  // Blue; rich purple; bright blue, rayed yellow.
  כ: { queen: PALETTE.blue, prince: '#6a2c91', princess: '#2f8cff' },
  // Blue; deep blue-green; pale green.
  ל: { queen: PALETTE.blue, prince: '#0f6b6b', princess: '#a8e0a0' },
  // Sea green; deep olive-green; white, flecked purple.
  מ: { queen: '#2e8b72', prince: '#4b5a1f', princess: PALETTE.white },
  // Dull brown; very dark brown; livid indigo brown.
  נ: { queen: '#6b5236', prince: '#3a2616', princess: '#3b2f4a' },
  // Yellow; green; dark vivid blue.
  ס: { queen: PALETTE.yellow, prince: '#2e9e4f', princess: '#1f3fbf' },
  // Black; blue black; cold dark grey near black.
  ע: { queen: PALETTE.black, prince: SCALE.blueBlack, princess: '#2a2c30' },
  // Red; Venetian red; bright red, rayed azure or emerald.
  פ: { queen: SCALE.red, prince: '#c0452c', princess: '#ff2a2a' },
  // Sky blue; bluish mauve; white, tinged purple.
  צ: { queen: SCALE.skyBlue, prince: '#8f84c9', princess: '#e6dcf0' },
  // Buff, flecked silver-white; light translucent pinkish brown; stone.
  ק: { queen: '#dbc59a', prince: '#c8a08c', princess: '#8f8a80' },
  // Gold yellow; rich amber; amber, rayed red.
  ר: { queen: '#f2c230', prince: '#e09a1a', princess: PALETTE.amber },
  // Vermilion; scarlet, flecked gold; vermilion, flecked crimson and
  // emerald.
  ש: { queen: '#e34234', prince: PALETTE.scarlet, princess: '#e34234' },
  // Black; blue black; black, rayed blue.
  ת: { queen: PALETTE.black, prince: SCALE.blueBlack, princess: PALETTE.black },
}

// The flecks and rays of the compound colours above, by letter and scale:
// "emerald, flecked gold" is Aleph's Princess colour, emerald, with gold
// flecks. Where 777 gives a choice ("rayed azure or emerald"), the first
// is taken. Tinges ("white, tinged purple") are not marks: the colour
// above is the tinged one.
export type Scale = 'king' | 'queen' | 'prince' | 'princess'

export interface Mark {
  kind: 'fleck' | 'ray'
  colors: string[]
}

export const LETTER_MARKS: Record<string, Partial<Record<Scale, Mark>>> = {
  א: { princess: { kind: 'fleck', colors: [PALETTE.gold] } },
  ב: { princess: { kind: 'ray', colors: [PALETTE.violet] } },
  ג: { princess: { kind: 'ray', colors: [SCALE.skyBlue] } },
  ד: { princess: { kind: 'ray', colors: ['#a8e0a0'] } },
  כ: { princess: { kind: 'ray', colors: [PALETTE.yellow] } },
  מ: { princess: { kind: 'fleck', colors: [SCALE.purple] } },
  פ: { princess: { kind: 'ray', colors: ['#3fa9f5'] } },
  ק: { queen: { kind: 'fleck', colors: ['#eef0f4'] } },
  ר: { princess: { kind: 'ray', colors: [PALETTE.scarlet] } },
  ש: {
    prince: { kind: 'fleck', colors: [PALETTE.gold] },
    princess: { kind: 'fleck', colors: [PALETTE.crimson, PALETTE.emerald] },
  },
  ת: { princess: { kind: 'ray', colors: [PALETTE.blue] } },
}

// ---- Ink on a colour ---------------------------------------------------------------

// Black or white, whichever reads better on `background` (a hex colour):
// the one with the greater contrast ratio, as WCAG measures it.
export function inkOn(background: string): '#000000' | '#ffffff' {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(background.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const onBlack = (luminance + 0.05) / 0.05
  const onWhite = 1.05 / (luminance + 0.05)
  return onBlack > onWhite ? '#000000' : '#ffffff'
}

// ---- The BOTA colour wheel ------------------------------------------------------

// Paul Foster Case's twelve-step colour wheel, as the Builders of the
// Adytum teach it, for the models that follow Case rather than the Golden
// Dawn (the Cube of Space). It is a scale of its own, not a reading of the
// King scale: Leo is plain yellow, the Mother letters are full yellow,
// blue and red, and Saturn shares Capricorn's blue-violet. The values are
// botatoolbox's default palette: six Tailwind anchors (red, orange,
// yellow, green, blue, violet), each in-between step the even blend of
// its two neighbours.
export const BOTA_SCREEN_PALETTE = {
  red: '#FB2C36',
  redOrange: '#FD4A1B',
  orange: '#FF6900',
  orangeYellow: '#FE9800',
  yellow: '#FDC700',
  yellowGreen: '#7EC23E',
  green: '#00BC7D',
  greenBlue: '#169EBE',
  blue: '#2B7FFF',
  blueViolet: '#5C68FF',
  violet: '#8E51FF',
  violetRed: '#C43E9A',
} as const

export type BotaColorName = keyof typeof BOTA_SCREEN_PALETTE

// The same twelve colours as BOTA paints them on its Tree of Life (the
// 1975 poster), sampled from the paths: deeper and more saturated than the
// screen blend above, the blues and violets especially. Where a path is
// mostly covered by its Tarot card, the colour is read from the stubs
// showing either side of the card, allowing for the airbrushed highlight.
export const BOTA_POSTER_PALETTE: Record<BotaColorName, string> = {
  red: '#e8201a',
  redOrange: '#ee4a22',
  orange: '#f86514',
  orangeYellow: '#f2a32a',
  // The poster's yellow paths are a light lemon, near pastel.
  yellow: '#fbec6c',
  yellowGreen: '#8cc43c',
  green: '#2c9a6a',
  greenBlue: '#3a8fb0',
  blue: '#1f42ad',
  blueViolet: '#4f3fa0',
  violet: '#7c3b98',
  violetRed: '#9d1b37',
}

// The wheel colour of each Hebrew letter, after botatoolbox's tarot data.
export const BOTA_LETTER_COLORS: Record<string, BotaColorName> = {
  א: 'yellow',
  ב: 'yellow',
  ג: 'blue',
  ד: 'green',
  ה: 'red',
  ו: 'redOrange',
  ז: 'orange',
  ח: 'orangeYellow',
  ט: 'yellow',
  י: 'yellowGreen',
  כ: 'violet',
  ל: 'green',
  מ: 'blue',
  נ: 'greenBlue',
  ס: 'blue',
  ע: 'blueViolet',
  פ: 'red',
  צ: 'violet',
  ק: 'violetRed',
  ר: 'orange',
  ש: 'red',
  ת: 'blueViolet',
}

// ---- Case's Sephiroth -----------------------------------------------------------

// The Sephiroth as Paul Foster Case has the student picture them before
// concentration practice: "picture the white light of Kether descending
// through the course of the lightning-flash on the Tree of Life, changing
// color as it passes from Sephirah to Sephirah – from the white of Kether
// to the opalescent gray of Chokmah, from this to the black of Binah, and
// so on, until you reach Malkuth, where you should visualize the
// color-cross of the four elements: Citrine, Russet, Slate and Black"
// (Section C, lesson 2). The lesson names only those; the rest ("and so
// on") are BOTA's usual Sephirah colours: Chesed blue, Geburah red,
// Tiphareth yellow, Netzach green, Hod orange, Yesod violet. The shades
// themselves are taken from BOTA's painting of the Tree.
export const BOTA_SEPHIRAH_COLORS = {
  // Matched to BOTA's own painting of the Tree (the 1975 poster), sampled
  // from the body of each sphere away from its highlight and its lettering.
  kether: '#f5eee8',
  chokmah: '#a19e9c',
  binah: '#141219',
  chesed: '#1d52a8',
  geburah: '#e3190e',
  tiphareth: '#fee043',
  netzach: '#1e8869',
  hod: '#fb5e0d',
  yesod: '#5a2656',
  // Malkuth's colour-cross, by quarter, as the poster paints it: an olive
  // citrine above, russet to the left, a dark slate to the right and black
  // below.
  citrine: '#6b7a3a',
  russet: '#a2451a',
  slate: '#342c3c',
  black: '#0e0b0d',
} as const
