const EARTH_RADIUS_KM = 6371.0088;
const MAX_MERCATOR_LAT = 85.05112878;

export function geometryPositions(geometry) {
  if (!geometry || !geometry.type) return [];
  const positions = [];
  const visit = (coordinates) => {
    if (!Array.isArray(coordinates)) return;
    if (coordinates.length >= 2 && coordinates.every((item, index) => index < 2 ? typeof item === 'number' : true) && typeof coordinates[0] === 'number') {
      positions.push(coordinates);
      return;
    }
    for (const value of coordinates) visit(value);
  };
  visit(geometry.coordinates);
  return positions;
}

export function geometryBbox(geometry) {
  const positions = geometryPositions(geometry);
  if (!positions.length) return null;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const [longitude, latitude] of positions) {
    west = Math.min(west, longitude);
    south = Math.min(south, latitude);
    east = Math.max(east, longitude);
    north = Math.max(north, latitude);
  }
  return [west, south, east, north];
}

export function geometryCentroid(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Point') return [...geometry.coordinates];
  const positions = geometryPositions(geometry);
  if (!positions.length) return null;
  let x = 0;
  let y = 0;
  let z = 0;
  for (const [longitude, latitude] of positions) {
    const lon = longitude * Math.PI / 180;
    const lat = latitude * Math.PI / 180;
    const cosLat = Math.cos(lat);
    x += cosLat * Math.cos(lon);
    y += cosLat * Math.sin(lon);
    z += Math.sin(lat);
  }
  x /= positions.length;
  y /= positions.length;
  z /= positions.length;
  const lon = Math.atan2(y, x) * 180 / Math.PI;
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp) * 180 / Math.PI;
  return [lon, lat];
}

