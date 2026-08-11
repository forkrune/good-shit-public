const configNode = document.querySelector('#hiking-page-config');
const config = configNode ? JSON.parse(configNode.textContent) : null;
const planner = document.querySelector('[data-hike-planner]');
const mapElement = document.querySelector('#hike-detail-map');
const metricsElement = document.querySelector('[data-hike-metrics]');
const actionsElement = document.querySelector('[data-hike-actions]');
const elevationElement = document.querySelector('#hike-elevation');
const buttons = [...document.querySelectorAll('[data-hike-variant]')];
const cache = new Map();
let map = null;
let maplibregl = null;
let mapReady = false;
let selectedId = config?.defaultVariantId ?? null;
let selectedRoute = null;
let popup = null;
let profileMarker = null;
let profilePoints = [];
let profileKeyboardIndex = 0;

function esc(value) { return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
function title(value) { return String(value ?? '').replaceAll('-',' ').replace(/\b\w/g, (c) => c.toUpperCase()); }
function duration(minutes) { const h=Math.floor(Number(minutes)/60); const m=Number(minutes)%60; return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`; }
function distance(value) { const n=Number(value); return `${n.toFixed(n < 10 ? 1 : 0)} km`; }
function variant(id) { return config.variants.find((item) => item.id === id); }
function collection(features=[]) { return {type:'FeatureCollection',features}; }

async function route(id) {
  if (!cache.has(id)) {
    const item=variant(id);
    cache.set(id, fetch(item.routeUrl,{headers:{Accept:'application/json'}}).then((response)=>{if(!response.ok) throw new Error(`Could not load route data (${response.status}).`); return response.json();}));
  }
  return cache.get(id);
}

function latestObservation(condition) {
  return [...(condition.history ?? [])].sort((a,b)=>Date.parse(a.lastVerifiedAt??a.reportedAt)-Date.parse(b.lastVerifiedAt??b.reportedAt)).at(-1) ?? condition.latestObservation ?? null;
}

function runtimeCondition(condition, freshnessDays) {
  const observation=latestObservation(condition);
  if(!observation)return {...condition,state:'history',freshness:'unknown',latestObservation:null,ageDays:null};
  const now=Date.now(); const verified=Date.parse(observation.lastVerifiedAt??observation.reportedAt); const ageDays=Number.isFinite(verified)?(now-verified)/86400000:Infinity;
  if(observation.status==='resolved'||(observation.resolvedAt&&Date.parse(observation.resolvedAt)<=now))return {...condition,state:'history',freshness:'resolved',latestObservation:observation,ageDays};
  if(observation.expectedEndAt&&Date.parse(observation.expectedEndAt)<now&&verified<=Date.parse(observation.expectedEndAt))return {...condition,state:'history',freshness:'expired',latestObservation:observation,ageDays};
  if(observation.status==='unknown')return {...condition,state:'current',freshness:'stale',latestObservation:observation,ageDays};
  const threshold=Number(freshnessDays?.[observation.severity]??30);
  return {...condition,state:'current',freshness:ageDays<=threshold?'verified':'stale',latestObservation:observation,ageDays};
}

function runtimeRouteData(data) {
  return {...data,conditions:(data.conditions??[]).map((condition)=>runtimeCondition(condition,data.conditionFreshnessDays))};
}

function renderMetrics(item,data) {
  const values=[['Distance',distance(item.distanceKm)],['Ascent',`↑ ${item.ascentM} m`],['Descent',`↓ ${item.descentM} m`],['Time',duration(item.durationMinutes)],['Difficulty',title(item.difficulty)],['Route',title(item.routeType)]];
  metricsElement.innerHTML=`<div class="hike-metric-grid">${values.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>${item.surface?.length?`<p><strong>Surface:</strong> ${esc(item.surface.join(', '))}</p>`:''}${item.terrain?.length?`<p><strong>Terrain:</strong> ${esc(item.terrain.join(', '))}</p>`:''}${item.seasonality?.length?`<p><strong>Season:</strong> ${esc(item.seasonality.map(title).join(', '))}</p>`:''}${item.accessNotes?`<p><strong>Access:</strong> ${esc(item.accessNotes)}</p>`:''}`;
  const current=(data.conditions??[]).filter((condition)=>condition.state==='current');
  if(current.length) metricsElement.insertAdjacentHTML('beforeend',`<p><strong>${current.length} current route condition${current.length===1?'':'s'}:</strong> ${esc(current.map((condition)=>title(condition.type)).join(', '))}</p>`);
}

function renderActions(item) {
  const links=[];
  if(item.gpxUrl) links.push(`<a class="filled-button" href="${esc(item.gpxUrl)}" download>Download GPX</a>`);
  for(const link of item.links??[]) links.push(`<a class="tonal-button" href="${esc(link.url)}" rel="external noreferrer">${esc(link.label)} ↗</a>`);
  actionsElement.innerHTML=`<div class="button-row">${links.join('')}</div>`;
}

function conditionHtml(condition) {
  const observation=condition.latestObservation;
  if(!observation)return '';
  const freshness=condition.freshness==='stale'?'Recheck recommended':condition.freshness==='verified'?'Currently verified':title(condition.freshness);
  const source=observation.source;
  return `<article class="hike-condition hike-condition-${esc(observation.severity)}" data-runtime-condition-id="${esc(condition.id)}"><div><strong>${esc(title(condition.type))}</strong><span>${esc(observation.severity)} · ${esc(freshness)}</span></div><p>${esc(observation.description)}</p><small>Last verified ${esc(observation.lastVerifiedAt.slice(0,10))}${source?` · ${source.url?`<a href="${esc(source.url)}" rel="external noreferrer">${esc(source.label)}</a>`:esc(source.label)}`:''}${condition.routePlacement?` · ${condition.routePlacement.distanceAlongKm.toFixed(1)} km along route`:''}</small></article>`;
}

function renderRuntimeConditions(data) {
  planner.querySelectorAll('.hike-condition-banner,.hike-conditions,.hike-condition-history').forEach((element)=>{element.hidden=true;});
  let host=planner.querySelector('[data-runtime-conditions]');
  if(!host){host=document.createElement('section');host.className='hike-runtime-conditions';host.dataset.runtimeConditions='';planner.querySelector('.hike-selected-summary')?.after(host);}
  const current=(data.conditions??[]).filter((condition)=>condition.state==='current');
  const history=(data.conditions??[]).filter((condition)=>condition.state!=='current');
  const important=current.filter((condition)=>['high','critical'].includes(condition.latestObservation?.severity));
  host.innerHTML=`${important.length?`<div class="hike-condition-banner" role="alert"><h3>Important condition${important.length===1?'':'s'} for this variant</h3>${important.map(conditionHtml).join('')}</div>`:''}<div class="hike-conditions"><h3>Current conditions for selected variant</h3>${current.length?current.map(conditionHtml).join(''):'<p class="muted">No current route-condition observations are published for this variant.</p>'}</div>${history.length?`<details class="hike-condition-history"><summary>Resolved / expired condition history</summary><ul>${history.map((condition)=>`<li><strong>${esc(title(condition.type))}</strong> — ${esc(condition.latestObservation?.description??'')} <small>${esc(condition.freshness)}</small></li>`).join('')}</ul></details>`:''}`;
  host.querySelectorAll('[data-runtime-condition-id]').forEach((element)=>element.addEventListener('click',()=>{
    const condition=(data.conditions??[]).find((candidate)=>candidate.id===element.dataset.runtimeConditionId);
    if(condition?.geometry&&map){const coordinates=condition.geometry.type==='Point'?condition.geometry.coordinates:condition.routePlacement?.snappedCoordinate;if(coordinates)map.easeTo({center:coordinates,zoom:Math.max(map.getZoom(),13)});}
  }));
}

function haversineKm(a,b){const r=6371.0088,toRad=(v)=>v*Math.PI/180;const dLat=toRad(b[1]-a[1]),dLon=toRad(b[0]-a[0]),lat1=toRad(a[1]),lat2=toRad(b[1]);const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*r*Math.asin(Math.min(1,Math.sqrt(h)));}
function elevationPoints(geometry){const lines=geometry?.type==='LineString'?[geometry.coordinates]:geometry?.type==='MultiLineString'?geometry.coordinates:[];const points=[];let accumulated=0;for(const line of lines){let previous=null;for(const coordinate of line){if(previous)accumulated+=haversineKm(previous,coordinate);if(Number.isFinite(coordinate[2]))points.push({distanceKm:accumulated,elevationM:coordinate[2],coordinate});previous=coordinate;}}return points;}
function clearProfileMarker(){profileMarker?.remove();profileMarker=null;}
function showProfilePoint(point){if(!map||!maplibregl||!point?.coordinate)return;clearProfileMarker();profileMarker=new maplibregl.Marker().setLngLat(point.coordinate).addTo(map);const status=elevationElement.querySelector('[data-profile-status]');if(status)status.textContent=`${point.distanceKm.toFixed(1)} km · ${Math.round(point.elevationM)} m`;}

function renderElevation(data) {
  profilePoints=elevationPoints(data.geometry);profileKeyboardIndex=0;clearProfileMarker();
  const profile=data.elevation;
  if(!profile?.points?.length||!profilePoints.length){elevationElement.innerHTML='<p class="muted">No elevation samples are available for this route variant.</p>';return;}
  const width=760,height=190,pad={left:44,right:18,top:18,bottom:32};
  const maxDistance=Math.max(...profilePoints.map((p)=>p.distanceKm),.001); const span=Math.max(1,profile.maxM-profile.minM);
  const x=(p)=>pad.left+p.distanceKm/maxDistance*(width-pad.left-pad.right); const y=(p)=>pad.top+(profile.maxM-p.elevationM)/span*(height-pad.top-pad.bottom);
  const d=profilePoints.map((p,i)=>`${i?'L':'M'} ${x(p).toFixed(1)} ${y(p).toFixed(1)}`).join(' ');
  const advisory=data.advisoryElevation;
  elevationElement.innerHTML=`<div class="hike-profile-heading"><h3>Elevation profile</h3><span>${Math.round(profile.minM)}–${Math.round(profile.maxM)} m</span></div><svg class="hike-profile" viewBox="0 0 ${width} ${height}" role="img" tabindex="0" aria-label="Elevation profile. Move the pointer or use left and right arrow keys to inspect positions on the map."><line x1="${pad.left}" y1="${height-pad.bottom}" x2="${width-pad.right}" y2="${height-pad.bottom}"/><path d="${d}"/><text x="${pad.left}" y="${height-8}">0 km</text><text x="${width-pad.right}" y="${height-8}" text-anchor="end">${maxDistance.toFixed(1)} km</text></svg><small data-profile-status>Move across the profile to inspect the route.</small>${advisory?`<p class="muted"><strong>Smoothed elevation estimate:</strong> ↑${advisory.ascentM} m · ↓${advisory.descentM} m. Advisory only; the researched totals above remain authoritative.</p>`:''}`;
  const svg=elevationElement.querySelector('.hike-profile');
  const nearest=(distanceKm)=>profilePoints.reduce((best,point)=>Math.abs(point.distanceKm-distanceKm)<Math.abs(best.distanceKm-distanceKm)?point:best,profilePoints[0]);
  svg.addEventListener('pointermove',(event)=>{const rect=svg.getBoundingClientRect();const ratio=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));showProfilePoint(nearest(ratio*maxDistance));});
  svg.addEventListener('pointerleave',()=>{if(document.activeElement!==svg)clearProfileMarker();});
  svg.addEventListener('focus',()=>showProfilePoint(profilePoints[profileKeyboardIndex]));
  svg.addEventListener('blur',clearProfileMarker);
  svg.addEventListener('keydown',(event)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();if(event.key==='Home')profileKeyboardIndex=0;else if(event.key==='End')profileKeyboardIndex=profilePoints.length-1;else profileKeyboardIndex=Math.max(0,Math.min(profilePoints.length-1,profileKeyboardIndex+(event.key==='ArrowRight'?1:-1)));showProfilePoint(profilePoints[profileKeyboardIndex]);});
}

function popupFor(feature,lngLat){
  if(!feature||!map||!maplibregl)return;
  const name=feature.properties?.name??title(feature.properties?.type); const description=feature.properties?.description??'';
  popup?.remove(); popup=new maplibregl.Popup({offset:14,maxWidth:'320px'}).setLngLat(lngLat).setHTML(`<div class="hike-map-popup"><strong>${esc(name)}</strong>${description?`<p>${esc(description)}</p>`:''}</div>`).addTo(map);
}

function installLayers(){
  if(!map||map.getSource('hike-route'))return;
  map.addSource('hike-route',{type:'geojson',data:collection()});
  map.addLayer({id:'hike-route-casing',type:'line',source:'hike-route',paint:{'line-color':'#fff','line-width':['interpolate',['linear'],['zoom'],8,6,15,11],'line-opacity':.9}});
  map.addLayer({id:'hike-route-line',type:'line',source:'hike-route',paint:{'line-color':'#355f3f','line-width':['interpolate',['linear'],['zoom'],8,3,15,7],'line-opacity':.96}});
  map.addSource('hike-waypoints',{type:'geojson',data:collection()});
  map.addLayer({id:'hike-waypoints-layer',type:'circle',source:'hike-waypoints',minzoom:10,paint:{'circle-color':['match',['get','role'],'hazard','#a53b2a','service','#426f8d','highlight','#356b48','#6c6a67'],'circle-radius':['interpolate',['linear'],['zoom'],10,4,15,8],'circle-stroke-color':'#fff','circle-stroke-width':2}});
  map.addSource('hike-conditions',{type:'geojson',data:collection()});
  map.addLayer({id:'hike-condition-lines',type:'line',source:'hike-conditions',filter:['in',['geometry-type'],['literal',['LineString','MultiLineString']]],paint:{'line-color':'#a53b2a','line-width':6,'line-dasharray':[1.2,1.2]}});
  map.addLayer({id:'hike-condition-points',type:'circle',source:'hike-conditions',filter:['==',['geometry-type'],'Point'],paint:{'circle-color':'#a53b2a','circle-radius':8,'circle-stroke-color':'#fff','circle-stroke-width':3}});
  for(const layer of ['hike-waypoints-layer','hike-condition-lines','hike-condition-points']){map.on('click',layer,(event)=>popupFor(event.features?.[0],event.lngLat));map.on('mouseenter',layer,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',layer,()=>map.getCanvas().style.cursor='');}
  mapReady=true;
}

function updateMap(data){
  if(!mapReady)return;
  clearProfileMarker();
  map.getSource('hike-route')?.setData(collection([{type:'Feature',geometry:data.geometry,properties:{}}]));
  map.getSource('hike-waypoints')?.setData(collection((data.waypoints??[]).map((waypoint)=>({type:'Feature',geometry:{type:'Point',coordinates:waypoint.coordinate},properties:{name:waypoint.name,type:waypoint.type,role:waypoint.role,description:waypoint.description??''}}))));
  map.getSource('hike-conditions')?.setData(collection((data.conditions??[]).filter((condition)=>condition.state==='current'&&condition.geometry).map((condition)=>({type:'Feature',geometry:condition.geometry,properties:{id:condition.id,name:title(condition.type),type:condition.type,description:condition.latestObservation?.description??''}}))));
  const [w,s,e,n]=data.bbox; map.fitBounds([[w,s],[e,n]],{padding:window.innerWidth<700?34:58,maxZoom:15,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:450});
}

async function select(id){
  const item=variant(id); if(!item)return; selectedId=id; for(const button of buttons)button.setAttribute('aria-selected',String(button.dataset.hikeVariant===id)); planner?.setAttribute('aria-busy','true');
  try{const raw=await route(id);if(selectedId!==id)return;const data=runtimeRouteData(raw);selectedRoute=data;renderMetrics(item,data);renderActions(item);renderRuntimeConditions(data);renderElevation(data);updateMap(data);}catch(error){console.error(error);metricsElement.innerHTML=`<p class="hike-error">${esc(error.message??'Route data could not be loaded.')}</p>`;}finally{if(selectedId===id)planner?.removeAttribute('aria-busy');}
}

async function initialiseMap(){
  if(!mapElement||!config?.map)return;
  try{const module=await import(config.map.libraryModuleUrl);maplibregl=module.default??module;map=new maplibregl.Map({container:mapElement,style:config.map.styleUrl,center:[0,0],zoom:10,maxZoom:18,attributionControl:true});map.addControl(new maplibregl.NavigationControl(),'top-right');map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-right');await new Promise((resolve)=>map.once('load',resolve));installLayers();if(selectedRoute)updateMap(selectedRoute);}catch(error){console.warn('Hike map unavailable:',error);mapElement.classList.add('is-unavailable');mapElement.innerHTML='<p>Interactive map unavailable. Use the route details and GPX download on this page.</p>';}
}

if(config&&planner){for(const button of buttons)button.addEventListener('click',()=>void select(button.dataset.hikeVariant));void select(config.defaultVariantId);void initialiseMap();}
