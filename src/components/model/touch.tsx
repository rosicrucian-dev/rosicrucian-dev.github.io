'use client'

// Things in a model that can be touched: hovering lights them, clicking
// does whatever the model decides. A model names its things by string and
// provides a `Touch` for the scene; each thing asks for its handlers.

import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { createContext, useContext, type ReactNode } from 'react'
import { AdditiveBlending, DoubleSide } from 'three'

export const HIGHLIGHT = '#fff1c4'
// A press that drags further than this, in pixels, was a look round, not
// a click.
const CLICK_SLOP = 5

export interface Touch {
  hovered: string | null
  hover: (target: string | null) => void
  act: (target: string) => void
}

export const TouchContext = createContext<Touch>({
  hovered: null,
  hover: () => {},
  act: () => {},
})

// The pointer handlers for one thing that can be touched, and whether the
// pointer is on it. Only the nearest thing under the pointer answers.
export function useTouch(target: string) {
  const { hovered, hover, act } = useContext(TouchContext)
  return {
    lit: hovered === target,
    handlers: {
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        hover(target)
      },
      onPointerOut: () => hover(null),
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (e.delta > CLICK_SLOP) return
        act(target)
      },
    },
  }
}

export type TouchHandlers = ReturnType<typeof useTouch>['handlers']

// The soft glow laid over a lit thing, as material props, for surfaces
// that draw their own glow mesh.
export const GLOW = {
  color: HIGHLIGHT,
  transparent: true,
  opacity: 0.16,
  blending: AdditiveBlending,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
} as const

// What marks the thing the pointer is on: an outline round it and a soft
// glow over it. `children` is the thing's geometry again, for the glow;
// an outline alone is lost where a thing meets its neighbours (a door in
// its wall).
export function Highlight({ children }: { children?: ReactNode }) {
  return (
    <>
      <Edges lineWidth={3} threshold={20} color={HIGHLIGHT} />
      {children && (
        <mesh>
          {children}
          <meshBasicMaterial {...GLOW} side={DoubleSide} />
        </mesh>
      )}
    </>
  )
}
