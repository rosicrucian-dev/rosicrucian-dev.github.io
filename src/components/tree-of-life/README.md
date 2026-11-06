# Tree of Life

The scene behind `/tree-of-life`: the Tree after BOTA's painting of it,
seen from outside, either as drawn or laid on a human figure. Its data and
layouts (where each Sephirah stands, which paths there are) are in
`src/lib/treeOfLife.ts`; the Sephiroth and paths themselves in
`src/lib/tree.ts`.

| File                   | What it draws or does                                                              |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `TreeOfLifeCanvas.tsx` | The canvas and the scene: puts everything below together.                          |
| `Sephirah.tsx`         | A Sephirah's sphere, its painted light from Kether and its label.                  |
| `Glow.tsx`             | The light round each sphere, and Kether's, Tiphareth's and Yesod's rays.           |
| `Path.tsx`             | A path's tube, its spiral, its sheen and its glow.                                 |
| `PathCard.tsx`         | A path's Tarot key, laid on it.                                                    |
| `Body.tsx`             | The human figure the Tree is laid on.                                              |
| `Rig.tsx`              | The camera: turning, zooming and panning from outside, and walking inside.         |
| `layout.ts`            | How big the spheres are drawn in each layout, and how the view frames the Tree.    |
| `renderOrder.ts`       | The order everything is drawn in. Read this before changing how anything overlaps. |
| `textures.ts`          | The canvas-painted textures: spheres, path spirals and labels.                     |
| `types.ts`             | Types the page shares with the scene.                                              |
| `inside/`              | The walk through the Tree from inside (built, but not yet offered on the page).    |

Coordinates: the Tree lies flat on the `XZ` plane, Kether towards `−Z` and
the Pillar of Mercy towards `+X`. The outside view looks down from `+Y`
with the camera's up set to `[0, 0, −1]`, so Kether is at the top of the
screen and the Tree tilts towards or away from you as freely as it turns.

The spheres, glows and paths are built once for a layout; switching
between the drawn Tree and the body remounts them (`key` includes the
layout), so anything a component computes once in `useState` is right for
its layout.
