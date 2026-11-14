import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, IconButton, Link, Typography } from '@mui/material';

const AUTHOR_URL = 'https://radomir.dev/';
const RELEASE_URL = `${__REPO_URL__}/releases/tag/v${__APP_VERSION__}`;

export function RepoLink() {
  return (
    <IconButton
      component="a"
      href={__REPO_URL__}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Source on GitHub"
      title="Source on GitHub"
      color="inherit"
      size="small"
      sx={{ ml: 0.5 }}
    >
      <GitHubIcon fontSize="small" />
    </IconButton>
  );
}

export function AuthorFooter() {
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 3, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Built by{' '}
        <Link href={AUTHOR_URL} underline="hover" color="inherit">
          Radomir Wojtera
        </Link>
      </Typography>
    </Box>
  );
}

export function VersionBadge() {
  return (
    <Typography
      component="a"
      href={RELEASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Version ${__APP_VERSION__} release on GitHub`}
      title={`v${__APP_VERSION__} release`}
      sx={{
        position: 'fixed',
        left: 10,
        bottom: 8,
        fontSize: 11,
        fontFamily: 'monospace',
        letterSpacing: '0.04em',
        color: 'text.disabled',
        textDecoration: 'none',
        '&:hover': { color: 'text.secondary', textDecoration: 'underline' },
      }}
    >
      v{__APP_VERSION__}
    </Typography>
  );
}
