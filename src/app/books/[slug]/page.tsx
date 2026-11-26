import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs, HOME } from '@/components/Breadcrumbs'
import { catalogFor, type CatalogEntry } from '@/lib/books-catalog'
import {
  BOOKS,
  bookPath,
  bookSlug,
  pdfUrl,
  screenPdfUrl,
  sourceUrl,
  type Book,
} from '@/lib/books'
import { SITE_URL } from '@/lib/site'

// A page for each book: what a search for it should find. The title and
// people from the list (lib/books.ts), the edition and contents from the
// books repository's catalog (lib/books-catalog.ts), both PDFs, and the
// book described as structured data.

export const dynamicParams = false

export function generateStaticParams() {
  return BOOKS.map((book) => ({ slug: bookSlug(book) }))
}

function bookOf(slug: string): Book {
  const book = BOOKS.find((b) => bookSlug(b) === slug)
  if (!book) notFound()
  return book
}

function describe(book: Book): string {
  const { editionNote } = catalogFor(book)
  return [
    `${book.title}${book.subtitle ? `, ${book.subtitle}` : ''}.`,
    `${book.author}${editionNote ? `; ${editionNote}` : ''}.`,
    'Free PDFs, sized for reading on screens and for printing.',
  ].join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const book = bookOf((await params).slug)
  const title = `${book.title} (PDF)`
  const description = describe(book)
  return {
    title,
    description,
    alternates: { canonical: bookPath(book) },
    openGraph: { title, description, url: bookPath(book), type: 'book' },
  }
}

const link =
  'underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-950 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-white dark:hover:decoration-olive-300'

/** An entry as the contents list sets it: its label and its heading, or
 *  whichever it has. */
function entryText({ label, heading }: CatalogEntry): string {
  if (label && heading && label !== heading) return `${label}: ${heading}`
  return heading ?? label ?? ''
}

/** schema.org's Book: what the page is about, for search engines. */
function structuredData(book: Book) {
  const entry = catalogFor(book)
  const url = `${SITE_URL}${bookPath(book)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    ...(book.subtitle && { alternativeHeadline: book.subtitle }),
    ...(!book.collection && {
      author: { '@type': 'Person', name: book.author },
    }),
    ...(entry.editionNote && { bookEdition: entry.editionNote }),
    inLanguage: entry.language === 'English' ? 'en' : entry.language,
    isAccessibleForFree: true,
    ...(entry.publicDomain && {
      license: 'https://creativecommons.org/publicdomain/mark/1.0/',
    }),
    publisher: {
      '@type': 'Organization',
      name: entry.publisher,
      url: SITE_URL,
    },
    url,
    ...(book.site && { sameAs: book.site.url }),
    encoding: [
      { url: screenPdfUrl(book), name: 'PDF for screens' },
      { url: pdfUrl(book), name: 'PDF for printing' },
    ].map(({ url: contentUrl, name }) => ({
      '@type': 'MediaObject',
      name,
      contentUrl,
      encodingFormat: 'application/pdf',
    })),
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const book = bookOf((await params).slug)
  const entry = catalogFor(book)
  const details = [
    ['Edition', entry.editionNote],
    ['Translated by', entry.translator],
    ['Edited by', entry.editor],
    ['Imprint', entry.imprint],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(book)).replace(/</g, '\\u003c'),
        }}
      />

      <Breadcrumbs
        trail={[HOME, { name: 'Books', href: '/books/' }]}
        current={{ name: book.title, href: bookPath(book) }}
      />

      <h1 className="mt-6 font-display text-5xl/tight tracking-tight text-balance text-olive-950 sm:text-6xl/tight dark:text-white">
        {book.title}
      </h1>
      {book.subtitle && (
        <p className="mt-2 text-lg/8 text-olive-700 italic dark:text-olive-400">
          {book.subtitle}
        </p>
      )}
      <p className="text-lg/8 text-olive-700 dark:text-olive-400">
        {book.author}
      </p>

      <p className="mt-8 text-base/8 font-medium text-olive-700 dark:text-olive-400">
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
      {book.site && (
        <p className="text-base/8 text-olive-700 dark:text-olive-400">
          Also on the web at{' '}
          <a href={book.site.url} className={link}>
            {book.site.name}
          </a>
          .
        </p>
      )}

      {details.length > 0 && (
        <dl className="mt-12 grid grid-cols-1 gap-x-6 gap-y-3 text-base/7 sm:grid-cols-[auto_1fr]">
          {details.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-olive-500">{term}</dt>
              <dd className="text-olive-700 dark:text-olive-400">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {entry.parts.flatMap((part) => part.entries).length > 1 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl/8 font-medium text-olive-950 dark:text-white">
            Contents
          </h2>
          <div className="mt-6 space-y-8">
            {entry.parts.map((part, i) => (
              <div key={part.title ?? i}>
                {part.title && (
                  <h3 className="text-sm/7 font-medium tracking-widest text-olive-500 uppercase">
                    {part.title}
                  </h3>
                )}
                <ol className="text-base/8 text-olive-700 dark:text-olive-400">
                  {part.entries.map((e, j) => {
                    const text = entryText(e)
                    return text ? <li key={j}>{text}</li> : null
                  })}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
