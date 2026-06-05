// PDF/PNG export for media-pack posters.
// fitPageSize is pure (in pdf-math.js, unit-tested). The rest touches the DOM/canvas.
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm';
import { toPng } from 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';
import { fitPageSize } from './pdf-math.js';
export { fitPageSize };

const loadOne = (src) => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });

// Wait for fonts, every <img>, AND every CSS background-image (the hero/about
// photos are backgrounds, not <img> tags — they must be loaded before snapshot
// or they come out blank).
async function waitForReady(node) {
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }
  const imgs = Array.from(node.querySelectorAll('img'));
  const bgUrls = [];
  node.querySelectorAll('*').forEach(el => {
    const m = getComputedStyle(el).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (m && m[1] && !m[1].startsWith('data:')) bgUrls.push(m[1]);
  });
  await Promise.all([
    ...imgs.map(img => img.complete && img.naturalWidth ? Promise.resolve()
      : new Promise(res => { img.onload = img.onerror = res; })),
    ...bgUrls.map(loadOne),
  ]);
}

// Snapshot a full-size node to a PNG data URL at the given pixel scale.
export async function snapshot(node, { w, h, scale = 2 } = {}) {
  await waitForReady(node);
  // cacheBust:false → reuse the already-loaded (preloaded) resources instead of
  // re-fetching, which is what dropped the hero photo. html-to-image can also
  // miss images/fonts on the first pass, so warm up once, then capture.
  const opts = { width: w, height: h, pixelRatio: scale, cacheBust: false, style: { transform: 'none', margin: '0' } };
  await toPng(node, opts);
  return toPng(node, opts);
}

// Build + download a single-page PDF from a full-size node.
export async function exportPdf(node, { w, h, filename = 'media-pack.pdf', scale = 2 } = {}) {
  const dataUrl = await snapshot(node, { w, h, scale });
  const page = fitPageSize(w, h);
  const pdf = new jsPDF({ orientation: page.orientation, unit: page.unit, format: page.format });
  pdf.addImage(dataUrl, 'PNG', 0, 0, page.width, page.height, undefined, 'FAST');
  pdf.save(filename);
}

// Download a PNG from a full-size node.
export async function exportPng(node, { w, h, filename = 'media-pack.png', scale = 2 } = {}) {
  const dataUrl = await snapshot(node, { w, h, scale });
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename; a.click();
}
