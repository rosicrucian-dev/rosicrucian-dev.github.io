// The twenty-two Tarot keys as BOTA numbers and names them, by Hebrew
// letter, and where their images are kept: public/tarot/cards/<style>/
// <number>-<slug>.jpg. Both decks come from botatoolbox: "modern" is its
// default, "traditional" the classic BOTA deck. Shared by the Cube of
// Space and the Tree of Life.

export interface TarotKey {
  number: number
  name: string
  slug: string
}

export const CARD_STYLES = [
  { id: 'modern', label: 'Modern' },
  { id: 'traditional', label: 'Traditional' },
] as const

export type CardStyle = (typeof CARD_STYLES)[number]['id']

export const TAROT: Record<string, TarotKey> = {
  א: { number: 0, name: 'The Fool', slug: 'the-fool' },
  ב: { number: 1, name: 'The Magician', slug: 'the-magician' },
  ג: { number: 2, name: 'The High Priestess', slug: 'high-priestess' },
  ד: { number: 3, name: 'The Empress', slug: 'the-empress' },
  ה: { number: 4, name: 'The Emperor', slug: 'the-emperor' },
  ו: { number: 5, name: 'The Hierophant', slug: 'the-hierophant' },
  ז: { number: 6, name: 'The Lovers', slug: 'the-lovers' },
  ח: { number: 7, name: 'The Chariot', slug: 'the-chariot' },
  ט: { number: 8, name: 'Strength', slug: 'strength' },
  י: { number: 9, name: 'The Hermit', slug: 'the-hermit' },
  כ: { number: 10, name: 'The Wheel of Fortune', slug: 'the-wheel-of-fortune' },
  ל: { number: 11, name: 'Justice', slug: 'justice' },
  מ: { number: 12, name: 'The Hanged Man', slug: 'the-hanged-man' },
  נ: { number: 13, name: 'Death', slug: 'death' },
  ס: { number: 14, name: 'Temperance', slug: 'temperance' },
  ע: { number: 15, name: 'The Devil', slug: 'the-devil' },
  פ: { number: 16, name: 'The Tower', slug: 'the-tower' },
  צ: { number: 17, name: 'The Star', slug: 'the-star' },
  ק: { number: 18, name: 'The Moon', slug: 'the-moon' },
  ר: { number: 19, name: 'The Sun', slug: 'the-sun' },
  ש: { number: 20, name: 'Judgement', slug: 'judgement' },
  ת: { number: 21, name: 'The World', slug: 'the-world' },
}

// The Star/Moon switch: the Star on Qoph and the Moon on Tzaddi, as the
// Pansophers' article has them, in place of BOTA's Star on Tzaddi and Moon
// on Qoph.
const STAR_MOON: Record<string, string> = { צ: 'ק', ק: 'צ' }

// The letter whose key a path shows, with the switch or without it.
export function keyLetter(letter: string, starMoon: boolean): string {
  return starMoon ? (STAR_MOON[letter] ?? letter) : letter
}

export function tarotImage(letter: string, style: CardStyle): string {
  const key = TAROT[letter]
  return `/tarot/cards/${style}/${key.number}-${key.slug}.jpg`
}
