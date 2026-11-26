// The books repository's catalog, as far as this site lists the books: a
// committed snapshot (books-catalog.json, refreshed by `npm run
// sync:books`) of what each edition is, for its page.

import type { Book } from './books'
import snapshot from './books-catalog.json'

export interface CatalogEntry {
  label?: string
  heading?: string
}

export interface CatalogPart {
  title?: string
  entries: CatalogEntry[]
}

export interface CatalogBook {
  work: string
  edition: string
  pdfs: { print: string; screen: string }
  title: string
  subtitle?: string
  author: string
  translator?: string
  editor?: string
  imprint: string
  /** Which printing or typing the text is set from. */
  editionNote?: string
  language: string
  publisher: string
  published: number
  publicDomain: boolean
  parts: CatalogPart[]
}

const CATALOG = (snapshot as { books: CatalogBook[] }).books

/** A listed book's catalog entry; sync:books guarantees there is one. */
export function catalogFor(book: Book): CatalogBook {
  const entry = CATALOG.find((b) => b.pdfs.print === `${book.file}.pdf`)
  if (!entry) {
    throw new Error(
      `${book.file}: not in books-catalog.json (npm run sync:books)`,
    )
  }
  return entry
}
