import { Fab } from '@mui/material';
import { Save, Settings, Share } from '@mui/icons-material';
import { CollageFab } from '../../components/CollageFab';

export function BasicUsage() {
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
        <Settings />
      </Fab>
      <Fab color="secondary" aria-label="share">
        <Share />
      </Fab>
      <Fab color="success" aria-label="save">
        <Save />
      </Fab>
    </CollageFab>
  );
}
