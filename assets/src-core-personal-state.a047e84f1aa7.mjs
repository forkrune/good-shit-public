import { PERSONAL_STATE_SCHEMA_VERSION } from './src-core-constants.2abfb1694768.mjs';
import { isIsoDate, isIsoDateTime, isPlainObject, stableUnique } from './src-core-normalization.af19f5c7bc33.mjs';

const FORMAT = 'good-shit-personal-state';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isoNow(clock) {
  return clock().toISOString();
}

function maxTimestamp(...values) {
  return values.filter(Boolean).sort().at(-1) ?? new Date(0).toISOString();
}

function normalizeSnapshot(snapshot, now) {
  return {
    name: String(snapshot?.name ?? 'Unknown catalogue entity'),
    slug: snapshot?.slug ? String(snapshot.slug) : null,
    countryCode: snapshot?.countryCode ? String(snapshot.countryCode) : null,
    tier: snapshot?.tier ? String(snapshot.tier) : null,
    status: snapshot?.status ? String(snapshot.status) : null,
    updatedAt: isIsoDateTime(snapshot?.updatedAt) ? snapshot.updatedAt : now
  };
}

export function createEmptyRecord(entityId, snapshot = {}, now = new Date().toISOString()) {
  if (!UUID_PATTERN.test(entityId)) throw new TypeError(`Invalid entity ID: ${entityId}`);
  return {
    schemaVersion: PERSONAL_STATE_SCHEMA_VERSION,
    entityId,
    snapshot: normalizeSnapshot(snapshot, now),
    favourite: { value: false, updatedAt: now },
    visited: { value: false, dates: [], updatedAt: now },
    personalRating: { value: null, scale: 5, updatedAt: now },
    notes: { value: '', updatedAt: now },
    conflicts: [],
    updatedAt: now
  };
}

export function normalizeRecord(raw, now = new Date().toISOString()) {
  const base = createEmptyRecord(raw.entityId, raw.snapshot, now);
  const rating = raw.personalRating?.value;
  return {
    ...base,
    favourite: {
      value: Boolean(raw.favourite?.value),
      updatedAt: isIsoDateTime(raw.favourite?.updatedAt) ? raw.favourite.updatedAt : now
    },
    visited: {
      value: Boolean(raw.visited?.value),
      dates: stableUnique(Array.isArray(raw.visited?.dates) ? raw.visited.dates.filter(isIsoDate) : []).sort(),
      updatedAt: isIsoDateTime(raw.visited?.updatedAt) ? raw.visited.updatedAt : now
    },
    personalRating: {
      value: rating == null ? null : Number(rating),
      scale: 5,
      updatedAt: isIsoDateTime(raw.personalRating?.updatedAt) ? raw.personalRating.updatedAt : now
    },
    notes: {
      value: String(raw.notes?.value ?? ''),
      updatedAt: isIsoDateTime(raw.notes?.updatedAt) ? raw.notes.updatedAt : now
    },
    conflicts: Array.isArray(raw.conflicts) ? structuredClone(raw.conflicts) : [],
    updatedAt: isIsoDateTime(raw.updatedAt) ? raw.updatedAt : now
  };
}

