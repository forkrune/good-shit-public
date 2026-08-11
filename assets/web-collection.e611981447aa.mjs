import { renderEntityGrid, renderOrphanRecord } from './web-client-render.557e22e4f657.mjs';
import { personalStateService } from './web-storage.50d07a5c3bbd.mjs';
import { hydratePersonalState, showToast } from './web-app.cad986d21761.mjs';
import { normalizeText } from './src-core-normalization.af19f5c7bc33.mjs';
import { tierRank } from './src-core-constants.2abfb1694768.mjs';
import { renderUiIcon } from './src-core-ui-icons.eb64a1f4d6b3.mjs';

const configNode = document.querySelector('#page-config');
const config = configNode ? JSON.parse(configNode.textContent) : {};
const results = document.querySelector('#collection-results');
const orphanResults = document.querySelector('#orphan-results');
const searchInput = document.querySelector('#collection-search');
const importInput = document.querySelector('#import-state-file');
const clearDialog = document.querySelector('#clear-state-dialog');
let referencesPromise = null;
let currentView = new URLSearchParams(location.search).get('view') || 'favourites';
let renderGeneration = 0;

function fetchJson(url) {
  return fetch(url, { headers: { Accept: 'application/json' } }).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
    return response.json();
  });
}

function references() {
  referencesPromise ??= fetchJson(config.entityReferenceUrl);
  return referencesPromise;
}

function emptyRecord(entityId) {
  return {
    entityId,
    favourite: { value: false },
    visited: { value: false, dates: [] },
    personalRating: { value: null },
    notes: { value: '' }
  };
}

function matchesView(document, record) {
  switch (currentView) {
    case 'visited': return record.visited.value;
    case 'unvisited': return !record.visited.value;
    case 'rated': return record.personalRating.value != null;
    case 'notes': return Boolean(record.notes.value.trim());
    case 'all-personal': return record.favourite.value || record.visited.value || record.personalRating.value != null || Boolean(record.notes.value.trim());
    case 'favourites':
    default: return record.favourite.value;
  }
}

function sortForView(documents, recordById) {
  return documents.sort((a, b) => {
    const aRecord = recordById.get(a.id) ?? emptyRecord(a.id);
    const bRecord = recordById.get(b.id) ?? emptyRecord(b.id);
    if (currentView === 'rated') {
      return (bRecord.personalRating.value ?? 0) - (aRecord.personalRating.value ?? 0)
        || tierRank(a.tier) - tierRank(b.tier)
        || a.name.localeCompare(b.name);
    }
    if (currentView === 'visited') {
      return (bRecord.visited.dates.at(-1) ?? '').localeCompare(aRecord.visited.dates.at(-1) ?? '')
        || a.name.localeCompare(b.name);
    }
    return tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name);
  });
}

function updateSummary(documents, recordById, orphaned) {
  let favourites = 0;
  let visited = 0;
  let rated = 0;
  let notes = 0;
  for (const document of documents) {
    const record = recordById.get(document.id);
    if (!record) continue;
    if (record.favourite.value) favourites += 1;
    if (record.visited.value) visited += 1;
    if (record.personalRating.value != null) rated += 1;
    if (record.notes.value.trim()) notes += 1;
  }
  const values = { favourites, visited, rated, notes, orphaned: orphaned.length };
  for (const [key, value] of Object.entries(values)) {
    const target = document.querySelector(`[data-summary="${key}"]`);
    if (target) target.textContent = value.toLocaleString();
  }
}

