'use client'

// The icons, to browse: a search over their names, categories and
// keywords, the categories to filter by, every icon on a grid, and the
// one chosen shown large with its details and its source to copy, as
// heroicons.com has it: the SVG as the file is, or as JSX.

import { useMemo, useState } from 'react'

import { CATEGORIES, type Category, type Icon } from '@/lib/icon-types'

const CATEGORY_LABEL: Record<Category, string> = {
  planets: 'Planets',
  points: 'Points',
  signs: 'Signs',
  aspects: 'Aspects',
  elements: 'Elements',
  dignities: 'Dignities',
  numerals: 'Numerals',
  letters: 'Letters',
}

/** The SVG as JSX: its attributes in camel case, the class attribute as
 * React has it, the path self-closing. */
function toJsx(svg: string, className: string): string {
  return svg
    .replace(
      /\s(stroke-width|stroke-linecap|stroke-linejoin|aria-hidden|data-slot)=/g,
      (_, a: string) =>
        a === 'aria-hidden' || a === 'data-slot'
          ? ` ${a}=`
          : ` ${a.replace(/-(\w)/g, (__, c: string) => c.toUpperCase())}=`,
    )
    .replace('<svg ', `<svg className="${className}" `)
}

/** The SVG with a class on it, to paste as it is. */
const withClass = (svg: string, className: string) =>
  svg.replace('<svg ', `<svg class="${className}" `)

function CopyButton({ text, children }: { text: string; children: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="rounded-full border border-olive-950/15 px-3 py-1 text-sm font-medium text-olive-950 transition-colors hover:bg-olive-950/10 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
    >
      {copied ? 'Copied' : children}
    </button>
  )
}

export function IconGallery({ icons }: { icons: Icon[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return icons.filter(
      (i) =>
        (!category || i.category === category) &&
        (!q ||
          i.name.includes(q) ||
          i.category.includes(q) ||
          i.keywords.some((k) => k.includes(q)) ||
          i.character === q),
    )
  }, [icons, query, category])

  const icon = icons.find((i) => i.name === chosen) ?? null
  const className = 'size-6 text-gray-500'

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="icon-search">
          Search icons
        </label>
        <input
          id="icon-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${icons.length} icons`}
          className="w-full rounded-full border border-olive-950/15 bg-white/60 px-4 py-2 text-base text-olive-950 placeholder:text-olive-500 focus:border-olive-950/40 focus:outline-none sm:max-w-xs dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-olive-400 dark:focus:border-white/40"
        />
      </div>
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Category"
      >
        {[null, ...CATEGORIES].map((c) => (
          <button
            key={c ?? 'all'}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className="rounded-full px-3 py-1 text-sm font-medium text-olive-700 transition-colors hover:bg-olive-950/10 aria-pressed:bg-olive-950 aria-pressed:text-white dark:text-olive-400 dark:hover:bg-white/10 dark:aria-pressed:bg-white dark:aria-pressed:text-olive-950"
          >
            {c ? CATEGORY_LABEL[c] : 'All'}
          </button>
        ))}
      </div>

      {icon && (
        <div className="mt-8 flex flex-col gap-6 rounded-2xl bg-white/60 p-6 sm:flex-row sm:items-start dark:bg-white/5">
          <div
            className="flex size-32 shrink-0 items-center justify-center rounded-xl bg-olive-100 text-olive-950 [&_svg]:size-20 dark:bg-olive-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-3xl text-olive-950 dark:text-white">
              {icon.name}
            </h2>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-olive-700 dark:text-olive-400">
              <dt>Category</dt>
              <dd>{CATEGORY_LABEL[icon.category]}</dd>
              <dt>Component</dt>
              <dd className="font-mono">{icon.component}</dd>
              {icon.codepoint && (
                <>
                  <dt>Unicode</dt>
                  <dd className="font-mono">
                    {icon.character} {icon.codepoint}
                  </dd>
                </>
              )}
              {icon.keywords.length > 0 && (
                <>
                  <dt>Keywords</dt>
                  <dd>{icon.keywords.join(', ')}</dd>
                </>
              )}
              {icon.source === 'heroicons' && (
                <>
                  <dt>Source</dt>
                  <dd>
                    Heroicons’{' '}
                    <span className="font-mono">{icon.heroicon}</span>
                  </dd>
                </>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={withClass(icon.svg, className)}>
                Copy SVG
              </CopyButton>
              <CopyButton text={toJsx(icon.svg, className)}>
                Copy JSX
              </CopyButton>
              <CopyButton
                text={`import { ${icon.component} } from '@rosicrucian-icons/react/24/outline'`}
              >
                Copy import
              </CopyButton>
            </div>
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="mt-12 text-base/7 text-olive-700 dark:text-olive-400">
          No icons match.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {shown.map((i) => (
            <li key={i.name}>
              <button
                type="button"
                onClick={() => setChosen(i.name === chosen ? null : i.name)}
                aria-pressed={i.name === chosen}
                aria-label={i.name}
                title={i.name}
                className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl text-olive-950 transition-colors hover:bg-white/60 aria-pressed:bg-white/80 dark:text-white dark:hover:bg-white/5 dark:aria-pressed:bg-white/10"
              >
                <span
                  className="[&_svg]:size-7"
                  dangerouslySetInnerHTML={{ __html: i.svg }}
                />
                <span className="w-full truncate px-1 text-center text-[0.6875rem]/4 text-olive-600 dark:text-olive-400">
                  {i.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
