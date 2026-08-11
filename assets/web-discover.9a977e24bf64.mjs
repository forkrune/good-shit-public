import { documentMatchesFilters, querySearchIndex } from './src-core-search.d6ad955b4d5f.mjs';
import { tierRank } from './src-core-constants.2abfb1694768.mjs';
import { renderEntityGrid } from './web-client-render.557e22e4f657.mjs';
import { personalStateService } from './web-storage.50d07a5c3bbd.mjs';
import { hydratePersonalState, showToast } from './web-app.cad986d21761.mjs';

const configElement = document.querySelector('#page-config');
const config = configElement ? JSON.parse(configElement.textContent) : {};
const form = document.querySelector('#discover-form');
const results = document.querySelector('#discover-results');
const count = document.querySelector('#discover-count');
const loading = document.querySelector('#discover-loading');
const searchInput = document.querySelector('#global-search');
const clearSearch = document.querySelector('#clear-search');
const hikingFilterSet = document.querySelector('#hiking-filter-set');

let manifestPromise = null;
let globalIndexPromise = null;
const shardPromises = new Map();
let generation = 0;
let debounceTimer = null;

function fetchJson(url) {
  return fetch(url, { headers: { Accept: 'application/json' } }).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
    return response.json();
  });
}

function manifest() {
  manifestPromise ??= fetchJson(config.searchManifestUrl);
  return manifestPromise;
}

async function globalIndex() {
  const searchManifest = await manifest();
  globalIndexPromise ??= fetchJson(searchManifest.global.url);
  return globalIndexPromise;
}

async function shard(code) {
  const searchManifest = await manifest();
  const key = String(code).toLowerCase();
  const descriptor = searchManifest.shards[key];
  if (!descriptor) return { documents: [] };
  if (!shardPromises.has(key)) shardPromises.set(key, fetchJson(descriptor.url));
  return shardPromises.get(key);
}

function selectedValues(name) {
  return [...form.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function hikingFilters() {
  if (!hikingFilterSet) return {};
  const values = {};
  for (const element of hikingFilterSet.querySelectorAll('[data-hiking-filter]')) {
    const key = element.dataset.hikingFilter;
    if (!element.value) continue;
    if (['difficulty', 'routeType', 'seasonality'].includes(key)) values[key] = element.value;
    else if (key === 'durationMinHours') values.durationMinMinutes = optionalNumber(element.value) * 60;
    else if (key === 'durationMaxHours') values.durationMaxMinutes = optionalNumber(element.value) * 60;
    else values[key] = optionalNumber(element.value);
  }
  return values;
}

function hasActiveHikingFilters(filters) {
  return Object.values(filters.hiking ?? {}).some((value) => value !== null && value !== undefined && value !== '');
}

function readFilters() {
  const facets = {};
  for (const element of form.querySelectorAll('[data-facet-key]')) {
    if (element.value) facets[element.dataset.facetKey] = element.value;
  }
  return {
    query: searchInput.value.trim(),
    countryCode: form.elements.country?.value || null,
    entityType: form.elements.entityType?.value || null,
    category: form.elements.category?.value || null,
    tiers: selectedValues('tier'),
    facets,
    hiking: hikingFilters(),
    favourite: Boolean(form.elements.favourite?.checked),
    visited: Boolean(form.elements.visited?.checked),
    unvisited: Boolean(form.elements.unvisited?.checked),
    rated: Boolean(form.elements.rated?.checked),
    withNotes: Boolean(form.elements.withNotes?.checked),
    minimumPersonalRating: Number(form.elements.minimumPersonalRating?.value || 0) || null,
    sort: form.elements.sort?.value || 'editorial'
  };
}

function sortDocuments(documents, filters, personalById, scoreById) {
  return documents.sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name);
    if (filters.sort === 'external-rating') {
      return (b.latestExternalRating?.rating ?? -1) - (a.latestExternalRating?.rating ?? -1)
        || (b.latestExternalRating?.reviewCount ?? -1) - (a.latestExternalRating?.reviewCount ?? -1)
        || a.name.localeCompare(b.name);
    }
    if (filters.sort === 'personal-rating') {
      return (personalById.get(b.id)?.personalRating?.value ?? -1) - (personalById.get(a.id)?.personalRating?.value ?? -1)
        || tierRank(a.tier) - tierRank(b.tier)
        || a.name.localeCompare(b.name);
    }
    if (filters.query) {
      return (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0)
        || tierRank(a.tier) - tierRank(b.tier)
        || a.name.localeCompare(b.name);
    }
    return tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name);
  });
}

