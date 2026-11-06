import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import { NAME_PARAM, nameFromSearch } from '@/lib/shemHaMephorash'

// The Name the star is set on when the page opens with no other: 55, on
// which it stands upright in the wheel as Moore draws it ("Pentagram
// within the Zodiac", Spirit at the top on the start of Name 55), so that
// the page opens as his diagram looks.
export const DEFAULT_NAME = 55

// Where the Name a link asked for is kept once it is taken out of the
// address: in the page's own entry in the browser's history, so that it
// holds through a reload, and through going back to the page, but a fresh
// visit to the bare address opens on the default.
const LINKED = 'shemName'

// The Name the page was linked to: in its address, or, taken out of
// that, in its history entry; or none.
function linkedName(): number | null {
  const kept: unknown = window.history.state?.[LINKED]
  return (
    nameFromSearch(window.location.search) ??
    (typeof kept === 'number' ? kept : null)
  )
}

// The Name the star is set on. A link can ask for one, as `?name=33`, and
// the page opens on it; the bare address opens on the default. After
// that the Name is the page's own: it is not written back to the
// address, since browsers keep every address a page moves to in their
// history, and a spin would fill it. And so that the address doesn't go
// on asking for a Name the page has turned from (and, copied, share the
// wrong one), the Name is taken out of it once the page has opened on
// it. Nor is it remembered with the settings, which are how the page
// looks, not what it shows.
export function useName(): [
  number,
  (name: number | ((current: number) => number)) => void,
] {
  // Read through useSyncExternalStore so that the page first renders as
  // the server did (with no address, so the default), then at once with
  // the Name the link asks for.
  const linked =
    useSyncExternalStore(subscribe, linkedName, () => null) ?? DEFAULT_NAME

  // The Name taken out of the address, and kept in the history entry
  // (replaced, not added to), the rest of the address as it was.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(NAME_PARAM)) return
    const asked = nameFromSearch(url.search)
    url.searchParams.delete(NAME_PARAM)
    window.history.replaceState(
      { ...window.history.state, [LINKED]: asked ?? undefined },
      '',
      url,
    )
  }, [])

  // A Name chosen on the page, which from then on is the one shown.
  const [chosen, setChosen] = useState<number | null>(null)

  const setName = useCallback(
    (next: number | ((current: number) => number)) =>
      setChosen((current) => {
        const from = current ?? linkedName() ?? DEFAULT_NAME
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
