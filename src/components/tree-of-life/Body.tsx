import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { Box3, MeshStandardMaterial, type Mesh } from 'three'
import { BODY_HEIGHT, BODY_SOLES, SPHERE_RADIUS } from '@/lib/treeOfLife'
import { BODY_ORDER } from './renderOrder'
import { Figure } from './types'

// ---- The body -------------------------------------------------------------------

// Served from the site, not a CDN.
const DRACO_PATH = '/draco/'

// Pale and matt, like plaster: the form reads, but no skin.
const BODY_MATERIAL = new MeshStandardMaterial({
  color: '#9d9890',
  roughness: 0.9,
  metalness: 0,
})

export function Body({ figure }: { figure: Figure }) {
  const { scene } = useGLTF(`/models/body/body-${figure}.glb`, DRACO_PATH)
  const placed = useMemo(() => {
    const body = scene.clone(true)
    body.traverse((o) => {
      const mesh = o as Mesh
      if (!mesh.isMesh) return
      mesh.material = BODY_MATERIAL
      mesh.renderOrder = BODY_ORDER
      // Never in the way of picking a sphere.
      mesh.raycast = () => {}
    })
    // The file stands it up (+Y) facing +Z, soles at the origin; scaled to
    // the body's height on the Tree.
    const box = new Box3().setFromObject(body)
    const scale = BODY_HEIGHT / box.max.y
    // Laid on its back behind the Tree: head towards Kether (-Z), front
    // towards the viewer (+Y), and just clear of the spheres, so the Tree
    // stands wholly in front of it.
    const depth = -(SPHERE_RADIUS + 1) - box.max.z * scale
    return { body, scale, depth }
  }, [scene])
  return (
    <group
      position={[0, placed.depth, BODY_SOLES]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={placed.scale}
    >
      <primitive object={placed.body} />
    </group>
  )
}

// Soft light for the body alone (everything else is unlit): from the sky
// in front of it, and a little more from above its head, Kether's side.
export function BodyLight() {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#1a1a22', 1.4]} />
      <directionalLight position={[20, 60, -90]} intensity={1.6} />
    </>
  )
}
