// assets/lib/packs/people-movement.js
// Template 2 — "The People. The Movement." media-kit page 02. Portrait 1696×2544.
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
  // top bar
  topHandle: '@TIBABA.PRG',
  topName1: 'ADAM', topName2: 'PROGRESS', topKit: 'MEDIA KIT 2025', pageNum: '02',
  // hero
  heroTitle1: 'THE PEOPLE.',
  heroTitle2: 'THE MOVEMENT.',
  heroBody1: "Adam Progress isn't just building a following — he's building a *community*.",
  heroBody2: 'Young. Engaged. Loyal. Global.\nThe people behind the numbers.',
  heroImage: 'assets/t2-hero.jpg',
  // video highlight
  videoKicker: 'VIDEO HIGHLIGHT',
  videoTitle: 'JON JONES ON\nADAM PROGRESS',
  videoImage: 'assets/t2-jonjones.jpg',
  // audience breakdown
  audienceTitle: 'WHO FOLLOWS ADAM',
  audienceSub: '(AUDIENCE BREAKDOWN)',
  audience: [
    { icon: 'people', stat: '84%',   label: 'AGED 18–34',           desc: 'Young, active and highly engaged' },
    { icon: 'male',   stat: '81.9%', label: 'MALE AUDIENCE',        desc: 'Highly relevant for fitness, fight & lifestyle brands' },
    { icon: 'globe',  stat: '',      label: 'TOP MARKETS',          desc: 'USA, UK, Germany, Australia, France\n\nHigh-value CPM markets' },
    { icon: 'heart',  stat: '93%',   label: 'ENGAGEMENT FROM REELS', desc: 'Optimized for discovery and virality' },
  ],
  // quote
  quoteText: '18-year-old. Long reach. Very athletic. He put everything into every single punch. Future star. Build him here. Build him up here. He\'s going to be great.',
  quoteName: '— JON JONES',
  quoteRole: 'UFC Light Heavyweight Champion',
  quoteSub: 'Instagram video message to Adam Progress',
  // outlets
  outletsTitle: 'OUTLETS THAT HAVE MENTIONED ADAM',
  outlets: [
    { logo: 'DIRTY\nBOXING', name: 'Dirty Boxing Championship', verified: true,  desc: 'Official promotion that has featured Adam in major fights and announcements.' },
    { logo: 'FIGHT\nZUMI',   name: 'Fightzumi',                  verified: true,  desc: 'Featured Adam as "The 6ft8 Phenom" and ranked him among top prospects.' },
    { logo: 'MMA\nADDICTION',name: 'MMA Addiction Only',         verified: false, desc: "Reposted and highlighted Adam's performances to their audience." },
    { logo: 'TAPOLOGY',      name: 'Tapology',                   verified: true,  desc: 'Official fighter profile and record tracking on Tapology.' },
  ],
  // by the numbers
  numTitle: 'BY THE NUMBERS',
  numSub: '(ALL PLATFORMS)',
  numBig: '12.2M+',
  numBigLabel: 'ORGANIC VIEWS',
  numBigDesc: 'Across Instagram Reels, TikTok & YouTube Shorts in the last 12 months.',
  numStats: [
    { stat: '920K+', label: 'FOLLOWERS' },
    { stat: '10%+',  label: 'ENGAGEMENT RATE ON REELS' },
    { stat: '100%',  label: 'ORGANIC GROWTH' },
  ],
  // top 5 reels
  reelsTitle: 'TOP 4 REELS OF ALL TIME',
  reelsSub: '(BY VIEWS)',
  reels: [
    { thumb: 'assets/t2-reel1.jpg', views: '21.4M', title: 'LONGEST TEEP IN GAME',          date: 'May 24, 2026' },
    { thumb: 'assets/t2-reel2.jpg', views: '5.4M',  title: 'BEING THIS TALL IS A HACK',      date: 'Jan 16, 2026' },
    { thumb: 'assets/t2-reel3.jpg', views: '1.9M',  title: 'FIGHTER OF YEAR? 18 Y/O',        date: 'May 17, 2026' },
    { thumb: 'assets/t2-reel4.jpg', views: '1.4M',  title: 'FUTURE CHAMPION',                date: 'Feb 13, 2026' },
  ],
  // footer
  footTitle1: "LET'S BUILD",
  footTitle2: 'SOMETHING LEGENDARY.',
  footPartTitle: 'PARTNERSHIPS',
  footPart: 'Sponsorships\nCollaborations\nAppearances',
  footFollowTitle: 'FOLLOW ADAM',
  footFollow: '@tibaba.prg',
  footFollowDesc: 'For daily content, updates & behind the scenes.',
};

