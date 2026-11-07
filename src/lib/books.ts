// The books Rosicrucian Developers publishes: public-domain texts of the
// Western esoteric tradition, each set from a named edition and read
// against its print, kept as Markdown in the books repository
// (github.com/rosicrucian-dev/books; its README is the format) and set as
// PDFs by its release workflow. The PDFs listed here are its rolling
// `latest` release, refreshed on every push there; a book is listed once
// its text is proofread, so this list is shorter than the repository. The
// Pages deployment copies these listed PDFs from the release to /books/.

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
    file: 'school-of-ageless-wisdom',
    folder: 'school-of-ageless-wisdom/typescript',
    title: 'The School of Ageless Wisdom',
    subtitle: 'The early curriculum of Paul Foster Case',
    author: 'Paul Foster Case',
  },
]

export const pdfUrl = (book: Book) => `/books/${book.file}.pdf`
export const sourceUrl = (book: Book) =>
  `${BOOKS_REPO}/tree/main/books/${book.folder}`
