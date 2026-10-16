import type { Metadata } from 'next'
import Link from 'next/link'

import { MODELS } from '@/lib/models'

export const metadata: Metadata = {
  title: 'Models',
  description:
    'Interactive 3D models of the symbols of the Rosicrucian Tradition.',
}

export default function Models() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <h1 className="font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Models
      </h1>

      <Link
        href="/"
        className="mt-6 inline-block self-start text-sm font-medium tracking-widest text-olive-500 uppercase underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-700 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-olive-300 dark:hover:decoration-olive-300"
      >
        Rosicrucian Developers
      </Link>

      <ul className="mt-16 space-y-8">
        {MODELS.map((model) => (
          <li key={model.slug}>
            <Link
              href={`/${model.slug}`}
              className="font-display text-2xl text-olive-950 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:decoration-olive-950 dark:text-white dark:decoration-olive-700 dark:hover:decoration-white"
            >
              {model.name}
            </Link>
            <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
              {model.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
