import type { Furniture } from '@/components/vault/VaultCanvas'
import {
  bool,
  oneOf,
  parseSwitches,
  useStoredSettings,
  type Change,
  type SettingsSpec,
} from '@/lib/settings'
import { DESIGNS, type VaultDesignId } from '@/lib/vault'

// What the Vault page remembers between visits.
export interface Settings {
  design: VaultDesignId
  // What is in the room.
  furniture: Furniture
  // Whether the hint on how to get about is shown over the view; once
  // dismissed it lives under Help in the controls.
  hint: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  design: 'golden-dawn',
  furniture: { altar: true, pastos: true, lid: true, plate: true },
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
      furniture: parseSwitches(s.furniture, defaults.furniture),
      hint: bool(s.hint, defaults.hint),
    }
  },
}

export function useSettings(): [Settings, (change: Change<Settings>) => void] {
  return useStoredSettings(SPEC)
}
