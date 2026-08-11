import { normalizeText, slugify } from './src-core-normalization.af19f5c7bc33.mjs';

/**
 * Convert a human-supplied tag into the stable catalogue key used at compile time.
 * Tags are identifiers, not display strings: casing, accents, punctuation and spacing
 * are deliberately normalized so independently researched variants converge.
 */
export function canonicalTagKey(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed ? slugify(trimmed) : '';
}

/**
 * Canonicalize and deduplicate a tag array while retaining deterministic input order.
 */
export function normalizeTags(values = []) {
  if (!Array.isArray(values)) return values;
  const seen = new Set();
  const output = [];
  for (const value of values) {
    if (typeof value !== 'string') {
      output.push(value);
      continue;
    }
    const tag = canonicalTagKey(value);
    const identity = normalizeText(tag);
    if (!identity || seen.has(identity)) continue;
    seen.add(identity);
    output.push(tag);
  }
  return output;
}

/**
 * Turn a canonical tag key into its human-facing chip label.
 */
export function tagLabel(value) {
  const tag = canonicalTagKey(value);
  if (typeof tag !== 'string' || !tag) return '';
  return tag
    .split('-')
    .filter(Boolean)
    .map((part) => {
      const characters = [...part];
      const first = characters.shift() ?? '';
      return `${first.toLocaleUpperCase('und')}${characters.join('')}`;
    })
    .join(' ');
}

export function tagLabels(values = []) {
  const normalized = normalizeTags(values);
  if (!Array.isArray(normalized)) return [];
  return normalized
    .filter((tag) => tag !== 'demo')
    .map(tagLabel)
    .filter(Boolean);
}

function displayPreference(label) {
  const letters = [...label].filter((character) => /\p{L}/u.test(character));
  if (!letters.length) return 0;
  const hasUpper = letters.some((character) => character === character.toLocaleUpperCase('und') && character !== character.toLocaleLowerCase('und'));
  const allLower = letters.every((character) => character === character.toLocaleLowerCase('und'));
  return hasUpper && !allLower ? 1 : 0;
}

/**
 * Deduplicate presentation chips across structured signals, tags and subcategories.
 * Identity is intentionally broader than exact-string equality, so e.g.
 * "major detour", "Major Detour" and "major-detour" are one visible signal.
 * When two equivalent labels exist, prefer the more display-ready capitalization.
 */
export function uniquePresentationLabels(values = []) {
  const positions = new Map();
  const output = [];
  for (const value of values) {
    const label = String(value ?? '').trim();
    if (!label) continue;
    const identity = normalizeText(label);
    if (!identity) continue;
    const existingPosition = positions.get(identity);
    if (existingPosition === undefined) {
      positions.set(identity, output.length);
      output.push(label);
      continue;
    }
    if (displayPreference(label) > displayPreference(output[existingPosition])) output[existingPosition] = label;
  }
  return output;
}
