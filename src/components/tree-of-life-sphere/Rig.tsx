// The camera: which view it is in, how it zooms, and what aims it.

import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'

import { useLensZoom } from '@/components/model/useLensZoom'
import { toVector, type Vec3 } from '@/lib/treeOfLifeSphere'

import { RADIUS } from './geometry'
import { EPS, INSIDE_FOV } from './layout'
import type { View } from './types'
import { usePhoneAim } from './usePhoneAim'

// ---- Camera knobs (tweak freely) ---------------------------------------------
// Inside, OrbitControls turns the camera in place and zooming changes the
// field of view rather than moving. Outside it orbits the sphere like a
// globe.
const INSIDE_FOV_PORTRAIT = 96
const MIN_FOV = 30
const MAX_FOV = 110
const INSIDE_ROTATE_SPEED = 0.35
const OUTSIDE_FOV = 42
const OUTSIDE_ROTATE_SPEED = 0.5
// Outside, how much of the room it has (the window, less whatever covers
// its top edge) the globe fills when the view opens.
const OUTSIDE_FILL = 0.9
// The first thing you face: Regulus, where the reckoning starts.
const START: Vec3 = toVector(120, 10)

// How far back the camera stands for the whole globe to fit in a window of
// this size with `topInset` pixels of its top covered.
function outsideDistance(width: number, height: number, topInset: number) {
  const focal = height / 2 / Math.tan((OUTSIDE_FOV * Math.PI) / 360)
  const room = Math.min((height - topInset) / 2, width / 2) * OUTSIDE_FILL
  return RADIUS / Math.sin(Math.atan(room / focal))
}

export function Rig({
  view,
  compass,
  topInset,
}: {
  view: View
  compass: boolean
  // Pixels at the top of the canvas hidden behind the page's header.
  topInset: number
}) {
  // The camera is read through the store inside each effect: it is a
  // mutable three.js object, not a value for render to hold on to.
  const get = useThree((s) => s.get)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const previous = useRef<View | null>(null)
  const insideFov = useRef<number | null>(null)

  // Move between the two views while keeping the same patch of sky at the
  // centre of the screen: inside you look out at it, outside you look
  // back down on it.
  useEffect(() => {
    const camera = get().camera as PerspectiveCamera
    const { clientWidth, clientHeight } = gl.domElement
    if (insideFov.current === null) {
      // A phone held upright needs a wider lens to take in a whole Tree.
      insideFov.current =
        clientWidth < clientHeight ? INSIDE_FOV_PORTRAIT : INSIDE_FOV
    }
    const facing =
      previous.current === null
        ? new Vector3(...START)
        : camera.position
            .clone()
            .normalize()
            .multiplyScalar(previous.current === 'inside' ? -1 : 1)

    if (view === 'inside') {
      camera.position.copy(facing).multiplyScalar(-EPS)
      camera.fov = insideFov.current
    } else {
      camera.position
        .copy(facing)
        .multiplyScalar(outsideDistance(clientWidth, clientHeight, topInset))
      camera.fov = OUTSIDE_FOV
    }
    camera.updateProjectionMatrix()
    if (controls.current) {
      controls.current.rotateSpeed =
        view === 'inside'
          ? (-INSIDE_ROTATE_SPEED * insideFov.current) / INSIDE_FOV
          : OUTSIDE_ROTATE_SPEED
      controls.current.update()
    }
    previous.current = view
    invalidate()
  }, [view, topInset, get, gl, invalidate])

  // The header floats over the top of the canvas. Inside, the sky simply
  // runs on behind it. Outside, the globe would be centred in the whole
  // window with its top tucked under the header, so the picture is slid
  // down by half the header's height to centre it in what's left.
  useEffect(() => {
    const camera = get().camera as PerspectiveCamera
    if (view === 'outside') {
      camera.setViewOffset(
        size.width,
        size.height,
        0,
        -topInset / 2,
        size.width,
        size.height,
      )
    } else {
      camera.clearViewOffset()
    }
    invalidate()
  }, [view, topInset, size.width, size.height, get, invalidate])

  // Inside, the wheel and a two-finger pinch zoom the lens. (Outside,
  // OrbitControls' own zoom moves the camera instead.) Turn more slowly
  // when zoomed in, so a drag still tracks the sky.
  useLensZoom({
    enabled: view === 'inside',
    fov: insideFov,
    min: MIN_FOV,
    max: MAX_FOV,
    fallback: INSIDE_FOV,
    onZoom: (next) => {
      if (controls.current) {
        controls.current.rotateSpeed =
          (-INSIDE_ROTATE_SPEED * next) / INSIDE_FOV
      }
    },
  })

  usePhoneAim(compass, controls)

  const inside = view === 'inside'
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0, 0]}
      enablePan={false}
      enableZoom={!inside}
      minDistance={inside ? EPS : RADIUS * 1.4}
      maxDistance={inside ? EPS : RADIUS * 8}
    />
  )
}
