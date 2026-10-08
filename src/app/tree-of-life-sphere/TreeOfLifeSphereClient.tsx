'use client'

import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import {
  HeaderButton,
  HeaderTabs,
  ModelShell,
  panel,
  Section,
  SwitchRow,
} from '@/components/model/ModelShell'
import { CompassIcon } from '@/components/model/icons'
import type {
  Appearance,
  Layers,
  SkyObserver,
  View,
} from '@/components/tree-of-life-sphere/types'
import {
  copiesOfPath,
  formatLatitude,
  formatLongitude,
  NODES,
  SPHERE_SEPHIROTH,
  type SphereSephirah,
} from '@/lib/treeOfLifeSphere'
import { VESSEL_BY_ID, VESSELS } from '@/lib/vessels'
import { PATHS, SEPHIRAH_BY_ID } from '@/lib/tree'

import { useSettings } from './useSettings'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
const TreeOfLifeSphereCanvas = dynamic(
  () =>
    import('@/components/tree-of-life-sphere/TreeOfLifeSphereCanvas').then(
      (m) => m.TreeOfLifeSphereCanvas,
    ),
  { ssr: false },
)

const TIMES = ['', 'once', 'twice', 'three times', 'four times']

function listOf(items: string[]): string {
  if (items.length < 2) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

// ---- Controls ----------------------------------------------------------------

// Every layer is one on/off switch. Listed alphabetically.
const LAYER_TOGGLES: { key: keyof Layers; label: string }[] = [
  { key: 'art', label: 'Constellation art' },
  { key: 'constellationLabels', label: 'Constellation labels' },
  { key: 'constellations', label: 'Constellation lines' },
  { key: 'ecliptic', label: 'Ecliptic' },
  { key: 'labels', label: 'Labels' },
  { key: 'planets', label: 'Planets' },
  { key: 'stars', label: 'Stars' },
  { key: 'tree', label: 'Tree' },
]

const APPEARANCE_TOGGLES: { key: keyof Appearance; label: string }[] = [
  { key: 'opaquePaths', label: 'Opaque paths' },
  { key: 'opaqueSpheres', label: 'Opaque spheres' },
]

// The two ways of looking at the sphere: from Tiphareth at its centre, or
// from outside it, as a globe.
const VIEW_TABS: { value: View; label: string; short: string }[] = [
  { value: 'inside', label: 'Inside', short: 'In' },
  { value: 'outside', label: 'Outside', short: 'Out' },
]

// ---- The structure, in words ---------------------------------------------------

// Where on the sphere a sephirah is, in a sentence or two.
function whereabouts(sephirah: SphereSephirah): string {
  const copies = NODES.filter((n) => n.sephirah.id === sephirah.id)
  const meridians = listOf(
    copies
      .map((n) => n.lon)
      .sort((a, b) => a - b)
      .map(formatLongitude),
  )
  switch (sephirah.id) {
    case 'kether':
      return 'The north pole of the ecliptic: a single point, shared by all four Trees.'
    case 'malkuth':
      return 'The south pole of the ecliptic: a single point, shared by all four Trees.'
    case 'tiphareth':
      return `Hidden at the centre of the sphere, where you stand. Its influence is marked at four points on the ecliptic, at ${meridians}.`
    case 'yesod':
      return `Hidden on the axis beneath the centre. Its influence is marked at four points 60° south of the ecliptic, at ${meridians}.`
    default:
      return `Appears twice, ${formatLatitude(sephirah.latitude)}, on the meridians through ${meridians}. Each copy belongs to the Trees on either side of it.`
  }
}

// The whole structure as text, for screen readers.
function Structure() {
  return (
    <>
      <h2>The Tree of Life on the sphere</h2>
      <ul>
        {SPHERE_SEPHIROTH.map((s) => (
          <li key={s.id}>
            {s.name}: {whereabouts(s)}
          </li>
        ))}
      </ul>
      <ul>
        {PATHS.map((p) => (
          <li key={p.number}>
            Path {p.number}, {p.name}, {p.card}: joins{' '}
            {SEPHIRAH_BY_ID[p.from].name} and {SEPHIRAH_BY_ID[p.to].name},
            appearing {TIMES[copiesOfPath(p.number)]}.
          </li>
        ))}
      </ul>
    </>
  )
}

// ---- Finding the real sky ------------------------------------------------------

// Asks for the phone's motion sensors. Only iOS has anything to ask: there
// it must be called straight from a tap, and it remembers a refusal until
// the site's data is cleared. Elsewhere the sensors are either simply
// there or simply absent, which only shows once readings arrive (or don't).
function requestMotion(): Promise<'granted' | 'denied' | 'unavailable'> {
  const sensors = window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>
      })
    | undefined
  if (!sensors) return Promise.resolve('unavailable')
  if (typeof sensors.requestPermission !== 'function') {
    return Promise.resolve('granted')
  }
  return sensors.requestPermission().catch(() => 'denied' as const)
}

