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

import { TEMPLATES } from '../assets/lib/packs/index.js';
import combat from '../assets/lib/packs/combat-analytics.js';
import { getByPath } from '../assets/lib/apply.js';

test('registry exposes the combat-analytics template', () => {
  assert.ok(TEMPLATES.some(t => t.key === 'combat-analytics'));
});

test('template has size, fields, defaults, render', () => {
  assert.equal(combat.size.w, 1696);
  assert.equal(combat.size.h, 2528);
  assert.ok(Array.isArray(combat.fields) && combat.fields.length > 0);
  assert.equal(typeof combat.defaults, 'object');
  assert.equal(typeof combat.render, 'function');
});

test('every field key resolves to a value in defaults', () => {
  for (const f of combat.fields) {
    const v = getByPath(combat.defaults, f.key);
    assert.notEqual(v, undefined, `default missing for field "${f.key}"`);
  }
});

test('every field has a group and a known type', () => {
  const types = new Set(['text', 'textarea', 'number', 'image', 'color']);
  for (const f of combat.fields) {
    assert.ok(f.group, `field "${f.key}" needs a group`);
    assert.ok(types.has(f.type), `field "${f.key}" bad type "${f.type}"`);
  }
});
