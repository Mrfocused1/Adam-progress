import { supabase } from './lib/supabase.js';
import { CONTENT_SCHEMA, DEFAULT_CONTENT } from './lib/schema.js';
import { CONTENT_ROW_ID } from './lib/supabase.js';
import { escapeHtml } from './lib/apply.js';
import { mountMediaPacks, isMediaPacksDirty } from './media-packs.js';

const ALLOWED = ['tibaba.prg@gmail.com', 'paulshonowo2@gmail.com'];
const $ = (id) => document.getElementById(id);
const setStatus = (el, msg, kind) => { el.textContent = msg; el.className = 'status' + (kind ? ' is-' + kind : ''); };

let recovering = /type=recovery/.test(location.hash);  // arrived via a password-reset link

async function login() {
  const email = $('email').value.trim().toLowerCase();
  const password = $('password').value;
  if (!ALLOWED.includes(email)) { setStatus($('loginStatus'), 'That email is not authorized.', 'error'); return; }
  if (!password) { setStatus($('loginStatus'), 'Enter your password.', 'error'); return; }
  const btn = $('loginBtn'); btn.disabled = true; const label = btn.querySelector('.txt'); if (label) label.textContent = 'Logging in…';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  btn.disabled = false; if (label) label.textContent = 'Log in';
  if (error) { setStatus($('loginStatus'), /invalid login/i.test(error.message) ? 'Wrong email or password.' : error.message, 'error'); return; }
  await showDashboard();
}

async function forgot() {
  const email = $('email').value.trim().toLowerCase();
  if (!ALLOWED.includes(email)) { setStatus($('loginStatus'), 'Enter your authorized email above first.', 'error'); return; }
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/admin' });
  if (error) { setStatus($('loginStatus'), error.message, 'error'); return; }
  setStatus($('loginStatus'), 'Reset link sent — check your email (incl. spam). Open it to set a new password.', 'success');
}

function showResetForm() {
  recovering = true;
  $('loginView').hidden = false; $('dashView').hidden = true;
  $('step-login').hidden = true; $('step-reset').hidden = false;
  setStatus($('loginStatus'), 'Set a new password to finish.', 'success');
}

async function setNewPassword() {
  const pw = $('newPassword').value;
  if (pw.length < 6) { setStatus($('loginStatus'), 'Password must be at least 6 characters.', 'error'); return; }
  const { error } = await supabase.auth.updateUser({ password: pw });
  if (error) { setStatus($('loginStatus'), error.message, 'error'); return; }
  recovering = false;
  await showDashboard();
}

async function showDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email?.toLowerCase();
  if (!session || !ALLOWED.includes(email)) { await supabase.auth.signOut(); return; }
  $('loginView').hidden = true; $('dashView').hidden = false;
  await initDashboard(session);
}

async function logout() {
  await supabase.auth.signOut();
  sessionStorage.setItem('ap_signedout', '1');  // survives the reload to show a confirmation
  location.reload();
}

$('loginBtn')?.addEventListener('click', login);
$('password')?.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
$('forgotBtn')?.addEventListener('click', forgot);
$('setPwBtn')?.addEventListener('click', setNewPassword);

// Change password from inside the dashboard (no email needed).
function openPwModal() { $('changeNewPw').value = ''; $('changeNewPw2').value = ''; setStatus($('pwStatus'), '', ''); $('pwModal').hidden = false; $('changeNewPw').focus(); }
function closePwModal() { $('pwModal').hidden = true; }
async function changePassword() {
  const a = $('changeNewPw').value, b = $('changeNewPw2').value;
  if (a.length < 6) { setStatus($('pwStatus'), 'Password must be at least 6 characters.', 'error'); return; }
  if (a !== b) { setStatus($('pwStatus'), "Passwords don't match.", 'error'); return; }
  const { error } = await supabase.auth.updateUser({ password: a });
  if (error) { setStatus($('pwStatus'), error.message, 'error'); return; }
  setStatus($('pwStatus'), 'Password updated ✓ — use it next time you log in.', 'success');
  setTimeout(closePwModal, 1400);
}
$('changePwBtn')?.addEventListener('click', openPwModal);
$('pwCancel')?.addEventListener('click', closePwModal);
$('pwSave')?.addEventListener('click', changePassword);
$('pwModal')?.addEventListener('click', e => { if (e.target.id === 'pwModal') closePwModal(); });

