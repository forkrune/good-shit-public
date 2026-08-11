import { bboxIntersects, distanceToGeometryKm, geometryIntersectsBbox, tilesForBbox } from './src-core-geo.a34d5b20ddb0.mjs';
import { documentMatchesFilters, querySearchIndex } from './src-core-search.267caf86a4a0.mjs';
import { tierRank } from './src-core-constants.2abfb1694768.mjs';
import { escapeHtml, renderEntityGrid } from './web-client-render.557e22e4f657.mjs';
import { splitMapPresentationFeatures } from './web-map-features.40dcd1075caf.mjs';
import { ensureMapPopupStyles, renderMapPopup } from './web-map-popup.38be3b252437.mjs';
import { MAP_ICON_PIXEL_RATIO, SELECTED_POINT_RADIUS_PX, pointCircleRadiusExpression, pointIconSizeExpression } from './web-map-marker-style.25956cb32495.mjs';
import { personalStateService } from './web-storage.50d07a5c3bbd.mjs';
import { hydratePersonalState, showToast } from './web-app.cad986d21761.mjs';

const configNode = document.querySelector('#page-config');
const config = configNode ? JSON.parse(configNode.textContent) : {};
const resultsElement = document.querySelector('#map-results');
const countElement = document.querySelector('#map-result-count');
const statusElement = document.querySelector('#map-status');
const fallbackElement = document.querySelector('#map-fallback');
const mapElement = document.querySelector('#map');
const filterForm = document.querySelector('#map-filter-form');
const queryInput = document.querySelector('#map-query');
const locationForm = document.querySelector('#map-location-form');
const locationInput = document.querySelector('#map-location-query');
const geocoderDialog = document.querySelector('#geocoder-dialog');
const geocoderResults = document.querySelector('#geocoder-results');
const sidebar = document.querySelector('.map-sidebar');
const mapShell = document.querySelector('.map-shell');
const sidebarHead = document.querySelector('.map-sidebar-head');
const filterStrip = document.querySelector('.map-filter-strip');
const toggleMapListButton = document.querySelector('#toggle-map-list');

let map = null;
let maplibregl = null;
let mapResizeObserver = null;
let popup = null;
let userMarker = null;
let mapReady = false;
let mapManifestPromise = null;
let searchManifestPromise = null;
let globalIndexPromise = null;
let overviewPromise = null;
const shardPromises = new Map();
let queryIds = null;
let selectedId = new URLSearchParams(location.search).get('entity');
let nearMe = null;
let refreshGeneration = 0;
let moveTimer = null;
let queryTimer = null;
let currentDocuments = [];
let currentFeatureById = new Map();

function fetchJson(url, options = {}) {
  return fetch(url, { ...options, headers: { Accept: 'application/json', ...(options.headers ?? {}) } }).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
    return response.json();
  });
}

