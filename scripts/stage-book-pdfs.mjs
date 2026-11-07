import { createWriteStream } from 'node:fs'
import { mkdir, open, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'

import { BOOKS, BOOKS_REPO } from '../src/lib/books.ts'

const outputDir = fileURLToPath(new URL('../out/books/', import.meta.url))
await mkdir(outputDir, { recursive: true })

for (const book of BOOKS) {
  const filename = `${book.file}.pdf`
  const response = await fetch(
    `${BOOKS_REPO}/releases/download/latest/${filename}`,
  )
  if (!response.ok || !response.body) {
    throw new Error(`Could not fetch ${filename}: HTTP ${response.status}`)
  }

  const destination = join(outputDir, filename)
  try {
    await pipeline(
      Readable.fromWeb(response.body),
      createWriteStream(destination),
    )

    const file = await open(destination)
    try {
      const signature = Buffer.alloc(5)
      await file.read(signature, 0, signature.length, 0)
      if (signature.toString() !== '%PDF-') {
        throw new Error(`${filename} is not a PDF`)
      }
    } finally {
      await file.close()
    }
  } catch (error) {
    await rm(destination, { force: true })
    throw error
  }

  console.log(`Staged ${filename}`)
}
