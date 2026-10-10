// The Shem HaMephorash, the 72 Names drawn from Exodus 14:19–21, set on a
// wheel, with a pentagram turning inside it: Dan Moore's Pentagram
// Technique ("Introducing the Shem HaMephorash Pentagram Technique for
// Working the 72 Angelic Names", pansophers.com, 2020, and the two PDFs
// published with it, the instructions and the chart of the 72 sets). The
// method came to him from the Fraternity of the Golden Circle.
//
// Put the pentagram's top point, Spirit, on the Name to be worked with
// (the Essential Name) and its other four points fall on four more: one
// Name each for Fire, Water, Air and Earth. The five together are the
// Name's formula.
//
// The wheel: 72 slices of 5° each, numbered anticlockwise, as the
// Zodiac is drawn, with Name 1 starting at the left (0° Aries on the
// eastern horizon, as an astrological chart has it and as on Moore's
// "Pentagram within the Zodiac"), so that Name 55 starts at the top.
// Only the direction matters to the formulas: numbered clockwise, Air
// and Water would change places, and Fire and Earth.
//
// Angles are counted anticlockwise from the right, in degrees, as in
// mathematics; the drawing turns them into the screen's own.

import {
  LETTER_COLORS,
  LETTER_MARKS,
  LETTER_SCALES,
  PALETTE,
  type Mark,
  type Scale,
} from './colors'

export interface ShemName {
  // 1 to 72.
  number: number
  // The three letters, as Moore's chart writes them (final forms where
  // the chart has them).
  hebrew: string
  // The angel's name, in Lenain's spelling (La Science cabalistique,
  // 1823), which the Golden Dawn's lists follow. Spellings vary between
  // sources.
  angel: string
  // The Name's power or virtue, as Moore's chart titles it.
  meaning: string
}

