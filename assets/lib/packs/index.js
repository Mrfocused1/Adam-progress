import combat from './combat-analytics.js';
// Templates 2 & 3 are added here when their references arrive.
export const TEMPLATES = [combat];
export const byKey = (k) => TEMPLATES.find(t => t.key === k);
