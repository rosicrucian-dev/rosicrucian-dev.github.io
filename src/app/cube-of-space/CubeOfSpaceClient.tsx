'use client'

import dynamic from 'next/dynamic'

import {
  HeaderTabs,
  ModelShell,
  Section,
  SwitchRow,
} from '@/components/model/ModelShell'
import {
  AXES,
  CARD_STYLES,
  CENTRE,
  CARDS,
  EDGES,
  FACES,
  keyLetter,
  type CubeFace,
} from '@/lib/cubeOfSpace'
import { LETTER_BY_HEBREW } from '@/lib/letters'

import { useSettings } from './useSettings'

// three.js + react-three-fiber are by far the heaviest imports on this
// route — load them on demand so the page shell paints without them.
const CubeOfSpaceCanvas = dynamic(
  () =>
    import('@/components/cube-of-space/CubeOfSpaceCanvas').then(
      (m) => m.CubeOfSpaceCanvas,
    ),
  { ssr: false },
)

const DIRECTION_NAMES: Record<CubeFace['id'], string> = {
  above: 'Above',
  below: 'Below',
  east: 'East',
  west: 'West',
  north: 'North',
  south: 'South',
}

const letterName = (hebrew: string) => LETTER_BY_HEBREW.get(hebrew)?.name

// The whole cube as text, for screen readers.
function Structure({ starMoon }: { starMoon: boolean }) {
  return (
    <>
      <h2>The six faces</h2>
      <ul>
        {FACES.map((face) => (
          <li key={face.id}>
            {DIRECTION_NAMES[face.id]}: {letterName(face.letter)}, {face.planet}
            , {CARDS[face.letter].name}
          </li>
        ))}
      </ul>
      <h2>The twelve edges</h2>
      <ul>
        {EDGES.map((edge) => (
          <li key={edge.id}>
            {letterName(edge.letter)}, {edge.sign},{' '}
            {CARDS[keyLetter(edge.letter, starMoon)].name}, flowing {edge.flow}
          </li>
        ))}
      </ul>
      <h2>The axes and the centre</h2>
      <ul>
        {AXES.map((axis) => (
          <li key={axis.letter}>
            {axis.name}, {axis.element}, {CARDS[axis.letter].name}: from{' '}
            {DIRECTION_NAMES[axis.between[0]]} to{' '}
            {DIRECTION_NAMES[axis.between[1]]}
          </li>
        ))}
        <li>
          The centre: {CENTRE.name}, {CENTRE.planet},{' '}
          {CARDS[CENTRE.letter].name}
        </li>
      </ul>
    </>
  )
}

export function CubeOfSpaceClient() {
  // The view, the cards and the flow are remembered between visits.
  const [{ view, cardStyle, starMoon, flow }, update] = useSettings()

  return (
    <ModelShell
      title="Cube of Space"
      background="#04050a"
      controlsId="cube-controls"
      headerControls={
        <HeaderTabs
          label="View"
          value={view}
          options={[
            { value: 'inside', label: 'Inside', short: 'In' },
            { value: 'outside', label: 'Outside', short: 'Out' },
          ]}
          onChange={(next) => update({ view: next })}
        />
      }
      controls={
        <>
          <Section title="Cards">
            <HeaderTabs
              label="Card style"
              fill
              value={cardStyle}
              options={CARD_STYLES.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              onChange={(next) => update({ cardStyle: next })}
            />
            <SwitchRow
              checked={starMoon}
              onChange={(next) => update({ starMoon: next })}
            >
              Switch the Star and Moon
            </SwitchRow>
          </Section>
          <Section title="Settings">
            <SwitchRow
              checked={flow}
              onChange={(next) => update({ flow: next })}
            >
              Flowing edges
            </SwitchRow>
          </Section>
        </>
      }
      canvasLabel={`The Cube of Space, seen from ${view}: the Hebrew letters and their Tarot keys on its six faces and twelve edges, after Paul Foster Case. ${
        view === 'outside'
          ? 'Drag to turn the cube in the hand, or switch to the inside view to look around from its centre.'
          : 'Drag to look around, or switch to the outside view to turn the cube in the hand.'
      } Its structure is listed below for screen readers.`}
      canvas={
        <CubeOfSpaceCanvas
          cardStyle={cardStyle}
          starMoon={starMoon}
          flow={flow}
          outside={view === 'outside'}
        />
      }
      structure={<Structure starMoon={starMoon} />}
    />
  )
}
