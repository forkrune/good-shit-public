import { normalizeText, tokenize, unique } from './src-core-normalization.af19f5c7bc33.mjs';
import { geometryBbox, geometryCentroid } from './src-core-geo.a34d5b20ddb0.mjs';
import { tierRank } from './src-core-constants.2abfb1694768.mjs';
import { customCardSignals, isPublicCustomField } from './src-core-custom-metadata.8ebf9987f71d.mjs';
import { foodCardHighlight, foodSearchValues } from './src-core-food.f1a7b089063a.mjs';
import { presentationIconForEntity } from './src-core-presentation-icons.b0ffba967598.mjs';
import { hikingCardSignals, hikingDocumentMatchesFilters, hikingSearchSummary, hikingSearchValues } from './src-core-hiking-state.ddcbbad088c7.mjs';

const FIELD_WEIGHTS = Object.freeze({
  canonicalName: 12,
  localName: 10,
  aliases: 9,
  transliterations: 9,
  categories: 7,
  subcategories: 6,
  tags: 6,
  food: 8,
  hiking: 8,
  geography: 5,
  custom: 5,
  whyWorthwhile: 3,
  summary: 3,
  description: 1
});

const HIKING_NUMERIC_RANGES = Object.freeze({
  'hiking.distanceKm': { label: 'Distance', unit: 'km', step: 0.5 },
  'hiking.ascentM': { label: 'Ascent', unit: 'm', step: 50 },
  'hiking.durationMinutes': { label: 'Duration', unit: 'min', step: 30 }
});

export function latestExternalRating(entity) {
  const history = [...(entity.externalRatings ?? [])].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  return history.at(-1) ?? null;
}

export function customSearchValues(entity, customConfig) {
  const namespace = entity.custom?.namespace;
  const config = customConfig?.namespaces?.[namespace];
  if (!config) return [];
  const values = entity.custom.values ?? {};
  const output = [];
  for (const [fieldName, field] of Object.entries(config.fields)) {
    if (!isPublicCustomField(field) || !field.searchable) continue;
    const value = values[fieldName];
    if (Array.isArray(value)) output.push(...value.map(String));
    else if (value !== undefined && value !== null) output.push(String(value));
  }
  return output;
}

export function customFacetValues(entity, customConfig) {
  const namespace = entity.custom?.namespace;
  const config = customConfig?.namespaces?.[namespace];
  if (!config) return {};
  const result = {};
  for (const [fieldName, field] of Object.entries(config.fields)) {
    if (!isPublicCustomField(field) || !field.facet) continue;
    const value = entity.custom.values?.[fieldName];
    if (value !== undefined && value !== null) result[`${namespace}.${fieldName}`] = value;
  }
  return result;
}

export function customNumericFacetValues(entity, customConfig) {
  const namespace = entity.custom?.namespace;
  const config = customConfig?.namespaces?.[namespace];
  if (!config) return {};
  const result = {};
  for (const [fieldName, field] of Object.entries(config.fields)) {
    if (!isPublicCustomField(field) || !field.rangeFacet || !['number', 'integer'].includes(field.type)) continue;
    const value = entity.custom.values?.[fieldName];
    if (Number.isFinite(value)) result[`${namespace}.${fieldName}`] = value;
  }
  return result;
}

function hikingNumericFacetValues(hiking) {
  if (!hiking?.variants?.length) return {};
  return {
    'hiking.distanceKm': hiking.variants.map((variant) => variant.distanceKm).filter(Number.isFinite),
    'hiking.ascentM': hiking.variants.map((variant) => variant.ascentM).filter(Number.isFinite),
    'hiking.durationMinutes': hiking.variants.map((variant) => variant.durationMinutes).filter(Number.isFinite)
  };
}

function addWeightedTokens(target, values, weight) {
  for (const value of Array.isArray(values) ? values : [values]) {
    for (const token of tokenize(value)) {
      const current = target.get(token) ?? 0;
      target.set(token, Math.max(current, weight));
    }
  }
}

