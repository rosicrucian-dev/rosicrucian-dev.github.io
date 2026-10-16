# The Vault

The scene behind `/vault`: the seven-sided Vault of the Adepti, in two
designs. Its shape, colours and inscriptions are in `src/lib/vault.ts`,
which also explains the room's coordinates (feet; `+X` east, `+Z` south,
`+Y` up; walls numbered clockwise from the East corner).

| File              | What it draws or does                                                             |
| ----------------- | --------------------------------------------------------------------------------- |
| `VaultCanvas.tsx` | The canvas and the scene: picks the design and puts the room and furniture in it. |
| `Room.tsx`        | The walls, ceiling, floor and door.                                               |
| `Furniture.tsx`   | The altar, the Pastos and its lid, and the Pansophic altar and grave.             |
| `Rig.tsx`         | The camera: walking with the keys, looking round by dragging.                     |
| `types.ts`        | The furniture that can be taken away, and in which designs.                       |
| `paint.ts`        | What both designs paint with, including the frame of the ceiling and floor plans. |
| `golden-dawn/`    | The Golden Dawn design's painted surfaces, one file per surface.                  |
| `pansophic/`      | The Pansophic design's painted surfaces.                                          |

Every surface is painted on a 2D canvas (see `src/lib/canvasTexture.ts`)
and wrapped onto its plane or cylinder. The ceiling and floor are painted
in plan, as seen from above, and `Room.tsx` maps the canvas back onto the
heptagon; `PLAN_MARGIN` in `paint.ts` is what keeps the two lined up.
