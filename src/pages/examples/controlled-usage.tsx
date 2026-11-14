import { useState } from 'react';
import { Button, Fab } from '@mui/material';
import { Settings, Share } from '@mui/icons-material';
import { CollageFab } from '../../components/CollageFab';

export function ControlledUsage() {
  const [open, setOpen] = useState(false);

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
          <Settings />
        </Fab>
        <Fab color="secondary" aria-label="share">
          <Share />
        </Fab>
      </CollageFab>
    </>
  );
}
