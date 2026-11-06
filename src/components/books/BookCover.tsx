import type { Book } from '@/lib/books'

// A book's cover, drawn rather than rendered: the title page of the PDF
// shrunk to a thumbnail is a white page with text too small to read, so
// the cover sets the title and author itself, in the site's display face,
// on a page of the PDF's proportions (US Letter). Decorative: the list
// beside it carries the same words, so the cover is hidden from readers
// of the page by assistive technology; the link around it (page.tsx)
// names the PDF for them.
export function BookCover({ book }: { book: Book }) {
  return (
    <div
      aria-hidden="true"
      className="flex aspect-[17/22] w-36 shrink-0 flex-col items-center justify-center rounded-sm border border-olive-300 bg-olive-50 px-4 text-center shadow-sm dark:border-olive-700 dark:bg-olive-900"
    >
      <p className="font-display text-lg/5 text-balance text-olive-950 dark:text-white">
        {book.title}
      </p>
      <p className="mt-3 text-[0.55rem]/3 font-medium tracking-[0.2em] text-olive-500 uppercase">
        {book.author}
      </p>
    </div>
  )
}
