import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_SCHEMA, DEFAULT_CONTENT } from '../assets/lib/schema.js';
import { getByPath, setByPath, escapeHtml } from '../assets/lib/apply.js';
import { renderFeedCard, renderPillar, renderStat, renderFullFight, renderTestimonial } from '../assets/lib/render.js';

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

test('renderFullFight branches on kind and maps/falls back badge class', () => {
  const local = renderFullFight({ kind: 'local', src: 'v.mp4', poster: 'p.jpg', badge1: 'WIN', badge1Class: 'win', badge2: 'DBX 6', title: 'T', meta: 'M' });
  assert.match(local, /js-local-player/);
  assert.match(local, /data-video-src="v\.mp4"/);
  assert.match(local, /badge badge-win/);

  const yt = renderFullFight({ kind: 'youtube', videoId: 'ID', badge1: '', badge1Class: 'event', badge2: 'IHC', title: 'T', meta: 'M' });
  assert.match(yt, /js-yt-player/);
  assert.match(yt, /vi\/ID\/maxresdefault\.jpg/);
  assert.doesNotMatch(yt, /badge-win|badge-title/);   // empty badge1 omitted

  const unknown = renderFullFight({ kind: 'youtube', videoId: 'X', badge1: 'B', badge1Class: 'bogus', badge2: '', title: 'T', meta: 'M' });
  assert.match(unknown, /badge badge-event/);          // unknown class falls back to badge-event
});

test('renderTestimonial inserts quoteHtml raw but escapes other fields', () => {
  const html = renderTestimonial({ href: 'https://x/', avatar: 'a.jpg', name: 'Jon <J>', role: 'UFC', quoteHtml: 'great <span class="text-redHot">star</span>', source: 'IG' });
  assert.match(html, /great <span class="text-redHot">star<\/span>/); // raw passthrough
  assert.match(html, /Jon &lt;J&gt;/);                                // name escaped
});
