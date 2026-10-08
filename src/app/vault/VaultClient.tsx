'use client'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useCallback, useState, type ReactNode } from 'react'

import {
  HeaderTabs,
  ModelShell,
  panel,
  type Hint,
} from '@/components/model/ModelShell'
import { HoldButton } from '@/components/model/HoldButton'
import { ChevronIcon } from '@/components/model/icons'
import type { Item, Motion } from '@/components/vault/VaultCanvas'
import { DESIGNS, WALL_SQUARES, WALLS, type VaultDesignId } from '@/lib/vault'

import { useSettings } from './useSettings'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
const VaultCanvas = dynamic(
  () => import('@/components/vault/VaultCanvas').then((m) => m.VaultCanvas),
  { ssr: false },
)

const ITEMS: {
  item: Item
  label: string
  designs: VaultDesignId[]
  icon: ReactNode
}[] = [
  {
    item: 'altar',
    label: 'Altar',
    designs: ['golden-dawn', 'pansophic'],
    icon: (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-7"
      >
        <path d="M6 9v14c0 2.2 4.5 4 10 4s10-1.8 10-4V9" />
        <ellipse cx="16" cy="9" rx="10" ry="4" />
      </svg>
    ),
  },
  {
    item: 'pastos',
    label: 'Pastos',
    designs: ['golden-dawn'],
    icon: (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="size-7"
      >
        {/* A long, low coffin, seen from above one corner. */}
        <path d="M2 17 l6 -5 h22 v8 l-6 5 H2 Z M2 17 h22 l6 -5 M24 17 v8" />
      </svg>
    ),
  },
  {
    item: 'lid',
    label: 'Lid of the Pastos',
    designs: ['golden-dawn'],
    icon: (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="size-7"
      >
        {/* A long, thin slab. */}
        <path d="M2 18 l6 -5 h22 v2 l-6 5 H2 Z M2 18 h22 l6 -5 M24 18 v2" />
      </svg>
    ),
  },
  {
    item: 'plate',
    label: 'Brass plate',
    designs: ['pansophic'],
    icon: (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="size-7"
      >
        {/* A round plate: the altar's drum, flattened like a coin. */}
        <path d="M6 14v3c0 2.2 4.5 4 10 4s10-1.8 10-4v-3" />
        <ellipse cx="16" cy="14" rx="10" ry="4" />
      </svg>
    ),
  },
]

// How to get about.
const HINT: Hint = {
  mouse: [
    {
      keys: [{ key: 'W' }, { key: 'A' }, { key: 'S' }, { key: 'D' }],
      text: 'to move',
    },
    {
      keys: [
        { key: '↑', label: 'Up' },
        { key: '←', label: 'Left' },
        { key: '↓', label: 'Down' },
        { key: '→', label: 'Right' },
      ],
      text: 'to look around',
    },
    { keys: [{ key: 'E' }, { key: 'Q' }], text: 'to rise and fall' },
    { text: 'click things to interact' },
  ],
  touch: [
    { text: 'drag to look around' },
    { text: 'use the arrows to walk' },
    { text: 'tap things to interact' },
  ],
}

// The whole tomb as text, for screen readers.
function Structure() {
  return (
    <>
      <h2>The seven walls</h2>
      <ul>
        {WALLS.map((w) => (
          <li key={w.index}>
            {w.planet.name}, {w.planet.colorName}, to the {w.bearing}
            {w.door ? ', bearing the door' : ''}
          </li>
        ))}
      </ul>
      <h2>The forty squares of each wall, top to bottom</h2>
      <ol>
        {WALL_SQUARES.map((rank, i) => (
          <li key={i}>{rank.map((s) => s.name).join(', ')}</li>
        ))}
      </ol>
    </>
  )
}

