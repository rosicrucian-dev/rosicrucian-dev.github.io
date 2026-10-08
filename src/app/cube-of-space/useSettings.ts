import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { CARD_STYLES, type CardStyle } from '@/lib/cubeOfSpace'

// What the Cube of Space page remembers between visits.
export interface Settings {
  // From the centre of the cube, or from outside it.
  view: 'inside' | 'outside'
  cardStyle: CardStyle
  // The Star/Moon switch.
  starMoon: boolean
  // Dots running along each edge in the direction of its current.
  flow: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  view: 'outside',
  cardStyle: 'modern',
  starMoon: false,
  flow: false,
}

const SPEC: SettingsSpec<Settings> = {
  key: 'cube-of-space:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      view: oneOf(s.view, ['inside', 'outside'], defaults.view),
      cardStyle: oneOf(
        s.cardStyle,
        CARD_STYLES.map((c) => c.id),
        defaults.cardStyle,
      ),
      starMoon: bool(s.starMoon, defaults.starMoon),
      flow: bool(s.flow, defaults.flow),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
