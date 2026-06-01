# Admin CMS for Adam Progress — Design

**Date:** 2026-06-01
**Status:** Approved (pending spec review)

## Goal

Give the site owner a password-protected admin page that can edit **every content aspect** of the one-page Adam Progress site — text, images, videos, links — including adding, removing, and reordering items in repeating lists (fights, Instagram feed, testimonials, content pillars, social links). Changes publish to the live site within seconds, with no rebuild or redeploy.

## Constraints / context

- Existing site is a **static site**: plain HTML (`index.html`, ~1588 lines), Tailwind via CDN, vanilla JS (`app.js`), `styles.css`. Deployed on Vercel.
- Supabase project **Adamprogress** (`cbdwugwwohykkzzsongl`, region eu-west-1) — currently empty.
  - Project URL: `https://cbdwugwwohykkzzsongl.supabase.co`
  - Publishable key: `sb_publishable_BykCdxKY74HyjEfkkwr5qg_O46Gn7z-`
- Allowed admin emails: `tibaba.prg@gmail.com`, `paulshonowo2@gmail.com`.
- The live public site must **never break** if Supabase is unreachable — it falls back to the hardcoded content in `index.html`.

## Architecture overview

The public site is unchanged structurally. A thin content layer is added:

- **Supabase** stores all editable content as one JSON document (`site_content` table) plus uploaded media (`media` storage bucket).
- **Public site** loads a new script `assets/content.js` that fetches the JSON document on page load and overlays it onto the existing DOM. On any fetch failure or empty document, the hardcoded HTML remains — guaranteeing the site never breaks.
- **`/admin` (`admin.html`)** is a separate password-protected page. Login via emailed one-time code (Supabase email OTP). Authenticated, allow-listed users edit all fields and upload media. Save writes the JSON document back to Supabase; the public site reflects it on next load.

No build step, no redeploy. Supabase JS client loaded via CDN on both pages.

### New / changed files

- `admin.html` — admin login + dashboard shell.
- `assets/admin.js` — admin logic (auth, form binding, list editors, media upload, save).
- `assets/admin.css` — admin styling (dark, on-brand).
- `assets/content.js` — public-site fetch + override/render layer (new).
- `index.html` — add `data-edit` hooks on scalar fields; include `content.js`; mark list containers for re-render. No design/layout changes.
- `app.js` — minor: stat counters / fight tabs / IG embeds read their values from rendered DOM as today (data is applied before they initialize, or they re-init after apply).

## Data model (Supabase)

### Table: `site_content`
- Single row, `id` (int, PK, fixed = 1).
- `data` JSONB — the full content document.
- `updated_at` timestamptz, `updated_by` text (email) — audit.

`data` document shape (mirrors the site; seeded from current content):

```
{
  "nav":   { "links": [ { "label": "...", "href": "#..." } ], "cta": { "label": "...", "href": "..." } },
  "hero":  { "headline": "...", "subhead": "...", "tagline": "...",
             "bgImage": "<url>", "ctas": [ { "label": "...", "href": "..." } ] },
  "identityStrip": { "items": [ "...", "..." ] },
  "about": { "heading": "...", "body": "...", "videoId": "wvUeDtP5kew", "image": "<url>" },
  "stats": [ { "value": 12, "suffix": "M+", "label": "..." }, ... ],
  "fights": {
    "heading": "...",
    "full":   [ { "type": "local|youtube", "videoId": "...", "src": "...", "poster": "...", "title": "...", "meta": "..." } ],
    "reels":  [ { "shortcode": "...", "category": "fight" } ],
    "shorts": [ { "videoId": "..." } ]
  },
  "testimonials": [ { "name": "...", "handle": "...", "avatar": "<url>", "quote": "..." } ],
  "pillars": [ { "title": "...", "body": "...", "icon": "..." } ],
  "feed":   [ { "shortcode": "...", "category": "fight|training|bts|commentary|motivation|lifestyle" } ],
  "socials":[ { "platform": "instagram", "label": "...", "url": "..." } ],
  "contact":{ "heading": "...", "body": "...", "email": "...", "ctaLabel": "..." },
  "footer": { "text": "...", "links": [ ... ] }
}
```

(Exact field set finalized during seeding by extracting current `index.html` content.)

