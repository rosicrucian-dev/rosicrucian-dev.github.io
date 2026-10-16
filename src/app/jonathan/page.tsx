import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Jonathan Taylor',
  description: 'Lead Developer at Rosicrucian Developers.',
}

// Each entry is one row in the Links section. Add more over time
// (GitHub, Mastodon, writing, etc.) and they render automatically.
const links = [
  {
    label: 'Email',
    value: 'jonathan@rosicrucian.dev',
    href: 'mailto:jonathan@rosicrucian.dev',
  },
  {
    label: 'Buy me a coffee',
    value: 'buymeacoffee.com/rosicruciandev',
    href: 'https://buymeacoffee.com/rosicruciandev',
  },
]

export default function Jonathan() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <h1 className="font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Jonathan Taylor
      </h1>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium tracking-widest text-olive-500 uppercase transition-colors hover:text-olive-700 dark:hover:text-olive-300"
      >
        Rosicrucian Developers
      </Link>

      <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
        Group Organizer
      </p>

      {/* Future: bio, writing, projects, and other detail slot in here. */}

      <section className="mt-16">
        <ul className="space-y-6">
          {links.map((link) => (
            <li key={link.label}>
              <p className="text-sm/7 font-semibold text-olive-950 dark:text-white">
                {link.label}
              </p>
              <a
                href={link.href}
                className="text-sm/7 text-olive-700 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-950 hover:decoration-olive-950 dark:text-olive-400 dark:decoration-olive-700 dark:hover:text-white dark:hover:decoration-white"
              >
                {link.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
