import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitPageSize } from '../assets/lib/pdf-math.js';

test('fitPageSize: portrait design → portrait pt page preserving aspect', () => {
  const p = fitPageSize(1696, 2528);
  assert.equal(p.orientation, 'portrait');
  assert.ok(Math.abs((p.width / p.height) - (1696 / 2528)) < 1e-6);
  assert.ok(p.width > 0 && p.height > 0);
});

test('fitPageSize: landscape design → landscape', () => {
  const p = fitPageSize(2000, 1000);
  assert.equal(p.orientation, 'landscape');
});
