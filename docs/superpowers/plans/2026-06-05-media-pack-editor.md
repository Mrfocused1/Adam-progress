# Media Pack Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a media-pack editor to `/admin` where an allow-listed admin edits three fixed poster templates (numbers, text, images, colors) with a live preview, saves to Supabase, and downloads each as a single-page PDF.

**Architecture:** A second editor mode inside the existing admin dashboard, behind the existing auth/allowlist. Each template is a self-contained ES module (`key`, `size`, `fields`, `defaults`, `render(content)→HTMLElement`) registered in a registry. The form is built from `fields` and reads/writes the content object via the existing `getByPath`/`setByPath` dotted-path helpers. Download renders the template full-size off-screen, snapshots it with `html-to-image`, and embeds the snapshot into a `jsPDF` page sized to the design aspect ratio. Build Template 1 (combat-analytics one-pager) end-to-end now; Templates 2 & 3 plug into the same structure when refs arrive.

**Tech Stack:** Vanilla ES modules (no build step), Supabase JS (CDN ESM, already used), `jspdf` + `html-to-image` (CDN ESM, new), Node built-in test runner (`node --test`).

**Reference:** Spec at `docs/superpowers/specs/2026-06-05-media-pack-editor-design.md`. Template 1 reference image dimensions: 1696 × 2528 (portrait). Design tokens (from the spec/guide): bg `#050505`, bg2 `#0B0B0D`, panel `#101010`, red `#D11414`, redAccent `#E11B1B`, white `#F4F4F4`, textSec `#A8A8A8`, textMuted `#777777`, border `#232323`. Fonts: Bebas Neue (name/section titles), Anton (key stats), Montserrat (body/labels), Permanent Marker (script wordmark — closest free brush face; swap if a licensed brush font is provided).

**Decisions carried from brainstorming:** PDF + PNG both offered (PNG is a near-free bonus on the same snapshot). Brush font = Permanent Marker unless a font file is dropped in.

**How to run tests:** `node --test tests/*.test.mjs` (run from the worktree root; on Node 22 the trailing-slash dir form `node --test tests/` fails — always use the `*.test.mjs` glob).

**How to view locally:** `python3 -m http.server 8765` from the repo root, then open `http://localhost:8765/admin.html`.

---

## File Structure

New files:
- `assets/lib/packs/combat-analytics.js` — Template 1: `key`, `label`, `size`, `fields`, `defaults`, `render()`.
- `assets/lib/packs/index.js` — registry: `export const TEMPLATES = [...]`.
- `assets/lib/pdf.js` — `fitPageSize()` (pure) + `exportNode()` (snapshot → PDF/PNG).
- `assets/media-packs.js` — editor controller (form, preview, template picker, save/load, download).
- `assets/media-packs.css` — editor chrome + Template 1 poster styles.
- `tests/packs.test.mjs` — unit tests for templates + pdf math.

Modified files:
- `admin.html` — add Website content ↔ Media packs toggle + media-packs view container + CSS/font links.
- `assets/admin.js` — wire the toggle; lazy-mount the media-packs editor after auth.
- Supabase (via MCP `apply_migration` or dashboard SQL) — `media_packs` table + RLS.

---

## Task 1: Supabase `media_packs` table + RLS

**Files:**
- Supabase project `cbdwugwwohykkzzsongl` (no repo file). Record the SQL in the commit message / a migration note.

- [ ] **Step 1: Apply the table + RLS migration**

Apply this SQL via the Supabase MCP `apply_migration` tool (name: `media_packs_init`) or the SQL editor. It mirrors `site_content`'s allowlist gate but with **no public read**.

```sql
create table if not exists public.media_packs (
  template_key text primary key,
  data         jsonb not null default '{}'::jsonb,
  updated_at   timestamptz default now(),
  updated_by   text
);

alter table public.media_packs enable row level security;

-- Only the two allow-listed authenticated emails may read or write.
create policy "media_packs allowlist read" on public.media_packs
  for select to authenticated
  using ( (auth.jwt() ->> 'email') in ('tibaba.prg@gmail.com','paulshonowo2@gmail.com') );

create policy "media_packs allowlist write" on public.media_packs
  for all to authenticated
  using      ( (auth.jwt() ->> 'email') in ('tibaba.prg@gmail.com','paulshonowo2@gmail.com') )
  with check ( (auth.jwt() ->> 'email') in ('tibaba.prg@gmail.com','paulshonowo2@gmail.com') );
```

- [ ] **Step 2: Verify the table and policies exist**

Run (MCP `execute_sql` or SQL editor):

```sql
select tablename, rowsecurity from pg_tables where tablename = 'media_packs';
select policyname, cmd from pg_policies where tablename = 'media_packs';
```

Expected: one table row with `rowsecurity = true`; two policies (`select`, `all`).

- [ ] **Step 3: Commit a note**

```bash
git add docs/superpowers/plans/2026-06-05-media-pack-editor.md
git commit -m "chore: media_packs table + RLS applied (see plan Task 1)"
```

---

## Task 2: PDF/PNG export helper (`assets/lib/pdf.js`)

**Files:**
- Create: `assets/lib/pdf.js`
- Test: `tests/packs.test.mjs`

`fitPageSize(w, h)` is pure and unit-tested. `exportNode()` uses the DOM/canvas and is verified manually in Task 6.

- [ ] **Step 1: Write the failing test**

Create `tests/packs.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitPageSize } from '../assets/lib/pdf.js';

test('fitPageSize: portrait design → portrait pt page preserving aspect', () => {
  const p = fitPageSize(1696, 2528);
  assert.equal(p.orientation, 'portrait');
  // aspect ratio preserved
  assert.ok(Math.abs((p.width / p.height) - (1696 / 2528)) < 1e-6);
  // points are positive numbers
  assert.ok(p.width > 0 && p.height > 0);
});

test('fitPageSize: landscape design → landscape', () => {
  const p = fitPageSize(2000, 1000);
  assert.equal(p.orientation, 'landscape');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/packs.test.mjs`
Expected: FAIL — `Cannot find module '../assets/lib/pdf.js'`.

- [ ] **Step 3: Write `assets/lib/pdf.js`**

