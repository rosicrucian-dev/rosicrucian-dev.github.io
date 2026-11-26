import type { Metadata } from 'next'
import Link from 'next/link'

import {
  BOOKS,
  BOOKS_REPO,
  bookPath,
  pdfUrl,
  screenPdfUrl,
  sourceUrl,
} from '@/lib/books'
import { Breadcrumbs, HOME } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Public-domain books of the Western esoteric tradition, set from named editions and published as PDFs.',
}

const link =
  'underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-950 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-white dark:hover:decoration-olive-300'

export default function Books() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <Breadcrumbs
        trail={[HOME]}
        current={{ name: 'Books', href: '/books/' }}
      />

      <h1 className="mt-6 font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Books
      </h1>

      <p className="mt-8 max-w-xl text-lg/8 text-olive-700 dark:text-olive-400">
        Public-domain books of the Western esoteric tradition. Each comes in two
        PDFs: one sized for reading on screens, and one for printing on US
        Letter paper. View the source on{' '}
        <a href={BOOKS_REPO} className={link}>
          GitHub
        </a>
        .
      </p>

      <ul className="mt-16 space-y-12">
        {BOOKS.map((book) => (
          <li key={book.file}>
            <h2 className="font-serif text-2xl/8 font-medium text-olive-950 dark:text-white">
              <Link
                href={bookPath(book)}
                className="transition-colors hover:text-olive-700 dark:hover:text-olive-300"
              >
                {book.title}
              </Link>
            </h2>
            {book.subtitle && (
              <p className="text-base/8 text-olive-700 italic dark:text-olive-400">
                {book.subtitle}
              </p>
            )}
            <p className="text-base/8 text-olive-700 dark:text-olive-400">
              {book.author}
            </p>
            <p className="text-sm/8 font-medium text-olive-700 dark:text-olive-400">
              <a href={screenPdfUrl(book)} className={link}>
                PDF for screens
              </a>
              <span aria-hidden="true" className="mx-2 text-olive-500">
                ·
              </span>
              <a href={pdfUrl(book)} className={link}>
                PDF for printing
              </a>
              <span aria-hidden="true" className="mx-2 text-olive-500">
                ·
              </span>
              <a href={sourceUrl(book)} className={link}>
                Source
              </a>
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
