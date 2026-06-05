// Convert a design's pixel size to a jsPDF page spec in points (1 design px → 1 pt;
// only the aspect ratio matters for a single full-bleed image).
export function fitPageSize(w, h) {
  return {
    orientation: w >= h ? 'landscape' : 'portrait',
    unit: 'pt',
    width: w,
    height: h,
    format: [w, h],
  };
}
