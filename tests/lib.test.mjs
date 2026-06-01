import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_SCHEMA, DEFAULT_CONTENT } from '../assets/lib/schema.js';

test('every schema section has a matching key in DEFAULT_CONTENT', () => {
  for (const section of CONTENT_SCHEMA) {
    assert.ok(section.key in DEFAULT_CONTENT, `missing default for "${section.key}"`);
  }
});

test('list sections default to arrays, field sections to objects', () => {
  for (const section of CONTENT_SCHEMA) {
    const val = DEFAULT_CONTENT[section.key];
    if (section.list) assert.ok(Array.isArray(val), `${section.key} should be array`);
    else assert.equal(typeof val, 'object', `${section.key} should be object`);
  }
});

test('seed has the core content', () => {
  assert.equal(DEFAULT_CONTENT.hero.headline, 'ADAM');
  assert.equal(DEFAULT_CONTENT.stats.length, 4);
  assert.ok(DEFAULT_CONTENT.fightsFull.length >= 4);
  assert.equal(DEFAULT_CONTENT.contact.email, 'adamprogressmma@gmail.com');
});