// The sky only needs to know roughly where you are, so a coarse, cached
// fix is fine. Resolves to null if there is none to be had.
function locate(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: false,
      maximumAge: 10 * 60 * 1000,
      timeout: 15 * 1000,
    })
  })
}

export function TreeOfLifeSphereClient() {
  // The view, the layers and the vessel are remembered between visits.
  const [{ view, layers, vessel: vesselId, appearance }, update] = useSettings()
  // Set while the sphere is turned to match the viewer's own sky.
  const [observer, setObserver] = useState<SkyObserver | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // The header floats over the top of the scene. Its height (which on a
  // phone includes the notch) tells the scene how much of itself is covered.
  const header = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(56)
  useEffect(() => {
    const el = header.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeaderHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const vessel = VESSEL_BY_ID.get(vesselId) ?? null

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(timer)
  }, [notice])

  const toggleSky = async () => {
    if (observer) return setObserver(null)
    // Motion first: iOS only grants it from inside the tap itself, so it
    // has to be asked for before anything this waits on.
    const motion = requestMotion()
    const [sensors, position] = await Promise.all([motion, locate()])
    if (!position) {
      return setNotice(
        'Your location is needed to line the sky up, and it wasn’t available.',
      )
    }
    // The real sky is something you stand under, not look at from outside.
    update({ view: 'inside' })
    setObserver({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      compass: sensors === 'granted',
    })
    if (sensors === 'denied') {
      setNotice('Motion access is off, so drag to look around.')
    }
  }

  return (
    <ModelShell
      title="Tree of Life Sphere"
      background="#04050a"
      headerRef={header}
      controlsId="sphere-controls"
      headerControls={
        <>
          <HeaderTabs
            label="View"
            value={view}
            options={VIEW_TABS}
            onChange={(next) => {
              update({ view: next })
              if (next === 'outside') setObserver(null)
            }}
          />
          <HeaderButton
            label="My sky"
            title="Line the sphere up with your own sky"
            pressed={observer !== null}
            onClick={toggleSky}
            // Phones and tablets only: it is about pointing the device at
            // the sky, which a desktop can't do.
            touchOnly
          >
            <CompassIcon />
          </HeaderButton>
        </>
      }
      canvasLabel="Interactive 3D sphere showing the Tree of Life projected onto the sky. Drag to look around from the centre. The structure is listed below for screen readers."
      canvas={
        <TreeOfLifeSphereCanvas
          view={view}
          layers={layers}
          vessel={vessel}
          appearance={appearance}
          observer={observer}
          topInset={headerHeight}
        />
      }
      structure={<Structure />}
      controls={
        <>
          <Section title="Layers">
            <div className="divide-y divide-white/5">
              {LAYER_TOGGLES.map(({ key, label }) => (
                <SwitchRow
                  key={key}
                  checked={layers[key]}
                  onChange={(on) =>
                    update((current) => ({
                      layers: { ...current.layers, [key]: on },
                    }))
                  }
                >
                  {label}
                </SwitchRow>
              ))}
            </div>
          </Section>

          <Section title="Settings">
            <div className="divide-y divide-white/5">
              {APPEARANCE_TOGGLES.map(({ key, label }) => (
                <SwitchRow
                  key={key}
                  checked={appearance[key]}
                  onChange={(on) =>
                    update((current) => ({
                      appearance: { ...current.appearance, [key]: on },
                    }))
                  }
                >
                  {label}
                </SwitchRow>
              ))}
            </div>
          </Section>

          <Section title="Vessels">
            <select
              aria-label="Vessels"
              value={vesselId}
              onChange={(e) => {
                update({ vessel: e.target.value })
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs/5 text-white"
            >
              <option value="">Off</option>
              {VESSELS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.number} · {v.cards}
                </option>
              ))}
            </select>
          </Section>
        </>
      }
    >
      {notice && (
        <p
          role="status"
          className={clsx(
            panel,
            'absolute left-1/2 z-20 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 px-3 py-1.5 text-center text-xs/5',
          )}
          style={{ top: 'calc(env(safe-area-inset-top) + 4.25rem)' }}
        >
          {notice}
        </p>
      )}
      {/* Sensor readings, filled in by the scene when the address ends in
          ?debug. Empty, and so hidden, otherwise. */}
      <pre
        id="sky-debug"
        className="pointer-events-none absolute bottom-2 left-2 z-20 text-[0.625rem]/4 text-emerald-300 empty:hidden"
      />
    </ModelShell>
  )
}
