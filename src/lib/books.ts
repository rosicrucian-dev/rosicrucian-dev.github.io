// The books Rosicrucian Developers publishes: public-domain texts of the
// Western esoteric tradition, each set from a named edition and read
// against its print, kept as Markdown in the books repository
// (github.com/rosicrucian-dev/books; its README is the format) and set as
// PDFs by its release workflow, each in two editions: one for screens
// (a 6 × 8.5in page with narrow margins) and one for printing (US Letter).
// The PDFs listed here are published to Cloudflare R2 on every push there; a book is listed once its text is
// proofread, so this list is shorter than the repository.

export const BOOKS_REPO = 'https://github.com/rosicrucian-dev/books'

export interface Book {
  /** The PDF's name in the release: the work, and the edition where the
   *  work has more than one (the repository's rule). The screen edition is
   *  the same name with -screen. */
  file: string
  /** Its folder in the repository, books/<work>/<edition>. */
  folder: string
  title: string
  subtitle?: string
  author: string
  /** A collection with no single author (the line above names it, or its
   *  editor): its page's structured data then names no author. */
  collection?: true
  /** Where the text can also be read as a website. */
  site?: { name: string; url: string }
}

export const BOOKS: Book[] = [
  {
    file: 'chaldean-oracles-1895-westcott',
    folder: 'chaldean-oracles/1895-westcott',
    title: 'The Chaldæan Oracles of Zoroaster',
    author: 'Edited by W. Wynn Westcott',
    collection: true,
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
    collection: true,
  },
  {
    file: 'fama-fraternitatis-1887-vaughan-waite',
    folder: 'fama-fraternitatis/1887-vaughan-waite',
    title: 'Fama Fraternitatis',
    subtitle:
      'or, a Discovery of the Fraternity of the most Laudable Order of the Rosy Cross',
    author: 'Rosicrucian Manifestos',
    collection: true,
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
    site: { name: 'agelesswisdom.school', url: 'https://agelesswisdom.school' },
  },
]

/** The book's page on this site, /books/<work>/: the work's name in the
 *  repository, which the PDF's name and the source's folder begin with. */
export const bookSlug = (book: Book) => book.folder.split('/')[0]
export const bookPath = (book: Book) => `/books/${bookSlug(book)}/`

/** The edition for printing, on US Letter. */
export const pdfUrl = (book: Book) =>
  `https://pdf.rosicrucian.dev/${book.file}.pdf`
/** The edition for screens, for reading on a tablet or computer. */
export const screenPdfUrl = (book: Book) =>
  `https://pdf.rosicrucian.dev/${book.file}-screen.pdf`
export const sourceUrl = (book: Book) =>
  `${BOOKS_REPO}/tree/main/books/${book.folder}`
