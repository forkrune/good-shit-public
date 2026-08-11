import { TIER_LIST_CSS } from './web-tier-list-styles.5b10f97df703.mjs';

export const BOARD_TIERS = Object.freeze(['S', 'A', 'B', 'C', 'D', 'E', 'F']);
export const PUBLIC_BOARD_TIERS = Object.freeze(['S', 'A', 'B', 'C']);

const TIER_META = Object.freeze({
  S: { label: 'Exceptional', exportColor: '#ffd9df', exportAccent: '#9e2d43' },
  A: { label: 'Excellent', exportColor: '#ffdcc1', exportAccent: '#955000' },
  B: { label: 'Very good', exportColor: '#f9e87c', exportAccent: '#665700' },
  C: { label: 'Good', exportColor: '#b8f2c6', exportAccent: '#0f6330' },
  D: { label: 'Mediocre', exportColor: '#d5e6ff', exportAccent: '#23578f' },
  E: { label: 'Poor', exportColor: '#e5deff', exportAccent: '#524398' },
  F: { label: 'Avoid', exportColor: '#ffd7f7', exportAccent: '#81377c' }
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function titleCase(value) {
  return String(value ?? '').replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase();
}

export function filterTierDocuments(entities, filters = {}) {
  const query = normalize(filters.query);
  return entities.filter((entity) => {
    if (!PUBLIC_BOARD_TIERS.includes(entity.tier)) return false;
    if (filters.country && entity.location?.countryCode !== filters.country) return false;
    if (filters.entityType && entity.entityType !== filters.entityType) return false;
    if (filters.category && !(entity.categories ?? []).includes(filters.category)) return false;
    if (!query) return true;
    const haystack = [
      entity.names?.canonical,
      entity.names?.local,
      entity.location?.locality,
      entity.location?.region,
      entity.location?.country,
      entity.entityType,
      ...(entity.categories ?? []),
      ...(entity.tags ?? [])
    ].filter(Boolean).join(' ').toLocaleLowerCase();
    return query.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export function tierCounts(entities) {
  return Object.fromEntries(BOARD_TIERS.map((tier) => [tier, entities.filter((entity) => entity.tier === tier).length]));
}

export function tierListDownloadName(filters = {}) {
  const parts = ['good-shit-tier-list'];
  if (filters.country) parts.push(String(filters.country).toLowerCase());
  if (filters.entityType) parts.push(filters.entityType);
  if (filters.category) parts.push(filters.category);
  if (filters.query) parts.push(normalize(filters.query).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32));
  return `${parts.filter(Boolean).join('-')}.png`;
}

function shardEntry(kind, key, value) {
  return value ? { kind, key, ...value } : null;
}

export function selectTierShardPlan(manifest, filters = {}) {
  const byCountry = manifest?.shards?.byCountry ?? {};
  const byType = manifest?.shards?.byType ?? {};
  const country = filters.country || '';
  const entityType = filters.entityType || '';
  if (country && entityType) {
    return [
      shardEntry('country', country, byCountry[country]),
      shardEntry('type', entityType, byType[entityType])
    ].filter(Boolean).sort((a, b) => (a.count ?? Infinity) - (b.count ?? Infinity) || a.kind.localeCompare(b.kind)).slice(0, 1);
  }
  if (country) return [shardEntry('country', country, byCountry[country])].filter(Boolean);
  if (entityType) return [shardEntry('type', entityType, byType[entityType])].filter(Boolean);
  return Object.entries(byCountry)
    .map(([key, value]) => shardEntry('country', key, value))
    .filter(Boolean)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.key.localeCompare(b.key));
}

function getPageConfig() {
  try {
    return JSON.parse(document.querySelector('#page-config')?.textContent ?? '{}');
  } catch {
    return {};
  }
}

function injectStyles() {
  if (document.querySelector('#tier-list-expressive-styles')) return;
  const style = document.createElement('style');
  style.id = 'tier-list-expressive-styles';
  style.textContent = TIER_LIST_CSS;
  document.head.append(style);
}

async function fetchJson(url) {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
  return response.json();
}

function bestVariant(entity, targetWidth = 420) {
  const variants = entity.coverImage?.variants;
  if (!variants?.length) return null;
  const sorted = [...variants].sort((a, b) => a.width - b.width);
  return sorted.find((candidate) => candidate.width >= targetWidth) ?? sorted.at(-1);
}

function locationLabel(entity) {
  const values = [entity.location?.locality, entity.location?.region, entity.location?.country].filter(Boolean);
  return values.filter((value, index) => index === 0 || value !== values[index - 1]).join(' · ');
}

function renderPlaceCard(entity, basePath) {
  const image = bestVariant(entity);
  const fallback = escapeHtml(entity.names?.canonical?.trim()?.[0]?.toLocaleUpperCase() ?? '•');
  const media = image
    ? `<img src="${escapeHtml(image.url)}" width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}" alt="${escapeHtml(entity.coverImage?.alt ?? entity.names?.canonical ?? '')}" loading="lazy" decoding="async">`
    : `<span class="tier-place-fallback" aria-hidden="true">${fallback}</span>`;
  return `<a class="tier-place-card" href="${escapeHtml(`${basePath}places/${entity.slug}/`)}" data-tier-place="${escapeHtml(entity.id)}">
    <span class="tier-place-media">${media}</span>
    <span class="tier-place-copy"><strong>${escapeHtml(entity.names?.canonical)}</strong><span>${escapeHtml(locationLabel(entity))}</span></span>
  </a>`;
}

function renderTierRow(tier, entities, basePath) {
  const meta = TIER_META[tier];
  const isPublic = PUBLIC_BOARD_TIERS.includes(tier);
  const items = entities.filter((entity) => entity.tier === tier);
  const empty = isPublic
    ? 'No published places match the current filters.'
    : 'Below the publication bar · unpublished D–F records are intentionally not exposed here.';
  return `<section class="tier-board-row${isPublic ? '' : ' is-below-bar'}" data-tier="${tier}" aria-labelledby="tier-heading-${tier.toLowerCase()}">
    <div class="tier-rank"><strong aria-hidden="true">${tier}</strong><span>${escapeHtml(meta.label)}</span></div>
    <div class="tier-row-content">
      <div class="tier-row-heading"><h2 id="tier-heading-${tier.toLowerCase()}">${tier} · ${escapeHtml(meta.label)}</h2><span>${isPublic ? `${items.length} published` : 'not public'}</span></div>
      ${items.length ? `<div class="tier-board-items">${items.map((entity) => renderPlaceCard(entity, basePath)).join('')}</div>` : `<div class="tier-board-empty">${escapeHtml(empty)}</div>`}
    </div>
  </section>`;
}

function optionList(items, selected) {
  return (items ?? []).map((item) => `<option value="${escapeHtml(item.value)}"${item.value === selected ? ' selected' : ''}>${escapeHtml(titleCase(item.label))} (${item.count})</option>`).join('');
}

function filtersFromUrl() {
  const parameters = new URLSearchParams(window.location.search);
  return {
    query: parameters.get('q') ?? '',
    country: parameters.get('country') ?? '',
    entityType: parameters.get('type') ?? '',
    category: parameters.get('category') ?? ''
  };
}

function writeFiltersToUrl(filters) {
  const parameters = new URLSearchParams(window.location.search);
  const mapping = [['q', filters.query], ['country', filters.country], ['type', filters.entityType], ['category', filters.category]];
  for (const [key, value] of mapping) {
    if (value) parameters.set(key, value);
    else parameters.delete(key);
  }
  const query = parameters.toString();
  history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
}

function renderShell(main, manifest, basePath, filters) {
  main.className = 'tier-list-shell';
  main.removeAttribute('aria-busy');
  main.innerHTML = `<header class="tier-list-hero">
    <div class="tier-list-hero-copy"><span class="eyebrow">Compiled once · streamed by filter</span><h1>The whole catalogue, ranked.</h1><p>The canonical catalogue stays untouched. During publishing, Good Shit compiles a small tier-list projection into country and type shards. Filters choose the smallest relevant shard and the board is generated in the browser as that data arrives.</p></div>
    <div class="tier-list-hero-stat"><strong>${manifest.entityCount}</strong><span>published places available to the compiled tier-list index</span></div>
  </header>
  <section class="tier-list-controls" aria-label="Tier list filters">
    <label>Find a place<input id="tier-query" type="search" value="${escapeHtml(filters.query)}" placeholder="Name, city, category…" autocomplete="off"></label>
    <label>Country<select id="tier-country"><option value="">Everywhere</option>${optionList(manifest.facets?.countries, filters.country)}</select></label>
    <label>Type<select id="tier-type"><option value="">Every type</option>${optionList(manifest.facets?.entityTypes, filters.entityType)}</select></label>
    <label>Category<select id="tier-category"><option value="">Every category</option>${optionList(manifest.facets?.categories, filters.category)}</select></label>
    <button id="tier-export" class="filled-button tier-export-button" type="button" disabled>Download PNG</button>
  </section>
  <div class="tier-list-meta"><span id="tier-visible-count" aria-live="polite"></span><span id="tier-stream-status" aria-live="polite">Choosing compiled shards…</span></div>
  <div id="tier-board" class="tier-board"></div>
  <p class="muted">D / E / F remain structural rows only. Unpublished records never enter the compiled tier-list projection. <a href="${escapeHtml(`${basePath}tiers/`)}">Static tier pages</a></p>`;
}

function currentFilters(main) {
  return {
    query: main.querySelector('#tier-query')?.value.trim() ?? '',
    country: main.querySelector('#tier-country')?.value ?? '',
    entityType: main.querySelector('#tier-type')?.value ?? '',
    category: main.querySelector('#tier-category')?.value ?? ''
  };
}

function uniqueDocuments(documents) {
  const byId = new Map();
  for (const document of documents) byId.set(document.id, document);
  return [...byId.values()];
}

function sortVisible(entities) {
  const rank = new Map(BOARD_TIERS.map((tier, index) => [tier, index]));
  return [...entities].sort((a, b) => (rank.get(a.tier) ?? 99) - (rank.get(b.tier) ?? 99) || a.names.canonical.localeCompare(b.names.canonical) || a.id.localeCompare(b.id));
}

function renderBoard(main, entities, basePath, progress = null) {
  const filtered = sortVisible(entities);
  const counts = tierCounts(filtered);
  const board = main.querySelector('#tier-board');
  if (board) board.innerHTML = BOARD_TIERS.map((tier) => renderTierRow(tier, filtered, basePath)).join('');
  const count = main.querySelector('#tier-visible-count');
  if (count) count.innerHTML = `<strong>${filtered.length}</strong> ${filtered.length === 1 ? 'place' : 'places'} visible · ${PUBLIC_BOARD_TIERS.map((tier) => `${tier} ${counts[tier]}`).join(' · ')}`;
  const status = main.querySelector('#tier-stream-status');
  if (status && progress) status.textContent = progress;
  return filtered;
}

function showToast(message, isError = false) {
  const toast = document.querySelector('#app-status');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('is-error', isError);
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), isError ? 5000 : 2800);
}

function roundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function wrapCanvasText(context, text, maxWidth, maxLines = 2) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.join(' ') !== lines.join(' ')) {
    const last = lines.length - 1;
    while (lines[last] && context.measureText(`${lines[last]}…`).width > maxWidth) lines[last] = lines[last].slice(0, -1);
    lines[last] = `${lines[last]}…`;
  }
  return lines;
}

