import { DEFAULT_HIKING_CONFIG, HIKING_CONDITION_SEVERITIES, activeVariants, defaultHikingVariant } from './src-core-hiking-geometry.832af140e8b9.mjs';

function dateFromBuildEnvironment(environment = process.env) {
  if (environment.SOURCE_DATE_EPOCH && Number.isFinite(Number(environment.SOURCE_DATE_EPOCH))) return new Date(Number(environment.SOURCE_DATE_EPOCH) * 1000);
  if (environment.GOOD_SHIT_BUILD_TIME && Number.isFinite(Date.parse(environment.GOOD_SHIT_BUILD_TIME))) return new Date(environment.GOOD_SHIT_BUILD_TIME);
  return new Date();
}

export function hikingBuildTime() {
  return dateFromBuildEnvironment();
}

function latestObservation(condition) {
  return [...(condition.observations ?? [])].sort((a, b) => {
    const aTime = Date.parse(a.lastVerifiedAt ?? a.reportedAt ?? 0);
    const bTime = Date.parse(b.lastVerifiedAt ?? b.reportedAt ?? 0);
    return aTime - bTime;
  }).at(-1) ?? null;
}

export function evaluateCondition(condition, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  const observation = latestObservation(condition);
  if (!observation) return { state: 'history', freshness: 'unknown', observation: null, ageDays: null };
  const nowTime = now instanceof Date ? now.getTime() : Date.parse(now);
  const verifiedTime = Date.parse(observation.lastVerifiedAt ?? observation.reportedAt);
  const ageDays = Number.isFinite(verifiedTime) ? (nowTime - verifiedTime) / 86_400_000 : Infinity;
  if (observation.status === 'resolved' || (observation.resolvedAt && Date.parse(observation.resolvedAt) <= nowTime)) {
    return { state: 'history', freshness: 'resolved', observation, ageDays };
  }
  if (observation.expectedEndAt && Date.parse(observation.expectedEndAt) < nowTime && verifiedTime <= Date.parse(observation.expectedEndAt)) {
    return { state: 'history', freshness: 'expired', observation, ageDays };
  }
  if (observation.status === 'unknown') return { state: 'current', freshness: 'stale', observation, ageDays };
  const freshnessDays = Number(config.conditionFreshnessDays?.[observation.severity] ?? DEFAULT_HIKING_CONFIG.conditionFreshnessDays[observation.severity] ?? 30);
  return { state: 'current', freshness: ageDays <= freshnessDays ? 'verified' : 'stale', observation, ageDays };
}

export function publicConditionSummary(entity, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  return (entity?.hiking?.conditions ?? []).map((condition) => {
    const evaluated = evaluateCondition(condition, now, config);
    return { condition, ...evaluated };
  });
}

function severityRank(severity) {
  return HIKING_CONDITION_SEVERITIES.indexOf(severity);
}

export function importantCurrentConditions(entity, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  return publicConditionSummary(entity, now, config)
    .filter((entry) => entry.state === 'current' && severityRank(entry.observation?.severity) >= severityRank('high'))
    .sort((a, b) => severityRank(b.observation.severity) - severityRank(a.observation.severity));
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return null;
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  if (!hours) return `${remaining} min`;
  return remaining ? `${hours} h ${remaining} min` : `${hours} h`;
}

function legacyHikingVariant(entity) {
  if (entity?.entityType !== 'hiking-route' || entity.hiking || entity.custom?.namespace !== 'hiking') return null;
  const values = entity.custom?.values ?? {};
  if (![values.distanceKm, values.ascentM, values.durationMinutes].every(Number.isFinite)) return null;
  return {
    id: 'legacy-default',
    name: 'Published route',
    routeType: values.routeType ?? 'network',
    difficulty: values.difficulty ?? 'moderate',
    seasonality: values.seasonality ?? [],
    distanceKm: values.distanceKm,
    ascentM: values.ascentM,
    descentM: Number.isFinite(values.descentM) ? values.descentM : values.ascentM,
    durationMinutes: values.durationMinutes,
    ...(values.surface?.length ? { surface: values.surface } : {}),
    ...(values.waymarking ? { waymarking: values.waymarking } : {})
  };
}

export function applyHikingCompatibilityMetadata(entity) {
  if (entity?.entityType !== 'hiking-route' || !entity.hiking || entity.custom?.namespace !== 'hiking') return entity;
  const variant = defaultHikingVariant(entity) ?? activeVariants(entity.hiking)[0];
  if (!variant) return entity;
  entity.custom.values ??= {};
  const values = entity.custom.values;
  for (const key of ['distanceKm', 'ascentM', 'descentM', 'durationMinutes', 'difficulty', 'routeType']) {
    if (values[key] === undefined && variant[key] !== undefined) values[key] = structuredClone(variant[key]);
  }
  for (const key of ['surface', 'seasonality']) {
    if (values[key] === undefined && Array.isArray(variant[key]) && variant[key].length) values[key] = [...variant[key]];
  }
  if (values.waymarking === undefined && ['clear', 'partial', 'unmarked'].includes(variant.waymarking)) values.waymarking = variant.waymarking;
  return entity;
}

