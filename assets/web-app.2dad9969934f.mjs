import './web-tier-presentation.439ba8ffa9d4.mjs';
if (/\/(?:tiers|tier-list)\/?$/.test(window.location.pathname)) void import('./web-tier-list.39d7bba4885e.mjs');
import { personalStateEvents, personalStateService, mutatePersonalState } from './web-storage.50d07a5c3bbd.mjs';

let toastTimer = null;
const noteTimers = new WeakMap();

function parseSnapshot(element) {
  try {
    return JSON.parse(element?.dataset?.entitySnapshot ?? '{}');
  } catch {
    return {};
  }
}

function entityContainer(element) {
  return element.closest('[data-entity-id]');
}

function localIsoDate(date = new Date()) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
}

export function showToast(message, options = {}) {
  const toast = document.querySelector('#app-status');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('is-error', Boolean(options.error));
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), options.duration ?? 2800);
}

function updateQuickActions(element, record) {
  const favourite = element.querySelector('[data-personal-action="favourite"]');
  const visited = element.querySelector('[data-personal-action="visited"]');
  if (favourite) {
    favourite.setAttribute('aria-pressed', String(record.favourite.value));
    const icon = favourite.querySelector('[aria-hidden="true"]');
    if (icon) icon.textContent = record.favourite.value ? '♥' : '♡';
    favourite.title = record.favourite.value ? 'Remove from favourites' : 'Favourite';
  }
  if (visited) {
    visited.setAttribute('aria-pressed', String(record.visited.value));
    visited.title = record.visited.value ? 'Mark unvisited' : 'Mark visited';
  }
  element.classList.toggle('is-favourite', record.favourite.value);
  element.classList.toggle('is-visited', record.visited.value);
}

function updateDetailPanel(element, record) {
  const favourite = element.querySelector('[data-detail-action="favourite"]');
  const visited = element.querySelector('[data-detail-action="visited"]');
  if (favourite) {
    favourite.setAttribute('aria-pressed', String(record.favourite.value));
    favourite.innerHTML = `<span aria-hidden="true">${record.favourite.value ? '♥' : '♡'}</span> ${record.favourite.value ? 'Favourited' : 'Favourite'}`;
  }
  if (visited) {
    visited.setAttribute('aria-pressed', String(record.visited.value));
    visited.innerHTML = `<span aria-hidden="true">✓</span> ${record.visited.value ? 'Visited' : 'Mark visited'}`;
  }
  const dateInput = element.querySelector('[data-visit-date]');
  if (dateInput && document.activeElement !== dateInput) dateInput.value = record.visited.dates.at(-1) ?? '';
  for (const button of element.querySelectorAll('[data-rating-value]')) {
    const active = Number(button.dataset.ratingValue) <= (record.personalRating.value ?? 0);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(Number(button.dataset.ratingValue) === record.personalRating.value));
  }
  const ratingLabel = element.querySelector('[data-rating-label]');
  if (ratingLabel) ratingLabel.textContent = record.personalRating.value == null ? 'Not rated' : `${record.personalRating.value} of 5`;
  const notes = element.querySelector('[data-personal-notes]');
  if (notes && document.activeElement !== notes && !notes.dataset.dirty) notes.value = record.notes.value;
  const status = element.querySelector('[data-notes-status]');
  if (status && !notes?.dataset.dirty) status.textContent = record.notes.updatedAt ? `Saved ${new Date(record.notes.updatedAt).toLocaleString()}` : 'Not saved yet';
  const visits = element.querySelector('[data-visit-history]');
  if (visits) visits.textContent = record.visited.dates.length ? `Visit dates: ${record.visited.dates.join(', ')}` : 'No visit dates recorded.';
}

export function applyRecordToElements(record, root = document) {
  for (const element of root.querySelectorAll(`[data-entity-id="${CSS.escape(record.entityId)}"]`)) {
    updateQuickActions(element, record);
    if (element.matches('[data-personal-panel]') || element.querySelector('[data-detail-action]')) updateDetailPanel(element, record);
  }
}

export async function hydratePersonalState(root = document) {
  try {
    const records = await personalStateService.getAll();
    const byId = new Map(records.map((record) => [record.entityId, record]));
    const entityElements = [...root.querySelectorAll('[data-entity-id]')];
    for (const element of entityElements) {
      const entityId = element.dataset.entityId;
      if (!entityId) continue;
      const record = byId.get(entityId) ?? await personalStateService.get(entityId, parseSnapshot(element));
      updateQuickActions(element, record);
      if (element.matches('[data-personal-panel]') || element.querySelector('[data-detail-action]')) updateDetailPanel(element, record);
    }
    return byId;
  } catch (error) {
    console.error(error);
    showToast('Personal state could not be opened in this browser.', { error: true, duration: 6000 });
    return new Map();
  }
}