// ---- fields (dotted-path keys consumed by getByPath/setByPath) ----
function listFields(group, base, n, cells) {
  const out = [];
  for (let i = 0; i < n; i++) for (const [k, lbl, type] of cells)
    out.push({ group, key: `${base}.${i}.${k}`, label: `#${i + 1} ${lbl}`, type: type || 'text' });
  return out;
}

export const fields = [
  { group: 'Theme colors', key: 'colors.bg', label: 'Background', type: 'color' },
  { group: 'Theme colors', key: 'colors.panel', label: 'Panel', type: 'color' },
  { group: 'Theme colors', key: 'colors.red', label: 'Primary red', type: 'color' },
  { group: 'Theme colors', key: 'colors.white', label: 'Primary text', type: 'color' },
  { group: 'Theme colors', key: 'colors.textSec', label: 'Secondary text', type: 'color' },
  { group: 'Theme colors', key: 'colors.textMuted', label: 'Muted text', type: 'color' },
  { group: 'Theme colors', key: 'colors.border', label: 'Border', type: 'color' },

  { group: 'Top bar', key: 'topHandle', label: 'Handle', type: 'text' },
  { group: 'Top bar', key: 'topName1', label: 'Name 1', type: 'text' },
  { group: 'Top bar', key: 'topName2', label: 'Name 2 (red)', type: 'text' },
  { group: 'Top bar', key: 'topKit', label: 'Kit label', type: 'text' },
  { group: 'Top bar', key: 'pageNum', label: 'Page number', type: 'text' },

  { group: 'Hero', key: 'heroTitle1', label: 'Title line 1', type: 'text' },
  { group: 'Hero', key: 'heroTitle2', label: 'Title line 2 (script)', type: 'text' },
  { group: 'Hero', key: 'heroBody1', label: 'Body 1', type: 'textarea', hint: 'Wrap a word in *stars* for red.' },
  { group: 'Hero', key: 'heroBody2', label: 'Body 2', type: 'textarea', hint: 'Enter = line break.' },
  { group: 'Hero', key: 'heroImage', label: 'Fighter photo', type: 'image' },

  { group: 'Video highlight', key: 'videoKicker', label: 'Kicker', type: 'text' },
  { group: 'Video highlight', key: 'videoTitle', label: 'Title', type: 'textarea', hint: 'Enter = line break.' },
  { group: 'Video highlight', key: 'videoImage', label: 'Video card image', type: 'image' },

  { group: 'Audience', key: 'audienceTitle', label: 'Title', type: 'text' },
  { group: 'Audience', key: 'audienceSub', label: 'Subtitle (red)', type: 'text' },
  ...listFields('Audience', 'audience', 4, [['stat', 'Stat'], ['label', 'Label'], ['desc', 'Description', 'textarea']]),

  { group: 'Quote', key: 'quoteText', label: 'Quote', type: 'textarea' },
  { group: 'Quote', key: 'quoteName', label: 'Name (red)', type: 'text' },
  { group: 'Quote', key: 'quoteRole', label: 'Role', type: 'text' },
  { group: 'Quote', key: 'quoteSub', label: 'Sub-note', type: 'text' },

  { group: 'Outlets', key: 'outletsTitle', label: 'Title', type: 'text' },
  ...listFields('Outlets', 'outlets', 4, [['logo', 'Logo text', 'textarea'], ['name', 'Name'], ['desc', 'Description', 'textarea']]),

  { group: 'By the numbers', key: 'numTitle', label: 'Title', type: 'text' },
  { group: 'By the numbers', key: 'numSub', label: 'Subtitle (red)', type: 'text' },
  { group: 'By the numbers', key: 'numBig', label: 'Big number', type: 'text' },
  { group: 'By the numbers', key: 'numBigLabel', label: 'Big number label', type: 'text' },
  { group: 'By the numbers', key: 'numBigDesc', label: 'Big number description', type: 'textarea' },
  ...listFields('By the numbers', 'numStats', 3, [['stat', 'Stat'], ['label', 'Label']]),

  { group: 'Top reels', key: 'reelsTitle', label: 'Title', type: 'text' },
  { group: 'Top reels', key: 'reelsSub', label: 'Subtitle (red)', type: 'text' },
  ...listFields('Top reels', 'reels', 4, [['thumb', 'Thumbnail', 'image'], ['views', 'Views'], ['title', 'Title'], ['date', 'Date']]),

  { group: 'Footer', key: 'footTitle1', label: 'Title 1', type: 'text' },
  { group: 'Footer', key: 'footTitle2', label: 'Title 2 (script)', type: 'text' },
  { group: 'Footer', key: 'footPartTitle', label: 'Partnerships title', type: 'text' },
  { group: 'Footer', key: 'footPart', label: 'Partnerships list', type: 'textarea', hint: 'Enter = line break.' },
  { group: 'Footer', key: 'footFollowTitle', label: 'Follow title', type: 'text' },
  { group: 'Footer', key: 'footFollow', label: 'Follow handle', type: 'text' },
  { group: 'Footer', key: 'footFollowDesc', label: 'Follow description', type: 'textarea' },
];

