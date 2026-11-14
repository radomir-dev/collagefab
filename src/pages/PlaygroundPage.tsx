import * as React from 'react';
import {
  Box,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Api,
  BugReport,
  Check,
  Code,
  ContentCopy,
  Palette,
  Settings,
  Speed,
  Terminal,
} from '@mui/icons-material';
import {
  CollageFab,
  type CollageFabDirection,
  type CollageFabTrigger,
  type CollageFabVariant,
} from '../components/CollageFab';

type NamedSize = 'small' | 'medium' | 'large';

const MOCK_TOOLS = [
  { icon: <Settings />, color: '#1976d2', name: 'Settings' },
  { icon: <BugReport />, color: '#9c27b0', name: 'Debugger' },
  { icon: <Speed />, color: '#ed6c02', name: 'Performance' },
  { icon: <Code />, color: '#2e7d32', name: 'Source' },
  { icon: <Palette />, color: '#e91e63', name: 'Theme' },
  { icon: <Api />, color: '#0288d1', name: 'Network' },
  { icon: <Terminal />, color: '#4caf50', name: 'Console' },
];

const SIZE_PX: Record<NamedSize, number> = {
  small: 40,
  medium: 48,
  large: 56,
};

const EASINGS: Array<{ value: string; label: string }> = [
  { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'standard' },
  { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'overshoot' },
  { value: 'ease-in-out', label: 'ease-in-out' },
  { value: 'ease-out', label: 'ease-out' },
  { value: 'linear', label: 'linear' },
];

const mono = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

const codeBlockSx = {
  ...mono,
  m: 0,
  p: 2.5,
  borderRadius: 2,
  bgcolor: '#141414',
  border: '1px solid',
  borderColor: 'divider',
  overflowX: 'auto',
  fontSize: 12,
  lineHeight: 1.6,
  color: 'grey.300',
  whiteSpace: 'pre',
  flexGrow: 1,
  maxHeight: 300,
  overflowY: 'auto',
} as const;

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="overline" sx={{ color: 'grey.500', letterSpacing: 1.2, lineHeight: 1.4 }}>
      {children}
    </Typography>
  );
}

