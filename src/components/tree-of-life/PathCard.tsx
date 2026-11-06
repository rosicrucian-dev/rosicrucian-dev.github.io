import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { SRGBColorSpace, TextureLoader } from 'three'
import {
  isAcross,
  SPHERE_RADIUS,
  sphereCentre,
  TUBE_RADIUS,
  type TreeLayout,
  type Tube,
} from '@/lib/treeOfLife'
import { keyLetter, tarotImage, type CardStyle } from '@/lib/tarot'
import { ACROSS_RADIUS } from './Path'
import { sphereScale } from './layout'
import { CARD_ORDER } from './renderOrder'

// ---- Tarot keys ------------------------------------------------------------------

// The Tarot key of a path, laid on it at its middle as BOTA paints them on
// its Tree: flat on the Tree's face, turned so that it reads along the
// path (upright on the paths that rise, on its side across the Tree),
// just above the path, unlit and in full colour. It is drawn with depth,
// like the paths and spheres, so a sphere in front of it hides it. A little wider than the path; its height is the card's own.
const CARD_WIDTH = 4.2
const CARD_ASPECT = 600 / 362
// On the body: the clear space left between a card and the spheres at
// either end of its path, in all, and the smallest a card is drawn, as a
// fraction of its full size: low enough that every path keeps its card,
// however small (the shortest, beside Tiphareth and below Chokmah and
// Binah, come to about two fifths).
const CARD_GAP = 0.3
const CARD_SMALLEST = 0.15
// Cards slid this far up their path from its middle, by path number, where
// the middle would have their corners over a neighbouring path: the
// Emperor and the Lovers, just above the path across from Severity to
// Mercy.
const CARD_SHIFT: Record<number, number> = { 15: 2, 17: 2 }

export function PathCard({
  tunnel,
  style,
  starMoon,
  layout,
}: {
  tunnel: Tube
  style: CardStyle
  starMoon: boolean
  layout: TreeLayout
}) {
  const map = useLoader(
    TextureLoader,
    tarotImage(keyLetter(tunnel.path.hebrew, starMoon), style),
  )
  const card = useMemo(() => {
    const t = map.clone()
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [map])
  useEffect(() => () => card.dispose(), [card])
  const [ax, , az] = sphereCentre(tunnel.from, layout)
  const [bx, , bz] = sphereCentre(tunnel.to, layout)
  // Upright along the path: the card's top points the way up the Tree
  // (towards Kether); across the Tree, towards Chesed's side.
  let dx = bx - ax
  let dz = bz - az
  if (dz > 0 || (Math.abs(dz) < 1e-6 && dx < 0)) {
    dx = -dx
    dz = -dz
  }
  const across = Math.abs(dz) < 1e-6
  const shift =
    (layout === 'tree' ? (CARD_SHIFT[tunnel.path.number] ?? 0) : 0) /
    Math.hypot(dx, dz)
  // On the paths across, the card lies on its side, as on the poster.
  const turn = across ? Math.PI / 2 : Math.atan2(dx, -dz)
  const lift = (isAcross(tunnel) ? ACROSS_RADIUS : TUBE_RADIUS) + 0.05
  // On the body the spheres stand close, and a card is made small enough
  // to fit the stretch of its path that shows between them; should a path
  // ever leave too little room for any card at all, it goes without.
  let fit = 1
  if (layout === 'body') {
    const shown =
      Math.hypot(dx, dz) - 2 * SPHERE_RADIUS * sphereScale(layout) - CARD_GAP
    fit = Math.min(1, shown / (CARD_WIDTH * CARD_ASPECT))
    if (fit < CARD_SMALLEST) return null
  }
  const w = CARD_WIDTH * fit
  const h = w * CARD_ASPECT
  return (
    <group
      position={[(ax + bx) / 2 + dx * shift, lift, (az + bz) / 2 + dz * shift]}
      rotation={[-Math.PI / 2, 0, -turn]}
    >
      <mesh renderOrder={CARD_ORDER}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={card} toneMapped={false} />
      </mesh>
    </group>
  )
}
