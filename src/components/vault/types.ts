import type { Held } from '@/components/model/HoldButton'

// What the Vault's scene and its page share: the things in the room that
// can be touched, and the moves that walk the viewer about.

// The furniture that can be taken away and put back, and the door, which
// opens and closes. What a click does is the page's to decide.
export type Item = 'altar' | 'pastos' | 'lid' | 'plate'
export type Target = Item | 'door'
// Which pieces are in the room. The lid shows only on the Pastos; the
// brass plate covers the Pansophic grave.
export type Furniture = Record<Item, boolean>

// Walking about, as in a game: the left hand moves (W A S D, with E and Q
// to rise and sink), the right hand turns the view (the arrow keys). The
// page and the keyboard both press and release moves; while any is held
// the view glides that way, relative to where it looks.
export type Move =
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'turnLeft'
  | 'turnRight'
  | 'lookUp'
  | 'lookDown'

// The moves held down: see HoldButton.
export type Motion = Held<Move>
