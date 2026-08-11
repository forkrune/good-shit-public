function markerCoordinate(document) {
  const centroid = document?.centroid;
  if (!Array.isArray(centroid) || centroid.length < 2) return null;
  const coordinate = [Number(centroid[0]), Number(centroid[1])];
  return coordinate.every(Number.isFinite) ? coordinate : null;
}

export function presentationMarkerForFeature(feature, document) {
  const geometryType = feature?.geometry?.type;
  if (!geometryType || geometryType === 'Point') return null;
  const coordinate = markerCoordinate(document);
  if (!coordinate) return null;
  const entityId = feature.properties?.id;
  const featureId = feature.id ?? entityId;
  return {
    type: 'Feature',
    ...(featureId != null ? { id: `${featureId}:marker` } : {}),
    geometry: { type: 'Point', coordinates: coordinate },
    properties: {
      ...(feature.properties ?? {}),
      presentationMarker: true,
      sourceGeometryType: geometryType
    }
  };
}

export function splitMapPresentationFeatures(features = [], documents = []) {
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const points = [];
  const routes = [];
  const areas = [];

  for (const feature of features) {
    const geometryType = feature?.geometry?.type;
    if (geometryType === 'Point') {
      points.push(feature);
      continue;
    }

    if (geometryType === 'LineString' || geometryType === 'MultiLineString') routes.push(feature);
    else areas.push(feature);

    const marker = presentationMarkerForFeature(feature, documentById.get(feature.properties?.id));
    if (marker) points.push(marker);
  }

  return { points, routes, areas };
}
