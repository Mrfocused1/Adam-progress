import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_SCHEMA, DEFAULT_CONTENT } from '../assets/lib/schema.js';
import { getByPath, setByPath, escapeHtml } from '../assets/lib/apply.js';
import { renderFeedCard, renderPillar, renderStat } from '../assets/lib/render.js';

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

test('getByPath / setByPath walk dotted paths', () => {
  const o = { a: { b: 'x' } };
  assert.equal(getByPath(o, 'a.b'), 'x');
  setByPath(o, 'a.c', 'y');
  assert.equal(o.a.c, 'y');
});

test('escapeHtml neutralizes angle brackets and quotes', () => {
  assert.equal(escapeHtml('<b>"&'), '&lt;b&gt;&quot;&amp;');
});

test('renderFeedCard outputs an article with shortcode + escaped caption', () => {
  const html = renderFeedCard({ sc: 'ABC', cat: 'fight', thumb: 't.jpg', metric: '▶ 1M', caption: 'a <x>', href: 'https://i/p/ABC/' });
  assert.match(html, /data-sc="ABC"/);
  assert.match(html, /data-cat="fight"/);
  assert.match(html, /a &lt;x&gt;/);
});

test('renderStat carries data-count and data-suffix', () => {
  const html = renderStat({ count: 12, suffix: 'M+', label: 'VIEWS' });
  assert.match(html, /data-count="12"/);
  assert.match(html, /data-suffix="M\+"/);
});
