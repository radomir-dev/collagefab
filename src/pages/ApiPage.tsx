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
import docs from 'virtual:api-docs';
import type {
  CollageFabDirection,
  CollageFabTrigger,
  CollageFabVariant,
} from '../components/CollageFab';
import basicUsage from './examples/basic-usage.tsx?raw';
import controlledUsage from './examples/controlled-usage.tsx?raw';

const DIRECTIONS: Record<CollageFabDirection, { edge: string; axis: string; expand: string }> = {
  left: { edge: 'Right edge', axis: 'Horizontal', expand: 'Leftward (negative X)' },
  right: { edge: 'Left edge', axis: 'Horizontal', expand: 'Rightward (positive X)' },
  up: { edge: 'Bottom edge', axis: 'Vertical', expand: 'Upward (negative Y)' },
  down: { edge: 'Top edge', axis: 'Vertical', expand: 'Downward (positive Y)' },
};

const VARIANTS: Record<CollageFabVariant, string> = {
  circular: 'Clips each slice to a circle.',
  rounded: 'Clips each slice to a rounded square; the 25% corner radius scales with size.',
  square: 'Clips each slice to a sharp-cornered square.',
};

const TRIGGERS: Record<CollageFabTrigger, string> = {
  hover: 'Opens on mouse enter, closes on mouse leave and toggles on touch or pen tap.',
  click: 'Toggles on any click, regardless of pointer type.',
  manual: 'Disables all built-in pointer interaction — drive the group through open instead.',
};

const BEHAVIOR_NOTES = [
  'Controlled (open) and uncontrolled (defaultOpen) modes are supported; onOpen and onClose fire on every transition.',
  'Clicking away closes the group unless disableClickAway is set. No click-away listener is attached in manual mode.',
  'Escape collapses the group.',
  'Keyboard: while collapsed the root is focusable; Enter or Space opens it and moves focus to the first item; Escape collapses it and returns focus to the root.',
  'While collapsed, the item wrappers are aria-hidden and made non-focusable, so the collapsed slices leave both the tab order and the accessibility tree.',
  "Every child is forced to box-shadow: none, 100% size and the wrapper's corner radius, so the root owns the single silhouette and drop shadow.",
  'With a single child no mask is applied, and the component behaves like a plain Fab.',
  'direction is physical, not logical: it is not mirrored under RTL.',
];

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

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <Box component="code" sx={{ ...mono, fontSize: '0.92em', color: 'grey.300' }}>
      {children}
    </Box>
  );
}

function DocText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, index) =>
        part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
          <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Typography variant="h5" fontWeight="bold" color="white" sx={{ mb: 2 }}>
      {children}
    </Typography>
  );
}

