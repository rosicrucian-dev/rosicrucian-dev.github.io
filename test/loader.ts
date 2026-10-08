// Registers the resolver hook below for `npm test`, so tests can import
// application modules that use the tsconfig path alias (`@/…`) and
// extensionless imports — both of which the bundler resolves for the app
// but plain Node does not. Wired via `node --import ./test/loader.ts`.
import { register } from 'node:module'

register('./hooks.ts', import.meta.url)
