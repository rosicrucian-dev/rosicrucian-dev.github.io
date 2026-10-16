// Letting the phone itself aim the view.

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import { Quaternion } from 'three'

import {
  correctYaw,
  measuredYaw,
  shortest,
  type PhoneReading,
} from '@/lib/compass'

import { EPS } from './layout'
import { screenAngle, setFromPhone } from './phone'

// How quickly the view eases toward where the phone points (1 = no
// smoothing).
const COMPASS_SMOOTHING = 0.35

type CompassEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

// The drag controls, as much of them as this needs.
interface Dragging {
  enabled: boolean
  update: () => void
}

// With `compass` on, point the phone at the sky and you see what is there.
// Until the first real reading arrives (and on anything without sensors,
// where none ever does) dragging stays in charge.
export function usePhoneAim(
  compass: boolean,
  controls: RefObject<Dragging | null>,
) {
  const get = useThree((s) => s.get)
  const invalidate = useThree((s) => s.invalidate)
  const aim = useRef(new Quaternion())
  const tracking = useRef(false)

  useEffect(() => {
    if (!compass) return
    const camera = get().camera
    const dragging = controls.current
    // Live sensor readings on the page, for working out what a phone is
    // really reporting: add ?debug to the address.
    const readout = new URLSearchParams(window.location.search).has('debug')
      ? document.getElementById('sky-debug')
      : null

    // Android has an event whose bearing is already measured from north.
    // iOS's needs correcting against its compass heading (see lib/compass).
    const absolute = 'ondeviceorientationabsolute' in window
    let yaw: number | null = absolute ? 0 : null

    const onOrientation = (event: Event) => {
      const e = event as CompassEvent
      const { alpha, beta, gamma } = e
      if (alpha === null || beta === null || gamma === null) return
      const reading: PhoneReading = {
        alpha,
        beta,
        gamma,
        heading: e.webkitCompassHeading,
        accuracy: e.webkitCompassAccuracy,
      }
      if (!absolute) yaw = correctYaw(yaw, reading)
      if (yaw === null) return

      setFromPhone(aim.current, alpha + yaw, beta, gamma, screenAngle())
      if (!tracking.current) {
        tracking.current = true
        camera.quaternion.copy(aim.current)
        if (dragging) dragging.enabled = false
      }
      invalidate()

      if (readout) {
        const n = (v: number | null | undefined) =>
          typeof v === 'number' ? v.toFixed(1) : '–'
        const measured = absolute ? null : measuredYaw(reading)
        readout.textContent =
          `${absolute ? 'absolute' : 'relative'} alpha ${n(alpha)} beta ${n(beta)} gamma ${n(gamma)}\n` +
          `heading ${n(reading.heading)} ±${n(reading.accuracy)} measured ${n(measured === null ? null : shortest(measured))}\n` +
          `yaw ${n(shortest(yaw))} screen ${screenAngle()}`
      }
    }

    const type = absolute ? 'deviceorientationabsolute' : 'deviceorientation'
    window.addEventListener(type, onOrientation)
    return () => {
      window.removeEventListener(type, onOrientation)
      tracking.current = false
      if (readout) readout.textContent = ''
      // Hand the view back to dragging, facing the way the phone left it.
      if (dragging) {
        dragging.enabled = true
        dragging.update()
      }
    }
  }, [compass, controls, get, invalidate])

  useFrame(({ camera }) => {
    if (!tracking.current) return
    camera.quaternion.slerp(aim.current, COMPASS_SMOOTHING)
    // The camera sits a hair behind what it faces (see EPS), which is what
    // dragging expects to find when it takes over again.
    camera.getWorldDirection(camera.position).multiplyScalar(-EPS)
    if (camera.quaternion.angleTo(aim.current) > 1e-4) invalidate()
  })
}