```js
// PDF/PNG export for media-pack posters.
// fitPageSize is pure (unit-tested). exportNode touches the DOM/canvas.
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm';
import { toPng } from 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';

// Convert a design's pixel size to a jsPDF page spec in points (72pt/inch),
// mapping 1 design px → 1 pt (keeps the aspect ratio; size is irrelevant to a
// single full-bleed image, only the ratio matters).
export function fitPageSize(w, h) {
  return {
    orientation: w >= h ? 'landscape' : 'portrait',
    unit: 'pt',
    width: w,
    height: h,
    format: [w, h],
  };
}

// Wait for fonts + every <img> inside node to finish loading.
async function waitForReady(node) {
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map(img => img.complete && img.naturalWidth
    ? Promise.resolve()
    : new Promise(res => { img.onload = img.onerror = res; })));
}

// Snapshot a full-size node to a PNG data URL at the given pixel scale.
export async function snapshot(node, { w, h, scale = 2 } = {}) {
  await waitForReady(node);
  return toPng(node, {
    width: w, height: h, pixelRatio: scale,
    cacheBust: true,
    style: { transform: 'none', margin: '0' },
  });
}

// Build + download a single-page PDF from a full-size node.
export async function exportPdf(node, { w, h, filename = 'media-pack.pdf', scale = 2 } = {}) {
  const dataUrl = await snapshot(node, { w, h, scale });
  const page = fitPageSize(w, h);
  const pdf = new jsPDF({ orientation: page.orientation, unit: page.unit, format: page.format });
  pdf.addImage(dataUrl, 'PNG', 0, 0, page.width, page.height, undefined, 'FAST');
  pdf.save(filename);
}

// Download a PNG from a full-size node.
export async function exportPng(node, { w, h, filename = 'media-pack.png', scale = 2 } = {}) {
  const dataUrl = await snapshot(node, { w, h, scale });
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename; a.click();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/packs.test.mjs`
Expected: PASS (2 tests). The CDN `import` lines are only evaluated in the browser; Node only imports the file when the test references `fitPageSize` — verify the test passes. If Node tries to resolve the `https://` imports and fails, move `fitPageSize` into a sibling `assets/lib/pdf-math.js` with no CDN imports and re-import it from both `pdf.js` and the test.

> **Note for implementer:** Node 20+ does not resolve `https://` specifiers and will throw on import of `pdf.js`. Therefore put `fitPageSize` in its own import-free module:
>
> Create `assets/lib/pdf-math.js`:
> ```js
> export function fitPageSize(w, h) {
>   return { orientation: w >= h ? 'landscape' : 'portrait', unit: 'pt', width: w, height: h, format: [w, h] };
> }
> ```
> In `pdf.js`, replace the inline `fitPageSize` definition with `import { fitPageSize } from './pdf-math.js';` and `export { fitPageSize };`.
> In the test, import from `'../assets/lib/pdf-math.js'` instead of `'../assets/lib/pdf.js'`.

- [ ] **Step 5: Apply the Node-safe split and re-run**

Do the split described in the note. Run: `node --test tests/packs.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/lib/pdf.js assets/lib/pdf-math.js tests/packs.test.mjs
git commit -m "feat: media-pack PDF/PNG export helper + page-size math"
```

---

## Task 3: Template 1 — combat-analytics (fields, defaults, render) + registry

**Files:**
- Create: `assets/lib/packs/combat-analytics.js`
- Create: `assets/lib/packs/index.js`
- Test: `tests/packs.test.mjs` (append)

The content object is **structured** (objects + arrays). Form fields use **dotted-path keys** (e.g. `topCountries.0.pct`) consumed by `getByPath`/`setByPath` from `assets/lib/apply.js`. `render(content)` reads the structured object directly.

- [ ] **Step 1: Write the failing tests (append to `tests/packs.test.mjs`)**

```js
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/packs.test.mjs`
Expected: FAIL — `Cannot find module '.../packs/index.js'`.

- [ ] **Step 3: Write `assets/lib/packs/combat-analytics.js`**

Full module. `defaults` is seeded from the reference image. `render` builds the poster DOM; styling lives in `media-packs.css` (Task 4) keyed off `.mp-poster` and CSS variables set from `content.colors`.

