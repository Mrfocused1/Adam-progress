import combat from './combat-analytics.js';
import people from './people-movement.js';
// Template 3 is added here when its reference arrives.
export const TEMPLATES = [combat, people];
export const byKey = (k) => TEMPLATES.find(t => t.key === k);
