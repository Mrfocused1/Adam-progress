# Media Pack Editor — Design

**Date:** 2026-06-05
**Status:** Approved (ready for implementation plan)

## Summary

Add a **media-pack editor** to the existing `/admin` dashboard of the Adam Progress
site. The editor lets an allow-listed admin pick one of **three fixed templates**,
edit everything inside it (numbers/stats, text, images, colors) with a live
preview, save the edits to Supabase, and **download the result as a single-page
PDF**. The primary purpose is to keep analytics numbers (followers, views,
interactions, demographics) current for sponsorship/media outreach.

Templates are **hand-built by the developer** from references the user provides
(one reference — the combat-sports analytics one-pager — is already supplied and
becomes Template 1). The admin can **only edit** templates; they cannot create or
upload new templates at runtime.

## Goals

- Three pixel-accurate, editable poster templates in the combat-sports visual
  system, downloadable as PDF.
- Admin edits numbers, text/labels, images, and colors per template.
- Edits persist in Supabase (per template) and survive across devices.
- Reuse the existing admin auth, allowlist, media bucket, and no-build-step
  (vanilla ESM via CDN) conventions.

## Non-Goals

- Runtime theme/template uploading or auto-generation from arbitrary designs.
- Editing the live public website (that is the existing "Website content" editor).
- Selectable/vector PDF text (raster poster output is acceptable and expected).
- Server-side rendering infrastructure (revisit only if raster quality is
  insufficient).

## Architecture

The site is a static, no-build vanilla HTML/CSS/JS app deployed on Vercel, with a
Supabase-backed admin. This feature adds a second editor mode to `/admin`.

### Placement

A top-level toggle in the existing admin dashboard switches between:

- **Website content** — the current schema-driven editor (unchanged).
- **Media packs** — the new editor.

Both live behind the existing login + allowlist in `assets/admin.js`. No second
auth flow.

### Media-packs view layout

Split screen:

- **Left:** scrollable edit form, fields grouped by template section.
- **Right:** live, scaled-down preview of the actual full-size poster DOM.
- **Top:** template picker (Template 1 / 2 / 3), Save button, Download PDF button,
  unsaved-changes indicator.

Editing any field updates the live preview immediately.

## Template System

New folder: `assets/lib/packs/`. Each template is one self-contained ES module.

Each template module exports:

- `key` — stable id (e.g. `combat-analytics`); used as the `media_packs` row key.
- `label` — display name in the picker.
- `size: { w, h }` — full pixel dimensions (Template 1 = 1696 × 2528, portrait ~2:3).
- `fields` — declarative, grouped field list. Field types:
  `text`, `textarea`, `number`, `image`, `color`. Each field has `key`, `label`,
  optional `hint`, and a `group` (section heading in the form).
- `defaults` — starting content object (Template 1 seeded from the reference:
  ADAM PROGRESS wordmark, FIGHTER. CREATOR. FUTURE CHAMPION., the 32,721 /
  12,260,496 / 490,621 stats, content-type breakdowns, top interactions, top
  countries, age ranges, growth-over-time, About, contact footer).
- `render(content) → HTMLElement` — builds the exact poster at full pixel size
  from a content object.

A small registry module (`assets/lib/packs/index.js`) exports the array of
templates so the editor and PDF exporter stay generic.

### Template 1 — Combat Analytics one-pager

Built pixel-accurate to the supplied reference + design guide:

- Palette: 70% black / 20% white / 10% red. Backgrounds `#050505` / `#0B0B0D` /
  panel `#101010`; primary red `#D11414`, accent red `#E11B1B`; text `#F4F4F4` /
  `#A8A8A8` / `#777777`; borders `#232323`.
- Type: Bebas Neue (name + section titles), Anton / Bebas Bold (key stats), a
  brush script for the "Progress" wordmark, Montserrat (body + small labels).
  Brush font sourced from a free/Google-hosted face closest to the reference.
