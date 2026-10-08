'use client'

// The page around a model: the scene filling the window, a header
// floating over it with the model's name and its controls, the gear and
// the panel it opens, an optional hint on how to get about, and the
// model's structure in words for screen readers. Each model supplies what
// is its own; the frame is the same for all.

import clsx from 'clsx'
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'

import { SITE_URL } from '@/lib/site'

import { CogIcon, XMarkIcon } from './icons'
import { ModelTitle } from './ModelTitle'

// The dark glass of every floating panel, label and tray.
export const panel =
  'rounded-2xl border border-white/10 bg-[#04050a]/75 text-sm/6 text-olive-200 backdrop-blur-md'

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[0.6875rem] font-medium tracking-widest text-olive-500 uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

// One row of a settings list: a name on the left, an on/off switch on the
// right. The whole row is the button, so there is plenty to tap.
export function SwitchRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-1.5 text-left text-sm/6"
    >
      {/* The name stays the same either way: off is not disabled. */}
      <span className="text-white">{children}</span>
      <span
        aria-hidden="true"
        className={clsx(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-olive-200' : 'bg-white/10',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 size-4 rounded-full transition-transform',
            checked ? 'translate-x-4 bg-[#04050a]' : 'bg-olive-500',
          )}
        />
      </span>
    </button>
  )
}

