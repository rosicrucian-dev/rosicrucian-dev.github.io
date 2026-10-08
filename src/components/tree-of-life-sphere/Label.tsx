// Text on the sphere.

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { Sprite } from 'three'

import type { Vec3 } from '@/lib/treeOfLifeSphere'

import { labelTexture, RADIUS } from './geometry'
import { ORDER, R_LABELS } from './layout'

// 1 hides a label exactly at the limb; larger hides it sooner.
const LIMB_MARGIN = 1.35
export const CENTERED: [number, number] = [0.5, 0.5]

// A line of text that always faces the viewer. `center` is the point of
// the text box pinned to `position`, in box fractions from its bottom
// left, so [0.5, 0.5] centres it and [0.5, 2] hangs it a line below.
export function Label({
  text,
  position,
  height,
  font,
  color,
  opacity = 1,
  center = CENTERED,
  tracking,
  uppercase,
  weight,
  halo,
}: {
  text: string
  position: Vec3
  height: number
  font: string
  color: string
  opacity?: number
  center?: [number, number]
  tracking?: number
  uppercase?: boolean
  weight?: number
  halo?: boolean
}) {
  const invalidate = useThree((s) => s.invalidate)
  const { texture, aspect } = useMemo(
    () =>
      labelTexture(text, { font, color, tracking, uppercase, weight, halo }),
    [text, font, color, tracking, uppercase, weight, halo],
  )
  useEffect(() => {
    invalidate()
    return () => texture.dispose()
  }, [texture, invalidate])

  // A label is a flat card turned to the viewer, so the occluder can't be
  // trusted to hide it cleanly. From outside, show it only while its spot
  // on the sphere faces the camera, and drop it a little before the limb,
  // where labels would otherwise pile up edge-on.
  const sprite = useRef<Sprite>(null)
  useFrame(({ camera }) => {
    if (!sprite.current) return
    const outside = camera.position.lengthSq() > RADIUS * RADIUS
    sprite.current.visible =
      !outside ||
      sprite.current.position.dot(camera.position) >
        R_LABELS * R_LABELS * LIMB_MARGIN
  })

  return (
    <sprite
      ref={sprite}
      position={position}
      scale={[height * aspect, height, 1]}
      center={center}
      renderOrder={ORDER.labels}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
}