function writeUrl(filters) {
  const parameters = new URLSearchParams();
  if (filters.query) parameters.set('q', filters.query);
  if (filters.countryCode) parameters.set('country', filters.countryCode);
  if (filters.entityType) parameters.set('type', filters.entityType);
  if (filters.category) parameters.set('category', filters.category);
  if (filters.tiers.length && filters.tiers.length < 4) parameters.set('tiers', filters.tiers.join(','));
  for (const [key, value] of Object.entries(filters.facets)) parameters.set(`facet.${key}`, value);
  for (const [key, value] of Object.entries(filters.hiking ?? {})) {
    if (value === '' || value === null || value === undefined) continue;
    const urlValue = key === 'durationMinMinutes' || key === 'durationMaxMinutes' ? value / 60 : value;
    parameters.set(`hike.${key}`, String(urlValue));
  }
  if (filters.favourite) parameters.set('favourite', '1');
  if (filters.visited) parameters.set('visited', '1');
  if (filters.unvisited) parameters.set('unvisited', '1');
  if (filters.rated) parameters.set('rated', '1');
  if (filters.withNotes) parameters.set('notes', '1');
  if (filters.minimumPersonalRating) parameters.set('rating', String(filters.minimumPersonalRating));
  if (filters.sort !== 'editorial') parameters.set('sort', filters.sort);
  const query = parameters.toString();
  history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}`);
}

function setHikingField(key, value) {
  const element = hikingFilterSet?.querySelector(`[data-hiking-filter="${key}"]`);
  if (element) element.value = value ?? '';
}

function applyUrl() {
  const parameters = new URLSearchParams(location.search);
  searchInput.value = parameters.get('q') ?? '';
  if (form.elements.country) form.elements.country.value = parameters.get('country') ?? '';
  if (form.elements.entityType) form.elements.entityType.value = parameters.get('type') ?? '';
  if (form.elements.category) form.elements.category.value = parameters.get('category') ?? '';
  const tiers = new Set((parameters.get('tiers') ?? 'S,A,B,C').split(',').filter(Boolean));
  for (const input of form.querySelectorAll('[name="tier"]')) input.checked = tiers.has(input.value);
  for (const element of form.querySelectorAll('[data-facet-key]')) element.value = parameters.get(`facet.${element.dataset.facetKey}`) ?? '';
  for (const key of ['difficulty', 'routeType', 'seasonality', 'distanceMinKm', 'distanceMaxKm', 'ascentMinM', 'ascentMaxM']) setHikingField(key, parameters.get(`hike.${key}`) ?? '');
  setHikingField('durationMinHours', parameters.get('hike.durationMinMinutes') ?? '');
  setHikingField('durationMaxHours', parameters.get('hike.durationMaxMinutes') ?? '');
  if (form.elements.favourite) form.elements.favourite.checked = parameters.get('favourite') === '1';
  if (form.elements.visited) form.elements.visited.checked = parameters.get('visited') === '1';
  if (form.elements.unvisited) form.elements.unvisited.checked = parameters.get('unvisited') === '1';
  if (form.elements.rated) form.elements.rated.checked = parameters.get('rated') === '1';
  if (form.elements.withNotes) form.elements.withNotes.checked = parameters.get('notes') === '1';
  if (form.elements.minimumPersonalRating) form.elements.minimumPersonalRating.value = parameters.get('rating') ?? '';
  if (form.elements.sort) form.elements.sort.value = parameters.get('sort') ?? 'editorial';
  clearSearch.hidden = !searchInput.value;
}

function updateHikingFilterVisibility(candidates, filters) {
  if (!hikingFilterSet) return;
  const scoped = candidates.filter((candidate) => !filters.entityType || candidate.entityType === filters.entityType);
  const relevant = filters.entityType === 'hiking-route' || scoped.some((candidate) => candidate.entityType === 'hiking-route') || hasActiveHikingFilters(filters);
  hikingFilterSet.hidden = !relevant;
}

async function executeSearch(options = {}) {
  const currentGeneration = ++generation;
  const filters = readFilters();
  if (options.updateUrl !== false) writeUrl(filters);
  loading?.classList.add('is-loading');
  results?.setAttribute('aria-busy', 'true');

  try {
    const [index, personalRecords] = await Promise.all([globalIndex(), personalStateService.getAll()]);
    if (currentGeneration !== generation) return;
    const personalById = new Map(personalRecords.map((record) => [record.entityId, record]));
    let candidates;
    if (filters.query) candidates = querySearchIndex(index, filters.query, { limit: 1000 });
    else candidates = index.docs.map((document) => ({ ...document, score: 0 }));
    if (filters.countryCode) candidates = candidates.filter((candidate) => candidate.countryCode === filters.countryCode);
    updateHikingFilterVisibility(candidates, filters);

    const shardCodes = [...new Set(candidates.map((candidate) => candidate.shard))];
    const packages = await Promise.all(shardCodes.map((code) => shard(code)));
    if (currentGeneration !== generation) return;
    const documentById = new Map(packages.flatMap((entry) => entry.documents).map((document) => [document.id, document]));
    const scoreById = new Map(candidates.map((candidate) => [candidate.id, candidate.score ?? 0]));
    const candidateIds = new Set(candidates.map((candidate) => candidate.id));
    let matched = [...documentById.values()].filter((document) => candidateIds.has(document.id));
    matched = matched.filter((document) => documentMatchesFilters(document, filters, personalById.get(document.id)));
    sortDocuments(matched, filters, personalById, scoreById);

    const maximumRendered = 240;
    const rendered = matched.slice(0, maximumRendered);
    results.innerHTML = renderEntityGrid(rendered, {
      basePath: config.basePath,
      emptyTitle: 'No curated places match these filters.'
    });
    count.innerHTML = `<strong>${matched.length.toLocaleString()}</strong> curated result${matched.length === 1 ? '' : 's'}${matched.length > maximumRendered ? ` · showing first ${maximumRendered}` : ''}`;
    await hydratePersonalState(results);
  } catch (error) {
    console.error(error);
    results.innerHTML = renderEntityGrid([], {
      basePath: config.basePath,
      emptyTitle: 'Search assets could not be loaded.',
      emptyText: 'The pre-rendered catalogue remains available through country and category pages. Reload the page to try again.'
    });
    count.textContent = 'Search unavailable';
    showToast(error.message ?? 'Search failed.', { error: true, duration: 6000 });
  } finally {
    if (currentGeneration === generation) {
      loading?.classList.remove('is-loading');
      results?.removeAttribute('aria-busy');
    }
  }
}

function scheduleSearch(delay = 140) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void executeSearch(), delay);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  void executeSearch();
});
form.addEventListener('change', () => scheduleSearch(0));
searchInput.addEventListener('input', () => {
  clearSearch.hidden = !searchInput.value;
  scheduleSearch();
});
clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch.hidden = true;
  searchInput.focus();
  scheduleSearch(0);
});
document.querySelector('#reset-filters')?.addEventListener('click', () => {
  form.reset();
  for (const input of form.querySelectorAll('[name="tier"]')) input.checked = true;
  clearSearch.hidden = true;
  void executeSearch();
});
window.addEventListener('popstate', () => {
  applyUrl();
  void executeSearch({ updateUrl: false });
});
window.addEventListener('good-shit:personal-state-change', () => {
  const filters = readFilters();
  if (filters.favourite || filters.visited || filters.unvisited || filters.rated || filters.withNotes || filters.minimumPersonalRating || filters.sort === 'personal-rating') {
    scheduleSearch(0);
  }
});

applyUrl();
if (location.search) void executeSearch({ updateUrl: false });
