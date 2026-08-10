const COMBINING_MARKS = /\p{M}+/gu;
const WORD_BREAKS = /[^\p{L}\p{N}]+/gu;

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLocaleLowerCase('und')
    .replace(/[’'`]/g, '')
    .replace(WORD_BREAKS, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function tokenize(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
}

export function slugify(value) {
  return normalizeText(value).replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

export function unique(values) {
  return [...new Set(values)];
}

export function stableUnique(values, key = (value) => JSON.stringify(value)) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const identity = key(value);
    if (!seen.has(identity)) {
      seen.add(identity);
      output.push(value);
    }
  }
  return output;
}

export function getPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isIsoDateTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return '';
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function deepClone(value) {
  return structuredClone(value);
}
