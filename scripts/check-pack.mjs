import { execFileSync } from 'node:child_process';

const required = [
  'package.json',
  'dist-lib/index.js',
  'dist-lib/index.cjs',
  'dist-lib/index.d.ts',
  'dist-lib/index.d.cts',
];
const allowed = new Set([...required, 'LICENSE', 'README.md', 'CHANGELOG.md']);

const [packed] = Object.values(
  JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })),
);
const files = packed.files.map((file) => file.path).sort();

const missing = required.filter((file) => !files.includes(file));
const unexpected = files.filter((file) => !allowed.has(file));

if (missing.length > 0 || unexpected.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing from the tarball: ${missing.join(', ')}`);
  }
  if (unexpected.length > 0) {
    console.error(`Unexpected files in the tarball: ${unexpected.join(', ')}`);
  }
  process.exit(1);
}

console.log(`Tarball contents ok (${files.length} files).`);
