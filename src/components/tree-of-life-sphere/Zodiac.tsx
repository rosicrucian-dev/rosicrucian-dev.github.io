// The ecliptic and the signs along it.

import { useEffect, useMemo } from 'react'
import { DoubleSide } from 'three'

import { SIGNS, toVector, type Vec3 } from '@/lib/treeOfLifeSphere'

import { ribbonGeometry } from './geometry'
import type { Fonts } from '@/components/model/fonts'

import { Label } from './Label'
import { ORDER, R_LABELS, R_ZODIAC, scaled, useDispose } from './layout'

const ZODIAC_COLOR = '#e6c76e'

// The ecliptic (the Sun's path, and the line of the four Tiphareth
// points) with a tick at the start of each sign, counted from Regulus.
export function Zodiac({
  fonts,
  labels,
}: {
  fonts: Fonts | null
  labels: boolean
}) {
  const ecliptic = useMemo(() => {
    const ring: Vec3[] = []
    for (let lon = 0; lon <= 360; lon++) ring.push(toVector(lon, 0))
    return ribbonGeometry(ring, 0.11, R_ZODIAC)
  }, [])
  useDispose(ecliptic)

  const ticks = useMemo(() => {
    const meridians: Vec3[][] = []
    for (let lon = 0; lon < 360; lon += 30) {
      meridians.push([-5, 0, 5].map((lat) => toVector(lon, lat)))
    }
    return meridians.map((m) => ribbonGeometry(m, 0.11, R_ZODIAC))
  }, [])
  useEffect(() => () => ticks.forEach((t) => t.dispose()), [ticks])

  return (
    <>
      {[ecliptic, ...ticks].map((geometry, i) => (
        <mesh key={i} geometry={geometry} renderOrder={ORDER.zodiac}>
          <meshBasicMaterial
            color={ZODIAC_COLOR}
            transparent
            opacity={0.55}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      {labels &&
        fonts &&
        SIGNS.map((sign, i) => (
          <Label
            key={sign}
            text={sign}
            position={scaled(toVector(i * 30 + 15, -7.5), R_LABELS)}
            height={0.4}
            font={fonts.caps}
            color={ZODIAC_COLOR}
            weight={500}
            tracking={0.22}
            uppercase
            opacity={0.9}
          />
        ))}
    </>
  )
}