function withTimeout(promise, milliseconds, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} did not load within ${Math.round(milliseconds / 1000)} seconds.`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function loadMapLibrary() {
  return withTimeout(import(config.map.libraryModuleUrl), 10_000, 'MapLibre renderer');
}

function supportsWebGl2() {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function hasUsableMapSize() {
  const rect = mapElement.getBoundingClientRect();
  return rect.width >= 32 && rect.height >= 32;
}

function waitForUsableMapSize(timeoutMs = 5000) {
  if (hasUsableMapSize()) return Promise.resolve();
  return withTimeout(new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (!hasUsableMapSize()) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(mapElement);
  }), timeoutMs, 'Map container layout');
}

function observeMapSize() {
  mapResizeObserver?.disconnect();
  mapResizeObserver = new ResizeObserver(() => {
    if (!hasUsableMapSize() || !map) return;
    requestAnimationFrame(() => map?.resize());
  });
  mapResizeObserver.observe(mapElement);
}

function fitOverviewDocuments(documents) {
  if (!map || !documents?.length) return;
  const boxes = documents.map((document) => document.bbox).filter((bbox) => Array.isArray(bbox) && bbox.length === 4);
  if (!boxes.length) return;
  const west = Math.min(...boxes.map((bbox) => bbox[0]));
  const south = Math.min(...boxes.map((bbox) => bbox[1]));
  const east = Math.max(...boxes.map((bbox) => bbox[2]));
  const north = Math.max(...boxes.map((bbox) => bbox[3]));
  if (![west, south, east, north].every(Number.isFinite)) return;
  if (east - west > 300) {
    map.jumpTo({ center: [0, 20], zoom: 1.5 });
    return;
  }
  map.fitBounds([[west, south], [east, north]], {
    padding: { top: 80, right: 80, bottom: 80, left: 80 },
    maxZoom: 4,
    duration: 0
  });
}

function applyResponsiveMapLayout() {
  const desktop = matchMedia('(min-width: 721px)').matches;
  const collapsed = sidebar?.classList.contains('is-collapsed') ?? false;
  const headDetails = sidebarHead ? [...sidebarHead.children].filter((element) => element !== toggleMapListButton) : [];
  const collapsible = [...headDetails, filterStrip, resultsElement].filter(Boolean);

  if (!desktop) {
    if (mapShell) mapShell.style.gridTemplateColumns = '';
    for (const element of collapsible) element.hidden = false;
    if (sidebarHead) {
      sidebarHead.style.display = '';
      sidebarHead.style.padding = '';
      sidebarHead.style.justifyItems = '';
    }
    if (toggleMapListButton) {
      toggleMapListButton.style.writingMode = '';
      toggleMapListButton.style.transform = '';
      toggleMapListButton.style.width = '';
      toggleMapListButton.style.padding = '';
    }
    if (filterStrip) {
      filterStrip.style.flexWrap = '';
      filterStrip.style.overflowX = '';
      filterStrip.style.overflowY = '';
      filterStrip.style.maxHeight = '';
    }
    requestAnimationFrame(() => map?.resize());
    return;
  }

  if (mapShell) mapShell.style.gridTemplateColumns = collapsed ? '64px minmax(0, 1fr)' : '';
  for (const element of collapsible) element.hidden = collapsed;
  if (sidebarHead) {
    sidebarHead.style.display = collapsed ? 'grid' : '';
    sidebarHead.style.padding = collapsed ? '8px' : '';
    sidebarHead.style.justifyItems = collapsed ? 'center' : '';
  }
  if (toggleMapListButton) {
    toggleMapListButton.style.writingMode = collapsed ? 'vertical-rl' : '';
    toggleMapListButton.style.transform = collapsed ? 'rotate(180deg)' : '';
    toggleMapListButton.style.width = collapsed ? '48px' : '';
    toggleMapListButton.style.padding = collapsed ? '10px 4px' : '';
  }
  if (filterStrip && !collapsed) {
    filterStrip.style.flexWrap = 'wrap';
    filterStrip.style.overflowX = 'hidden';
    filterStrip.style.overflowY = 'auto';
    filterStrip.style.maxHeight = '132px';
  }
  requestAnimationFrame(() => map?.resize());
}

function loadMapManifest() {
  mapManifestPromise ??= fetchJson(config.mapManifestUrl);
  return mapManifestPromise;
}

function loadSearchManifest() {
  searchManifestPromise ??= fetchJson(config.searchManifestUrl);
  return searchManifestPromise;
}

async function loadGlobalIndex() {
  const searchManifest = await loadSearchManifest();
  globalIndexPromise ??= fetchJson(searchManifest.global.url);
  return globalIndexPromise;
}

async function loadOverview() {
  const manifest = await loadMapManifest();
  overviewPromise ??= fetchJson(manifest.overview.url);
  return overviewPromise;
}

async function loadShard(key) {
  const manifest = await loadMapManifest();
  const descriptor = manifest.shards[key];
  if (!descriptor) return null;
  if (!shardPromises.has(key)) shardPromises.set(key, fetchJson(descriptor.url));
  return shardPromises.get(key);
}

function normalizeLongitude(value) {
  let longitude = Number(value);
  while (longitude > 180) longitude -= 360;
  while (longitude < -180) longitude += 360;
  return longitude;
}

function viewportBbox() {
  if (!map) return [-180, -85, 180, 85];
  const bounds = map.getBounds();
  let west = Number(bounds.getWest());
  let east = Number(bounds.getEast());
  const south = Math.max(-85, Number(bounds.getSouth()));
  const north = Math.min(85, Number(bounds.getNorth()));
  if (east - west >= 359.5) return [-180, south, 180, north];
  west = normalizeLongitude(west);
  east = normalizeLongitude(east);
  return [west, south, east, north];
}

function readFilters() {
  return {
    query: queryInput.value.trim(),
    category: filterForm.elements.category?.value || null,
    entityType: filterForm.elements.entityType?.value || null,
    tiers: [...filterForm.querySelectorAll('[name="map-tier"]:checked')].map((input) => input.value),
    favourite: Boolean(filterForm.elements.favourite?.checked),
    visited: Boolean(filterForm.elements.visited?.checked),
    unvisited: Boolean(filterForm.elements.unvisited?.checked),
    minimumPersonalRating: Number(filterForm.elements.minimumPersonalRating?.value || 0) || null
  };
}

function featureCollection(features = []) {
  return { type: 'FeatureCollection', features };
}

function layerColorExpression() {
  return ['match', ['get', 'tier'],
    'S', '#a03e00',
    'A', '#8a6200',
    'B', '#006b57',
    'C', '#325ca8',
    '#5b32a3'
  ];
}

function iconImageExpression() {
  const iconTypes = Object.keys(config.mapIcons ?? {}).filter((type) => type !== 'default').sort();
  return ['match', ['get', 'iconKey'],
    ...iconTypes.flatMap((type) => [type, `map-icon-${type}`]),
    'map-icon-default'
  ];
}

async function loadMapIcons() {
  const entries = Object.entries(config.mapIcons ?? {});
  if (!entries.length || !entries.some(([type]) => type === 'default')) throw new Error('Map icon configuration is incomplete.');
  await Promise.all(entries.map(async ([type, url]) => {
    const id = `map-icon-${type}`;
    if (map.hasImage(id)) return;
    const image = await map.loadImage(url);
    map.addImage(id, image.data, { pixelRatio: MAP_ICON_PIXEL_RATIO });
  }));
}

async function installSourcesAndLayers() {
  if (!map || map.getSource('curated-points')) return;
  await loadMapIcons();
  map.addSource('curated-points', {
    type: 'geojson',
    data: featureCollection(),
    cluster: true,
    clusterMaxZoom: 13,
    clusterRadius: 46
  });
  map.addLayer({
    id: 'curated-clusters',
    type: 'circle',
    source: 'curated-points',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#5b32a3',
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 40, 31],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
      'circle-opacity': 0.94
    }
  });
  map.addLayer({
    id: 'curated-cluster-count',
    type: 'symbol',
    source: 'curated-points',
    filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 },
    paint: { 'text-color': '#ffffff' }
  });
  map.addLayer({
    id: 'curated-points-layer',
    type: 'circle',
    source: 'curated-points',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': layerColorExpression(),
      'circle-radius': pointCircleRadiusExpression(),
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 4
    }
  });
  map.addLayer({
    id: 'curated-selected-point',
    type: 'circle',
    source: 'curated-points',
    filter: ['==', ['get', 'id'], '__none__'],
    paint: {
      'circle-color': layerColorExpression(),
      'circle-radius': SELECTED_POINT_RADIUS_PX,
      'circle-stroke-color': '#5b32a3',
      'circle-stroke-width': 6
    }
  });
  map.addLayer({
    id: 'curated-point-icons',
    type: 'symbol',
    source: 'curated-points',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': iconImageExpression(),
      'icon-size': pointIconSizeExpression(selectedId),
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    },
    paint: { 'icon-opacity': 0.98 }
  });

  map.addSource('curated-routes', { type: 'geojson', data: featureCollection() });
  map.addLayer({
    id: 'curated-routes-layer',
    type: 'line',
    source: 'curated-routes',
    paint: {
      'line-color': layerColorExpression(),
      'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3, 12, 7],
      'line-opacity': 0.92
    }
  });
  map.addLayer({
    id: 'curated-selected-route',
    type: 'line',
    source: 'curated-routes',
    filter: ['==', ['get', 'id'], '__none__'],
    paint: { 'line-color': '#5b32a3', 'line-width': 11, 'line-opacity': 0.82 }
  });

  map.addSource('curated-areas', { type: 'geojson', data: featureCollection() });
  map.addLayer({
    id: 'curated-areas-fill',
    type: 'fill',
    source: 'curated-areas',
    paint: { 'fill-color': layerColorExpression(), 'fill-opacity': 0.22 }
  });
  map.addLayer({
    id: 'curated-areas-line',
    type: 'line',
    source: 'curated-areas',
    paint: { 'line-color': layerColorExpression(), 'line-width': 4 }
  });
  map.addLayer({
    id: 'curated-selected-area',
    type: 'line',
    source: 'curated-areas',
    filter: ['==', ['get', 'id'], '__none__'],
    paint: { 'line-color': '#5b32a3', 'line-width': 8 }
  });

  map.on('click', 'curated-clusters', async (event) => {
    const feature = map.queryRenderedFeatures(event.point, { layers: ['curated-clusters'] })[0];
    if (!feature) return;
    const source = map.getSource('curated-points');
    const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
    map.easeTo({ center: feature.geometry.coordinates, zoom });
  });
  for (const layer of ['curated-points-layer', 'curated-routes-layer', 'curated-areas-fill']) {
    map.on('click', layer, (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (id) selectEntity(id, event.lngLat);
    });
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
  }
  map.on('mouseenter', 'curated-clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'curated-clusters', () => { map.getCanvas().style.cursor = ''; });
  mapReady = true;
}

function setMapData(features, documents) {
  if (!mapReady) return;
  const { points, routes, areas } = splitMapPresentationFeatures(features, documents);
  map.getSource('curated-points')?.setData(featureCollection(points));
  map.getSource('curated-routes')?.setData(featureCollection(routes));
  map.getSource('curated-areas')?.setData(featureCollection(areas));
  updateSelectionLayers();
}

function updateSelectionLayers() {
  if (!mapReady) return;
  const filter = ['==', ['get', 'id'], selectedId ?? '__none__'];
  for (const layer of ['curated-selected-point', 'curated-selected-route', 'curated-selected-area']) {
    if (map.getLayer(layer)) map.setFilter(layer, filter);
  }
  if (map.getLayer('curated-point-icons')) {
    map.setLayoutProperty('curated-point-icons', 'icon-size', pointIconSizeExpression(selectedId));
  }
}

function setStatus(message) {
  if (statusElement) statusElement.textContent = message;
}

async function packageForViewport(bbox) {
  const manifest = await loadMapManifest();
  const zoom = map?.getZoom?.() ?? 0;
  if (!map || zoom < manifest.detailZoomThreshold) {
    return { packages: [await loadOverview()], overview: true, requested: 1 };
  }
  const tiles = tilesForBbox(bbox, manifest.shardZoom, manifest.maxViewportShards + 1);
  if (tiles.length > manifest.maxViewportShards) {
    return { packages: [await loadOverview()], overview: true, requested: tiles.length };
  }
  const keys = tiles.map((tile) => `${tile.z}/${tile.x}/${tile.y}`).filter((key) => manifest.shards[key]);
  const packages = (await Promise.all(keys.map(loadShard))).filter(Boolean);
  return { packages, overview: false, requested: keys.length };
}

async function refreshViewport() {
  const currentGeneration = ++refreshGeneration;
  const bbox = viewportBbox();
  const filters = readFilters();
  setStatus('Finding curated places in this view…');
  resultsElement?.setAttribute('aria-busy', 'true');
  try {
    const [{ packages, overview, requested }, records] = await Promise.all([packageForViewport(bbox), personalStateService.getAll()]);
    if (currentGeneration !== refreshGeneration) return;
    const personalById = new Map(records.map((record) => [record.entityId, record]));
    const documentById = new Map();
    const featureById = new Map();
    for (const pkg of packages) {
      for (const document of pkg.documents ?? []) documentById.set(document.id, document);
      for (const feature of pkg.featureCollection?.features ?? []) featureById.set(feature.properties.id, feature);
    }

    let documents = [...documentById.values()].filter((document) => {
      if (queryIds && !queryIds.has(document.id)) return false;
      if (!bboxIntersects(document.bbox, bbox)) return false;
      const feature = featureById.get(document.id);
      if (!overview && feature && !geometryIntersectsBbox(feature.geometry, bbox)) return false;
      if (!documentMatchesFilters(document, filters, personalById.get(document.id))) return false;
      if (nearMe) {
        const geometry = feature?.geometry ?? { type: 'Point', coordinates: document.centroid };
        if (distanceToGeometryKm(nearMe.coordinates, geometry) > nearMe.radiusKm) return false;
      }
      return true;
    });
    documents.sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name));
    currentDocuments = documents;
    currentFeatureById = featureById;

    const visibleIds = new Set(documents.map((document) => document.id));
    const features = [...featureById.values()].filter((feature) => visibleIds.has(feature.properties.id));
    setMapData(features, documents);
    renderList();
    const densityNote = overview ? 'overview data' : `${requested} geographic shard${requested === 1 ? '' : 's'}`;
    setStatus(`${documents.length} curated result${documents.length === 1 ? '' : 's'} in view · ${densityNote}`);
  } catch (error) {
    console.error(error);
    setStatus('Map data could not be loaded.');
    resultsElement.innerHTML = renderEntityGrid([], {
      basePath: config.basePath,
      emptyTitle: 'Map discovery is temporarily unavailable.',
      emptyText: 'Country, category and global search pages still work without the map.'
    });
    showToast(error.message ?? 'Map data failed to load.', { error: true, duration: 6000 });
  } finally {
    if (currentGeneration === refreshGeneration) resultsElement?.removeAttribute('aria-busy');
  }
}

function renderList() {
  const rendered = currentDocuments.slice(0, 120);
  resultsElement.innerHTML = renderEntityGrid(rendered, {
    basePath: config.basePath,
    selectedId,
    emptyTitle: 'No curated places in this view.',
    emptyText: 'This means no currently published place is known to clear the catalogue bar here—not that the area contains nothing.'
  });
  countElement.textContent = `${currentDocuments.length.toLocaleString()} result${currentDocuments.length === 1 ? '' : 's'}`;
  void hydratePersonalState(resultsElement);
}

function popupHtml(document) {
  return renderMapPopup(document, { basePath: config.basePath });
}

function selectEntity(id, lngLat = null) {
  selectedId = id;
  updateSelectionLayers();
  renderList();
  const document = currentDocuments.find((entry) => entry.id === id);
  const feature = currentFeatureById.get(id);
  if (map && document) {
    popup?.remove();
    const anchor = lngLat ?? { lng: document.centroid[0], lat: document.centroid[1] };
    popup = new maplibregl.Popup({ offset: 18, closeButton: true, maxWidth: '392px', className: 'good-shit-map-popup' })
      .setLngLat(anchor)
      .setHTML(popupHtml(document))
      .addTo(map);
  }
  requestAnimationFrame(() => resultsElement.querySelector(`[data-entity-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
}

