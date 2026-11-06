'use client'

// The furniture of the Vault: the altar of each design, the Pastos of
// the Golden Dawn, and the grave under the Pansophic altar.

import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { BackSide, DoubleSide, MeshBasicMaterial } from 'three'

import type { Fonts } from '@/components/model/fonts'
import { GLOW, Highlight, useTouch } from '@/components/model/touch'
import { useTexture } from '@/lib/canvasTexture'
import { ALTAR, BLACK_ALTAR, PASTOS } from '@/lib/vault'

import {
  BRASS,
  GRAVE,
  pansophicAltarTexture,
  pansophicGraveTexture,
  pansophicPlateTexture,
} from './pansophic/textures'
import { altarTexture } from './golden-dawn/altar'
import {
  pastosFootTexture,
  pastosHeadTexture,
  pastosLidTexture,
  pastosRimTexture,
  pastosSideTexture,
  pastosTreeTexture,
} from './golden-dawn/pastos'

// The altar stands on the lid of the closed Pastos: "Pastos inside the
// Vault with Circular Altar on top", and it is rolled aside to open the
// coffin. When the Pastos has been carried out, the black Neophyte altar
// stands in its place and holds the circular altar at the same height.
const SKIRT = ALTAR.depth // depth of the drum under the top, feet

