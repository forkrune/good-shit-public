const ICON_NAME_PATTERN = /^[a-z0-9-]+$/;

function escapeAttribute(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function renderUiIcon(spriteUrl, name, className = 'ui-icon') {
  const safeName = ICON_NAME_PATTERN.test(String(name)) ? String(name) : 'diamond';
  return `<svg class="${escapeAttribute(className)}" data-ui-icon="${safeName}" aria-hidden="true" focusable="false"><use href="${escapeAttribute(spriteUrl)}#${safeName}"></use></svg>`;
}

export function renderPlaceIcon(iconUrls, key, className = 'place-icon') {
  const url = iconUrls?.[key] ?? iconUrls?.default;
  if (!url) return '';
  return `<img class="${escapeAttribute(className)}" src="${escapeAttribute(url)}" alt="" aria-hidden="true" width="20" height="20" loading="eager" decoding="async">`;
}

export function setUiIcon(element, spriteUrl, name) {
  const icon = element?.querySelector?.('[data-ui-icon]');
  const use = icon?.querySelector?.('use');
  if (!icon || !use || !ICON_NAME_PATTERN.test(String(name))) return;
  icon.dataset.uiIcon = String(name);
  use.setAttribute('href', `${spriteUrl}#${name}`);
}
