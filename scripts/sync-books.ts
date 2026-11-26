// Refreshes src/lib/books-catalog.json, the snapshot of the books
// repository's catalog (its print/catalog.ts: what every edition is, its
// people, imprint and contents) that the book pages are built from.
//
// The catalog is published with the PDFs on every push to the books
// repository; this copies the entries for the books the site lists
// (src/lib/books.ts) and drops the rest, so the snapshot is exactly what
// the pages use. Committed, so a build never depends on the network.
//
//   npm run sync:books                       from pdf.rosicrucian.dev
//   npm run sync:books -- ../books/dist/catalog.json   from a local build

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { BOOKS } from '../src/lib/books.ts'

const SOURCE = 'https://pdf.rosicrucian.dev/catalog.json'
const OUT = join('src', 'lib', 'books-catalog.json')

interface CatalogBook {
  pdfs: { print: string }
  [key: string]: unknown
}

const from = process.argv[2]
const catalog = (
  from
    ? JSON.parse(readFileSync(from, 'utf8'))
    : await (await fetch(SOURCE)).json()
) as { books: CatalogBook[] }

const books = BOOKS.map((book) => {
  const entry = catalog.books.find((b) => b.pdfs.print === `${book.file}.pdf`)
  if (!entry) throw new Error(`the catalog has no ${book.file}.pdf`)
  return entry
})

writeFileSync(OUT, `${JSON.stringify({ books }, null, 2)}\n`)
console.log(`${books.length} books from ${from ?? SOURCE} -> ${OUT}`)