const rows: [string, string, string][] = [
  ['והו', 'Vehuiah', 'Discovery & Healing of any Negative Cause'],
  ['ילי', 'Jeliel', 'Redeeming Holy Sparks'],
  ['סיט', 'Sitael', 'The Art of Miracles'],
  ['עלם', 'Elemiah', 'Healing Negative Thoughts & Feelings'],
  ['מהש', 'Mahasiah', 'Healing'],
  ['ללה', 'Lelahel', 'Dream Work'],
  ['אכא', 'Achaiah', 'Restoring Everything to its Perfect State'],
  ['כהת', 'Cahetel', 'Banishing Stress and Darkness'],
  ['הזי', 'Haziel', 'Contacting Angels'],
  ['אלד', 'Aladiah', 'Protection from Evil Intentions'],
  ['לאו', 'Lauviah', 'Purifying Places & Spaces from Darkness'],
  ['ההע', 'Hahaiah', 'Unconditional Love'],
  ['יזל', 'Iezalel', 'Creating Harmony Within & Without'],
  ['מבה', 'Mebahel', 'Overcoming All Conflict'],
  ['הרי', 'Hariel', 'Foresight'],
  ['הקם', 'Hakamiah', 'Overcoming Depression'],
  ['לאו', 'Lauviah', 'Liberation from the Not-Self'],
  ['כלי', 'Caliel', 'Fecundity'],
  ['לוו', 'Leuviah', 'Connection with God'],
  ['פהל', 'Pahaliah', 'Victory over Ego'],
  ['נלך', 'Nelchael', 'Healing Mass Sickness'],
  ['ייי', 'Ieiaiel', 'Divine Energy'],
  ['מלה', 'Melahel', 'Sharing Spiritual Wisdom'],
  ['חהו', 'Haheuiah', 'Accepting Responsibility'],
  ['נתה', 'Nith-Haiah', 'Speak & Listen to Truth'],
  ['האא', 'Haaiah', 'Order from Chaos'],
  ['ירת', 'Ierathel', 'Unreserved Dedication to Life'],
  ['שאה', 'Seheiah', 'Soul Mates'],
  ['ריי', 'Reiiel', 'Overcoming Hatred'],
  ['אום', 'Omael', 'Mending Broken Relationships'],
  ['לכב', 'Lecabel', 'Power of Perseverance'],
  ['ושר', 'Vasariah', 'Memory'],
  ['יחו', 'Iehuiah', 'Revealing and Overcoming Darkness'],
  ['להח', 'Lehahiah', 'Transcending the Limits of Ego'],
  ['כוק', 'Chavakiah', 'Mystery of Sex'],
  ['מנד', 'Menadel', 'Overcoming Fear'],
  ['אני', 'Aniel', 'The Ultimate Purpose of Life'],
  ['חעם', 'Haamiah', 'Mystery of Exchange'],
  ['רהע', 'Rehael', 'Blessing Concealed within Adversity'],
  ['ייז', 'Ieiazel', 'Right or Magical Speech'],
  ['ההה', 'Hahahel', 'Self Realization'],
  ['מיכ', 'Mikael', 'Revelation of All Mysteries'],
  ['וול', 'Veuliah', 'Conscious Co-Creation'],
  ['ילה', 'Ielahiah', 'Alleviating Karma'],
  ['סאל', 'Sealiah', 'Power of Prosperity'],
  ['ערי', 'Ariel', 'Confident Expectation'],
  ['עשל', 'Asaliah', 'World Peace & Completeness'],
  ['מיה', 'Mihael', 'Unity'],
  ['והו', 'Vehuel', 'Enduring Happiness'],
  ['דני', 'Daniel', 'Achieving Completion and Perfection'],
  ['החש', 'Hahasiah', 'Returning to the Light'],
  ['עמם', 'Imamiah', 'Intensity of Intention'],
  ['ננא', 'Nanael', 'Giving of One’s Self without an Agenda'],
  ['נית', 'Nithael', 'Transcending Death'],
  ['מבה', 'Mebahiah', 'Thought Manifesting as Action'],
  ['פוי', 'Poiel', 'Alleviating Anger'],
  ['נמם', 'Nemamiah', 'Listening to Your Soul'],
  ['ייל', 'Ieialel', 'Accepting the Positive'],
  ['הרח', 'Harahel', 'Connecting with the Light'],
  ['מצר', 'Mitzrael', 'Endurance of Transformation'],
  ['ומב', 'Umabel', 'Purifying Water'],
  ['יהה', 'Iahhel', 'Enlightened Teacher'],
  ['ענו', 'Anauel', 'Gratitude and Appreciation'],
  ['מחי', 'Mehiel', 'Being a Positive Persona'],
  ['דמב', 'Damabiah', 'Knowing the Consequences of Our Actions'],
  ['מנק', 'Manakel', 'Accountability'],
  ['איע', 'Eiael', 'Knowing the True Will'],
  ['חבו', 'Habuhiah', 'Contacting Departed Souls'],
  ['ראה', 'Rochel', 'Guidance upon the Path'],
  // The chart writes a medial Mem here, where most lists have יבם.
  ['יבמ', 'Jabamiah', 'Recognizing Design beneath Disorder'],
  ['היי', 'Haiaiel', 'Prophetic Consciousness'],
  ['מום', 'Mumiah', 'Cleansing Waters'],
]

// The meanings are those of the chart's first column (the Essential
// Name). Where the chart titles a Name differently in another column (a
// slip: 63 as "Overcoming Fear", 52 as "Returning to the Light"), the
// first column is followed.
export const NAMES: ShemName[] = rows.map(([hebrew, angel, meaning], i) => ({
  number: i + 1,
  hebrew,
  angel,
  meaning,
}))

export const NAME_COUNT = NAMES.length

// The Name numbered `n`, counting round the wheel: 73 is 1 again, 0 is 72.
export function nameAt(n: number): ShemName {
  return NAMES[(((n - 1) % NAME_COUNT) + NAME_COUNT) % NAME_COUNT]
}

// ---- Sharing a Name by its link --------------------------------------------------

// A link can open the page on a Name, as `?name=33`, so that a formula can
// be shared by its link.
export const NAME_PARAM = 'name'

// The Name a page address asks for (its query string, as
// `location.search`), or null if it asks for none, or for something that
// isn't one of the 72.
export function nameFromSearch(search: string): number | null {
  const value = new URLSearchParams(search).get(NAME_PARAM)
  if (value === null || !/^\d+$/.test(value)) return null
  const n = Number(value)
  return n >= 1 && n <= NAME_COUNT ? n : null
}

// ---- The five points -------------------------------------------------------------

export type PointId = 'spirit' | 'fire' | 'water' | 'air' | 'earth'