async function loadImage(url) {
  if (!url) return null;
  return new Promise((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(() => resolve(null), 8000);
    image.onload = () => { window.clearTimeout(timeout); resolve(image); };
    image.onerror = () => { window.clearTimeout(timeout); resolve(null); };
    image.src = url;
  });
}

async function loadExportImages(entities) {
  const queue = entities.map((entity) => [entity.id, bestVariant(entity, 360)?.url ?? null]);
  const images = new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < queue.length) {
      const index = cursor++;
      const [id, url] = queue[index];
      images.set(id, await loadImage(url));
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, queue.length || 1) }, () => worker()));
  return images;
}

function exportSubtitle(filters, visibleCount) {
  const parts = [];
  if (filters.country) parts.push(filters.country);
  if (filters.entityType) parts.push(titleCase(filters.entityType));
  if (filters.category) parts.push(titleCase(filters.category));
  if (filters.query) parts.push(`“${filters.query}”`);
  return `${visibleCount} published place${visibleCount === 1 ? '' : 's'}${parts.length ? ` · ${parts.join(' · ')}` : ' · all public catalogue entries'}`;
}

async function exportTierPng(entities, filters) {
  const width = 1600;
  const margin = 64;
  const top = 172;
  const labelWidth = 150;
  const rowGap = 18;
  const cardGap = 14;
  const columns = 6;
  const contentWidth = width - margin * 2 - labelWidth - 28;
  const cardWidth = Math.floor((contentWidth - cardGap * (columns - 1)) / columns);
  const cardHeight = 154;
  const cardImageHeight = 92;
  const layouts = [];
  let height = top;
  for (const tier of BOARD_TIERS) {
    const items = entities.filter((entity) => entity.tier === tier);
    const lines = PUBLIC_BOARD_TIERS.includes(tier) ? Math.max(1, Math.ceil(items.length / columns)) : 1;
    const rowHeight = PUBLIC_BOARD_TIERS.includes(tier) ? Math.max(154, 54 + lines * (cardHeight + cardGap) + 20) : 112;
    layouts.push({ tier, items, y: height, rowHeight });
    height += rowHeight + rowGap;
  }
  height += 86;
  if (height > 12000) throw new Error('This filtered tier list is too tall to export in one browser image. Narrow the filters first.');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas export is unavailable in this browser.');
  const images = await loadExportImages(entities);

  context.fillStyle = '#fff9ff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#1d1a20';
  context.font = '900 64px system-ui, sans-serif';
  context.fillText('GOOD SHIT · TIER LIST', margin, 78);
  context.fillStyle = '#49454e';
  context.font = '600 24px system-ui, sans-serif';
  context.fillText(exportSubtitle(filters, entities.length), margin, 120);
  context.font = '500 18px system-ui, sans-serif';
  context.fillText('Generated automatically from compiled published tiers · D–F remain private/unpublished', margin, 151);

  for (const layout of layouts) {
    const meta = TIER_META[layout.tier];
    roundedRectPath(context, margin, layout.y, width - margin * 2, layout.rowHeight, 34);
    context.fillStyle = '#f3ecf5';
    context.fill();
    roundedRectPath(context, margin, layout.y, labelWidth, layout.rowHeight, 34);
    context.fillStyle = meta.exportColor;
    context.fill();
    context.fillStyle = meta.exportAccent;
    context.font = '900 72px system-ui, sans-serif';
    context.textAlign = 'center';
    context.fillText(layout.tier, margin + labelWidth / 2, layout.y + Math.min(88, layout.rowHeight / 2 + 24));
    context.font = '800 16px system-ui, sans-serif';
    context.fillText(meta.label.toUpperCase(), margin + labelWidth / 2, layout.y + Math.min(116, layout.rowHeight / 2 + 52));
    context.textAlign = 'left';

    const startX = margin + labelWidth + 28;
    if (!PUBLIC_BOARD_TIERS.includes(layout.tier)) {
      context.fillStyle = '#6f6873';
      context.font = '700 22px system-ui, sans-serif';
      context.fillText('Below publication bar · intentionally not exposed', startX, layout.y + layout.rowHeight / 2 + 7);
      continue;
    }
    if (!layout.items.length) {
      context.fillStyle = '#6f6873';
      context.font = '700 22px system-ui, sans-serif';
      context.fillText('No published places match this filter.', startX, layout.y + layout.rowHeight / 2 + 7);
      continue;
    }

    for (const [index, entity] of layout.items.entries()) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (cardWidth + cardGap);
      const y = layout.y + 46 + row * (cardHeight + cardGap);
      roundedRectPath(context, x, y, cardWidth, cardHeight, 20);
      context.save();
      context.clip();
      const image = images.get(entity.id);
      if (image) drawCover(context, image, x, y, cardWidth, cardImageHeight);
      else {
        context.fillStyle = meta.exportColor;
        context.fillRect(x, y, cardWidth, cardImageHeight);
        context.fillStyle = meta.exportAccent;
        context.font = '900 42px system-ui, sans-serif';
        context.textAlign = 'center';
        context.fillText(entity.names?.canonical?.trim()?.[0]?.toUpperCase() ?? '•', x + cardWidth / 2, y + 60);
        context.textAlign = 'left';
      }
      context.fillStyle = '#ffffff';
      context.fillRect(x, y + cardImageHeight, cardWidth, cardHeight - cardImageHeight);
      context.fillStyle = '#1d1a20';
      context.font = '800 16px system-ui, sans-serif';
      const lines = wrapCanvasText(context, entity.names?.canonical, cardWidth - 20, 2);
      lines.forEach((line, lineIndex) => context.fillText(line, x + 10, y + cardImageHeight + 22 + lineIndex * 18));
      context.restore();
    }
  }

  context.fillStyle = '#6f6873';
  context.font = '600 18px system-ui, sans-serif';
  context.fillText('good-shit · editorial tier is curated judgement, not an external review average', margin, height - 36);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not encode the tier list image.');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = tierListDownloadName(filters);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const shardCache = new Map();

