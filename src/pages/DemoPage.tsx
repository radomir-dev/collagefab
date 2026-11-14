import * as React from 'react';
import { Box, Container, Fab, Grid, Paper, Typography } from '@mui/material';
import {
  Settings,
  BugReport,
  Speed,
  Code,
  Palette,
  Api,
  Terminal,
} from '@mui/icons-material';
import { CollageFab, type CollageFabDirection } from '../components/CollageFab';

const MOCK_TOOLS = [
  { icon: <Settings />, color: '#1976d2', name: 'Settings' },
  { icon: <BugReport />, color: '#9c27b0', name: 'Debugger' },
  { icon: <Speed />, color: '#ed6c02', name: 'Performance' },
  { icon: <Code />, color: '#2e7d32', name: 'Source' },
  { icon: <Palette />, color: '#e91e63', name: 'Theme' },
  { icon: <Api />, color: '#0288d1', name: 'Network' },
  { icon: <Terminal />, color: '#4caf50', name: 'Console' },
];

const BUTTON_MIN = 24;
const BUTTON_MAX = 56;
const GAP_MIN = 6;
const GAP_MAX = 14;
const GAP_RATIO = 0.25;
const CARD_MIN_HEIGHT = 200;
const DIRECTION_BUTTON_COUNT = 4;
const DIRECTION_SIZE = 56;
const DIRECTION_GAP = 14;
const DIRECTION_EXTENT =
  DIRECTION_BUTTON_COUNT * DIRECTION_SIZE + (DIRECTION_BUTTON_COUNT - 1) * DIRECTION_GAP;
const VERTICAL_CARD_MAX_WIDTH = 320;

