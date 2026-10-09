import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { NAME_COUNT } from '@/lib/shemHaMephorash'

// What the Shem HaMephorash page remembers between visits.
export interface Settings {
  // The Essential Name the star is set on, 1 to 72.
  name: number
  // What turns: the wheel under an upright star, or the star inside a
  // still wheel (as the technique describes it). The wheel by default: it
  // is what a hand on the page takes hold of, and with the star still, its
  // five points keep their places on the screen while the Names move.
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

// Name 5, Healing: the instructions' own example.
export const DEFAULT_SETTINGS: Settings = {
  name: 5,
  turn: 'wheel',
  angels: false,
  gematria: true,
  colours: true,
  zodiac: true,
}

function nameNumber(value: unknown, fallback: number): number {
  return Number.isInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= NAME_COUNT
    ? (value as number)
    : fallback
}

const SPEC: SettingsSpec<Settings> = {
  key: 'shem-hamephorash:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      name: nameNumber(s.name, defaults.name),
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