- 1px–2px panel borders, outline icons (2px stroke, red), strong negative space.
- Editable images: hero portrait + secondary photo (uploaded to `media` bucket);
  red-texture/gradient overlays and masks are baked into the template CSS.
- Colors editable via CSS custom properties bound to color-picker fields
  (accent red, primary/secondary backgrounds, text colors).

### Templates 2 & 3

Same module structure. Built when the user supplies their references. Adding a
template = dropping in a new module and registering it; no editor/exporter changes.

## Persistence (Supabase)

New table:

```
media_packs (
  template_key text primary key,
  data         jsonb not null,
  updated_at   timestamptz,
  updated_by   text
)
```

One row per template. RLS mirrors `site_content` but with **no public read** (this
is admin-only data):

- **SELECT / INSERT / UPDATE**: only `authenticated` users whose JWT email is in
  the allowlist (`tibaba.prg@gmail.com`, `paulshonowo2@gmail.com`).

Image uploads reuse the existing **`media`** storage bucket (public read; writes
restricted to the same allowlist), via the existing upload helper pattern.

**Save** upserts the current template's row. **Load** fetches the row on template
select; if absent, the editor falls back to the template's `defaults`. Backfill
missing keys from `defaults` so template changes don't break older saved data.

## PDF Export (Plan A)

On **Download PDF**:

1. Render the chosen template at full pixel size into an off-screen node
   (visible but positioned off-canvas so fonts/images load and layout is exact).
2. Snapshot at 2× device scale with `html-to-image` (`toPng`/`toCanvas`).
3. Create a `jsPDF` document with a single page sized to the design's aspect
   ratio (portrait, no margins) and place the snapshot to fill the page.
4. Save as `adam-progress-mediapack-<template>.pdf`.

Libraries (`jspdf`, `html-to-image`) loaded via CDN ESM — consistent with the
existing `@supabase/supabase-js` CDN import; no build step.

Wait for web fonts (`document.fonts.ready`) and image loads before snapshotting to
avoid blank/fallback-font captures.

**Bonus (optional):** a PNG download reuses the same snapshot step.

## Files

New:

- `assets/lib/packs/index.js` — template registry.
- `assets/lib/packs/combat-analytics.js` — Template 1 (fields, defaults, render).
- `assets/lib/packs/template-2.js`, `template-3.js` — added when refs arrive.
- `assets/lib/pdf.js` — snapshot + jsPDF export helper (generic over templates).
- `assets/media-packs.js` — the media-packs editor view (form + preview + save +
  download), imported by the admin.
- `assets/media-packs.css` — editor + template styles (or split per template).

Modified:

- `admin.html` — add the Website content ↔ Media packs toggle and the
  media-packs view container.
- `assets/admin.js` — wire the toggle; mount the media-packs editor after auth.
- Supabase — create `media_packs` table + RLS policies.

## Error Handling

- **Load failure** (network/RLS) on a template: show a clear warning and fall back
  to `defaults`; warn that saving now could overwrite remembered numbers — mirror
  the existing `site_content` load-guard behavior.
- **Image upload failure:** inline status message; keep prior value.
- **PDF snapshot failure** (font/image not ready, browser quirk): surface an error
  toast; do not download a partial/blank file.
- **Unsaved changes:** `beforeunload` guard and an unsaved indicator, mirroring the
  existing editor.

## Sequencing

1. Build the full system + **Template 1 end-to-end** (table, editor, preview,
   save/load, PDF export) so it is immediately usable.
2. Add **Templates 2 & 3** when the user supplies their references.

## Testing

- Unit-test (Node, `tests/`) the pure pieces: template `defaults` shape vs
  `fields`, content→render produces expected text/number nodes, backfill of
  missing keys from defaults.
- Manual verification: edit each field type, confirm live preview updates, save +
  reload restores values, Download PDF produces a correct single-page portrait PDF
  matching the preview.
