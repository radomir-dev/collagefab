import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const VERSION = '1.7.12';
const WORKFLOWS = '.github/workflows';
const hasCommand = (command, args) => spawnSync(command, args, { stdio: 'ignore' }).status === 0;

// Pass the workflow files explicitly: inside a git worktree `.git` is a file, so
// actionlint's project detection finds no repository and refuses to run.
const files = readdirSync(WORKFLOWS)
  .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
  .map((name) => path.join(WORKFLOWS, name));

const local = hasCommand('actionlint', ['-version']);
const docker = local ? false : hasCommand('docker', ['info']);

if (!local && !docker) {
  console.error('actionlint: neither a local actionlint nor docker is available');
  process.exit(1);
}

// Match the host uid so the container can read a checkout whose files are group-only.
const user =
  typeof process.getuid === 'function' ? ['--user', `${process.getuid()}:${process.getgid()}`] : [];

const [command, args] = local
  ? ['actionlint', files]
  : [
      'docker',
      [
        'run',
        '--rm',
        ...user,
        '-v',
        `${process.cwd()}:/repo`,
        '-w',
        '/repo',
        `rhysd/actionlint:${VERSION}`,
        ...files,
      ],
    ];

const { status } = spawnSync(command, args, { stdio: 'inherit' });
process.exit(status ?? 1);
