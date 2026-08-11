import { haversineKm } from './src-core-geo.a34d5b20ddb0.mjs';

export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export const HIKING_ROUTE_TYPES = Object.freeze(['loop', 'out-and-back', 'point-to-point', 'network']);
export const HIKING_DIFFICULTIES = Object.freeze(['easy', 'moderate', 'hard', 'expert']);
export const HIKING_TECHNICAL_DIFFICULTIES = Object.freeze(['none', 'easy', 'moderate', 'hard', 'expert']);
export const HIKING_SEASONS = Object.freeze(['spring', 'summer', 'autumn', 'winter', 'year-round']);
export const HIKING_WAYMARKING = Object.freeze(['clear', 'partial', 'variable', 'unmarked']);
export const HIKING_VARIANT_LIFECYCLES = Object.freeze(['active', 'seasonal', 'retired']);
export const HIKING_WAYPOINT_ROLES = Object.freeze(['informational', 'highlight', 'service', 'hazard']);
export const HIKING_WAYPOINT_IMPORTANCE = Object.freeze(['low', 'medium', 'high']);
export const HIKING_WAYPOINT_TYPES = Object.freeze([
  'viewpoint', 'waterfall', 'rock-formation', 'swimming-spot', 'water-source', 'hut', 'shelter', 'food-stop',
  'trailhead', 'parking', 'public-transport', 'junction', 'summit', 'historic-feature', 'dangerous-junction',
  'exposed-section', 'scramble', 'river-crossing', 'temporary-hazard', 'other'
]);
export const HIKING_CONDITION_TYPES = Object.freeze([
  'trail-closure', 'bridge-removed', 'landslide', 'flood-damage', 'forestry-works', 'seasonal-closure', 'snow-ice',
  'waymarking-damage', 'construction', 'access-restriction', 'route-reopened', 'temporary-detour', 'warning-resolved', 'other'
]);
export const HIKING_CONDITION_SEVERITIES = Object.freeze(['info', 'low', 'moderate', 'high', 'critical']);
export const HIKING_CONDITION_STATUSES = Object.freeze(['active', 'resolved', 'unknown']);
export const HIKING_CONFIDENCE = Object.freeze(['low', 'medium', 'high']);

export const DEFAULT_HIKING_CONFIG = Object.freeze({
  schemaVersion: 1,
  displayGeometry: { toleranceMetres: 12, maxVerticesPerLine: 256, maxVerticesTotal: 512 },
  waypoints: { warnOffsetMetres: 1500, hardOffsetMetres: 20000 },
  trailEndpoints: { warnOffsetMetres: 300, loopClosureMetres: 500 },
  conditionFreshnessDays: { info: 90, low: 60, moderate: 30, high: 14, critical: 7 }
});

export function issue(collection, code, pathName, message, source = null) {
  collection.push({ code, path: pathName, message, ...(source ? { source } : {}) });
}

export function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function validTimestamp(value) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && value.includes('T');
}

export function validateUrl(value) {
  try {
    return HTTP_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validatePosition(position, pathName, errors, source = null) {
  if (!Array.isArray(position) || position.length < 2 || position.length > 3) {
    issue(errors, 'invalid-hiking-coordinate', pathName, 'Expected [longitude, latitude] or [longitude, latitude, elevationMetres].', source);
    return false;
  }
  const [longitude, latitude, elevation] = position;
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) issue(errors, 'invalid-hiking-longitude', `${pathName}[0]`, 'Longitude must be between -180 and 180.', source);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) issue(errors, 'invalid-hiking-latitude', `${pathName}[1]`, 'Latitude must be between -90 and 90.', source);
  if (position.length === 3 && !Number.isFinite(elevation)) issue(errors, 'invalid-hiking-elevation', `${pathName}[2]`, 'Elevation must be a finite number in metres.', source);
  return true;
}

export function routeLines(geometry) {
  if (geometry?.type === 'LineString') return [geometry.coordinates];
  if (geometry?.type === 'MultiLineString') return geometry.coordinates;
  return [];
}

export function routePositionCount(geometry) {
  return routeLines(geometry).reduce((sum, line) => sum + (Array.isArray(line) ? line.length : 0), 0);
}

export function validateRouteGeometry(geometry, pathName, errors, source = null) {
  if (!isObject(geometry) || !['LineString', 'MultiLineString'].includes(geometry.type)) {
    issue(errors, 'invalid-hiking-route-geometry', pathName, 'Hiking route geometry must be a GeoJSON LineString or MultiLineString.', source);
    return false;
  }
  const lines = routeLines(geometry);
  if (!lines.length) {
    issue(errors, 'empty-hiking-route', pathName, 'Route geometry must contain at least one line.', source);
    return false;
  }
  lines.forEach((line, lineIndex) => {
    const linePath = geometry.type === 'LineString' ? `${pathName}.coordinates` : `${pathName}.coordinates[${lineIndex}]`;
    if (!Array.isArray(line) || line.length < 2) issue(errors, 'short-hiking-route-line', linePath, 'Each route line requires at least two positions.', source);
    else line.forEach((position, pointIndex) => validatePosition(position, `${linePath}[${pointIndex}]`, errors, source));
  });
  return true;
}

