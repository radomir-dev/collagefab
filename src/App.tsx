import {
  AppBar,
  Box,
  CssBaseline,
  Tab,
  Tabs,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { theme } from './theme';
import { DemoPage } from './pages/DemoPage';
import { ApiPage } from './pages/ApiPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { AuthorBadge, RepoLink, VersionBadge } from './site/ProjectChrome';

const TAB_ROUTES = ['/', '/docs', '/playground'] as const;

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = Math.max(TAB_ROUTES.indexOf(pathname as (typeof TAB_ROUTES)[number]), 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(26, 26, 26, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" fontWeight="900" color="white" sx={{ whiteSpace: 'nowrap' }}>
            CollageFab
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tabs
            value={page}
            onChange={(_event, value: number) => navigate(TAB_ROUTES[value])}
            textColor="inherit"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Demo" />
            <Tab label="Components API" />
            <Tab label="Playground" />
          </Tabs>
          <RepoLink />
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/docs" element={<ApiPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthorBadge />
      <VersionBadge />
    </ThemeProvider>
  );
}
