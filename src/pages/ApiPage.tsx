import type { ReactNode } from 'react';
import {
  Box,
  Container,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const PROPS: PropDoc[] = [
  {
    name: 'children',
    type: 'React.ReactNode',
    default: '—',
    description:
      'The buttons to stack. Every valid element is wrapped in a masked slot shaped by variant. Order matters: index 0 is the anchor, the rest fan out along direction.',
  },
  {
    name: 'direction',
    type: "'left' | 'right' | 'up' | 'down'",
    default: "'left'",
    description:
      'The axis the buttons fan out on, starting from the anchor child. Defaults to left to match the original right-anchored behaviour.',
  },
  {
    name: 'size',
    type: "'small' | 'medium' | 'large' | number",
    default: "'large'",
    description:
      'Diameter of every button. Named sizes resolve to small 40px, medium 48px, large 56px; numeric values are used verbatim.',
  },
  {
    name: 'variant',
    type: "'circular' | 'rounded' | 'square'",
    default: "'circular'",
    description:
      "The shape of every button. 'circular' clips each slice to a circle, 'rounded' to a rounded square and 'square' to a sharp-cornered square. The mask still slices the silhouette along the main axis, so the stack reads as one shape when collapsed and as separate shapes when expanded.",
  },
  {
    name: 'gap',
    type: 'number',
    default: '16',
    description: 'Main-axis gap in pixels between two buttons when expanded.',
  },
  {
    name: 'fadeWidth',
    type: 'number',
    default: '12',
    description: 'Width in pixels of the soft cut line between two slices.',
  },
  {
    name: 'trigger',
    type: "'hover' | 'click' | 'manual'",
    default: "'hover'",
    description:
      "How the group reacts to pointers. 'hover' opens on mouse enter, closes on mouse leave and toggles on touch or pen tap; 'click' toggles on any click; 'manual' disables all built-in pointer interaction.",
  },
  {
    name: 'open',
    type: 'boolean',
    default: '—',
    description: 'If true, the group is expanded. Use it to control the component.',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'If true, the group is expanded by default (uncontrolled).',
  },
  {
    name: 'onOpen',
    type: '(event: React.SyntheticEvent) => void',
    default: '—',
    description: 'Callback fired when the group is expanded.',
  },
  {
    name: 'onClose',
    type: '(event: React.SyntheticEvent) => void',
    default: '—',
    description: 'Callback fired when the group is collapsed.',
  },
  {
    name: 'disableClickAway',
    type: 'boolean',
    default: 'false',
    description: 'If true, the group does not collapse when the user clicks away from it.',
  },
  {
    name: 'transitionDuration',
    type: 'number',
    default: '400',
    description: 'Duration of the morph, in milliseconds.',
  },
  {
    name: 'transitionEasing',
    type: 'string',
    default: "'cubic-bezier(0.4, 0, 0.2, 1)'",
    description: 'Easing of the morph.',
  },
  {
    name: 'sx',
    type: 'SxProps<Theme>',
    default: '—',
    description: 'System prop that defines system overrides as well as additional CSS styles.',
  },
  {
    name: 'classes',
    type: 'Partial<CollageFabClasses>',
    default: '—',
    description: 'Override or extend the styles applied to the component.',
  },
  {
    name: 'slots',
    type: '{ root?, item? }',
    default: '—',
    description: 'Custom components for the root and item slots.',
  },
  {
    name: 'slotProps',
    type: '{ root?, item? }',
    default: '—',
    description:
      'Props for each slot. slotProps.item accepts either a props object or a (ownerState) => props callback for the per-child escape hatch.',
  },
  {
    name: 'aria-label',
    type: 'string',
    default: '—',
    description: 'Accessible name for the root. Provide it (or aria-labelledby) since the root has role="group".',
  },
  {
    name: 'aria-labelledby',
    type: 'string',
    default: '—',
    description: 'Id of the element that labels the root. Alternative to aria-label.',
  },
  {
    name: '...divProps',
    type: 'React.HTMLAttributes<HTMLDivElement>',
    default: '—',
    description: 'The remaining div attributes are spread onto the root element.',
  },
];

interface SlotDoc {
  name: string;
  description: string;
}

const SLOTS: SlotDoc[] = [
  {
    name: 'root',
    description:
      'The animated container. It owns the anchor-edge alignment, the animated main-axis extent and the single drop-shadow filter. It forwards ref, which a ClickAwayListener needs.',
  },
  {
    name: 'item',
    description:
      'One masked wrapper per child, shaped by variant. slotProps.item accepts either a props object or a callback (ownerState) => props — the per-child escape hatch. Switch on ownerState.index or ownerState.isAnchor to treat the anchor differently from the rest.',
  },
];

interface FieldDoc {
  name: string;
  type: string;
  description: string;
}

const OWNER_STATE: FieldDoc[] = [
  { name: 'open', type: 'boolean', description: 'Whether the group is currently expanded.' },
  { name: 'direction', type: "'left' | 'right' | 'up' | 'down'", description: 'The resolved fan-out direction.' },
  { name: 'trigger', type: "'hover' | 'click' | 'manual'", description: 'The resolved pointer trigger mode.' },
  { name: 'size', type: 'number', description: 'The button diameter in pixels, after resolving the named size.' },
  { name: 'variant', type: "'circular' | 'rounded' | 'square'", description: 'The resolved shape of every button.' },
  {
    name: 'cornerRadius',
    type: 'number | string',
    description: 'The corner radius resolved from variant, applied to every item wrapper and inherited by its child.',
  },
  { name: 'gap', type: 'number', description: 'The main-axis gap in pixels.' },
  { name: 'fadeWidth', type: 'number', description: 'The fade width in pixels.' },
  { name: 'count', type: 'number', description: 'The number of valid children currently rendered.' },
  { name: 'transitionDuration', type: 'number', description: 'The morph duration in milliseconds.' },
  { name: 'transitionEasing', type: 'string', description: 'The morph easing.' },
];

const ITEM_OWNER_STATE: FieldDoc[] = [
  { name: 'index', type: 'number', description: 'The position of the child in the stack. 0 is the anchor.' },
  { name: 'isAnchor', type: 'boolean', description: 'True for the anchor child (index 0).' },
  {
    name: 'geometry',
    type: 'CollageFabItemGeometry',
    description: 'The computed translate, mask image, mask size and mask position for this slice.',
  },
];

interface DirectionDoc {
  name: string;
  edge: string;
  axis: string;
  expand: string;
}

const DIRECTIONS: DirectionDoc[] = [
  { name: "'left'", edge: 'Right edge', axis: 'Horizontal', expand: 'Leftward (negative X)' },
  { name: "'right'", edge: 'Left edge', axis: 'Horizontal', expand: 'Rightward (positive X)' },
  { name: "'up'", edge: 'Bottom edge', axis: 'Vertical', expand: 'Upward (negative Y)' },
  { name: "'down'", edge: 'Top edge', axis: 'Vertical', expand: 'Downward (positive Y)' },
];

const BEHAVIOR_NOTES = [
  "With trigger=\"hover\", the group opens on mouse enter and closes on mouse leave; on touch and pen it toggles on tap.",
  "With trigger=\"click\", the group toggles on any click, regardless of pointer type.",
  "With trigger=\"manual\", all built-in pointer interaction is disabled — drive it through the open prop instead.",
  "Controlled (open) and uncontrolled (defaultOpen) modes are supported; onOpen and onClose fire on every transition.",
  'Clicking away closes the group unless disableClickAway is set. No click-away listener is attached in manual mode.',
  'Escape collapses the group.',
  'Keyboard: while collapsed the root is focusable; Enter or Space opens it and moves focus to the first item; Escape collapses it and returns focus to the root.',
  'While collapsed, the item wrappers are aria-hidden and made non-focusable, so the collapsed slices leave both the tab order and the accessibility tree.',
  "Every child is forced to box-shadow: none, 100% size and the wrapper's corner radius, so the root owns the single silhouette and drop shadow.",
];

const USAGE_EXAMPLE = `import { Fab } from '@mui/material';
import { CollageFab } from './components/CollageFab';

export function Toolbar() {
  return (
    <CollageFab
      direction="left"
      trigger="click"
      gap={14}
      slotProps={{
        item: (ownerState) => ({
          style: { opacity: ownerState.isAnchor ? 1 : 0.85 },
        }),
      }}
    >
      {/* index 0 is the anchor; the rest fan out to the left */}
      <Fab color="primary" aria-label="settings">
        <SettingsIcon />
      </Fab>
      <Fab color="secondary" aria-label="share">
        <ShareIcon />
      </Fab>
      <Fab color="success" aria-label="save">
        <SaveIcon />
      </Fab>
    </CollageFab>
  );
}`;

const CONTROLLED_EXAMPLE = `import * as React from 'react';
import { Button, Fab } from '@mui/material';
import { CollageFab } from './components/CollageFab';

export function ControlledToolbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen((value) => !value)}>
        Toggle
      </Button>
      <CollageFab
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Fab color="primary" aria-label="settings">
          <SettingsIcon />
        </Fab>
        <Fab color="secondary" aria-label="share">
          <ShareIcon />
        </Fab>
      </CollageFab>
    </>
  );
}`;

const mono = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

const codeBlockSx = {
  ...mono,
  m: 0,
  p: 3,
  borderRadius: 2,
  bgcolor: '#141414',
  border: '1px solid',
  borderColor: 'divider',
  overflowX: 'auto',
  fontSize: 13.5,
  lineHeight: 1.7,
  color: 'grey.300',
} as const;

type CellVariant = 'name' | 'mono' | 'text';

interface DocColumn {
  key: string;
  label: string;
  variant: CellVariant;
  width?: number;
}

interface DocRow {
  key: string;
  cells: Record<string, ReactNode>;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h5" fontWeight="bold" color="white" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

function DocTable({ columns, rows, minWidth = 640 }: { columns: DocColumn[]; rows: DocRow[]; minWidth?: number }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 6 }}>
      <Table size="small" sx={{ minWidth }}>
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#181818', borderBottomColor: 'divider' } }}>
            {columns.map((column) => (
              <TableCell key={column.key} sx={{ ...mono, color: 'grey.400', width: column.width }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key} sx={{ '& td': { borderBottomColor: 'divider', verticalAlign: 'top' } }}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={
                    column.variant === 'name'
                      ? { ...mono, color: 'primary.light' }
                      : column.variant === 'mono'
                        ? { ...mono, color: 'grey.400' }
                        : { color: 'grey.300' }
                  }
                >
                  {row.cells[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const propColumns: DocColumn[] = [
  { key: 'name', label: 'Name', variant: 'name', width: 150 },
  { key: 'type', label: 'Type', variant: 'mono', width: 210 },
  { key: 'default', label: 'Default', variant: 'mono', width: 110 },
  { key: 'description', label: 'Description', variant: 'text' },
];

const fieldColumns: DocColumn[] = [
  { key: 'name', label: 'Field', variant: 'name', width: 200 },
  { key: 'type', label: 'Type', variant: 'mono', width: 220 },
  { key: 'description', label: 'Description', variant: 'text' },
];

const slotColumns: DocColumn[] = [
  { key: 'name', label: 'Slot', variant: 'name', width: 120 },
  { key: 'description', label: 'Description', variant: 'text' },
];

const directionColumns: DocColumn[] = [
  { key: 'name', label: 'Direction', variant: 'name', width: 120 },
  { key: 'edge', label: 'Pinned edge', variant: 'text', width: 150 },
  { key: 'axis', label: 'Axis', variant: 'mono', width: 130 },
  { key: 'expand', label: 'Expands', variant: 'text' },
];

const propRows: DocRow[] = PROPS.map((prop) => ({
  key: prop.name,
  cells: {
    name: prop.name,
    type: prop.type,
    default: prop.default,
    description: prop.description,
  },
}));

const slotRows: DocRow[] = SLOTS.map((slot) => ({
  key: slot.name,
  cells: { name: slot.name, description: slot.description },
}));

const ownerStateRows: DocRow[] = OWNER_STATE.map((field) => ({
  key: field.name,
  cells: { name: field.name, type: field.type, description: field.description },
}));

const itemOwnerStateRows: DocRow[] = ITEM_OWNER_STATE.map((field) => ({
  key: field.name,
  cells: { name: field.name, type: field.type, description: field.description },
}));

const directionRows: DocRow[] = DIRECTIONS.map((entry) => ({
  key: entry.name,
  cells: { name: entry.name, edge: entry.edge, axis: entry.axis, expand: entry.expand },
}));

export function ApiPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight="900" gutterBottom align="center" color="white">
        Components API
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" align="center" mb={8} sx={{ maxWidth: 700, mx: 'auto' }}>
        Reference for the exported <strong>CollageFab</strong> component (v2): its props, slots, ownerState and runtime
        behavior.
      </Typography>

      <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
        CollageFab
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 1 }}>
        A floating action button that stacks several children into a single shape and unfolds them along a configurable
        direction on interaction. The root animates its own main-axis extent and applies one shared drop shadow, while
        each child is clipped by a moving gradient mask.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5 }}>
        Import it from <Box component="span" sx={{ ...mono, color: 'grey.300' }}>./components/CollageFab</Box>.
      </Typography>

      <Divider sx={{ mb: 5 }} />

      <SectionHeading>Props</SectionHeading>
      <DocTable columns={propColumns} rows={propRows} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 6 }}>
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>variant</Box> covers the three common shapes. For any
        other corner radius, override the item wrapper through{' '}
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>slotProps.item.sx</Box> — for example{' '}
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>{'{ borderRadius: 8 }'}</Box>. There is no separate
        radius prop, and every child inherits the wrapper radius, so the whole stack keeps a single silhouette.
      </Typography>

      <SectionHeading>Slots</SectionHeading>
      <DocTable columns={slotColumns} rows={slotRows} minWidth={520} />

      <SectionHeading>ownerState</SectionHeading>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>CollageFabOwnerState</Box> is passed to the root slot
        and to every slotProps resolver.
      </Typography>
      <DocTable columns={fieldColumns} rows={ownerStateRows} minWidth={620} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>CollageFabItemOwnerState</Box> extends it for the item
        slot:
      </Typography>
      <DocTable columns={fieldColumns} rows={itemOwnerStateRows} minWidth={620} />

      <SectionHeading>Direction</SectionHeading>
      <DocTable columns={directionColumns} rows={directionRows} minWidth={560} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 1.5 }}>
        The default is <Box component="span" sx={{ ...mono, color: 'grey.300' }}>'left'</Box> because it matches the
        original right-anchored behaviour — the group grows leftward from its anchor. This surprises people who assume
        rightward expansion.
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 6 }}>
        The gradient keyword stays <Box component="span" sx={{ ...mono, color: 'grey.300' }}>to right</Box> for the
        horizontal directions and <Box component="span" sx={{ ...mono, color: 'grey.300' }}>to bottom</Box> for the
        vertical ones in all four cases; only the order of the color stops flips.
      </Typography>

      <SectionHeading>Behavior</SectionHeading>
      <Box component="ul" sx={{ pl: 3, mb: 6, maxWidth: 780 }}>
        {BEHAVIOR_NOTES.map((note) => (
          <Typography
            key={note}
            component="li"
            color="grey.300"
            sx={{ mb: 1.5, pl: 0.5, '&::marker': { color: 'grey.600' } }}
          >
            {note}
          </Typography>
        ))}
      </Box>

      <SectionHeading>Caveat</SectionHeading>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: '3px solid',
          borderLeftColor: 'warning.main',
          borderRadius: 2,
          bgcolor: '#141414',
          p: 3,
          mb: 6,
          maxWidth: 780,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" color="warning.light" sx={{ mb: 1 }}>
          Pin the anchor edge in the parent
        </Typography>
        <Typography color="grey.300" sx={{ mb: 2 }}>
          The root animates its own main-axis extent from a single button to the full row. If the parent lets it sit at
          the start of the axis, the group grows in place instead of fanning out. Pin the anchor edge in the parent:
        </Typography>
        <Box component="ul" sx={{ pl: 3, m: 0 }}>
          {[
            { css: 'justify-content: flex-end', dir: "direction=\"left\"" },
            { css: 'justify-content: flex-start', dir: "direction=\"right\"" },
            { css: 'align-items: flex-end', dir: "direction=\"up\"" },
            { css: 'align-items: flex-start', dir: "direction=\"down\"" },
          ].map((item) => (
            <Typography
              key={item.css}
              component="li"
              color="grey.300"
              sx={{ mb: 1, pl: 0.5, '&::marker': { color: 'grey.600' } }}
            >
              <Box component="span" sx={{ ...mono, color: 'grey.300' }}>{item.css}</Box> for{' '}
              <Box component="span" sx={{ ...mono, color: 'primary.light' }}>{item.dir}</Box>.
            </Typography>
          ))}
        </Box>
      </Box>

      <SectionHeading>Usage</SectionHeading>
      <Box component="pre" sx={{ ...codeBlockSx, mb: 6 }}>
        <code>{USAGE_EXAMPLE}</code>
      </Box>

      <SectionHeading>Controlled usage</SectionHeading>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        Pass <Box component="span" sx={{ ...mono, color: 'grey.300' }}>open</Box> to own the state. The internal
        transitions still fire <Box component="span" sx={{ ...mono, color: 'grey.300' }}>onOpen</Box> and{' '}
        <Box component="span" sx={{ ...mono, color: 'grey.300' }}>onClose</Box> so the parent stays in sync.
      </Typography>
      <Box component="pre" sx={codeBlockSx}>
        <code>{CONTROLLED_EXAMPLE}</code>
      </Box>
    </Container>
  );
}