function searchableVariants(entity) {
  if (entity?.hiking) return activeVariants(entity.hiking);
  const legacy = legacyHikingVariant(entity);
  return legacy ? [legacy] : [];
}

export function hikingCardSignals(entity, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  const variant = defaultHikingVariant(entity) ?? legacyHikingVariant(entity);
  if (!variant) return [];
  const signals = [
    `${Number(variant.distanceKm).toFixed(variant.distanceKm < 10 ? 1 : 0)} km · ↑${Math.round(variant.ascentM)} m · ${formatDuration(variant.durationMinutes)}`,
    String(variant.difficulty).replaceAll('-', ' ')
  ];
  const count = entity.hiking ? activeVariants(entity.hiking).length : 1;
  if (count > 1) signals.push(`${count} variants`);
  const important = entity.hiking ? importantCurrentConditions(entity, now, config) : [];
  if (important.length) signals.push(important.some((entry) => entry.freshness === 'stale') ? 'Important condition · recheck' : 'Important route condition');
  return signals;
}

export function hikingSearchValues(entity, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  if (entity?.entityType !== 'hiking-route') return [];
  const values = [];
  for (const variant of searchableVariants(entity)) {
    values.push(variant.name, variant.description, variant.routeType, variant.difficulty, variant.technicalDifficulty, variant.exposure, variant.scrambling, ...(variant.surface ?? []), ...(variant.terrain ?? []), ...(variant.seasonality ?? []), variant.waymarking, variant.accessNotes, variant.seasonalLimitations, variant.waterAvailability, ...(variant.suitabilityConstraints ?? []), ...(variant.warnings ?? []));
  }
  for (const waypoint of entity.hiking?.waypoints ?? []) values.push(waypoint.name, waypoint.type, waypoint.description, waypoint.practicalNote);
  for (const { state, observation } of entity.hiking ? publicConditionSummary(entity, now, config) : []) {
    if (state === 'current' && observation) values.push(observation.description, observation.severity);
  }
  return values.filter((value) => typeof value === 'string' && value.trim());
}

export function hikingSearchSummary(entity, now = hikingBuildTime(), config = DEFAULT_HIKING_CONFIG) {
  if (entity?.entityType !== 'hiking-route') return null;
  const sourceVariants = searchableVariants(entity);
  if (!sourceVariants.length) return null;
  const variants = sourceVariants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    routeType: variant.routeType,
    difficulty: variant.difficulty,
    seasonality: variant.seasonality ?? [],
    distanceKm: variant.distanceKm,
    ascentM: variant.ascentM,
    durationMinutes: variant.durationMinutes
  }));
  const important = entity.hiking ? importantCurrentConditions(entity, now, config) : [];
  return {
    defaultVariantId: entity.hiking?.defaultVariantId ?? variants[0].id,
    variantCount: variants.length,
    variants,
    importantCondition: important[0] ? {
      severity: important[0].observation.severity,
      freshness: important[0].freshness,
      description: important[0].observation.description
    } : null
  };
}

export function hikingDocumentMatchesFilters(document, filters = {}) {
  const criteria = filters.hiking;
  if (!criteria || !document.hiking) return !criteria || Object.values(criteria).every((value) => value == null || value === '' || (Array.isArray(value) && !value.length));
  const hasCriteria = Object.values(criteria).some((value) => value != null && value !== '' && (!Array.isArray(value) || value.length));
  if (!hasCriteria) return true;
  return (document.hiking.variants ?? []).some((variant) => {
    if (criteria.difficulty && variant.difficulty !== criteria.difficulty) return false;
    if (criteria.routeType && variant.routeType !== criteria.routeType) return false;
    if (criteria.seasonality && !(variant.seasonality ?? []).includes(criteria.seasonality)) return false;
    if (criteria.distanceMinKm != null && variant.distanceKm < criteria.distanceMinKm) return false;
    if (criteria.distanceMaxKm != null && variant.distanceKm > criteria.distanceMaxKm) return false;
    if (criteria.ascentMinM != null && variant.ascentM < criteria.ascentMinM) return false;
    if (criteria.ascentMaxM != null && variant.ascentM > criteria.ascentMaxM) return false;
    if (criteria.durationMinMinutes != null && variant.durationMinutes < criteria.durationMinMinutes) return false;
    if (criteria.durationMaxMinutes != null && variant.durationMinutes > criteria.durationMaxMinutes) return false;
    return true;
  });
}

