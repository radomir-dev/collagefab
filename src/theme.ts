import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // Reserve the scrollbar gutter so routes that fit the viewport don't shift when a
          // taller route adds the scrollbar.
          scrollbarGutter: 'stable',
        },
      },
    },
  },
});
