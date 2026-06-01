// Pure path + escaping helpers. No DOM, no network.
export function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
export function setByPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  let cur = obj;
  for (const k of keys) { if (typeof cur[k] !== 'object' || cur[k] == null) cur[k] = {}; cur = cur[k]; }
  cur[last] = value;
  return obj;
}
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Plain-text → safe HTML for owner-edited fields.
// Convention: *word* = red emphasis, a line break = <br>. Everything is escaped,
// so typing plain text "just works" and there's no HTML to read or break.
function emphasize(escaped) {
  return escaped.replace(/\*([^*\n]+)\*/g, '<span class="text-redHot">$1</span>');
}
export function formatInline(s) {
  return emphasize(escapeHtml(s)).replace(/\n/g, '<br>');
}
export function formatBlocks(s) {
  const text = String(s ?? '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  return text.split(/\n{2,}/)
    .map(block => `<p>${emphasize(escapeHtml(block)).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
