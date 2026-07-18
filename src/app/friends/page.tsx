import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Friends of Rosicrucian Developers',
  description:
    'Friends of the Rosicrucian Developers who are not officially part of the group.',
}

// Each entry is one friend of the organization. These are not official
// members of Rosicrucian Developers. Add more over time and they render
// automatically.
const friends = [
  {
    name: 'Pansophers',
    value: 'pansophers.com',
    href: 'https://pansophers.com/',
  },
  {
    name: 'Cosmic Repository',
    value: 'joshyates.me',
    href: 'https://joshyates.me/',
  },
]

export default function Friends() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <h1 className="font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Friends
      </h1>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium tracking-widest text-olive-500 uppercase transition-colors hover:text-olive-700 dark:hover:text-olive-300"
      >
        Rosicrucian Developers
      </Link>

      <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
        Links to other projects we love.
      </p>

      <section className="mt-16">
        <ul className="space-y-6">
          {friends.map((friend) => (
            <li key={friend.name}>
              <p className="text-sm/7 font-semibold text-olive-950 dark:text-white">
                {friend.name}
              </p>
              <a
                href={friend.href}
                className="text-sm/7 text-olive-700 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-950 hover:decoration-olive-950 dark:text-olive-400 dark:decoration-olive-700 dark:hover:text-white dark:hover:decoration-white"
              >
                {friend.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