export function bboxIntersects(a, b) {
  if (!a || !b) return false;
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

export function pointInBbox([longitude, latitude], [west, south, east, north]) {
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
}

function orientation(a, b, c) {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (Math.abs(value) < 1e-12) return 0;
  return value > 0 ? 1 : 2;
}

function onSegment(a, b, c) {
  return b[0] <= Math.max(a[0], c[0]) + 1e-12 && b[0] + 1e-12 >= Math.min(a[0], c[0]) &&
    b[1] <= Math.max(a[1], c[1]) + 1e-12 && b[1] + 1e-12 >= Math.min(a[1], c[1]);
}

function segmentsIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

function segmentIntersectsBbox(a, b, bbox) {
  if (pointInBbox(a, bbox) || pointInBbox(b, bbox)) return true;
  const [west, south, east, north] = bbox;
  const corners = [[west, south], [east, south], [east, north], [west, north]];
  for (let index = 0; index < 4; index += 1) {
    if (segmentsIntersect(a, b, corners[index], corners[(index + 1) % 4])) return true;
  }
  return false;
}

function lineIntersectsBbox(line, bbox) {
  for (let index = 1; index < line.length; index += 1) {
    if (segmentIntersectsBbox(line[index - 1], line[index], bbox)) return true;
  }
  return false;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = (yi > point[1]) !== (yj > point[1]) &&
      point[0] < (xj - xi) * (point[1] - yi) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonIntersectsBbox(rings, bbox) {
  if (!rings?.length) return false;
  if (rings.some((ring) => lineIntersectsBbox(ring, bbox))) return true;
  if (rings[0].some((point) => pointInBbox(point, bbox))) return true;
  const [west, south, east, north] = bbox;
  return [[west, south], [east, south], [east, north], [west, north]].some((point) => pointInRing(point, rings[0]));
}

export function geometryIntersectsBbox(geometry, bbox) {
  if (!geometry || !bboxIntersects(geometryBbox(geometry), bbox)) return false;
  switch (geometry.type) {
    case 'Point': return pointInBbox(geometry.coordinates, bbox);
    case 'MultiPoint': return geometry.coordinates.some((point) => pointInBbox(point, bbox));
    case 'LineString': return lineIntersectsBbox(geometry.coordinates, bbox);
    case 'MultiLineString': return geometry.coordinates.some((line) => lineIntersectsBbox(line, bbox));
    case 'Polygon': return polygonIntersectsBbox(geometry.coordinates, bbox);
    case 'MultiPolygon': return geometry.coordinates.some((polygon) => polygonIntersectsBbox(polygon, bbox));
    default: return false;
  }
}

export function haversineKm(a, b) {
  const toRadians = (value) => value * Math.PI / 180;
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b[0] - a[0]);
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function distancePointToSegmentKm(point, start, end) {
  const referenceLat = point[1] * Math.PI / 180;
  const scaleX = Math.cos(referenceLat) * 111.320;
  const scaleY = 110.574;
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
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function lineDistanceKm(point, line) {
  if (!line.length) return Infinity;
  if (line.length === 1) return haversineKm(point, line[0]);
  let minimum = Infinity;
  for (let index = 1; index < line.length; index += 1) {
    minimum = Math.min(minimum, distancePointToSegmentKm(point, line[index - 1], line[index]));
  }
  return minimum;
}

export function distanceToGeometryKm(point, geometry) {
  switch (geometry?.type) {
    case 'Point': return haversineKm(point, geometry.coordinates);
    case 'MultiPoint': return Math.min(...geometry.coordinates.map((value) => haversineKm(point, value)));
    case 'LineString': return lineDistanceKm(point, geometry.coordinates);
    case 'MultiLineString': return Math.min(...geometry.coordinates.map((line) => lineDistanceKm(point, line)));
    case 'Polygon': return pointInRing(point, geometry.coordinates[0]) ? 0 : lineDistanceKm(point, geometry.coordinates[0]);
    case 'MultiPolygon': return Math.min(...geometry.coordinates.map((polygon) => pointInRing(point, polygon[0]) ? 0 : lineDistanceKm(point, polygon[0])));
    default: return Infinity;
  }
}

export function lonLatToTile(longitude, latitude, zoom) {
  const n = 2 ** zoom;
  const lon = ((longitude + 180) % 360 + 360) % 360 - 180;
  const lat = Math.max(-MAX_MERCATOR_LAT, Math.min(MAX_MERCATOR_LAT, latitude));
  const x = Math.floor((lon + 180) / 360 * n);
  const latRadians = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.asinh(Math.tan(latRadians)) / Math.PI) / 2 * n);
  return [Math.max(0, Math.min(n - 1, x)), Math.max(0, Math.min(n - 1, y))];
}

export function tileToBbox(x, y, zoom) {
  const n = 2 ** zoom;
  const lon = (tileX) => tileX / n * 360 - 180;
  const lat = (tileY) => Math.atan(Math.sinh(Math.PI * (1 - 2 * tileY / n))) * 180 / Math.PI;
  return [lon(x), lat(y + 1), lon(x + 1), lat(y)];
}

function splitAntimeridianBbox(bbox) {
  if (bbox[0] <= bbox[2]) return [bbox];
  return [[bbox[0], bbox[1], 180, bbox[3]], [-180, bbox[1], bbox[2], bbox[3]]];
}

export function tilesForBbox(bbox, zoom, limit = Infinity) {
  const keys = new Map();
  for (const part of splitAntimeridianBbox(bbox)) {
    const [minX, maxY] = lonLatToTile(part[0], part[1], zoom);
    const [maxX, minY] = lonLatToTile(part[2] === 180 ? 179.999999999 : part[2], part[3], zoom);
    for (let x = Math.min(minX, maxX); x <= Math.max(minX, maxX); x += 1) {
      for (let y = Math.min(minY, maxY); y <= Math.max(minY, maxY); y += 1) {
        const key = `${zoom}/${x}/${y}`;
        keys.set(key, { key, z: zoom, x, y, bbox: tileToBbox(x, y, zoom) });
        if (keys.size > limit) return [...keys.values()];
      }
    }
  }
  return [...keys.values()];
}
