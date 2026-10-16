'use client'

// The furniture of the Vault: the altar of each design, the Pastos of
// the Golden Dawn, and the grave under the Pansophic altar.

import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import {
  BackSide,
  DoubleSide,
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
} from 'three'

import type { Fonts } from '@/components/model/fonts'
import { GLOW, Highlight, useTouch } from '@/components/model/touch'
import { useTexture } from '@/lib/canvasTexture'
import { ALTAR, PASTOS } from '@/lib/vault'

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
  pastosInsideTexture,
  pastosLidTexture,
  pastosRimTexture,
  pastosSideTexture,
} from './golden-dawn/pastos'

// The altar "stands over" the closed Pastos. The ritual doesn't say on
// what; here it is a shallow drum on four legs set wide of the coffin, so
// that it stands on the floor, clear of the lid, and the Pastos can be
// opened or drawn out from under it. Its top is 3 feet up.
const SKIRT = 0.5 // depth of the drum under the top, feet
const LEG = 0.14 // the legs' thickness
const LEG_X = 0.6 // the legs, either side of the middle along the coffin
const LEG_Z = PASTOS.width / 2 + 0.2 // and across it, clear of its sides

export function Altar({ fonts }: { fonts: Fonts }) {
  const top = useTexture(() => altarTexture(fonts))
  const { lit, handlers } = useTouch('altar')
  const legHeight = ALTAR.height - SKIRT
  return (
    <group>
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
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * LEG_X, legHeight / 2, sz * LEG_Z]}
            {...handlers}
          >
            <boxGeometry args={[LEG, legHeight, LEG]} />
            <meshLambertMaterial color="#121014" />
            {lit && (
              <Highlight>
                <boxGeometry args={[LEG, legHeight, LEG]} />
              </Highlight>
            )}
          </mesh>
        )),
      )}
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
  const { length, width, height, lid } = PASTOS
  const [materials] = useState(() => [
    new MeshBasicMaterial({ map: pastosHeadTexture(width, height) }),
    new MeshBasicMaterial({ map: pastosFootTexture(width, height) }),
    new MeshBasicMaterial({
      map: pastosRimTexture(length, width, WALL),
      alphaTest: 0.5,
    }),
    new MeshBasicMaterial({ color: '#050405' }),
    new MeshBasicMaterial({ map: pastosSideTexture(length, height, fonts) }),
    new MeshBasicMaterial({ map: pastosSideTexture(length, height, fonts) }),
  ])
  const invalidate = useThree((state) => state.invalidate)
  const [lidMaterials] = useState(() => {
    const edge = new MeshBasicMaterial({ color: '#1a1716' })
    // The lid's paintings, from a photograph of a c.1895 drawing of them
    // ("Lid of Pastos"), straightened, cropped, stretched lengthways a
    // fifth to the lid's proportions, and turned so the upper
    // half lies to the head. Until it loads, the placeholder shows.
    const top = new MeshBasicMaterial({
      map: pastosLidTexture(length, width),
    })
    new TextureLoader().load('/vault/pastos-lid.jpg', (map) => {
      map.colorSpace = SRGBColorSpace
      map.anisotropy = 8
      top.map?.dispose()
      top.map = map
      top.needsUpdate = true
      invalidate()
    })
    return [edge, edge, top, edge, edge, edge]
  })
  const [inside] = useState(() => {
    const wall = new MeshBasicMaterial({
      map: pastosInsideTexture(),
      side: BackSide,
    })
    const floor = new MeshBasicMaterial({ color: '#060507', side: BackSide })
    return [wall, wall, floor, floor, wall, wall]
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
          <boxGeometry args={[length, lid, width]} />
          {lidTouch.lit && (
            <Highlight>
              <boxGeometry args={[length, lid, width]} />
            </Highlight>
          )}
        </mesh>
      )}
    </>
  )
}
