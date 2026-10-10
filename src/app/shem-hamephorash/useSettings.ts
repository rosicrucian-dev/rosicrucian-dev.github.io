import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'

// What the Shem HaMephorash page remembers between visits: how it looks.
// Not the Name the star is set on, which is in the page's address (see
// useName).
export interface Settings {
  // What turns: the star inside a still wheel (as the technique describes
  // it, and so by default), or the wheel under an upright star, its five
  // points keeping their places on the screen while the Names move.
  turn: 'star' | 'wheel'
  // The ring of the Zodiac inside the Names, and with it the seven planets
  // where they are today, each on the Name it is in.
  zodiac: boolean
  // Which zodiac the planets are reckoned in: sidereal, counted from
  // Regulus as 0° Leo (the Golden Dawn's, and the Tree of Life Sphere's),
  // or tropical, counted from the spring equinox. About 30° (six Names)
  // apart now.
  reckoning: 'sidereal' | 'tropical'
}

export const DEFAULT_SETTINGS: Settings = {
  turn: 'star',
  zodiac: true,
  reckoning: 'sidereal',
}

const SPEC: SettingsSpec<Settings> = {
  key: 'shem-hamephorash:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      turn: oneOf(s.turn, ['star', 'wheel'], defaults.turn),
      zodiac: bool(s.zodiac, defaults.zodiac),
      reckoning: oneOf(
        s.reckoning,
        ['sidereal', 'tropical'],
        defaults.reckoning,
      ),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
