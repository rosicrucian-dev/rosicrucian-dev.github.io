// Rosicrucian Icons for the gallery (/icons): the SVG files from the
// `rosicrucian-icons` package (installed from its repository until it's on
// npm), each with its tags from icons-meta.json, the site's own, as
// heroicons.com keeps its tags beside the Heroicons package. Read at build
// time (the site is a static export), on the server alone.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { type Icon, type IconMeta } from './icon-types'
import meta from './icons-meta.json'

export type { Category, Icon, IconMeta } from './icon-types'
export { CATEGORIES } from './icon-types'

const META = meta as Record<string, IconMeta>

/** "north-node" → "NorthNodeIcon". */
const componentName = (name: string) =>
  name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase()) + 'Icon'

/** Every icon in the package's 24/outline style, in the tags file's order
 * (the order of the set); one without tags is listed last, untagged. */
export function readIcons(): Icon[] {
  // By path from the project (the build runs there): the bundler rewrites
  // `require.resolve` and `import.meta.url` in a server component.
  const dir = join(process.cwd(), 'node_modules/rosicrucian-icons/24/outline')
  const files = readdirSync(dir).filter((f) => f.endsWith('.svg'))
  const names = [
    ...Object.keys(META).filter((n) => files.includes(`${n}.svg`)),
    ...files.map((f) => f.replace(/\.svg$/, '')).filter((n) => !(n in META)),
  ]
  return names.map((name) => {
    const svg = readFileSync(join(dir, `${name}.svg`), 'utf8').trim()
    const path = / d="([^"]+)"/.exec(svg)?.[1] ?? ''
    const m = META[name] ?? {
      category: 'planets',
      keywords: [],
      source: 'original',
    }
    return { name, ...m, component: componentName(name), svg, path }
  })
}
