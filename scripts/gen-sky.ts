// Generates the star map behind /tree-of-life-sphere:
//
//   - public/tree-of-life-sphere/sky.json   stars, constellation lines,
//                                           names and art anchors
//   - public/tree-of-life-sphere/art/*.webp constellation figures
//
// Everything is baked into the sphere's own frame so the page does no
// astronomy at runtime: ecliptic latitude, and ecliptic longitude counted
// from Regulus as 0° Leo (the Golden Dawn reckoning, see src/lib/treeOfLifeSphere.ts).
// That frame is pinned to the stars themselves, so it never goes stale.
//
// Sources (each pinned to an exact commit, below):
//   - Stars, lines, names: d3-celestial by Olaf Frohn, BSD 3-Clause.
//   - Figures and their anchor stars: Stellarium's Modern sky culture.
//     Illustrations by Johan Meuris, Free Art License; anchor data
//     CC BY-SA 4.0. Both are credited in public/tree-of-life-sphere/NOTICE.md
//     and on the page itself.
//
// Run with: npm run gen:sky  (then commit public/tree-of-life-sphere)

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import sharp from 'sharp'

import { sphereFromEquatorial } from '../src/lib/realSky.ts'

// Both sources are pinned to an exact commit, so that running this again
// produces the same sky, whatever has happened upstream since. To take
// newer data, change a commit here and check what the run changes.
const D3_CELESTIAL_COMMIT = '7e720a3de062059d4c5400a379146a601d9010e0' // 2022-07-05
// The commit that last touched Stellarium's Modern sky culture.
const STELLARIUM_COMMIT = 'daace2add6a1bf886e8ee1934f51e9c69f818d18' // 2026-03-05

const D3_CELESTIAL = `https://raw.githubusercontent.com/ofrohn/d3-celestial/${D3_CELESTIAL_COMMIT}/data`
const STELLARIUM = `https://raw.githubusercontent.com/Stellarium/stellarium/${STELLARIUM_COMMIT}/skycultures/modern`

const OUT_DIR = join('public', 'tree-of-life-sphere')
const ART_DIR = join(OUT_DIR, 'art')

// Naked-eye limit. ~5,000 stars, which is what a dark sky actually shows.
const MAG_LIMIT = 6

const REGULUS_HIP = 49669
const ZODIAC = new Set(
  'Ari Tau Gem Cnc Leo Vir Lib Sco Sgr Cap Aqr Psc'.split(' '),
)

interface Feature<G, P> {
  id: string | number
  properties: P
  geometry: { coordinates: G }
}
interface Collection<G, P> {
  features: Feature<G, P>[]
}
type LonLat = [number, number]

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)
  return (await res.json()) as T
}

const round = (n: number, places = 2) => {
  const f = 10 ** places
  return Math.round(n * f) / f
}

const [stars6, stars8, lines, names, stellarium] = await Promise.all([
  getJson<Collection<LonLat, { mag: number; bv: string }>>(
    `${D3_CELESTIAL}/stars.6.json`,
  ),
  // Only used to look up the fainter anchor stars under the figures.
  getJson<Collection<LonLat, { mag: number; bv: string }>>(
    `${D3_CELESTIAL}/stars.8.json`,
  ),
  getJson<Collection<LonLat[][], unknown>>(
    `${D3_CELESTIAL}/constellations.lines.json`,
  ),
  getJson<Collection<LonLat, { name: string }>>(
    `${D3_CELESTIAL}/constellations.json`,
  ),
  getJson<{
    constellations: {
      id: string
      image?: {
        file: string
        size: [number, number]
        anchors: { pos: [number, number]; hip: number }[]
      }
    }[]
  }>(`${STELLARIUM}/index.json`),
])

const equatorialByHip = new Map<number, LonLat>()
for (const s of stars8.features) {
  equatorialByHip.set(Number(s.id), s.geometry.coordinates)
}

// Equatorial J2000 -> the sphere's frame, by the same code the page uses
// to place everything else (planets, the observer's sky), so the baked
// stars can't end up in a different frame from it. d3-celestial stores
// right ascension as a longitude in (-180, 180], in degrees.
function toSphere([ra, dec]: LonLat): LonLat {
  const a = (ra * Math.PI) / 180
  const d = (dec * Math.PI) / 180
  const { lon, lat } = sphereFromEquatorial(
    Math.cos(d) * Math.cos(a),
    Math.cos(d) * Math.sin(a),
    Math.sin(d),
  )
  return [round(lon) % 360, round(lat)]
}

// That frame is defined by Regulus being 0° Leo. If this catalogue's
// Regulus doesn't land there, the catalogue and the page disagree about
// where the sky is, and nothing below should be trusted.
const regulus = equatorialByHip.get(REGULUS_HIP)
if (!regulus) throw new Error('Regulus is missing from the catalogue')
if (Math.abs(toSphere(regulus)[0] - 120) > 0.01) {
  throw new Error(`Regulus lands at ${toSphere(regulus)[0]}°, not 120°`)
}

const stars: number[] = []
for (const s of stars6.features) {
  if (s.properties.mag > MAG_LIMIT) continue
  const [lon, lat] = toSphere(s.geometry.coordinates)
  const bv = Number(s.properties.bv)
  stars.push(lon, lat, s.properties.mag, Number.isFinite(bv) ? round(bv) : 0.6)
}

const constellationLines = lines.features.map((c) => ({
  id: String(c.id),
  // One flat [lon, lat, lon, lat, …] run per stroke of the figure.
  paths: c.geometry.coordinates.map((path) => path.flatMap(toSphere)),
}))

// Serpens is two separate patches of sky and so appears twice; one label
// between them would sit in Ophiuchus, so both keep their own.
const constellationNames = names.features.map((c) => {
  const [lon, lat] = toSphere(c.geometry.coordinates)
  return { id: String(c.id), name: c.properties.name, lon, lat }
})

await rm(ART_DIR, { recursive: true, force: true })
await mkdir(ART_DIR, { recursive: true })

const art = await Promise.all(
  stellarium.constellations
    .filter((c) => c.image)
    .map(async (c) => {
      const image = c.image!
      const id = c.id.split(' ').at(-1)!
      const file = basename(image.file, '.png') + '.webp'

      const res = await fetch(`${STELLARIUM}/${image.file}`)
      if (!res.ok) throw new Error(`${res.status} fetching ${image.file}`)
      // The figures are white ink on black; the page reads them as a
      // brightness mask, so a single grey channel is all that's needed.
      const webp = await sharp(Buffer.from(await res.arrayBuffer()))
        .greyscale()
        .webp({ quality: 78 })
        .toBuffer()
      await writeFile(join(ART_DIR, file), webp)

      return {
        id,
        file,
        size: image.size,
        zodiac: ZODIAC.has(id),
        // Three stars pin each figure to the sky: pixel [x, y] from the
        // image's top left, then where that star sits on the sphere.
        anchors: image.anchors.map((a) => {
          const equatorial = equatorialByHip.get(a.hip)
          if (!equatorial) throw new Error(`HIP ${a.hip} missing for ${id}`)
          return [...a.pos, ...toSphere(equatorial)]
        }),
      }
    }),
)
art.sort((a, b) => a.id.localeCompare(b.id))

await writeFile(
  join(OUT_DIR, 'sky.json'),
  JSON.stringify({
    stars,
    lines: constellationLines,
    names: constellationNames,
    art,
  }),
)

console.log(
  `Wrote ${stars.length / 4} stars, ${constellationLines.length} constellations ` +
    `and ${art.length} figures to ${OUT_DIR}`,
)
