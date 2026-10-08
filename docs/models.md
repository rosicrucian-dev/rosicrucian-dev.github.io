# The models

Each model is one page showing an interactive 3D scene, with a header,
a settings panel and some overlays. Every model is built from the same
pieces, so once you know one you can find your way around the others.

## The models today

| Model               | Route                  | Page, scene and data                                                                                 |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| The Vault           | `/vault`               | `src/app/vault/`, `src/components/vault/`, `src/lib/vault.ts`                                        |
| Cube of Space       | `/cube-of-space`       | `src/app/cube-of-space/`, `src/components/cube-of-space/`, `src/lib/cubeOfSpace.ts`                  |
| Tree of Life        | `/tree-of-life`        | `src/app/tree-of-life/`, `src/components/tree-of-life/`, `src/lib/treeOfLife.ts`                     |
| Tree of Life Sphere | `/tree-of-life-sphere` | `src/app/tree-of-life-sphere/`, `src/components/tree-of-life-sphere/`, `src/lib/treeOfLifeSphere.ts` |

A model's scene folder may have a `README.md` mapping its files; the Tree
of Life's does.

Every model's files are named for its route: the page in `src/app/<slug>/`,
the scene in `src/components/<slug>/`, and its data in
`src/lib/<slugInCamelCase>.ts`. The Tree of Life and the Tree of Life
Sphere share the Tree itself (the Sephiroth and the paths) from
`src/lib/tree.ts`.

Every model is registered in **`src/lib/models.ts`**, which the Models page,
the sitemap and each model's page metadata are built from.

## How a model is put together

A model called `example`, at `/example`, has these parts:

```
src/lib/models.ts                  its row: slug, name, description
src/app/example/
  page.tsx                         the route: metadata, renders the client
  ExampleClient.tsx                the page: header, settings panel, overlays
  useSettings.ts                   the settings it remembers between visits
src/components/example/
  ExampleCanvas.tsx                the 3D scene (and more files as it grows)
src/lib/example.ts                 its data and geometry, as plain TypeScript
test/example.test.ts               tests for src/lib/example.ts
```

**`page.tsx`** is a server component with two lines of substance:

```tsx
export const metadata = modelMetadata('example')

export default function Example() {
  return <ExampleClient />
}
```

**`ExampleClient.tsx`** (`'use client'`) lays the page out with
`ModelShell` and loads the scene on demand, so that the page paints before
three.js has downloaded:

```tsx
const ExampleCanvas = dynamic(
  () =>
    import('@/components/example/ExampleCanvas').then((m) => m.ExampleCanvas),
  { ssr: false },
)
```

It reads the settings with `useSettings()` and passes them to the canvas as
props. The canvas never reads settings itself.

**`useSettings.ts`** describes what is remembered: a `Settings` type, its
defaults, and a `parse` that turns whatever was stored into valid settings,
one field at a time, so that a value from an older version of the page
falls back to its default rather than breaking it. The storage key is
`'<slug>:settings'`.

**The scene** (`src/components/example/`) is a react-three-fiber scene
inside `ModelCanvas`. It takes everything it shows as props, and reports
back (what the viewer is facing, where they are) through callbacks.

**`src/lib/example.ts`** holds what can be stated without React or
three.js: the symbol's data (letters, colours, attributions, with their
sources), its dimensions and its geometry. Keep it pure so it can be
tested.

## The shared pieces

### `src/components/model/`

- **`ModelShell`**: the page frame. The scene fills the window; over it,
  the header (the emblem linking back to /models, the title, the model's
  own buttons and the settings gear) and the settings panel. Its props:
  - `title`, `background` (the scene's background colour; the header is a
    veil of it).
  - `headerControls`: buttons or tabs shown left of the gear. Use
    `HeaderButton` for an icon button and `HeaderTabs` for a choice
    between a few options.
  - `controls`: the settings panel's contents, as `Section`s holding
    `SwitchRow`s and `HeaderTabs` (with `fill`). `controlsId` names the
    panel.
  - `hint`: optional keys-and-gestures help, shown over the scene until
    dismissed and always kept in the panel.
  - `canvas`, with `canvasLabel`: the scene, and what it shows, in words.
  - `structure`: the model's content as text (lists, headings) for screen
    readers. The canvas is invisible to them, so this is the real content.
  - `children`: anything else floating over the scene, such as a label
    saying what the viewer faces.
