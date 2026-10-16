'use client'

import clsx from 'clsx'
import { useCallback, useState, useSyncExternalStore } from 'react'

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
import {
  formula,
  nameAt,
  nameAtLongitude,
  NAMES,
  signOf,
} from '@/lib/shemHaMephorash'

import { PALETTES } from '@/lib/palettes'
import { PALETTE_OFFERED, useSitePalette } from '@/lib/sitePalette'

import { useName } from './useName'
import { usePlanets, type WheelPlanet } from './usePlanets'
import { useSettings } from './useSettings'
import { useTurnKeys, type Direction } from './useTurnKeys'

const BACKGROUND = '#04050a'

// Moore's article introducing the technique, with the instructions and
// the chart.
const SOURCE = 'https://pansophers.com/shemhamphorash-72-angelic-names/'

// Whether the page has started in the browser. Until it has, it is the
// page as the server drew it, with the default settings and the default
// Name, for it can see neither the settings remembered in the browser nor
// the Name a link asks for; drawn like that and then put right, the star
// would be seen to jump. So the wheel and the formula are kept out of
// sight until then, and fade in already right.
const noSubscription = () => () => {}
function useStarted(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  )
}

// The fade for what waits until the page has started.
const fade = 'transition-opacity duration-150 motion-reduce:transition-none'

// Where the wheel and the formula sit, which depend on each other (the
// `side` and `stacked` layouts are defined in globals.css). On a wide
// screen, or one wider than it is tall, the formula is to the right,
// 24rem wide (w-96), and the wheel to its left; on a short one (a phone on
// its side) the formula is narrower (20rem, w-80), with its compact rows.
// Its right edge lines up with the header's buttons, which sit 1.5rem
// from the edge, or 2rem from lg up, and its top with the controls panel
// that opens from the gear, 3.75rem down. It runs the full height, its
// foot as far from the bottom as its side is from the edge (the phone's
// safe area below added once, by the panel's own margin), or, on a short
// screen (a phone on its side), as low as the wheel beside it goes, so that it
// stands as a column beside the wheel, of a size that never changes; its
// rows sit at the top of it. On
// a tall, narrow one the wheel is on top and the formula takes the rest,
// scrolling for whatever doesn't fit. On a touch screen (a phone) the
// wheel is as large as the screen's width allows (any smaller and its
// Names are too small to read), leaving at least 7rem below it; with a
// mouse (a window on a computer, however narrow), where it can be smaller
// and still read well, it leaves 16rem, room for all five rows. Told apart
// by the pointer, not the width: a narrow window and a phone can be the
// same width. It is never larger than 36rem. Its height, min(100vw,
// 36rem, 100% − header − 7rem or 16rem), is written out in both, as
// Tailwind only finds class names spelled out whole.
const LAYOUT = {
  wheel:
    'absolute inset-x-0 top-[calc(env(safe-area-inset-top)+3.5rem)] h-[min(100vw,36rem,calc(100%-env(safe-area-inset-top)-10.5rem))] pointer-fine:h-[min(100vw,36rem,calc(100%-env(safe-area-inset-top)-19.5rem))] p-1 sm:p-4 side:right-[26rem] side:compact:right-[21.5rem] side:bottom-0 side:h-auto side:p-8 side:compact:p-2',
  formula:
    'absolute inset-x-1.5 top-[calc(env(safe-area-inset-top)+3.5rem+min(100vw,36rem,calc(100%-env(safe-area-inset-top)-10.5rem)))] pointer-fine:top-[calc(env(safe-area-inset-top)+3.5rem+min(100vw,36rem,calc(100%-env(safe-area-inset-top)-19.5rem)))] bottom-1.5 sm:inset-x-4 sm:bottom-2 side:top-[calc(env(safe-area-inset-top)+3.75rem)] side:right-6 lg:side:right-8 side:bottom-6 lg:side:bottom-8 side:compact:bottom-2 side:left-auto side:w-96 side:compact:w-80',
}