export interface Point {
  id: PointId
  element: string
  // The letter of the Pentagrammaton, Yeheshuah (יהשוה), on this point.
  letter: string
  letterName: string
  // The point's part in the formula, as the instructions' diagram labels
  // its arm, and the Eternity (Olam) it stands for, as the diagram names
  // it beside the point: Nearness is Atziluth, Creation Briah, Formation
  // Yetzirah and Action Assiah (the chart's columns shorten them to
  // Nearness, Creative, Formative and Action). Spirit's is the
  // Quintessence.
  role: string
  eternity: string
  // What it says of the Essential Name, in Moore's own words from the
  // instructions, made into a sentence ("…" marks a cut).
  sense: string
  // How many Names on from the Essential Name, anticlockwise.
  offset: number
  // Where the point is on an upright star, anticlockwise from the top:
  // 0 is the top, 1 upper left, 2 lower left, 3 lower right, 4 upper
  // right.
  vertex: number
}

// The points in the order the instructions take them, which is the order
// a pentagram is drawn: Spirit, then down to Fire, across to Air, over to
// Water, down to Earth and back up to Spirit.
//
// The offsets are the chart's: in every one of its 72 rows Air is 14
// Names on, Earth 28, Fire 43 and Water 57.
//
// The points carry no element colours. Moore's own two are at odds (his
// chart heads Earth's column green, his diagram paints its Heh black, the
// Golden Dawn's colour for Earth), and with the letters, the Zodiac and
// the planets in colour, the points read more clearly without: they are
// white, Spirit, the Essential Name, set apart as a filled disc.
export const POINTS: Point[] = [
  {
    id: 'spirit',
    element: 'Spirit',
    letter: 'ש',
    letterName: 'Shin',
    // The diagram's "The Most Essential", shortened.
    role: 'Essential',
    eternity: 'Quintessence',
    sense: 'The power, virtue or quality you wish to work with.',
    offset: 0,
    vertex: 0,
  },
  {
    id: 'fire',
    element: 'Fire',
    letter: 'י',
    letterName: 'Yod',
    role: 'Wisdom',
    eternity: 'Eternity of Nearness',
    sense: 'The inner-living essence of the Essential Name.',
    offset: 43,
    vertex: 3,
  },
  {
    id: 'air',
    element: 'Air',
    letter: 'ו',
    letterName: 'Vav',
    role: 'Theory',
    eternity: 'Eternity of Formation',
    sense:
      'The pattern or ‘blueprint’… the theory explaining the dynamics at work.',
    offset: 14,
    vertex: 1,
  },
  {
    id: 'water',
    element: 'Water',
    letter: 'ה',
    letterName: 'Heh',
    role: 'Practicality',
    eternity: 'Eternity of Creation',
    sense: 'The structure and process working in the background.',
    offset: 57,
    vertex: 4,
  },
  {
    id: 'earth',
    element: 'Earth',
    letter: 'ה',
    letterName: 'Heh (final)',
    role: 'Life',
    eternity: 'Eternity of Action',
    sense:
      'The manifestation of and the application to all aspects of one’s life.',
    offset: 28,
    vertex: 2,
  },
]

export interface FormulaEntry {
  point: Point
  name: ShemName
}

// The five-part formula of the Essential Name numbered `n`, in the order
// of POINTS.
export function formula(n: number): FormulaEntry[] {
  return POINTS.map((point) => ({ point, name: nameAt(n + point.offset) }))
}

// ---- The wheel's geometry -------------------------------------------------------

export const SLICE = 360 / NAME_COUNT

// Name 1 starts at the left of the wheel.
const START = 180

// Where the slice of Name `n` begins and ends, and its middle.
export function sliceStart(n: number): number {
  return START + (n - 1) * SLICE
}
export function sliceMiddle(n: number): number {
  return sliceStart(n) + SLICE / 2
}

// The pentagram's points are 72° apart, which is 14.4 Names, so they
// can't all sit in the middle of a slice. Spirit is set on the start of
// its Name's arc, as the chart reckons it: the others then fall
// four-tenths, eight-tenths, two-tenths and six-tenths of the way into the
// slices the chart names. Set on the middle instead, Earth and Water
// would land in the slice past the chart's. Spirit itself sits on the
// line before its Name; the Name's slice is lit, so there is no doubt
// which it is.
export function spiritAngle(n: number): number {
  return sliceStart(n)
}

