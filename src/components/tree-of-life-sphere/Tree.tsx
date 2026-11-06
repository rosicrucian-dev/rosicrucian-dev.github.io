// The Tree of Life itself: its sephiroth and the paths between them.

import { useEffect, useMemo } from 'react'
import { DoubleSide, type BufferGeometry } from 'three'

import {
  MALKUTH_QUARTERS,
  NODES,
  SEGMENTS,
  segmentBand,
  toVector,
  type Segment,
  type SphereNode,
  type PathCurve,
} from '@/lib/treeOfLifeSphere'
import { type Vessel } from '@/lib/vessels'
import { PATHS, type SephirahId } from '@/lib/tree'

import {
  capGeometry,
  haloGeometry,
  RADIUS,
  ribbonGeometry,
  rimGeometry,
} from './geometry'
import type { Fonts } from '@/components/model/fonts'

import { CENTERED, Label } from './Label'
import {
  ORDER,
  R_LABELS,
  R_NODES,
  R_PATHS,
  scaled,
  stacked,
  useDispose,
} from './layout'
import type { Appearance } from './types'

// Half the width of a path band, in degrees of arc.
const PATH_HALF_WIDTH = 1.25
// The paths run 'level': the three horizontal paths follow their parallel
// of latitude, closing into rings, rather than taking the shortest way.
// (lib/treeOfLifeSphere keeps the 'direct' curve too, and tests both.)
const CURVE: PathCurve = 'level'
// Where along its band a path's letter sits, as a fraction from the
// sephirah the path starts at. Halfway, except where halfway lands on a
// crossing with another path, which leaves it unclear whose letter it is:
// each horizontal path's midpoint is on the middle path, and the Heh and
// Zain midpoints are just under the Teth ring. Every letter stays at least
// 4° clear of any other path's band.
const LETTER_AT: Record<number, number> = {
  14: 0.3,
  15: 0.3,
  17: 0.3,
  19: 0.4,
  25: 0.3,
  27: 0.3,
}
// The Tiphareth and Yesod points: the dot's radius and the thickness of
// the hairline ring around it, in degrees of arc.
const POINT_DOT = 1.1
const POINT_RING = 0.16
const POINT_FLOOR = '#06070d'
// How far a sephirah's glow spreads past its edge, in degrees of arc.
const SPHERE_HALO = 1.6

// How strongly a part of the Tree is drawn: pushed back, as normal, or
// picked out.
type Level = 'dim' | 'normal' | 'strong'

// Each has a solid and a see-through setting (see Appearance). Picked out
// by a vessel, a see-through part is drawn stronger but stays see-through.
const PATH_OPACITY: Record<'opaque' | 'clear', Record<Level, number>> = {
  opaque: { dim: 0.06, normal: 1, strong: 1 },
  clear: { dim: 0.06, normal: 0.5, strong: 0.95 },
}
const NODE_OPACITY: Record<'opaque' | 'clear', Record<Level, number>> = {
  opaque: { dim: 0.12, normal: 0.96, strong: 1 },
  clear: { dim: 0.08, normal: 0.3, strong: 0.55 },
}
// A sephirah's name is inked to read against its own colour. Over a
// see-through disc it has only the sky behind it, so it goes pale instead.
const CLEAR_SPHERE_INK = '#f4efe2'
const LABEL_OPACITY: Record<Level, number> = {
  dim: 0.14,
  normal: 0.95,
  strong: 1,
}

function PathBand({
  segment,
  index,
  level,
  opaque,
  curve,
  fonts,
}: {
  segment: Segment
  index: number
  level: Level
  opaque: boolean
  curve: PathCurve
  fonts: Fonts | null
}) {
  const band = useMemo(() => segmentBand(segment, curve), [segment, curve])
  const geometry = useMemo(
    () => ribbonGeometry(band, PATH_HALF_WIDTH, R_PATHS),
    [band],
  )
  useDispose(geometry)

  return (
    <>
      <mesh geometry={geometry} renderOrder={stacked(ORDER.paths, index)}>
        <meshBasicMaterial
          color={segment.path.color}
          transparent
          opacity={PATH_OPACITY[opaque ? 'opaque' : 'clear'][level]}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {fonts && (
        <Label
          text={segment.path.hebrew}
          position={scaled(
            band[
              Math.floor(band.length * (LETTER_AT[segment.path.number] ?? 0.5))
            ],
            R_LABELS,
          )}
          height={0.78}
          font={fonts.hebrew}
          color="#ffffff"
          opacity={LABEL_OPACITY[level]}
        />
      )}
    </>
  )
}