async function updateQueryIds() {
  const query = queryInput.value.trim();
  if (!query) {
    queryIds = null;
    await refreshViewport();
    return;
  }
  try {
    setStatus('Searching catalogue terms…');
    const index = await loadGlobalIndex();
    queryIds = new Set(querySearchIndex(index, query, { limit: 2500 }).map((item) => item.id));
    await refreshViewport();
  } catch (error) {
    console.error(error);
    showToast('Catalogue search index could not be loaded.', { error: true });
  }
}

function scheduleViewportRefresh(delay = 180) {
  clearTimeout(moveTimer);
  moveTimer = setTimeout(() => void refreshViewport(), delay);
}

async function showMapFallback(error) {
  console.error(error);
  try {
    map?.remove();
  } catch (removeError) {
    console.warn('Could not dispose failed map instance:', removeError);
  }
  map = null;
  mapReady = false;
  fallbackElement.hidden = false;
  fallbackElement.querySelector('[data-map-error]').textContent = error?.message ?? 'The interactive map could not be loaded.';
  const overview = await loadOverview().catch(() => ({ documents: [], featureCollection: featureCollection() }));
  currentDocuments = overview.documents ?? [];
  currentFeatureById = new Map((overview.featureCollection?.features ?? []).map((feature) => [feature.properties.id, feature]));
  renderList();
  applyResponsiveMapLayout();
  setStatus('Interactive map unavailable; showing the accessible catalogue list.');
}