// The whole wheel as text, for screen readers: the formula, with what
// each point stands for in Moore's words, and the 72 Names.
function Structure({
  name,
  planets,
}: {
  name: number
  planets: WheelPlanet[]
}) {
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
      {planets.length > 0 && (
        <>
          <h2>The planets today</h2>
          <ul>
            {planets.map((p) => (
              <li key={p.name}>
                {p.name}, in Name {nameAtLongitude(p.lon)}
              </li>
            ))}
          </ul>
        </>
      )}
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
  const { zodiac, reckoning } = settings
  // The planets come with the Zodiac: they are where they are in it.
  // The colour palette, chosen for the whole site (see palettes.ts).
  const [palette, setPalette] = useSitePalette()
  const planets = usePlanets(zodiac, reckoning, palette)
  const [name, setName] = useName()
  const started = useStarted()

  // Left turns the star anticlockwise, right clockwise, whether the arrow
  // keys or the buttons (the wheel turns only by hand). The Names run
  // anticlockwise round the wheel, so turning the star anticlockwise goes
  // on to the next Name.
  const turnBy = useCallback(
    (direction: Direction) => {
      const forward = direction === 'anticlockwise'
      setName((n) => nameAt(n + (forward ? 1 : -1)).number)
    },
    [setName],
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
            label="Turn the star anticlockwise"
            onClick={() => turnBy('anticlockwise')}
          >
            <ChevronIcon rotate={-90} />
          </HeaderButton>
          <HeaderButton
            label="Turn the star clockwise"
            onClick={() => turnBy('clockwise')}
          >
            <ChevronIcon rotate={90} />
          </HeaderButton>
        </>
      }
      controls={
        <>
          {PALETTE_OFFERED && (
            <Section title="Colours">
              <HeaderTabs
                label="Colour palette"
                fill
                value={palette}
                options={PALETTES.map((p) => ({ value: p.id, label: p.label }))}
                onChange={setPalette}
              />
            </Section>
          )}
          <Section title="Show">
            <SwitchRow
              checked={zodiac}
              onChange={(next) => update({ zodiac: next })}
            >
              Zodiac
            </SwitchRow>
            {/* The Zodiac comes with the planets on it, reckoned one way or
                the other. */}
            {zodiac && (
              <>
                <SwitchRow
                  checked={settings.aspects}
                  onChange={(next) => update({ aspects: next })}
                >
                  Aspects
                </SwitchRow>
                <HeaderTabs
                  label="Zodiac reckoning"
                  fill
                  value={reckoning}
                  options={[
                    { value: 'sidereal', label: 'Sidereal' },
                    { value: 'tropical', label: 'Tropical' },
                  ]}
                  onChange={(next) => update({ reckoning: next })}
                />
              </>
            )}
          </Section>
        </>
      }
      canvasLabel={`The 72 Names of the Shem HaMephorash on a wheel, with a pentagram set on Name ${essential.number}, ${essential.meaning}. Its formula and the Names are listed below for screen readers.`}
      canvas={
        <div className={clsx(LAYOUT.wheel, fade, !started && 'opacity-0')}>
          <Wheel
            name={name}
            zodiac={zodiac}
            planetsRing={zodiac}
            planets={planets}
            aspects={zodiac && settings.aspects}
            onSelect={setName}
            onTurn={turnBy}
          />
        </div>
      }
      about={
        <p className="text-sm/6 text-olive-300">
          Designed by{' '}
          <a
            href={SOURCE}
            className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
          >
            Dan Moore
          </a>
        </p>
      }
      structure={<Structure name={name} planets={planets} />}
    >
      <FormulaPanel
        entries={entries}
        onOpen={setCard}
        className={clsx(LAYOUT.formula, fade, !started && 'opacity-0')}
      />

      {card !== null && (
        <Card
          entries={entries}
          index={card}
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
