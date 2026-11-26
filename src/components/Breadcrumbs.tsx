import Link from 'next/link'

import { SITE_URL } from '@/lib/site'

// The trail above a page's title: the pages above this one, from the
// site's home down, each a link. The current page is not repeated in the
// trail, since the title beneath names it; it ends the structured data
// (schema.org BreadcrumbList), which search engines may show in a result
// in place of the bare address ("rosicrucian.dev › Books › The Kybalion").
//
// Every text page carries one, so the way home is in the same place on
// each. The full-screen models (lib/models.ts) have no page chrome and no
// trail.

export interface Crumb {
  name: string
  /** The page's path, with the trailing slash the export serves. */
  href: string
}

/** The site's home, the first crumb of every trail. */
export const HOME: Crumb = { name: 'Rosicrucian Developers', href: '/' }

const link =
  'underline decoration-olive-300 decoration-1 underline-offset-4 transition-colors hover:text-olive-700 hover:decoration-olive-700 dark:decoration-olive-700 dark:hover:text-olive-300 dark:hover:decoration-olive-300'

export function Breadcrumbs({
  trail,
  current,
}: {
  /** The pages above this one, home first. */
  trail: Crumb[]
  /** This page, for the structured data only. */
  current: Crumb
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [...trail, current].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.href}`,
    })),
  }
  return (
    <nav aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, '\\u003c'),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-2 text-sm/6 font-medium tracking-widest text-olive-500 uppercase">
        {trail.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-x-2">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="text-olive-400 dark:text-olive-600"
              >
                /
              </span>
            )}
            <Link href={crumb.href} className={link}>
              {crumb.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
