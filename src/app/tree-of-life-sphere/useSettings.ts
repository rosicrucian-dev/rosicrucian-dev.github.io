import type {
  Appearance,
  Layers,
  View,
} from '@/components/tree-of-life-sphere/types'
import {
  oneOf,
  parseSwitches,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { VESSEL_BY_ID } from '@/lib/vessels'

// What the page remembers between visits: the choices in its header and
// Controls panel. ("My sky" is not among them: it needs the visitor's
// permission, which has to be asked for with a fresh tap each time.)
export interface Settings {
  view: View
  layers: Layers
  // The id of the chosen vessel, or '' for none.
  vessel: string
  appearance: Appearance
}

export const DEFAULT_SETTINGS: Settings = {
  view: 'outside',
  layers: {
    tree: true,
    ecliptic: true,
    stars: false,
    constellations: true,
    constellationLabels: false,
    art: true,
    labels: true,
    planets: true,
  },
  vessel: '',
  appearance: { opaquePaths: true, opaqueSpheres: true },
}

const SPEC: SettingsSpec<Settings> = {
  key: 'tree-of-life-sphere:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      view: oneOf(s.view, ['inside', 'outside'], defaults.view),
      layers: parseSwitches(s.layers, defaults.layers),
      vessel:
        typeof s.vessel === 'string' && VESSEL_BY_ID.has(s.vessel)
          ? s.vessel
          : '',
      appearance: parseSwitches(s.appearance, defaults.appearance),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