interface RowFit {
  size: number;
  gap: number;
  extent: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Largest button diameter that keeps `count` buttons on one line inside
 * `available` px. The gap shrinks with the diameter, so a dense row on a narrow
 * card tightens up instead of spilling past the card edge.
 */
function fitRow(count: number, available: number): RowFit {
  const spans = Math.max(count - 1, 0);
  let size = BUTTON_MAX;
  let gap = GAP_MAX;
  if (available > 0) {
    for (let pass = 0; pass < 6; pass += 1) {
      size = clamp(Math.floor((available - spans * gap) / count), BUTTON_MIN, BUTTON_MAX);
      const nextGap = clamp(Math.round(size * GAP_RATIO), GAP_MIN, GAP_MAX);
      if (nextGap === gap) {
        break;
      }
      gap = nextGap;
    }
  }
  return { size, gap, extent: count * size + spans * gap };
}

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const update = () => setWidth(node.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const CARD_SX = {
  p: 4,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  background: 'linear-gradient(145deg, #232323 0%, #1a1a1a 100%)',
} as const;

function CardHeading({ title, caption }: { title: string; caption?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography variant="h6" fontWeight="bold" color="grey.300">
        {title}
      </Typography>
      {caption && (
        <Typography variant="caption" sx={{ color: 'grey.600', maxWidth: 100, textAlign: 'right' }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
}

function CountCard({ count }: { count: number }) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>();
  const { size, gap } = fitRow(count, width);

  return (
    <Paper elevation={3} sx={{ ...CARD_SX, minHeight: CARD_MIN_HEIGHT }}>
      <CardHeading title={`${count} Button${count > 1 ? 's' : ''}`} />

      {/* Full-width stage: it is the measured box the row has to fit into, and it
          centers the stack. The bottom padding mirrors the heading so the stack
          lands on the card's centreline instead of sinking into the lower half. */}
      <Box
        ref={ref}
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          pb: 4,
        }}
      >
        <CollageFab size={size} gap={gap} fadeWidth={12}>
          {MOCK_TOOLS.slice(0, count).map((tool, idx) => (
            <Fab
              key={idx}
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
    </Paper>
  );
}

interface DirectionDemo {
  value: CollageFabDirection;
  caption: string;
  horizontal: boolean;
  justifyContent: 'flex-start' | 'flex-end';
}

const DIRECTION_DEMOS: DirectionDemo[] = [
  { value: 'left', caption: 'Pins right, fans left', horizontal: true, justifyContent: 'flex-end' },
  { value: 'right', caption: 'Pins left, fans right', horizontal: true, justifyContent: 'flex-start' },
  { value: 'up', caption: 'Pins bottom, fans up', horizontal: false, justifyContent: 'flex-end' },
  { value: 'down', caption: 'Pins top, fans down', horizontal: false, justifyContent: 'flex-start' },
];

// Two axes, two shapes: horizontal demos get wide short cards in the left
// column, vertical demos get narrow tall cards side by side in the right one.
const HORIZONTAL_DEMOS = DIRECTION_DEMOS.filter((demo) => demo.horizontal);
const VERTICAL_DEMOS = DIRECTION_DEMOS.filter((demo) => !demo.horizontal);

function DirectionCard({ demo, fill }: { demo: DirectionDemo; fill?: boolean }) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>();
  const fitted = fitRow(DIRECTION_BUTTON_COUNT, width);
  const size = demo.horizontal ? fitted.size : DIRECTION_SIZE;
  const gap = demo.horizontal ? fitted.gap : DIRECTION_GAP;

  return (
    <Paper elevation={3} sx={{ ...CARD_SX, ...(fill ? { height: '100%' } : {}) }}>
      <CardHeading title={demo.value} caption={demo.caption} />

      {/* The stage reserves exactly the fan's main-axis extent, so hovering never
          resizes the card: one button plus insets for the horizontal fans, the
          full 4-button run for the vertical ones. */}
      <Box
        ref={ref}
        sx={{
          width: '100%',
          height: demo.horizontal ? size + 32 : undefined,
          minHeight: demo.horizontal ? undefined : DIRECTION_EXTENT,
          flexGrow: fill ? 1 : 0,
          mt: 2,
          display: 'flex',
          flexDirection: demo.horizontal ? 'row' : 'column',
          justifyContent: demo.justifyContent,
          alignItems: 'center',
        }}
      >
        <CollageFab direction={demo.value} size={size} gap={gap} fadeWidth={12}>
          {MOCK_TOOLS.slice(0, DIRECTION_BUTTON_COUNT).map((tool, idx) => (
            <Fab
              key={idx}
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
    </Paper>
  );
}

function DirectionGroup({
  label,
  demos,
  inline,
  width,
}: {
  label: string;
  demos: DirectionDemo[];
  inline?: boolean;
  width?: object;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, ...width }}>
      <Typography
        variant="overline"
        sx={{ color: 'grey.500', letterSpacing: '0.2em', display: 'block', mb: 2 }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexGrow: 1,
          justifyContent: inline ? 'center' : undefined,
          flexDirection: inline ? 'row' : 'column',
        }}
      >
        {demos.map((demo) => (
          <Box
            key={`direction-${demo.value}`}
            sx={{
              flex: inline ? '1 1 0' : '0 0 auto',
              maxWidth: inline ? VERTICAL_CARD_MAX_WIDTH : undefined,
              minWidth: 0,
              display: 'flex',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <DirectionCard demo={demo} fill={inline} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function DemoPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight="900" gutterBottom align="center" color="white">
        Perfected CollageFab
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" align="center" mb={8} sx={{ maxWidth: 700, mx: 'auto' }}>
        Mathematical clipping slices overlapping circles. Simultaneous inverse translation of the
        <strong> WebkitMaskPosition</strong> against the component's <strong>translateX</strong> creates a
        flawless morphing unfold without bounds popping.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {[1, 2, 3, 4, 5, 6].map((count) => (
          <Grid item xs={12} md={6} lg={4} key={`demo-${count}`}>
            <CountCard count={count} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" fontWeight="bold" color="white" align="center" mt={8} mb={4}>
        Direction
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          gap: 4,
        }}
      >
        <DirectionGroup
          label="Horizontal"
          demos={HORIZONTAL_DEMOS}
          width={{ flex: { md: '0 0 440px' } }}
        />
        <DirectionGroup
          label="Vertical"
          demos={VERTICAL_DEMOS}
          inline
          width={{ flex: '1 1 auto' }}
        />
      </Box>
    </Container>
  );
}