export function VaultClient() {
  // The design and the furniture are remembered between visits.
  const [{ design, furniture, hint }, update] = useSettings()
  // Taking the Pastos away takes its lid with it: the lid can't hang in
  // the air.
  const remove = useCallback(
    (item: Item) =>
      update((current) => ({
        furniture: {
          ...current.furniture,
          [item]: false,
          ...(item === 'pastos' && { lid: false }),
        },
      })),
    [update],
  )
  // The altar always stands on its plate. Furniture is shared between the
  // designs, so an altar put back in the Golden Dawn design, which has no
  // plate, brings the plate back with it; otherwise the Pansophic design
  // would show it standing over the open grave.
  const restore = (item: Item) =>
    update((current) => ({
      furniture: {
        ...current.furniture,
        [item]: true,
        ...(item === 'altar' && { plate: true }),
      },
    }))
  // Everything this design has that has been taken away, each on its own
  // button. A thing goes back only onto what it rests on: the lid onto the
  // Pastos, and the Pansophic altar onto the plate over the grave (never
  // over the open grave). Until then its button is shown but disabled.
  const needs = (item: Item): Item | null =>
    item === 'lid' && !furniture.pastos
      ? 'pastos'
      : item === 'altar' && design === 'pansophic' && !furniture.plate
        ? 'plate'
        : null
  const taken = ITEMS.filter(
    ({ item, designs }) => !furniture[item] && designs.includes(design),
  )
  const [motion] = useState<Motion>(() => ({
    held: new Set(),
    wakers: new Set(),
  }))

  return (
    <ModelShell
      title="The Vault"
      background="#050406"
      controlsId="vault-controls"
      // Which design of the tomb: the fundamental switch, so it sits in
      // the header rather than among the settings.
      headerControls={
        <HeaderTabs
          label="Design"
          value={design}
          options={DESIGNS.map((d) => ({
            value: d.id,
            label: d.name,
            short: d.shortName,
          }))}
          onChange={(next) => update({ design: next })}
        />
      }
      hint={{
        phrases: HINT,
        shown: hint,
        onShownChange: (shown) => update({ hint: shown }),
      }}
      canvasLabel="The seven-sided Vault of the Adepti, seen from inside. Drag or use the arrow keys to look around; W, A, S, D walk, E and Q rise and fall. Click the altar, the Pastos, its lid or the brass plate to take it away, and the door to open it. Its structure is listed below for screen readers."
      canvas={
        <VaultCanvas
          design={design}
          motion={motion}
          furniture={furniture}
          onRemove={remove}
        />
      }
      structure={<Structure />}
    >
      {/* What has been taken away, to put back. */}
      {taken.length > 0 && (
        <div
          className={clsx(
            panel,
            'absolute bottom-16 left-4 flex gap-1 p-1 sm:bottom-[4.5rem] sm:left-6 lg:left-8',
          )}
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          {taken.map(({ item, label, icon }) => {
            const first = needs(item)
            const firstLabel = ITEMS.find((i) => i.item === first)?.label
            const name = `Put back the ${label.toLowerCase()}`
            return (
              <button
                key={item}
                type="button"
                disabled={first !== null}
                title={
                  firstLabel
                    ? `${name}: put back the ${firstLabel.toLowerCase()} first`
                    : name
                }
                aria-label={name}
                onClick={() => restore(item)}
                className="flex size-11 items-center justify-center rounded-lg text-olive-300 transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:text-olive-300/35"
              >
                {icon}
              </button>
            )
          })}
        </div>
      )}

      {/* Walking on a touch screen, which has no keys. */}
      <div
        className={clsx(
          panel,
          'absolute right-4 bottom-4 p-1 sm:right-6 sm:bottom-6 lg:right-8 pointer-fine:hidden',
        )}
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-3">
          <HoldButton
            move="forward"
            holding={motion}
            label="Forward"
            className="col-start-2"
          >
            <ChevronIcon />
          </HoldButton>
          <HoldButton
            move="left"
            holding={motion}
            label="Left"
            className="col-start-1"
          >
            <ChevronIcon rotate={-90} />
          </HoldButton>
          <HoldButton
            move="back"
            holding={motion}
            label="Back"
            className="col-start-2"
          >
            <ChevronIcon rotate={180} />
          </HoldButton>
          <HoldButton
            move="right"
            holding={motion}
            label="Right"
            className="col-start-3"
          >
            <ChevronIcon rotate={90} />
          </HoldButton>
        </div>
      </div>
    </ModelShell>
  )
}
