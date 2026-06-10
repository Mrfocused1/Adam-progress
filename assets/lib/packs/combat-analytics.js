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
  heroImage: 'assets/mediapack-hero.jpg',
  infoBar: [
    { value: '6’8"', label: 'HEIGHT' },
    { value: 'ROAD TO', label: 'WORLD CHAMPION' },
    { value: 'DIRTY BOXING', label: 'CHAMPIONSHIP' },
    { value: 'GERMANY', label: 'BASED' },
  ],
  overviewPeriod: '(LAST 90 DAYS)',
  totalFollowers: '57,800',
  followersGrowthPct: '+145.6%',
  followersGrowthVs: 'vs Mar 6',
  follows: '39,137',
  unfollows: '5,265',
  netGrowth: '+33,872',
  totalViews: '32,702,096',
  viewsFollowersPct: '6.1%',
  viewsNonFollowersPct: '93.9%',
  viewsValue: '12,993,379',
  viewsValueDelta: '+77.1%',
  totalInteractions: '1,054,693',
  interFollowersPct: '10.7%',
  interNonFollowersPct: '89.3%',
  // Editable section/stat labels — the fixed descriptive text in the layout.
  overviewTitle: 'OVERVIEW',
  lblTotalFollowers: 'TOTAL FOLLOWERS',
  lblFollows: 'FOLLOWS',
  lblUnfollows: 'UNFOLLOWS',
  lblNetGrowth: 'NET GROWTH',
  lblTotalViews: 'TOTAL VIEWS',
  viewsFollowersLabel: 'FOLLOWERS',
  viewsNonFollowersLabel: 'NON-FOLLOWERS',
  lblTotalInteractions: 'TOTAL INTERACTIONS',
  interFollowersLabel: 'FOLLOWERS',
  interNonFollowersLabel: 'NON-FOLLOWERS',
  viewsPanelTitle: 'BY CONTENT TYPE',
  viewsPanelTag: '(VIEWS)',
  interPanelTitle: 'BY CONTENT TYPE',
  interPanelTag: '(INTERACTIONS)',
  topInterTitle: 'TOP INTERACTIONS',
  topInterTag: '(ALL CONTENT)',
  topCountriesTitle: 'TOP COUNTRIES',
  topAgesTitle: 'TOP AGE RANGES',
  growthTitle: 'GROWTH OVER TIME',
  growthTag: '(FOLLOWERS)',
  growthSpikeLabel: 'HIGHEST SPIKE',
  growthPeriodLabel: 'PERIOD',
  viewsByType: [
    { label: 'REELS', pct: '86.6%' }, { label: 'STORIES', pct: '10.6%' },
    { label: 'POSTS', pct: '2.7%' }, { label: 'LIVE VIDEOS', pct: '0.0%' },
  ],
  interByType: [
    { label: 'REELS', pct: '96.7%' }, { label: 'STORIES', pct: '2.0%' },
    { label: 'POSTS', pct: '1.3%' }, { label: 'LIVE VIDEOS', pct: '0.0%' },
  ],
  topInteractions: [
    { label: 'LIKES', value: '642,776' }, { label: 'COMMENTS', value: '11,616' },
    { label: 'SAVES', value: '32,429' }, { label: 'SHARES', value: '164,708' },
    { label: 'REPOSTS', value: '8,122' },
  ],
  topCountries: [
    { label: 'UNITED STATES', pct: '16.2%' }, { label: 'BRAZIL', pct: '12.2%' },
    { label: 'INDIA', pct: '9.6%' }, { label: 'UNITED KINGDOM', pct: '7.8%' },
    { label: 'GERMANY', pct: '6.3%' },
  ],
  topAges: [
    { label: '18–24', pct: '19.8%' }, { label: '25–34', pct: '41.4%' },
    { label: '35–44', pct: '23.9%' }, { label: '45–54', pct: '7.6%' },
  ],
  growthSpike: '5,472',
  growthPeriod: 'MAR 7 – JUN 4',
  builtTitle1: 'BUILT\nDIFFERENT.',
  builtTitle2: 'MADE TO\nDOMINATE.',
  aboutImage: 'assets/mediapack-about.jpg',
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
  { group: 'Overview', key: 'overviewTitle', label: 'Section title', type: 'text' },
  { group: 'Overview', key: 'lblTotalFollowers', label: 'Label — total followers', type: 'text' },
  { group: 'Overview', key: 'lblFollows', label: 'Label — follows', type: 'text' },
  { group: 'Overview', key: 'lblUnfollows', label: 'Label — unfollows', type: 'text' },
  { group: 'Overview', key: 'lblNetGrowth', label: 'Label — net growth', type: 'text' },
  { group: 'Overview', key: 'lblTotalViews', label: 'Label — total views', type: 'text' },
  { group: 'Overview', key: 'viewsFollowersLabel', label: 'Label — views: followers', type: 'text' },
  { group: 'Overview', key: 'viewsNonFollowersLabel', label: 'Label — views: non-followers', type: 'text' },
  { group: 'Overview', key: 'lblTotalInteractions', label: 'Label — total interactions', type: 'text' },
  { group: 'Overview', key: 'interFollowersLabel', label: 'Label — interactions: followers', type: 'text' },
  { group: 'Overview', key: 'interNonFollowersLabel', label: 'Label — interactions: non-followers', type: 'text' },

  { group: 'By content type (views)', key: 'viewsPanelTitle', label: 'Panel title', type: 'text' },
  { group: 'By content type (views)', key: 'viewsPanelTag', label: 'Panel title (red)', type: 'text' },
  ...listFields('By content type (views)', 'viewsByType', 4, [['label', 'Label'], ['pct', '%']]),
  { group: 'By content type (interactions)', key: 'interPanelTitle', label: 'Panel title', type: 'text' },
  { group: 'By content type (interactions)', key: 'interPanelTag', label: 'Panel title (red)', type: 'text' },
  ...listFields('By content type (interactions)', 'interByType', 4, [['label', 'Label'], ['pct', '%']]),
  { group: 'Top interactions', key: 'topInterTitle', label: 'Panel title', type: 'text' },
  { group: 'Top interactions', key: 'topInterTag', label: 'Panel title (red)', type: 'text' },
  ...listFields('Top interactions', 'topInteractions', 5, [['label', 'Label'], ['value', 'Value']]),
  { group: 'Top countries', key: 'topCountriesTitle', label: 'Panel title', type: 'text' },
  ...listFields('Top countries', 'topCountries', 5, [['label', 'Country'], ['pct', '%']]),
  { group: 'Top age ranges', key: 'topAgesTitle', label: 'Panel title', type: 'text' },
  ...listFields('Top age ranges', 'topAges', 4, [['label', 'Range'], ['pct', '%']]),

  { group: 'Growth', key: 'growthTitle', label: 'Panel title', type: 'text' },
  { group: 'Growth', key: 'growthTag', label: 'Panel title (red)', type: 'text' },
  { group: 'Growth', key: 'growthSpikeLabel', label: 'Label — highest spike', type: 'text' },
  { group: 'Growth', key: 'growthSpike', label: 'Highest spike', type: 'text' },
  { group: 'Growth', key: 'growthPeriodLabel', label: 'Label — period', type: 'text' },
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

