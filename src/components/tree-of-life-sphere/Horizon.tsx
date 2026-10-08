// The ground under a real observer.

import { useMemo } from 'react'
import { BackSide, DoubleSide } from 'three'

import { fromHorizon } from '@/lib/realSky'
import type { Vec3 } from '@/lib/treeOfLifeSphere'

import { ribbonGeometry } from './geometry'
import type { Fonts } from '@/components/model/fonts'

import { Label } from './Label'
import { ORDER, R_HORIZON, R_LABELS, scaled, useDispose } from './layout'

const HORIZON_COLOR = '#a9dccf'
const CARDINALS: [string, number][] = [
  ['N', 0],
  ['E', 90],
  ['S', 180],
  ['W', 270],
]

// Everything below the observer's horizon is shaded (still visible, so you
// can see where the rest of the Tree lies beneath your feet), with the
// horizon line and the compass points on it.
export function Horizon({ fonts }: { fonts: Fonts | null }) {
  const ring = useMemo(() => {
    const points: Vec3[] = []
    for (let azimuth = 0; azimuth <= 360; azimuth += 2) {
      points.push(fromHorizon(azimuth, 0))
    }
    return ribbonGeometry(points, 0.12, R_HORIZON)
  }, [])
  useDispose(ring)

  return (
    <>
      <mesh renderOrder={ORDER.ground}>
        {/* The lower half of a sphere, seen from inside. */}
        <sphereGeometry
          args={[R_HORIZON, 48, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
        />
        <meshBasicMaterial
          color="#020308"
          transparent
          opacity={0.62}
          side={BackSide}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={ring} renderOrder={ORDER.horizon}>
        <meshBasicMaterial
          color={HORIZON_COLOR}
          transparent
          opacity={0.7}
          side={DoubleSide}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {fonts &&
        CARDINALS.map(([name, azimuth]) => (
          <Label
            key={name}
            text={name}
            position={scaled(fromHorizon(azimuth, 3.5), R_LABELS)}
            height={0.6}
            font={fonts.caps}
            color={HORIZON_COLOR}
            weight={600}
          />
        ))}
    </>
  )
}
