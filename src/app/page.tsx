import Image from 'next/image'
import Link from 'next/link'

const projects = [
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
]

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
        A community of developers building open source projects for the aquarian
        age.
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

      <section className="mt-16">
        <h2 className="text-sm font-medium tracking-widest text-olive-500 uppercase">
          Projects
        </h2>
        <ul className="mt-6 space-y-8">
          {projects.map((project) => (
            <li key={project.name}>
              <a
                href={project.href}
                className="font-display text-2xl text-olive-950 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:decoration-olive-950 dark:text-white dark:decoration-olive-700 dark:hover:decoration-white"
              >
                {project.name}
              </a>
              <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
                {project.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-sm font-medium tracking-widest text-olive-500 uppercase">
          Community
        </h2>
        <div className="mt-6">
          <Link
            href="/friends"
            className="font-display text-2xl text-olive-950 underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:decoration-olive-950 dark:text-white dark:decoration-olive-700 dark:hover:decoration-white"
          >
            Friends of Rosicrucian Developers
          </Link>
          <p className="mt-2 text-base/7 text-olive-700 dark:text-olive-400">
            Links to other projects we love.
          </p>
        </div>
      </section>

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