```js
// assets/lib/packs/combat-analytics.js
// Template 1 — combat-sports analytics one-pager. Portrait 1696×2528.
import { escapeHtml, formatInline } from '../apply.js';

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export const defaults = {
  colors: {
    bg: '#050505', bg2: '#0B0B0D', panel: '#101010',
    red: '#D11414', redAccent: '#E11B1B',
    white: '#F4F4F4', textSec: '#A8A8A8', textMuted: '#777777', border: '#232323',
  },
  socialHandle: '@TIBABA.PRG',
  nameBig: 'ADAM',
  nameScript: 'Progress',
  eyebrow: 'FIGHTER. CREATOR. FUTURE CHAMPION.',
  intro: "6'8\" combat sports athlete and content creator from Germany, building a legacy in and outside the ring.",
  tagline: "The future is not promised. It's earned.",
  heroImage: 'assets/portrait-punch.png',
  infoBar: [
    { value: '6’8”', label: 'HEIGHT' },
    { value: 'ROAD TO', label: 'WORLD CHAMPION' },
    { value: 'DIRTY BOXING', label: 'CHAMPIONSHIP' },
    { value: 'GERMANY', label: 'BASED' },
  ],
  overviewPeriod: '(LAST 90 DAYS)',
  totalFollowers: '32,721',
  followersGrowthPct: '+51.6%',
  followersGrowthVs: 'vs Feb 10',
  follows: '15,589',
  unfollows: '4,446',
  netGrowth: '+11,143',
  totalViews: '12,260,496',
  viewsFollowersPct: '14.2%',
  viewsNonFollowersPct: '85.8%',
  viewsValue: '1,962,421',
  viewsValueDelta: '-71.9%',
  totalInteractions: '490,621',
  interFollowersPct: '18.1%',
  interNonFollowersPct: '81.9%',
  viewsByType: [
    { label: 'REELS', pct: '86.6%' }, { label: 'STORIES', pct: '10.6%' },
    { label: 'POSTS', pct: '2.7%' }, { label: 'LIVE VIDEOS', pct: '0.0%' },
  ],
  interByType: [
    { label: 'REELS', pct: '93.4%' }, { label: 'STORIES', pct: '3.7%' },
    { label: 'POSTS', pct: '2.8%' }, { label: 'LIVE VIDEOS', pct: '0.1%' },
  ],
  topInteractions: [
    { label: 'LIKES', value: '276,971' }, { label: 'COMMENTS', value: '7,069' },
    { label: 'SAVES', value: '17,781' }, { label: 'SHARES', value: '86,446' },
    { label: 'REPOSTS', value: '1,815' },
  ],
  topCountries: [
    { label: 'UNITED STATES', pct: '21.5%' }, { label: 'UNITED KINGDOM', pct: '7.7%' },
    { label: 'GERMANY', pct: '7.6%' }, { label: 'AUSTRALIA', pct: '6.1%' },
  ],
  topAges: [
    { label: '18–24', pct: '42.5%' }, { label: '25–34', pct: '41.6%' },
    { label: '35–44', pct: '8.6%' }, { label: '45–54', pct: '2.9%' },
  ],
  growthSpike: '5,472',
  growthPeriod: 'FEB 11 – MAY 11',
  builtTitle1: 'BUILT\nDIFFERENT.',
  builtTitle2: 'MADE TO\nDOMINATE.',
  aboutImage: 'assets/portrait-cutout.png',
  aboutTitle: 'ABOUT ADAM PROGRESS',
  aboutBody: "A 6'8\" fighter and digital force with millions of views across platforms. Known for his striking, presence, and unmatched work ethic. This is only the beginning.",
  aboutTag: 'FIGHTER. CREATOR. FUTURE CHAMPION.',
  footerLocation1: 'BASED IN GERMANY',
  footerLocation2: 'AVAILABLE WORLDWIDE',
  footerEmailLabel: 'BOOKINGS & INQUIRIES',
  footerEmail: 'TIBABA.PRG@GMAIL.COM',
  footerTagline: "LET'S BUILD THE FUTURE TOGETHER.",
};

// Declarative form schema. Keys are dotted paths into the content object.
export const fields = [
  { group: 'Theme colors', key: 'colors.bg', label: 'Background', type: 'color' },
  { group: 'Theme colors', key: 'colors.panel', label: 'Panel', type: 'color' },
  { group: 'Theme colors', key: 'colors.red', label: 'Primary red', type: 'color' },
  { group: 'Theme colors', key: 'colors.redAccent', label: 'Accent red', type: 'color' },
  { group: 'Theme colors', key: 'colors.white', label: 'Primary text', type: 'color' },
  { group: 'Theme colors', key: 'colors.textSec', label: 'Secondary text', type: 'color' },
  { group: 'Theme colors', key: 'colors.textMuted', label: 'Muted text', type: 'color' },
  { group: 'Theme colors', key: 'colors.border', label: 'Border', type: 'color' },

  { group: 'Header', key: 'socialHandle', label: 'Social handle', type: 'text' },
  { group: 'Header', key: 'nameBig', label: 'Name (big)', type: 'text' },
  { group: 'Header', key: 'nameScript', label: 'Name (script)', type: 'text' },
  { group: 'Header', key: 'eyebrow', label: 'Eyebrow line', type: 'text' },
  { group: 'Header', key: 'intro', label: 'Intro paragraph', type: 'textarea', hint: 'Wrap a word in *stars* for red.' },
  { group: 'Header', key: 'tagline', label: 'Red tagline', type: 'text' },
  { group: 'Header', key: 'heroImage', label: 'Hero photo', type: 'image' },

  { group: 'Info bar', key: 'infoBar.0.value', label: 'Item 1 value', type: 'text' },
  { group: 'Info bar', key: 'infoBar.0.label', label: 'Item 1 label', type: 'text' },
  { group: 'Info bar', key: 'infoBar.1.value', label: 'Item 2 value', type: 'text' },
  { group: 'Info bar', key: 'infoBar.1.label', label: 'Item 2 label', type: 'text' },
  { group: 'Info bar', key: 'infoBar.2.value', label: 'Item 3 value', type: 'text' },
  { group: 'Info bar', key: 'infoBar.2.label', label: 'Item 3 label', type: 'text' },
  { group: 'Info bar', key: 'infoBar.3.value', label: 'Item 4 value', type: 'text' },
  { group: 'Info bar', key: 'infoBar.3.label', label: 'Item 4 label', type: 'text' },

  { group: 'Overview', key: 'overviewPeriod', label: 'Period label', type: 'text' },
  { group: 'Overview', key: 'totalFollowers', label: 'Total followers', type: 'text' },
  { group: 'Overview', key: 'followersGrowthPct', label: 'Followers growth %', type: 'text' },
  { group: 'Overview', key: 'followersGrowthVs', label: 'Growth vs', type: 'text' },
  { group: 'Overview', key: 'follows', label: 'Follows', type: 'text' },
  { group: 'Overview', key: 'unfollows', label: 'Unfollows', type: 'text' },
  { group: 'Overview', key: 'netGrowth', label: 'Net growth', type: 'text' },
  { group: 'Overview', key: 'totalViews', label: 'Total views', type: 'text' },
  { group: 'Overview', key: 'viewsFollowersPct', label: 'Views — followers %', type: 'text' },
  { group: 'Overview', key: 'viewsNonFollowersPct', label: 'Views — non-followers %', type: 'text' },
  { group: 'Overview', key: 'viewsValue', label: 'Views value', type: 'text' },
  { group: 'Overview', key: 'viewsValueDelta', label: 'Views value delta', type: 'text' },
  { group: 'Overview', key: 'totalInteractions', label: 'Total interactions', type: 'text' },
  { group: 'Overview', key: 'interFollowersPct', label: 'Interactions — followers %', type: 'text' },
  { group: 'Overview', key: 'interNonFollowersPct', label: 'Interactions — non-followers %', type: 'text' },

  ...listFields('By content type (views)', 'viewsByType', 4, [['label', 'Label'], ['pct', '%']]),
  ...listFields('By content type (interactions)', 'interByType', 4, [['label', 'Label'], ['pct', '%']]),
  ...listFields('Top interactions', 'topInteractions', 5, [['label', 'Label'], ['value', 'Value']]),
  ...listFields('Top countries', 'topCountries', 4, [['label', 'Country'], ['pct', '%']]),
  ...listFields('Top age ranges', 'topAges', 4, [['label', 'Range'], ['pct', '%']]),

  { group: 'Growth', key: 'growthSpike', label: 'Highest spike', type: 'text' },
  { group: 'Growth', key: 'growthPeriod', label: 'Period', type: 'text' },

  { group: 'About', key: 'builtTitle1', label: 'Slab title 1', type: 'textarea', hint: 'Enter = line break.' },
  { group: 'About', key: 'builtTitle2', label: 'Slab title 2 (script)', type: 'textarea', hint: 'Enter = line break.' },
  { group: 'About', key: 'aboutImage', label: 'About photo', type: 'image' },
  { group: 'About', key: 'aboutTitle', label: 'About heading', type: 'text' },
  { group: 'About', key: 'aboutBody', label: 'About body', type: 'textarea', hint: 'Wrap a word in *stars* for red.' },
  { group: 'About', key: 'aboutTag', label: 'About tagline', type: 'text' },

  { group: 'Footer', key: 'footerLocation1', label: 'Location line 1', type: 'text' },
  { group: 'Footer', key: 'footerLocation2', label: 'Location line 2', type: 'text' },
  { group: 'Footer', key: 'footerEmailLabel', label: 'Email label', type: 'text' },
  { group: 'Footer', key: 'footerEmail', label: 'Email', type: 'text' },
  { group: 'Footer', key: 'footerTagline', label: 'Footer tagline', type: 'text' },
];

function listFields(group, base, n, cells) {
  const out = [];
  for (let i = 0; i < n; i++) {
    for (const [k, lbl] of cells) {
      out.push({ group, key: `${base}.${i}.${k}`, label: `#${i + 1} ${lbl}`, type: 'text' });
    }
  }
  return out;
}

