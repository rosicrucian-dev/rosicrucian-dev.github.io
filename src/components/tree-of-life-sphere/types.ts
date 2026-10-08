// What the page asks the sphere to show.

import type { Observer } from '@/lib/realSky'

export type View = 'inside' | 'outside'

// Each is one on/off switch in the Controls panel.
export interface Layers {
  tree: boolean
  // The ecliptic line with its sign boundaries and sign names.
  ecliptic: boolean
  stars: boolean
  // The constellations' stick-figure lines, and their names.
  constellations: boolean
  constellationLabels: boolean
  // The drawn figures of the constellations.
  art: boolean
  // All other text: sephirah names, path letters, sign and planet names.
  labels: boolean
  // The seven classical planets, where they are right now.
  planets: boolean
}

// How solidly the Tree is drawn over the sky behind it.
export interface Appearance {
  // Off: the paths are see-through bands, so the sky shows through them.
  opaquePaths: boolean
  // Off: the sephiroth are see-through discs, so the constellations that
  // Mathers places inside each one can be seen there.
  opaqueSpheres: boolean
}

// Where the viewer really is, and whether their phone should aim the view.
export interface SkyObserver extends Observer {
  compass: boolean
}
