import { useCallback, useState, useSyncExternalStore } from 'react'

import { nameFromSearch } from '@/lib/shemHaMephorash'

// The Name the star is set on when the page opens with no other: 5,
// Healing, the instructions' own example.
export const DEFAULT_NAME = 5

// The Name the star is set on. A link can ask for one, as `?name=33`, and
// the page opens on it; the bare address opens on the default. After
// that the Name is the page's own: it is not written back to the
// address, since browsers keep every address a page moves to in their
// history, and a spin would fill it. Nor is it remembered with the
// settings, which are how the page looks, not what it shows.
export function useName(): [
  number,
  (name: number | ((current: number) => number)) => void,
] {
  // The address, read through useSyncExternalStore so that the page first
  // renders as the server did (with no address, so the default), then at
  // once with the Name the address asks for.
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )
  const linked = nameFromSearch(search) ?? DEFAULT_NAME

  // A Name chosen on the page, which from then on is the one shown.
  const [chosen, setChosen] = useState<number | null>(null)

  const setName = useCallback(
    (next: number | ((current: number) => number)) =>
      setChosen((current) => {
        const from =
          current ?? nameFromSearch(window.location.search) ?? DEFAULT_NAME
        return typeof next === 'function' ? next(from) : next
      }),
    [],
  )

  return [chosen ?? linked, setName]
}

// The address only changes under the page by going back or forward.
function subscribe(notify: () => void) {
  window.addEventListener('popstate', notify)
  return () => window.removeEventListener('popstate', notify)
}
