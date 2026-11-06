import { oneOf, useStoredSettings, type SettingsSpec } from './settings'
import { DEFAULT_PALETTE, PALETTES, type PaletteId } from './palettes'

// The colour palette the visitor has chosen (see palettes.ts), remembered
// for the whole site rather than one page: chosen on one model, it holds on
// every other that offers the choice.
interface SitePalette {
  palette: PaletteId
}

const SPEC: SettingsSpec<SitePalette> = {
  key: 'site:colors',
  defaults: { palette: DEFAULT_PALETTE },
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof SitePalette, unknown>>
    return {
      palette: oneOf(
        s.palette,
        PALETTES.map((p) => p.id),
        defaults.palette,
      ),
    }
  },
}

// The choice is not offered for now: every page draws in the default
// (Tailwind), and a palette chosen on an earlier visit is kept but not
// used. Set to true, with the choice put back in a page's controls, and it
// holds again, site-wide.
export const PALETTE_OFFERED: boolean = false

export function useSitePalette(): [PaletteId, (palette: PaletteId) => void] {
  const [{ palette }, update] = useStoredSettings(SPEC)
  return [
    PALETTE_OFFERED ? palette : DEFAULT_PALETTE,
    (next) => update({ palette: next }),
  ]
}