function projectedPointDistanceMetres(point, start, end) {
  const referenceLat = point[1] * Math.PI / 180;
  const scaleX = Math.cos(referenceLat) * 111_320;
  const scaleY = 110_574;
  const px = point[0] * scaleX;
  const py = point[1] * scaleY;
  const ax = start[0] * scaleX;
  const ay = start[1] * scaleY;
  const bx = end[0] * scaleX;
  const by = end[1] * scaleY;
  const dx = bx - ax;
  const dy = by - ay;
  const denominator = dx * dx + dy * dy;
  const t = denominator === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator));
  return { distanceMetres: Math.hypot(px - (ax + t * dx), py - (ay + t * dy)), t };
}

function rdpIndices(line, toleranceMetres) {
  const keep = new Set([0, line.length - 1]);
  const recurse = (startIndex, endIndex) => {
    if (endIndex - startIndex <= 1) return;
    let bestDistance = -1;
    let bestIndex = -1;
    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const { distanceMetres } = projectedPointDistanceMetres(line[index], line[startIndex], line[endIndex]);
      if (distanceMetres > bestDistance) {
        bestDistance = distanceMetres;
        bestIndex = index;
      }
    }
    if (bestDistance > toleranceMetres) {
      keep.add(bestIndex);
      recurse(startIndex, bestIndex);
      recurse(bestIndex, endIndex);
    }
  };
  recurse(0, line.length - 1);
  return keep;
}

function extremaIndices(line) {
  const values = [
    ['minLon', Infinity, (point) => point[0], (a, b) => a < b],
    ['maxLon', -Infinity, (point) => point[0], (a, b) => a > b],
    ['minLat', Infinity, (point) => point[1], (a, b) => a < b],
    ['maxLat', -Infinity, (point) => point[1], (a, b) => a > b]
  ];
  const indexes = new Set([0, line.length - 1]);
  line.forEach((point, index) => {
    for (const value of values) {
      const candidate = value[2](point);
      if (value[3](candidate, value[1])) {
        value[1] = candidate;
        value[4] = index;
      }
    }
  });
  for (const value of values) if (Number.isInteger(value[4])) indexes.add(value[4]);
  return indexes;
}

function simplifyLine(line, options) {
  if (line.length <= 2) return line.map((point) => [...point]);
  const tolerance = Number(options.toleranceMetres ?? DEFAULT_HIKING_CONFIG.displayGeometry.toleranceMetres);
  const maximum = Math.max(8, Number(options.maxVerticesPerLine ?? DEFAULT_HIKING_CONFIG.displayGeometry.maxVerticesPerLine));
  const selected = rdpIndices(line, tolerance);
  for (const index of extremaIndices(line)) selected.add(index);
  if (selected.size > maximum) {
    const required = extremaIndices(line);
    const slots = Math.max(0, maximum - required.size);
    for (let slot = 0; slot < slots; slot += 1) required.add(Math.round((slot + 1) * (line.length - 1) / (slots + 1)));
    selected.clear();
    for (const index of required) selected.add(index);
  }
  return [...selected].sort((a, b) => a - b).map((index) => [...line[index]]);
}

function capSimplifiedLines(lines, options) {
  const maximumTotal = Math.max(16, Number(options.maxVerticesTotal ?? DEFAULT_HIKING_CONFIG.displayGeometry.maxVerticesTotal));
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  if (total <= maximumTotal) return lines;

  const required = lines.map((line) => new Set(line.length ? [0, line.length - 1] : []));
  const extrema = {
    minLon: { value: Infinity }, maxLon: { value: -Infinity },
    minLat: { value: Infinity }, maxLat: { value: -Infinity }
  };
  lines.forEach((line, lineIndex) => line.forEach((point, pointIndex) => {
    if (point[0] < extrema.minLon.value) extrema.minLon = { value: point[0], lineIndex, pointIndex };
    if (point[0] > extrema.maxLon.value) extrema.maxLon = { value: point[0], lineIndex, pointIndex };
    if (point[1] < extrema.minLat.value) extrema.minLat = { value: point[1], lineIndex, pointIndex };
    if (point[1] > extrema.maxLat.value) extrema.maxLat = { value: point[1], lineIndex, pointIndex };
  }));
  for (const item of Object.values(extrema)) if (Number.isInteger(item.lineIndex)) required[item.lineIndex].add(item.pointIndex);

  const requiredCount = required.reduce((sum, indexes) => sum + indexes.size, 0);
  if (requiredCount >= maximumTotal) return lines.map((line, index) => [...required[index]].sort((a, b) => a - b).map((pointIndex) => line[pointIndex]));
  const available = maximumTotal - requiredCount;
  const optionalCounts = lines.map((line, index) => Math.max(0, line.length - required[index].size));
  const optionalTotal = optionalCounts.reduce((sum, value) => sum + value, 0) || 1;

  return lines.map((line, lineIndex) => {
    const indexes = new Set(required[lineIndex]);
    const extras = Math.min(optionalCounts[lineIndex], Math.floor(available * optionalCounts[lineIndex] / optionalTotal));
    for (let slot = 1; slot <= extras; slot += 1) indexes.add(Math.round(slot * (line.length - 1) / (extras + 1)));
    return [...indexes].sort((a, b) => a - b).map((pointIndex) => line[pointIndex]);
  });
}

