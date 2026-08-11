export const PUBLIC_PRESENTATION_TIERS = Object.freeze(['S', 'A', 'B', 'C']);

export const TIER_PRESENTATION_CSS = String.raw`
/* Tier presentation is intentionally semantic: color, size, shape and containment
   reinforce the editorial tier without adding explanatory copy. */
.tier-display.is-expressive-tier,
.tier-row.has-tier-theme,
.browse-tile[data-tier-theme] {
  --tier-accent: var(--md-sys-color-primary);
  --tier-surface: var(--md-sys-color-primary-container);
}

.tier-display.tier-s,
.tier-row.tier-s,
.browse-tile[data-tier-theme="S"] { --tier-accent: var(--tier-s); --tier-surface: var(--tier-s-container); }
.tier-display.tier-a,
.tier-row.tier-a,
.browse-tile[data-tier-theme="A"] { --tier-accent: var(--tier-a); --tier-surface: var(--tier-a-container); }
.tier-display.tier-b,
.tier-row.tier-b,
.browse-tile[data-tier-theme="B"] { --tier-accent: var(--tier-b); --tier-surface: var(--tier-b-container); }
.tier-display.tier-c,
.tier-row.tier-c,
.browse-tile[data-tier-theme="C"] { --tier-accent: var(--tier-c); --tier-surface: var(--tier-c-container); }

.detail-hero:has(.tier-display.is-expressive-tier) {
  background:
    linear-gradient(138deg,
      color-mix(in srgb, var(--tier-surface) 62%, var(--md-sys-color-surface)) 0 52%,
      color-mix(in srgb, var(--md-sys-color-secondary-container) 34%, var(--md-sys-color-surface)) 100%);
}
.detail-hero:has(.tier-display.tier-s) { --tier-surface: var(--tier-s-container); }
.detail-hero:has(.tier-display.tier-a) { --tier-surface: var(--tier-a-container); }
.detail-hero:has(.tier-display.tier-b) { --tier-surface: var(--tier-b-container); }
.detail-hero:has(.tier-display.tier-c) { --tier-surface: var(--tier-c-container); }

.tier-display.is-expressive-tier {
  position: relative;
  isolation: isolate;
  grid-template-columns: 80px minmax(0, 1fr);
  min-height: 116px;
  gap: var(--space-5);
  overflow: hidden;
  padding: var(--space-4) var(--space-6) var(--space-4) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--tier-accent) 36%, transparent);
  border-radius: 36px 20px 46px 24px;
  background: var(--tier-surface);
  color: var(--tier-accent);
  box-shadow: var(--elevation-1);
}

.tier-display.is-expressive-tier::after {
  content: "";
  position: absolute;
  z-index: -1;
  right: -4.25rem;
  bottom: -5rem;
  width: 9rem;
  aspect-ratio: 1;
  border-radius: 42% 58% 68% 32% / 56% 38% 62% 44%;
  background: color-mix(in srgb, var(--tier-accent) 11%, transparent);
  rotate: -14deg;
}

.tier-display.is-expressive-tier .tier-letter {
  width: 80px;
  aspect-ratio: 1;
  border-radius: 24px 39px 22px 35px;
  background: var(--tier-accent);
  color: var(--tier-surface);
  font-size: 3rem;
  line-height: 1;
  rotate: -5deg;
}

.tier-display.is-expressive-tier > strong {
  min-width: 0;
  color: var(--tier-accent);
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.04;
  text-wrap: balance;
}

/* Carry the same tier language into existing tier surfaces without changing content. */
.tier-row.has-tier-theme {
  border-color: color-mix(in srgb, var(--tier-accent) 34%, var(--md-sys-color-outline-variant));
  background: color-mix(in srgb, var(--tier-surface) 32%, var(--md-sys-color-surface-container-low));
}
.tier-row.has-tier-theme > strong {
  border: 1px solid color-mix(in srgb, var(--tier-accent) 30%, transparent);
  background: var(--tier-surface);
  color: var(--tier-accent);
}

.browse-tile[data-tier-theme] {
  border-color: color-mix(in srgb, var(--tier-accent) 30%, var(--md-sys-color-outline-variant));
}
.browse-tile[data-tier-theme]::after { color: var(--tier-accent); opacity: .14; }
.browse-tile[data-tier-theme]:hover {
  background: color-mix(in srgb, var(--tier-surface) 72%, var(--md-sys-color-surface-container-lowest));
}

@media (max-width: 720px) {
  .tier-display.is-expressive-tier {
    grid-template-columns: 68px minmax(0, 1fr);
    min-height: 96px;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-5) var(--space-3) var(--space-3);
    border-radius: 30px 18px 38px 20px;
  }
  .tier-display.is-expressive-tier .tier-letter {
    width: 68px;
    border-radius: 20px 33px 18px 29px;
    font-size: 2.55rem;
  }
}

@media (prefers-contrast: more) {
  .tier-display.is-expressive-tier,
  .tier-row.has-tier-theme,
  .browse-tile[data-tier-theme] { border-width: 2px; }
}

@media (forced-colors: active) {
  .tier-display.is-expressive-tier,
  .tier-row.has-tier-theme,
  .browse-tile[data-tier-theme] {
    border: 2px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  .tier-display.is-expressive-tier .tier-letter,
  .tier-row.has-tier-theme > strong {
    border: 2px solid CanvasText;
    background: CanvasText;
    color: Canvas;
  }
  .tier-display.is-expressive-tier > strong { color: CanvasText; }
}
`;