function SephirahDisc({
  node,
  index,
  level,
  opaque,
  fonts,
}: {
  node: SphereNode
  index: number
  level: Level
  opaque: boolean
  fonts: Fonts | null
}) {
  const { sephirah } = node
  // The Tiphareth and Yesod points are only small markers, with their
  // names beside them, so they are drawn the same either way.
  const solid = opaque || sephirah.indicated === true
  const center = useMemo(() => toVector(node.lon, node.lat), [node])

  const discs = useMemo<BufferGeometry[]>(() => {
    if (sephirah.indicated) {
      return [capGeometry(center, POINT_DOT, R_NODES, sephirah.color)]
    }
    if (sephirah.id !== 'malkuth') {
      return [capGeometry(center, sephirah.radius, R_NODES, sephirah.color)]
    }
    // Each quarter spans the 90° between two pillars, centred on the
    // meridian of its own element's sign. (Around the south pole the
    // cap's angle runs opposite to longitude.)
    return MALKUTH_QUARTERS.map(({ color, lon }) =>
      capGeometry(
        center,
        sephirah.radius,
        R_NODES,
        color,
        (-(lon + 45) * Math.PI) / 180,
        Math.PI / 2,
      ),
    )
  }, [center, sephirah])
  useEffect(() => () => discs.forEach((d) => d.dispose()), [discs])

  // A point's clearing would otherwise show the sky straight through it,
  // and for the Tiphareth points that means the ecliptic and a sign tick
  // crossing right behind the dot like a gunsight. A dark floor under the
  // dot stops everything at the ring, and its shading gives the point a
  // faint glow.
  const floor = useMemo(
    () =>
      sephirah.indicated
        ? capGeometry(center, sephirah.radius, R_NODES, POINT_FLOOR)
        : null,
    [center, sephirah],
  )
  useEffect(() => () => floor?.dispose(), [floor])

  // A surface sephirah has no hard rim: its edge is the shading of the
  // disc itself, with a soft glow in its own colour spreading out past
  // it. An indicated point gets a hairline ring around its clearing
  // instead, so it reads as a marked spot on the sky rather than a body
  // sitting there.
  const edge = useMemo(
    () =>
      sephirah.indicated
        ? rimGeometry(
            center,
            sephirah.radius - POINT_RING,
            sephirah.radius,
            R_NODES,
          )
        : haloGeometry(
            center,
            sephirah.radius - 0.2,
            sephirah.radius + SPHERE_HALO,
            R_NODES,
            // Picked out by a vessel, the glow goes white.
            level === 'strong' ? '#ffffff' : sephirah.color,
          ),
    [center, sephirah, level],
  )
  useDispose(edge)

  // The surface sephiroth carry their names; the Tiphareth and Yesod
  // points are too small to, so theirs hang just beneath.
  const isPoint = sephirah.indicated === true
  const labelHeight = isPoint ? 0.62 : 0.86
  const pointRadius = RADIUS * Math.tan((sephirah.radius * Math.PI) / 180)

  return (
    <>
      {floor && (
        <mesh geometry={floor} renderOrder={stacked(ORDER.nodes - 1, index)}>
          {/* Shaded like the sephiroth, lighter toward the middle, which
              reads as a soft glow spreading out from the point. */}
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={level === 'dim' ? 0.25 : 1}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
      {discs.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          renderOrder={stacked(ORDER.nodes, index)}
        >
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={NODE_OPACITY[solid ? 'opaque' : 'clear'][level]}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
      {isPoint ? (
        <mesh geometry={edge} renderOrder={stacked(ORDER.rims, index)}>
          <meshBasicMaterial
            color={level === 'strong' ? '#ffffff' : '#cfc8b4'}
            transparent
            opacity={level === 'dim' ? 0.1 : level === 'strong' ? 0.95 : 0.4}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <mesh geometry={edge} renderOrder={stacked(ORDER.rims, index)}>
          <meshBasicMaterial
            vertexColors
            transparent
            opacity={level === 'dim' ? 0.08 : level === 'strong' ? 0.9 : 0.6}
            depthWrite={false}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}
      {fonts && (
        <Label
          text={sephirah.name}
          position={scaled(center, R_LABELS)}
          height={labelHeight}
          font={fonts.serif}
          color={solid ? sephirah.ink : CLEAR_SPHERE_INK}
          opacity={LABEL_OPACITY[level]}
          center={isPoint ? [0.5, 1 + pointRadius / labelHeight] : CENTERED}
          halo={!solid}
        />
      )}
    </>
  )
}

// What the chosen vessel picks out: its paths, and the sephiroth they
// join. Null when none is chosen and the whole Tree draws alike.
function focusOf(
  vessel: Vessel | null,
): { paths: Set<number>; sephiroth: Set<SephirahId> } | null {
  if (!vessel) return null
  const paths = PATHS.filter((p) => vessel.paths.includes(p.number))
  return {
    paths: new Set(vessel.paths),
    sephiroth: new Set(paths.flatMap((p) => [p.from, p.to])),
  }
}

export function Tree({
  vessel,
  appearance,
  fonts,
}: {
  vessel: Vessel | null
  appearance: Appearance
  fonts: Fonts | null
}) {
  const focus = useMemo(() => focusOf(vessel), [vessel])
  const level = (inFocus: boolean): Level =>
    !focus ? 'normal' : inFocus ? 'strong' : 'dim'

  return (
    <>
      {SEGMENTS.map((segment, index) => (
        <PathBand
          key={segment.key}
          segment={segment}
          index={index}
          level={level(focus?.paths.has(segment.path.number) ?? false)}
          opaque={appearance.opaquePaths}
          curve={CURVE}
          fonts={fonts}
        />
      ))}
      {NODES.map((node, index) => (
        <SephirahDisc
          key={node.key}
          node={node}
          index={index}
          level={level(focus?.sephiroth.has(node.sephirah.id) ?? false)}
          opaque={appearance.opaqueSpheres}
          fonts={fonts}
        />
      ))}
    </>
  )
}