### Storage: bucket `media`
- Public read. Uploaded images/videos stored here; upload returns a public URL saved into `data`.
- Path convention: `media/<section>/<timestamp>-<filename>`.

### Security (Row Level Security)
- RLS enabled on `site_content`.
- **SELECT**: allowed to `anon` + `authenticated` (public site needs read).
- **INSERT/UPDATE**: only `authenticated` users whose JWT email is in the allowlist (`tibaba.prg@gmail.com`, `paulshonowo2@gmail.com`).
- Storage `media` bucket: public read; write restricted to the same allow-listed authenticated users.
- Even if a non-allowed user obtains an OTP, they cannot write.

## Login

At `/admin`:
1. Enter email → Supabase sends a 6-digit OTP (email OTP / magic code).
2. Enter code → session established, persisted in browser (no re-login each visit).
3. Only the two allow-listed emails can save (enforced by RLS; UI also messages non-allowed users).
4. "Log out" clears the session.

Supabase Auth config: email OTP enabled. Open signup is acceptable (anyone can request a code) because writes are RLS-gated to the allowlist; optionally restrict signups, but the RLS gate is the real protection.

## Admin dashboard

Dark, on-brand UI (matches site's red/ink aesthetic). Left nav: one panel per section — Hero, About, Stats, Fights, Testimonials, Pillars, Feed, Social Links, Contact, Nav/Footer.

Each panel:
- **Text / links** → labeled inputs / textareas.
- **Images / videos** → thumbnail preview + "Replace" (uploads to `media` bucket) OR paste a URL / YouTube ID.
- **Lists** (fights, feed, testimonials, pillars, socials, nav links) → cards that can be **added, deleted, and reordered** (up/down controls).
- Persistent **Save** with a "saved ✓ / unsaved changes" indicator.
- "View live site" link.

The admin reads the current `data` document into an in-memory model, binds forms to it, and on Save upserts the whole document (atomic, single row).

## Public site apply layer (`content.js`)

Runs early on `index.html`:
1. Fetch the `site_content.data` document (anon key, public read).
2. **Scalar fields**: apply to elements tagged `data-edit="hero.headline"` etc. — sets text/HTML, `img src`, link `href`, or video id as appropriate.
3. **List sections** (fights tabs, feed, pillars, testimonials, socials): re-render container contents from the data arrays using template functions that reproduce the existing card markup.
4. **No-flash**: body held (e.g. opacity) until content applied, with a short timeout fallback so the site shows even if the fetch is slow/fails.
5. Existing behaviors (animated stat counters, fight tabs, Instagram embeds) initialize after content is applied so they operate on the rendered DOM.
6. **Fallback**: on fetch failure or empty document, do not modify the DOM — the hardcoded `index.html` content shows as-is.

## Build phases

1. **Supabase setup**: create `site_content` table + RLS policies, `media` storage bucket + policies, enable email OTP auth.
2. **Seed**: extract current site content from `index.html` into the initial `data` document; insert row id=1.
3. **Public layer**: write `content.js`; add `data-edit` hooks and list-container markers to `index.html`; wire init order in `app.js`.
4. **Admin login**: `admin.html` login flow (email OTP) + session handling.
5. **Admin dashboard**: section panels, form binding, list add/remove/reorder, media upload, save.
6. **E2E test**: log in with an allowed email; edit a text field, swap an image, change a video, edit a link; add and remove a list item; confirm all changes appear on the live site; confirm fallback when Supabase blocked.

## Trade-offs / decisions

- Editing is **structured forms**, not free-form layout editing. The owner changes content (text, images, videos, links, list items); the underlying design/CSS stays fixed to keep the premium look intact and unbreakable. This satisfies "every aspect" of the *content*.
- **Instant publish** (live site reads from Supabase on load) chosen over draft/publish for simplicity; risk of a bad edit is low and reversible by re-editing.
- The publishable Supabase key is embedded client-side — standard and safe (read-only public data; writes are RLS-protected).
- One JSONB document (vs. many tables) chosen for atomic saves and simplicity; the content is small and read as a whole.

## Out of scope

- Editing site design/CSS/layout.
- Multi-user roles/permissions beyond the two-email allowlist.
- Version history / rollback UI (audit columns only).
- Draft/preview workflow.
