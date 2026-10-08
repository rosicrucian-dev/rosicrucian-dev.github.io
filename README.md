# rosicrucian.dev

The site of Rosicrucian Developers, a community building open source
projects for the aquarian age. Its main feature is a set of interactive 3D
**models** of the symbols of the Rosicrucian tradition, listed at
[rosicrucian.dev/models](https://rosicrucian.dev/models):

- **The Vault**: the seven-sided Vault of the Adepti, as the Golden Dawn
  built it or as the Fama describes it.
- **Cube of Space**: Paul Foster Case's Cube of Space, with the Hebrew
  letters and their Tarot keys.
- **Tree of Life**: the Tree after BOTA's painting of it, on its own or
  laid on a human figure.
- **Tree of Life Sphere**: the Tree projected onto the sky, with the zodiac
  and the stars.

## Getting started

You need Node.js 22.18 or newer (the tests and scripts run TypeScript
directly).

```sh
npm install
npm run dev          # http://localhost:3000
```

| Command              | What it does                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`        | Development server.                                                                                                |
| `npm run dev:https`  | Development server over HTTPS, for trying the phone's compass and motion sensors from a phone on the same network. |
| `npm run build`      | Static export to `out/`.                                                                                           |
| `npm test`           | Unit tests (`test/*.test.ts`, Node's own test runner).                                                             |
| `npm run lint`       | ESLint.                                                                                                            |
| `npm run format`     | Formats the code with Prettier (`format:check` only checks).                                                       |
| `npm run gen:sky`    | Regenerates the Tree of Life Sphere's star map (see `scripts/gen-sky.ts`).                                         |
| `npm run gen:social` | Regenerates the social share images.                                                                               |

The site is a static export served from GitHub Pages: there is no server
code, and every page must build to plain HTML, CSS and JavaScript.

## Stack

Next.js (App Router, static export), React, TypeScript, Tailwind CSS, and
three.js through [react-three-fiber](https://r3f.docs.pmnd.rs) and
[drei](https://drei.docs.pmnd.rs).

## Working on the models

Start with **[docs/models.md](docs/models.md)**: how a model is put
together, the shared pieces every model uses, the conventions, and how to
add a new one.

## Conventions

- Format with Prettier (`npm run format`; the settings are in
  `.prettierrc.json`: no semicolons, single quotes).
- `npm run build`, `npm test`, `npm run lint` and `npm run format:check`
  should all pass before a change is merged.
- Comments explain _why_: the source a choice follows (Regardie, Case,
  BOTA's painting, the Fama) or the problem it avoids. Keep them when you
  change the code, and say where a choice is a guess.
- Pure logic (geometry, data, colour) lives in `src/lib/` and has tests in
  `test/`; React and three.js code lives in `src/components/` and
  `src/app/`.

## Licences

The code is MIT licensed (see [LICENSE](LICENSE)). Some data, images,
fonts and 3D models keep the licences of the works they come from: see
[public/NOTICE.md](public/NOTICE.md) before adding or reusing any asset,
and record the source and licence of anything you add there.
