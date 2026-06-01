import { supabase } from './lib/supabase.js';

const ALLOWED = ['tibaba.prg@gmail.com', 'paulshonowo2@gmail.com'];
const $ = (id) => document.getElementById(id);
const setStatus = (el, msg, kind) => { el.textContent = msg; el.className = 'status' + (kind ? ' is-' + kind : ''); };

async function sendCode() {
  const email = $('email').value.trim().toLowerCase();
  if (!ALLOWED.includes(email)) { setStatus($('loginStatus'), 'That email is not authorized.', 'error'); return; }
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) { setStatus($('loginStatus'), error.message, 'error'); return; }
  $('step-email').hidden = true; $('step-code').hidden = false;
  setStatus($('loginStatus'), 'Code sent. Check your email.', 'success');
}

async function verifyCode() {
  const email = $('email').value.trim().toLowerCase();
  const token = $('code').value.trim();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) { setStatus($('loginStatus'), error.message, 'error'); return; }
  await showDashboard();
}

async function showDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email?.toLowerCase();
  if (!session || !ALLOWED.includes(email)) { await supabase.auth.signOut(); return; }
  $('loginView').hidden = true; $('dashView').hidden = false;
  await initDashboard(session);
}

async function logout() { await supabase.auth.signOut(); location.reload(); }

$('sendCode')?.addEventListener('click', sendCode);
$('verifyCode')?.addEventListener('click', verifyCode);

// Auto-resume an existing session (and handle magic-link return).
supabase.auth.getSession().then(({ data }) => { if (data.session) showDashboard(); });
supabase.auth.onAuthStateChange((_e, session) => { if (session) showDashboard(); });

window.__adminLogout = logout;          // wired to the Log out button in Task 7
async function initDashboard() {}        // placeholder; replaced in Task 7
