# The Vault

The scene behind `/vault`: the seven-sided Vault of the Adepti. Its shape, colours and inscriptions are in `src/lib/vault.ts`,
which also explains the room's coordinates (feet; `+X` east, `+Z` south,
`+Y` up; walls numbered clockwise from the East corner).

There are three designs, `DESIGNS` in `src/lib/vault.ts`. **Regardie** is
the Vault as _The Golden Dawn_ publishes it: the walls placed by the solar
spectrum, each parted into forty squares. **Case** is the Vault as Paul
Foster Case revised it: the walls placed by the Seven Branched
Candlestick, each parted into ten squares after the _Fama_. Everything
else is shared, as the Second Order papers say ("the same as the Golden
Dawn except for the wall illustrations"), so both draw the ceiling, floor,
Pastos, altar and door from `golden-dawn/`. **Pansophic** is a draft and is
kept out of the tabs; `?design=pansophic` reaches it.

The fabric follows the Second Order papers rather than Regardie wherever
the two differ, and each such place says so in a comment. The plates those
papers draw are in `public/vault/`.

| File              | What it draws or does                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| `VaultCanvas.tsx` | The canvas and the scene: picks the design and puts the room and furniture in it.    |
| `Room.tsx`        | The walls, ceiling, floor and door.                                                  |
| `Furniture.tsx`   | The altar, the Pastos and its lid, and the Pansophic altar and grave.                |
| `Diagrams.tsx`    | The three diagrams hung in the corners of the Vault.                                 |
| `Rig.tsx`         | The camera: walking with the keys, looking round by dragging.                        |
| `types.ts`        | The furniture that can be taken away, and in which designs.                          |
| `paint.ts`        | What every design paints with, including the frame of the ceiling and floor plans.   |
| `golden-dawn/`    | The surfaces both finished designs share, one file per surface, and Regardie's wall. |
| `case/`           | Case's wall: the ten squares.                                                        |
| `pansophic/`      | The Pansophic design's painted surfaces.                                             |

Every surface is painted on a 2D canvas (see `src/lib/canvasTexture.ts`)
and wrapped onto its plane or cylinder. The ceiling and floor are painted
in plan, as seen from above, and `Room.tsx` maps the canvas back onto the
heptagon; `PLAN_MARGIN` in `paint.ts` is what keeps the two lined up.