function conflict(field, existingValue, importedValue, importedAt) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${field}-${importedAt}`,
    field,
    existingValue,
    importedValue,
    importedAt,
    resolution: 'kept-existing'
  };
}

export function mergePersonalRecords(existingRaw, importedRaw, importedAt = new Date().toISOString()) {
  const existing = normalizeRecord(existingRaw, importedAt);
  const incoming = normalizeRecord(importedRaw, importedAt);
  if (existing.entityId !== incoming.entityId) throw new TypeError('Cannot merge personal records for different entities.');

  const conflicts = [...existing.conflicts, ...incoming.conflicts];
  const snapshot = existing.snapshot.updatedAt >= incoming.snapshot.updatedAt ? existing.snapshot : incoming.snapshot;

  const favourite = {
    value: existing.favourite.value || incoming.favourite.value,
    updatedAt: maxTimestamp(existing.favourite.updatedAt, incoming.favourite.updatedAt)
  };
  const visited = {
    value: existing.visited.value || incoming.visited.value,
    dates: stableUnique([...existing.visited.dates, ...incoming.visited.dates]).sort(),
    updatedAt: maxTimestamp(existing.visited.updatedAt, incoming.visited.updatedAt)
  };

  let personalRating;
  if (existing.personalRating.value == null) personalRating = incoming.personalRating;
  else if (incoming.personalRating.value == null || existing.personalRating.value === incoming.personalRating.value) {
    personalRating = {
      value: existing.personalRating.value,
      scale: 5,
      updatedAt: maxTimestamp(existing.personalRating.updatedAt, incoming.personalRating.updatedAt)
    };
  } else {
    personalRating = existing.personalRating;
    conflicts.push(conflict('personalRating', existing.personalRating.value, incoming.personalRating.value, importedAt));
  }

  let notes;
  const existingNote = existing.notes.value.trim();
  const incomingNote = incoming.notes.value.trim();
  if (!existingNote) notes = incoming.notes;
  else if (!incomingNote || existingNote === incomingNote || existingNote.includes(incomingNote)) {
    notes = { value: existing.notes.value, updatedAt: maxTimestamp(existing.notes.updatedAt, incoming.notes.updatedAt) };
  } else {
    notes = {
      value: `${existing.notes.value.trimEnd()}\n\n--- Imported ${importedAt.slice(0, 10)} ---\n${incoming.notes.value.trim()}`,
      updatedAt: maxTimestamp(existing.notes.updatedAt, incoming.notes.updatedAt, importedAt)
    };
    conflicts.push({
      id: globalThis.crypto?.randomUUID?.() ?? `notes-${importedAt}`,
      field: 'notes',
      existingValue: existing.notes.value,
      importedValue: incoming.notes.value,
      importedAt,
      resolution: 'preserved-both'
    });
  }

  return {
    schemaVersion: PERSONAL_STATE_SCHEMA_VERSION,
    entityId: existing.entityId,
    snapshot,
    favourite,
    visited,
    personalRating,
    notes,
    conflicts: stableUnique(conflicts, (item) => item.id ?? JSON.stringify(item)),
    updatedAt: maxTimestamp(existing.updatedAt, incoming.updatedAt, importedAt)
  };
}

export function validatePortableState(payload) {
  const errors = [];
  const add = (path, message) => errors.push({ path, message });
  if (!isPlainObject(payload)) return [{ path: '$', message: 'Expected an object.' }];
  if (payload.format !== FORMAT) add('$.format', `Expected ${FORMAT}.`);
  if (![0, PERSONAL_STATE_SCHEMA_VERSION].includes(payload.schemaVersion)) add('$.schemaVersion', 'Unsupported personal-state schema version.');
  if (!isIsoDateTime(payload.exportedAt)) add('$.exportedAt', 'Expected an ISO 8601 UTC timestamp.');
  if (!Array.isArray(payload.records)) add('$.records', 'Expected an array.');
  for (const [index, record] of (payload.records ?? []).entries()) {
    const path = `$.records[${index}]`;
    if (!isPlainObject(record)) {
      add(path, 'Expected an object.');
      continue;
    }
    if (!UUID_PATTERN.test(record.entityId ?? '')) add(`${path}.entityId`, 'Expected an immutable UUID entity ID.');
    if (payload.schemaVersion === 1) {
      const rating = record.personalRating?.value;
      if (rating != null && (!Number.isFinite(rating) || rating < 1 || rating > 5)) add(`${path}.personalRating.value`, 'Expected null or a rating from 1 to 5.');
      if (String(record.notes?.value ?? '').length > 50000) add(`${path}.notes.value`, 'Notes exceed the 50,000 character limit.');
      if (!Array.isArray(record.visited?.dates) || record.visited.dates.some((date) => !isIsoDate(date))) add(`${path}.visited.dates`, 'Expected ISO dates.');
    }
  }
  return errors;
}

export function migratePortableState(payload, now = new Date().toISOString()) {
  const errors = validatePortableState(payload);
  if (errors.length) {
    const message = errors.map((error) => `${error.path}: ${error.message}`).join('\n');
    throw new TypeError(`Invalid personal-state import:\n${message}`);
  }
  if (payload.schemaVersion === PERSONAL_STATE_SCHEMA_VERSION) {
    return {
      format: FORMAT,
      schemaVersion: PERSONAL_STATE_SCHEMA_VERSION,
      exportedAt: payload.exportedAt,
      records: payload.records.map((record) => normalizeRecord(record, now)),
      orphanedEntityState: (payload.orphanedEntityState ?? []).map((record) => normalizeRecord(record, now)),
      importConflicts: Array.isArray(payload.importConflicts) ? structuredClone(payload.importConflicts) : []
    };
  }
  const records = payload.records.map((legacy) => {
    const record = createEmptyRecord(legacy.entityId, legacy.snapshot ?? { name: legacy.name }, now);
    record.favourite = { value: Boolean(legacy.favourite), updatedAt: payload.exportedAt };
    record.visited = {
      value: Boolean(legacy.visited),
      dates: stableUnique((legacy.visitDates ?? []).filter(isIsoDate)).sort(),
      updatedAt: payload.exportedAt
    };
    const rating = legacy.rating == null ? null : Number(legacy.rating);
    record.personalRating = { value: rating, scale: 5, updatedAt: payload.exportedAt };
    record.notes = { value: String(legacy.note ?? ''), updatedAt: payload.exportedAt };
    record.updatedAt = payload.exportedAt;
    return record;
  });
  return {
    format: FORMAT,
    schemaVersion: PERSONAL_STATE_SCHEMA_VERSION,
    exportedAt: payload.exportedAt,
    records,
    orphanedEntityState: [],
    importConflicts: []
  };
}

export function createPortableExport(records, options = {}) {
  const exportedAt = options.exportedAt ?? new Date().toISOString();
  const knownIds = options.knownEntityIds ? new Set(options.knownEntityIds) : null;
  const normalized = records.map((record) => normalizeRecord(record, exportedAt)).sort((a, b) => a.entityId.localeCompare(b.entityId));
  return {
    format: FORMAT,
    schemaVersion: PERSONAL_STATE_SCHEMA_VERSION,
    exportedAt,
    records: normalized,
    orphanedEntityState: knownIds ? normalized.filter((record) => !knownIds.has(record.entityId)) : [],
    importConflicts: normalized.flatMap((record) => record.conflicts.map((item) => ({ entityId: record.entityId, ...item })))
  };
}

export class MemoryPersonalStateAdapter {
  #records = new Map();

  async get(entityId) {
    const value = this.#records.get(entityId);
    return value ? structuredClone(value) : null;
  }

  async put(record) {
    this.#records.set(record.entityId, structuredClone(record));
    return structuredClone(record);
  }

  async getAll() {
    return [...this.#records.values()].map((value) => structuredClone(value));
  }

  async clear() {
    this.#records.clear();
  }
}

export class PersonalStateService {
  constructor(adapter, options = {}) {
    this.adapter = adapter;
    this.clock = options.clock ?? (() => new Date());
    this.writeQueues = new Map();
  }

  now() {
    return isoNow(this.clock);
  }

  async get(entityId, snapshot = {}) {
    const existing = await this.adapter.get(entityId);
    return existing ? normalizeRecord(existing, this.now()) : createEmptyRecord(entityId, snapshot, this.now());
  }

  async getAll() {
    return (await this.adapter.getAll()).map((record) => normalizeRecord(record, this.now()));
  }

  async update(entityId, snapshot, updater) {
    const previous = this.writeQueues.get(entityId) ?? Promise.resolve();
    const operation = previous.catch(() => {}).then(async () => {
      const current = await this.get(entityId, snapshot);
      const now = this.now();
      const updated = updater(structuredClone(current), now);
      updated.snapshot = normalizeSnapshot({ ...current.snapshot, ...snapshot, updatedAt: now }, now);
      updated.updatedAt = now;
      await this.adapter.put(updated);
      return updated;
    });
    this.writeQueues.set(entityId, operation);
    try {
      return await operation;
    } finally {
      if (this.writeQueues.get(entityId) === operation) this.writeQueues.delete(entityId);
    }
  }

  async setFavourite(entityId, value, snapshot = {}) {
    return this.update(entityId, snapshot, (record, now) => {
      record.favourite = { value: Boolean(value), updatedAt: now };
      return record;
    });
  }

  async setVisited(entityId, value, date = null, snapshot = {}) {
    return this.update(entityId, snapshot, (record, now) => {
      const dates = [...record.visited.dates];
      if (value && date && isIsoDate(date) && !dates.includes(date)) dates.push(date);
      record.visited = { value: Boolean(value), dates: dates.sort(), updatedAt: now };
      return record;
    });
  }

  async setPersonalRating(entityId, value, snapshot = {}) {
    if (value != null && (!Number.isFinite(Number(value)) || Number(value) < 1 || Number(value) > 5)) {
      throw new RangeError('Personal rating must be null or between 1 and 5.');
    }
    return this.update(entityId, snapshot, (record, now) => {
      record.personalRating = { value: value == null ? null : Number(value), scale: 5, updatedAt: now };
      return record;
    });
  }

  async setNotes(entityId, value, snapshot = {}) {
    const text = String(value ?? '');
    if (text.length > 50000) throw new RangeError('Notes exceed the 50,000 character limit.');
    return this.update(entityId, snapshot, (record, now) => {
      record.notes = { value: text, updatedAt: now };
      return record;
    });
  }

  async export(options = {}) {
    return createPortableExport(await this.getAll(), { ...options, exportedAt: this.now() });
  }

  async import(payload) {
    const now = this.now();
    const migrated = migratePortableState(payload, now);
    const merged = [];
    for (const imported of migrated.records) {
      const existing = await this.adapter.get(imported.entityId);
      const record = existing ? mergePersonalRecords(existing, imported, now) : normalizeRecord(imported, now);
      await this.adapter.put(record);
      merged.push(record);
    }
    return {
      imported: merged.length,
      conflicts: merged.reduce((sum, record) => sum + record.conflicts.length, 0),
      records: merged
    };
  }

  async clear() {
    await this.adapter.clear();
  }
}