export function Altar({ fonts, pastos }: { fonts: Fonts; pastos: boolean }) {
  const invalidate = useThree((state) => state.invalidate)
  const top = useTexture(() => altarTexture(fonts, invalidate))
  const { lit, handlers } = useTouch('altar')
  return (
    <group>
      {!pastos && (
        <mesh position={[0, BLACK_ALTAR.height / 2, 0]} {...handlers}>
          <boxGeometry
            args={[BLACK_ALTAR.side, BLACK_ALTAR.height, BLACK_ALTAR.side]}
          />
          <meshLambertMaterial color="#0c0b0e" />
          {lit && (
            <Highlight>
              <boxGeometry
                args={[BLACK_ALTAR.side, BLACK_ALTAR.height, BLACK_ALTAR.side]}
              />
            </Highlight>
          )}
        </mesh>
      )}
      <group position={[0, ALTAR.height - SKIRT / 2, 0]}>
        <mesh {...handlers}>
          <cylinderGeometry
            args={[ALTAR.radius, ALTAR.radius, SKIRT, 48, 1, true]}
          />
          <meshLambertMaterial color="#121014" side={DoubleSide} />
          {lit && (
            <Highlight>
              <cylinderGeometry
                args={[ALTAR.radius, ALTAR.radius, SKIRT, 48, 1, true]}
              />
            </Highlight>
          )}
        </mesh>
        {/* The top, with the Lion toward the East. */}
        <mesh
          position={[0, SKIRT / 2 + 0.001, 0]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          {...handlers}
        >
          <circleGeometry args={[ALTAR.radius, 64]} />
          <meshLambertMaterial map={top} />
          {lit && (
            <mesh>
              <circleGeometry args={[ALTAR.radius, 64]} />
              <meshBasicMaterial {...GLOW} />
            </mesh>
          )}
        </mesh>
        {/* Underneath. */}
        <mesh position={[0, -SKIRT / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[ALTAR.radius, 48]} />
          <meshLambertMaterial color="#121014" />
        </mesh>
      </group>
    </group>
  )
}

// The Pansophic altar: the Fama's "round altar covered over with a plate
// of brass", a solid drum standing on the floor over the brass plate that
// covers the grave. There is no Pastos in this design. The top carries
// Franckenberg's Tabula Universalis, its central figure facing anyone
// entering from the West.
export function BrassAltar({ fonts }: { fonts: Fonts }) {
  const invalidate = useThree((state) => state.invalidate)
  const top = useTexture(() => pansophicAltarTexture(fonts, invalidate))
  const { lit, handlers } = useTouch('altar')
  return (
    <group position={[0, ALTAR.height / 2, 0]}>
      <mesh {...handlers}>
        <cylinderGeometry
          args={[ALTAR.radius, ALTAR.radius, ALTAR.height, 64, 1, true]}
        />
        <meshLambertMaterial color={BRASS} side={DoubleSide} />
        {lit && (
          <Highlight>
            <cylinderGeometry
              args={[ALTAR.radius, ALTAR.radius, ALTAR.height, 64, 1, true]}
            />
          </Highlight>
        )}
      </mesh>
      <mesh
        position={[0, ALTAR.height / 2 + 0.001, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        {...handlers}
      >
        <circleGeometry args={[ALTAR.radius, 64]} />
        <meshBasicMaterial map={top} />
        {lit && (
          <mesh>
            <circleGeometry args={[ALTAR.radius, 64]} />
            <meshBasicMaterial {...GLOW} />
          </mesh>
        )}
      </mesh>
    </group>
  )
}

// The Pansophic grave under the altar, as Prinke draws it: a short round
// neck under the brass plate, opening into a globe, the philosophical egg,
// buried below the floor. The plate can only be taken up with the altar
// moved aside, as in the Fama.
const PLATE_THICK = 0.04

export function Grave({
  altar,
  plate: covered,
}: {
  altar: boolean
  plate: boolean
}) {
  const { plateRadius, neck, globeRadius } = GRAVE
  const touch = useTouch('plate')
  const plate = useTexture(pansophicPlateTexture)
  const neckMap = useTexture(() => pansophicGraveTexture('#8d8a84', '#5a5754'))
  const globeMap = useTexture(() => pansophicGraveTexture('#5a5754', '#1c1b1a'))
  // The globe stands under the neck so that the neck meets it where its
  // width is the neck's; the cap above that is left open.
  const join = Math.asin(plateRadius / globeRadius)
  const centre = -neck - globeRadius * Math.cos(join)
  return (
    <>
      <mesh position={[0, -neck / 2, 0]}>
        <cylinderGeometry
          args={[plateRadius, plateRadius, neck, 48, 1, true]}
        />
        <meshBasicMaterial map={neckMap} side={BackSide} />
      </mesh>
      <mesh position={[0, centre, 0]}>
        <sphereGeometry args={[globeRadius, 48, 32, 0, Math.PI * 2, join]} />
        <meshBasicMaterial map={globeMap} side={BackSide} />
      </mesh>
      {covered && (
        <mesh
          position={[0, PLATE_THICK / 2 + 0.005, 0]}
          {...(altar ? {} : touch.handlers)}
        >
          <cylinderGeometry
            args={[plateRadius, plateRadius, PLATE_THICK, 64]}
          />
          <meshBasicMaterial attach="material-0" color={BRASS} />
          <meshBasicMaterial attach="material-1" map={plate} />
          <meshBasicMaterial attach="material-2" color={BRASS} />
          {touch.lit && (
            <Highlight>
              <cylinderGeometry
                args={[plateRadius, plateRadius, PLATE_THICK, 64]}
              />
            </Highlight>
          )}
        </mesh>
      )}
    </>
  )
}

// The Pastos, head to the East (+X). Box faces in three.js order: +X the
// head, -X the foot, +Y the top (the board edges round the opening), -Y the
// bottom, +Z and -Z the long sides. Inside, a slightly smaller box seen
// from within makes the black hollow of the coffin. The body and the lid
// are separate things: with the lid taken away the coffin stands open.
//
// The lid laps past the box, half an inch at the sides and an inch or two
// at head and foot; the long sides of the box stand an inch above its
// ends, and the lap hides the air slits that leaves. Only the lap shows,
// so only the lap is built.
const WALL = 0.08 // thickness of the coffin's boards, feet

export function Pastos({
  body,
  lid: lidOn,
  fonts,
}: {
  body: boolean
  lid: boolean
  fonts: Fonts
}) {
  const bodyTouch = useTouch('pastos')
  const lidTouch = useTouch('lid')
  const { length, width, height, lid, lidSide, lidEnd } = PASTOS
  const lidLength = length + 2 * lidEnd
  const lidWidth = width + 2 * lidSide
  const invalidate = useThree((state) => state.invalidate)
  // Box faces come in the order +X, -X, +Y, -Y, +Z, -Z. The head is at
  // +X, the East; the body lies face up, so its right hand is to the
  // north, at -Z, and its left to the south, at +Z. Outside, the right
  // side takes the King's scale and the left the Queen's; within, the
  // right takes the Emperor's and the left the Empress's. A face's
  // texture runs with +X to the right on -Z and to the left on +Z.
  const [materials] = useState(() => [
    new MeshBasicMaterial({ map: pastosHeadTexture(width, height) }),
    new MeshBasicMaterial({ map: pastosFootTexture(width, height) }),
    new MeshBasicMaterial({
      map: pastosRimTexture(length, width, WALL),
      alphaTest: 0.5,
    }),
    new MeshBasicMaterial({ color: '#050405' }),
    new MeshBasicMaterial({
      map: pastosSideTexture(length, height, fonts, 'queen', false),
    }),
    new MeshBasicMaterial({
      map: pastosSideTexture(length, height, fonts, 'king', true),
    }),
  ])
  const [lidMaterials] = useState(() => {
    const edge = new MeshBasicMaterial({ color: '#1a1716' })
    const top = new MeshBasicMaterial({
      map: pastosLidTexture(lidLength, lidWidth, invalidate),
    })
    return [edge, edge, top, edge, edge, edge]
  })
  const [inside] = useState(() => {
    const dim = { side: BackSide } as const
    const floor = new MeshBasicMaterial({ color: '#060507', ...dim })
    return [
      new MeshBasicMaterial({
        map: pastosTreeTexture(width, height, 'head', invalidate),
        ...dim,
      }),
      new MeshBasicMaterial({
        map: pastosTreeTexture(width, height, 'foot', invalidate),
        ...dim,
      }),
      floor,
      floor,
      new MeshBasicMaterial({
        map: pastosSideTexture(length, height, fonts, 'empress', true),
        ...dim,
      }),
      new MeshBasicMaterial({
        map: pastosSideTexture(length, height, fonts, 'emperor', false),
        ...dim,
      }),
    ]
  })
  useEffect(
    () => () => {
      for (const m of [...materials, ...lidMaterials, ...inside]) {
        m.map?.dispose()
        m.dispose()
      }
    },
    [materials, lidMaterials, inside],
  )
  return (
    <>
      {body && (
        <>
          <mesh
            position={[0, height / 2, 0]}
            material={materials}
            {...bodyTouch.handlers}
          >
            <boxGeometry args={[length, height, width]} />
            {bodyTouch.lit && (
              <Highlight>
                <boxGeometry args={[length, height, width]} />
              </Highlight>
            )}
          </mesh>
          <mesh position={[0, height / 2 + WALL / 2, 0]} material={inside}>
            <boxGeometry
              args={[length - 2 * WALL, height - WALL, width - 2 * WALL]}
            />
          </mesh>
        </>
      )}
      {body && lidOn && (
        <mesh
          position={[0, height + lid / 2, 0]}
          material={lidMaterials}
          {...lidTouch.handlers}
        >
          <boxGeometry args={[lidLength, lid, lidWidth]} />
          {lidTouch.lit && (
            <Highlight>
              <boxGeometry args={[lidLength, lid, lidWidth]} />
            </Highlight>
          )}
        </mesh>
      )}
    </>
  )
}
