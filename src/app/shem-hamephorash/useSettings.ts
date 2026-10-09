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
  // The angels' names beside the Names in the formula.
  angels: boolean
  // Each Name's number, under it in the formula.
  gematria: boolean
  // The letters in their Golden Dawn colours, rather than plain.
  colours: boolean
  // The ring of the Zodiac inside the Names.
  zodiac: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  turn: 'star',
  angels: false,
  gematria: true,
  colours: true,
  zodiac: true,
}

const SPEC: SettingsSpec<Settings> = {
  key: 'shem-hamephorash:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      turn: oneOf(s.turn, ['star', 'wheel'], defaults.turn),
      angels: bool(s.angels, defaults.angels),
      gematria: bool(s.gematria, defaults.gematria),
      colours: bool(s.colours, defaults.colours),
      zodiac: bool(s.zodiac, defaults.zodiac),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
