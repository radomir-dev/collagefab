import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { generateApiDocs } from './api-docs.ts';
import type { ApiDocs, ApiFieldDoc } from '../src/docs/api-docs.types.ts';

const README_FILE = fileURLToPath(new URL('../README.md', import.meta.url));

const escapeCell = (text: string) => text.replace(/\|/g, '\\|');
const code = (text: string) => `\`${text}\``;
const cell = escapeCell;

function propsBlock(docs: ApiDocs): string {
  const rows = docs.props.map(
    (prop) =>
      `| ${cell(code(prop.name))} | ${cell(code(prop.type))} | ${prop.default === '—' ? '—' : cell(code(prop.default))} | ${cell(prop.description)} |`,
  );
  if (docs.restProps) {
    rows.push(
      `| \`...divProps\` | ${cell(code(docs.restProps))} | — | The remaining div attributes are spread onto the root. |`,
    );
  }
  return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join(
    '\n',
  );
}

function slotsBlock(docs: ApiDocs): string {
  return docs.slots
    .map((slot, index) => `${index + 1}. ${code(slot.name)} — ${slot.description}`)
    .join('\n');
}

function listNames(fields: ApiFieldDoc[]): string {
  const names = fields.map((field) => code(field.name));
  if (names.length <= 1) {
    return names.join('');
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function ownerStateBlock(docs: ApiDocs): string {
  return [
    `${code('CollageFabOwnerState')} carries ${listNames(docs.ownerState)}.`,
    `${code('CollageFabItemOwnerState')} adds ${listNames(docs.itemOwnerState)}.`,
  ].join(' ');
}

function replaceBlock(markdown: string, id: string, body: string): string {
  const pattern = new RegExp(`<!-- api:${id}:start -->[\\s\\S]*?<!-- api:${id}:end -->`);
  if (!pattern.test(markdown)) {
    throw new Error(
      `README.md is missing the <!-- api:${id}:start --> ... <!-- api:${id}:end --> markers`,
    );
  }
  return markdown.replace(pattern, `<!-- api:${id}:start -->\n${body}\n<!-- api:${id}:end -->`);
}

export async function renderReadme(): Promise<string> {
  const docs = await generateApiDocs();
  const markdown = await readFile(README_FILE, 'utf8');
  const generated = [
    ['props', propsBlock(docs)],
    ['slots', slotsBlock(docs)],
    ['owner-state', ownerStateBlock(docs)],
  ].reduce((result, [id, body]) => replaceBlock(result, id, body), markdown);

  // The generated tables are re-padded by Prettier, so render through it to keep
  // `format:check` and `docs:check` agreeing on the same file.
  const config = await resolveConfig(README_FILE);
  return format(generated, { ...config, parser: 'markdown' });
}

async function main() {
  const check = process.argv.includes('--check');
  const rendered = await renderReadme();
  const current = await readFile(README_FILE, 'utf8');

  if (rendered === current) {
    return;
  }
  if (check) {
    console.error('README.md is out of date. Run `npm run docs` and commit the result.');
    process.exitCode = 1;
    return;
  }
  await writeFile(README_FILE, rendered);
  console.log('README.md updated from the component source.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
