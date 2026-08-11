import { tierLabel } from './src-core-constants.2abfb1694768.mjs';
import { tagLabels, uniquePresentationLabels } from './src-core-tags.570aaf416f17.mjs';
import { escapeHtml, joinUrl } from './web-client-render.557e22e4f657.mjs';

const TYPE_LABELS = Object.freeze({
  accommodation: 'Stay',
  architecture: 'Architecture',
  entertainment: 'Entertainment',
  experience: 'Experience',
  food: 'Food',
  'hiking-route': 'Hike',
  'natural-poi': 'Nature',
  shop: 'Shop'
});

function humanize(value) {
  return String(value ?? '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function locationLabel(document) {
  return [...new Set([document.locality, document.region, document.country].filter(Boolean))].join(' · ');
}

function coverMarkup(document) {
  const cover = document.coverImage;
  if (!cover?.variants?.length) return '';
  const variants = [...cover.variants].sort((a, b) => a.width - b.width);
  const fallback = variants.at(-1);
  const srcset = variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ');
  return `<div class="map-popup-media">
    <img src="${escapeHtml(fallback.url)}" srcset="${escapeHtml(srcset)}" sizes="(max-width: 520px) calc(100vw - 40px), 392px" width="${escapeHtml(fallback.width)}" height="${escapeHtml(fallback.height)}" alt="${escapeHtml(cover.alt)}" draggable="false" loading="eager" decoding="async">
    <span class="map-popup-media-scrim" aria-hidden="true"></span>
  </div>`;
}

function signalValues(document) {
  return uniquePresentationLabels([
    ...(document.foodHighlight ? [`Order · ${document.foodHighlight}`] : []),
    ...(document.cardSignals ?? []),
    ...tagLabels(document.tags ?? []),
    ...(document.subcategories ?? []).map(humanize)
  ]).slice(0, 4);
}

function signalsMarkup(document) {
  const signals = signalValues(document);
  if (!signals.length) return '';
  return `<div class="map-popup-signals" aria-label="Highlights">${signals.map((signal) => `<span>${escapeHtml(signal)}</span>`).join('')}</div>`;
}

function ratingMarkup(document) {
  const rating = document.latestExternalRating;
  if (!rating) return '';
  const reviewCount = Number(rating.reviewCount);
  const reviews = Number.isFinite(reviewCount) ? `${reviewCount.toLocaleString()} reviews` : 'external reviews';
  return `<div class="map-popup-rating" aria-label="Latest observed ${escapeHtml(rating.provider)} rating">
    <span class="map-popup-rating-score"><span aria-hidden="true">★</span><strong>${escapeHtml(Number(rating.rating).toFixed(1))}</strong><small>/ ${escapeHtml(rating.scale)}</small></span>
    <span>${escapeHtml(rating.provider)} · ${escapeHtml(reviews)}</span>
  </div>`;
}

export function renderMapPopup(document, options = {}) {
  const basePath = options.basePath ?? '/';
  const href = joinUrl(basePath, `places/${encodeURIComponent(document.slug)}/`);
  const location = locationLabel(document);
  const typeLabel = TYPE_LABELS[document.entityType] ?? humanize(document.entityType);
  const media = coverMarkup(document);
  const summary = document.summary || document.whyWorthwhile || '';
  const localName = document.localName && document.localName !== document.name
    ? `<p class="map-popup-local-name">${escapeHtml(document.localName)}</p>`
    : '';

  return `<article class="map-popup-card tier-${escapeHtml(String(document.tier).toLowerCase())}${media ? ' has-media' : ''}" data-map-popup-entity="${escapeHtml(document.id)}">
    ${media}
    <div class="map-popup-body">
      <div class="map-popup-kickers">
        <span class="map-popup-type">${escapeHtml(typeLabel)}</span>
        <span class="map-popup-tier" aria-label="Tier ${escapeHtml(document.tier)}: ${escapeHtml(tierLabel(document.tier))}"><strong>${escapeHtml(document.tier)}</strong>${escapeHtml(tierLabel(document.tier))}</span>
      </div>
      <div class="map-popup-heading">
        <h2>${escapeHtml(document.name)}</h2>
        ${localName}
      </div>
      ${location ? `<p class="map-popup-location"><span aria-hidden="true">⌖</span><span>${escapeHtml(location)}</span></p>` : ''}
      ${summary ? `<p class="map-popup-summary">${escapeHtml(summary)}</p>` : ''}
      ${signalsMarkup(document)}
      ${ratingMarkup(document)}
      <a class="map-popup-action" href="${escapeHtml(href)}"><span>View full details</span><span aria-hidden="true">→</span></a>
    </div>
  </article>`;
}

export function mapPopupStyles() {
  return `
.good-shit-map-popup.maplibregl-popup { width: min(392px, calc(100vw - 24px)); max-width: min(392px, calc(100vw - 24px)) !important; }
.good-shit-map-popup .maplibregl-popup-content {
  width: 100%;
  overflow: hidden;
  padding: 0 !important;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 72%, transparent);
  border-radius: 30px 30px 30px 14px !important;
  background: var(--md-sys-color-surface-container-lowest) !important;
  color: var(--md-sys-color-on-surface) !important;
  box-shadow: var(--elevation-3) !important;
}
.good-shit-map-popup .maplibregl-popup-close-button {
  z-index: 4;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 62%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 84%, transparent);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--elevation-1);
  font-size: 1.45rem;
  line-height: 1;
  backdrop-filter: blur(12px) saturate(1.2);
  transition: transform var(--duration-short) var(--motion-emphasized), background var(--duration-short) var(--motion-standard);
}
.good-shit-map-popup .maplibregl-popup-close-button:hover { background: var(--md-sys-color-surface-container-high); transform: rotate(7deg) scale(1.05); }
.good-shit-map-popup .maplibregl-popup-close-button:active { transform: scale(0.94); }
.good-shit-map-popup.maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: var(--md-sys-color-surface-container-lowest); }
.good-shit-map-popup.maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: var(--md-sys-color-surface-container-lowest); }
.good-shit-map-popup.maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: var(--md-sys-color-surface-container-lowest); }
.good-shit-map-popup.maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: var(--md-sys-color-surface-container-lowest); }
.good-shit-map-popup .map-popup-card { display: grid; max-height: min(660px, calc(100vh - 32px)); overflow: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.good-shit-map-popup .map-popup-media { position: relative; min-height: 154px; max-height: 188px; overflow: hidden; background: var(--md-sys-color-surface-container-high); }
.good-shit-map-popup .map-popup-media img { width: 100%; height: 100%; min-height: 154px; max-height: 188px; object-fit: cover; }
.good-shit-map-popup .map-popup-media-scrim { position: absolute; inset: auto 0 0; height: 42%; background: linear-gradient(to top, color-mix(in srgb, var(--md-sys-color-surface-container-lowest) 26%, transparent), transparent); pointer-events: none; }
.good-shit-map-popup .map-popup-body { display: grid; gap: 11px; padding: 18px 18px 16px; }
.good-shit-map-popup .map-popup-card:not(.has-media) .map-popup-body { padding-top: 20px; }
.good-shit-map-popup .map-popup-kickers { display: flex; align-items: center; gap: 7px; padding-right: 40px; }
.good-shit-map-popup .map-popup-type,
.good-shit-map-popup .map-popup-tier {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.015em;
  line-height: 1;
  white-space: nowrap;
}
.good-shit-map-popup .map-popup-type { background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); }
.good-shit-map-popup .map-popup-tier { gap: 5px; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.good-shit-map-popup .tier-s .map-popup-tier { background: var(--tier-s-container); color: var(--tier-s); }
.good-shit-map-popup .tier-a .map-popup-tier { background: var(--tier-a-container); color: var(--tier-a); }
.good-shit-map-popup .tier-b .map-popup-tier { background: var(--tier-b-container); color: var(--tier-b); }
.good-shit-map-popup .tier-c .map-popup-tier { background: var(--tier-c-container); color: var(--tier-c); }
.good-shit-map-popup .map-popup-heading { display: grid; gap: 2px; }
.good-shit-map-popup .map-popup-heading h2 { margin: 0; padding-right: 24px; font-size: 1.28rem; line-height: 1.12; letter-spacing: -0.025em; text-wrap: balance; }
.good-shit-map-popup .map-popup-local-name { color: var(--md-sys-color-on-surface-variant); font-size: 0.79rem; line-height: 1.35; }
.good-shit-map-popup .map-popup-location { display: flex; align-items: flex-start; gap: 7px; color: var(--md-sys-color-on-surface-variant); font-size: 0.79rem; font-weight: 650; line-height: 1.35; }
.good-shit-map-popup .map-popup-location > span:first-child { flex: 0 0 auto; color: var(--md-sys-color-primary); font-size: 0.98rem; line-height: 1.05; }
.good-shit-map-popup .map-popup-summary { display: -webkit-box; overflow: hidden; color: var(--md-sys-color-on-surface); font-size: 0.88rem; line-height: 1.48; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
.good-shit-map-popup .map-popup-signals { display: flex; flex-wrap: wrap; gap: 6px; }
.good-shit-map-popup .map-popup-signals span { display: inline-flex; align-items: center; min-height: 28px; padding: 5px 9px; border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 72%, transparent); border-radius: 11px 14px 11px 14px; background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface-variant); font-size: 0.72rem; font-weight: 720; line-height: 1.2; }
.good-shit-map-popup .map-popup-rating { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 11px; border-radius: 14px 18px 14px 18px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant); font-size: 0.72rem; font-weight: 650; line-height: 1.2; }
.good-shit-map-popup .map-popup-rating-score { display: inline-flex; align-items: baseline; gap: 3px; color: var(--md-sys-color-on-surface); white-space: nowrap; }
.good-shit-map-popup .map-popup-rating-score > span { color: var(--md-sys-color-tertiary); }
.good-shit-map-popup .map-popup-rating-score strong { font-size: 0.9rem; }
.good-shit-map-popup .map-popup-rating-score small { color: var(--md-sys-color-on-surface-variant); font-size: 0.68rem; }
.good-shit-map-popup .map-popup-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  margin-top: 1px;
  padding: 0 15px 0 17px;
  border-radius: 18px 18px 18px 8px;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary) !important;
  font-size: 0.82rem;
  font-weight: 850 !important;
  text-decoration: none;
  box-shadow: var(--elevation-1);
  transition: transform var(--duration-short) var(--motion-emphasized), box-shadow var(--duration-short) var(--motion-standard), border-radius var(--duration-short) var(--motion-emphasized);
}
.good-shit-map-popup .map-popup-action > span:last-child { font-size: 1.2rem; transition: transform var(--duration-short) var(--motion-emphasized); }
.good-shit-map-popup .map-popup-action:hover { border-radius: 14px 22px 14px 12px; box-shadow: var(--elevation-2); transform: translateY(-1px); }
.good-shit-map-popup .map-popup-action:hover > span:last-child { transform: translateX(3px); }
.good-shit-map-popup .map-popup-action:active { transform: scale(0.985); }
@media (max-width: 520px) {
  .good-shit-map-popup.maplibregl-popup { width: min(360px, calc(100vw - 18px)); max-width: min(360px, calc(100vw - 18px)) !important; }
  .good-shit-map-popup .map-popup-media, .good-shit-map-popup .map-popup-media img { min-height: 138px; max-height: 166px; }
  .good-shit-map-popup .map-popup-body { gap: 9px; padding: 15px 15px 14px; }
  .good-shit-map-popup .map-popup-signals span:nth-child(n + 4) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .good-shit-map-popup .maplibregl-popup-close-button,
  .good-shit-map-popup .map-popup-action,
  .good-shit-map-popup .map-popup-action > span:last-child { transition: none; }
}
`;
}

export function ensureMapPopupStyles(targetDocument = globalThis.document) {
  if (!targetDocument?.head || targetDocument.getElementById('good-shit-map-popup-styles')) return;
  const style = targetDocument.createElement('style');
  style.id = 'good-shit-map-popup-styles';
  style.textContent = mapPopupStyles();
  targetDocument.head.append(style);
}
