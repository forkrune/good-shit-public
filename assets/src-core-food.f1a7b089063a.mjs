import { deepClone, isIsoDateTime, isPlainObject, normalizeText } from './src-core-normalization.af19f5c7bc33.mjs';

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HIGHLIGHT_KINDS = new Set([
  'dish', 'drink', 'pastry', 'ingredient', 'product', 'set', 'market-combination',
  'producer-speciality', 'experience', 'other'
]);
const PRICE_STATES = new Set(['market-price', 'variable', 'unknown']);
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const CURRENCIES = new Set(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : []);
const MAX_HIGHLIGHTS = 24;
const MAX_MENU_SECTIONS = 24;
const MAX_MENU_ITEMS = 200;

function report(errors, code, path, message) {
  errors.push({ code, path, message });
}

function allowedKeys(value, keys, path, errors) {
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) report(errors, 'unknown-food-field', `${path}.${key}`, `Unknown food-content field ${key}.`);
  }
}

function validateString(value, path, errors, options = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    report(errors, 'invalid-food-string', path, 'Expected a non-empty string.');
    return false;
  }
  if (options.maxLength && value.length > options.maxLength) report(errors, 'food-string-too-long', path, `Expected no more than ${options.maxLength} characters.`);
  if (options.pattern && !options.pattern.test(value)) report(errors, 'invalid-food-id', path, options.patternMessage ?? 'Value has an invalid format.');
  return true;
}

function validateOptionalString(value, path, errors, options = {}) {
  if (value === undefined || value === null) return;
  validateString(value, path, errors, options);
}

function validateStringArray(value, path, errors, options = {}) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    report(errors, 'invalid-food-string-array', path, 'Expected an array of non-empty strings.');
    return;
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (!validateString(item, `${path}[${index}]`, errors, { maxLength: options.maxLength ?? 240 })) return;
    const normalized = normalizeText(item);
    if (seen.has(normalized)) report(errors, 'duplicate-food-value', `${path}[${index}]`, 'Duplicate value after normalization.');
    seen.add(normalized);
  });
}

function validCurrency(value) {
  return typeof value === 'string'
    && CURRENCY_PATTERN.test(value)
    && (CURRENCIES.size === 0 || CURRENCIES.has(value));
}

export function validateFoodPrice(price, path = '$.food.price') {
  const errors = [];
  if (!isPlainObject(price)) {
    report(errors, 'invalid-food-price', path, 'Expected a structured price object.');
    return errors;
  }
  allowedKeys(price, new Set(['amount', 'min', 'max', 'currency', 'state', 'note']), path, errors);
  const hasAmount = Object.hasOwn(price, 'amount');
  const hasRange = Object.hasOwn(price, 'min') || Object.hasOwn(price, 'max');
  const hasState = Object.hasOwn(price, 'state');
  const modes = Number(hasAmount) + Number(hasRange) + Number(hasState);
  if (modes !== 1) report(errors, 'invalid-food-price-combination', path, 'Use exactly one price mode: amount, min/max range, or non-numeric state.');

  if (hasAmount) {
    if (!Number.isFinite(price.amount) || price.amount < 0) report(errors, 'invalid-food-price-amount', `${path}.amount`, 'Price amount must be a non-negative finite number.');
  }
  if (hasRange) {
    if (!Object.hasOwn(price, 'min') || !Object.hasOwn(price, 'max')) report(errors, 'invalid-food-price-range', path, 'Price ranges require both min and max.');
    if (!Number.isFinite(price.min) || price.min < 0) report(errors, 'invalid-food-price-min', `${path}.min`, 'Price range minimum must be a non-negative finite number.');
    if (!Number.isFinite(price.max) || price.max < 0) report(errors, 'invalid-food-price-max', `${path}.max`, 'Price range maximum must be a non-negative finite number.');
    if (Number.isFinite(price.min) && Number.isFinite(price.max) && price.min > price.max) report(errors, 'invalid-food-price-range', path, 'Price range minimum cannot exceed maximum.');
  }
  if (hasState && !PRICE_STATES.has(price.state)) report(errors, 'invalid-food-price-state', `${path}.state`, `Expected one of: ${[...PRICE_STATES].join(', ')}.`);

  if (hasAmount || hasRange) {
    if (!validCurrency(price.currency)) report(errors, 'invalid-food-currency', `${path}.currency`, 'Numeric prices require a valid ISO 4217 currency code.');
  } else if (price.currency !== undefined && !validCurrency(price.currency)) {
    report(errors, 'invalid-food-currency', `${path}.currency`, 'Expected a valid ISO 4217 currency code.');
  }
  validateOptionalString(price.note, `${path}.note`, errors, { maxLength: 300 });
  return errors;
}

