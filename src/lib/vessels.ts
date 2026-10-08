// The alchemical vessels of the Pansophers' article on the Tree of Life
// in the celestial sphere, shown on /tree-of-life-sphere.

// The article publishes six of its eleven alchemical vessels, each a set of
// paths. Choosing one picks those paths out on the sphere. (For two of
// them, 3 and 5, it also shows a serpent travelling the rings their paths
// close into around the sphere, without saying which way it turns; the
// page doesn't draw it.)
export interface Vessel {
  id: string
  // The vessel's number in the article.
  number: number
  // Named as the article names them, which assumes its Star/Moon switch.
  cards: string
  paths: number[]
}

export const VESSELS: Vessel[] = [
  {
    id: 'vessel-1',
    number: 1,
    cards: 'The World',
    paths: [32],
  },
  {
    id: 'vessel-2',
    number: 2,
    cards: 'Judgement and The Star',
    paths: [31, 29],
  },
  {
    id: 'vessel-3',
    number: 3,
    cards: 'The Sun and The Moon',
    paths: [30, 28],
  },
  {
    id: 'vessel-4',
    number: 4,
    cards: 'Temperance',
    paths: [25],
  },
  {
    id: 'vessel-5',
    number: 5,
    cards: 'The Devil, The Tower and Death',
    paths: [26, 27, 24],
  },
  {
    id: 'vessel-6',
    number: 6,
    cards: 'The Hanged Man and The Wheel of Fortune',
    paths: [23, 21],
  },
]

export const VESSEL_BY_ID = new Map(VESSELS.map((v) => [v.id, v]))
