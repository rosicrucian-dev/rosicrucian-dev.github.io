import Image from 'next/image'
import Link from 'next/link'

const projects: SiteLink[] = [
  {
    name: 'BOTA Toolbox',
    href: 'https://botatoolbox.org',
    description:
      'An unofficial set of advanced tools for members of the Builders of the Adytum.',
  },
  {
    name: 'The School of Ageless Wisdom',
    href: 'https://agelesswisdom.school',
    description: 'The early curriculum of Paul Foster Case.',
  },
  {
    name: 'PFC List',
    href: 'https://pfclist.org',
    description:
      'A discussion forum for current and former members of the Builders of the Adytum.',
  },
]

const library: SiteLink[] = [
  {
    name: 'Books',
    href: '/books',
    description:
      'Public-domain books of the Western esoteric tradition, set from named editions and published as PDFs.',
  },
  {
    name: 'Visuals',
    href: '/visuals',
    description:
      'Interactive models and diagrams of the symbols of the Rosicrucian tradition.',
  },
]

const tools: SiteLink[] = [
  {
    name: 'Icons',
    href: '/icons',
    description:
      'SVG icons for the Rosicrucian tradition in the style of Heroicons.',
  },
  {
    name: '@rosicrucian/search',
    href: 'https://github.com/rosicrucian-dev/packages/tree/main/packages/search',
    description:
      'A TypeScript library for full-text search on static sites, with no server: build an index at build time, search it in the browser, and link each result to its passage.',
  },
]

interface SiteLink {
  name: string
  href: string
  description: string
}

function LinkSection({ title, links }: { title: string; links: SiteLink[] }) {
  return (
    <section className="mt-16">
      <h2 className="text-sm font-medium tracking-widest text-olive-500 uppercase">
        {title}
      </h2>
      <ul className="mt-6 space-y-8">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="font-display text-2xl text-olive-950 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:decoration-olive-950 dark:text-white dark:decoration-olive-700 dark:hover:decoration-white"
            >
              {link.name}
            </a>
            <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
              {link.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <Image
        src="/avatar.png"
        alt="Rosicrucian Developers emblem"
        width={112}
        height={112}
        priority
        className="size-28"
      />

      <h1 className="mt-8 font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-8xl dark:text-white">
        Rosicrucian Developers
      </h1>

      <p className="mt-6 max-w-xl text-lg/8 text-olive-700 dark:text-olive-400">
        A community of developers building open source projects for the Western
        esoteric tradition.
      </p>

      <a
        href="https://github.com/rosicrucian-dev"
        className="mt-8 -ml-4 inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm/7 font-medium text-olive-950 transition-colors hover:bg-olive-950/10 dark:text-white dark:hover:bg-white/10"
      >
        Contribute with GitHub
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

      <LinkSection title="Projects" links={projects} />
      <LinkSection title="Library" links={library} />
      <LinkSection title="Developer Tools" links={tools} />

      <section className="mt-16">
        <h2 className="text-sm font-medium tracking-widest text-olive-500 uppercase">
          Contact
        </h2>
        <div className="mt-6 text-sm/7">
          <Link
            href="/jonathan"
            className="font-semibold text-olive-950 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:decoration-olive-950 dark:text-white dark:decoration-olive-700 dark:hover:decoration-white"
          >
            Jonathan Taylor
          </Link>
          <p className="text-olive-700 dark:text-olive-400">Group Organizer</p>
        </div>
      </section>
    </main>
  )
}
