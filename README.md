# MUI CollageFab

**[Live demo →](https://radomir.dev/mui-collage-fab/)**

| Collapsed | Expanded |
| --- | --- |
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
    item: (ownerState) =>
      ownerState.isAnchor ? { sx: { outline: '2px solid white' } } : {},
  }}
>
  {/* Index 0 is the anchor: it never moves and is never clipped. */}
  <Fab color="primary"><Settings /></Fab>
  <Fab color="secondary"><BugReport /></Fab>
  <Fab color="success"><Speed /></Fab>
</CollageFab>
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
</CollageFab>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The buttons to stack. Order matters: index 0 is the anchor. |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'left'` | Which way the row fans out from the anchor. `'left'` pins the stack to the right edge and expands leftward. |
| `size` | `'small' \| 'medium' \| 'large' \| number` | `'large'` | Diameter of each button. `small` 40, `medium` 48, `large` 56; numbers are used verbatim. |
| `variant` | `'circular' \| 'rounded' \| 'square'` | `'circular'` | Shape of each button. `rounded` uses a 25% corner radius, which scales with `size`. For an arbitrary radius, use `slotProps.item.sx`. |
| `gap` | `number` | `16` | Main-axis gap in pixels between buttons when expanded. |
| `fadeWidth` | `number` | `12` | Width in pixels of the soft gradient ramp at each slice edge. `0` gives a hard cut. |
| `trigger` | `'hover' \| 'click' \| 'manual'` | `'hover'` | `'hover'` opens on mouse enter, closes on leave, toggles on touch/pen tap. `'click'` toggles on any click. `'manual'` disables built-in pointer interaction. |
| `open` | `boolean` | — | Controlled open state. Passing it makes the component controlled. |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled. |
| `onOpen` | `(event) => void` | — | Fired on the closed → open transition. |
| `onClose` | `(event) => void` | — | Fired on the open → closed transition. |
| `disableClickAway` | `boolean` | `false` | If `true`, an outside press does not close the group. |
| `transitionDuration` | `number` | `400` | Duration of the morph in milliseconds. |
| `transitionEasing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | Easing of the morph. |
| `sx` | `SxProps<Theme>` | — | System overrides for the root. |
| `classes` | `Partial<CollageFabClasses>` | — | Override the `root` / `item` / `expanded` / `collapsed` classes. |
| `slots` | `Partial<CollageFabSlots>` | — | Replace the `root` or `item` slot component. |
| `slotProps` | `CollageFabSlotProps` | — | Props for each slot, or a callback `(ownerState) => props`. |

Remaining `div` attributes, including `aria-label` and `aria-labelledby`, are spread onto the root.

## Slots

1. `root` — the animated container. Owns the anchor-edge alignment, the animated main-axis extent, and the single `drop-shadow` filter. A replacement must forward `ref`, because the `ClickAwayListener` needs it.
2. `item` — one masked circular wrapper per child. `slotProps.item` accepts a props object or a callback `(ownerState) => props`, which is the per-child escape hatch: switch on `ownerState.index` or `ownerState.isAnchor` to style an individual button.

## ownerState

`CollageFabOwnerState` carries `open`, `direction`, `trigger`, `size` (resolved pixels), `gap`, `fadeWidth`, `count`, `transitionDuration` and `transitionEasing`. `CollageFabItemOwnerState` adds `index` and `isAnchor`.

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

| URL | Page |
| --- | --- |
| `/` | Demo — the component across button counts and directions. |
| `#/docs` | Components API reference for `CollageFab`. |
| anything else | Redirects to `#/`. |

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

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Type-check with `tsc --noEmit`, then build the demo to `dist/`. |
| `npm run build:lib` | Build the publishable package to `dist-lib/` (ESM + CJS + types). |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest suite (geometry + behaviour in jsdom). |
| `npm run test:coverage` | Same suite with a v8 coverage report. |
| `npm run test:e2e` | Build, then run the Playwright checks against `vite preview`. |

Deployment: `.github/workflows/deploy.yml` builds the demo on every push to
`main` and force-pushes `dist/` to the orphan `gh-pages` branch, which GitHub
Pages serves. The branch has no shared history with `main`, so it only ever
holds built files. `.github/workflows/publish.yml` runs `semantic-release` on
every push to `main`: conventional commit subjects decide the version (`fix:`
patch, `feat:` minor, `BREAKING CHANGE:` major), and a release publishes the
package, writes `CHANGELOG.md`, and commits the bump back with `[skip ci]`.
Pull request titles are linted to the same convention, which matters because
squash merges put the PR title in the commit subject. The production build uses a `/mui-collage-fab/` asset
base while the dev server stays at the root, so the local URL is unchanged —
see `vite.config.ts`.
