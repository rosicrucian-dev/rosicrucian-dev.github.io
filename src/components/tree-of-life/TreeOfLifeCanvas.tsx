'use client'

import { useThree } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { useFonts } from '@/components/model/fonts'
import { ModelCanvas } from '@/components/model/ModelCanvas'
import {
  CROSSINGS,
  SPHERES,
  TUBES,
  tubesFrom,
  type TreeLayout,
  type Tube,
} from '@/lib/treeOfLife'
import { type CardStyle } from '@/lib/tarot'
import type { SephirahId } from '@/lib/tree'
import { Body, BodyLight } from './Body'
import { PathTube } from './Path'
import { PathCard } from './PathCard'
import { FOV, Rig } from './Rig'
import { SephirahSphere } from './Sephirah'
import { Doorway } from './inside/Doorway'
import { Figure, Location, Strides, View } from './types'

// ---- Scene ---------------------------------------------------------------------

export interface TreeOfLifeCanvasProps {
  view: View
  // The room to stand in.
  room: SephirahId
  // Light streaming along the tunnels.
  flow: boolean
  // The Tarot keys laid on the paths, seen from outside, and in which
  // deck; null for none.
  cards: CardStyle | null
  // The Star on Qoph's path and the Moon on Tzaddi's.
  starMoon: boolean
  // The Tree laid on a human figure, seen from outside, and which; null
  // for the Tree as drawn.
  body: Figure | null
  // Arriving in a room.
  onRoom: (id: SephirahId) => void
  onLocation: (location: Location) => void
  strides: Strides
  // Counts presses of the reset button: each one puts the view back as
  // it first was.
  resets: number
}

function Scene({
  view,
  room,
  flow,
  cards,
  starMoon,
  body,
  onRoom,
  onLocation,
  strides,
  resets,
}: TreeOfLifeCanvasProps) {
  const fonts = useFonts()
  const overview = view === 'overview'
  const layout: TreeLayout = overview && body ? 'body' : 'tree'
  // The path being walked, if any: those crossing it are hidden.
  const [walking, setWalking] = useState<Tube | null>(null)
  const crossed = new Set(
    (walking ? (CROSSINGS.get(walking.path.number) ?? []) : []).map(
      (t) => t.path.number,
    ),
  )
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => invalidate(), [view, flow, layout, body, invalidate])
  if (!fonts) return null
  return (
    <>
      <color attach="background" args={['#05040a']} />
      {overview && body && (
        <Suspense fallback={null}>
          <Body figure={body} />
          <BodyLight />
        </Suspense>
      )}
      {/* Built for one layout; a change of layout builds them afresh. */}
      {SPHERES.map((r) => (
        <SephirahSphere
          key={`${layout}-${r.id}`}
          room={r}
          fonts={fonts}
          overview={overview}
          layout={layout}
        />
      ))}
      {TUBES.map((t) => (
        <PathTube
          key={`${layout}-${t.path.number}`}
          tunnel={t}
          flow={flow}
          overview={overview}
          layout={layout}
          hidden={!overview && crossed.has(t.path.number)}
        />
      ))}
      {overview &&
        cards &&
        TUBES.map((t) => (
          <Suspense key={t.path.number} fallback={null}>
            <PathCard
              tunnel={t}
              style={cards}
              starMoon={starMoon}
              layout={layout}
            />
          </Suspense>
        ))}
      {!overview &&
        SPHERES.flatMap((r) =>
          tubesFrom(r.id).map((t) => (
            <Doorway
              key={`${r.id}-${t.path.number}`}
              room={r.id}
              tunnel={t}
              fonts={fonts}
            />
          )),
        )}
      <Rig
        view={view}
        room={room}
        layout={layout}
        strides={strides}
        resets={resets}
        onArrive={onRoom}
        onLocation={(location) => {
          setWalking(location.kind === 'tunnel' ? location.tunnel : null)
          onLocation(location)
        }}
      />
    </>
  )
}

// The walkable Tree in the shared model canvas. The container's size is
// left to the caller.
export function TreeOfLifeCanvas(props: TreeOfLifeCanvasProps) {
  return (
    <ModelCanvas
      // Up is towards Kether, so that from outside the Tree turns like a
      // picture held before you: straight on is midway between the
      // orbit's limits, and it tilts towards you or away as freely as it
      // turns. (Inside, the view is set by turn and tilt, not by up.)
      camera={{
        position: [0, 0, 0],
        up: [0, 0, -1],
        fov: FOV,
        near: 0.1,
        far: 1000,
      }}
      flat
    >
      <Scene {...props} />
    </ModelCanvas>
  )
}
