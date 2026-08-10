import { PersonalStateService } from './src-core-personal-state.a047e84f1aa7.mjs';

const DATABASE_NAME = 'good-shit-personal-state';
const DATABASE_VERSION = 1;
const STORE_NAME = 'records';

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error ?? new Error('IndexedDB request failed.')), { once: true });
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true });
    transaction.addEventListener('abort', () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.')), { once: true });
    transaction.addEventListener('error', () => reject(transaction.error ?? new Error('IndexedDB transaction failed.')), { once: true });
  });
}

export class IndexedDbPersonalStateAdapter {
  #databasePromise;

  constructor(options = {}) {
    this.databaseName = options.databaseName ?? DATABASE_NAME;
    this.databaseVersion = options.databaseVersion ?? DATABASE_VERSION;
    this.storeName = options.storeName ?? STORE_NAME;
    this.#databasePromise = null;
  }

  async #database() {
    if (!globalThis.indexedDB) throw new Error('IndexedDB is not available in this browser.');
    if (!this.#databasePromise) {
      this.#databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.databaseName, this.databaseVersion);
        request.addEventListener('upgradeneeded', () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(this.storeName)) {
            const store = database.createObjectStore(this.storeName, { keyPath: 'entityId' });
            store.createIndex('updatedAt', 'updatedAt');
          }
        });
        request.addEventListener('success', () => {
          const database = request.result;
          database.addEventListener('versionchange', () => database.close());
          resolve(database);
        }, { once: true });
        request.addEventListener('error', () => reject(request.error ?? new Error('Could not open personal-state database.')), { once: true });
        request.addEventListener('blocked', () => reject(new Error('Personal-state database upgrade is blocked by another open tab.')), { once: true });
      });
    }
    return this.#databasePromise;
  }

  async get(entityId) {
    const database = await this.#database();
    const transaction = database.transaction(this.storeName, 'readonly');
    return requestAsPromise(transaction.objectStore(this.storeName).get(entityId));
  }

  async put(record) {
    const database = await this.#database();
    const transaction = database.transaction(this.storeName, 'readwrite', { durability: 'strict' });
    const result = await requestAsPromise(transaction.objectStore(this.storeName).put(structuredClone(record)));
    await transactionComplete(transaction);
    void this.requestPersistence();
    return result;
  }

  async getAll() {
    const database = await this.#database();
    const transaction = database.transaction(this.storeName, 'readonly');
    return requestAsPromise(transaction.objectStore(this.storeName).getAll());
  }

  async clear() {
    const database = await this.#database();
    const transaction = database.transaction(this.storeName, 'readwrite', { durability: 'strict' });
    await requestAsPromise(transaction.objectStore(this.storeName).clear());
    await transactionComplete(transaction);
  }

  async requestPersistence() {
    try {
      if (navigator.storage?.persisted && await navigator.storage.persisted()) return true;
      return navigator.storage?.persist ? navigator.storage.persist() : false;
    } catch {
      return false;
    }
  }
}

export const personalStateEvents = new EventTarget();
export const personalStateService = new PersonalStateService(new IndexedDbPersonalStateAdapter());

export function dispatchPersonalStateChange(record, source = 'unknown') {
  personalStateEvents.dispatchEvent(new CustomEvent('change', { detail: { record, source } }));
  globalThis.dispatchEvent?.(new CustomEvent('good-shit:personal-state-change', { detail: { record, source } }));
}

export async function mutatePersonalState(operation, source = 'ui') {
  const record = await operation(personalStateService);
  dispatchPersonalStateChange(record, source);
  return record;
}