export function simplifyRouteGeometry(geometry, options = DEFAULT_HIKING_CONFIG.displayGeometry) {
  if (!['LineString', 'MultiLineString'].includes(geometry?.type)) throw new TypeError('Route simplification requires LineString or MultiLineString geometry.');
  const sourceLines = routeLines(geometry);
  const maximumPerLine = Math.max(8, Number(options.maxVerticesPerLine ?? DEFAULT_HIKING_CONFIG.displayGeometry.maxVerticesPerLine));
  const maximumTotal = Math.max(16, Number(options.maxVerticesTotal ?? DEFAULT_HIKING_CONFIG.displayGeometry.maxVerticesTotal));
  const fitsDisplayBudget = sourceLines.every((line) => line.length <= maximumPerLine)
    && sourceLines.reduce((sum, line) => sum + line.length, 0) <= maximumTotal;
  if (fitsDisplayBudget) {
    return geometry.type === 'LineString'
      ? { type: 'LineString', coordinates: geometry.coordinates.map((point) => [...point]) }
      : { type: 'MultiLineString', coordinates: geometry.coordinates.map((line) => line.map((point) => [...point])) };
  }
  if (geometry.type === 'LineString') {
    const [coordinates] = capSimplifiedLines([simplifyLine(geometry.coordinates, options)], options);
    return { type: 'LineString', coordinates };
  }
  const lines = geometry.coordinates.map((line) => simplifyLine(line, options));
  return { type: 'MultiLineString', coordinates: capSimplifiedLines(lines, options) };
}

export function routeDistanceKm(geometry) {
  let total = 0;
  for (const line of routeLines(geometry)) {
    for (let index = 1; index < line.length; index += 1) total += haversineKm(line[index - 1], line[index]);
  }
  return total;
}

function interpolatePosition(start, end, t) {
  const position = [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
  if (Number.isFinite(start[2]) && Number.isFinite(end[2])) position.push(start[2] + (end[2] - start[2]) * t);
  return position;
}

export function locatePointAlongRoute(point, geometry) {
  let best = { offsetMetres: Infinity, distanceAlongKm: null, snappedCoordinate: null };
  let accumulatedKm = 0;
  for (const line of routeLines(geometry)) {
    for (let index = 1; index < line.length; index += 1) {
      const start = line[index - 1];
      const end = line[index];
      const segmentKm = haversineKm(start, end);
      const projected = projectedPointDistanceMetres(point, start, end);
      if (projected.distanceMetres < best.offsetMetres) {
        best = {
          offsetMetres: projected.distanceMetres,
          distanceAlongKm: accumulatedKm + segmentKm * projected.t,
          snappedCoordinate: interpolatePosition(start, end, projected.t)
        };
      }
      accumulatedKm += segmentKm;
    }
  }
  return best;
}

export function routeEndpoints(geometry) {
  const lines = routeLines(geometry).filter((line) => line.length);
  if (!lines.length) return { start: null, finish: null };
  return { start: lines[0][0], finish: lines.at(-1).at(-1) };
}

export function routeElevationProfile(geometry) {
  const points = [];
  let accumulatedKm = 0;
  let previous = null;
  for (const line of routeLines(geometry)) {
    previous = null;
    for (const position of line) {
      if (previous) accumulatedKm += haversineKm(previous, position);
      if (Number.isFinite(position[2])) points.push({ distanceKm: accumulatedKm, elevationM: position[2] });
      previous = position;
    }
  }
  if (!points.length) return null;
  return {
    points,
    minM: Math.min(...points.map((point) => point.elevationM)),
    maxM: Math.max(...points.map((point) => point.elevationM))
  };
}

export function activeVariants(hiking) {
  return (hiking?.variants ?? []).filter((variant) => (variant.lifecycle ?? 'active') !== 'retired');
}

export function defaultHikingVariant(entity) {
  const hiking = entity?.hiking;
  if (!hiking) return null;
  return hiking.variants?.find((variant) => variant.id === hiking.defaultVariantId) ?? (hiking.variants?.length === 1 ? hiking.variants[0] : null);
}