// Show a confirmation after a logout reload.
if (sessionStorage.getItem('ap_signedout')) {
  sessionStorage.removeItem('ap_signedout');
  setStatus($('loginStatus'), 'Signed out. Enter your email and password to log back in.', 'success');
}

// Recovery link → show set-new-password form. Otherwise auto-resume an existing session.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') { showResetForm(); return; }
  if (session && !recovering) showDashboard();
});
if (recovering) showResetForm();
else supabase.auth.getSession().then(({ data }) => { if (data.session) showDashboard(); });

window.__adminLogout = logout;          // wired to the Log out button in Task 7
let DOC = null;           // working copy of the content document
let DIRTY = false;
let CURRENT = CONTENT_SCHEMA[0].key;

function markDirty() { DIRTY = true; $('saveState').hidden = false; }

async function initDashboard() {
  const { data, error } = await supabase.from('site_content').select('data').eq('id', CONTENT_ROW_ID).single();
  // If we genuinely failed to load (network/RLS) — as opposed to an empty row —
  // warn loudly: editing+saving now would overwrite live content with defaults.
  if (error && error.code !== 'PGRST116') {
    setStatus($('dashStatus'), 'Could not load current content (' + error.message + '). Reload before editing to avoid overwriting the live site.', 'error');
  }
  DOC = (data && data.data) ? structuredClone(data.data) : structuredClone(DEFAULT_CONTENT);
  // Backfill any missing keys from defaults so new schema sections always render.
  for (const k of Object.keys(DEFAULT_CONTENT)) if (!(k in DOC)) DOC[k] = structuredClone(DEFAULT_CONTENT[k]);
  buildNav(); renderPanel(CURRENT);
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
  $('saveBtn').addEventListener('click', save);
  $('logoutBtn').addEventListener('click', window.__adminLogout);
}

function buildNav() {
  $('sectionNav').innerHTML = CONTENT_SCHEMA.map(s =>
    `<button class="section-link${s.key === CURRENT ? ' is-active' : ''}" data-key="${s.key}">${escapeHtml(s.label)}</button>`).join('');
  $('sectionNav').querySelectorAll('.section-link').forEach(b =>
    b.addEventListener('click', () => { CURRENT = b.dataset.key; buildNav(); renderPanel(CURRENT); }));
}

function fieldInput(value, field, onChange) {
  if (field.type === 'image' || field.type === 'video') return mediaField(value, field, onChange);
  const wrap = document.createElement('div'); wrap.className = 'field';
  wrap.innerHTML = `<label>${escapeHtml(field.label)}</label>`;
  let input;
  if (field.type === 'textarea') { input = document.createElement('textarea'); input.rows = 4; }
  else { input = document.createElement('input'); input.type = field.type === 'number' ? 'number' : 'text'; }
  input.value = value ?? '';
  input.addEventListener('input', () => { onChange(field.type === 'number' ? Number(input.value) : input.value); markDirty(); });
  wrap.appendChild(input);
  if (field.hint) { const h = document.createElement('p'); h.className = 'field-hint'; h.textContent = field.hint; wrap.appendChild(h); }
  return wrap;
}

function renderPanel(key) {
  const section = CONTENT_SCHEMA.find(s => s.key === key);
  const panel = $('panel'); panel.innerHTML = '';
  if (section.list) { renderListEditor(section, panel); return; }
  for (const f of section.fields) {
    panel.appendChild(fieldInput(DOC[key][f.key], f, v => { DOC[key][f.key] = v; }));
  }
}

