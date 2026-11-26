import type { Metadata } from 'next'

import { IconGallery } from '@/components/icons/IconGallery'
import { readIcons } from '@/lib/icons'
import { Breadcrumbs, HOME } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Icons',
  description:
    'SVG icons for the Rosicrucian tradition in the style of Heroicons.',
}

export default function Icons() {
  const icons = readIcons()
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <Breadcrumbs
        trail={[HOME]}
        current={{ name: 'Icons', href: '/icons/' }}
      />

      <h1 className="mt-6 font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Icons
      </h1>

      <p className="mt-8 max-w-xl text-lg/8 text-olive-700 dark:text-olive-400">
        View source on{' '}
        <a
          href="https://github.com/rosicrucian-dev/icons"
          className="underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-950 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-white dark:hover:decoration-olive-300"
        >
          GitHub
        </a>
        .
      </p>

      <IconGallery icons={icons} />
    </main>
  )
}
