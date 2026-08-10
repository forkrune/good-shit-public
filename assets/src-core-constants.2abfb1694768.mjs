export const TIERS = Object.freeze(['S', 'A', 'B', 'C', 'D', 'E', 'F', 'unranked']);
export const PUBLIC_TIERS = Object.freeze(['S', 'A', 'B', 'C']);
export const EDITORIAL_STATUSES = Object.freeze([
  'candidate',
  'published',
  'needs-review',
  'rejected',
  'deprecated',
  'closed'
]);
export const EDITORIAL_RECOMMENDATIONS = Object.freeze(['publish', 'review', 'reject', 'unpublish']);
export const LINK_KINDS = Object.freeze([
  'official',
  'google-maps',
  'openstreetmap',
  'reservation',
  'trail-source',
  'research',
  'other'
]);
export const PERSONAL_STATE_SCHEMA_VERSION = 1;
export const CATALOGUE_SCHEMA_VERSION = 1;

export function isPublicEntity(entity) {
  return entity?.editorial?.status === 'published' && PUBLIC_TIERS.includes(entity?.tier);
}

export function tierRank(tier) {
  const rank = { S: 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, unranked: 7 };
  return rank[tier] ?? 99;
}

export function tierLabel(tier) {
  return {
    S: 'Exceptional',
    A: 'Excellent',
    B: 'Very good',
    C: 'Good',
    D: 'Mediocre',
    E: 'Poor',
    F: 'Avoid',
    unranked: 'Unranked'
  }[tier] ?? tier;
}
