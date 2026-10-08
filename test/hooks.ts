// Module-resolution hook for `npm test` (see loader.ts). Two jobs:
//   1. Map the tsconfig alias `@/` → src/.
//   2. Resolve extensionless relative/aliased imports to `.ts` (or
//      `/index.ts`), which the app's bundler does and Node's ESM loader
//      does not.
// Anything else falls straight through to Node's own resolver.
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT = new URL('../', import.meta.url)

interface ResolveContext {
  parentURL?: string
}
interface Resolved {
  url: string
  format?: string | null
  shortCircuit?: boolean
}
type NextResolve = (
  specifier: string,
  context: ResolveContext,
) => Promise<Resolved>

export async function resolve(
  specifier: string,
  context: ResolveContext,
  nextResolve: NextResolve,
): Promise<Resolved> {
  let spec = specifier
  if (spec.startsWith('@/')) spec = new URL('src/' + spec.slice(2), ROOT).href

  const isPathLike =
    spec.startsWith('file:') || spec.startsWith('./') || spec.startsWith('../')
  if (isPathLike && !/\.[a-z]+$/i.test(spec)) {
    const base = spec.startsWith('file:')
      ? spec
      : new URL(spec, context.parentURL).href
    for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
      if (existsSync(fileURLToPath(candidate))) {
        spec = candidate
        break
      }
    }
  }

  return nextResolve(spec, context)
}