- **`ModelCanvas`**: the `<Canvas>` every model draws into. It draws only
  on demand (see below), caps the pixel ratio, and with `flat` turns off
  tone mapping so colours show exactly as specified.
- **`useFonts`** (`fonts.ts`): the page's fonts, ready to paint text onto
  canvas textures; `null` until they have loaded.
- **`useLensZoom`**: zooming by narrowing the field of view, for views
  from a fixed point (standing inside a room or a sphere).
- **`touch.tsx`**: hover highlights and click handling for things in the
  scene that can be clicked (the Vault's furniture).

### `src/lib/`

- **`models.ts`**: the model registry. **`site.ts`**: the site's address.
- **`settings.ts`**: `useStoredSettings`, which every `useSettings.ts`
  wraps, and `parseSwitches` for a group of on/off switches.
- **`canvasTexture.ts`**: `canvas()`, `texture()` and `useTexture()`.
  Most surfaces (walls, plates, labels, spheres) are painted on a 2D canvas
  and used as a texture.
- **`colors.ts`**: the colour scales. The Golden Dawn's (`PALETTE`, used by
  the Vault and the Sphere) and BOTA's (`BOTA_SCREEN_PALETTE` for the Cube,
  `BOTA_POSTER_PALETTE` and `BOTA_SEPHIRAH_COLORS`, sampled from BOTA's
  painting, for the Tree of Life). Use these rather than writing colours
  into a scene.
- **`letters.ts`**: the 22 Hebrew letters and their attributions.
- **`tarot.ts`**: the 22 Tarot keys and their card images, in two decks
  (`public/tarot/cards/`).

## Rules every model follows

- **Draw on demand.** The canvas renders only when asked, to save battery.
  After changing anything that affects the picture outside of React (a
  camera move, a texture finishing loading, a value changed in a
  `useFrame`), call `invalidate()` from `useThree`. Something animating
  calls it every frame for as long as it moves. If the scene looks stuck
  until you move the mouse, a call is missing.
- **Clean up.** Textures, materials and geometries made by hand must be
  disposed of when no longer used: `useTexture` does this for painted
  textures; otherwise dispose in an effect's cleanup.
- **Keep three.js out of the page's first load.** Import scene code only
  through the `dynamic(..., { ssr: false })` import in the client.
- **Work on phones.** Every control must work by touch, and the header must
  fit on a narrow screen (`HeaderTabs` has a `short` label for each option).
  Check memory: large canvases and textures cost the most, and iOS can
  drop the WebGL context.
- **Be readable without the canvas.** Keep `structure` and `canvasLabel`
  up to date with what the scene shows.
- **Cite the source.** Where a colour, position or attribution follows a
  source (Regardie, Case, BOTA's painting, the Fama, Prinke), say which in
  a comment; where it is a guess or a compromise, say so.

## Coordinates

Each model documents its own frame at the top of its data module:

- **Vault** (`src/lib/vault.ts`): units are feet, `+Y` up, `+X` east and
  `+Z` south; the walls are numbered clockwise, seen from above, from the
  East corner.
- **Tree of Life** (`src/lib/treeOfLife.ts`): the Tree lies flat on the
  `XZ` plane with Kether towards `−Z` and the Pillar of Mercy towards `+X`;
  the outside view looks down from `+Y` with the camera's up set to
  `[0, 0, −1]`, so Kether is at the top of the screen.
- **Tree of Life Sphere** (`src/lib/treeOfLifeSphere.ts`): positions on the
  sphere are ecliptic longitude and latitude, longitude counted from
  Regulus as 0° Leo, as the Golden Dawn reckons it.

## Adding a model

1. Add its row to `MODELS` in `src/lib/models.ts`.
2. Write its data and geometry in `src/lib/<name>.ts`, with tests in
   `test/<name>.test.ts`.
3. Build the scene in `src/components/<slug>/`, starting from
   `ModelCanvas`.
4. Add `src/app/<slug>/`: `page.tsx`, the client with `ModelShell`, and
   `useSettings.ts`.
5. Record the source and licence of any images, fonts, data or models you
   add in `public/NOTICE.md`.
6. Check it on a desktop browser and on a phone, then run `npm run build`,
   `npm test` and `npm run lint`.
