// The seven classical planets, where they are right now.

import { useEffect, useMemo, useState } from 'react'
import { DoubleSide } from 'three'

import { placePlanets, type PlacedPlanet } from '@/lib/planets'
import { toVector } from '@/lib/treeOfLifeSphere'

import { capGeometry, haloGeometry, RADIUS } from './geometry'
import type { Fonts } from '@/components/model/fonts'

import { Label } from './Label'
import { ORDER, R_LABELS, R_NODES, scaled, stacked, useDispose } from './layout'

// How often the planets are moved. The Moon, much the fastest, covers its
// own width in about an hour, so a minute is plenty.
const PLANET_TICK = 60 * 1000
// How far the pale glow around each planet spreads past its edge, in
// degrees of arc.
const PLANET_GLOW = 0.3

function usePlanets(): PlacedPlanet[] {
  const [planets, setPlanets] = useState<PlacedPlanet[]>([])
  useEffect(() => {
    let live = true
    const place = () =>
      placePlanets(new Date())
        .then((placed) => {
          if (live) setPlanets(placed)
        })
        // The sphere is complete without them; they just stay off it.
        .catch((error) =>
          console.warn('Tree of Life sphere: no planets', error),
        )
    place()
    const timer = setInterval(place, PLANET_TICK)
    return () => {
      live = false
      clearInterval(timer)
    }
  }, [])
  return planets
}

// One planet: a disc in its Golden Dawn colour inside a soft white glow
// (which is what keeps indigo Saturn and blue Moon from sinking into the
// sky), and its name beneath.
function PlanetMarker({
  planet,
  index,
  fonts,
}: {
  planet: PlacedPlanet
  index: number
  fonts: Fonts | null
}) {
  const center = useMemo(
    () => toVector(planet.lon, planet.lat),
    [planet.lon, planet.lat],
  )
  const disc = useMemo(
    () => capGeometry(center, planet.radius, R_NODES, planet.color),
    [center, planet.radius, planet.color],
  )
  useDispose(disc)
  const glow = useMemo(
    () =>
      haloGeometry(
        center,
        planet.radius - 0.15,
        planet.radius + PLANET_GLOW,
        R_NODES,
        '#ffffff',
      ),
    [center, planet.radius],
  )
  useDispose(glow)

  const labelHeight = 0.3
  const offset =
    RADIUS * Math.tan(((planet.radius + PLANET_GLOW * 0.5) * Math.PI) / 180)

  return (
    <>
      {/* The glow goes under the disc, so the disc's own edge stays crisp
          and the white only spreads outward. */}
      <mesh geometry={glow} renderOrder={stacked(ORDER.planets, index * 2)}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={disc} renderOrder={stacked(ORDER.planets, index * 2 + 1)}>
        <meshBasicMaterial
          vertexColors
          depthWrite={false}
          transparent
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {fonts && (
        <Label
          text={planet.name}
          position={scaled(center, R_LABELS)}
          height={labelHeight}
          font={fonts.caps}
          // Small quiet capitals, like the sign and constellation names:
          // the coloured disc is the marker, the name only identifies it.
          color="#d8d2c2"
          weight={500}
          tracking={0.18}
          uppercase
          opacity={0.8}
          center={[0.5, 1 + offset / labelHeight]}
        />
      )}
    </>
  )
}

export function Planets({ fonts }: { fonts: Fonts | null }) {
  const planets = usePlanets()
  return planets.map((planet, index) => (
    <PlanetMarker
      key={planet.name}
      planet={planet}
      index={index}
      fonts={fonts}
    />
  ))
}