function DocTable({
  columns,
  rows,
  minWidth = 640,
}: {
  columns: DocColumn[];
  rows: DocRow[];
  minWidth?: number;
}) {
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

const valueColumns: DocColumn[] = [
  { key: 'name', label: 'Value', variant: 'name', width: 150 },
  { key: 'description', label: 'Meaning', variant: 'text' },
];

const propRows: DocRow[] = [
  ...docs.props.map((prop) => ({
    key: prop.name,
    cells: {
      name: prop.name,
      type: prop.type,
      default: prop.default,
      description: <DocText text={prop.description} />,
    },
  })),
  ...(docs.restProps
    ? [
        {
          key: '...divProps',
          cells: {
            name: '...divProps',
            type: docs.restProps,
            default: '—',
            description: 'The remaining div attributes are spread onto the root element.',
          },
        },
      ]
    : []),
];

const slotRows: DocRow[] = docs.slots.map((slot) => ({
  key: slot.name,
  cells: { name: slot.name, description: <DocText text={slot.description} /> },
}));

const ownerStateRows: DocRow[] = docs.ownerState.map((field) => ({
  key: field.name,
  cells: { name: field.name, type: field.type, description: <DocText text={field.description} /> },
}));

const itemOwnerStateRows: DocRow[] = docs.itemOwnerState.map((field) => ({
  key: field.name,
  cells: { name: field.name, type: field.type, description: <DocText text={field.description} /> },
}));

const geometryRows: DocRow[] = docs.geometry.map((field) => ({
  key: field.name,
  cells: { name: field.name, type: field.type, description: <DocText text={field.description} /> },
}));

const directionRows: DocRow[] = docs.unions.direction.map((direction) => {
  const details = DIRECTIONS[direction];
  return {
    key: direction,
    cells: {
      name: `'${direction}'`,
      edge: details.edge,
      axis: details.axis,
      expand: details.expand,
    },
  };
});

const variantRows: DocRow[] = docs.unions.variant.map((variant) => ({
  key: variant,
  cells: {
    name: `'${variant}'`,
    description: VARIANTS[variant],
  },
}));

const triggerRows: DocRow[] = docs.unions.trigger.map((trigger) => ({
  key: trigger,
  cells: {
    name: `'${trigger}'`,
    description: TRIGGERS[trigger],
  },
}));

export function ApiPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight="900" gutterBottom align="center" color="white">
        Components API
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" align="center" mb={8} sx={{ maxWidth: 700, mx: 'auto' }}>
        Reference for the exported <strong>CollageFab</strong> component: its props, slots, ownerState and runtime
        behavior.
      </Typography>

      <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
        CollageFab
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 1 }}>
        <DocText text={docs.summary} />
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 5 }}>
        This page is generated from the component&apos;s TypeScript source and TSDoc while this site builds. Install the
        package, then import it from <InlineCode>mui-collage-fab</InlineCode>.
      </Typography>

      <Divider sx={{ mb: 5 }} />

      <SectionHeading>Props</SectionHeading>
      <DocTable columns={propColumns} rows={propRows} />

      <SectionHeading>variant</SectionHeading>
      <DocTable columns={valueColumns} rows={variantRows} minWidth={520} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 6 }}>
        <InlineCode>variant</InlineCode> covers the three common shapes. For any other corner radius, override the item
        wrapper through <InlineCode>slotProps.item.sx</InlineCode> — for example{' '}
        <InlineCode>{'{ borderRadius: 8 }'}</InlineCode>. There is no separate radius prop, and every child inherits the
        wrapper radius, so the whole stack keeps a single silhouette.
      </Typography>

      <SectionHeading>Slots</SectionHeading>
      <DocTable columns={slotColumns} rows={slotRows} minWidth={520} />

      <SectionHeading>ownerState</SectionHeading>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        <InlineCode>CollageFabOwnerState</InlineCode> is passed to the root slot and to every slotProps resolver.
      </Typography>
      <DocTable columns={fieldColumns} rows={ownerStateRows} minWidth={620} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        <InlineCode>CollageFabItemOwnerState</InlineCode> extends it for the item slot:
      </Typography>
      <DocTable columns={fieldColumns} rows={itemOwnerStateRows} minWidth={620} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        Its <InlineCode>geometry</InlineCode> field carries the computed slice:
      </Typography>
      <DocTable columns={fieldColumns} rows={geometryRows} minWidth={620} />

      <SectionHeading>Direction</SectionHeading>
      <DocTable columns={directionColumns} rows={directionRows} minWidth={560} />
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 1.5 }}>
        The default is <InlineCode>'left'</InlineCode> because it matches the original right-anchored behaviour — the
        group grows leftward from its anchor. This surprises people who assume rightward expansion.
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 6 }}>
        The gradient keyword stays <InlineCode>to right</InlineCode> for the horizontal directions and{' '}
        <InlineCode>to bottom</InlineCode> for the vertical ones in all four cases; only the order of the color stops
        flips.
      </Typography>

      <SectionHeading>Trigger</SectionHeading>
      <DocTable columns={valueColumns} rows={triggerRows} minWidth={520} />

      <SectionHeading>Behavior</SectionHeading>
      <Box component="ul" sx={{ pl: 3, mb: 6, maxWidth: 780 }}>
        {BEHAVIOR_NOTES.map((note) => (
          <Typography
            key={note}
            component="li"
            color="grey.300"
            sx={{ mb: 1.5, pl: 0.5, '&::marker': { color: 'grey.600' } }}
          >
            <DocText text={note} />
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
              <InlineCode>{item.css}</InlineCode> for <InlineCode>{item.dir}</InlineCode>.
            </Typography>
          ))}
        </Box>
      </Box>

      <SectionHeading>Usage</SectionHeading>
      <Box component="pre" sx={{ ...codeBlockSx, mb: 6 }}>
        <code>{basicUsage}</code>
      </Box>

      <SectionHeading>Controlled usage</SectionHeading>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 2 }}>
        Pass <InlineCode>open</InlineCode> to own the state. The internal transitions still fire{' '}
        <InlineCode>onOpen</InlineCode> and <InlineCode>onClose</InlineCode> so the parent stays in sync.
      </Typography>
      <Box component="pre" sx={codeBlockSx}>
        <code>{controlledUsage}</code>
      </Box>
    </Container>
  );
}
