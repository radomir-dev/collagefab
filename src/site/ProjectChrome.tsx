import { GitHub as GitHubIcon } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';

const AUTHOR_URL = 'https://radomir.dev/';
const RELEASE_URL = `${__REPO_URL__}/releases/tag/v${__APP_VERSION__}`;

const WATERMARK_SX = {
  position: 'fixed',
  bottom: 2,
  fontSize: 11,
  fontFamily: 'monospace',
  letterSpacing: '0.04em',
  color: 'text.disabled',
  textDecoration: 'none',
  '&:hover': { color: 'text.secondary', textDecoration: 'underline' },
} as const;

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

export function AuthorBadge() {
  return (
    <Typography
      component="a"
      href={AUTHOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Author: radomir.dev"
      sx={{ ...WATERMARK_SX, right: 6 }}
    >
      author: radomir.dev
    </Typography>
  );
}

export function VersionBadge() {
  return (
    <Typography
      component="a"
      href={RELEASE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`v${__APP_VERSION__} release on GitHub`}
      title={`v${__APP_VERSION__} release`}
      sx={{ ...WATERMARK_SX, left: 6 }}
    >
      v{__APP_VERSION__}
    </Typography>
  );
}