// A segmented switch for the header (a view, a design): one choice of a
// few, each button showing `short` on a phone and `label` elsewhere. With
// `fill` the buttons share the full width, for use in the controls panel.
export function HeaderTabs<T extends string>({
  label,
  value,
  options,
  onChange,
  fill = false,
}: {
  label: string
  value: T
  options: { value: T; label: string; short?: string }[]
  onChange: (value: T) => void
  fill?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx(
        'flex h-9 gap-0.5 rounded-lg p-0.5 ring-1 ring-current/20',
        fill && 'w-full',
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          aria-label={option.label}
          // The full name, where a phone shows only the short one.
          title={option.short ? option.label : undefined}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded-md px-3 text-sm font-medium whitespace-nowrap transition',
            fill && 'flex-1',
            value === option.value ? 'bg-current/15' : 'hover:bg-current/10',
          )}
        >
          <span className="sm:hidden">{option.short ?? option.label}</span>
          <span className="max-sm:hidden">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

// A square button in the header, matching the gear.
export function HeaderButton({
  label,
  title,
  pressed,
  touchOnly = false,
  onClick,
  children,
  ...rest
}: {
  label: string
  title?: string
  pressed?: boolean
  // For what only a phone or tablet can do (pointing it at the sky).
  touchOnly?: boolean
  onClick: () => void
  children: ReactNode
  'aria-expanded'?: boolean
  'aria-controls'?: string
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      {...rest}
      type="button"
      aria-label={label}
      title={title ?? label}
      aria-pressed={
        pressed === undefined || rest['aria-expanded'] !== undefined
          ? undefined
          : pressed
      }
      onClick={onClick}
      className={clsx(
        'relative size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-current/20 transition',
        touchOnly ? 'hidden pointer-coarse:inline-flex' : 'inline-flex',
        pressed ? 'bg-current/15' : 'hover:bg-current/10',
      )}
    >
      {/* Expanded touch target on coarse-pointer (touch) devices. */}
      <span className="absolute size-12 pointer-fine:hidden" />
      {children}
    </button>
  )
}

// ---- The hint -------------------------------------------------------------------

// One phrase of the hint: keys, if any, then words ("W A S D to move").
export interface HintPhrase {
  keys?: { key: string; label?: string }[]
  text: string
}

// How to get about: one set of phrases for a mouse and keyboard, one for
// a touch screen.
export interface Hint {
  mouse: HintPhrase[]
  touch: HintPhrase[]
}

// A key named in the hint.
function Key({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <kbd
      aria-label={label}
      className="inline-flex min-w-5 justify-center rounded border border-white/15 bg-white/5 px-1 font-sans text-[0.6875rem]/4 text-olive-200"
    >
      {children}
    </kbd>
  )
}

// The phrases run together with dots between them, each kept on one line;
// or, with `list`, one to a line. A phrase that starts with words starts
// with a capital when it starts a line.
function Phrases({ phrases, list }: { phrases: HintPhrase[]; list: boolean }) {
  return phrases.map(({ keys = [], text }, i) => {
    const start = list || i === 0
    const words =
      keys.length === 0 && start ? text[0].toUpperCase() + text.slice(1) : text
    return (
      <span key={i} className={list ? 'block' : 'whitespace-nowrap'}>
        {keys.map(({ key, label }) => (
          <span key={key}>
            <Key label={label}>{key}</Key>{' '}
          </span>
        ))}
        {words}
        {!list && i < phrases.length - 1 && (
          <span className="ml-1.5 text-olive-600">·</span>
        )}
      </span>
    )
  })
}

function HintPhrases({ hint, list = false }: { hint: Hint; list?: boolean }) {
  return (
    <>
      <span className="contents pointer-coarse:hidden">
        <Phrases phrases={hint.mouse} list={list} />
      </span>
      <span className="contents pointer-fine:hidden">
        <Phrases phrases={hint.touch} list={list} />
      </span>
    </>
  )
}

// ---- The frame -------------------------------------------------------------------

export function ModelShell({
  title,
  background,
  headerRef,
  headerControls,
  controlsId,
  controls,
  hint,
  canvasLabel,
  canvas,
  structure,
  children,
}: {
  // The model's name, beside the emblem that leads back to the models.
  title: string
  // The colour behind the scene, as a hex; the header is a veil of it.
  background: string
  // For a model that needs to know how much of the scene the header
  // covers.
  headerRef?: Ref<HTMLElement>
  // The model's own buttons, left of the gear.
  headerControls?: ReactNode
  // The id of the controls panel, for the gear's aria-controls.
  controlsId: string
  // Sections of the controls panel, above Help (if there is a hint) and
  // About.
  controls?: ReactNode
  // How to get about, shown over the scene until dismissed (on a mouse;
  // touch screens keep it under Help alone) and always under Help.
  // `shown` and `onShownChange` let the model remember the choice.
  hint?: {
    phrases: Hint
    shown: boolean
    onShownChange: (shown: boolean) => void
  }
  // What the scene is, for screen readers, and the scene itself.
  canvasLabel: string
  canvas: ReactNode
  // The model's structure in words, for screen readers: the canvas is
  // invisible to them and this is the real content.
  structure?: ReactNode
  // Anything else floating over the scene: labels, trays, a walking pad.
  children?: ReactNode
}) {
  const [controlsOpen, setControlsOpen] = useState(false)
  // A tap anywhere outside the open panel (and its button) closes it, as
  // does Escape. Listened for at the start of the press, so a drag on the
  // scene that begins outside the panel closes it too.
  const panelRef = useRef<HTMLDivElement>(null)
  const gear = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!controlsOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || gear.current?.contains(target))
        return
      setControlsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setControlsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [controlsOpen])

  return (
    // Nothing here is text to select. Without this, a long press on a phone
    // makes Safari select the whole page, with its blue highlight and
    // callout menu.
    <main
      className="fixed inset-0 overflow-hidden text-white select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
      style={{ backgroundColor: background }}
    >
      {/* Title on the left, chip buttons on the right, floating over the
          scene, which runs the full height behind it and shows through. */}
      <header
        ref={headerRef}
        className="absolute inset-x-0 top-0 z-20 box-content flex h-14 items-center justify-between gap-4 px-4 backdrop-blur-sm sm:px-6 lg:px-8"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: `${background}80`,
        }}
      >
        <ModelTitle>{title}</ModelTitle>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {headerControls}
          <HeaderButton
            ref={gear}
            label="Controls"
            pressed={controlsOpen}
            aria-expanded={controlsOpen}
            aria-controls={controlsId}
            onClick={() => setControlsOpen((open) => !open)}
          >
            <CogIcon />
          </HeaderButton>
        </div>
      </header>

      <div className="absolute inset-0">
        <div
          className="absolute inset-0 touch-none"
          role="img"
          aria-label={canvasLabel}
        >
          {canvas}
        </div>
        {structure && <div className="sr-only">{structure}</div>}

        {children}

        {/* How to get about, until dismissed; then it is kept under Help in
            the controls. Shown wherever there is a mouse, at any window
            width; on touch screens it is under Help alone. In a narrow
            window it sits under the header, clear of the labels below. */}
        {hint?.shown && (
          <div
            className="pointer-events-none absolute inset-x-4 hidden justify-center pointer-fine:flex max-lg:top-[calc(env(safe-area-inset-top)+4.25rem)] lg:bottom-6"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div
              className={clsx(
                panel,
                'pointer-events-auto flex items-center gap-1 py-1 pr-1 pl-3',
              )}
            >
              <p className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 py-0.5 text-center text-xs/5 text-olive-300">
                <HintPhrases hint={hint.phrases} />
              </p>
              <button
                type="button"
                aria-label="Dismiss the hint (it stays under Help in the controls)"
                title="Dismiss (it stays under Help in the controls)"
                onClick={() => hint.onShownChange(false)}
                className="flex size-7 shrink-0 items-center justify-center self-start rounded-md text-olive-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <XMarkIcon />
              </button>
            </div>
          </div>
        )}

        <div
          ref={panelRef}
          id={controlsId}
          className={clsx(
            panel,
            'absolute right-4 z-10 max-h-[calc(100%-5rem-env(safe-area-inset-top))] w-72 max-w-[calc(100%-2rem)] space-y-5 overflow-y-auto p-4 sm:right-6 lg:right-8',
            controlsOpen ? 'block' : 'hidden',
          )}
          // Just under the header.
          style={{ top: 'calc(env(safe-area-inset-top) + 3.75rem)' }}
        >
          {controls}

          {hint && (
            <Section title="Help">
              <p className="flex flex-col gap-1.5 text-xs/5 text-olive-300">
                <HintPhrases hint={hint.phrases} list />
              </p>
              {/* Bringing the hint back is for testing; visitors only ever
                  dismiss it. Shown under `next dev` only. */}
              {!hint.shown && process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={() => hint.onShownChange(true)}
                  className="text-xs/5 text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                >
                  Show this over the view
                </button>
              )}
            </Section>
          )}

          <Section title="About">
            <a
              href={SITE_URL}
              className="text-sm/6 text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
            >
              rosicrucian.dev
            </a>
          </Section>
        </div>
      </div>
    </main>
  )
}
