import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { Listr } from 'listr2';

const LOG_DIR = 'node_modules/.cache/doctor';
const argv = process.argv.slice(2);
const fast = argv.includes('--fast');
const onlyArg = argv.find((arg) => arg.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length).split(',') : null;

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const hasScript = (name) => Boolean(pkg.scripts?.[name]);
const hasCommand = (command, args) => spawnSync(command, args, { stdio: 'ignore' }).status === 0;

// Steps in the same phase run concurrently; each phase waits for the previous one.
// `package`, `size` and `e2e` read build output, so they cannot share a phase with `build`/`lib`.
const STEPS = [
  { name: 'format', script: 'format:check' },
  { name: 'lint', script: 'lint' },
  { name: 'typecheck', script: 'typecheck' },
  { name: 'types', script: 'types:test' },
  { name: 'unit', script: 'test:coverage' },
  { name: 'build', script: 'build' },
  { name: 'lib', script: 'build:lib' },
  { name: 'docs', script: 'docs:check' },
  {
    name: 'actions',
    script: 'check:actions',
    available: () => hasCommand('actionlint', ['-version']) || hasCommand('docker', ['info']),
    reason: 'actionlint and docker not installed',
  },
  { name: 'audit', command: 'npm audit --omit=dev --audit-level=high', slow: true },
  { name: 'package', script: 'check:package', phase: 1, needs: ['lib'] },
  { name: 'size', script: 'check:size', phase: 1, needs: ['lib'] },
  { name: 'e2e', script: 'test:e2e', phase: 1, slow: true },
];

function run(command) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, env: process.env });
    const chunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => chunks.push(chunk));
    child.on('close', (code) =>
      resolve({ code: code ?? 1, output: Buffer.concat(chunks).toString() }),
    );
  });
}

const selected = STEPS.filter((step) => (only ? only.includes(step.name) : !(fast && step.slow)));
const failures = [];
const renderer = !process.stdout.isTTY || process.env.CI ? 'verbose' : 'default';

function buildTasks(steps) {
  return steps.map((step) => ({
    title: step.name,
    task: async (_context, task) => {
      if (step.needs?.some((name) => failures.includes(name))) {
        return task.skip('prerequisite failed');
      }
      if (step.script && !hasScript(step.script)) {
        return task.skip(`${step.name}: no such script`);
      }
      if (step.available && !step.available()) {
        return task.skip(`${step.name}: ${step.reason}`);
      }

      const command = step.command ?? `npm run --silent ${step.script}`;
      const started = Date.now();
      const { code, output } = await run(command);
      const seconds = ((Date.now() - started) / 1000).toFixed(1);

      await mkdir(LOG_DIR, { recursive: true });
      const logFile = `${LOG_DIR}/${step.name}.log`;
      await writeFile(logFile, output);
      task.title = `${step.name} (${seconds}s)`;

      if (code !== 0) {
        failures.push(step.name);
        const tail = output.trim().split('\n').slice(-15).join('\n');
        task.output = `${tail}\nfull log: ${logFile}`;
        throw new Error(`${step.name} failed`);
      }
    },
  }));
}

const phases = [...new Set(selected.map((step) => step.phase ?? 0))].sort((a, b) => a - b);

try {
  for (const phase of phases) {
    const list = new Listr(buildTasks(selected.filter((step) => (step.phase ?? 0) === phase)), {
      concurrent: true,
      exitOnError: false,
      renderer,
    });
    await list.run();
  }
} catch {
  // Failures are reported per task and summarised below.
}

if (failures.length > 0) {
  console.error(`\ndoctor: ${failures.length} check(s) failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('\ndoctor: all checks passed');
}
