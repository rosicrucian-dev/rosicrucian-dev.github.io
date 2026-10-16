'use client'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import {
  HeaderButton,
  HeaderTabs,
  ModelShell,
  panel,
  Section,
  SwitchRow,
  type Hint,
} from '@/components/model/ModelShell'
import { HoldButton } from '@/components/model/HoldButton'
import { ChevronIcon, FigureIcon, ResetIcon } from '@/components/model/icons'
import { ViewLabel } from '@/components/model/ViewLabel'
import type { Location, View, Strides } from '@/components/tree-of-life/types'
import { CARD_STYLES, keyLetter, TAROT } from '@/lib/tarot'
import { SPHERES, TUBES, SPHERE_BY_ID } from '@/lib/treeOfLife'

import { useSettings } from './useSettings'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
const TreeOfLifeCanvas = dynamic(
  () =>
    import('@/components/tree-of-life/TreeOfLifeCanvas').then(
      (m) => m.TreeOfLifeCanvas,
    ),
  { ssr: false },
)

const HINT: Hint = {
  mouse: [
    {
      keys: [{ key: 'W' }, { key: 'A' }, { key: 'S' }, { key: 'D' }],
      text: 'to walk',
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
  ],
  touch: [{ text: 'drag to look around' }, { text: 'hold the arrows to walk' }],
}

// The walkable part of the Tree as text, for screen readers.
function Structure({ starMoon }: { starMoon: boolean }) {
  return (
    <>
      <h2>The Sephiroth</h2>
      <ul>
        {SPHERES.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
      <h2>The paths, in the direction of the Way of Return</h2>
      <ul>
        {TUBES.map((t) => (
          <li key={t.path.number}>
            {t.path.number}, {t.path.name},{' '}
            {TAROT[keyLetter(t.path.hebrew, starMoon)].name}: from{' '}
            {SPHERE_BY_ID.get(t.from)?.name} to {SPHERE_BY_ID.get(t.to)?.name}
          </li>
        ))}
      </ul>
    </>
  )
}

// Walking the Tree from inside is built (components/tree-of-life/inside)
// but not yet offered: for now the page always shows it from outside. To
// bring the walk back, set this to true and restore the header's
// Inside/Outside tabs, which set `view`.
const INSIDE_OFFERED: boolean = false

// The Tree laid on a human figure is likewise built but not offered for
// now: its button and settings are hidden, and a figure remembered as
// shown from an earlier visit is not drawn. The setting itself is kept, so
// that, set to true again, the figure returns for those who had it.
const BODY_OFFERED: boolean = false

export function TreeOfLifeClient() {
  // Everything the page shows is remembered between visits.
  const [
    {
      view: chosenView,
      room,
      flow,
      hint,
      cards,
      cardStyle,
      starMoon,
      body: chosenBody,
      figure,
    },
    update,
  ] = useSettings()
  const body = BODY_OFFERED && chosenBody
  const view: View = INSIDE_OFFERED ? chosenView : 'overview'
  const [location, setLocation] = useState<Location | null>(null)
  const [strides] = useState<Strides>(() => ({
    held: new Set(),
    wakers: new Set(),
  }))
  const [resets, setResets] = useState(0)

  return (
    <ModelShell
      title="Tree of Life"
      background="#05040a"
      headerControls={
        <>
          {BODY_OFFERED && (
            <HeaderButton
              label={body ? 'Show the Tree alone' : 'Show the Tree on the body'}
              pressed={body}
              onClick={() => update({ body: !body })}
            >
              <FigureIcon />
            </HeaderButton>
          )}
          <HeaderButton
            label="Reset the view"
            onClick={() => setResets((n) => n + 1)}
          >
            <ResetIcon />
          </HeaderButton>
        </>
      }
      controlsId="tree-of-life-controls"
      controls={
        <>
          <Section title="Tarot keys">
            {/* Off, or the deck to show: one choice. */}
            <HeaderTabs
              label="Tarot keys"
              fill
              value={cards ? cardStyle : 'off'}
              options={[
                { value: 'off', label: 'Off' },
                ...CARD_STYLES.map((c) => ({ value: c.id, label: c.label })),
              ]}
              onChange={(next) =>
                update(
                  next === 'off'
                    ? { cards: false }
                    : { cards: true, cardStyle: next },
                )
              }
            />
            {cards && (
              <SwitchRow
                checked={starMoon}
                onChange={(next) => update({ starMoon: next })}
              >
                Switch the Star and Moon
              </SwitchRow>
            )}
          </Section>
          {body && (
            <Section title="Body">
              <HeaderTabs
                label="Figure"
                fill
                value={figure}
                options={[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                ]}
                onChange={(next) => update({ figure: next })}
              />
            </Section>
          )}
          <Section title="Settings">
            <SwitchRow
              checked={flow}
              onChange={(next) => update({ flow: next })}
            >
              Flowing paths
            </SwitchRow>
          </Section>
        </>
      }
      // The hint and Help are about walking, so they come only with the
      // inside view.
      hint={
        view === 'inside'
          ? {
              phrases: HINT,
              shown: hint,
              onShownChange: (shown) => update({ hint: shown }),
            }
          : undefined
      }
      canvasLabel="The Tree of Life after Paul Foster Case and BOTA's painting of it: the ten Sephiroth as glowing spheres and the twenty-two paths as spiralling streams of coloured light, with their Tarot keys. Drag to turn it, and scroll or pinch to zoom. Its structure is listed below for screen readers."
      canvas={
        <TreeOfLifeCanvas
          view={view}
          room={room}
          flow={flow}
          cards={cards ? cardStyle : null}
          starMoon={starMoon}
          body={body ? figure : null}
          onRoom={(id) => {
            if (id !== room) update({ room: id })
          }}
          onLocation={setLocation}
          strides={strides}
          resets={resets}
        />
      }
      structure={<Structure starMoon={starMoon} />}
    >
      {/* Where you are. */}
      {location &&
        view === 'inside' &&
        (location.kind === 'room' ? (
          <ViewLabel
            swatch={location.room.color}
            title={location.room.name}
            details={[location.room.hebrew]}
          />
        ) : (
          <ViewLabel
            swatch={location.tunnel.color}
            title={`Path ${location.tunnel.path.number} · ${location.tunnel.path.name} ${location.tunnel.path.hebrew}`}
            details={[
              TAROT[keyLetter(location.tunnel.path.hebrew, starMoon)].name,
              `${SPHERE_BY_ID.get(location.tunnel.from)?.name} to ${SPHERE_BY_ID.get(location.tunnel.to)?.name}`,
            ]}
          />
        ))}
      {/* Walking, on a touch screen. */}
      {view === 'inside' && (
        <div
          className={clsx(
            panel,
            'absolute right-4 bottom-4 grid grid-cols-3 p-1 sm:right-6 sm:bottom-6 lg:right-8 pointer-fine:hidden',
          )}
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="col-start-2">
            <HoldButton
              move="forward"
              holding={strides}
              className="size-11"
              label="Walk forward"
            >
              <ChevronIcon />
            </HoldButton>
          </div>
          <div className="col-start-1">
            <HoldButton
              move="left"
              holding={strides}
              className="size-11"
              label="Step left"
            >
              <ChevronIcon rotate={-90} />
            </HoldButton>
          </div>
          <div className="col-start-2">
            <HoldButton
              move="back"
              holding={strides}
              className="size-11"
              label="Walk back"
            >
              <ChevronIcon rotate={180} />
            </HoldButton>
          </div>
          <div className="col-start-3">
            <HoldButton
              move="right"
              holding={strides}
              className="size-11"
              label="Step right"
            >
              <ChevronIcon rotate={90} />
            </HoldButton>
          </div>
        </div>
      )}
    </ModelShell>
  )
}
