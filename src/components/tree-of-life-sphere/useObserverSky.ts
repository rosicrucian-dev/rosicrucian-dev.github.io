// Turning the sphere to where it really sits over an observer.

import { useThree } from '@react-three/fiber'
import { useEffect, type RefObject } from 'react'
import { Matrix4, Quaternion, Vector3, type Group } from 'three'

import { skyBasis, type Observer } from '@/lib/realSky'

// How often the sphere is re-turned to keep up with the Earth: the sky
// moves a quarter of a degree a minute.
const SKY_TICK = 5000

// While there is an `observer`, keeps `sphere` turned to match their sky,
// and turns it back upright (Kether overhead) when there isn't. Done by
// hand on the group: the rotation changes with the clock, not with
// anything React renders.
export function useObserverSky(
  sphere: RefObject<Group | null>,
  observer: Observer | null,
) {
  const get = useThree((s) => s.get)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    const group = sphere.current
    if (!group || !observer) return
    const { camera } = get()
    const controls = () => get().controls as { update?: () => void } | null

    const placed = () => {
      const [x, y, z] = skyBasis(new Date(), observer)
      return new Quaternion().setFromRotationMatrix(
        new Matrix4().makeBasis(
          new Vector3(...x),
          new Vector3(...y),
          new Vector3(...z),
        ),
      )
    }
    // Whatever was at the centre of the view stays there while the sky
    // swings into place around it (and again when it swings back).
    const carryView = (turn: Quaternion) => {
      camera.position.applyQuaternion(turn)
      controls()?.update?.()
    }

    group.quaternion.copy(placed())
    carryView(group.quaternion)
    invalidate()
    const timer = setInterval(() => {
      group.quaternion.copy(placed())
      invalidate()
    }, SKY_TICK)

    return () => {
      clearInterval(timer)
      carryView(group.quaternion.clone().invert())
      group.quaternion.identity()
      invalidate()
    }
  }, [sphere, observer, get, invalidate])
}
