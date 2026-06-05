// Media-packs editor: form (left) + live preview (right), per-template save/load, PDF/PNG download.
import { supabase } from './lib/supabase.js';
import { TEMPLATES, byKey } from './lib/packs/index.js';
import { getByPath, setByPath, escapeHtml } from './lib/apply.js';
import { exportPdf, exportPng } from './lib/pdf.js';

let host, current, content, dirty = false, markGlobalDirty = () => {};
let selectSeq = 0;  // guards against out-of-order async template loads

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
      <button id="mpPreviewBtn" class="btn ghost mp-preview-btn">View preview</button>
      <button id="mpSave" class="btn">Save</button>
      <button id="mpPdf" class="btn ghost">Download PDF</button>
      <button id="mpPng" class="btn ghost">Download PNG</button>
    </div>
    <div id="mpStatus" class="mp-toast" role="status" aria-live="polite" hidden></div>
    <div class="mp-split">
      <div id="mpForm" class="mp-form"></div>
      <div class="mp-preview-wrap"><div id="mpPreview" class="mp-preview"></div></div>
    </div>
    <div id="mpModal" class="mp-modal" hidden>
      <div class="mp-modal-bar">
        <span class="mp-modal-title">Preview</span>
        <button id="mpModalClose" class="btn ghost">Close ✕</button>
      </div>
      <div class="mp-modal-scroll"><div id="mpModalWrap" class="mp-modal-wrap"><div id="mpModalStage" class="mp-modal-stage"></div></div></div>
    </div>`;
  $('#mpTemplate').innerHTML = TEMPLATES.map(t => `<option value="${t.key}">${escapeHtml(t.label)}</option>`).join('');
  $('#mpTemplate').addEventListener('change', e => selectTemplate(e.target.value));
  $('#mpSave').addEventListener('click', save);
  $('#mpPdf').addEventListener('click', () => download('pdf'));
  $('#mpPng').addEventListener('click', () => download('png'));
  $('#mpPreviewBtn').addEventListener('click', openPreview);
  $('#mpModalClose').addEventListener('click', closePreview);
  $('#mpModal').addEventListener('click', e => { if (e.target.id === 'mpModal') closePreview(); });
  if (!mountMediaPacks._resizeBound) {
    window.addEventListener('resize', () => scalePreview());
    mountMediaPacks._resizeBound = true;  // bind once even if remounted
  }
  selectTemplate(current.key);
}

async function selectTemplate(key) {
  current = byKey(key);
  const seq = ++selectSeq;
  setStatus('Loading…');
  const { data, error } = await supabase.from('media_packs').select('data').eq('template_key', key).maybeSingle();
  if (seq !== selectSeq) return;  // a newer selection started while this load was in flight — discard
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
    const sec = document.createElement('details'); sec.className = 'mp-group'; sec.open = false;
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
  node.style.width = current.size.w + 'px';   // height is content-driven (no gap to the footer)
  pv.appendChild(node);
  scalePreview();
}

// Fit the full-size poster into the preview column. Called on render and on
// window resize so the preview stays responsive without rebuilding the node.
function scalePreview() {
  const pv = $('#mpPreview');
  if (!pv || !pv.firstChild) return;
  const h = pv.firstChild.offsetHeight;        // actual rendered height
  const colW = Math.max(0, pv.parentElement.clientWidth - 24);
  const scale = Math.min(1, colW / current.size.w);
  pv.style.transform = `scale(${scale})`;
  pv.style.width = current.size.w + 'px';
  pv.style.height = h + 'px';
  pv.parentElement.style.height = (h * scale + 24) + 'px';
}

// Mobile: open the poster full-screen, fit to viewport width, scrollable —
// so the cramped inline column isn't the only way to view it.
function openPreview() {
  const stage = $('#mpModalStage'), wrap = $('#mpModalWrap'), modal = $('#mpModal');
  stage.innerHTML = '';
  const node = current.render(content);
  node.style.width = current.size.w + 'px';
  stage.appendChild(node);
  modal.hidden = false;
  document.body.style.overflow = 'hidden';  // lock background scroll
  // fit-to-width; the wrap takes the scaled box size so there's no stray scroll.
  const h = node.offsetHeight;
  const scale = Math.min(1, (modal.clientWidth - 24) / current.size.w);
  stage.style.transform = `scale(${scale})`;
  stage.style.width = current.size.w + 'px';
  stage.style.height = h + 'px';
  wrap.style.width = (current.size.w * scale) + 'px';
  wrap.style.height = (h * scale) + 'px';
}

function closePreview() {
  $('#mpModal').hidden = true;
  $('#mpModalStage').innerHTML = '';
  document.body.style.overflow = '';
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
  stage.appendChild(node); document.body.appendChild(stage);
  try {
    const opts = { w: current.size.w, h: node.offsetHeight, scale: 2, filename: `adam-progress-${current.key}.${kind}` };
    if (kind === 'pdf') await exportPdf(node, opts); else await exportPng(node, opts);
    setStatus('Downloaded ✓', 'success');
  } catch (e) {
    setStatus('Export failed: ' + e.message, 'error');
  } finally { document.body.removeChild(stage); }
}

const TOAST_ICON = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  progress: '<svg class="mp-toast-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" opacity=".95"/><path d="M21 12a9 9 0 0 0-9-9" opacity=".25"/></svg>',
};
let toastTimer;
function setStatus(msg, kind) {
  const s = $('#mpStatus');
  clearTimeout(toastTimer);
  if (!msg) { s.hidden = true; s.className = 'mp-toast'; s.innerHTML = ''; return; }
  const k = kind === 'success' ? 'success' : kind === 'error' ? 'error' : 'progress';
  const text = msg.replace(/[✓✕✔]/g, '').trim();
  s.hidden = false;
  s.className = 'mp-toast is-' + k + ' show';
  s.innerHTML = `<span class="mp-toast-ico">${TOAST_ICON[k]}</span><span class="mp-toast-msg">${escapeHtml(text)}</span>`;
  if (k === 'success') toastTimer = setTimeout(() => setStatus(''), 2800);  // auto-dismiss
}

export function isMediaPacksDirty() { return dirty; }
