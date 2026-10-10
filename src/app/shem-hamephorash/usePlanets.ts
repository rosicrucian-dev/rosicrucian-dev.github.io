import { useEffect, useMemo, useState } from 'react'

import { placePlanets, type PlacedPlanet } from '@/lib/planets'
import { tropicalLongitude } from '@/lib/realSky'

// The seven planets as the wheel shows them: where each is in the zodiac
// today, in the reckoning chosen, with its colour (the Golden Dawn's,
// shared with the Tree of Life Sphere) and its glyph.
export interface WheelPlanet {
  name: string
  glyph: string
  color: string
  // Degrees from 0° Aries.
  lon: number
}

const GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
}

// Where the planets are as the page opens, while `on`; none until they are
// worked out, or when off. The ephemeris is fetched only when asked for.
// Not followed as the day goes on: even the Moon, the quickest, takes some
// nine hours to cross a Name.
export function usePlanets(
  on: boolean,
  reckoning: 'sidereal' | 'tropical',
): WheelPlanet[] {
  const [placed, setPlaced] = useState<{
    date: Date
    planets: PlacedPlanet[]
  } | null>(null)

  useEffect(() => {
    if (!on) return
    let live = true
    const date = new Date()
    placePlanets(date).then((planets) => {
      if (live) setPlaced({ date, planets })
    })
    return () => {
      live = false
    }
  }, [on])

  return useMemo(
    () =>
      on && placed
        ? placed.planets.map((p) => ({
            name: p.name,
            glyph: GLYPHS[p.name],
            color: p.color,
            // The sphere's longitudes are sidereal, from Regulus.
            lon:
              reckoning === 'tropical'
                ? tropicalLongitude(p.lon, placed.date)
                : p.lon,
          }))
        : [],
    [on, placed, reckoning],
  )
}