async function renderCollection() {
  const generation = ++renderGeneration;
  results.setAttribute('aria-busy', 'true');
  try {
    const [referencePackage, records] = await Promise.all([references(), personalStateService.getAll()]);
    if (generation !== renderGeneration) return;
    const documents = referencePackage.documents ?? [];
    const knownIds = new Set(documents.map((document) => document.id));
    const recordById = new Map(records.map((record) => [record.entityId, record]));
    const query = normalizeText(searchInput.value.trim());
    let visible = documents.filter((document) => {
      const record = recordById.get(document.id) ?? emptyRecord(document.id);
      if (!matchesView(document, record)) return false;
      if (!query) return true;
      return normalizeText([document.name, document.localName, document.summary, document.country, document.locality, ...(document.tags ?? [])].filter(Boolean).join(' ')).includes(query);
    });
    sortForView(visible, recordById);
    results.innerHTML = renderEntityGrid(visible, {
      basePath: config.basePath,
      emptyTitle: currentView === 'unvisited' ? 'Everything here has been marked visited.' : 'Nothing in this personal view yet.',
      emptyText: currentView === 'unvisited'
        ? 'Unvisited includes every currently published catalogue entity without a visited mark.'
        : 'Use the heart, visited controls, private ratings or notes on any entity to build this collection.'
    });
    const orphaned = records.filter((record) => !knownIds.has(record.entityId));
    const filteredOrphans = query
      ? orphaned.filter((record) => normalizeText(`${record.snapshot?.name ?? ''} ${record.notes?.value ?? ''} ${record.entityId}`).includes(query))
      : orphaned;
    orphanResults.innerHTML = filteredOrphans.length
      ? `<div class="section-header"><div><span class="eyebrow">Retained by immutable ID</span><h2>Unavailable catalogue entities</h2><p>These records remain exportable even after depublishing, removal or a catalogue refresh.</p></div></div><div class="entity-grid">${filteredOrphans.map(renderOrphanRecord).join('')}</div>`
      : '';
    updateSummary(documents, recordById, orphaned);
    document.querySelector('#collection-count').textContent = `${visible.length.toLocaleString()} place${visible.length === 1 ? '' : 's'}`;
    await hydratePersonalState(results);
  } catch (error) {
    console.error(error);
    results.innerHTML = `<div class="empty-state">${renderUiIcon(config.uiIconSpriteUrl, 'warning', 'ui-icon empty-icon')}<h2>Personal collection could not be loaded.</h2><p>${String(error.message ?? error)}</p></div>`;
    showToast('Personal collection could not be loaded.', { error: true, duration: 6000 });
  } finally {
    if (generation === renderGeneration) results.removeAttribute('aria-busy');
  }
}

function setView(view) {
  currentView = view;
  for (const button of document.querySelectorAll('[data-collection-view]')) {
    const selected = button.dataset.collectionView === view;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  const parameters = new URLSearchParams(location.search);
  parameters.set('view', view);
  history.replaceState(null, '', `${location.pathname}?${parameters}`);
  void renderCollection();
}

async function exportState() {
  try {
    const referencePackage = await references();
    const payload = await personalStateService.export({ knownEntityIds: referencePackage.documents.map((document) => document.id) });
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `good-shit-personal-state-${payload.exportedAt.slice(0, 10)}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Exported ${payload.records.length} personal record${payload.records.length === 1 ? '' : 's'}.`);
  } catch (error) {
    console.error(error);
    showToast(error.message ?? 'Export failed.', { error: true });
  }
}

async function importState(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) throw new Error('Import is larger than the 10 MB safety limit.');
  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }
  const result = await personalStateService.import(payload);
  const status = document.querySelector('#import-result');
  status.textContent = `Merged ${result.imported} record${result.imported === 1 ? '' : 's'}; ${result.conflicts} retained conflict${result.conflicts === 1 ? '' : 's'}. Existing data was not silently replaced.`;
  showToast(`Import merged ${result.imported} personal record${result.imported === 1 ? '' : 's'}.`);
  await renderCollection();
}

document.querySelector('#export-state')?.addEventListener('click', () => void exportState());
document.querySelector('#import-state')?.addEventListener('click', () => importInput.click());
importInput.addEventListener('change', async () => {
  try { await importState(importInput.files?.[0]); }
  catch (error) { console.error(error); showToast(error.message ?? 'Import failed.', { error: true, duration: 6000 }); }
  finally { importInput.value = ''; }
});
document.querySelector('#open-clear-state')?.addEventListener('click', () => clearDialog.showModal());
document.querySelector('#cancel-clear-state')?.addEventListener('click', () => clearDialog.close());
document.querySelector('#confirm-clear-state')?.addEventListener('click', async () => {
  await personalStateService.clear();
  clearDialog.close();
  showToast('All browser personal state was cleared.');
  await renderCollection();
});
document.querySelector('.collection-tabs')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-collection-view]');
  if (button) setView(button.dataset.collectionView);
});
searchInput.addEventListener('input', () => void renderCollection());
window.addEventListener('good-shit:personal-state-change', () => void renderCollection());
window.addEventListener('popstate', () => {
  currentView = new URLSearchParams(location.search).get('view') || 'favourites';
  setView(currentView);
});

setView(currentView);