async function loadShard(descriptor) {
  if (!descriptor?.url) return [];
  if (!shardCache.has(descriptor.url)) {
    shardCache.set(descriptor.url, fetchJson(descriptor.url).then((payload) => payload.documents ?? []).catch((error) => {
      shardCache.delete(descriptor.url);
      throw error;
    }));
  }
  return shardCache.get(descriptor.url);
}

export async function enhanceTierListPage() {
  const main = document.querySelector('[data-tier-list-root]');
  if (!main) return false;
  injectStyles();
  const config = getPageConfig();
  const basePath = String(config.basePath || '/').replace(/\/+$/, '/');
  const manifestUrl = config.tierListManifestUrl;
  if (!manifestUrl) return false;
  const original = main.innerHTML;
  try {
    const manifest = await fetchJson(manifestUrl);
    let filters = filtersFromUrl();
    renderShell(main, manifest, basePath, filters);
    let visible = [];
    let generation = 0;
    let queryTimer = null;

    const refresh = async () => {
      const request = ++generation;
      filters = currentFilters(main);
      writeFiltersToUrl(filters);
      const plan = selectTierShardPlan(manifest, filters);
      const exportButton = main.querySelector('#tier-export');
      if (exportButton) exportButton.disabled = true;
      const collected = [];
      visible = renderBoard(main, [], basePath, plan.length ? `Loading 0 / ${plan.length} compiled shard${plan.length === 1 ? '' : 's'}…` : 'No compiled shard matches this filter.');
      for (const [index, descriptor] of plan.entries()) {
        const documents = await loadShard(descriptor);
        if (request !== generation) return;
        collected.push(...documents);
        visible = filterTierDocuments(uniqueDocuments(collected), filters);
        const source = descriptor.kind === 'country' ? `country ${descriptor.key}` : `type ${titleCase(descriptor.key)}`;
        renderBoard(main, visible, basePath, `Loaded ${index + 1} / ${plan.length} · ${source}`);
      }
      if (request !== generation) return;
      visible = filterTierDocuments(uniqueDocuments(collected), filters);
      const selection = plan.length === 1 ? `${plan[0].kind} shard` : `${plan.length} country shards`;
      renderBoard(main, visible, basePath, plan.length ? `Ready · ${selection} · ${visible.length} matches` : 'Ready · 0 matches');
      if (exportButton) exportButton.disabled = false;
    };

    main.addEventListener('input', (event) => {
      if (!event.target.matches('#tier-query')) return;
      window.clearTimeout(queryTimer);
      queryTimer = window.setTimeout(() => void refresh(), 140);
    });
    main.addEventListener('change', (event) => {
      if (event.target.matches('#tier-country, #tier-type, #tier-category')) void refresh();
    });
    main.querySelector('#tier-export')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      const previous = button.textContent;
      button.textContent = 'Rendering PNG…';
      try {
        if (document.fonts?.ready) await document.fonts.ready;
        await exportTierPng(visible, filters);
        showToast('Tier list PNG downloaded.');
      } catch (error) {
        console.error(error);
        showToast(error.message ?? 'Could not export the tier list.', true);
      } finally {
        button.disabled = false;
        button.textContent = previous;
      }
    });

    await refresh();
    return true;
  } catch (error) {
    console.error(error);
    main.className = 'page-shell';
    main.innerHTML = `${original}<div class="tier-list-error" role="alert">The generated tier list could not load. The static tier pages remain available.</div>`;
    main.removeAttribute('aria-busy');
    return false;
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void enhanceTierListPage(), { once: true });
  else void enhanceTierListPage();
}
