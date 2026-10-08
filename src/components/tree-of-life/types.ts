import type { Held } from '@/components/model/HoldButton'
import { type Sphere, type Tube } from '@/lib/treeOfLife'

// Where the walker is: standing in a room, or on the way through a tunnel.
export type Location =
  { kind: 'room'; room: Sphere } | { kind: 'tunnel'; tunnel: Tube }

export type View = 'inside' | 'overview'

// Walking forward, back or sideways, held by the keyboard or by the page's
// buttons on a touch screen. The page holds the set; `wakers` ask the canvas for
// frames, since it draws only on demand.
export type Stride = 'forward' | 'back' | 'left' | 'right'
export type Strides = Held<Stride>

// The figure the Tree is laid on: Blender Studio's realistic base meshes
// (the Human Base Meshes bundle, CC0), at their first level of sculpted
// detail, Draco-compressed.
export type Figure = 'female' | 'male'