// Where a point of the star is, when it is set on Name `n`.
export function pointAngle(n: number, point: Point): number {
  return spiritAngle(n) + point.vertex * 72
}

// The Name a zodiac longitude falls in (degrees from 0° Aries): each
// rules five degrees, from Name 1 at the start of Aries.
export function nameAtLongitude(lon: number): number {
  const turned = ((lon % 360) + 360) % 360
  return Math.floor(turned / SLICE) + 1
}

// Where a zodiac longitude is on the wheel, as an angle.
export function longitudeAngle(lon: number): number {
  return START + lon
}

// Which Name's slice an angle falls in.
export function nameAtAngle(angle: number): number {
  const turned = (((angle - START) % 360) + 360) % 360
  return Math.floor(turned / SLICE) + 1
}

// How far the star turns from upright (Spirit at the top, 90°) to stand
// on Name `n`, anticlockwise, between −180° and 180°.
export function starTurn(n: number): number {
  const turn = (((spiritAngle(n) - 90) % 360) + 360) % 360
  return turn > 180 ? turn - 360 : turn
}

// The turn closest to `from` that leaves the star in the same place as
// `to`, so that stepping from Name 72 to Name 1 turns the star a slice,
// not all the way round.
export function nearestTurn(from: number, to: number): number {
  return to + 360 * Math.round((from - to) / 360)
}

// ---- Spinning it by hand ----------------------------------------------------------

// A turn, as starTurn gives it but unwrapped (any number of times round),
// stands on a Name when it is starTurn of that Name, give or take whole
// turns: 90° plus five degrees a Name. These are the way back, for a
// wheel or star turned by hand to any angle.

// The Name a turn stands on, or is nearest to.
export function nameAtTurn(turn: number): number {
  const steps = Math.round((turn - 90) / SLICE)
  return (((steps % NAME_COUNT) + NAME_COUNT) % NAME_COUNT) + 1
}

// The nearest turn that stands on a Name.
export function snapTurn(turn: number): number {
  return 90 + SLICE * Math.round((turn - 90) / SLICE)
}

// Below this speed, in degrees a millisecond, a released wheel settles on
// the nearest Name rather than coasting: a hand that lets go slowly means
// to place it, not to throw it.
export const FLICK_SPEED = 0.25

// How quickly a coasting wheel slows: its speed falls by e every this many
// milliseconds, so it goes on for this long times its speed, in degrees,
// before it would stop. Heavy, as tools of this kind go: a hard flick
// (some 1,500° a second) carries it about one and a third turns.
export const COAST_MS = 325

// Where a wheel let go at `turn`, moving at `speed` (degrees a
// millisecond, either way), comes to rest, and in how long: on a Name
// always, the nearest to where it would have stopped. The time is set so
// that an ease-out curve over it starts at the speed it was let go at.
export function coast(
  turn: number,
  speed: number,
): { to: number; duration: number } {
  if (Math.abs(speed) < FLICK_SPEED) {
    return { to: snapTurn(turn), duration: 250 }
  }
  const to = snapTurn(turn + speed * COAST_MS)
  // An ease-out cubic leaves at three times its average speed.
  const duration = (3 * Math.abs(to - turn)) / Math.abs(speed)
  return { to, duration: Math.min(2500, Math.max(250, duration)) }
}

// ---- The Zodiac around it --------------------------------------------------------

// Six Names to a sign, from Aries at Name 1, after the Golden Dawn's
// attribution of the Names to the quinances (five-degree arcs) of the
// Zodiac, which Moore's wheel follows.
export const SIGNS = [
  { name: 'Aries', glyph: '♈' },
  { name: 'Taurus', glyph: '♉' },
  { name: 'Gemini', glyph: '♊' },
  { name: 'Cancer', glyph: '♋' },
  { name: 'Leo', glyph: '♌' },
  { name: 'Virgo', glyph: '♍' },
  { name: 'Libra', glyph: '♎' },
  { name: 'Scorpio', glyph: '♏' },
  { name: 'Sagittarius', glyph: '♐' },
  { name: 'Capricorn', glyph: '♑' },
  { name: 'Aquarius', glyph: '♒' },
  { name: 'Pisces', glyph: '♓' },
] as const