// ---- icons ----
const SVG = (cls, inner) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const SOC = {
  ig: SVG('t2-soc', '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.5" fill="currentColor"/>'),
  tiktok: SVG('t2-soc', '<path fill="currentColor" d="M16 3c.3 2.3 1.9 4 4.2 4.2v3c-1.6 0-3.1-.5-4.2-1.3v6.1a6 6 0 1 1-6-6c.34 0 .67.03 1 .09v3.1A2.9 2.9 0 1 0 13 14.8V3h3z"/>'),
  yt: SVG('t2-soc', '<rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 8.6l5.2 3.4-5.2 3.4z" fill="currentColor"/>'),
  x: SVG('t2-soc', '<path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
};
const AUD = {
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17 13.5a5.5 5.5 0 0 1 3.5 5.5"/>',
  male: '<circle cx="10" cy="14" r="5.2"/><path d="M14 10l6-6M15 4h5v5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/>',
  heart: '<path d="M12 20.7C5.5 15.9 3.5 12.2 3.5 8.9A4.4 4.4 0 0 1 12 6.3a4.4 4.4 0 0 1 8.5 2.6c0 3.3-2 7-8.5 11.8z"/>',
};
const audIco = (k) => `<svg class="t2-aud-ico" viewBox="0 0 24 24" aria-hidden="true">${AUD[k] || ''}</svg>`;
const VERIFIED = '<svg class="t2-verified" viewBox="0 0 24 24" aria-hidden="true"><path fill="#3897f0" d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8-2.6-1.5.9-2.9-.9-2.9 2.6-1.5 1-2.8 3 .2z"/><path fill="#fff" d="M10.6 14.6l-2.3-2.3 1.1-1.1 1.2 1.2 3.4-3.4 1.1 1.1z"/></svg>';
const CROWN = '<svg class="t2-foot-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg>';
const HANDSHAKE = '<svg class="t2-foot-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h4l3 3 2-2 2 2 3-3h4M7 10l-3 3 3 3 3-3M17 10l3 3-3 3-3-3M10 16l2 2 2-2"/></svg>';
const IGFOOT = '<svg class="t2-foot-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.5" fill="currentColor"/></svg>';

// ---- render ----
const txt = (s) => escapeHtml(s ?? '');
const nl = (s) => formatInline(s);
const cssUrl = (s) => String(s ?? '').replace(/["'()\\\n\r]/g, '');
const rows = (arr, fn) => (arr || []).map(fn).join('');

export function render(content) {
  const c = content;
  const root = el('div', 't2');
  const C = c.colors || defaults.colors;
  Object.entries(C).forEach(([k, v]) => root.style.setProperty(`--mp-${k}`, v));

  root.innerHTML = `
    <div class="t2-top">
      <div class="t2-top-l">${SOC.ig}${SOC.tiktok}${SOC.yt}${SOC.x}<span class="t2-handle">${txt(c.topHandle)}</span></div>
      <div class="t2-top-c"><span class="t2-tn1">${txt(c.topName1)}</span> <span class="t2-tn2">${txt(c.topName2)}</span> <span class="t2-tk">${txt(c.topKit)}</span></div>
      <div class="t2-top-r">PAGE <span class="mp-red">${txt(c.pageNum)}</span></div>
    </div>

    <div class="t2-hero">
      <div class="t2-hero-photo"></div>
      <div class="t2-hero-copy">
        <div class="t2-h1">${txt(c.heroTitle1)}</div>
        <div class="t2-h2">${txt(c.heroTitle2)}</div>
        <p class="t2-body">${nl(c.heroBody1)}</p>
        <p class="t2-body">${nl(c.heroBody2)}</p>
      </div>
      <div class="t2-video">
        <div class="t2-video-kicker">${txt(c.videoKicker)}</div>
        <div class="t2-video-title">${nl(c.videoTitle)}</div>
        <div class="t2-video-img"></div>
      </div>
    </div>

    <div class="t2-mid">
      <div class="t2-panel t2-aud">
        <h2 class="t2-sec">${txt(c.audienceTitle)} <span class="mp-red">${txt(c.audienceSub)}</span></h2>
        <div class="t2-aud-grid">
          ${rows(c.audience, (a) => `<div class="t2-aud-col${a.stat ? '' : ' t2-aud-col-nostat'}">
            ${audIco(a.icon)}
            ${a.stat ? `<div class="t2-aud-stat">${txt(a.stat)}</div>` : ''}
            <div class="t2-aud-label">${txt(a.label)}</div>
            <div class="t2-aud-desc">${nl(a.desc)}</div>
          </div>`)}
        </div>
      </div>
      <div class="t2-quote">
        <div class="t2-quote-body">
          <span class="t2-quote-mark t2-quote-mark-start">&ldquo;</span>
          <p class="t2-quote-text">${nl(c.quoteText)}</p>
          <span class="t2-quote-mark t2-quote-mark-end">&rdquo;</span>
        </div>
        <div class="t2-quote-name mp-red">${txt(c.quoteName)}</div>
        <div class="t2-quote-role">${txt(c.quoteRole)}</div>
        <div class="t2-quote-sub">${txt(c.quoteSub)}</div>
      </div>
    </div>

    <div class="t2-mid2">
      <div class="t2-panel t2-outlets">
        <h2 class="t2-sec">${txt(c.outletsTitle)}</h2>
        ${rows(c.outlets, (o) => `<div class="t2-outlet">
          <div class="t2-outlet-logo">${nl(o.logo)}</div>
          <div class="t2-outlet-body">
            <div class="t2-outlet-name">${txt(o.name)}${o.verified ? VERIFIED : ''}</div>
            <div class="t2-outlet-desc">${txt(o.desc)}</div>
          </div>
        </div>`)}
      </div>
      <div class="t2-panel t2-num">
        <h2 class="t2-sec">${txt(c.numTitle)} <span class="mp-red">${txt(c.numSub)}</span></h2>
        <div class="t2-num-row">
          <div class="t2-num-big mp-red">${txt(c.numBig)}<span class="t2-num-big-label">${txt(c.numBigLabel)}</span></div>
          <p class="t2-num-desc">${nl(c.numBigDesc)}</p>
        </div>
        <div class="t2-num-stats">
          ${rows(c.numStats, (s) => `<div class="t2-num-col"><div class="t2-num-stat mp-red">${txt(s.stat)}</div><div class="t2-num-label">${txt(s.label)}</div></div>`)}
        </div>
      </div>
    </div>

    <div class="t2-panel t2-reels">
      <h2 class="t2-sec">${txt(c.reelsTitle)} <span class="mp-red">${txt(c.reelsSub)}</span></h2>
      <div class="t2-reels-grid">
        ${rows(c.reels, (r, i) => `<div class="t2-reel">
          <div class="t2-reel-thumb" data-img="${txt(r.thumb)}">
            <span class="t2-reel-rank">${i + 1}</span>
            <svg class="t2-reel-play" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(0,0,0,.5)"/><path d="M10 8.5l6 3.5-6 3.5z" fill="#fff"/></svg>
            <span class="t2-reel-views"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>${txt(r.views)}</span>
          </div>
          <div class="t2-reel-title">${txt(r.title)}</div>
          <div class="t2-reel-date">${txt(r.date)}</div>
        </div>`)}
      </div>
    </div>

    <div class="t2-foot">
      <div class="t2-foot-build"><span class="t2-foot-crown">${CROWN}</span><div><div class="t2-foot-b1">${txt(c.footTitle1)}</div><div class="t2-foot-b2">${txt(c.footTitle2)}</div></div></div>
      <div class="t2-foot-col">${HANDSHAKE}<div><div class="t2-foot-h">${txt(c.footPartTitle)}</div><div class="t2-foot-muted">${nl(c.footPart)}</div></div></div>
      <div class="t2-foot-col">${IGFOOT}<div><div class="t2-foot-h">${txt(c.footFollowTitle)}</div><div class="t2-foot-handle">${txt(c.footFollow)}</div><div class="t2-foot-muted">${nl(c.footFollowDesc)}</div></div></div>
    </div>
  `;

  // background images via DOM (sanitized) — no CSS-injection from editable fields
  const bg = (sel, url) => { const e = root.querySelector(sel); if (e && url) e.style.backgroundImage = `url("${cssUrl(url)}")`; };
  bg('.t2-hero-photo', c.heroImage);
  bg('.t2-video-img', c.videoImage);
  root.querySelectorAll('[data-img]').forEach(e => { const u = e.getAttribute('data-img'); if (u) e.style.backgroundImage = `url("${cssUrl(u)}")`; });

  return root;
}

export default { key: 'people-movement', label: 'The People (Page 02)', size: { w: 1696, h: 2544 }, fields, defaults, render };
