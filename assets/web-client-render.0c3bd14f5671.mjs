import { tierLabel } from './src-core-constants.2abfb1694768.mjs';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
}

export function joinUrl(basePath, relativePath) {
  const base = String(basePath || '/').endsWith('/') ? String(basePath || '/') : `${basePath}/`;
  return `${base}${String(relativePath).replace(/^\/+/, '')}`;
}

function iconForType(type) {
  return {
    food: '◉',
    entertainment: '▶',
    'natural-poi': '⌁',
    'hiking-route': '↟',
    architecture: '◇',
    shop: '▣',
    experience: '✦'
  }[type] ?? '●';
}

function snapshot(document) {
  return {
    name: document.name,
    slug: document.slug,
    countryCode: document.countryCode,
    tier: document.tier,
    status: 'published'
  };
}

function locationLabel(document) {
  return [document.locality, document.region, document.country]
    .filter(Boolean)
    .filter((value, index, array) => index === 0 || value !== array[index - 1])
    .join(' · ');
}

function renderCoverImage(document) {
  const cover = document.coverImage;
  if (!cover?.variants?.length) return '';
  const variants = [...cover.variants].sort((a, b) => a.width - b.width);
  const fallback = variants.at(-1);
  const srcset = variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ');
  return `<div class="card-media"><img class="card-image" src="${escapeHtml(fallback.url)}" srcset="${escapeHtml(srcset)}" sizes="(max-width: 760px) 100vw, 320px" width="${fallback.width}" height="${fallback.height}" alt="${escapeHtml(cover.alt)}" loading="lazy" decoding="async"></div>`;
}

export function renderEntityCard(document, options = {}) {
  const basePath = options.basePath ?? '/';
  const href = joinUrl(basePath, `places/${encodeURIComponent(document.slug)}/`);
  const mapHref = joinUrl(basePath, `map/?entity=${encodeURIComponent(document.id)}`);
  const tags = (document.tags ?? []).filter((tag) => tag !== 'demo').slice(0, 3)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  const rating = document.latestExternalRating;
  const selected = options.selectedId === document.id ? ' is-selected' : '';
  const coverHtml = renderCoverImage(document);
  return `<article class="entity-card tier-${escapeHtml(String(document.tier).toLowerCase())}${selected}" data-entity-id="${escapeHtml(document.id)}" data-entity-snapshot="${escapeHtml(safeJson(snapshot(document)))}">
    <a class="card-main" href="${escapeHtml(href)}">
      ${coverHtml}
      <div class="card-topline">
        <span class="type-chip"><span aria-hidden="true">${iconForType(document.entityType)}</span>${escapeHtml(String(document.entityType).replaceAll('-', ' '))}</span>
        <span class="tier-chip tier-${escapeHtml(String(document.tier).toLowerCase())}" aria-label="Tier ${escapeHtml(document.tier)}: ${escapeHtml(tierLabel(document.tier))}"><strong>${escapeHtml(document.tier)}</strong> ${escapeHtml(tierLabel(document.tier))}</span>
      </div>
      <h3>${escapeHtml(document.name)}</h3>
      ${document.localName ? `<p class="local-name">${escapeHtml(document.localName)}</p>` : ''}
      <p>${escapeHtml(document.summary)}</p>
      <div class="card-location"><span aria-hidden="true">⌖</span>${escapeHtml(locationLabel(document))}</div>
      <div class="tag-row">${tags}</div>
      ${rating ? `<div class="external-rating" aria-label="Latest observed ${escapeHtml(rating.provider)} rating"><strong>${escapeHtml(Number(rating.rating).toFixed(1))}</strong> / ${escapeHtml(rating.scale)} · ${escapeHtml(Number(rating.reviewCount).toLocaleString())} reviews <span>observed ${escapeHtml(String(rating.observedAt).slice(0, 10))}</span></div>` : ''}
    </a>
    <div class="card-actions" aria-label="Personal actions for ${escapeHtml(document.name)}">
      <button type="button" class="icon-button" data-personal-action="favourite" aria-pressed="false" title="Favourite"><span aria-hidden="true">♡</span><span class="sr-only">Favourite</span></button>
      <button type="button" class="icon-button" data-personal-action="visited" aria-pressed="false" title="Visited"><span aria-hidden="true">✓</span><span class="sr-only">Visited</span></button>
      <a class="icon-button" data-map-select="${escapeHtml(document.id)}" href="${escapeHtml(mapHref)}" title="Show on map"><span aria-hidden="true">⌖</span><span class="sr-only">Show on map</span></a>
    </div>
  </article>`;
}

export function renderEntityGrid(documents, options = {}) {
  if (!documents.length) {
    return `<div class="empty-state"><span aria-hidden="true">◇</span><h2>${escapeHtml(options.emptyTitle ?? 'No curated places match this view.')}</h2><p>${escapeHtml(options.emptyText ?? 'This does not mean nothing exists here; it means nothing currently published meets or is known to meet the catalogue bar.')}</p></div>`;
  }
  return `<div class="entity-grid">${documents.map((document) => renderEntityCard(document, options)).join('')}</div>`;
}

export function renderOrphanRecord(record) {
  const snapshot = record.snapshot ?? {};
  const details = [];
  if (record.favourite?.value) details.push('Favourite');
  if (record.visited?.value) details.push(`Visited${record.visited.dates?.length ? ` · ${record.visited.dates.join(', ')}` : ''}`);
  if (record.personalRating?.value != null) details.push(`Personal rating ${record.personalRating.value}/5`);
  return `<article class="orphan-card" data-entity-id="${escapeHtml(record.entityId)}" data-entity-snapshot="${escapeHtml(safeJson(snapshot))}">
    <div class="card-topline"><span class="status-chip">No longer in the published catalogue</span><code>${escapeHtml(record.entityId)}</code></div>
    <h3>${escapeHtml(snapshot.name ?? 'Unknown catalogue entity')}</h3>
    <p class="muted">Your personal state is retained even though this immutable ID is absent from the current public catalogue.</p>
    ${details.length ? `<p><strong>${escapeHtml(details.join(' · '))}</strong></p>` : ''}
    ${record.notes?.value?.trim() ? `<p>${escapeHtml(record.notes.value)}</p>` : ''}
  </article>`;
}
