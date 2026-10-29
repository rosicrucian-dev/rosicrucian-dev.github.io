import type { Metadata } from 'next'
import Link from 'next/link'

import { IconGallery } from '@/components/icons/IconGallery'
import { readIcons } from '@/lib/icons'

export const metadata: Metadata = {
  title: 'Icons',
  description:
    'Rosicrucian Icons: hand-crafted SVG icons of the symbols of the spiritual traditions, in the manner of Heroicons. Starting with astrology.',
}

export default function Icons() {
  const icons = readIcons()
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <h1 className="font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Icons
      </h1>

      <Link
        href="/"
        className="mt-6 inline-block self-start text-sm font-medium tracking-widest text-olive-500 uppercase underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-700 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-olive-300 dark:hover:decoration-olive-300"
      >
        Rosicrucian Developers
      </Link>

      <a
        href="https://github.com/rosicrucian-dev/icons"
        className="mt-8 -ml-4 inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm/7 font-medium text-olive-950 transition-colors hover:bg-olive-950/10 dark:text-white dark:hover:bg-white/10"
      >
        View source on GitHub
        <svg
          width={13}
          height={7}
          viewBox="0 0 13 7"
          fill="none"
          strokeWidth={1}
          aria-hidden="true"
          className="inline-block"
        >
          <path
            d="M12.5049 3.49512L0.504883 3.49512"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 6.5L12.5 3.5L9.5 0.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>

      <IconGallery icons={icons} />
    </main>
  )
}
