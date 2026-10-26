'use client'

// One of the five Names of a formula as Moore's cards show it, full
// screen: the Name's letters, large, glowing on black, in a card twice as
// wide as it is tall (his are 2½ by 5 inches), for scrying a Name. His
// cards carry a text on the back; we have it for only the five Names of
// his example, so the card is a front alone, with what it stands for
// beneath it.
//
// Before the five, a page of the star alone with the five Names on its
// points (see FormulaStar), so six pages in all.
//
// A modal <dialog>: the page behind is inert while it is up, so focus
// stays on the card, as the browser provides; Escape puts it down. ←
// and → go round the six, the star then the five in the order they are
// traced; the page's own arrow keys (which turn the star) see them as
// already handled.

import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import { ChevronIcon, XMarkIcon } from '@/components/model/icons'
import { HeaderButton } from '@/components/model/ModelShell'
import { formatGematria, type FormulaEntry } from '@/lib/shemHaMephorash'

import { FormulaStar } from './FormulaStar'
import { NameLetters } from './NameLetters'

export function Card({
  entries,
  page,
  onStep,
  onClose,
}: {
  // The formula, in tracing order, and which page is shown: 0 the star,
  // then 1 to 5 the cards of its five Names.
  entries: FormulaEntry[]
  page: number
  // Go on (1) or back (−1) round the six.
  onStep: (by: 1 | -1) => void
  onClose: () => void
}) {
  const starPage = page === 0
  const essential = entries[0].name
  const { point, name } = entries[starPage ? 0 : page - 1]

  const dialog = useRef<HTMLDialogElement>(null)
  // Opened once it is in the page. Not closed when it leaves: taking the
  // element away closes it, and a close() here would fire its close event,
  // which in development (where React runs effects twice) would put the
  // card down the moment it came up.
  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-label={
        starPage
          ? `The formula of ${essential.meaning}`
          : `The card of ${name.meaning}`
      }
      // Put down by the page (unmounting it) rather than closed here: the
      // close event comes later, as a task of its own, while these come at
      // once. Escape is the dialog's cancel, taken over to the same end;
      // onClose stays for any other way the browser closes it.
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') onStep(1)
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') onStep(-1)
        else return
        e.preventDefault()
      }}
      // A tap on the dark around the card puts it down.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-0 flex size-full max-h-none max-w-none flex-col items-center justify-center gap-5 overflow-y-auto bg-transparent px-4 py-16 text-white backdrop:bg-[#04050a]/95 backdrop:backdrop-blur-md"
    >
      {/* Where the page's gear is, and the same button, so that the
          card's close sits in the toolbar as it was. The browser focuses
          it when the card comes up, as the first thing on it. */}
      <div
        className="absolute right-4 sm:right-6 lg:right-8"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.625rem)' }}
      >
        <HeaderButton
          label="Put the card down"
          title="Close (Esc)"
          onClick={onClose}
        >
          <XMarkIcon />
        </HeaderButton>
      </div>

      {!starPage && (
        <p className="text-[0.6875rem]/5 font-medium tracking-widest text-olive-400 uppercase">
          {point.element} · {point.role}
        </p>
      )}

      {starPage ? (
        // As tall as the cards may be, and no wider than it need be.
        <div className="w-[min(100%,40rem,calc((100dvh-18rem)*1.37))]">
          <FormulaStar entries={entries} />
        </div>
      ) : (
        // The card. The letters are sized by its width, so they fill it
        // as they fill Moore's, on any screen.
        <div className="@container flex aspect-[2/1] w-[min(100%,56rem,calc((100dvh-18rem)*2))] items-center justify-center rounded-2xl bg-black ring-1 ring-white/10">
          <span className="text-[30cqw]/none">
            <NameLetters hebrew={name.hebrew} marks />
          </span>
        </div>
      )}

      <div className="text-center">
        <p className="text-xl/8 text-white">
          {name.number} · {name.meaning}
        </p>
        {!starPage && (
          <p className="text-sm/6 text-olive-400">
            {name.angel} · {formatGematria(name.hebrew)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <HeaderButton
          label="The card before"
          title="Before (←)"
          onClick={() => onStep(-1)}
        >
          <ChevronIcon rotate={-90} />
        </HeaderButton>
        {/* Where this page is among the six. */}
        <div className="flex gap-2" aria-hidden="true">
          {[null, ...entries].map((e, i) => (
            <span
              key={e?.point.id ?? 'star'}
              className={clsx(
                'size-2 rounded-full ring-1 ring-olive-50',
                i === page && 'bg-olive-50',
              )}
            />
          ))}
        </div>
        <HeaderButton
          label="The card after"
          title="After (→)"
          onClick={() => onStep(1)}
        >
          <ChevronIcon rotate={90} />
        </HeaderButton>
      </div>
    </dialog>
  )
}