function validateHighlight(highlight, path, errors, ids) {
  if (!isPlainObject(highlight)) {
    report(errors, 'invalid-food-highlight', path, 'Expected a food highlight object.');
    return;
  }
  allowedKeys(highlight, new Set(['id', 'kind', 'name', 'localName', 'description', 'whyRecommended', 'price', 'dietaryNotes', 'availability', 'menuItemId']), path, errors);
  if (validateString(highlight.id, `${path}.id`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use a stable lowercase ID with single hyphens.' })) {
    if (ids.has(highlight.id)) report(errors, 'duplicate-food-highlight-id', `${path}.id`, `Duplicate food highlight ID ${highlight.id}.`);
    ids.add(highlight.id);
  }
  if (!HIGHLIGHT_KINDS.has(highlight.kind)) report(errors, 'invalid-food-highlight-kind', `${path}.kind`, `Expected one of: ${[...HIGHLIGHT_KINDS].join(', ')}.`);
  validateString(highlight.name, `${path}.name`, errors, { maxLength: 200 });
  validateOptionalString(highlight.localName, `${path}.localName`, errors, { maxLength: 240 });
  validateOptionalString(highlight.description, `${path}.description`, errors, { maxLength: 1200 });
  validateOptionalString(highlight.whyRecommended, `${path}.whyRecommended`, errors, { maxLength: 1200 });
  if (highlight.price !== undefined) errors.push(...validateFoodPrice(highlight.price, `${path}.price`));
  validateStringArray(highlight.dietaryNotes, `${path}.dietaryNotes`, errors);
  validateOptionalString(highlight.availability, `${path}.availability`, errors, { maxLength: 500 });
  if (highlight.menuItemId !== undefined) validateString(highlight.menuItemId, `${path}.menuItemId`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use a stable lowercase menu item ID with single hyphens.' });
}

function validateMenuItem(item, path, errors, ids) {
  if (!isPlainObject(item)) {
    report(errors, 'invalid-food-menu-item', path, 'Expected a menu item object.');
    return;
  }
  allowedKeys(item, new Set(['id', 'name', 'localName', 'description', 'price', 'availability', 'tags', 'dietaryNotes', 'recommended']), path, errors);
  if (validateString(item.id, `${path}.id`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use a stable lowercase menu item ID with single hyphens.' })) {
    if (ids.has(item.id)) report(errors, 'duplicate-food-menu-item-id', `${path}.id`, `Duplicate menu item ID ${item.id}. IDs must be unique across the whole menu.`);
    ids.add(item.id);
  }
  validateString(item.name, `${path}.name`, errors, { maxLength: 200 });
  validateOptionalString(item.localName, `${path}.localName`, errors, { maxLength: 240 });
  validateOptionalString(item.description, `${path}.description`, errors, { maxLength: 1000 });
  if (item.price !== undefined) errors.push(...validateFoodPrice(item.price, `${path}.price`));
  validateOptionalString(item.availability, `${path}.availability`, errors, { maxLength: 500 });
  validateStringArray(item.tags, `${path}.tags`, errors);
  validateStringArray(item.dietaryNotes, `${path}.dietaryNotes`, errors);
  if (item.recommended !== undefined && typeof item.recommended !== 'boolean') report(errors, 'invalid-food-menu-recommended', `${path}.recommended`, 'Expected a boolean.');
}

function validateMenu(menu, entity, path, errors, menuItemIds) {
  if (!isPlainObject(menu)) {
    report(errors, 'invalid-food-menu', path, 'Expected a structured menu object.');
    return;
  }
  allowedKeys(menu, new Set(['completeness', 'checkedAt', 'sourceRefs', 'note', 'sections']), path, errors);
  if (!['partial', 'complete'].includes(menu.completeness)) report(errors, 'invalid-food-menu-completeness', `${path}.completeness`, 'Expected partial or complete.');
  if (!isIsoDateTime(menu.checkedAt)) report(errors, 'invalid-food-menu-checked-at', `${path}.checkedAt`, 'Expected a canonical ISO 8601 UTC timestamp.');
  validateOptionalString(menu.note, `${path}.note`, errors, { maxLength: 1000 });

  if (menu.sourceRefs !== undefined) {
    if (!Array.isArray(menu.sourceRefs)) report(errors, 'invalid-food-menu-sources', `${path}.sourceRefs`, 'Expected an array of source references.');
    else {
      const researchRefs = new Set((entity.research?.sources ?? []).map((source) => source.url));
      const seen = new Set();
      menu.sourceRefs.forEach((reference, index) => {
        if (typeof reference !== 'string' || !reference.trim()) report(errors, 'invalid-food-menu-source', `${path}.sourceRefs[${index}]`, 'Expected a non-empty source reference.');
        else {
          if (seen.has(reference)) report(errors, 'duplicate-food-menu-source', `${path}.sourceRefs[${index}]`, 'Duplicate menu source reference.');
          seen.add(reference);
          if (!researchRefs.has(reference)) report(errors, 'unregistered-food-menu-source', `${path}.sourceRefs[${index}]`, 'Menu source reference must also appear in research.sources so provenance remains centralized.');
        }
      });
    }
  }

  if (!Array.isArray(menu.sections)) {
    report(errors, 'invalid-food-menu-sections', `${path}.sections`, 'Expected an array of menu sections.');
    return;
  }
  if (menu.sections.length === 0) report(errors, 'empty-food-menu', `${path}.sections`, 'A structured menu must contain at least one non-empty section.');
  if (menu.sections.length > MAX_MENU_SECTIONS) report(errors, 'too-many-food-menu-sections', `${path}.sections`, `A curated menu may contain at most ${MAX_MENU_SECTIONS} sections.`);
  const sectionIds = new Set();
  let itemCount = 0;
  menu.sections.forEach((section, sectionIndex) => {
    const sectionPath = `${path}.sections[${sectionIndex}]`;
    if (!isPlainObject(section)) {
      report(errors, 'invalid-food-menu-section', sectionPath, 'Expected a menu section object.');
      return;
    }
    allowedKeys(section, new Set(['id', 'name', 'localName', 'items']), sectionPath, errors);
    if (validateString(section.id, `${sectionPath}.id`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use a stable lowercase menu section ID with single hyphens.' })) {
      if (sectionIds.has(section.id)) report(errors, 'duplicate-food-menu-section-id', `${sectionPath}.id`, `Duplicate menu section ID ${section.id}.`);
      sectionIds.add(section.id);
    }
    validateString(section.name, `${sectionPath}.name`, errors, { maxLength: 200 });
    validateOptionalString(section.localName, `${sectionPath}.localName`, errors, { maxLength: 240 });
    if (!Array.isArray(section.items) || section.items.length === 0) {
      report(errors, 'empty-food-menu-section', `${sectionPath}.items`, 'Menu sections must contain at least one item; omit empty sections instead.');
      return;
    }
    itemCount += section.items.length;
    section.items.forEach((item, itemIndex) => validateMenuItem(item, `${sectionPath}.items[${itemIndex}]`, errors, menuItemIds));
  });
  if (itemCount > MAX_MENU_ITEMS) report(errors, 'too-many-food-menu-items', `${path}.sections`, `A curated menu may contain at most ${MAX_MENU_ITEMS} items; do not transcribe a POS catalogue.`);
}

function validateFoodImages(images, path, errors, highlightIds, menuItemIds) {
  if (images === undefined) return;
  if (!Array.isArray(images)) {
    report(errors, 'invalid-food-images', path, 'Expected an array of food-image relationships.');
    return;
  }
  const seen = new Set();
  images.forEach((image, index) => {
    const imagePath = `${path}[${index}]`;
    if (!isPlainObject(image)) {
      report(errors, 'invalid-food-image', imagePath, 'Expected a food-image relationship object.');
      return;
    }
    allowedKeys(image, new Set(['assetId', 'targetType', 'targetId', 'alt', 'caption']), imagePath, errors);
    validateString(image.assetId, `${imagePath}.assetId`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use a lowercase registered image asset ID.' });
    if (!['highlight', 'menu-item'].includes(image.targetType)) report(errors, 'invalid-food-image-target-type', `${imagePath}.targetType`, 'Expected highlight or menu-item.');
    validateString(image.targetId, `${imagePath}.targetId`, errors, { maxLength: 100, pattern: ID_PATTERN, patternMessage: 'Use the stable target ID.' });
    validateString(image.alt, `${imagePath}.alt`, errors, { maxLength: 300 });
    validateOptionalString(image.caption, `${imagePath}.caption`, errors, { maxLength: 500 });
    if (image.targetType === 'highlight' && !highlightIds.has(image.targetId)) report(errors, 'broken-food-image-target', `${imagePath}.targetId`, `No food highlight with ID ${image.targetId} exists.`);
    if (image.targetType === 'menu-item' && !menuItemIds.has(image.targetId)) report(errors, 'broken-food-image-target', `${imagePath}.targetId`, `No menu item with ID ${image.targetId} exists.`);
    const key = `${image.assetId}|${image.targetType}|${image.targetId}`;
    if (seen.has(key)) report(errors, 'duplicate-food-image-reference', imagePath, 'The same asset may only be attached once to the same food target.');
    seen.add(key);
  });
}

export function validateFoodContent(entity, path = '$.food') {
  const errors = [];
  const food = entity.food;
  if (food === undefined) return errors;
  if (entity.entityType !== 'food') report(errors, 'food-content-on-non-food-entity', path, 'Native food content is only valid on entityType "food".');
  if (!isPlainObject(food)) {
    report(errors, 'invalid-food-content', path, 'Expected a structured food-content object.');
    return errors;
  }
  allowedKeys(food, new Set(['schemaVersion', 'highlights', 'menu', 'images']), path, errors);
  if (food.schemaVersion !== 1) report(errors, 'unsupported-food-schema', `${path}.schemaVersion`, 'Expected food schemaVersion 1.');

  const highlightIds = new Set();
  const menuItemIds = new Set();
  const highlights = food.highlights ?? [];
  if (!Array.isArray(highlights)) report(errors, 'invalid-food-highlights', `${path}.highlights`, 'Expected an array of curated food highlights.');
  else {
    if (highlights.length > MAX_HIGHLIGHTS) report(errors, 'too-many-food-highlights', `${path}.highlights`, `At most ${MAX_HIGHLIGHTS} curated highlights are allowed.`);
    highlights.forEach((highlight, index) => validateHighlight(highlight, `${path}.highlights[${index}]`, errors, highlightIds));
  }
  if (food.menu !== undefined) validateMenu(food.menu, entity, `${path}.menu`, errors, menuItemIds);

  if (Array.isArray(highlights)) {
    highlights.forEach((highlight, index) => {
      if (highlight?.menuItemId && !menuItemIds.has(highlight.menuItemId)) report(errors, 'broken-food-menu-reference', `${path}.highlights[${index}].menuItemId`, `No menu item with ID ${highlight.menuItemId} exists.`);
    });
  }
  validateFoodImages(food.images, `${path}.images`, errors, highlightIds, menuItemIds);
  return errors;
}

export function foodImageReferences(entity) {
  return entity.entityType === 'food' && Array.isArray(entity.food?.images) ? entity.food.images : [];
}

export function foodSearchValues(entity) {
  if (entity.entityType !== 'food' || !isPlainObject(entity.food)) return [];
  const values = [];
  for (const highlight of entity.food.highlights ?? []) {
    values.push(highlight.name, highlight.localName, highlight.description, highlight.whyRecommended, highlight.availability);
  }
  for (const section of entity.food.menu?.sections ?? []) {
    values.push(section.name, section.localName);
    for (const item of section.items ?? []) values.push(item.name, item.localName, item.description, item.availability, ...(item.tags ?? []));
  }
  return values.filter((value) => typeof value === 'string' && value.trim());
}

export function foodCardHighlight(entity) {
  if (entity.entityType !== 'food') return null;
  const first = entity.food?.highlights?.[0];
  return first?.name ?? null;
}

export function projectPublicFoodContent(food) {
  if (!isPlainObject(food)) return undefined;
  return deepClone({
    schemaVersion: food.schemaVersion,
    ...(food.highlights !== undefined ? { highlights: food.highlights } : {}),
    ...(food.menu !== undefined ? { menu: food.menu } : {}),
    ...(food.images?.length ? { images: food.images } : {})
  });
}
