import type { Metadata } from 'next'

// Every model on the site, in the order the Models page lists them. This
// is the one place a model is registered: the Models page, the sitemap
// and each model's own page metadata (title, description, link preview)
// are all built from it. A new model adds its row here.

export interface Model {
  // Its route, without the slash: /<slug>.
  slug: string
  name: string
  // One or two sentences, for the Models page and for search results and
  // link previews.
  description: string
}

export const MODELS: Model[] = [
  {
    slug: 'vault',
    name: 'The Vault',
    description:
      'The seven-sided Vault of the Adepti, the tomb of Christian Rosenkreuz. Walk inside it as the Golden Dawn built it, or as the Fama describes it.',
  },
  {
    slug: 'cube-of-space',
    name: 'Cube of Space',
    description:
      'The Cube of Space after Paul Foster Case: stand inside the cube of the Sepher Yetzirah, with the Hebrew letters and their Tarot keys on its six faces and twelve edges.',
  },
  {
    slug: 'tree-of-life',
    name: 'Tree of Life',
    description:
      'The Tree of Life after Paul Foster Case and BOTA’s painting of it: the ten Sephiroth as glowing spheres and the twenty-two paths as spiralling streams of coloured light, with their Tarot keys.',
  },
  {
    slug: 'tree-of-life-sphere',
    name: 'Tree of Life Sphere',
    description:
      'The Tree of Life projected onto the sky as a sphere, after the Golden Dawn: stand at the centre and look out at the four Trees, the zodiac and the stars.',
  },
]

export function model(slug: string): Model {
  const found = MODELS.find((m) => m.slug === slug)
  if (!found) throw new Error(`No model is registered as "${slug}"`)
  return found
}

// A model page's metadata, from its registry row. (The site's address is
// the root layout's metadataBase, so the link is relative.)
export function modelMetadata(slug: string): Metadata {
  const { name, description } = model(slug)
  return {
    title: name,
    description,
    openGraph: { title: name, description, url: `/${slug}` },
  }
}
