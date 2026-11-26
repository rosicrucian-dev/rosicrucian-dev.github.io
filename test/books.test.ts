// The Books list and the catalog snapshot its pages are built from
// (src/lib/books-catalog.json, refreshed by `npm run sync:books`) agree.
//
//   npm test

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { BOOKS, bookSlug, screenPdfUrl } from '../src/lib/books.ts'

const catalog = JSON.parse(
  readFileSync(
    new URL('../src/lib/books-catalog.json', import.meta.url),
    'utf8',
  ),
) as { books: { pdfs: { print: string; screen: string } }[] }

test('every listed book is in the catalog snapshot, with both PDFs', () => {
  for (const book of BOOKS) {
    const entry = catalog.books.find((b) => b.pdfs.print === `${book.file}.pdf`)
    assert.ok(entry, `${book.file}: run npm run sync:books`)
    assert.equal(
      `https://pdf.rosicrucian.dev/${entry.pdfs.screen}`,
      screenPdfUrl(book),
      book.file,
    )
  }
})

test('every book has its own page address', () => {
  const slugs = BOOKS.map(bookSlug)
  assert.equal(new Set(slugs).size, slugs.length)
})
