'use client'

import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'

import { useFonts } from '@/components/model/fonts'
import { ModelCanvas } from '@/components/model/ModelCanvas'
import { TouchContext, type Touch } from '@/components/model/touch'
import {
  ALTAR,
  DIAGRAMS,
  WALL_HEIGHT,
  wallsOf,
  type VaultDesignId,
} from '@/lib/vault'

import { Diagrams } from './Diagrams'
import { Altar, BrassAltar, Grave, Pastos } from './Furniture'
import {
  GRAVE,
  pansophicCeilingTexture,
  pansophicFloorTexture,
  pansophicWallTexture,
} from './pansophic/textures'
import { EPS, EYE_HEIGHT, FOV, Rig } from './Rig'
import { Ceiling, DoorContext, Floor, WallPanel } from './Room'
import { ceilingTexture, floorTexture } from './golden-dawn/plan'
import { doorOutsideTexture, wallTexture } from './golden-dawn/walls'
import { caseWallTexture } from './case/walls'
import type { Furniture, Item, Motion, Target } from './types'

export type { Furniture, Item, Motion, Move, Target } from './types'

// ---- Scene ---------------------------------------------------------------------

export interface VaultCanvasProps {
  // Which design of the tomb to show.
  design: VaultDesignId
  // Whether the squares carry their English: the titles over them and the
  // transliteration under each Hebrew name. With it off the walls are as
  // they were lettered, Hebrew and figures alone.
  english: boolean
  motion: Motion
  // What is in the room.
  furniture: Furniture
  // A piece of furniture was clicked: take it away.
  onRemove: (item: Item) => void
}

function Scene({
  design,
  english,
  motion,
  furniture: chosen,
  onRemove,
  onPointing,
}: VaultCanvasProps & { onPointing: (pointing: boolean) => void }) {
  const fonts = useFonts()
  // The Pansophic design has no Pastos, whatever the settings say.
  const pansophic = design === 'pansophic'
  const furniture = useMemo(
    () => (pansophic ? { ...chosen, pastos: false } : chosen),
    [pansophic, chosen],
  )
  const walls = useMemo(() => wallsOf(design), [design])
  const [hovered, setHovered] = useState<Target | null>(null)
  // The door on the Venus wall stands ajar to begin with, so that the one
  // wall that opens is seen to open; clicking it closes it again.
  const [doorOpen, setDoorOpen] = useState(true)

  // A taken item can't stay highlighted.
  const gone =
    (hovered === 'altar' && !furniture.altar) ||
    (hovered === 'pastos' && !furniture.pastos) ||
    (hovered === 'lid' && !(furniture.pastos && furniture.lid)) ||
    (hovered === 'plate' && (furniture.altar || !furniture.plate)) ||
    DIAGRAMS.some((d) => hovered === d.id && !furniture[d.id])
  const lit = gone ? null : hovered
  const touch = useMemo<Touch>(
    () => ({
      hovered: lit,
      hover: (target) => setHovered(target as Target | null),
      act: (target) => {
        setHovered(null)
        if (target === 'door') setDoorOpen((open) => !open)
        else onRemove(target as Item)
      },
    }),
    [lit, onRemove],
  )

  // The hand shows over anything that can be clicked.
  useEffect(() => onPointing(lit !== null), [lit, onPointing])

  // Frames are drawn on demand, and taking something out of the scene
  // doesn't ask for one; without this it would linger until the next drag.
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [furniture, lit, invalidate])
  const door = useMemo(() => ({ doorOpen }), [doorOpen])
  if (!fonts) return null
  return (
    <TouchContext.Provider value={touch}>
      <DoorContext.Provider value={door}>
        <color attach="background" args={['#050406']} />
        {/* "It is lit by the symbolic Rose of our Order in the centre of
            the ceiling": one warm light hanging from the ceiling, and
            enough ambient to read the walls by. */}
        <ambientLight intensity={1.1} color="#fff4e0" />
        <pointLight
          position={[0, WALL_HEIGHT - 1.2, 0]}
          intensity={26}
          color="#ffe6b8"
          decay={1.6}
        />
        <pointLight
          position={[0, ALTAR.height + 0.4, 0]}
          intensity={4}
          color="#ffd9a0"
          decay={1.8}
        />

        {/* Each design's surfaces are painted once; switching designs
            mounts the other set afresh. */}
        {pansophic ? (
          <group key="pansophic">
            {walls.map((wall) => (
              <WallPanel
                key={wall.index}
                wall={wall}
                fonts={fonts}
                paint={pansophicWallTexture}
              />
            ))}
            <Ceiling paint={pansophicCeilingTexture} />
            <Floor paint={pansophicFloorTexture} hole={GRAVE.plateRadius} />
            <Grave altar={furniture.altar} plate={furniture.plate} />
            {furniture.altar && <BrassAltar fonts={fonts} />}
          </group>
        ) : (
          <group key={`${design}:${english}`}>
            {walls.map((wall) => (
              <WallPanel
                key={wall.index}
                wall={wall}
                fonts={fonts}
                paint={
                  design === 'case'
                    ? (w, f) => caseWallTexture(w, f, english)
                    : wallTexture
                }
                paintOutside={doorOutsideTexture}
              />
            ))}
            <Diagrams present={furniture} />
            <Ceiling paint={() => ceilingTexture(fonts, walls)} />
            <Floor paint={() => floorTexture(fonts)} />
            <Pastos body={furniture.pastos} lid={furniture.lid} fonts={fonts} />
            {furniture.altar && (
              <Altar fonts={fonts} pastos={furniture.pastos} />
            )}
          </group>
        )}

        <Rig present={furniture} motion={motion} />
      </DoorContext.Provider>
    </TouchContext.Provider>
  )
}

// The Vault of the Adepti, seen from inside. The container's size is left
// to the caller; pass any sized div around it.
export function VaultCanvas(props: VaultCanvasProps) {
  const [pointing, setPointing] = useState(false)
  return (
    <ModelCanvas
      cursor={pointing ? 'pointer' : 'grab'}
      camera={{
        fov: FOV,
        near: 0.05,
        far: 100,
        position: [0, EYE_HEIGHT, EPS],
      }}
      // The colours are the Order's, and should show as painted.
      flat
    >
      <Scene {...props} onPointing={setPointing} />
    </ModelCanvas>
  )
}