function normalizedPublicTier(value) {
  const tier = String(value ?? '').trim().toUpperCase();
  return PUBLIC_PRESENTATION_TIERS.includes(tier) ? tier : null;
}

export function tierPresentationClass(value) {
  const tier = normalizedPublicTier(value);
  return tier ? `tier-${tier.toLowerCase()}` : null;
}

function injectStyles(documentObject) {
  if (!documentObject?.head || documentObject.getElementById('tier-presentation-expressive-styles')) return;
  const style = documentObject.createElement('style');
  style.id = 'tier-presentation-expressive-styles';
  style.textContent = TIER_PRESENTATION_CSS;
  documentObject.head.append(style);
}

function enhanceDetailTier(display) {
  const letter = display.querySelector('.tier-letter');
  const label = display.querySelector('strong');
  const tier = normalizedPublicTier(letter?.textContent);
  if (!letter || !label || !tier) return;

  display.classList.add('is-expressive-tier', `tier-${tier.toLowerCase()}`);
  display.replaceChildren(letter, label);
  display.setAttribute('role', 'group');
  display.setAttribute('aria-label', `Tier ${tier}: ${label.textContent.trim()}`);
  letter.setAttribute('aria-hidden', 'true');
  label.setAttribute('aria-hidden', 'true');
}

function enhanceQualityTierRow(row) {
  const tier = normalizedPublicTier(row.querySelector('h3')?.textContent);
  if (!tier) return;
  row.classList.add('has-tier-theme', `tier-${tier.toLowerCase()}`);
}

function enhanceTierBrowseTile(tile) {
  const tier = normalizedPublicTier(tile.dataset.symbol);
  if (tier) tile.dataset.tierTheme = tier;
}

export function enhanceTierPresentation(root = document) {
  const documentObject = root?.nodeType === 9 ? root : root?.ownerDocument;
  if (!documentObject) return;
  injectStyles(documentObject);
  for (const display of root.querySelectorAll?.('.tier-display') ?? []) enhanceDetailTier(display);
  for (const row of root.querySelectorAll?.('.tier-row') ?? []) enhanceQualityTierRow(row);
  for (const tile of root.querySelectorAll?.('.browse-tile[data-symbol]') ?? []) enhanceTierBrowseTile(tile);
}

if (typeof document !== 'undefined') enhanceTierPresentation(document);
