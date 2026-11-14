import { spawnSync } from 'node:child_process';

const VERSION = '1.7.12';
const hasCommand = (command, args) => spawnSync(command, args, { stdio: 'ignore' }).status === 0;

const local = hasCommand('actionlint', ['-version']);
const docker = local ? false : hasCommand('docker', ['info']);

if (!local && !docker) {
  console.error('actionlint: neither a local actionlint nor docker is available');
  process.exit(1);
}

const [command, args] = local
  ? ['actionlint', []]
  : [
      'docker',
      ['run', '--rm', '-v', `${process.cwd()}:/repo`, '-w', '/repo', `rhysd/actionlint:${VERSION}`],
    ];

const { status } = spawnSync(command, args, { stdio: 'inherit' });
process.exit(status ?? 1);
