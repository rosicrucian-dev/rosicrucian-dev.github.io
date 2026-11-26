import type { Metadata } from 'next'
import Link from 'next/link'

import { MODELS } from '@/lib/models'
import { Breadcrumbs, HOME } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Visuals',
  description:
    'Interactive models and diagrams of the symbols of the Rosicrucian tradition.',
}

export default function Visuals() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <Breadcrumbs
        trail={[HOME]}
        current={{ name: 'Visuals', href: '/visuals/' }}
      />

      <h1 className="mt-6 font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Visuals
      </h1>

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