// Strip characters that could break out of a CSS url("…") string (defense in
// depth — applied to the value before it's assigned via the DOM style property,
// never interpolated into markup).
const cssUrl = (s) => String(s ?? '').replace(/["'()\\\n\r]/g, '');

function rows(arr, render) { return (arr || []).map(render).join(''); }

// Inline outline/glyph icons (kept in the template so the export embeds them).
const SVG = (cls, inner) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const SOC = {
  ig: SVG('mp-soc', '<rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.5" fill="currentColor"/>'),
  tiktok: SVG('mp-soc', '<path fill="currentColor" d="M16 3c.3 2.3 1.9 4 4.2 4.2v3c-1.6 0-3.1-.5-4.2-1.3v6.1a6 6 0 1 1-6-6c.34 0 .67.03 1 .09v3.1A2.9 2.9 0 1 0 13 14.8V3h3z"/>'),
  yt: SVG('mp-soc', '<rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 8.6l5.2 3.4-5.2 3.4z" fill="currentColor"/>'),
  x: SVG('mp-soc', '<path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
};
const GLYPH = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  reel: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 8.5h18M8 3l2.5 5M13 3l2.5 5"/><path d="M10.5 11l4.5 2.7-4.5 2.7z" fill="currentColor" stroke="none"/>',
  stories: '<circle cx="12" cy="12" r="9" stroke-dasharray="2.8 2.8"/>',
  posts: '<rect x="3" y="3" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1"/>',
  live: '<circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a9 9 0 0 0 0 14M19 5a9 9 0 0 1 0 14"/>',
  heart: '<path d="M12 20.7C5.5 15.9 3.5 12.2 3.5 8.9A4.4 4.4 0 0 1 12 6.3a4.4 4.4 0 0 1 8.5 2.6c0 3.3-2 7-8.5 11.8z"/>',
  comment: '<path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5.2A8 8 0 1 1 21 11.5z"/>',
  bookmark: '<path d="M6.5 3h11v18l-5.5-3.8L6.5 21z"/>',
  plane: '<path d="M21.5 2.5L10.5 13.5M21.5 2.5l-7 19-3.9-8.1-8.1-3.9z"/>',
  repost: '<path d="M17 2.5l4 4-4 4M21 6.5H8a4 4 0 0 0-4 4v1.5M7 21.5l-4-4 4-4M3 17.5h13a4 4 0 0 0 4-4V12"/>',
};
const infoIcon = [null, GLYPH.globe, null, GLYPH.pin];          // globe on item 2, pin on item 4
const ctIcons  = [GLYPH.reel, GLYPH.stories, GLYPH.posts, GLYPH.live];
const itIcons  = [GLYPH.heart, GLYPH.comment, GLYPH.bookmark, GLYPH.plane, GLYPH.repost];
const rowIco  = (inner, red) => inner ? `<svg class="mp-row-ico${red ? ' r' : ''}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>` : '';
const infoIco = (inner) => inner ? `<svg class="mp-info-ico" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>` : '';

export function render(content) {
  const c = content;
  const root = el('div', 'mp-poster');
  const C = c.colors || defaults.colors;
  Object.entries(C).forEach(([k, v]) => root.style.setProperty(`--mp-${k}`, v));

  root.innerHTML = `
    <div class="mp-hero">
      <div class="mp-hero-photo"></div>
      <div class="mp-hero-grunge"></div>
      <div class="mp-hero-copy">
        <div class="mp-social">${SOC.ig}${SOC.tiktok}${SOC.yt}${SOC.x}<span class="mp-handle">${txt(c.socialHandle)}</span></div>
        <div class="mp-name-big">${txt(c.nameBig)}</div>
        <div class="mp-name-script">${txt(c.nameScript)}</div>
        <div class="mp-eyebrow">${txt(c.eyebrow)}</div>
        <p class="mp-intro">${nl(c.intro)}</p>
        <p class="mp-tagline">${txt(c.tagline)}</p>
      </div>
      <div class="mp-infobar">
        ${rows(c.infoBar, (i, idx) => `<div class="mp-infoitem">${infoIco(infoIcon[idx])}<div class="mp-info-txt"><span class="mp-info-v">${txt(i.value)}</span><span class="mp-info-l">${txt(i.label)}</span></div></div>`)}
      </div>
    </div>

    <div class="mp-overview">
      <h2 class="mp-sec">${txt(c.overviewTitle)} <span class="mp-sec-sub">${txt(c.overviewPeriod)}</span></h2>
      <div class="mp-ov-grid">
        <div class="mp-ov-col">
          <div class="mp-bignum">${txt(c.totalFollowers)}</div>
          <div class="mp-lbl">${txt(c.lblTotalFollowers)}</div>
          <div class="mp-grow">${txt(c.followersGrowthPct)}</div>
          <div class="mp-muted">${txt(c.followersGrowthVs)}</div>
        </div>
        <div class="mp-ov-col mp-ov-mini">
          <div><span class="mp-num-sm">${txt(c.follows)}</span><span class="mp-lbl">${txt(c.lblFollows)}</span></div>
          <div><span class="mp-num-sm">${txt(c.unfollows)}</span><span class="mp-lbl">${txt(c.lblUnfollows)}</span></div>
          <div><span class="mp-num-sm mp-red">${txt(c.netGrowth)}</span><span class="mp-lbl">${txt(c.lblNetGrowth)}</span></div>
        </div>
        <div class="mp-ov-col">
          <div class="mp-bignum mp-red">${txt(c.totalViews)}</div>
          <div class="mp-lbl">${txt(c.lblTotalViews)}</div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsFollowersPct)}</span><span class="mp-lbl">${txt(c.viewsFollowersLabel)}</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsNonFollowersPct)}</span><span class="mp-lbl">${txt(c.viewsNonFollowersLabel)}</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.viewsValue)}</span><span class="mp-red mp-delta">${txt(c.viewsValueDelta)}</span></div>
        </div>
        <div class="mp-ov-col">
          <div class="mp-bignum mp-red">${txt(c.totalInteractions)}</div>
          <div class="mp-lbl">${txt(c.lblTotalInteractions)}</div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.interFollowersPct)}</span><span class="mp-lbl">${txt(c.interFollowersLabel)}</span></div>
          <div class="mp-pair"><span class="mp-num-sm">${txt(c.interNonFollowersPct)}</span><span class="mp-lbl">${txt(c.interNonFollowersLabel)}</span></div>
        </div>
      </div>
    </div>

    <div class="mp-panels mp-panels-3">
      <div class="mp-panel">
        <h3 class="mp-sec sm">${txt(c.viewsPanelTitle)} <span class="mp-red">${txt(c.viewsPanelTag)}</span></h3>
        ${rows(c.viewsByType, (r, idx) => `<div class="mp-line"><span class="mp-line-l">${rowIco(ctIcons[idx])}${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm">${txt(c.interPanelTitle)} <span class="mp-red">${txt(c.interPanelTag)}</span></h3>
        ${rows(c.interByType, (r, idx) => `<div class="mp-line"><span class="mp-line-l">${rowIco(ctIcons[idx])}${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm">${txt(c.topInterTitle)} <span class="mp-red">${txt(c.topInterTag)}</span></h3>
        ${rows(c.topInteractions, (r, idx) => `<div class="mp-line"><span class="mp-line-l">${rowIco(itIcons[idx], true)}${txt(r.label)}</span><span class="mp-line-v">${txt(r.value)}</span></div>`)}
      </div>
    </div>

    <div class="mp-panels mp-panels-3">
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">${txt(c.topCountriesTitle)}</h3>
        ${rows(c.topCountries, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">${txt(c.topAgesTitle)}</h3>
        ${rows(c.topAges, (r) => `<div class="mp-line"><span>${txt(r.label)}</span><span class="mp-line-v">${txt(r.pct)}</span></div>`)}
      </div>
      <div class="mp-panel">
        <h3 class="mp-sec sm mp-red">${txt(c.growthTitle)} <span class="mp-sec-sub">${txt(c.growthTag)}</span></h3>
        <div class="mp-lbl">${txt(c.growthSpikeLabel)}</div>
        <div class="mp-num-md">${txt(c.growthSpike)}</div>
        <div class="mp-lbl mp-red">${txt(c.growthPeriodLabel)}</div>
        <div class="mp-muted">${txt(c.growthPeriod)}</div>
      </div>
    </div>

    <div class="mp-about">
      <div class="mp-about-slab">
        <div class="mp-slab-1">${nl(c.builtTitle1)}</div>
        <div class="mp-slab-2">${nl(c.builtTitle2)}</div>
      </div>
      <div class="mp-about-photo"></div>
      <div class="mp-about-copy">
        <h3 class="mp-sec sm mp-red">${txt(c.aboutTitle)}</h3>
        <p class="mp-intro">${nl(c.aboutBody)}</p>
        <p class="mp-tagline">${txt(c.aboutTag)}</p>
      </div>
    </div>

    <div class="mp-footer">
      <div class="mp-foot-col">
        <svg class="mp-foot-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>
        <div class="mp-foot-txt"><span class="mp-lbl">${txt(c.footerLocation1)}</span><span class="mp-muted">${txt(c.footerLocation2)}</span></div>
      </div>
      <div class="mp-foot-col">
        <svg class="mp-foot-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/></svg>
        <div class="mp-foot-txt"><span class="mp-lbl">${txt(c.footerEmailLabel)}</span><span class="mp-muted">${txt(c.footerEmail)}</span></div>
      </div>
      <div class="mp-foot-col mp-foot-cta"><span class="mp-foot-tag">${txt(c.footerTagline)}</span><span class="mp-foot-rule"></span></div>
    </div>
  `;

  // Background photos set via the DOM style property (not markup) with a
  // sanitized URL — avoids CSS url() injection from the editable image fields.
  const heroPhoto = root.querySelector('.mp-hero-photo');
  if (heroPhoto && c.heroImage) heroPhoto.style.backgroundImage = `url("${cssUrl(c.heroImage)}")`;
  const aboutPhoto = root.querySelector('.mp-about-photo');
  if (aboutPhoto && c.aboutImage) aboutPhoto.style.backgroundImage = `url("${cssUrl(c.aboutImage)}")`;

  return root;
}

export default { key: 'combat-analytics', label: 'Combat Analytics', size: { w: 1696, h: 2528 }, fields, defaults, render };