function ControlRow({
  label,
  value,
  children,
}: {
  label: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}
      >
        <Typography variant="body2" fontWeight={600} color="grey.200">
          {label}
        </Typography>
        <Typography variant="caption" sx={{ ...mono, color: 'primary.light' }}>
          {value}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function buildSnippet(config: {
  variant: CollageFabVariant;
  direction: CollageFabDirection;
  size: NamedSize;
  gap: number;
  fadeWidth: number;
  transitionDuration: number;
  transitionEasing: string;
  trigger: CollageFabTrigger;
  open: boolean;
  count: number;
}): string {
  const {
    variant,
    direction,
    size,
    gap,
    fadeWidth,
    transitionDuration,
    transitionEasing,
    trigger,
    open,
    count,
  } = config;

  const lines = [
    '<CollageFab',
    `  variant="${variant}"`,
    `  direction="${direction}"`,
    `  size="${size}"`,
    `  gap={${gap}}`,
    `  fadeWidth={${fadeWidth}}`,
    `  trigger="${trigger}"`,
  ];
  if (trigger === 'manual') {
    lines.push(`  open={${open}}`);
  }
  lines.push(
    `  transitionDuration={${transitionDuration}}`,
    `  transitionEasing="${transitionEasing}"`,
    '>',
    `  {/* ${count} button${count === 1 ? '' : 's'} */}`,
    '</CollageFab>',
  );
  return lines.join('\n');
}

export function PlaygroundPage() {
  const [variant, setVariant] = React.useState<CollageFabVariant>('circular');
  const [direction, setDirection] = React.useState<CollageFabDirection>('left');
  const [size, setSize] = React.useState<NamedSize>('large');
  const [gap, setGap] = React.useState(16);
  const [fadeWidth, setFadeWidth] = React.useState(12);
  const [transitionDuration, setTransitionDuration] = React.useState(400);
  const [transitionEasing, setTransitionEasing] = React.useState(EASINGS[0].value);
  const [trigger, setTrigger] = React.useState<CollageFabTrigger>('hover');
  const [count, setCount] = React.useState(4);
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const sizePx = SIZE_PX[size];
  const horizontal = direction === 'left' || direction === 'right';
  const expandedExtent = count * sizePx + Math.max(count - 1, 0) * gap;

  const snippet = React.useMemo(
    () =>
      buildSnippet({
        variant,
        direction,
        size,
        gap,
        fadeWidth,
        transitionDuration,
        transitionEasing,
        trigger,
        open,
        count,
      }),
    [
      variant,
      direction,
      size,
      gap,
      fadeWidth,
      transitionDuration,
      transitionEasing,
      trigger,
      open,
      count,
    ],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the snippet stays selectable by hand.
    }
  };

  const manual = trigger === 'manual';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight="900" align="center" color="white">
        Playground
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        align="center"
        mb={1}
        sx={{ maxWidth: 700, mx: 'auto' }}
      >
        Tune every prop of <strong>CollageFab</strong> and watch the stack respond live.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={7}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#151515',
                backgroundImage: 'radial-gradient(circle at 50% 0%, #1f1f1f 0%, #151515 70%)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="grey.300">
                  Preview
                </Typography>
                <Typography variant="caption" sx={{ ...mono, color: 'grey.600' }}>
                  {count} × {sizePx}px + {Math.max(count - 1, 0)} × {gap}px = {expandedExtent}px
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 320,
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: '#101010',
                  p: 3,
                  overflow: 'visible',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: horizontal ? 'row' : 'column',
                    justifyContent:
                      direction === 'left' || direction === 'up' ? 'flex-end' : 'flex-start',
                    alignItems: 'center',
                    width: horizontal ? expandedExtent : sizePx,
                    height: horizontal ? sizePx : expandedExtent,
                    overflow: 'visible',
                  }}
                >
                  <CollageFab
                    variant={variant}
                    direction={direction}
                    size={size}
                    gap={gap}
                    fadeWidth={fadeWidth}
                    trigger={trigger}
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    transitionDuration={transitionDuration}
                    transitionEasing={transitionEasing}
                    aria-label="CollageFab playground preview"
                  >
                    {MOCK_TOOLS.slice(0, count).map((tool) => (
                      <Fab
                        key={tool.name}
                        aria-label={tool.name}
                        sx={{
                          bgcolor: tool.color,
                          color: 'white',
                          '&:hover': { bgcolor: tool.color, filter: 'brightness(1.2)' },
                        }}
                      >
                        {tool.icon}
                      </Fab>
                    ))}
                  </CollageFab>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                {trigger === 'manual'
                  ? 'Manual trigger — use the Open switch to expand the group.'
                  : `Trigger: ${trigger} — interact with the group directly in the preview.`}
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#181818',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="grey.300">
                  JSX
                </Typography>
                <Tooltip title={copied ? 'Copied' : 'Copy'}>
                  <IconButton size="small" onClick={() => void handleCopy()} aria-label="Copy JSX">
                    {copied ? (
                      <Check fontSize="small" color="success" />
                    ) : (
                      <ContentCopy fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box tabIndex={0} component="pre" sx={codeBlockSx}>
                <code>{snippet}</code>
              </Box>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(145deg, #232323 0%, #1a1a1a 100%)',
              height: '100%',
            }}
          >
            <Stack spacing={1.5} divider={<Divider flexItem />}>
              <Box>
                <GroupHeading>Shape</GroupHeading>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  <ControlRow label="Variant" value={variant}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={variant}
                      onChange={(_event, next: CollageFabVariant | null) => {
                        if (next) setVariant(next);
                      }}
                    >
                      <ToggleButton value="circular">Circular</ToggleButton>
                      <ToggleButton value="rounded">Rounded</ToggleButton>
                      <ToggleButton value="square">Square</ToggleButton>
                    </ToggleButtonGroup>
                  </ControlRow>

                  <ControlRow label="Size" value={`${size} · ${sizePx}px`}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={size}
                      onChange={(_event, next: NamedSize | null) => {
                        if (next) setSize(next);
                      }}
                    >
                      <ToggleButton value="small">Small</ToggleButton>
                      <ToggleButton value="medium">Medium</ToggleButton>
                      <ToggleButton value="large">Large</ToggleButton>
                    </ToggleButtonGroup>
                  </ControlRow>

                  <ControlRow label="Gap" value={`${gap}px`}>
                    <Slider
                      min={0}
                      max={40}
                      step={1}
                      value={gap}
                      valueLabelDisplay="auto"
                      slotProps={{ input: { 'aria-label': 'Gap' } }}
                      onChange={(_event, value) => setGap(value as number)}
                    />
                  </ControlRow>

                  <ControlRow label="Fade width" value={`${fadeWidth}px`}>
                    <Slider
                      min={0}
                      max={40}
                      step={1}
                      value={fadeWidth}
                      valueLabelDisplay="auto"
                      slotProps={{ input: { 'aria-label': 'Fade width' } }}
                      onChange={(_event, value) => setFadeWidth(value as number)}
                    />
                  </ControlRow>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                    Edge softness of the cut between slices. At 0 the cut is hard.
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <GroupHeading>Layout &amp; motion</GroupHeading>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  <ControlRow label="Direction" value={direction}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={direction}
                      onChange={(_event, next: CollageFabDirection | null) => {
                        if (next) setDirection(next);
                      }}
                    >
                      <ToggleButton value="left">Left</ToggleButton>
                      <ToggleButton value="right">Right</ToggleButton>
                      <ToggleButton value="up">Up</ToggleButton>
                      <ToggleButton value="down">Down</ToggleButton>
                    </ToggleButtonGroup>
                  </ControlRow>

                  <ControlRow label="Buttons" value={`${count}`}>
                    <Slider
                      min={1}
                      max={7}
                      step={1}
                      value={count}
                      valueLabelDisplay="auto"
                      slotProps={{ input: { 'aria-label': 'Buttons' } }}
                      onChange={(_event, value) => setCount(value as number)}
                    />
                  </ControlRow>

                  <ControlRow label="Duration" value={`${transitionDuration}ms`}>
                    <Slider
                      min={0}
                      max={2000}
                      step={50}
                      value={transitionDuration}
                      valueLabelDisplay="auto"
                      slotProps={{ input: { 'aria-label': 'Duration' } }}
                      onChange={(_event, value) => setTransitionDuration(value as number)}
                    />
                  </ControlRow>

                  <ControlRow label="Easing" value={transitionEasing}>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={transitionEasing}
                      onChange={(event) => setTransitionEasing(event.target.value)}
                      inputProps={{ 'aria-label': 'Easing' }}
                      SelectProps={{ sx: { ...mono, fontSize: 13 } }}
                    >
                      {EASINGS.map((easing) => (
                        <MenuItem
                          key={easing.value}
                          value={easing.value}
                          sx={{ ...mono, fontSize: 13 }}
                        >
                          {easing.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </ControlRow>
                </Stack>
              </Box>

              <Box>
                <GroupHeading>Interaction</GroupHeading>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  <ControlRow label="Trigger" value={trigger}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={trigger}
                      onChange={(_event, next: CollageFabTrigger | null) => {
                        if (next) setTrigger(next);
                      }}
                    >
                      <ToggleButton value="hover">Hover</ToggleButton>
                      <ToggleButton value="click">Click</ToggleButton>
                      <ToggleButton value="manual">Manual</ToggleButton>
                    </ToggleButtonGroup>
                  </ControlRow>

                  {manual && (
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} color="grey.200">
                          Open
                        </Typography>
                        <Switch
                          checked={open}
                          onChange={(event) => setOpen(event.target.checked)}
                          inputProps={{ 'aria-label': 'Open' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Drives the controlled open prop.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
