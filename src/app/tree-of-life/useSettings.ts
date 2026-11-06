import type { Figure, View } from '@/components/tree-of-life/types'
import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { CARD_STYLES, type CardStyle } from '@/lib/tarot'
import { SEPHIROTH } from '@/lib/tree'
import type { SephirahId } from '@/lib/tree'

// What the walkable Tree remembers between visits.
export interface Settings {
  view: View
  // The room last stood in.
  room: SephirahId
  // Light streaming along the tunnels.
  flow: boolean
  // Whether the hint on how to get about is shown over the view.
  hint: boolean
  // The Tarot keys laid on the paths, seen from outside, and their deck.
  cards: boolean
  cardStyle: CardStyle
  // The Star/Moon switch.
  starMoon: boolean
  // The Tree laid on a human figure, and which figure.
  body: boolean
  figure: Figure
}

export const DEFAULT_SETTINGS: Settings = {
  view: 'inside',
  room: 'malkuth',
  flow: true,
  hint: true,
  cards: true,
  cardStyle: 'modern',
  starMoon: false,
  body: false,
  figure: 'female',
}

const SPEC: SettingsSpec<Settings> = {
  key: 'tree-of-life:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      view: oneOf(s.view, ['inside', 'overview'], defaults.view),
      room: oneOf(
        s.room,
        SEPHIROTH.map((sephirah) => sephirah.id),
        defaults.room,
      ),
      flow: bool(s.flow, defaults.flow),
      hint: bool(s.hint, defaults.hint),
      cards: bool(s.cards, defaults.cards),
      cardStyle: oneOf(
        s.cardStyle,
        CARD_STYLES.map((c) => c.id),
        defaults.cardStyle,
      ),
      starMoon: bool(s.starMoon, defaults.starMoon),
      body: bool(s.body, defaults.body),
      figure: oneOf(s.figure, ['female', 'male'], defaults.figure),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
