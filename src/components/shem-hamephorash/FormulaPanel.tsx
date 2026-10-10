// The formula beside the wheel: the five Names the star is set on, in the
// order they are traced, each with its point's element and role, the
// Name's letters and its number. Choosing one opens its card.
//
// Each row is as tall as its own Name makes it, a line more where a
// meaning wraps onto a second. Where room is short (the `compact` layout:
// under the wheel on a tall, narrow screen, or beside it on a short one)
// the rows are smaller.

import clsx from 'clsx'

import { HEBREW_FONT } from '@/components/model/fonts'
import { panel } from '@/components/model/ModelShell'
import { formatGematria, type FormulaEntry } from '@/lib/shemHaMephorash'

import { NameLetters } from './NameLetters'

// What a row says: the point, its element and its role, then the Name on
// it.
function EntryText({ entry: { point, name } }: { entry: FormulaEntry }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-[0.625rem]/4 font-medium tracking-widest text-olive-400 uppercase roomy:text-[0.6875rem]/5">
        {point.element} · {point.role}
      </span>
      <span className="block text-[0.8125rem]/5 text-white roomy:text-base/6">
        {name.number} · {name.meaning}
      </span>
      <span className="block truncate text-xs/5 text-olive-400">
        {name.angel}
      </span>
    </span>
  )
}

function Entry({ entry, onOpen }: { entry: FormulaEntry; onOpen: () => void }) {
  const { point, name } = entry
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        title={`The card of ${name.meaning}`}
        className="flex w-full items-start gap-2.5 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-white/5 roomy:gap-3 roomy:px-2 roomy:py-2"
      >
        {/* The point's letter, as on the star: white, Spirit's filled. */}
        <span
          aria-hidden="true"
          className={clsx(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-olive-50 text-base roomy:size-8 roomy:text-lg',
            point.id === 'spirit'
              ? 'bg-olive-50 text-[#04050a]'
              : 'text-olive-50',
          )}
          style={{ fontFamily: HEBREW_FONT }}
        >
          {point.letter}
        </span>
        <EntryText entry={entry} />
        {/* A fixed width, whatever the letters', so that the Names line
            up down the panel and the text beside them wraps alike. The
            letters' tops line up with the capitals of the label beside
            them: trimmed to the top of their capitals, then set down to
            where the label's capitals stand in its line (0.375rem, or
            0.275rem in the smaller label of a narrow screen), less the
            sixth of their size by which Hebrew letters stand lower than
            Latin capitals in Times. */}
        <span className="w-12 shrink-0 text-right roomy:w-20">
          <span className="mt-[calc(0.275rem-0.17em)] block text-2xl/none [text-box:trim-start_cap_alphabetic] roomy:mt-[calc(0.375rem-0.17em)] roomy:text-5xl/none">
            <NameLetters hebrew={name.hebrew} />
          </span>
          {/* Its number, as Moore's chart gives it. */}
          <span className="mt-0.5 block text-[0.625rem]/3 text-olive-400 tabular-nums roomy:mt-1.5 roomy:text-xs/5">
            {formatGematria(name.hebrew)}
          </span>
        </span>
      </button>
    </li>
  )
}

export function FormulaPanel({
  entries,
  onOpen,
  className,
}: {
  // The formula, in tracing order.
  entries: FormulaEntry[]
  // Open the card of the entry at this place in the formula.
  onOpen: (index: number) => void
  // Where the panel sits on the page.
  className: string
}) {
  return (
    <div
      className={clsx(
        panel,
        'overflow-y-auto p-1.5 select-text roomy:p-3',
        className,
      )}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* The Essential Name heads the list itself, as Spirit, so the panel
          needs no title of its own but one for screen readers. */}
      <h2 className="sr-only">The formula of {entries[0].name.meaning}</h2>
      <ol className="space-y-0.5">
        {entries.map((entry, i) => (
          <Entry key={entry.point.id} entry={entry} onOpen={() => onOpen(i)} />
        ))}
      </ol>
    </div>
  )
}
