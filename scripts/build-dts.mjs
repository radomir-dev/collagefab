import { copyFile } from 'node:fs/promises';
import { dts } from 'rollup-plugin-dts';
import { rollup } from 'rollup';

const bundle = await rollup({ input: 'src/index.ts', plugins: [dts()] });
await bundle.write({ file: 'dist-lib/index.d.ts', format: 'es' });
await bundle.close();

await copyFile('dist-lib/index.d.ts', 'dist-lib/index.d.cts');