async function handleQuickAction(button) {
  const container = entityContainer(button);
  if (!container) return;
  const entityId = container.dataset.entityId;
  const snapshot = parseSnapshot(container);
  const current = await personalStateService.get(entityId, snapshot);
  if (button.dataset.personalAction === 'favourite') {
    const next = !current.favourite.value;
    const record = await mutatePersonalState((service) => service.setFavourite(entityId, next, snapshot), 'quick-action');
    showToast(next ? 'Added to favourites.' : 'Removed from favourites.');
    return record;
  }
  if (button.dataset.personalAction === 'visited') {
    const next = !current.visited.value;
    const record = await mutatePersonalState((service) => service.setVisited(entityId, next, next ? localIsoDate() : null, snapshot), 'quick-action');
    showToast(next ? 'Marked visited.' : 'Marked unvisited. Visit dates were retained.');
    return record;
  }
  return null;
}

async function handleDetailAction(button) {
  const panel = entityContainer(button);
  if (!panel) return;
  const entityId = panel.dataset.entityId;
  const snapshot = parseSnapshot(panel);
  const current = await personalStateService.get(entityId, snapshot);
  if (button.dataset.detailAction === 'favourite') {
    const next = !current.favourite.value;
    await mutatePersonalState((service) => service.setFavourite(entityId, next, snapshot), 'detail');
    showToast(next ? 'Added to favourites.' : 'Removed from favourites.');
  } else if (button.dataset.detailAction === 'visited') {
    const next = !current.visited.value;
    const date = next ? (panel.querySelector('[data-visit-date]')?.value || localIsoDate()) : null;
    await mutatePersonalState((service) => service.setVisited(entityId, next, date, snapshot), 'detail');
    showToast(next ? 'Visit saved.' : 'Marked unvisited. Existing visit dates were retained.');
  }
}

async function saveNotes(textarea, announce = true) {
  const panel = entityContainer(textarea);
  if (!panel) return;
  const status = panel.querySelector('[data-notes-status]');
  try {
    if (status) status.textContent = 'Saving…';
    const record = await mutatePersonalState(
      (service) => service.setNotes(panel.dataset.entityId, textarea.value, parseSnapshot(panel)),
      'notes'
    );
    delete textarea.dataset.dirty;
    if (status) status.textContent = `Saved ${new Date(record.notes.updatedAt).toLocaleString()}`;
    if (announce) showToast('Private note saved.');
  } catch (error) {
    console.error(error);
    if (status) status.textContent = error.message;
    showToast(error.message, { error: true });
  }
}

async function handleClick(event) {
  const quickButton = event.target.closest('[data-personal-action]');
  if (quickButton) {
    event.preventDefault();
    quickButton.disabled = true;
    try { await handleQuickAction(quickButton); }
    catch (error) { console.error(error); showToast(error.message ?? 'Could not update personal state.', { error: true }); }
    finally { quickButton.disabled = false; }
    return;
  }

  const detailButton = event.target.closest('[data-detail-action]');
  if (detailButton) {
    detailButton.disabled = true;
    try { await handleDetailAction(detailButton); }
    catch (error) { console.error(error); showToast(error.message ?? 'Could not update personal state.', { error: true }); }
    finally { detailButton.disabled = false; }
    return;
  }

  const ratingButton = event.target.closest('[data-rating-value]');
  if (ratingButton) {
    const panel = entityContainer(ratingButton);
    try {
      await mutatePersonalState(
        (service) => service.setPersonalRating(panel.dataset.entityId, Number(ratingButton.dataset.ratingValue), parseSnapshot(panel)),
        'rating'
      );
      showToast(`Personal rating set to ${ratingButton.dataset.ratingValue}/5.`);
    } catch (error) { console.error(error); showToast(error.message, { error: true }); }
    return;
  }

  const clearRating = event.target.closest('[data-clear-rating]');
  if (clearRating) {
    const panel = entityContainer(clearRating);
    await mutatePersonalState((service) => service.setPersonalRating(panel.dataset.entityId, null, parseSnapshot(panel)), 'rating');
    showToast('Personal rating cleared.');
    return;
  }

  const saveButton = event.target.closest('[data-save-notes]');
  if (saveButton) {
    const textarea = entityContainer(saveButton)?.querySelector('[data-personal-notes]');
    if (textarea) await saveNotes(textarea);
    return;
  }

  const addVisit = event.target.closest('[data-add-visit-date]');
  if (addVisit) {
    const panel = entityContainer(addVisit);
    const input = panel?.querySelector('[data-visit-date]');
    if (!panel || !input?.value) {
      showToast('Choose a visit date first.', { error: true });
      return;
    }
    await mutatePersonalState(
      (service) => service.setVisited(panel.dataset.entityId, true, input.value, parseSnapshot(panel)),
      'visit-date'
    );
    showToast('Visit date added.');
  }
}

function handleInput(event) {
  const textarea = event.target.closest('[data-personal-notes]');
  if (!textarea) return;
  textarea.dataset.dirty = 'true';
  const panel = entityContainer(textarea);
  const status = panel?.querySelector('[data-notes-status]');
  if (status) status.textContent = `${textarea.value.length.toLocaleString()} / 50,000 characters · unsaved`;
  clearTimeout(noteTimers.get(textarea));
  noteTimers.set(textarea, setTimeout(() => void saveNotes(textarea, false), 850));
}

personalStateEvents.addEventListener('change', (event) => applyRecordToElements(event.detail.record));
document.addEventListener('click', (event) => void handleClick(event));
document.addEventListener('input', handleInput);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void hydratePersonalState(), { once: true });
} else {
  void hydratePersonalState();
}
