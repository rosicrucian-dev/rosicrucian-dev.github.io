'use client'

import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { FrontSide, type Group } from 'three'

import { ModelCanvas } from '@/components/model/ModelCanvas'
import type { Vessel } from '@/lib/vessels'

import { Horizon } from './Horizon'
import { useFonts } from '@/components/model/fonts'
import { EPS, INSIDE_FOV, R_OCCLUDER } from './layout'
import { Planets } from './Planets'
import { Rig } from './Rig'
import {
  ConstellationLines,
  ConstellationNames,
  Figure,
  Stars,
  useSky,
} from './Sky'
import { Tree } from './Tree'
import type { Appearance, Layers, SkyObserver, View } from './types'
import { useObserverSky } from './useObserverSky'
import { Zodiac } from './Zodiac'

export interface TreeOfLifeSphereCanvasProps {
  view: View
  layers: Layers
  // The chosen vessel, whose paths are picked out on the Tree.
  vessel: Vessel | null
  appearance: Appearance
  // Set to turn the sphere to where it really sits in this person's sky.
  // Null leaves it upright, Kether overhead.
  observer: SkyObserver | null
  // Pixels at the top of the canvas covered by the page's header, which
  // the outside view keeps the globe clear of.
  topInset: number
}

function Scene({
  view,
  layers,
  vessel,
  appearance,
  observer,
  topInset,
}: TreeOfLifeSphereCanvasProps) {
  const sky = useSky()
  const fonts = useFonts()

  // Frames are drawn on demand, and taking something out of the scene
  // doesn't ask for one. Without this, switching a layer off leaves the
  // old picture on screen until the next drag.
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [layers, vessel, appearance, invalidate])

  const sphere = useRef<Group>(null)
  useObserverSky(sphere, observer)

  const labelFonts = layers.labels ? fonts : null

  return (
    <>
      <color attach="background" args={['#04050a']} />
      <mesh renderOrder={-1}>
        <sphereGeometry args={[R_OCCLUDER, 64, 32]} />
        <meshBasicMaterial
          color="#070a14"
          side={FrontSide}
          toneMapped={false}
        />
      </mesh>

      {/* Everything pinned to the stars turns together. */}
      <group ref={sphere}>
        {layers.art && sky?.art.map((art) => <Figure key={art.id} art={art} />)}
        {sky && layers.constellations && (
          <ConstellationLines lines={sky.lines} />
        )}
        {sky && layers.stars && <Stars stars={sky.stars} />}
        {sky && fonts && layers.constellationLabels && (
          <ConstellationNames names={sky.names} fonts={fonts} />
        )}
        {layers.ecliptic && <Zodiac fonts={fonts} labels={layers.labels} />}
        {layers.tree && (
          <Tree vessel={vessel} appearance={appearance} fonts={labelFonts} />
        )}
        {layers.planets && <Planets fonts={labelFonts} />}
      </group>

      {observer && <Horizon fonts={fonts} />}

      <Rig
        view={view}
        compass={observer?.compass ?? false}
        topInset={topInset}
      />
    </>
  )
}

// The Tree of Life projected onto the sky, seen from Tiphareth at the
// centre of the sphere (or from outside, as a globe). The container's
// size is left to the caller; pass any sized div around it.
export function TreeOfLifeSphereCanvas(props: TreeOfLifeSphereCanvasProps) {
  return (
    <ModelCanvas
      camera={{ fov: INSIDE_FOV, near: 0.05, far: 200, position: [0, 0, EPS] }}
    >
      <Scene {...props} />
    </ModelCanvas>
  )
}
