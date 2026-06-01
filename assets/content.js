import { supabase, CONTENT_ROW_ID } from './lib/supabase.js';
import { getByPath } from './lib/apply.js';
import * as R from './lib/render.js';

window.__apContentBootstrap = true;

const LIST_RENDERERS = {
  stats: R.renderStat,
  fightsFull: R.renderFullFight,
  fightsReels: R.renderReel,
  fightsShorts: R.renderShort,
  testimonials: R.renderTestimonial,
  pillars: R.renderPillar,
  feed: R.renderFeedCard,
};

function applyScalars(data) {
  document.querySelectorAll('[data-edit]').forEach(el => {
    const val = getByPath(data, el.getAttribute('data-edit'));
    if (val == null) return;
    if (el.hasAttribute('data-edit-mailto')) { el.textContent = val; el.setAttribute('href', `mailto:${val}`); return; }
    const attr = el.getAttribute('data-edit-attr');
    if (attr) el.setAttribute(attr, val);
    else if (el.hasAttribute('data-edit-html')) el.innerHTML = val;
    else el.textContent = val;
  });
}

function applyLists(data) {
  document.querySelectorAll('[data-list]').forEach(container => {
    const key = container.getAttribute('data-list');
    const items = data[key];
    const render = LIST_RENDERERS[key];
    if (!Array.isArray(items) || !render) return;
    container.innerHTML = items.map(render).join('');
  });
}

function reveal() { document.documentElement.classList.remove('ap-pending'); }

async function boot() {
  try {
    const { data, error } = await supabase
      .from('site_content').select('data').eq('id', CONTENT_ROW_ID).single();
    if (error) throw error;
    if (data && data.data) { applyScalars(data.data); applyLists(data.data); }
  } catch (err) {
    console.warn('[content] using static fallback:', err?.message || err);
  } finally {
    reveal();
    if (typeof window.initSite === 'function') window.initSite();
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
