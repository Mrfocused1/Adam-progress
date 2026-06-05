// PDF/PNG export for media-pack posters.
// fitPageSize is pure (in pdf-math.js, unit-tested). The rest touches the DOM/canvas.
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm';
import { toPng } from 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm';
import { fitPageSize } from './pdf-math.js';
export { fitPageSize };

// Wait for fonts + every <img> inside node to finish loading.
async function waitForReady(node) {
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch {} }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map(img => img.complete && img.naturalWidth
    ? Promise.resolve()
    : new Promise(res => { img.onload = img.onerror = res; })));
}

// Snapshot a full-size node to a PNG data URL at the given pixel scale.
export async function snapshot(node, { w, h, scale = 2 } = {}) {
  await waitForReady(node);
  return toPng(node, {
    width: w, height: h, pixelRatio: scale,
    cacheBust: true,
    style: { transform: 'none', margin: '0' },
  });
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
