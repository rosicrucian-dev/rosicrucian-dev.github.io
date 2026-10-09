'use client'

import { useCallback, useState } from 'react'

import { ChevronIcon } from '@/components/model/icons'
import {
  HeaderButton,
  HeaderTabs,
  ModelShell,
  Section,
  SwitchRow,
} from '@/components/model/ModelShell'
import { Card } from '@/components/shem-hamephorash/Card'
import { FormulaPanel } from '@/components/shem-hamephorash/FormulaPanel'
import { Wheel } from '@/components/shem-hamephorash/Wheel'
import { formula, nameAt, NAMES, signOf } from '@/lib/shemHaMephorash'

import { useName } from './useName'
import { useSettings } from './useSettings'
import { useTurnKeys, type Direction } from './useTurnKeys'

const BACKGROUND = '#04050a'

// Moore's article introducing the technique, with the instructions and
// the chart.
const SOURCE = 'https://pansophers.com/shemhamphorash-72-angelic-names/'

// Where the wheel and the formula sit, which depend on each other. On a
// wide screen the formula is to the right, 24rem wide (w-96) and 2rem from
// the edge, and the wheel to its left. On a narrow one the wheel is on
// top, as large as the screen's width allows (any smaller and its Names
// are too small to read), though leaving at least 7rem below it; the
// formula takes the rest, scrolling for whatever doesn't fit. The wheel's
// height, min(100vw, 100% − header − 7rem), is written out in both, as
// Tailwind only finds class names spelled out whole.
const LAYOUT = {
  wheel:
    'absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] h-[min(100vw,calc(100%-env(safe-area-inset-top)-10.5rem))] p-1 sm:p-4 lg:right-[26rem] lg:bottom-0 lg:h-auto lg:p-8',
  formula:
    'absolute inset-x-1.5 top-[calc(env(safe-area-inset-top)+3.5rem+min(100vw,calc(100%-env(safe-area-inset-top)-10.5rem)))] bottom-1.5 sm:inset-x-4 sm:bottom-2 lg:top-[calc(env(safe-area-inset-top)+4.5rem)] lg:right-8 lg:bottom-auto lg:left-auto lg:max-h-[calc(100%-6rem)] lg:w-96',
}

// The whole wheel as text, for screen readers: the formula, with what
// each point stands for in Moore's words, and the 72 Names.
function Structure({ name }: { name: number }) {
  return (
    <>
      <h2>The formula of Name {name}</h2>
      <ol>
        {formula(name).map(({ point, name: n }) => (
          <li key={point.id}>
            {point.element}, {point.letterName}, {point.role}, {point.eternity}:
            Name {n.number}, {n.hebrew}, {n.meaning}. {point.sense}
          </li>
        ))}
      </ol>
      <h2>The 72 Names</h2>
      <ol>
        {NAMES.map((n) => (
          <li key={n.number}>
            {n.hebrew}, {n.angel}, {n.meaning}, in {signOf(n.number).name}
          </li>
        ))}
      </ol>
    </>
  )
}

export function ShemHaMephorashClient() {
  const [settings, update] = useSettings()
  const { turn, angels, colours, zodiac, gematria } = settings
  const [name, setName] = useName()

  // Left turns what turns anticlockwise, right clockwise, whether the
  // arrow keys or the buttons. The Names run anticlockwise round the
  // wheel, so turning the star anticlockwise goes on to the next Name,
  // and turning the wheel anticlockwise back to the one before.
  const turnBy = useCallback(
    (direction: Direction) => {
      const forward = (turn === 'star') === (direction === 'anticlockwise')
      setName((n) => nameAt(n + (forward ? 1 : -1)).number)
    },
    [turn, setName],
  )
  useTurnKeys(turnBy)

  const entries = formula(name)
  const essential = entries[0].name
  // The card that is up, as its place in the formula, or none.
  const [card, setCard] = useState<number | null>(null)

  return (
    <ModelShell
      title="Shem HaMephorash"
      // Not one of the models, but a project of its own: the emblem leads
      // home.
      back={{ href: '/', label: 'Home' }}
      background={BACKGROUND}
      controlsId="shem-controls"
      headerControls={
        <>
          <HeaderButton
            label={`Turn the ${turn} anticlockwise`}
            onClick={() => turnBy('anticlockwise')}
          >
            <ChevronIcon rotate={-90} />
          </HeaderButton>
          <HeaderButton
            label={`Turn the ${turn} clockwise`}
            onClick={() => turnBy('clockwise')}
          >
            <ChevronIcon rotate={90} />
          </HeaderButton>
        </>
      }
      controls={
        <>
          <Section title="Turning">
            <HeaderTabs
              label="What turns"
              fill
              value={turn}
              options={[
                { value: 'star', label: 'The star' },
                { value: 'wheel', label: 'The wheel' },
              ]}
              onChange={(next) => update({ turn: next })}
            />
          </Section>
          <Section title="Show">
            <SwitchRow
              checked={colours}
              onChange={(next) => update({ colours: next })}
            >
              Coloured letters
            </SwitchRow>
            <SwitchRow
              checked={zodiac}
              onChange={(next) => update({ zodiac: next })}
            >
              Zodiac
            </SwitchRow>
            <SwitchRow
              checked={angels}
              onChange={(next) => update({ angels: next })}
            >
              Angel names
            </SwitchRow>
            <SwitchRow
              checked={gematria}
              onChange={(next) => update({ gematria: next })}
            >
              Gematria
            </SwitchRow>
          </Section>
          <Section title="Source">
            <a
              href={SOURCE}
              className="text-sm/6 text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
            >
              Dan Moore
            </a>
          </Section>
        </>
      }
      canvasLabel={`The 72 Names of the Shem HaMephorash on a wheel, with a pentagram set on Name ${essential.number}, ${essential.meaning}. Its formula and the Names are listed below for screen readers.`}
      canvas={
        <div className={LAYOUT.wheel}>
          <Wheel
            name={name}
            turn={turn}
            colours={colours}
            zodiac={zodiac}
            onSelect={setName}
            onTurn={turnBy}
          />
        </div>
      }
      structure={<Structure name={name} />}
    >
      <FormulaPanel
        entries={entries}
        colours={colours}
        angels={angels}
        gematria={gematria}
        onOpen={setCard}
        className={LAYOUT.formula}
      />

      {card !== null && (
        <Card
          entries={entries}
          index={card}
          colours={colours}
          angels={angels}
          gematria={gematria}
          // Worked out from the card as it is at that moment, so that two
          // steps in quick succession make two.
          onStep={(by) =>
            setCard((i) =>
              i === null ? i : (i + by + entries.length) % entries.length,
            )
          }
          onClose={() => setCard(null)}
        />
      )}
    </ModelShell>
  )
}
