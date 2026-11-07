// The books Rosicrucian Developers publishes: public-domain texts of the
// Western esoteric tradition, each set from a named edition and read
// against its print, kept as Markdown in the books repository
// (github.com/rosicrucian-dev/books; its README is the format) and set as
// PDFs by its release workflow. The PDFs listed here are published to
// Cloudflare R2 on every push there; a book is listed once its text is
// proofread, so this list is shorter than the repository.

export const BOOKS_REPO = 'https://github.com/rosicrucian-dev/books'

export interface Book {
  /** The PDF's name in the release: the work, and the edition where the
   *  work has more than one (the repository's rule). */
  file: string
  /** Its folder in the repository, books/<work>/<edition>. */
  folder: string
  title: string
  subtitle?: string
  author: string
}

export const BOOKS: Book[] = [
  {
    file: 'chaldean-oracles-1895-westcott',
    folder: 'chaldean-oracles/1895-westcott',
    title: 'The Chaldæan Oracles of Zoroaster',
    author: 'Edited by W. Wynn Westcott',
  },
  {
    file: 'cloud-upon-the-sanctuary-1909-de-steiger',
    folder: 'cloud-upon-the-sanctuary/1909-de-steiger',
    title: 'The Cloud upon the Sanctuary',
    author: 'Karl von Eckartshausen',
  },
  {
    file: 'confessio-fraternitatis-1887-vaughan-waite',
    folder: 'confessio-fraternitatis/1887-vaughan-waite',
    title: 'Confessio Fraternitatis',
    author: 'Rosicrucian Manifestos',
  },
  {
    file: 'fama-fraternitatis-1887-vaughan-waite',
    folder: 'fama-fraternitatis/1887-vaughan-waite',
    title: 'Fama Fraternitatis',
    subtitle:
      'or, a Discovery of the Fraternity of the most Laudable Order of the Rosy Cross',
    author: 'Rosicrucian Manifestos',
  },
  {
    file: 'kybalion-1908',
    folder: 'kybalion/1908',
    title: 'The Kybalion',
    subtitle: 'A Study of the Hermetic Philosophy of Ancient Egypt and Greece',
    author: 'Three Initiates',
  },
  {
    file: 'oracle-of-tarot',
    folder: 'oracle-of-tarot/typescript',
    title: 'The Oracle of Tarot',
    author: 'Paul Foster Case',
  },
  {
    file: 'school-of-ageless-wisdom',
    folder: 'school-of-ageless-wisdom/typescript',
    title: 'The School of Ageless Wisdom',
    author: 'Paul Foster Case',
  },
]

export const pdfUrl = (book: Book) =>
  `https://pdf.rosicrucian.dev/${book.file}.pdf`
export const sourceUrl = (book: Book) =>
  `${BOOKS_REPO}/tree/main/books/${book.folder}`
