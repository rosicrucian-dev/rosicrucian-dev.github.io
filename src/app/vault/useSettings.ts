import {
  bool,
  oneOf,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { DESIGNS, type VaultDesignId } from '@/lib/vault'

// What the Vault page remembers between visits. What is in the room is
// not among it: a Vault with its furniture taken out and its diagrams
// moved about is a Vault mid-thought, not a setting, so a visit starts
// with the room as it stands and the page is reloaded to put it right.
export interface Settings {
  design: VaultDesignId
  // Whether the walls carry their English.
  english: boolean
  // Whether the hint on how to get about is shown over the view; once
  // dismissed it lives under Help in the controls.
  hint: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  design: 'regardie',
  english: true,
  hint: true,
}

const SPEC: SettingsSpec<Settings> = {
  key: 'vault:settings',
  defaults: DEFAULT_SETTINGS,
  parse(stored, defaults) {
    const s = stored as Partial<Record<keyof Settings, unknown>>
    return {
      design: oneOf(
        s.design,
        DESIGNS.map((d) => d.id),
        defaults.design,
      ),
      english: bool(s.english, defaults.english),
      hint: bool(s.hint, defaults.hint),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
