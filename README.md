# MUI CollageFab

**[Live demo →](https://radomir.dev/mui-collage-fab/)**

| Collapsed                                                                                                                                                                                         | Expanded                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <img src="https://raw.githubusercontent.com/radomir-dev/mui-collage-fab/main/docs/collagefab-collapsed.png" alt="Three CollageFab buttons collapsed into a single stacked circle" height="104" /> | <img src="https://raw.githubusercontent.com/radomir-dev/mui-collage-fab/main/docs/collagefab-expanded.png" alt="Three CollageFab buttons fanned out into a horizontal row" height="104" /> |

A Material UI floating action button that behaves like a collapsed stack of overlapping circles. Collapsed, a set of `Fab`s sits perfectly stacked and reads as a single button with soft gradient slices at the edges. On hover (mouse) or tap (touch), the parent expands its main-axis extent and the buttons fan out into a row while their CSS masks slide in lockstep with the movement — so the unfold reads as one continuous morph instead of a pop.

The trick is that each child is a full circle clipped by a static linear-gradient mask. As the element translates along the main axis, the `mask-position` is translated back by the same amount, keeping the fade boundary fixed in container space. Because the fade is a gradient rather than a hard clip, the parent's `filter: drop-shadow(...)` traces the soft edges cleanly.

Not affiliated with or endorsed by MUI.

## Install

```bash
npm install mui-collage-fab @mui/material @emotion/react @emotion/styled
```

`react`, `react-dom`, `@mui/material` and the two emotion packages are peer
dependencies, so the package never ships its own copy of React or MUI.

## Usage

```tsx
import { Fab } from '@mui/material';
import { Settings, BugReport, Speed } from '@mui/icons-material';
import { CollageFab } from 'mui-collage-fab';

<CollageFab
  direction="left"
  trigger="hover"
  gap={14}
  fadeWidth={12}
  aria-label="Tools"
  slotProps={{
    item: (ownerState) => (ownerState.isAnchor ? { sx: { outline: '2px solid white' } } : {}),
  }}
>
  {/* Index 0 is the anchor: it never moves and is never clipped. */}
  <Fab color="primary">
    <Settings />
  </Fab>
  <Fab color="secondary">
    <BugReport />
  </Fab>
  <Fab color="success">
    <Speed />
  </Fab>
</CollageFab>;
```

Controlled usage, when the open state has to live in your own state:

```tsx
const [open, setOpen] = useState(false);

<CollageFab
  trigger="manual"
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
>
  {/* children */}
</CollageFab>;
```

## Props

<!-- api:props:start -->

| Prop                 | Type                                       | Default                          | Description                                                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`           | `React.ReactNode`                          | —                                | The buttons to stack. Every valid element is wrapped in a masked slot shaped by `variant`. Order matters: index 0 is the anchor, the rest fan out along `direction`.                                                                                                                            |
| `direction`          | `'left' \| 'right' \| 'up' \| 'down'`      | `'left'`                         | The axis the buttons fan out on, starting from the anchor child. `left` matches the original right-anchored behaviour.                                                                                                                                                                          |
| `size`               | `'small' \| 'medium' \| 'large' \| number` | `'large'`                        | Diameter of every button. Named sizes resolve to small 40px, medium 48px, large 56px; numeric values are used verbatim.                                                                                                                                                                         |
| `variant`            | `'circular' \| 'rounded' \| 'square'`      | `'circular'`                     | The shape of every button. `'circular'` clips each slice to a circle, `'rounded'` to a rounded square and `'square'` to a sharp-cornered square. The mask still slices the silhouette along the main axis, so the stack reads as one shape when collapsed and as separate shapes when expanded. |
| `gap`                | `number`                                   | `16`                             | Main-axis gap in pixels between two buttons when expanded.                                                                                                                                                                                                                                      |
| `fadeWidth`          | `number`                                   | `12`                             | Width in pixels of the soft cut line between two slices.                                                                                                                                                                                                                                        |
| `trigger`            | `'hover' \| 'click' \| 'manual'`           | `'hover'`                        | How the group reacts to pointers. `'hover'` opens on mouse enter, closes on mouse leave and toggles on touch or pen tap; `'click'` toggles on any click; `'manual'` disables all built-in pointer interaction.                                                                                  |
| `open`               | `boolean`                                  | —                                | If `true`, the group is expanded. Use it to control the component.                                                                                                                                                                                                                              |
| `defaultOpen`        | `boolean`                                  | `false`                          | If `true`, the group is expanded by default (uncontrolled).                                                                                                                                                                                                                                     |
| `onOpen`             | `(event: React.SyntheticEvent) => void`    | —                                | Callback fired when the group is expanded.                                                                                                                                                                                                                                                      |
| `onClose`            | `(event: React.SyntheticEvent) => void`    | —                                | Callback fired when the group is collapsed.                                                                                                                                                                                                                                                     |
| `disableClickAway`   | `boolean`                                  | `false`                          | If `true`, the group does not collapse when the user clicks away from it.                                                                                                                                                                                                                       |
| `transitionDuration` | `number`                                   | `400`                            | Duration of the morph, in milliseconds.                                                                                                                                                                                                                                                         |
| `transitionEasing`   | `string`                                   | `'cubic-bezier(0.4, 0, 0.2, 1)'` | Easing of the morph.                                                                                                                                                                                                                                                                            |
| `sx`                 | `SxProps<Theme>`                           | —                                | System prop that defines system overrides as well as additional CSS styles.                                                                                                                                                                                                                     |
| `classes`            | `Partial<CollageFabClasses>`               | —                                | Override or extend the styles applied to the component.                                                                                                                                                                                                                                         |
| `slots`              | `CollageFabSlots`                          | —                                | Custom components for the `root` and `item` slots.                                                                                                                                                                                                                                              |
| `slotProps`          | `{ root?, item? }`                         | —                                | Props for each slot. `slotProps.item` accepts either a props object or an `(ownerState) => props` callback, which is the per-child escape hatch.                                                                                                                                                |
| `...divProps`        | `React.HTMLAttributes<HTMLDivElement>`     | —                                | The remaining div attributes are spread onto the root.                                                                                                                                                                                                                                          |

<!-- api:props:end -->

## Slots

<!-- api:slots:start -->

1. `root` — The animated container. A replacement must forward `ref`, which `ClickAwayListener` needs.
2. `item` — One masked wrapper per child, shaped by `variant`.

<!-- api:slots:end -->

## ownerState

<!-- api:owner-state:start -->

`CollageFabOwnerState` carries `open`, `direction`, `trigger`, `size`, `variant`, `cornerRadius`, `gap`, `fadeWidth`, `count`, `transitionDuration` and `transitionEasing`. `CollageFabItemOwnerState` adds `index`, `isAnchor` and `geometry`.
<!-- api:owner-state:end -->

Theme-level defaults and overrides work through the `MuiCollageFab` component key:

```tsx
const theme = createTheme({
  components: {
    MuiCollageFab: {
      defaultProps: { gap: 10 },
      styleOverrides: { item: { borderRadius: '8px' } },
    },
  },
});
```

## Notes

1. **The parent must pin the anchor edge.** The root animates its own main-axis extent, so it only fans out if its parent keeps the anchor edge fixed: `justify-content: flex-end` for `direction="left"`, `flex-start` for `"right"`, `align-items: flex-end` for `"up"`, `flex-start` for `"down"`. Otherwise the root grows in place and pushes surrounding content instead of fanning out.
2. **Each child is forced to `box-shadow: none` and 100% size**, so the parent owns the global shadow shape. Pass visual styles via each child's `sx`; the component overrides sizing and shadow only. Overriding that reset requires `slotProps.item.sx['& > *']` with `!important`.
3. **The single `drop-shadow` lives on the root**, because a filter traces the soft mask edges while a `box-shadow` would trace the wrapper rectangles. Setting `overflow: hidden` on the root via `sx` clips the fan-out.
4. **Shapes.** `variant` covers the three common cases; children inherit the wrapper's corner radius, so the shape applies to the whole group rather than to each button's own `Fab` default. Any other radius is reachable with `slotProps.item.sx`.
5. **Collapsed slices are hidden from assistive technology.** While collapsed, the item wrappers are `aria-hidden` and made non-focusable, so they leave the tab order and the accessibility tree. The root stays focusable: Enter or Space opens the group, focus moves to the first item, and Escape closes it and returns focus to the root.
6. **With a single child no mask is applied** — it behaves like a plain `Fab`.
7. **`direction` is physical, not logical.** It is not mirrored under RTL; right-to-left layouts should set `direction="left"` explicitly.

## Demo site

1. Demo — <https://radomir.dev/mui-collage-fab/>
2. Components API — <https://radomir.dev/mui-collage-fab/#/docs>
3. Playground — <https://radomir.dev/mui-collage-fab/#/playground>

Routing is hash-based, so the built site works on any static host without a
server-side fallback.

| URL           | Page                                                      |
| ------------- | --------------------------------------------------------- |
| `/`           | Demo — the component across button counts and directions. |
| `#/docs`      | Components API reference for `CollageFab`.                |
| anything else | Redirects to `#/`.                                        |

## Testing

`src/components/collageFabGeometry.ts` holds the mask and translation maths, so it can be
tested without a DOM: `tests/geometry.test.ts` asserts the translate offsets, the mask axis
and stop order, and the invariant that a slice's mask position and translation cancel out —
the cut line stays pinned while the button travels. `tests/behaviour.test.tsx` runs the
component in jsdom for triggers, keyboard flow, controlled state and click-away.
`e2e/collagefab.spec.ts` is the browser-level check, because jsdom cannot compute masks:
it reads the real `transform` and `mask-position` after hovering and verifies they move by
the same pitch in opposite directions.

## Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

| Command                          | Description                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                    | Start the Vite dev server with HMR.                                      |
| `npm run build`                  | Type-check with `tsc --noEmit`, then build the demo to `dist/`.          |
| `npm run build:preview`          | Same, with the asset base taken from `SITE_BASE_PATH`.                   |
| `npm run build:lib`              | Build the publishable package to `dist-lib/` (ESM + CJS + types).        |
| `npm run preview`                | Serve the production build locally.                                      |
| `npm test`                       | Run the Vitest suite (geometry + behaviour in jsdom).                    |
| `npm run test:coverage`          | Same suite with a v8 coverage report.                                    |
| `npm run test:e2e`               | Build, then run the Playwright checks against `vite preview`.            |
| `npm run types:test`             | Type-check the public API surface (`expectTypeOf` + `@ts-expect-error`). |
| `npm run check:package`          | `publint`, `attw --pack` and a tarball content assertion.                |
| `npm run check:size`             | Enforce the size-limit budgets for `dist-lib`.                           |
| `npm run lint`                   | ESLint, type-aware, with hooks and jsx-a11y rules.                       |
| `npm run format:check`           | Prettier check. `npm run format` rewrites in place.                      |
| `npm run check:unused`           | Knip: unused files, exports and dependencies.                            |
| `npm run check:release`          | `semantic-release --dry-run`, validating the release config.             |
| `npm run check:actions-security` | Zizmor audit of the workflows.                                           |
| `npm run doctor`                 | Run every check below in one pass.                                       |
| `npm run doctor:fast`            | Same, minus the browser suite and `npm audit`.                           |

### Checks

`npm run doctor` (listr2) runs the checks in sequence and keeps going after a
failure, so one pass reports everything that is broken:

1. `format:check`, `lint`, `typecheck` — style and static analysis.
2. `types:test` — the public prop unions and slot overrides, pinned by type tests.
3. `test:coverage` — Vitest with coverage thresholds of 85 statements / 75 branches.
4. `build`, `build:lib` — demo and library bundles.
5. `check:package` — `publint`, `attw --pack` and a tarball assertion, so the
   published `exports`/types map and file list stay correct.
6. `check:size` — size-limit budgets for the ESM and CJS bundles.
7. `docs:check`, `actionlint`, `audit` and `test:e2e` — skipped with a reason when
   the script exists but the tool is missing (for example `actionlint` locally).

Property tests (`fast-check`, `tests/geometry.property.test.ts`) generate sizes, gaps,
fade widths, counts and directions and assert the geometry invariants rather than
enumerating cases: one pitch of translation per slice, a cut line pinned in container
space, and a mask window wide enough to cover the fan. `check:unused` (knip) catches dead
files, exports and dependencies; `check:release` loads every semantic-release plugin
through `--dry-run`; the e2e suite also runs a Pixel-class mobile project with touch
gesture specs, and zizmor audits the workflows themselves in CI.

`--fast` drops `test:e2e` and `audit`, `--only=lint,unit` runs a subset. Each failed
step keeps its output in `node_modules/.cache/doctor/<step>.log`. CI runs
`npm run doctor -- --fast` plus a separate e2e job covering chromium, firefox, webkit and
a Pixel-class mobile viewport, `zizmor` on the workflows, and `dependency-review` on pull
requests.

Deployment: `.github/workflows/deploy.yml` builds the demo on every push to
`main` and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
The branch holds nothing but built files. Every pull request gets that same
build one directory deeper, at
`https://radomir.dev/mui-collage-fab/pr-preview/pr-<number>/`:
`.github/workflows/preview.yml` builds it with `SITE_BASE_PATH` set to that
path, the preview action writes it to `gh-pages`, comments the URL on the pull
request, and removes the directory again when the pull request closes. The
deploy workflow keeps `pr-preview/` intact rather than cleaning the branch, so
a push to `main` does not take the open previews with it.

`.github/workflows/publish.yml` runs `semantic-release` on
every push to `main`: conventional commit subjects decide the version (`fix:`
patch, `feat:` minor, `BREAKING CHANGE:` major), and a release publishes the
package, writes `CHANGELOG.md`, and commits the bump back with `[skip ci]`.
Pull request titles are linted to the same convention, which matters because
squash merges put the PR title in the commit subject. The production build uses a `/mui-collage-fab/` asset
base while the dev server stays at the root, so the local URL is unchanged —
see `vite.config.ts`.