async function initialiseMap() {
  try {
    ensureMapPopupStyles();
    if (!supportsWebGl2()) throw new Error('This browser cannot provide WebGL 2, which MapLibre 6 requires.');
    setStatus('Preparing map layout…');
    const [libraryModule, manifest, overview] = await Promise.all([
      loadMapLibrary(),
      withTimeout(loadMapManifest(), 10_000, 'Geographic index'),
      withTimeout(loadOverview(), 10_000, 'Catalogue overview')
    ]);
    currentDocuments = overview.documents ?? [];
    currentFeatureById = new Map((overview.featureCollection?.features ?? []).map((feature) => [feature.properties.id, feature]));
    renderList();
    applyResponsiveMapLayout();
    await waitForUsableMapSize();

    maplibregl = libraryModule.default ?? libraryModule;
    map = new maplibregl.Map({
      container: mapElement,
      style: config.map.styleUrl,
      center: [0, 20],
      zoom: 1.5,
      minZoom: 1.25,
      maxZoom: 18,
      cooperativeGestures: false,
      attributionControl: true
    });
    observeMapSize();
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');
    map.on('moveend', () => scheduleViewportRefresh());
    map.on('error', (event) => {
      if (event?.error) console.warn('MapLibre:', event.error.message);
    });

    await withTimeout(new Promise((resolve, reject) => {
      map.once('load', async () => {
        try {
          await installSourcesAndLayers();
          if (selectedId && manifest.entityIndex[selectedId]) {
            const target = manifest.entityIndex[selectedId];
            const [west, south, east, north] = target.bbox;
            if (target.geometryType === 'Point') map.jumpTo({ center: target.centroid, zoom: 13 });
            else map.fitBounds([[west, south], [east, north]], { padding: 80, maxZoom: 13, duration: 0 });
          } else {
            fitOverviewDocuments(overview.documents ?? []);
          }
          await refreshViewport();
          if (selectedId) selectEntity(selectedId);
          fallbackElement.hidden = true;
          map.resize();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }), 15_000, 'Interactive map');
  } catch (error) {
    await showMapFallback(error);
  }
}

async function locateUser() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by this browser.', { error: true });
    return;
  }
  const button = document.querySelector('#near-me');
  button.disabled = true;
  setStatus('Requesting your location…');
  navigator.geolocation.getCurrentPosition(async (position) => {
    const coordinates = [position.coords.longitude, position.coords.latitude];
    nearMe = { coordinates, radiusKm: Number(filterForm.elements.radius?.value || 10) };
    button.setAttribute('aria-pressed', 'true');
    const label = button.querySelector('[data-button-label]');
    if (label) label.textContent = 'Near me active';
    document.querySelector('#clear-near-me').hidden = false;
    if (map) {
      map.flyTo({ center: coordinates, zoom: 12.5, essential: true });
      userMarker?.remove();
      userMarker = new maplibregl.Marker({ color: '#5b32a3' }).setLngLat(coordinates).addTo(map);
    }
    button.disabled = false;
    await refreshViewport();
  }, (error) => {
    button.disabled = false;
    const message = error.code === error.PERMISSION_DENIED
      ? 'Location permission was denied. You can still search or move the map anywhere.'
      : 'Your location could not be determined. You can still search or move the map anywhere.';
    setStatus(message);
    showToast(message, { error: true, duration: 6000 });
  }, { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 });
}

async function geocodeLocation(query) {
  const endpoint = new URL(config.geocoding.endpoint);
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('format', 'jsonv2');
  endpoint.searchParams.set('limit', '5');
  endpoint.searchParams.set('addressdetails', '0');
  endpoint.searchParams.set('accept-language', navigator.language || 'en');
  return fetchJson(endpoint.toString());
}

locationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = locationInput.value.trim();
  if (!query) return;
  const submit = locationForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const matches = await geocodeLocation(query);
    geocoderResults.innerHTML = matches.length
      ? matches.map((match, index) => `<button type="button" class="outlined-button" data-geocoder-index="${index}">${escapeHtml(match.display_name)}</button>`).join('')
      : '<p>No OpenStreetMap location match was found.</p>';
    geocoderDialog.dataset.results = JSON.stringify(matches);
    geocoderDialog.showModal();
  } catch (error) {
    console.error(error);
    showToast('Location search failed. Pan or zoom the map manually instead.', { error: true });
  } finally {
    submit.disabled = false;
  }
});