export function weightedEntityTokens(entity, customConfig) {
  const tokens = new Map();
  addWeightedTokens(tokens, entity.names.canonical, FIELD_WEIGHTS.canonicalName);
  addWeightedTokens(tokens, entity.names.local ?? [], FIELD_WEIGHTS.localName);
  addWeightedTokens(tokens, entity.names.aliases ?? [], FIELD_WEIGHTS.aliases);
  addWeightedTokens(tokens, entity.names.transliterations ?? [], FIELD_WEIGHTS.transliterations);
  addWeightedTokens(tokens, entity.categories ?? [], FIELD_WEIGHTS.categories);
  addWeightedTokens(tokens, entity.subcategories ?? [], FIELD_WEIGHTS.subcategories);
  addWeightedTokens(tokens, entity.tags ?? [], FIELD_WEIGHTS.tags);
  addWeightedTokens(tokens, foodSearchValues(entity), FIELD_WEIGHTS.food);
  addWeightedTokens(tokens, hikingSearchValues(entity), FIELD_WEIGHTS.hiking);
  addWeightedTokens(tokens, [
    entity.location.country,
    entity.location.countryCode,
    entity.location.region,
    entity.location.locality,
    entity.location.address
  ].filter(Boolean), FIELD_WEIGHTS.geography);
  addWeightedTokens(tokens, customSearchValues(entity, customConfig), FIELD_WEIGHTS.custom);
  addWeightedTokens(tokens, entity.whyWorthwhile, FIELD_WEIGHTS.whyWorthwhile);
  addWeightedTokens(tokens, entity.summary, FIELD_WEIGHTS.summary);
  addWeightedTokens(tokens, entity.description, FIELD_WEIGHTS.description);
  return tokens;
}

export function buildSearchDocument(entity, customConfig, imageManifest = null) {
  const latestRating = latestExternalRating(entity);
  const bbox = geometryBbox(entity.geometry);
  const centroid = geometryCentroid(entity.geometry);
  const foodHighlight = foodCardHighlight(entity);
  const hiking = hikingSearchSummary(entity);
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.names.canonical,
    localName: entity.names.local ?? null,
    summary: entity.summary,
    whyWorthwhile: entity.whyWorthwhile,
    entityType: entity.entityType,
    iconKey: presentationIconForEntity(entity),
    countryCode: entity.location.countryCode,
    country: entity.location.country,
    region: entity.location.region ?? null,
    locality: entity.location.locality ?? null,
    categories: entity.categories,
    subcategories: entity.subcategories ?? [],
    tags: entity.tags,
    tier: entity.tier,
    geometryType: entity.geometry.type,
    centroid,
    bbox,
    customNamespace: entity.custom.namespace,
    customFacets: customFacetValues(entity, customConfig),
    numericFacets: { ...customNumericFacetValues(entity, customConfig), ...hikingNumericFacetValues(hiking) },
    cardSignals: [...hikingCardSignals(entity), ...customCardSignals(entity, customConfig)],
    ...(foodHighlight ? { foodHighlight } : {}),
    ...(hiking ? { hiking } : {}),
    latestExternalRating: latestRating ? {
      provider: latestRating.provider,
      rating: latestRating.rating,
      scale: latestRating.scale,
      reviewCount: latestRating.reviewCount,
      observedAt: latestRating.observedAt
    } : null,
    coverImage: (() => {
      const reference = (entity.images ?? []).find((image) => image.role === 'cover');
      const asset = reference ? imageManifest?.assets?.[reference.assetId] : null;
      return reference && asset ? { assetId: reference.assetId, alt: reference.alt, variants: asset.variants } : null;
    })(),
    demo: Boolean(entity.demo)
  };
}

export function buildGlobalSearchIndex(entities, customConfig) {
  const sorted = [...entities].sort((a, b) => a.id.localeCompare(b.id));
  const docs = sorted.map((entity) => {
    const document = buildSearchDocument(entity, customConfig);
    return {
      id: document.id,
      shard: document.countryCode.toLowerCase(),
      name: document.name,
      countryCode: document.countryCode,
      locality: document.locality,
      entityType: document.entityType,
      categories: document.categories,
      tier: document.tier,
      customFacets: document.customFacets,
      ...(document.hiking ? { hiking: { variantCount: document.hiking.variantCount, importantCondition: document.hiking.importantCondition } } : {})
    };
  });
  const postings = new Map();
  sorted.forEach((entity, documentIndex) => {
    for (const [token, weight] of weightedEntityTokens(entity, customConfig)) {
      const list = postings.get(token) ?? [];
      list.push([documentIndex, weight]);
      postings.set(token, list);
    }
  });
  const terms = [...postings.entries()].sort(([a], [b]) => a.localeCompare(b));
  return { schemaVersion: 1, documentCount: docs.length, docs, terms };
}

