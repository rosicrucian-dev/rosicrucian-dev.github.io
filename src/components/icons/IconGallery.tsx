'use client'

// The icons, to browse, as heroicons.com has it: a search over their
// names, categories and keywords, and every icon on a grid; hovering one (or tabbing to it) shows two buttons over
// it, to copy its source as the SVG file is, or as JSX.

import { useMemo, useState } from 'react'

import type { Icon } from '@/lib/icon-types'

const CLASS = 'size-6 text-gray-500'

/** The SVG with a class on it, to paste as it is. */
const asSvg = (svg: string) => svg.replace('<svg ', `<svg class="${CLASS}" `)

/** The SVG as JSX: its attributes in camel case, the class as React has it. */
const asJsx = (svg: string) =>
  svg
    .replace(
      / (stroke-width|stroke-linecap|stroke-linejoin)=/g,
      (_, a: string) =>
        ` ${a.replace(/-(\w)/g, (__, c: string) => c.toUpperCase())}=`,
    )
    .replace('<svg ', `<svg className="${CLASS}" `)

function CopyButton({
  text,
  children,
  className,
}: {
  text: string
  children: string
  className: string
}) {
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
      className={`flex items-center justify-center text-sm font-medium text-olive-700 transition-colors hover:bg-olive-950/10 hover:text-olive-950 focus-visible:bg-olive-950/10 focus-visible:outline-none dark:text-olive-300 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:bg-white/10 ${className}`}
    >
      {copied ? 'Copied!' : children}
    </button>
  )
}

function Tile({ icon }: { icon: Icon }) {
  return (
    <li className="group">
      <div className="relative aspect-square rounded-xl bg-white/60 dark:bg-white/5">
        {/* The icon, centred; the buttons over it on hover or focus. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-olive-950 [&_svg]:size-7 dark:text-white"
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
        <div className="absolute inset-0 flex flex-col opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton
            text={asSvg(icon.svg)}
            className="flex-1 rounded-t-xl bg-olive-100/90 dark:bg-olive-900/90"
          >
            Copy SVG
          </CopyButton>
          <CopyButton
            text={asJsx(icon.svg)}
            className="flex-1 rounded-b-xl bg-olive-50/90 dark:bg-olive-950/90"
          >
            Copy JSX
          </CopyButton>
        </div>
      </div>
      <p
        className="mt-2 text-center text-xs/4 text-olive-600 dark:text-olive-400"
        title={icon.keywords.join(', ')}
      >
        {icon.name}
      </p>
    </li>
  )
}

export function IconGallery({ icons }: { icons: Icon[] }) {
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return icons.filter(
      (i) =>
        !q ||
        i.name.includes(q) ||
        i.category.includes(q) ||
        i.keywords.some((k) => k.includes(q)) ||
        i.component.toLowerCase().includes(q) ||
        i.character === q,
    )
  }, [icons, query])

  return (
    <div className="mt-12">
      <label className="sr-only" htmlFor="icon-search">
        Search icons
      </label>
      <input
        id="icon-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${icons.length} icons`}
        className="w-full rounded-full border border-olive-950/15 bg-white/60 px-4 py-2 text-base text-olive-950 placeholder:text-olive-500 focus:border-olive-950/40 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-olive-400 dark:focus:border-white/40"
      />

      {shown.length === 0 ? (
        <p className="mt-12 text-base/7 text-olive-700 dark:text-olive-400">
          No icons match.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-5">
          {shown.map((i) => (
            <Tile key={i.name} icon={i} />
          ))}
        </ul>
      )}
    </div>
  )
}
