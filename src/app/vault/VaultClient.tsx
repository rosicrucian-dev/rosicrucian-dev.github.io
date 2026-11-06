'use client'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

import {
  HeaderTabs,
  ModelShell,
  Section,
  SwitchRow,
  panel,
  type Hint,
} from '@/components/model/ModelShell'
import { HoldButton } from '@/components/model/HoldButton'
import { ChevronIcon } from '@/components/model/icons'
import type { Furniture, Item, Motion } from '@/components/vault/VaultCanvas'
import {
  DIAGRAMS,
  CASE_SQUARES,
  DESIGNS,
  WALL_SQUARES,
  wallsOf,
  type VaultDesignId,
} from '@/lib/vault'

import { useSettings } from './useSettings'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
const VaultCanvas = dynamic(
  () => import('@/components/vault/VaultCanvas').then((m) => m.VaultCanvas),
  { ssr: false },
)

// The three diagrams share one mark: a poster board stood on its end, in
// the 22 by 28 of the real thing. They are three of the same object, and
// each button says in words which one it puts back, so drawing what is on
// a plate would be decoration and nothing more.
const DIAGRAM_ICON: ReactNode = (
  <svg
    viewBox="0 0 32 32"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="size-7"
  >
    <rect x="6" y="3" width="20" height="26" />
  </svg>
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
    designs: ['regardie', 'case', 'pansophic'],
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
    designs: ['regardie', 'case'],
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
    designs: ['regardie', 'case'],
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
  ...DIAGRAMS.map((d) => ({
    item: d.id,
    label: d.short,
    designs: ['regardie', 'case'] as VaultDesignId[],
    icon: DIAGRAM_ICON,
  })),
]

// The Vault furnished: everything in its place. Taking a thing out is
// something done to the room while looking at it, not a preference, so
// this is where every visit starts and reloading the page comes back to
// it.
const FURNISHED: Furniture = {
  altar: true,
  pastos: true,
  lid: true,
  plate: true,
  abiegnus: true,
  'minutum-mundum': true,
  'sword-serpent': true,
}

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
    { text: 'drag a diagram to move it' },
  ],
  touch: [
    { text: 'drag to look around' },
    { text: 'use the arrows to walk' },
    { text: 'tap things to interact' },
    { text: 'drag a diagram to move it' },
  ],
}

// The whole tomb as text, for screen readers. The walls stand in
// different places in each design, and are parted differently, so the
// listing follows the design shown.
function Structure({ design }: { design: VaultDesignId }) {
  const walls = wallsOf(design)
  return (
    <>
      <h2>The seven walls</h2>
      <ul>
        {walls.map((w) => (
          <li key={w.index}>
            {w.planet.name}, {w.planet.colorName}, to the {w.bearing}
            {w.door ? ', bearing the door' : ''}
          </li>
        ))}
      </ul>
      {design === 'case' ? (
        <>
          <h2>The ten squares of each wall, two across and five down</h2>
          <ol>
            {CASE_SQUARES.map((s) => (
              <li key={s.kind}>{s.title}</li>
            ))}
          </ol>
        </>
      ) : design === 'regardie' ? (
        <>
          <h2>The forty squares of each wall, top to bottom</h2>
          <ol>
            {WALL_SQUARES.map((rank, i) => (
              <li key={i}>{rank.map((s) => s.name).join(', ')}</li>
            ))}
          </ol>
        </>
      ) : null}
      {design !== 'pansophic' && (
        <>
          <h2>The three diagrams, hung where two walls meet</h2>
          <ul>
            {DIAGRAMS.map((d) => (
              <li key={d.id}>{d.name}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export function VaultClient() {
  // The design is remembered between visits; what is in the room is not.
  const [{ design, english, hint }, update] = useSettings()
  const [furniture, setFurniture] = useState<Furniture>(FURNISHED)
  // ?design= names a design directly, which is the only way to reach one
  // that is kept out of the tabs.
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get('design')
    if (asked && DESIGNS.some((d) => d.id === asked)) {
      update({ design: asked as VaultDesignId })
    }
  }, [update])
  // Taking the Pastos away takes its lid with it: the lid can't hang in
  // the air.
  const remove = useCallback(
    (item: Item) =>
      setFurniture((current) => ({
        ...current,
        [item]: false,
        ...(item === 'pastos' && { lid: false }),
      })),
    [],
  )
  // The altar always stands on its plate. Furniture is shared between the
  // designs, so an altar put back in a design that has no plate brings
  // the plate back with it; otherwise the Pansophic design
  // would show it standing over the open grave.
  const restore = (item: Item) =>
    setFurniture((current) => ({
      ...current,
      [item]: true,
      ...(item === 'altar' && { plate: true }),
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
          // Only the finished designs are offered; a draft shows in the
          // tabs only while it is the one being looked at, so that
          // ?design= does not land the visitor on a tab that is not there.
          options={DESIGNS.filter((d) => !d.hidden || d.id === design).map(
            (d) => ({
              value: d.id,
              label: d.name,
              short: d.shortName,
            }),
          )}
          onChange={(next) => update({ design: next })}
        />
      }
      // The one setting the Vault has of its own, and only Case's wall
      // has English on it to turn off.
      controls={
        design === 'case' ? (
          <Section title="Lettering">
            <SwitchRow
              checked={english}
              onChange={(on) => update({ english: on })}
            >
              English
            </SwitchRow>
          </Section>
        ) : undefined
      }
      hint={{
        phrases: HINT,
        shown: hint,
        onShownChange: (shown) => update({ hint: shown }),
      }}
      canvasLabel="The seven-sided Vault of the Adepti, seen from inside. Drag or use the arrow keys to look around; W, A, S, D walk, E and Q rise and fall. Click the altar, the Pastos, its lid, the brass plate or any of the three diagrams to take it away, and the door to open it. Drag a diagram to move it round the walls. Its structure is listed below for screen readers."
      canvas={
        <VaultCanvas
          design={design}
          english={english}
          motion={motion}
          furniture={furniture}
          onRemove={remove}
        />
      }
      structure={<Structure design={design} />}
    >
      {/* What has been taken away, to put back: on the bottom line, with
          the hint and the walking pad. */}
      {taken.length > 0 && (
        <div
          className={clsx(
            panel,
            'absolute bottom-4 left-4 flex gap-1 p-1 sm:bottom-6 sm:left-6 lg:left-8',
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
