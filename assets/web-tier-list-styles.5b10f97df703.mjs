export const TIER_LIST_CSS = String.raw`
.tier-list-shell {
  width: min(1540px, calc(100% - 2rem));
  margin-inline: auto;
  padding-block: clamp(2rem, 5vw, 5rem);
}

.tier-list-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: clamp(1rem, 3vw, 2.5rem);
  align-items: stretch;
  margin-bottom: clamp(1.5rem, 4vw, 3rem);
}

.tier-list-hero-copy,
.tier-list-hero-stat {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 62%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-low) 92%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-list-hero-copy {
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border-radius: 54px 24px 54px 24px;
}

.tier-list-hero-copy::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 18rem;
  aspect-ratio: 1;
  right: -6rem;
  bottom: -8rem;
  border-radius: 42% 58% 64% 36% / 52% 38% 62% 48%;
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 74%, transparent);
  rotate: 16deg;
}

.tier-list-hero-copy h1 {
  max-width: 12ch;
  margin-top: .25rem;
  font-size: clamp(2.8rem, 7vw, 6.2rem);
  line-height: .92;
}

.tier-list-hero-copy p {
  max-width: 64ch;
  margin-top: 1rem;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.05rem;
}

.tier-list-hero-stat {
  display: grid;
  align-content: center;
  gap: .75rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: 24px 54px 24px 54px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--md-sys-color-secondary-container) 78%, transparent), color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent));
}

.tier-list-hero-stat strong {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: .9;
}

.tier-list-hero-stat span {
  max-width: 24ch;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 700;
}

.tier-list-controls {
  display: grid;
  grid-template-columns: minmax(220px, 1.8fr) repeat(3, minmax(150px, .8fr)) auto;
  gap: .75rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 66%, transparent);
  border-radius: 30px 16px 30px 16px;
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 94%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-list-controls label {
  display: grid;
  gap: .35rem;
  min-width: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--text-label);
  font-weight: 800;
  letter-spacing: .02em;
}

.tier-list-controls input,
.tier-list-controls select {
  width: 100%;
  min-height: 3.25rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 18px;
  padding: .75rem .9rem;
  background: var(--md-sys-color-surface-container-lowest);
}

.tier-list-controls .tier-export-button {
  min-height: 3.25rem;
  white-space: nowrap;
}

.tier-list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem 1rem;
  align-items: center;
  justify-content: space-between;
  margin: .75rem .25rem 1.25rem;
  color: var(--md-sys-color-on-surface-variant);
}

.tier-list-meta strong {
  color: var(--md-sys-color-on-surface);
}

.tier-board {
  display: grid;
  gap: .8rem;
}

.tier-board-row {
  --tier-accent: var(--md-sys-color-primary);
  --tier-container: var(--md-sys-color-primary-container);
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 164px;
  overflow: clip;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent);
  border-radius: 44px 18px 44px 18px;
  background: color-mix(in srgb, var(--md-sys-color-surface-container-low) 94%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-board-row:nth-child(even) {
  border-radius: 18px 44px 18px 44px;
}

.tier-board-row[data-tier="S"] { --tier-accent: #b9344c; --tier-container: #ffd9df; }
.tier-board-row[data-tier="A"] { --tier-accent: #a55200; --tier-container: #ffdcc1; }
.tier-board-row[data-tier="B"] { --tier-accent: #756400; --tier-container: #f9e87c; }
.tier-board-row[data-tier="C"] { --tier-accent: #146c38; --tier-container: #b8f2c6; }
.tier-board-row[data-tier="D"] { --tier-accent: #245d9e; --tier-container: #d5e6ff; }
.tier-board-row[data-tier="E"] { --tier-accent: #5847a4; --tier-container: #e5deff; }
.tier-board-row[data-tier="F"] { --tier-accent: #8c3b86; --tier-container: #ffd7f7; }

.tier-rank {
  display: grid;
  place-items: center;
  align-content: center;
  gap: .2rem;
  padding: 1rem .5rem;
  background: var(--tier-container);
  color: color-mix(in srgb, var(--tier-accent) 88%, #111 12%);
}

.tier-rank strong {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  line-height: .9;
}

.tier-rank span {
  max-width: 9ch;
  text-align: center;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.tier-row-content {
  display: grid;
  gap: .75rem;
  min-width: 0;
  padding: 1rem;
}

.tier-row-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-inline: .2rem;
}

.tier-row-heading h2 {
  font-size: 1.05rem;
}

.tier-row-heading span {
  color: var(--md-sys-color-on-surface-variant);
  font-size: .82rem;
  font-weight: 800;
}

.tier-board-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: .7rem;
  align-content: start;
}

.tier-place-card {
  position: relative;
  display: grid;
  grid-template-rows: 92px auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent);
  border-radius: 26px 12px 26px 12px;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--md-sys-color-scrim) 10%, transparent);
  text-decoration: none;
  transition:
    transform var(--duration-short) var(--motion-emphasized),
    border-radius var(--duration-medium) var(--motion-emphasized),
    box-shadow var(--duration-short) var(--motion-standard);
}

.tier-place-card:nth-child(3n + 2) {
  border-radius: 12px 26px 12px 26px;
}

.tier-place-card:hover {
  z-index: 2;
  transform: translateY(-3px) rotate(-.25deg);
  border-radius: 14px 30px 14px 30px;
  box-shadow: var(--elevation-2);
  text-decoration: none;
}

.tier-place-media {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--tier-container) 86%, white 14%) 0 22%, transparent 23%),
    linear-gradient(145deg, var(--tier-container), color-mix(in srgb, var(--tier-container) 55%, var(--md-sys-color-surface-container-high)));
}

.tier-place-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale var(--duration-medium) var(--motion-standard);
}

.tier-place-card:hover .tier-place-media img {
  scale: 1.045;
}

.tier-place-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--tier-accent);
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 900;
}

.tier-place-copy {
  display: grid;
  gap: .22rem;
  align-content: start;
  padding: .72rem .78rem .82rem;
}

.tier-place-copy strong {
  overflow: hidden;
  font-size: .9rem;
  line-height: 1.18;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-place-copy span {
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: .74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-board-empty {
  display: grid;
  min-height: 86px;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--tier-accent) 42%, var(--md-sys-color-outline-variant));
  border-radius: 22px 10px 22px 10px;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

.tier-board-row.is-below-bar {
  min-height: 112px;
  opacity: .82;
}

.tier-board-row.is-below-bar .tier-row-content {
  align-content: center;
}

.tier-board-row.is-below-bar .tier-board-empty {
  min-height: 64px;
}

.tier-list-loading {
  display: grid;
  min-height: 280px;
  place-items: center;
  border-radius: 40px 18px 40px 18px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 800;
}

.tier-list-error {
  margin-top: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 22px;
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

@media (prefers-color-scheme: dark) {
  .tier-board-row[data-tier="S"] { --tier-accent: #ffb0bd; --tier-container: #6f2638; }
  .tier-board-row[data-tier="A"] { --tier-accent: #ffb874; --tier-container: #6a3600; }
  .tier-board-row[data-tier="B"] { --tier-accent: #eadb68; --tier-container: #514700; }
  .tier-board-row[data-tier="C"] { --tier-accent: #8fdda3; --tier-container: #174d29; }
  .tier-board-row[data-tier="D"] { --tier-accent: #a9c9ff; --tier-container: #214873; }
  .tier-board-row[data-tier="E"] { --tier-accent: #c9bdff; --tier-container: #41347c; }
  .tier-board-row[data-tier="F"] { --tier-accent: #f1a7e8; --tier-container: #62305f; }
  .tier-rank { color: var(--tier-accent); }
}

@media (max-width: 1120px) {
  .tier-list-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tier-list-controls .tier-export-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .tier-list-shell {
    width: min(100% - 1rem, 1540px);
    padding-top: 1rem;
  }
  .tier-list-hero {
    grid-template-columns: 1fr;
  }
  .tier-list-hero-copy,
  .tier-list-hero-stat {
    border-radius: 34px 16px 34px 16px;
  }
  .tier-list-hero-stat {
    grid-template-columns: auto 1fr;
    align-items: center;
  }
  .tier-list-hero-stat strong {
    font-size: 3.4rem;
  }
  .tier-list-controls {
    grid-template-columns: 1fr;
    padding: .8rem;
    border-radius: 24px 12px 24px 12px;
  }
  .tier-list-controls .tier-export-button {
    grid-column: auto;
  }
  .tier-board-row,
  .tier-board-row:nth-child(even) {
    grid-template-columns: 1fr;
    border-radius: 30px 14px 30px 14px;
  }
  .tier-rank {
    grid-template-columns: auto 1fr;
    justify-content: start;
    min-height: 76px;
    padding: .8rem 1rem;
  }
  .tier-rank strong {
    font-size: 2.8rem;
  }
  .tier-rank span {
    max-width: none;
    text-align: left;
  }
  .tier-board-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .tier-board-items {
    grid-template-columns: 1fr;
  }
  .tier-place-card {
    grid-template-columns: 92px minmax(0, 1fr);
    grid-template-rows: minmax(92px, auto);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tier-place-card,
  .tier-place-media img {
    transition: none;
  }
  .tier-place-card:hover {
    transform: none;
  }
}
`;
