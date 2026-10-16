import { useCallback, useMemo, useSyncExternalStore } from 'react'

// Settings a page remembers between visits, kept in the browser's storage
// under the page's own key, so that each 3D model keeps its own. A page
// supplies the key, its defaults, and a `parse` that turns whatever was
// stored into valid settings, so that anything missing or no longer
// valid (a switch added since, an option since removed) falls back to its
// default one field at a time.
export interface SettingsSpec<T> {
  key: string
  defaults: T
  parse: (stored: unknown, defaults: T) => T
}

// A change to make: the fields to replace, or a function that works them
// out from the settings as they are at that moment. Use the function when
// the new value depends on the old one (flipping one switch among
// several), so that two changes made in quick succession can't overwrite
// each other.
export type Change<T> = Partial<T> | ((current: T) => Partial<T>)

interface Store {
  // What was last saved, kept here as well as in the browser's storage:
  // some browsers refuse storage outright (private windows, blocked site
  // data), and the switches still have to work for the rest of the visit.
  saved: string | null | undefined
  listeners: Set<() => void>
}

const stores = new Map<string, Store>()

function storeFor(key: string): Store {
  let store = stores.get(key)
  if (!store) {
    store = { saved: undefined, listeners: new Set() }
    stores.set(key, store)
  }
  return store
}

function read(key: string): string | null {
  const store = storeFor(key)
  if (store.saved === undefined) {
    try {
      store.saved = window.localStorage.getItem(key)
    } catch {
      store.saved = null
    }
  }
  return store.saved
}

function write(key: string, value: unknown) {
  const store = storeFor(key)
  store.saved = JSON.stringify(value)
  try {
    window.localStorage.setItem(key, store.saved)
  } catch {
    // Remembered for this visit only.
  }
  store.listeners.forEach((notify) => notify())
}

// A stored value if it is a boolean, otherwise the default.
export function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

// A stored value if it is one of `options`, otherwise the default.
export function oneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback
}

// Reads a page's boolean switches from what was stored, keeping each
// default where the stored value is missing or not a boolean. For the
// common shape of a group of on/off settings.
export function parseSwitches<S extends object>(
  stored: unknown,
  defaults: S,
): S {
  const result = { ...defaults }
  const source =
    stored && typeof stored === 'object'
      ? (stored as Record<string, unknown>)
      : {}
  for (const key of Object.keys(result) as (keyof S)[]) {
    const value = source[key as string]
    if (typeof value === 'boolean' && typeof result[key] === 'boolean') {
      result[key] = value as S[keyof S]
    }
  }
  return result
}

// Reads a page's stored settings as a plain object, or null if there is
// nothing usable there.
function stored(raw: string | null): unknown {
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    // Not ours, or damaged: start from the defaults.
    return null
  }
}

// A page's settings, remembered by the browser. Until the page has loaded
// in the browser this gives the defaults, so that what the server rendered
// and what the browser first renders agree.
export function useStoredSettings<T extends object>(
  spec: SettingsSpec<T>,
): [T, (change: Change<T>) => void] {
  const { key, defaults, parse } = spec
  const subscribe = useCallback(
    (notify: () => void) => {
      const store = storeFor(key)
      store.listeners.add(notify)
      return () => {
        store.listeners.delete(notify)
      }
    },
    [key],
  )
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  )
  const settings = useMemo(() => {
    const value = stored(raw)
    return value && typeof value === 'object'
      ? parse(value, defaults)
      : defaults
  }, [raw, parse, defaults])
  const update = useCallback(
    (change: Change<T>) => {
      const value = stored(read(key))
      const current =
        value && typeof value === 'object' ? parse(value, defaults) : defaults
      write(key, {
        ...current,
        ...(typeof change === 'function' ? change(current) : change),
      })
    },
    [key, parse, defaults],
  )
  return [settings, update]
}
