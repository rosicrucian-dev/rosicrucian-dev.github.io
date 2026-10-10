import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'

// What the Shem HaMephorash page remembers between visits: how it looks.
// Not the Name the star is set on, which a link may give (see useName),
// nor how far the star and the wheel have been turned.
export interface Settings {
  // The ring of the Zodiac inside the Names, and with it the seven planets
  // where they are today, each on the Name it is in.
  zodiac: boolean
  // Which zodiac the planets are reckoned in: sidereal, counted from
  // Regulus as 0° Leo (the Golden Dawn's, and the Tree of Life Sphere's),
  // or tropical, counted from the spring equinox. About 30° (six Names)
  // apart now.
  reckoning: 'sidereal' | 'tropical'
  // Lines between the planets for their aspects: off unless asked for.
  aspects: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  zodiac: true,
  reckoning: 'sidereal',
  aspects: false,
}

const SPEC: SettingsSpec<Settings> = {
  key: 'shem-hamephorash:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      zodiac: bool(s.zodiac, defaults.zodiac),
      reckoning: oneOf(
        s.reckoning,
        ['sidereal', 'tropical'],
        defaults.reckoning,
      ),
      aspects: bool(s.aspects, defaults.aspects),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
