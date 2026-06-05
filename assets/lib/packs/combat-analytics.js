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
    { value: '6’8"', label: 'HEIGHT' },
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

// Strip characters that could break out of a CSS url("…") string (defense in
// depth — applied to the value before it's assigned via the DOM style property,
// never interpolated into markup).
const cssUrl = (s) => String(s ?? '').replace(/["'()\\\n\r]/g, '');

function rows(arr, render) { return (arr || []).map(render).join(''); }

export function render(content) {
  const c = content;
  const root = el('div', 'mp-poster');
  const C = c.colors || defaults.colors;
  Object.entries(C).forEach(([k, v]) => root.style.setProperty(`--mp-${k}`, v));

  root.innerHTML = `
    <div class="mp-hero">
      <div class="mp-hero-photo"></div>
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
      <div class="mp-about-photo"></div>
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

  // Background photos set via the DOM style property (not markup) with a
  // sanitized URL — avoids CSS url() injection from the editable image fields.
  const heroPhoto = root.querySelector('.mp-hero-photo');
  if (heroPhoto && c.heroImage) heroPhoto.style.backgroundImage = `url("${cssUrl(c.heroImage)}")`;
  const aboutPhoto = root.querySelector('.mp-about-photo');
  if (aboutPhoto && c.aboutImage) aboutPhoto.style.backgroundImage = `url("${cssUrl(c.aboutImage)}")`;

  return root;
}

export default { key: 'combat-analytics', label: 'Combat Analytics', size: { w: 1696, h: 2528 }, fields, defaults, render };