// --- render -------------------------------------------------------------
const txt = (s) => escapeHtml(s ?? '');
const nl = (s) => formatInline(s);  // *stars*→red, \n→<br>

function rows(arr, render) { return (arr || []).map(render).join(''); }

export function render(content) {
  const c = content;
  const root = el('div', 'mp-poster');
  // expose colors as CSS variables so styles + color fields stay in sync
  const C = c.colors || defaults.colors;
  Object.entries(C).forEach(([k, v]) => root.style.setProperty(`--mp-${k}`, v));

  root.innerHTML = `
    <div class="mp-hero">
      <div class="mp-hero-photo" style="background-image:url('${txt(c.heroImage)}')"></div>
      <div class="mp-hero-copy">
        <div class="mp-handle">${txt(c.socialHandle)}</div>
        <div class="mp-name-big">${txt(c.nameBig)}</div>
        <div class="mp-name-script">${txt(c.nameScript)}</div>
        <div class="mp-eyebrow">${txt(c.eyebrow)}</div>
        <p class="mp-intro">${nl(c.intro)}</p>
        <p class="mp-tagline">${txt(c.tagline)}</p>
      </div>
      <div class="mp-infobar">
        ${rows(c.infoBar, (i) => `<div class="mp-infoitem"><span class="mp-info-v">${txt(i.value)}</span><span class="mp-info-l">${txt(i.label)}</span></div>`)}
      </div>
    </div>

    <div class="mp-overview">
      <h2 class="mp-sec">OVERVIEW <span class="mp-sec-sub">${txt(c.overviewPeriod)}</span></h2>
      <div class="mp-ov-grid">
        <div class="mp-ov-col">
          <div class="mp-bignum">${txt(c.totalFollowers)}</div>
          <div class="mp-lbl">TOTAL FOLLOWERS</div>
          <div class="mp-grow">${txt(c.followersGrowthPct)}</div>
          <div class="mp-muted">${txt(c.followersGrowthVs)}</div>
        </div>
        <div class="mp-ov-col mp-ov-mini">
          <div><span class="mp-num-sm">${txt(c.follows)}</span><span class="mp-lbl">FOLLOWS</span></div>
          <div><span class="mp-num-sm">${txt(c.unfollows)}</span><span class="mp-lbl">UNFOLLOWS</span></div>
          <div><span class="mp-num-sm mp-red">${txt(c.netGrowth)}</span><span class="mp-lbl">NET GROWTH</span></div>
        </div>
        <div class="mp-ov-col">
          <div class="mp-bignum mp-red">${txt(c.totalViews)}</div>
          <div class="mp-lbl">TOTAL VIEWS</div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsFollowersPct)}</span><span class="mp-lbl">FOLLOWERS</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsNonFollowersPct)}</span><span class="mp-lbl">NON-FOLLOWERS</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsValue)}</span><span class="mp-red mp-delta">${txt(c.viewsValueDelta)}</span></div>
        </div>
        <div class="mp-ov-col">
          <div class="mp-bignum mp-red">${txt(c.totalInteractions)}</div>
          <div class="mp-lbl">TOTAL INTERACTIONS</div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.interFollowersPct)}</span><span class="mp-lbl">FOLLOWERS</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.interNonFollowersPct)}</span><span class="mp-lbl">NON-FOLLOWERS</span></div>
        </div>
      </div>
    </div>

    <div class="mp-panels mp-panels-3">
      <div class="mp-panel">
        <h3 class="mp-sec sm">BY CONTENT TYPE <span class="mp-red">(VIEWS)</span></h3>
        ${rows(c.viewsByType, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm">BY CONTENT TYPE <span class="mp-red">(INTERACTIONS)</span></h3>
        ${rows(c.interByType, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm">TOP INTERACTIONS <span class="mp-red">(ALL CONTENT)</span></h3>
        ${rows(c.topInteractions, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.value)}</span></div>`)}
      </div>
    </div>

    <div class="mp-panels mp-panels-3">
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">TOP COUNTRIES</h3>
        ${rows(c.topCountries, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">TOP AGE RANGES</h3>
        ${rows(c.topAges, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">GROWTH OVER TIME</h3>
        <div class="mp-lbl">HIGHEST SPIKE</div>
        <div class="mp-num-md">${txt(c.growthSpike)}</div>
        <div class="mp-lbl mp-red">PERIOD</div>
        <div class="mp-muted">${txt(c.growthPeriod)}</div>
      </div>
    </div>

    <div class="mp-about">
      <div class="mp-about-slab">
        <div class="mp-slab-1">${nl(c.builtTitle1)}</div>
        <div class="mp-slab-2">${nl(c.builtTitle2)}</div>
      </div>
      <div class="mp-about-photo" style="background-image:url('${txt(c.aboutImage)}')"></div>
      <div class="mp-about-copy">
        <h3 class="mp-sec sm mp-red">${txt(c.aboutTitle)}</h3>
        <p class="mp-intro">${nl(c.aboutBody)}</p>
        <p class="mp-tagline">${txt(c.aboutTag)}</p>
      </div>
    </div>

    <div class="mp-footer">
      <div class="mp-foot-col"><span class="mp-lbl">${txt(c.footerLocation1)}</span><span class="mp-muted">${txt(c.footerLocation2)}</span></div>
      <div class="mp-foot-col"><span class="mp-lbl">${txt(c.footerEmailLabel)}</span><span class="mp-muted">${txt(c.footerEmail)}</span></div>
      <div class="mp-foot-col"><span class="mp-foot-tag">${txt(c.footerTagline)}</span></div>
    </div>
  `;
  return root;
}

export default { key: 'combat-analytics', label: 'Combat Analytics', size: { w: 1696, h: 2528 }, fields, defaults, render };
```

- [ ] **Step 4: Write `assets/lib/packs/index.js`**

```js
import combat from './combat-analytics.js';
// Templates 2 & 3 are added here when their references arrive.
export const TEMPLATES = [combat];
export const byKey = (k) => TEMPLATES.find(t => t.key === k);
```

- [ ] **Step 5: Run to verify tests pass**

Run: `node --test tests/packs.test.mjs`
Expected: PASS (all template tests + the Task 2 pdf-math tests).

- [ ] **Step 6: Commit**

```bash
git add assets/lib/packs/ tests/packs.test.mjs
git commit -m "feat: combat-analytics media-pack template (fields, defaults, render) + registry"
```

---

## Task 4: Media-packs editor controller + styles

**Files:**
- Create: `assets/media-packs.js`
- Create: `assets/media-packs.css`

This module is mounted by `admin.js` (Task 5). It builds the form from `fields`, keeps a live preview, loads/saves the per-template row, and wires download. It reuses `getByPath`/`setByPath` and the upload pattern from `admin.js`.

- [ ] **Step 1: Write `assets/media-packs.js`**

```js
// Media-packs editor: form (left) + live preview (right), per-template save/load, PDF/PNG download.
import { supabase } from './lib/supabase.js';
import { TEMPLATES, byKey } from './lib/packs/index.js';
import { getByPath, setByPath, escapeHtml } from './lib/apply.js';
import { exportPdf, exportPng } from './lib/pdf.js';

let host, current, content, dirty = false, markGlobalDirty = () => {};

const $ = (sel, r = host) => r.querySelector(sel);

export function mountMediaPacks(hostEl, { onDirty } = {}) {
  host = hostEl;
  markGlobalDirty = onDirty || (() => {});
  current = TEMPLATES[0];
  host.innerHTML = `
    <div class="mp-toolbar">
      <select id="mpTemplate" class="mp-select"></select>
      <span id="mpDirty" class="mp-dirty" hidden>● Unsaved</span>
      <span class="mp-spacer"></span>
      <button id="mpSave" class="btn">Save</button>
      <button id="mpPdf" class="btn ghost">Download PDF</button>
      <button id="mpPng" class="btn ghost">Download PNG</button>
    </div>
    <p id="mpStatus" class="status" role="status" aria-live="polite"></p>
    <div class="mp-split">
      <div id="mpForm" class="mp-form"></div>
      <div class="mp-preview-wrap"><div id="mpPreview" class="mp-preview"></div></div>
    </div>`;
  $('#mpTemplate').innerHTML = TEMPLATES.map(t => `<option value="${t.key}">${escapeHtml(t.label)}</option>`).join('');
  $('#mpTemplate').addEventListener('change', e => selectTemplate(e.target.value));
  $('#mpSave').addEventListener('click', save);
  $('#mpPdf').addEventListener('click', () => download('pdf'));
  $('#mpPng').addEventListener('click', () => download('png'));
  selectTemplate(current.key);
}

async function selectTemplate(key) {
  current = byKey(key);
  setStatus('Loading…');
  const { data, error } = await supabase.from('media_packs').select('data').eq('template_key', key).maybeSingle();
  if (error) {
    setStatus('Could not load saved data (' + error.message + '). Showing defaults — saving now may overwrite remembered numbers.', 'error');
    content = structuredClone(current.defaults);
  } else {
    content = data && data.data ? structuredClone(data.data) : structuredClone(current.defaults);
    backfill(content, current.defaults);
    setStatus('');
  }
  dirty = false; $('#mpDirty').hidden = true;
  buildForm(); renderPreview();
}

// Deep-fill any keys missing from saved data using template defaults.
function backfill(target, def) {
  for (const k of Object.keys(def)) {
    if (Array.isArray(def[k])) {
      if (!Array.isArray(target[k])) target[k] = structuredClone(def[k]);
      else def[k].forEach((d, i) => { if (target[k][i] == null) target[k][i] = structuredClone(d); else if (typeof d === 'object') backfill(target[k][i], d); });
    } else if (def[k] && typeof def[k] === 'object') {
      if (typeof target[k] !== 'object' || target[k] == null) target[k] = {};
      backfill(target[k], def[k]);
    } else if (!(k in target)) target[k] = def[k];
  }
}

function markDirty() { dirty = true; $('#mpDirty').hidden = false; markGlobalDirty(); }

function buildForm() {
  const groups = [];
  const seen = new Map();
  for (const f of current.fields) {
    if (!seen.has(f.group)) { seen.set(f.group, []); groups.push(f.group); }
    seen.get(f.group).push(f);
  }
  const form = $('#mpForm'); form.innerHTML = '';
  for (const g of groups) {
    const sec = document.createElement('details'); sec.className = 'mp-group'; sec.open = true;
    sec.appendChild(Object.assign(document.createElement('summary'), { textContent: g }));
    for (const f of seen.get(g)) sec.appendChild(fieldRow(f));
    form.appendChild(sec);
  }
}

function fieldRow(f) {
  const wrap = document.createElement('div'); wrap.className = 'mp-field';
  wrap.appendChild(Object.assign(document.createElement('label'), { textContent: f.label }));
  const val = getByPath(content, f.key);
  if (f.type === 'image') { wrap.appendChild(imageControl(f, val)); }
  else if (f.type === 'color') {
    const row = document.createElement('div'); row.className = 'mp-colorrow';
    const color = document.createElement('input'); color.type = 'color'; color.value = toHex(val);
    const hexv = document.createElement('input'); hexv.type = 'text'; hexv.value = val ?? '';
    const sync = (v) => { setByPath(content, f.key, v); color.value = toHex(v); hexv.value = v; renderPreview(); markDirty(); };
    color.addEventListener('input', () => sync(color.value));
    hexv.addEventListener('input', () => sync(hexv.value));
    row.append(color, hexv); wrap.appendChild(row);
  } else {
    const input = f.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
    if (f.type === 'textarea') input.rows = 3; else input.type = 'text';
    input.value = val ?? '';
    input.addEventListener('input', () => { setByPath(content, f.key, input.value); renderPreview(); markDirty(); });
    wrap.appendChild(input);
  }
  if (f.hint) wrap.appendChild(Object.assign(document.createElement('p'), { className: 'mp-hint', textContent: f.hint }));
  return wrap;
}

function toHex(v) { return /^#[0-9a-f]{6}$/i.test(v || '') ? v : '#000000'; }

function imageControl(f, val) {
  const box = document.createElement('div'); box.className = 'mp-imagectl';
  const img = document.createElement('img'); img.className = 'mp-thumb';
  const setThumb = (s) => { if (s) { img.src = s; img.hidden = false; } else img.hidden = true; };
  setThumb(val);
  const url = document.createElement('input'); url.type = 'text'; url.value = val ?? ''; url.placeholder = 'paste URL or upload →';
  url.addEventListener('input', () => { setByPath(content, f.key, url.value); setThumb(url.value); renderPreview(); markDirty(); });
  const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*';
  const st = document.createElement('span'); st.className = 'muted';
  file.addEventListener('change', async () => {
    if (!file.files[0]) return; st.textContent = 'Uploading…';
    try {
      const u = await uploadFile(file.files[0]);
      url.value = u; setByPath(content, f.key, u); setThumb(u); renderPreview(); markDirty(); st.textContent = 'Uploaded ✓';
    } catch (e) { st.textContent = 'Upload failed: ' + e.message; }
  });
  box.append(img, url, file, st); return box;
}

async function uploadFile(file) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `media-packs/${current.key}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

function renderPreview() {
  const pv = $('#mpPreview');
  pv.innerHTML = '';
  const node = current.render(content);
  node.style.width = current.size.w + 'px';
  node.style.height = current.size.h + 'px';
  pv.appendChild(node);
  // scale the full-size poster down to fit the preview column width
  const colW = pv.parentElement.clientWidth - 24;
  const scale = Math.min(1, colW / current.size.w);
  pv.style.transform = `scale(${scale})`;
  pv.style.width = current.size.w + 'px';
  pv.style.height = current.size.h + 'px';
  pv.parentElement.style.height = (current.size.h * scale + 24) + 'px';
}

async function save() {
  setStatus('Saving…');
  const { data: { session } } = await supabase.auth.getSession();
  const { error } = await supabase.from('media_packs').upsert({
    template_key: current.key, data: content, updated_at: new Date().toISOString(), updated_by: session?.user?.email,
  });
  if (error) { setStatus('Save failed: ' + error.message, 'error'); return; }
  dirty = false; $('#mpDirty').hidden = true;
  setStatus('Saved ✓', 'success');
}

// Render the poster full-size off-screen, export, then clean up.
async function download(kind) {
  setStatus(kind === 'pdf' ? 'Building PDF…' : 'Building PNG…');
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-99999px;top:0;';
  const node = current.render(content);
  node.style.width = current.size.w + 'px';
  node.style.height = current.size.h + 'px';
  stage.appendChild(node); document.body.appendChild(stage);
  try {
    const opts = { w: current.size.w, h: current.size.h, scale: 2, filename: `adam-progress-${current.key}.${kind}` };
    if (kind === 'pdf') await exportPdf(node, opts); else await exportPng(node, opts);
    setStatus('Downloaded ✓', 'success');
  } catch (e) {
    setStatus('Export failed: ' + e.message, 'error');
  } finally { document.body.removeChild(stage); }
}

function setStatus(msg, kind) {
  const s = $('#mpStatus'); s.textContent = msg; s.className = 'status' + (kind ? ' is-' + kind : '');
}

export function isMediaPacksDirty() { return dirty; }
```

- [ ] **Step 2: Write `assets/media-packs.css`**

Two parts: (A) editor chrome, (B) the `.mp-poster` template styles using the design tokens. Build (B) iteratively against the reference in Task 6; this is a complete, correct starting point.

```css
/* ===== Editor chrome ===== */
.mp-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.mp-toolbar .mp-spacer { flex:1; }
.mp-select { background:#101010; color:#f4f4f4; border:1px solid #232323; padding:8px 12px; font:inherit; }
.mp-dirty { color:#E11B1B; font-size:13px; }
.mp-split { display:grid; grid-template-columns: 420px 1fr; gap:24px; align-items:start; }
.mp-form { max-height:calc(100vh - 220px); overflow:auto; padding-right:8px; }
.mp-group { border:1px solid #232323; margin-bottom:10px; padding:8px 12px; background:#0B0B0D; }
.mp-group > summary { cursor:pointer; font-weight:600; letter-spacing:.05em; text-transform:uppercase; font-size:13px; color:#A8A8A8; }
.mp-field { margin:10px 0; }
.mp-field > label { display:block; font-size:12px; color:#A8A8A8; margin-bottom:4px; }
.mp-field input[type=text], .mp-field textarea { width:100%; background:#101010; color:#f4f4f4; border:1px solid #232323; padding:8px; font:inherit; }
.mp-colorrow { display:flex; gap:8px; }
.mp-colorrow input[type=color] { width:44px; height:36px; background:none; border:1px solid #232323; padding:0; }
.mp-colorrow input[type=text] { flex:1; background:#101010; color:#f4f4f4; border:1px solid #232323; padding:8px; }
.mp-imagectl { display:flex; flex-direction:column; gap:6px; }
.mp-thumb { max-width:120px; max-height:120px; border:1px solid #232323; object-fit:cover; }
.mp-hint { font-size:11px; color:#777; margin:4px 0 0; }
.mp-preview-wrap { overflow:hidden; border:1px solid #232323; background:#000; }
.mp-preview { transform-origin: top left; }

/* ===== Template 1: combat-analytics poster ===== */
.mp-poster {
  --mp-bg:#050505; --mp-bg2:#0B0B0D; --mp-panel:#101010;
  --mp-red:#D11414; --mp-redAccent:#E11B1B; --mp-white:#F4F4F4;
  --mp-textSec:#A8A8A8; --mp-textMuted:#777777; --mp-border:#232323;
  box-sizing:border-box; background:var(--mp-bg); color:var(--mp-white);
  font-family:'Montserrat',sans-serif; overflow:hidden; position:relative;
  display:flex; flex-direction:column;
}
.mp-poster * { box-sizing:border-box; }
.mp-poster .mp-red { color:var(--mp-red); }
.mp-sec { font-family:'Bebas Neue',sans-serif; letter-spacing:.04em; color:var(--mp-white); margin:0; }
.mp-sec.sm { font-size:34px; }
.mp-sec-sub { color:var(--mp-textMuted); font-size:22px; }
.mp-lbl { font-family:'Montserrat',sans-serif; font-weight:600; letter-spacing:.12em; font-size:16px; color:var(--mp-white); text-transform:uppercase; }
.mp-muted { color:var(--mp-textMuted); font-size:18px; }

/* hero */
.mp-hero { position:relative; min-height:840px; padding:60px; }
.mp-hero-photo { position:absolute; inset:0 0 0 45%; background-size:cover; background-position:center top;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 25%); mask-image:linear-gradient(90deg,transparent,#000 25%); }
.mp-hero-copy { position:relative; max-width:60%; }
.mp-handle { letter-spacing:.1em; color:var(--mp-white); font-weight:600; margin-bottom:24px; }
.mp-name-big { font-family:'Bebas Neue',sans-serif; font-size:170px; line-height:.82; letter-spacing:.02em; color:var(--mp-white); }
.mp-name-script { font-family:'Permanent Marker',cursive; font-size:96px; line-height:.9; color:var(--mp-red); margin-top:-6px; }
.mp-eyebrow { font-family:'Bebas Neue',sans-serif; letter-spacing:.18em; font-size:30px; margin-top:18px; }
.mp-intro { color:var(--mp-textSec); font-size:21px; line-height:1.5; margin:18px 0 0; }
.mp-tagline { color:var(--mp-red); font-weight:600; font-size:21px; margin:6px 0 0; }
.mp-infobar { position:relative; display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:48px; border-top:1px solid var(--mp-border); padding-top:24px; }
.mp-infoitem { display:flex; flex-direction:column; gap:4px; border-left:1px solid var(--mp-border); padding-left:18px; }
.mp-info-v { font-family:'Bebas Neue',sans-serif; font-size:34px; }
.mp-info-l { color:var(--mp-textSec); letter-spacing:.1em; font-size:14px; }

/* overview */
.mp-overview { padding:40px 60px; border-top:1px solid var(--mp-border); }
.mp-overview .mp-sec { font-size:40px; color:var(--mp-red); }
.mp-ov-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:40px; margin-top:24px; }
.mp-bignum { font-family:'Anton',sans-serif; font-size:84px; line-height:1; color:var(--mp-red); }
.mp-num-md { font-family:'Anton',sans-serif; font-size:60px; color:var(--mp-white); }
.mp-num-sm { font-family:'Bebas Neue',sans-serif; font-size:40px; display:block; }
.mp-grow { color:var(--mp-red); font-weight:700; font-size:26px; margin-top:8px; }
.mp-ov-mini > div { margin-bottom:14px; }
.mp-pair { margin-top:10px; }
.mp-delta { margin-left:10px; font-weight:700; }

/* panels */
.mp-panels { display:grid; gap:40px; padding:0 60px 40px; }
.mp-panels-3 { grid-template-columns:repeat(3,1fr); }
.mp-panel { background:var(--mp-panel); border:1px solid var(--mp-border); padding:32px; }
.mp-line { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--mp-border); font-size:19px; color:var(--mp-white); }
.mp-line:last-child { border-bottom:none; }
.mp-line-v { color:var(--mp-textSec); }

/* about */
.mp-about { display:grid; grid-template-columns:1fr 1fr 1.2fr; gap:32px; align-items:center; padding:40px 60px; border-top:1px solid var(--mp-border); }
.mp-slab-1 { font-family:'Bebas Neue',sans-serif; font-size:72px; line-height:.9; color:var(--mp-white); }
.mp-slab-2 { font-family:'Permanent Marker',cursive; font-size:54px; line-height:.95; color:var(--mp-red); margin-top:10px; }
.mp-about-photo { height:340px; background-size:cover; background-position:center; border:1px solid var(--mp-border); }

/* footer */
.mp-footer { margin-top:auto; display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:32px 60px; border-top:1px solid var(--mp-border); background:var(--mp-bg2); }
.mp-foot-col { display:flex; flex-direction:column; gap:6px; }
.mp-foot-tag { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:.06em; }
```

- [ ] **Step 3: Commit**

```bash
git add assets/media-packs.js assets/media-packs.css
git commit -m "feat: media-packs editor (form + live preview + save/load + download)"
```

---

## Task 5: Wire the toggle into the admin dashboard

**Files:**
- Modify: `admin.html`
- Modify: `assets/admin.js`

- [ ] **Step 1: Add fonts + stylesheet + view markup to `admin.html`**

In `<head>`, update the Google Fonts link to include the poster fonts (Anton + Montserrat + Permanent Marker are needed by the poster; Bebas Neue already present). Replace the existing `fonts.googleapis.com/css2?...` link line with:

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Permanent+Marker&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="assets/media-packs.css"/>
```

Inside `<div class="dash-body">`, the current children are `<nav id="sectionNav">` and `<main id="panel">`. Wrap a mode switch above them and add the media-packs view. Replace the `dash-body` block (lines ~60-63) with:

```html
    <div class="dash-modebar">
      <button id="modeContent" class="mode-tab is-active">Website content</button>
      <button id="modePacks" class="mode-tab">Media packs</button>
    </div>
    <div class="dash-body">
      <nav id="sectionNav" class="section-nav"></nav>
      <main id="panel" class="panel"></main>
    </div>
    <section id="packsView" class="packs-view" hidden></section>
```

- [ ] **Step 2: Add mode-tab styles to `assets/admin.css`**

Append:

```css
.dash-modebar { display:flex; gap:8px; padding:0 0 16px; }
.mode-tab { background:#0B0B0D; color:#A8A8A8; border:1px solid #232323; padding:8px 16px; cursor:pointer; font:inherit; letter-spacing:.04em; }
.mode-tab.is-active { color:#F4F4F4; border-color:#D11414; }
.packs-view { padding-top:8px; }
```

- [ ] **Step 3: Wire the toggle in `assets/admin.js`**

Add an import at the top (after the existing imports):

```js
import { mountMediaPacks, isMediaPacksDirty } from './media-packs.js';
```

Inside `initDashboard()`, after the existing `buildNav(); renderPanel(CURRENT);` line, add mode wiring:

```js
  let packsMounted = false;
  const contentEls = [$('sectionNav'), $('panel')];
  const showMode = (mode) => {
    const packs = mode === 'packs';
    $('packsView').hidden = !packs;
    contentEls.forEach(e => { e.hidden = packs; });
    $('modeContent').classList.toggle('is-active', !packs);
    $('modePacks').classList.toggle('is-active', packs);
    if (packs && !packsMounted) { mountMediaPacks($('packsView'), { onDirty: markDirty }); packsMounted = true; }
  };
  $('modeContent').addEventListener('click', () => showMode('content'));
  $('modePacks').addEventListener('click', () => showMode('packs'));
```

Update the existing `beforeunload` guard (last line of `admin.js`) so it also accounts for media-pack edits:

```js
window.addEventListener('beforeunload', (e) => { if (DIRTY || isMediaPacksDirty()) { e.preventDefault(); e.returnValue = ''; } });
```

- [ ] **Step 4: Manual smoke test**

Run: `python3 -m http.server 8765` then open `http://localhost:8765/admin.html`, log in.
Expected: a "Website content / Media packs" toggle appears above the editor. Clicking **Media packs** hides the section nav + panel and shows the template picker, the form (grouped, collapsible), and a scaled live preview of the poster on the right.

- [ ] **Step 5: Commit**

```bash
git add admin.html assets/admin.js assets/admin.css
git commit -m "feat: add Website content / Media packs toggle to admin dashboard"
```

---

## Task 6: Visual fidelity pass + end-to-end verification

**Files:**
- Modify: `assets/media-packs.css` (poster styles only), `assets/lib/packs/combat-analytics.js` (markup tweaks if needed)

- [ ] **Step 1: Side-by-side compare against the reference**

Open the editor → Media packs → Combat Analytics. With defaults loaded, compare the live preview against the reference image (`~/Downloads/hf_20260513_152126_…3.PNG`). Check, in order: hero (name scale 170px, script red, photo mask on the right, info bar of 4), OVERVIEW four columns (84px Anton red bignums), the two rows of three panels (1px borders, red sub-labels), BUILT DIFFERENT / MADE TO DOMINATE slab + about photo + about copy, footer three columns. Adjust `media-packs.css` poster values (font sizes, gaps, paddings, the hero photo `inset`/mask) until it visually matches. Keep all colors as `--mp-*` variables.

- [ ] **Step 2: Verify color editing**

Change "Primary red" in the form. Expected: every red element in the preview updates live (bignums, tagline, script name, red sub-labels).

- [ ] **Step 3: Verify image replace**

Replace the hero photo via upload. Expected: thumbnail + preview update; the URL is a `media` bucket public URL under `media-packs/combat-analytics/`.

- [ ] **Step 4: Verify save/load round-trip**

Edit "Total followers" to a new value → Save → reload the page → Media packs → Combat Analytics. Expected: the new value persists (loaded from `media_packs`).

- [ ] **Step 5: Verify PDF + PNG**

Click **Download PDF**. Expected: a single-page **portrait** PDF (`adam-progress-combat-analytics.pdf`) that visually matches the preview (fonts, photos, colors, red overlays all present — no fallback fonts, no blank image). Repeat for **Download PNG**.

- [ ] **Step 6: Run the full test suite**

Run: `node --test tests/*.test.mjs`
Expected: all tests pass (existing `lib.test.mjs` + new `packs.test.mjs`).

- [ ] **Step 7: Commit**

```bash
git add assets/media-packs.css assets/lib/packs/combat-analytics.js
git commit -m "polish: match combat-analytics poster to reference; verified save/PDF/PNG"
```

---

## Templates 2 & 3 (deferred)

When the user supplies the references:
1. Create `assets/lib/packs/<key>.js` exporting the same shape (`key`, `label`, `size`, `fields`, `defaults`, `render`).
2. Add its `.mp-<...>` poster styles to `media-packs.css` (or a per-template CSS file imported alongside).
3. Register it in `assets/lib/packs/index.js`.
4. No changes needed to the editor, save/load, or PDF export — they are generic over the registry.

---

## Self-Review Notes

- **Spec coverage:** placement/toggle (Task 5), template system (Task 3), editable numbers/text/images/colors (Task 3 fields + Task 4 controls), Supabase persistence + RLS no-public-read (Task 1), PDF export Plan A + PNG bonus (Task 2), error handling (load-guard, upload status, export try/catch, beforeunload — Tasks 4–5), sequencing Template 1 now (Tasks 1–6), testing (Tasks 2,3,6). All covered.
- **Node-safe tests:** pure logic (`fitPageSize`, template `fields`/`defaults`) is import-free of CDN modules; `pdf-math.js` split keeps `node --test` green.
- **Type consistency:** template object shape (`key/label/size/fields/defaults/render`) is identical in the module, registry, tests, and editor. Field shape (`group/key/label/type/hint?`) is consistent across `combat-analytics.js` and `media-packs.js`. Dotted-path keys are read/written only via `getByPath`/`setByPath`.
