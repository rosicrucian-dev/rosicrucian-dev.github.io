import { useEffect, useRef } from 'react'

import { nameFromSearch, searchWithName } from '@/lib/shemHaMephorash'

// How long the star must rest on a Name before the address is updated.
const DELAY_MS = 300

// Keeps the Name the star is set on in the page's address, as `?name=33`,
// so that a formula can be shared by its link.
//
// A shared link sets the star on its Name when the page opens, over the
// Name remembered from the last visit; after that, the address follows the
// star, so that it is always a link to what is shown. The address is
// replaced rather than pushed: Back leaves the page, rather than stepping
// back through every Name visited. It is written once the star has
// settled, not at every step: holding an arrow key steps some thirty times
// a second, and Safari refuses more than a hundred replaceState calls in
// ten seconds.
export function useNameInUrl(name: number, setName: (name: number) => void) {
  const linkRead = useRef(false)
  useEffect(() => {
    if (!linkRead.current) {
      linkRead.current = true
      const linked = nameFromSearch(window.location.search)
      if (linked !== null && linked !== name) {
        // Not written over with the Name shown now: the next render shows
        // the linked one.
        setName(linked)
        return
      }
    }
    const timer = window.setTimeout(() => {
      const search = searchWithName(window.location.search, name)
      if (search === window.location.search) return
      try {
        window.history.replaceState(
          window.history.state,
          '',
          `${window.location.pathname}${search}${window.location.hash}`,
        )
      } catch {
        // Refused (too many updates, or a sandboxed frame): the address
        // catches up at the next change.
      }
    }, DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [name, setName])
}
