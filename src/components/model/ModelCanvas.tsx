'use client'

// The <Canvas> every model draws into, with the settings they share.

import { Canvas, type CanvasProps } from '@react-three/fiber'

// Antialiasing on high-density screens costs a great deal of memory for
// little gain, and on iOS it can lose the WebGL context outright.
const ANTIALIAS = typeof window !== 'undefined' && window.devicePixelRatio < 2

export function ModelCanvas({
  camera,
  cursor = 'grab',
  flat = false,
  children,
}: {
  camera: CanvasProps['camera']
  cursor?: string
  // No tone mapping: colours show exactly as painted, which matters where
  // they are the point (the Order's colour scales).
  flat?: boolean
  children: CanvasProps['children']
}) {
  return (
    <Canvas
      style={{ cursor }}
      camera={camera}
      // Cap DPR at 2: beyond that the framebuffer only costs memory.
      dpr={[1, 2]}
      gl={{ antialias: ANTIALIAS }}
      flat={flat}
      // Nothing in a model moves by itself, so render on demand (the
      // controls and anything animated ask for frames as they need them).
      frameloop="demand"
      // preventDefault on context-lost tells the browser it may restore
      // the context (three re-uploads resources on restore).
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) =>
          e.preventDefault(),
        )
      }}
    >
      {children}
    </Canvas>
  )
}
