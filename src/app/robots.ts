import { type MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

// Required by `output: 'export'` for metadata routes — emits a static
// /robots.txt file at build time instead of treating it as dynamic.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