export function signOf(n: number) {
  return SIGNS[Math.floor((nameAt(n).number - 1) / 6)]
}

// ---- The letters' colours ---------------------------------------------------------

// Moore paints each letter of a Name in the Golden Dawn's colour scales,
// shading down through all four, King at the top to Princess at the
// bottom: "the out-flowing of power from the Source of vitality to
// actualization". letterColor gives the King's alone, for letters too
// small to show the four; letterScales all four, top to bottom.
const FINALS: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
}

const base = (letter: string) => FINALS[letter] ?? letter

export function letterColor(letter: string): string {
  return PALETTE[LETTER_COLORS[base(letter)]]
}

export function letterScales(letter: string): string[] {
  const { queen, prince, princess } = LETTER_SCALES[base(letter)]
  return [letterColor(letter), queen, prince, princess]
}

// The scales in the order they run down a letter.
export const SCALES: Scale[] = ['king', 'queen', 'prince', 'princess']

// A letter's flecks and rays, by the scale (0 to 3, top to bottom) they
// mark.
export function letterMarks(letter: string): { scale: number; mark: Mark }[] {
  const marks = LETTER_MARKS[base(letter)] ?? {}
  return SCALES.flatMap((scale, i) =>
    marks[scale] ? [{ scale: i, mark: marks[scale] }] : [],
  )
}

// ---- Gematria -------------------------------------------------------------------

// The letters' numbers, Aleph 1 to Tau 400; the five final forms count as
// their ordinary letters, or, read as finals, from 500 to 900.
const VALUES: Record<string, number> = {
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 20,
  ל: 30,
  מ: 40,
  נ: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  צ: 90,
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
}

const FINAL_VALUES: Record<string, number> = {
  ך: 500,
  ם: 600,
  ן: 700,
  ף: 800,
  ץ: 900,
}

export interface Gematria {
  value: number
  // Counting the final letter as a final, where the Name ends in one.
  final?: number
}

// A Name's number, as Moore's chart gives it: the sum of its letters, and,
// where it ends in a final form, the sum counting that as a final too
// ("140-700" for עלם). The chart's 130-960 for Name 57, נמם, is a slip
// for 130-690.
export function gematria(hebrew: string): Gematria {
  const letters = [...hebrew]
  const value = letters.reduce((sum, l) => sum + VALUES[base(l)], 0)
  const last = letters[letters.length - 1]
  return last in FINAL_VALUES
    ? { value, final: value - VALUES[base(last)] + FINAL_VALUES[last] }
    : { value }
}

// A Name's number as the chart writes it: "345", or "140–700".
export function formatGematria(hebrew: string): string {
  const { value, final } = gematria(hebrew)
  return final === undefined ? String(value) : `${value}–${final}`
}

// ---- Aspects ------------------------------------------------------------------

// The major aspects of traditional astrology, the angles between two
// planets that count: how far apart, and how far off exact (the orb) an
// angle may be and still count, after the usual traditional orbs. A
// conjunction (0°) is among them, though on the wheel two planets in
// conjunction already sit together.
export const ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'sextile', angle: 60, orb: 5 },
  { name: 'square', angle: 90, orb: 7 },
  { name: 'trine', angle: 120, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
] as const

export type AspectName = (typeof ASPECTS)[number]['name']

export interface Aspect {
  // The two planets, by name, in the order they were given.
  between: [string, string]
  name: AspectName
  // How far off exact, in degrees.
  off: number
}

// The aspects among planets at the given longitudes (degrees): each pair
// at most once, in its closest aspect.
export function aspectsAmong(
  planets: { name: string; lon: number }[],
): Aspect[] {
  const found: Aspect[] = []
  planets.forEach((a, i) => {
    for (const b of planets.slice(i + 1)) {
      // The angle between them, the short way round: 0° to 180°.
      const apart = Math.abs(((b.lon - a.lon + 540) % 360) - 180)
      const aspect = ASPECTS.map((x) => ({
        ...x,
        off: Math.abs(apart - x.angle),
      }))
        .filter((x) => x.off <= x.orb)
        .sort((x, y) => x.off - y.off)[0]
      if (aspect)
        found.push({
          between: [a.name, b.name],
          name: aspect.name,
          off: aspect.off,
        })
    }
  })
  return found
}
