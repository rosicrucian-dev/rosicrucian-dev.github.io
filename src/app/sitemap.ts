import { type MetadataRoute } from 'next'

import { MODELS } from '@/lib/models'
import { SITE_URL } from '@/lib/site'

// Required by `output: 'export'` for metadata routes — emits a static
// /sitemap.xml file at build time instead of treating it as dynamic.
export const dynamic = 'force-static'

// Every page on the site: the pages below, and every registered model
// (lib/models.ts). A new page that isn't a model adds a row here.
const routes = [
  '/',
  '/jonathan',
  '/models',
  '/shem-hamephorash',
  ...MODELS.map((m) => `/${m.slug}`),
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }))
}