function renderListEditor(section, panel) {
  const arr = DOC[section.key];
  arr.forEach((item, idx) => {
    const card = document.createElement('div'); card.className = 'list-item';
    const head = document.createElement('div'); head.className = 'list-item-actions';
    head.innerHTML = `<strong>#${idx + 1}</strong>`;
    const up = btn('↑', () => move(section.key, idx, -1));
    const down = btn('↓', () => move(section.key, idx, +1));
    const del = btn('Delete', () => { arr.splice(idx, 1); markDirty(); renderPanel(section.key); }, 'danger');
    head.append(up, down, del); card.appendChild(head);
    for (const f of section.itemFields) {
      card.appendChild(fieldInput(item[f.key], f, v => { item[f.key] = v; }));
    }
    panel.appendChild(card);
  });
  const add = btn('+ Add item', () => {
    const blank = {}; section.itemFields.forEach(f => blank[f.key] = '');
    arr.push(blank); markDirty(); renderPanel(section.key);
  });
  add.classList.add('add-btn'); panel.appendChild(add);
}

function move(key, idx, dir) {
  const arr = DOC[key]; const j = idx + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[idx], arr[j]] = [arr[j], arr[idx]]; markDirty(); renderPanel(key);
}

function btn(label, onClick, kind) {
  const b = document.createElement('button'); b.textContent = label;
  b.className = 'mini' + (kind ? ' ' + kind : ''); b.addEventListener('click', onClick); return b;
}

async function save() {
  setStatus($('dashStatus'), 'Saving…');
  const { data: { session } } = await supabase.auth.getSession();
  const { error } = await supabase.from('site_content')
    .upsert({ id: CONTENT_ROW_ID, data: DOC, updated_at: new Date().toISOString(), updated_by: session?.user?.email });
  if (error) { setStatus($('dashStatus'), 'Save failed: ' + error.message, 'error'); return; }
  DIRTY = false; $('saveState').hidden = true;
  setStatus($('dashStatus'), 'Saved ✓ — live now.', 'success');
  clearTimeout(save._t);
  save._t = setTimeout(() => { if ($('dashStatus').textContent.startsWith('Saved')) setStatus($('dashStatus'), '', ''); }, 3500);
}

async function uploadFile(file, section) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${section}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

function mediaField(value, field, onChange) {
  const wrap = document.createElement('div'); wrap.className = 'field';
  wrap.innerHTML = `<label>${escapeHtml(field.label)}</label>`;
  const preview = document.createElement(field.type === 'video' ? 'video' : 'img');
  preview.className = 'thumb';
  // Don't auto-download big video files just for a preview — load on play only.
  if (field.type === 'video') { preview.controls = true; preview.preload = 'none'; preview.muted = true; }
  // Only show the preview when there's a source, so empty fields don't render a broken-image icon.
  const setPreview = (src) => { if (src) { preview.src = src; preview.hidden = false; } else { preview.removeAttribute('src'); preview.hidden = true; } };
  setPreview(value);
  const url = document.createElement('input'); url.type = 'text'; url.value = value ?? '';
  url.placeholder = 'paste a URL or upload →';
  url.addEventListener('input', () => { onChange(url.value); setPreview(url.value); markDirty(); });
  const file = document.createElement('input'); file.type = 'file';
  file.accept = field.type === 'video' ? 'video/*' : 'image/*';
  const status = document.createElement('span'); status.className = 'muted';
  file.addEventListener('change', async () => {
    if (!file.files[0]) return;
    status.textContent = 'Uploading…';
    try {
      const publicUrl = await uploadFile(file.files[0], CURRENT);
      url.value = publicUrl; setPreview(publicUrl); onChange(publicUrl); markDirty();
      status.textContent = 'Uploaded ✓';
    } catch (e) { status.textContent = 'Upload failed: ' + e.message; }
  });
  wrap.append(preview, url, file, status);
  return wrap;
}

window.addEventListener('beforeunload', (e) => { if (DIRTY || isMediaPacksDirty()) { e.preventDefault(); e.returnValue = ''; } });
