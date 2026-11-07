import type { Metadata } from 'next'
import Link from 'next/link'

import { BookCover } from '@/components/books/BookCover'
import { BOOKS, BOOKS_REPO, pdfUrl, sourceUrl } from '@/lib/books'

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
      <h1 className="font-display text-6xl/none tracking-tight text-balance text-olive-950 sm:text-7xl dark:text-white">
        Books
      </h1>

      <Link
        href="/"
        className="mt-6 inline-block self-start text-sm font-medium tracking-widest text-olive-500 uppercase underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-700 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-olive-300 dark:hover:decoration-olive-300"
      >
        Rosicrucian Developers
      </Link>

      <p className="mt-8 max-w-xl text-lg/8 text-olive-700 dark:text-olive-400">
        Public-domain books of the Western esoteric tradition. View the source
        on{' '}
        <a href={BOOKS_REPO} className={link}>
          GitHub
        </a>
        .
      </p>

      <ul className="mt-16 space-y-12">
        {BOOKS.map((book) => (
          <li key={book.file} className="flex gap-6">
            <a
              href={pdfUrl(book)}
              aria-label={`${book.title}: read the PDF`}
              className="shrink-0 rounded-sm transition-shadow hover:shadow-md"
            >
              <BookCover book={book} />
            </a>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-bold text-olive-950 dark:text-white">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="mt-1 text-base/7 text-olive-700 dark:text-olive-400">
                  {book.subtitle}
                </p>
              )}
              <p className="mt-2 text-sm/6 text-olive-500">{book.author}</p>
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm/7 font-medium text-olive-700 dark:text-olive-400">
                <a href={pdfUrl(book)} className={link}>
                  Read the PDF
                </a>
                <a href={sourceUrl(book)} className={link}>
                  Source
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
