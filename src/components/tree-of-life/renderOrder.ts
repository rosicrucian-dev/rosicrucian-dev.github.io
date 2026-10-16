import { AdditiveBlending, BackSide } from 'three'

// The order the outside view is drawn in, first to last. Most of the scene
// is drawn with the depth test as usual; these few rules are what make the
// Tree look painted, as on BOTA's poster, rather than like solid objects
// cutting into each other. Every renderOrder in the Tree is one of these.
//
//   BODY_ORDER    the human figure, when the Tree is laid on it
//   GLOW_ORDER    the glows of the spheres and paths, without depth
//   (0)           the paths that run up the Tree
//   ACROSS_ORDER  the three paths across it (Daleth, Teth, Peh)
//   SPHERE_ORDER  the spheres
//   CARD_ORDER    the Tarot keys on the paths

// Drawn before everything, the glows included, so they shine over it.
export const BODY_ORDER = -20

// How the glows are drawn. Each glow lies on a shell round its sphere or
// path, lit by how near the line of sight passes; but the shell's far side,
// where it is drawn, lies below the paths and spheres, and seen at a slant
// the near tubes would hide parts of it beside them, as soft shadows. So
// the glows are drawn first, behind everything and without depth, and the
// spheres and paths are drawn over them.
export const GLOW_ORDER = -10
export const GLOW_PASS = {
  side: BackSide,
  transparent: false,
  depthTest: false,
  depthWrite: false,
  blending: AdditiveBlending,
} as const

// From outside, a path across the Tree is drawn whole over the paths it
// crosses: it is drawn after them, over whatever is already there, and
// marks its depth, so the spheres drawn after it still stand in front of
// it where they should. Nothing of the crossing paths is cut away, so from
// any angle they run cleanly in under it.
export const ACROSS_ORDER = 1
export const SPHERE_ORDER = 2

// Last, with depth, so a sphere in front of a card hides it.
export const CARD_ORDER = 3
