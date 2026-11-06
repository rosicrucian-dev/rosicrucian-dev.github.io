// The seven classical planets, placed on the sphere where they really are
// right now.
//
// This is the one part of the page that needs an ephemeris: the stars are
// fixed, the planets wander. Positions are geocentric (as seen from the
// centre of the Earth), which is exact enough to find a planet in the sky;
// only the Moon, close as it is, can sit up to a degree away from where a
// particular observer sees it.

import { sphereFromEquatorial } from './realSky'
import { PATH_BY_NUMBER } from './tree'

export interface Planet {
  name: string
  // Golden Dawn planetary colour: that of the planet's path on the Tree.
  color: string
  // Marker radius on the sphere, degrees. The two lights are drawn larger.
  radius: number
}

const colorOfPath = (number: number) => PATH_BY_NUMBER.get(number)!.color

// Each with the path its colour comes from.
export const PLANETS: Planet[] = [
  { name: 'Sun', color: colorOfPath(30), radius: 1.5 }, // Resh, orange
  { name: 'Moon', color: colorOfPath(13), radius: 1.5 }, // Gimel, blue
  { name: 'Mercury', color: colorOfPath(12), radius: 1 }, // Beth, yellow
  { name: 'Venus', color: colorOfPath(14), radius: 1 }, // Daleth, green
  { name: 'Mars', color: colorOfPath(27), radius: 1 }, // Peh, red
  { name: 'Jupiter', color: colorOfPath(21), radius: 1 }, // Kaph, violet
  { name: 'Saturn', color: colorOfPath(32), radius: 1 }, // Tav, indigo
]

export interface PlacedPlanet extends Planet {
  // In the sphere's own frame, degrees.
  lon: number
  lat: number
}

// Where each planet is at `date`. The ephemeris is a sizeable library, so it
// is only fetched when something actually asks for planets.
export async function placePlanets(date: Date): Promise<PlacedPlanet[]> {
  const { Body, GeoVector } = await import('astronomy-engine')
  return PLANETS.map((planet) => {
    const body = Body[planet.name as keyof typeof Body]
    // With aberration, so it is where the planet appears, not where it is.
    const { x, y, z } = GeoVector(body, date, true)
    return { ...planet, ...sphereFromEquatorial(x, y, z) }
  })
}