geocoderResults.addEventListener('click', (event) => {
  const button = event.target.closest('[data-geocoder-index]');
  if (!button || !map) return;
  const matches = JSON.parse(geocoderDialog.dataset.results || '[]');
  const match = matches[Number(button.dataset.geocoderIndex)];
  if (!match) return;
  const [south, north, west, east] = match.boundingbox.map(Number);
  map.fitBounds([[west, south], [east, north]], { padding: 70, maxZoom: 14 });
  geocoderDialog.close();
});

document.querySelector('#close-geocoder')?.addEventListener('click', () => geocoderDialog.close());
document.querySelector('#near-me')?.addEventListener('click', () => void locateUser());
document.querySelector('#clear-near-me')?.addEventListener('click', () => {
  nearMe = null;
  userMarker?.remove();
  userMarker = null;
  const button = document.querySelector('#near-me');
  button.setAttribute('aria-pressed', 'false');
  const label = button.querySelector('[data-button-label]');
  if (label) label.textContent = 'Near me';
  document.querySelector('#clear-near-me').hidden = true;
  void refreshViewport();
});
toggleMapListButton?.addEventListener('click', (event) => {
  const collapsed = sidebar.classList.toggle('is-collapsed');
  event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  const label = event.currentTarget.querySelector('[data-button-label]');
  if (label) label.textContent = collapsed ? 'Show findings' : 'Hide findings';
  applyResponsiveMapLayout();
});
window.addEventListener('resize', applyResponsiveMapLayout, { passive: true });

filterForm.addEventListener('change', () => {
  if (nearMe) nearMe.radiusKm = Number(filterForm.elements.radius?.value || 10);
  void refreshViewport();
});
queryInput.addEventListener('input', () => {
  clearTimeout(queryTimer);
  queryTimer = setTimeout(() => void updateQueryIds(), 180);
});
resultsElement.addEventListener('click', (event) => {
  const mapLink = event.target.closest('[data-map-select]');
  if (!mapLink) return;
  event.preventDefault();
  selectEntity(mapLink.dataset.mapSelect);
});
window.addEventListener('good-shit:personal-state-change', () => {
  const filters = readFilters();
  if (filters.favourite || filters.visited || filters.unvisited || filters.minimumPersonalRating) void refreshViewport();
});

void initialiseMap();
