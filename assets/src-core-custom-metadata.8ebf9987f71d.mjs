import { deepClone } from './src-core-normalization.af19f5c7bc33.mjs';

export function isPublicCustomField(specification) {
  return Boolean(specification) && specification.public !== false;
}

export function formatCustomValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value);
  return String(value).replaceAll('-', ' ');
}

export function customCardSignals(entity, customConfig) {
  const namespace = entity.custom?.namespace;
  const namespaceConfig = customConfig?.namespaces?.[namespace];
  if (!namespaceConfig) return [];
  const signals = [];
  for (const [fieldName, specification] of Object.entries(namespaceConfig.fields ?? {})) {
    if (!isPublicCustomField(specification) || !specification.cardSignal) continue;
    const value = entity.custom?.values?.[fieldName];
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) continue;
    const presentation = specification.cardSignal === true ? {} : specification.cardSignal;
    signals.push({
      order: Number.isFinite(presentation.order) ? presentation.order : 100,
      fieldName,
      text: `${presentation.prefix ?? ''}${formatCustomValue(value)}`
    });
  }
  return signals
    .sort((a, b) => a.order - b.order || a.fieldName.localeCompare(b.fieldName))
    .map((signal) => signal.text);
}

export function publicCustomMetadata(entity, customConfig) {
  const namespace = entity.custom?.namespace;
  const namespaceConfig = customConfig?.namespaces?.[namespace];
  if (!namespaceConfig) throw new Error(`Cannot publish unknown custom metadata namespace: ${namespace ?? '(missing)'}.`);
  const values = {};
  for (const [fieldName, value] of Object.entries(entity.custom?.values ?? {})) {
    if (!isPublicCustomField(namespaceConfig.fields?.[fieldName])) continue;
    values[fieldName] = deepClone(value);
  }
  return {
    namespace,
    schemaVersion: entity.custom.schemaVersion,
    values
  };
}

export function publicCustomMetadataConfig(customConfig) {
  const output = { schemaVersion: customConfig.schemaVersion, namespaces: {} };
  for (const [namespace, namespaceConfig] of Object.entries(customConfig.namespaces ?? {})) {
    const fields = {};
    for (const [fieldName, specification] of Object.entries(namespaceConfig.fields ?? {})) {
      if (!isPublicCustomField(specification)) continue;
      fields[fieldName] = deepClone(specification);
    }
    output.namespaces[namespace] = {
      ...deepClone(namespaceConfig),
      fields
    };
  }
  return output;
}
