import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('AIT Recharts adapter does not rely on the UMD default export', async () => {
  const source = await readFile(
    new URL('../src/vendor/recharts-ait.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /import\s+\*\s+as\s+Recharts\s+from/);
  assert.doesNotMatch(source, /import\s+Recharts\s+from/);
});
