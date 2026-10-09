// The formula beside the wheel: the five Names the star is set on, in the
// order they are traced, each with its point's element and role, the
// Name's letters and its number. Choosing one opens its card.
//
// Every row keeps the same height whichever Name is on it, so that
// stepping round the wheel doesn't make the rows jump: see Entry.

import clsx from 'clsx'

import { HEBREW_FONT } from '@/components/model/fonts'
import { panel } from '@/components/model/ModelShell'
import { formatGematria, NAMES, type FormulaEntry } from '@/lib/shemHaMephorash'

import { NameLetters } from './NameLetters'

// Every meaning, laid invisibly under each row so that the row is as
// tall as the tallest of them makes it. Not only the longest: on a narrow
// screen a shorter one can wrap onto more lines, depending on where its
// words break.
const MEANINGS = [...new Set(NAMES.map((n) => n.meaning))]

// What a row says: the point, its element and its role, then the Name on
// it.
function EntryText({
  entry: { point, name },
  angels,
  hidden = false,
}: {
  entry: FormulaEntry
  angels: boolean
  hidden?: boolean
}) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className={clsx('col-start-1 row-start-1', hidden && 'invisible')}
    >
      <span className="block text-[0.6875rem]/5 font-medium tracking-widest text-olive-400 uppercase">
        {point.element} · {point.role}
      </span>
      <span className="block text-base/6 text-white">
        {name.number} · {name.meaning}
      </span>
      {angels && (
        <span className="block truncate text-xs/5 text-olive-400">
          {name.angel}
        </span>
      )}
    </span>
  )
}

function Entry({
  entry,
  colours,
  angels,
  gematria,
  onOpen,
}: {
  entry: FormulaEntry
  colours: boolean
  angels: boolean
  gematria: boolean
  onOpen: () => void
}) {
  const { point, name } = entry
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        title={`The card of ${name.meaning}`}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-lg"
          style={{
            borderColor: point.color,
            color: point.color,
            fontFamily: HEBREW_FONT,
          }}
        >
          {point.letter}
        </span>
        {/* The text, over invisible copies of it holding every meaning:
            they all share one cell, so the row is always as tall as the
            tallest of them makes it, and any room to spare falls at the
            bottom. */}
        <span className="grid min-w-0 flex-1">
          <EntryText entry={entry} angels={angels} />
          {MEANINGS.map((meaning) => (
            <EntryText
              key={meaning}
              entry={{ ...entry, name: { ...name, meaning } }}
              angels={angels}
              hidden
            />
          ))}
        </span>
        {/* A fixed width, whatever the letters', so that the text beside
            them always wraps the same way and the row keeps its height.
            The letters' tops line up with the capitals of the label beside
            them: trimmed to the top of their capitals, then set down to
            where the label's capitals stand in its line (0.375rem), less
            the sixth of their size by which Hebrew letters stand lower than
            Latin capitals in Times. */}
        <span className="w-20 shrink-0 text-right">
          <span className="mt-[calc(0.375rem-0.17em)] block text-5xl/none [text-box:trim-start_cap_alphabetic]">
            <NameLetters hebrew={name.hebrew} colours={colours} />
          </span>
          {/* Its number, as Moore's chart gives it. */}
          {gematria && (
            <span className="mt-1.5 block text-xs/5 text-olive-400 tabular-nums">
              {formatGematria(name.hebrew)}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

export function FormulaPanel({
  entries,
  colours,
  angels,
  gematria,
  onOpen,
  className,
}: {
  // The formula, in tracing order.
  entries: FormulaEntry[]
  colours: boolean
  angels: boolean
  gematria: boolean
  // Open the card of the entry at this place in the formula.
  onOpen: (index: number) => void
  // Where the panel sits on the page.
  className: string
}) {
  return (
    <div
      className={clsx(panel, 'overflow-y-auto p-3 select-text', className)}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* The Essential Name heads the list itself, as Spirit, so the panel
          needs no title of its own but one for screen readers. */}
      <h2 className="sr-only">The formula of {entries[0].name.meaning}</h2>
      <ol className="space-y-0.5">
        {entries.map((entry, i) => (
          <Entry
            key={entry.point.id}
            entry={entry}
            colours={colours}
            angels={angels}
            gematria={gematria}
            onOpen={() => onOpen(i)}
          />
        ))}
      </ol>
    </div>
  )
}
