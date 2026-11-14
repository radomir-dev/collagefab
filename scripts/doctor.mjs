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
const hasBinary = (bin) => spawnSync(bin, ['-version'], { stdio: 'ignore' }).status === 0;

const STEPS = [
  { name: 'format', script: 'format:check' },
  { name: 'lint', script: 'lint' },
  { name: 'typecheck', script: 'typecheck' },
  { name: 'types', script: 'types:test' },
  { name: 'unit', script: 'test:coverage' },
  { name: 'build', script: 'build' },
  { name: 'lib', script: 'build:lib' },
  { name: 'package', script: 'check:package' },
  { name: 'size', script: 'check:size' },
  { name: 'docs', script: 'docs:check' },
  {
    name: 'actions',
    command: 'actionlint',
    available: () => hasBinary('actionlint'),
    reason: 'actionlint not installed',
  },
  {
    name: 'audit',
    command: 'npm audit --omit=dev --audit-level=high',
    slow: true,
  },
  { name: 'e2e', script: 'test:e2e', slow: true },
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

const tasks = selected.map((step) => ({
  title: step.name,
  task: async (_context, task) => {
    if (step.script && !hasScript(step.script)) {
      return task.skip('no such script');
    }
    if (step.available && !step.available()) {
      return task.skip(step.reason);
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

const list = new Listr(tasks, {
  concurrent: false,
  exitOnError: false,
  renderer: !process.stdout.isTTY || process.env.CI ? 'verbose' : 'default',
});

try {
  await list.run();
} catch {
  // Failures are reported per task and summarised below.
}

if (failures.length > 0) {
  console.error(`\ndoctor: ${failures.length} check(s) failed: ${failures.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('\ndoctor: all checks passed');
}