function lowerBound(terms, target) {
  let low = 0;
  let high = terms.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (terms[middle][0] < target) low = middle + 1;
    else high = middle;
  }
  return low;
}

function postingsForQueryToken(index, token, prefixLimit = 160) {
  const terms = index.terms;
  const exactIndex = lowerBound(terms, token);
  const matches = [];
  if (terms[exactIndex]?.[0] === token) matches.push([terms[exactIndex][1], 1.15]);
  if (token.length >= 2) {
    let cursor = exactIndex;
    while (cursor < terms.length && terms[cursor][0].startsWith(token) && matches.length < prefixLimit) {
      if (terms[cursor][0] !== token) matches.push([terms[cursor][1], 0.78]);
      cursor += 1;
    }
  }
  const merged = new Map();
  for (const [postings, multiplier] of matches) {
    for (const [docIndex, weight] of postings) merged.set(docIndex, Math.max(merged.get(docIndex) ?? 0, weight * multiplier));
  }
  return merged;
}

export function querySearchIndex(index, query, options = {}) {
  const tokens = unique(tokenize(query));
  const limit = options.limit ?? 250;
  if (!tokens.length) return index.docs.slice(0, limit).map((doc, position) => ({ ...doc, score: 1 / (position + 1) }));
  const perToken = tokens.map((token) => postingsForQueryToken(index, token, options.prefixLimit));
  if (perToken.some((postings) => postings.size === 0)) return [];
  perToken.sort((a, b) => a.size - b.size);
  const scores = new Map(perToken[0]);
  for (const postings of perToken.slice(1)) {
    for (const documentIndex of [...scores.keys()]) {
      const score = postings.get(documentIndex);
      if (score === undefined) scores.delete(documentIndex);
      else scores.set(documentIndex, scores.get(documentIndex) + score);
    }
  }
  return [...scores.entries()]
    .map(([documentIndex, score]) => ({ ...index.docs[documentIndex], score }))
    .sort((a, b) => b.score - a.score || tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function includesValue(values, expected) {
  if (Array.isArray(values)) return values.map((value) => normalizeText(value)).includes(normalizeText(expected));
  return normalizeText(values) === normalizeText(expected);
}

function numericRangeMatches(rawValues, range) {
  const values = (Array.isArray(rawValues) ? rawValues : [rawValues]).filter(Number.isFinite);
  if (!values.length) return false;
  const minimum = Number.isFinite(range?.min) ? range.min : null;
  const maximum = Number.isFinite(range?.max) ? range.max : null;
  return values.some((value) => (minimum == null || value >= minimum) && (maximum == null || value <= maximum));
}

export function documentMatchesFilters(document, filters = {}, personalRecord = null) {
  if (filters.countryCode && document.countryCode !== filters.countryCode) return false;
  if (filters.entityType && document.entityType !== filters.entityType) return false;
  if (filters.category && !document.categories.includes(filters.category)) return false;
  if (filters.tiers?.length && !filters.tiers.includes(document.tier)) return false;
  for (const [facetKey, expected] of Object.entries(filters.facets ?? {})) {
    if (expected === '' || expected === null || expected === undefined) continue;
    if (!includesValue(document.customFacets?.[facetKey], expected)) return false;
  }
  for (const [facetKey, range] of Object.entries(filters.numericRanges ?? {})) {
    if (!Number.isFinite(range?.min) && !Number.isFinite(range?.max)) continue;
    if (!numericRangeMatches(document.numericFacets?.[facetKey], range)) return false;
  }
  if (!hikingDocumentMatchesFilters(document, filters)) return false;
  if (filters.favourite === true && personalRecord?.favourite?.value !== true) return false;
  if (filters.visited === true && personalRecord?.visited?.value !== true) return false;
  if (filters.unvisited === true && personalRecord?.visited?.value === true) return false;
  if (filters.rated === true && personalRecord?.personalRating?.value == null) return false;
  if (filters.withNotes === true && !personalRecord?.notes?.value?.trim()) return false;
  if (filters.minimumPersonalRating && (personalRecord?.personalRating?.value ?? 0) < filters.minimumPersonalRating) return false;
  return true;
}

function numericRangeDefinitions(documents, customConfig) {
  const metadata = new Map(Object.entries(HIKING_NUMERIC_RANGES));
  for (const [namespace, namespaceConfig] of Object.entries(customConfig.namespaces ?? {})) {
    for (const [fieldName, field] of Object.entries(namespaceConfig.fields ?? {})) {
      if (!isPublicCustomField(field) || !field.rangeFacet || !['number', 'integer'].includes(field.type)) continue;
      metadata.set(`${namespace}.${fieldName}`, { label: field.label ?? fieldName, ...(field.unit ? { unit: field.unit } : {}), step: Number.isFinite(field.step) ? field.step : field.type === 'integer' ? 1 : 0.1 });
    }
  }
  const output = [];
  for (const [key, definition] of metadata) {
    const values = documents.flatMap((document) => {
      const raw = document.numericFacets?.[key];
      return (Array.isArray(raw) ? raw : [raw]).filter(Number.isFinite);
    });
    if (!values.length) continue;
    output.push({ key, ...definition, min: Math.min(...values), max: Math.max(...values), count: values.length });
  }
  return output.sort((a, b) => a.label.localeCompare(b.label) || a.key.localeCompare(b.key));
}

export function collectFacets(documents, customConfig) {
  const countries = new Map();
  const categories = new Map();
  const entityTypes = new Map();
  const tiers = new Map();
  const custom = new Map();
  const hikingDifficulties = new Map();
  const hikingRouteTypes = new Map();
  const hikingSeasons = new Map();
  const increment = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  for (const document of documents) {
    increment(countries, document.countryCode);
    increment(entityTypes, document.entityType);
    increment(tiers, document.tier);
    for (const category of document.categories) increment(categories, category);
    for (const [key, rawValue] of Object.entries(document.customFacets ?? {})) {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      for (const value of values) increment(custom, `${key}::${String(value)}`);
    }
    const seenDifficulty = new Set();
    const seenRouteType = new Set();
    const seenSeason = new Set();
    for (const variant of document.hiking?.variants ?? []) {
      if (variant.difficulty && !seenDifficulty.has(variant.difficulty)) { increment(hikingDifficulties, variant.difficulty); seenDifficulty.add(variant.difficulty); }
      if (variant.routeType && !seenRouteType.has(variant.routeType)) { increment(hikingRouteTypes, variant.routeType); seenRouteType.add(variant.routeType); }
      for (const season of variant.seasonality ?? []) if (!seenSeason.has(season)) { increment(hikingSeasons, season); seenSeason.add(season); }
    }
  }
  const facetDefinitions = [];
  for (const [namespace, namespaceConfig] of Object.entries(customConfig.namespaces)) {
    for (const [fieldName, field] of Object.entries(namespaceConfig.fields)) {
      if (!isPublicCustomField(field) || !field.facet) continue;
      const key = `${namespace}.${fieldName}`;
      const values = [...custom.entries()]
        .filter(([fullKey]) => fullKey.startsWith(`${key}::`))
        .map(([fullKey, count]) => ({ value: fullKey.slice(key.length + 2), count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
      if (values.length) facetDefinitions.push({ key, label: field.label ?? fieldName, values });
    }
  }
  const mapToArray = (map) => [...map.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  const numericRanges = numericRangeDefinitions(documents, customConfig);
  const hikingRange = (key) => numericRanges.find((range) => range.key === key) ?? null;
  const hikingAvailable = documents.some((document) => document.hiking?.variants?.length);
  return {
    countries: mapToArray(countries),
    categories: mapToArray(categories),
    entityTypes: mapToArray(entityTypes),
    tiers: mapToArray(tiers),
    custom: facetDefinitions,
    numericRanges,
    hiking: {
      available: hikingAvailable,
      difficulties: mapToArray(hikingDifficulties),
      routeTypes: mapToArray(hikingRouteTypes),
      seasons: mapToArray(hikingSeasons),
      ranges: {
        distanceKm: hikingRange('hiking.distanceKm'),
        ascentM: hikingRange('hiking.ascentM'),
        durationMinutes: hikingRange('hiking.durationMinutes')
      }
    }
  };
}
