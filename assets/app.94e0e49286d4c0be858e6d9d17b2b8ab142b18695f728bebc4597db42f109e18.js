(()=>{var Z=Object.freeze(["S","A","B","C"]),X=String.raw`
/* Tier presentation is intentionally semantic: color, size, shape and containment
   reinforce the editorial tier without adding explanatory copy. */
.tier-display.is-expressive-tier,
.tier-row.has-tier-theme,
.browse-tile[data-tier-theme] {
  --tier-accent: var(--md-sys-color-primary);
  --tier-surface: var(--md-sys-color-primary-container);
}

.tier-display.tier-s,
.tier-row.tier-s,
.browse-tile[data-tier-theme="S"] { --tier-accent: var(--tier-s); --tier-surface: var(--tier-s-container); }
.tier-display.tier-a,
.tier-row.tier-a,
.browse-tile[data-tier-theme="A"] { --tier-accent: var(--tier-a); --tier-surface: var(--tier-a-container); }
.tier-display.tier-b,
.tier-row.tier-b,
.browse-tile[data-tier-theme="B"] { --tier-accent: var(--tier-b); --tier-surface: var(--tier-b-container); }
.tier-display.tier-c,
.tier-row.tier-c,
.browse-tile[data-tier-theme="C"] { --tier-accent: var(--tier-c); --tier-surface: var(--tier-c-container); }

.detail-hero:has(.tier-display.is-expressive-tier) {
  background:
    linear-gradient(138deg,
      color-mix(in srgb, var(--tier-surface) 62%, var(--md-sys-color-surface)) 0 52%,
      color-mix(in srgb, var(--md-sys-color-secondary-container) 34%, var(--md-sys-color-surface)) 100%);
}
.detail-hero:has(.tier-display.tier-s) { --tier-surface: var(--tier-s-container); }
.detail-hero:has(.tier-display.tier-a) { --tier-surface: var(--tier-a-container); }
.detail-hero:has(.tier-display.tier-b) { --tier-surface: var(--tier-b-container); }
.detail-hero:has(.tier-display.tier-c) { --tier-surface: var(--tier-c-container); }

.tier-display.is-expressive-tier {
  position: relative;
  isolation: isolate;
  grid-template-columns: 80px minmax(0, 1fr);
  min-height: 116px;
  gap: var(--space-5);
  overflow: hidden;
  padding: var(--space-4) var(--space-6) var(--space-4) var(--space-4);
  border: 1px solid color-mix(in srgb, var(--tier-accent) 36%, transparent);
  border-radius: 36px 20px 46px 24px;
  background: var(--tier-surface);
  color: var(--tier-accent);
  box-shadow: var(--elevation-1);
}

.tier-display.is-expressive-tier::after {
  content: "";
  position: absolute;
  z-index: -1;
  right: -4.25rem;
  bottom: -5rem;
  width: 9rem;
  aspect-ratio: 1;
  border-radius: 42% 58% 68% 32% / 56% 38% 62% 44%;
  background: color-mix(in srgb, var(--tier-accent) 11%, transparent);
  rotate: -14deg;
}

.tier-display.is-expressive-tier .tier-letter {
  width: 80px;
  aspect-ratio: 1;
  border-radius: 24px 39px 22px 35px;
  background: var(--tier-accent);
  color: var(--tier-surface);
  font-size: 3rem;
  line-height: 1;
  rotate: -5deg;
}

.tier-display.is-expressive-tier > strong {
  min-width: 0;
  color: var(--tier-accent);
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 1.7rem);
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.04;
  text-wrap: balance;
}

/* Carry the same tier language into existing tier surfaces without changing content. */
.tier-row.has-tier-theme {
  border-color: color-mix(in srgb, var(--tier-accent) 34%, var(--md-sys-color-outline-variant));
  background: color-mix(in srgb, var(--tier-surface) 32%, var(--md-sys-color-surface-container-low));
}
.tier-row.has-tier-theme > strong {
  border: 1px solid color-mix(in srgb, var(--tier-accent) 30%, transparent);
  background: var(--tier-surface);
  color: var(--tier-accent);
}

.browse-tile[data-tier-theme] {
  border-color: color-mix(in srgb, var(--tier-accent) 30%, var(--md-sys-color-outline-variant));
}
.browse-tile[data-tier-theme]::after { color: var(--tier-accent); opacity: .14; }
.browse-tile[data-tier-theme]:hover {
  background: color-mix(in srgb, var(--tier-surface) 72%, var(--md-sys-color-surface-container-lowest));
}

@media (max-width: 47.99rem), (max-height: 36rem) {
  .tier-display.is-expressive-tier {
    grid-template-columns: 68px minmax(0, 1fr);
    min-height: 96px;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-5) var(--space-3) var(--space-3);
    border-radius: 30px 18px 38px 20px;
  }
  .tier-display.is-expressive-tier .tier-letter {
    width: 68px;
    border-radius: 20px 33px 18px 29px;
    font-size: 2.55rem;
  }
}

@media (prefers-contrast: more) {
  .tier-display.is-expressive-tier,
  .tier-row.has-tier-theme,
  .browse-tile[data-tier-theme] { border-width: 2px; }
}

@media (forced-colors: active) {
  .tier-display.is-expressive-tier,
  .tier-row.has-tier-theme,
  .browse-tile[data-tier-theme] {
    border: 2px solid CanvasText;
    background: Canvas;
    color: CanvasText;
  }
  .tier-display.is-expressive-tier .tier-letter,
  .tier-row.has-tier-theme > strong {
    border: 2px solid CanvasText;
    background: CanvasText;
    color: Canvas;
  }
  .tier-display.is-expressive-tier > strong { color: CanvasText; }
}
`;function I(e){let t=String(e??"").trim().toUpperCase();return Z.includes(t)?t:null}function Y(e){if(!e.head||e.getElementById("tier-presentation-expressive-styles"))return;let t=e.createElement("style");t.id="tier-presentation-expressive-styles",t.textContent=X,e.head.append(t)}function ee(e){let t=e.querySelector(".tier-letter"),r=e.querySelector("strong"),a=I(t?.textContent);!t||!r||!a||(e.classList.add("is-expressive-tier",`tier-${a.toLowerCase()}`),e.replaceChildren(t,r),e.setAttribute("role","group"),e.setAttribute("aria-label",`Tier ${a}: ${r.textContent?.trim()??""}`),t.setAttribute("aria-hidden","true"),r.setAttribute("aria-hidden","true"))}function te(e){let t=I(e.querySelector("h3")?.textContent);t&&e.classList.add("has-tier-theme",`tier-${t.toLowerCase()}`)}function re(e){let t=I(e.dataset.symbol);t&&(e.dataset.tierTheme=t)}function ne(e=document){let t=e.nodeType===9?e:e.ownerDocument;if(t){Y(t);for(let r of e.querySelectorAll(".tier-display"))ee(r);for(let r of e.querySelectorAll(".tier-row"))te(r);for(let r of e.querySelectorAll(".browse-tile[data-symbol]"))re(r)}}typeof document<"u"&&ne(document);var ye=Object.freeze(["S","A","B","C","D","E","F","unranked"]),xe=Object.freeze(["S","A","B","C"]),Ae=Object.freeze(["candidate","published","needs-review","rejected","deprecated","closed"]),Ee=Object.freeze(["publish","review","reject","unpublish"]),we=Object.freeze(["official","google-maps","openstreetmap","reservation","trail-source","research","other"]),m=1;function x(e,t=r=>JSON.stringify(r)){let r=new Set,a=[];for(let n of e){let i=t(n);r.has(i)||(r.add(i),a.push(n))}return a}function C(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}function g(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}T/.test(e))return!1;let t=Date.parse(e);return Number.isFinite(t)&&new Date(t).toISOString()===e}function A(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(e))return!1;let t=Date.parse(`${e}T00:00:00.000Z`);return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===e}var E="good-shit-personal-state",k=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;function ae(e){return e().toISOString()}function b(...e){return e.filter(t=>!!t).sort().at(-1)??new Date(0).toISOString()}function $(e,t){return{name:String(e?.name??"Unknown catalogue entity"),slug:e?.slug?String(e.slug):null,countryCode:e?.countryCode?String(e.countryCode):null,tier:e?.tier?String(e.tier):null,status:e?.status?String(e.status):null,updatedAt:g(e?.updatedAt)?e.updatedAt:t}}function L(e,t={},r=new Date().toISOString()){if(!k.test(e))throw new TypeError(`Invalid entity ID: ${e}`);return{schemaVersion:m,entityId:e,snapshot:$(t,r),favourite:{value:!1,updatedAt:r},visited:{value:!1,dates:[],updatedAt:r},personalRating:{value:null,scale:5,updatedAt:r},notes:{value:"",updatedAt:r},conflicts:[],updatedAt:r}}function f(e,t=new Date().toISOString()){let r=L(e.entityId,e.snapshot,t),a=e.personalRating?.value;return{...r,favourite:{value:!!e.favourite?.value,updatedAt:g(e.favourite?.updatedAt)?e.favourite.updatedAt:t},visited:{value:!!e.visited?.value,dates:x(Array.isArray(e.visited?.dates)?e.visited.dates.filter(A):[]).sort(),updatedAt:g(e.visited?.updatedAt)?e.visited.updatedAt:t},personalRating:{value:a==null?null:Number(a),scale:5,updatedAt:g(e.personalRating?.updatedAt)?e.personalRating.updatedAt:t},notes:{value:String(e.notes?.value??""),updatedAt:g(e.notes?.updatedAt)?e.notes.updatedAt:t},conflicts:Array.isArray(e.conflicts)?structuredClone(e.conflicts):[],updatedAt:g(e.updatedAt)?e.updatedAt:t}}function ie(e,t,r,a){return{id:globalThis.crypto?.randomUUID?.()??`${e}-${a}`,field:e,existingValue:t,importedValue:r,importedAt:a,resolution:"kept-existing"}}function se(e,t,r=new Date().toISOString()){let a=f(e,r),n=f(t,r);if(a.entityId!==n.entityId)throw new TypeError("Cannot merge personal records for different entities.");let i=[...a.conflicts,...n.conflicts],s=a.snapshot.updatedAt>=n.snapshot.updatedAt?a.snapshot:n.snapshot,l={value:a.favourite.value||n.favourite.value,updatedAt:b(a.favourite.updatedAt,n.favourite.updatedAt)},o={value:a.visited.value||n.visited.value,dates:x([...a.visited.dates,...n.visited.dates]).sort(),updatedAt:b(a.visited.updatedAt,n.visited.updatedAt)},c;a.personalRating.value==null?c=n.personalRating:n.personalRating.value==null||a.personalRating.value===n.personalRating.value?c={value:a.personalRating.value,scale:5,updatedAt:b(a.personalRating.updatedAt,n.personalRating.updatedAt)}:(c=a.personalRating,i.push(ie("personalRating",a.personalRating.value,n.personalRating.value,r)));let d,h=a.notes.value.trim(),R=n.notes.value.trim();return h?!R||h===R||h.includes(R)?d={value:a.notes.value,updatedAt:b(a.notes.updatedAt,n.notes.updatedAt)}:(d={value:`${a.notes.value.trimEnd()}

--- Imported ${r.slice(0,10)} ---
${n.notes.value.trim()}`,updatedAt:b(a.notes.updatedAt,n.notes.updatedAt,r)},i.push({id:globalThis.crypto?.randomUUID?.()??`notes-${r}`,field:"notes",existingValue:a.notes.value,importedValue:n.notes.value,importedAt:r,resolution:"preserved-both"})):d=n.notes,{schemaVersion:m,entityId:a.entityId,snapshot:s,favourite:l,visited:o,personalRating:c,notes:d,conflicts:x(i,D=>D.id??JSON.stringify(D)),updatedAt:b(a.updatedAt,n.updatedAt,r)}}function oe(e){let t=[],r=(a,n)=>t.push({path:a,message:n});if(!C(e))return[{path:"$",message:"Expected an object."}];e.format!==E&&r("$.format",`Expected ${E}.`),[0,m].includes(e.schemaVersion)||r("$.schemaVersion","Unsupported personal-state schema version."),g(e.exportedAt)||r("$.exportedAt","Expected an ISO 8601 UTC timestamp."),Array.isArray(e.records)||r("$.records","Expected an array.");for(let[a,n]of(e.records??[]).entries()){let i=`$.records[${a}]`;if(!C(n)){r(i,"Expected an object.");continue}if(k.test(n.entityId??"")||r(`${i}.entityId`,"Expected an immutable UUID entity ID."),e.schemaVersion===1){let s=n.personalRating?.value;s!=null&&(!Number.isFinite(s)||s<1||s>5)&&r(`${i}.personalRating.value`,"Expected null or a rating from 1 to 5."),String(n.notes?.value??"").length>5e4&&r(`${i}.notes.value`,"Notes exceed the 50,000 character limit."),(!Array.isArray(n.visited?.dates)||n.visited.dates.some(l=>!A(l)))&&r(`${i}.visited.dates`,"Expected ISO dates.")}}return t}function le(e,t=new Date().toISOString()){let r=oe(e);if(r.length){let n=r.map(i=>`${i.path}: ${i.message}`).join(`
`);throw new TypeError(`Invalid personal-state import:
${n}`)}if(e.schemaVersion===m)return{format:E,schemaVersion:m,exportedAt:e.exportedAt,records:e.records.map(n=>f(n,t)),orphanedEntityState:(e.orphanedEntityState??[]).map(n=>f(n,t)),importConflicts:Array.isArray(e.importConflicts)?structuredClone(e.importConflicts):[]};let a=e.records.map(n=>{let i=L(n.entityId,n.snapshot??{name:n.name},t);i.favourite={value:!!n.favourite,updatedAt:e.exportedAt},i.visited={value:!!n.visited,dates:x((n.visitDates??[]).filter(A)).sort(),updatedAt:e.exportedAt};let s=n.rating==null?null:Number(n.rating);return i.personalRating={value:s,scale:5,updatedAt:e.exportedAt},i.notes={value:String(n.note??""),updatedAt:e.exportedAt},i.updatedAt=e.exportedAt,i});return{format:E,schemaVersion:m,exportedAt:e.exportedAt,records:a,orphanedEntityState:[],importConflicts:[]}}function ce(e,t={}){let r=t.exportedAt??new Date().toISOString(),a=t.knownEntityIds?new Set(t.knownEntityIds):null,n=e.map(i=>f(i,r)).sort((i,s)=>i.entityId.localeCompare(s.entityId));return{format:E,schemaVersion:m,exportedAt:r,records:n,orphanedEntityState:a?n.filter(i=>!a.has(i.entityId)):[],importConflicts:n.flatMap(i=>i.conflicts.map(s=>({entityId:i.entityId,...s})))}}var w=class{adapter;clock;writeQueues;constructor(t,r={}){this.adapter=t,this.clock=r.clock??(()=>new Date),this.writeQueues=new Map}now(){return ae(this.clock)}async get(t,r={}){let a=await this.adapter.get(t);return a?f(a,this.now()):L(t,r,this.now())}async getAll(){return(await this.adapter.getAll()).map(t=>f(t,this.now()))}async update(t,r,a){let i=(this.writeQueues.get(t)??Promise.resolve(null)).catch(()=>null).then(async()=>{let s=await this.get(t,r),l=this.now(),o=a(structuredClone(s),l);return o.snapshot=$({...s.snapshot,...r,updatedAt:l},l),o.updatedAt=l,await this.adapter.put(o),o});this.writeQueues.set(t,i);try{return await i}finally{this.writeQueues.get(t)===i&&this.writeQueues.delete(t)}}async setFavourite(t,r,a={}){return this.update(t,a,(n,i)=>(n.favourite={value:!!r,updatedAt:i},n))}async setVisited(t,r,a=null,n={}){return this.update(t,n,(i,s)=>{let l=[...i.visited.dates];return r&&a&&A(a)&&!l.includes(a)&&l.push(a),i.visited={value:!!r,dates:l.sort(),updatedAt:s},i})}async setPersonalRating(t,r,a={}){if(r!=null&&(!Number.isFinite(Number(r))||Number(r)<1||Number(r)>5))throw new RangeError("Personal rating must be null or between 1 and 5.");return this.update(t,a,(n,i)=>(n.personalRating={value:r==null?null:Number(r),scale:5,updatedAt:i},n))}async setNotes(t,r,a={}){let n=String(r??"");if(n.length>5e4)throw new RangeError("Notes exceed the 50,000 character limit.");return this.update(t,a,(i,s)=>(i.notes={value:n,updatedAt:s},i))}async export(t={}){return ce(await this.getAll(),{...t,exportedAt:this.now()})}async import(t){let r=this.now(),a=le(t,r),n=[];for(let i of a.records){let s=await this.adapter.get(i.entityId),l=s?se(s,i,r):f(i,r);await this.adapter.put(l),n.push(l)}return{imported:n.length,conflicts:n.reduce((i,s)=>i+s.conflicts.length,0),records:n}}async clear(){await this.adapter.clear()}};var de="good-shit-personal-state",ue=1,pe="records";function T(e){return new Promise((t,r)=>{e.addEventListener("success",()=>t(e.result),{once:!0}),e.addEventListener("error",()=>r(e.error??new Error("IndexedDB request failed.")),{once:!0})})}function B(e){return new Promise((t,r)=>{e.addEventListener("complete",()=>t(),{once:!0}),e.addEventListener("abort",()=>r(e.error??new Error("IndexedDB transaction aborted.")),{once:!0}),e.addEventListener("error",()=>r(e.error??new Error("IndexedDB transaction failed.")),{once:!0})})}var N=class{databaseName;databaseVersion;storeName;#e;constructor(t={}){this.databaseName=t.databaseName??de,this.databaseVersion=t.databaseVersion??ue,this.storeName=t.storeName??pe,this.#e=null}async#t(){if(!globalThis.indexedDB)throw new Error("IndexedDB is not available in this browser.");return this.#e||(this.#e=new Promise((t,r)=>{let a=indexedDB.open(this.databaseName,this.databaseVersion);a.addEventListener("upgradeneeded",()=>{let n=a.result;n.objectStoreNames.contains(this.storeName)||n.createObjectStore(this.storeName,{keyPath:"entityId"}).createIndex("updatedAt","updatedAt")}),a.addEventListener("success",()=>{let n=a.result;n.addEventListener("versionchange",()=>n.close()),t(n)},{once:!0}),a.addEventListener("error",()=>r(a.error??new Error("Could not open personal-state database.")),{once:!0}),a.addEventListener("blocked",()=>r(new Error("Personal-state database upgrade is blocked by another open tab.")),{once:!0})})),this.#e}async get(t){let a=(await this.#t()).transaction(this.storeName,"readonly");return await T(a.objectStore(this.storeName).get(t))??null}async put(t){let a=(await this.#t()).transaction(this.storeName,"readwrite",{durability:"strict"}),n=await T(a.objectStore(this.storeName).put(structuredClone(t)));return await B(a),this.requestPersistence(),n}async getAll(){let r=(await this.#t()).transaction(this.storeName,"readonly");return T(r.objectStore(this.storeName).getAll())}async clear(){let r=(await this.#t()).transaction(this.storeName,"readwrite",{durability:"strict"});await T(r.objectStore(this.storeName).clear()),await B(r)}async requestPersistence(){try{return navigator.storage?.persisted&&await navigator.storage.persisted()?!0:navigator.storage?.persist?navigator.storage.persist():!1}catch{return!1}}},M=new EventTarget,y=new w(new N);function me(e,t="unknown"){M.dispatchEvent(new CustomEvent("change",{detail:{record:e,source:t}})),globalThis.dispatchEvent?.(new CustomEvent("good-shit:personal-state-change",{detail:{record:e,source:t}}))}async function p(e,t="ui"){let r=await e(y);return me(r,t),r}var V=/^[a-z0-9-]+$/;function H(e){return String(e??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function q(e,t,r="ui-icon"){let a=V.test(String(t))?String(t):"diamond";return`<svg class="${H(r)}" data-ui-icon="${a}" aria-hidden="true" focusable="false"><use href="${H(e)}#${a}"></use></svg>`}function j(e,t,r){let a=e?.querySelector("[data-ui-icon]"),n=a?.querySelector("use");!a||!n||!V.test(String(r))||(a.dataset.uiIcon=String(r),n.setAttribute("href",`${t}#${r}`))}var U=document.querySelector("#page-config"),Q=U?JSON.parse(U.textContent??"{}"):{uiIconSpriteUrl:""},_=e=>q(Q.uiIconSpriteUrl,e),O=null,z=new WeakMap;function P(e,t="Something went wrong."){return e instanceof Error?e.message:e==null?t:String(e)}function S(e){try{return JSON.parse(e?.dataset?.entitySnapshot??"{}")}catch{return{}}}function v(e){return e.closest("[data-entity-id]")}function K(e=new Date){return new Date(e.getTime()-e.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function u(e,t={}){let r=document.querySelector("#app-status");r&&(O&&clearTimeout(O),r.textContent=e,r.classList.toggle("is-error",!!t.error),r.classList.add("is-visible"),O=setTimeout(()=>r.classList.remove("is-visible"),t.duration??2800))}function G(e,t){let r=e.querySelector('[data-personal-action="favourite"]'),a=e.querySelector('[data-personal-action="visited"]');r&&(r.setAttribute("aria-pressed",String(t.favourite.value)),j(r,Q.uiIconSpriteUrl,t.favourite.value?"heart-filled":"heart"),r.title=t.favourite.value?"Remove from favourites":"Favourite"),a&&(a.setAttribute("aria-pressed",String(t.visited.value)),a.title=t.visited.value?"Mark unvisited":"Mark visited"),e.classList.toggle("is-favourite",t.favourite.value),e.classList.toggle("is-visited",t.visited.value)}function J(e,t){let r=e.querySelector('[data-detail-action="favourite"]'),a=e.querySelector('[data-detail-action="visited"]');r&&(r.setAttribute("aria-pressed",String(t.favourite.value)),r.innerHTML=`${_(t.favourite.value?"heart-filled":"heart")} ${t.favourite.value?"Favourited":"Favourite"}`),a&&(a.setAttribute("aria-pressed",String(t.visited.value)),a.innerHTML=`${_("check")} ${t.visited.value?"Visited":"Mark visited"}`);let n=e.querySelector("[data-visit-date]");n&&document.activeElement!==n&&(n.value=t.visited.dates.at(-1)??"");for(let c of e.querySelectorAll("[data-rating-value]")){let d=Number(c.dataset.ratingValue),h=d<=(t.personalRating.value??0);c.classList.toggle("is-active",h),c.setAttribute("aria-pressed",String(d===t.personalRating.value))}let i=e.querySelector("[data-rating-label]");i&&(i.textContent=t.personalRating.value==null?"Not rated":`${t.personalRating.value} of 5`);let s=e.querySelector("[data-personal-notes]");s&&document.activeElement!==s&&!s.dataset.dirty&&(s.value=t.notes.value);let l=e.querySelector("[data-notes-status]");l&&!s?.dataset.dirty&&(l.textContent=t.notes.updatedAt?`Saved ${new Date(t.notes.updatedAt).toLocaleString()}`:"Not saved yet");let o=e.querySelector("[data-visit-history]");o&&(o.textContent=t.visited.dates.length?`Visit dates: ${t.visited.dates.join(", ")}`:"No visit dates recorded.")}function ge(e,t=document){for(let r of t.querySelectorAll(`[data-entity-id="${CSS.escape(e.entityId)}"]`))G(r,e),(r.matches("[data-personal-panel]")||r.querySelector("[data-detail-action]"))&&J(r,e)}async function F(e=document){try{let t=await y.getAll(),r=new Map(t.map(n=>[n.entityId,n])),a=[...e.querySelectorAll("[data-entity-id]")];for(let n of a){let i=n.dataset.entityId;if(!i)continue;let s=r.get(i)??await y.get(i,S(n));G(n,s),(n.matches("[data-personal-panel]")||n.querySelector("[data-detail-action]"))&&J(n,s)}return r}catch(t){return console.error(t),u("Personal state could not be opened in this browser.",{error:!0,duration:6e3}),new Map}}async function fe(e){let t=v(e),r=t?.dataset.entityId;if(!t||!r)return null;let a=S(t),n=await y.get(r,a);if(e.dataset.personalAction==="favourite"){let i=!n.favourite.value,s=await p(l=>l.setFavourite(r,i,a),"quick-action");return u(i?"Added to favourites.":"Removed from favourites."),s}if(e.dataset.personalAction==="visited"){let i=!n.visited.value,s=await p(l=>l.setVisited(r,i,i?K():null,a),"quick-action");return u(i?"Marked visited.":"Marked unvisited. Visit dates were retained."),s}return null}async function ve(e){let t=v(e),r=t?.dataset.entityId;if(!t||!r)return;let a=S(t),n=await y.get(r,a);if(e.dataset.detailAction==="favourite"){let i=!n.favourite.value;await p(s=>s.setFavourite(r,i,a),"detail"),u(i?"Added to favourites.":"Removed from favourites.")}else if(e.dataset.detailAction==="visited"){let i=!n.visited.value,s=i?t.querySelector("[data-visit-date]")?.value||K():null;await p(l=>l.setVisited(r,i,s,a),"detail"),u(i?"Visit saved.":"Marked unvisited. Existing visit dates were retained.")}}async function W(e,t=!0){let r=v(e),a=r?.dataset.entityId;if(!r||!a)return;let n=r.querySelector("[data-notes-status]");try{n&&(n.textContent="Saving\u2026");let i=await p(s=>s.setNotes(a,e.value,S(r)),"notes");delete e.dataset.dirty,n&&(n.textContent=`Saved ${new Date(i.notes.updatedAt).toLocaleString()}`),t&&u("Private note saved.")}catch(i){console.error(i);let s=P(i,"Could not save private note.");n&&(n.textContent=s),u(s,{error:!0})}}async function he(e){let t=e.target instanceof Element?e.target:null;if(!t)return;let r=t.closest("[data-personal-action]");if(r){e.preventDefault(),r.disabled=!0;try{await fe(r)}catch(o){console.error(o),u(P(o,"Could not update personal state."),{error:!0})}finally{r.disabled=!1}return}let a=t.closest("[data-detail-action]");if(a){a.disabled=!0;try{await ve(a)}catch(o){console.error(o),u(P(o,"Could not update personal state."),{error:!0})}finally{a.disabled=!1}return}let n=t.closest("[data-rating-value]");if(n){let o=v(n),c=o?.dataset.entityId;if(!o||!c)return;try{await p(d=>d.setPersonalRating(c,Number(n.dataset.ratingValue),S(o)),"rating"),u(`Personal rating set to ${n.dataset.ratingValue}/5.`)}catch(d){console.error(d),u(P(d,"Could not update personal rating."),{error:!0})}return}let i=t.closest("[data-clear-rating]");if(i){let o=v(i),c=o?.dataset.entityId;if(!o||!c)return;await p(d=>d.setPersonalRating(c,null,S(o)),"rating"),u("Personal rating cleared.");return}let s=t.closest("[data-save-notes]");if(s){let o=v(s)?.querySelector("[data-personal-notes]");o&&await W(o);return}let l=t.closest("[data-add-visit-date]");if(l){let o=v(l),c=o?.querySelector("[data-visit-date]"),d=o?.dataset.entityId;if(!o||!d||!c?.value){u("Choose a visit date first.",{error:!0});return}await p(h=>h.setVisited(d,!0,c.value,S(o)),"visit-date"),u("Visit date added.")}}function Se(e){let r=(e.target instanceof Element?e.target:null)?.closest("[data-personal-notes]");if(!r)return;r.dataset.dirty="true";let n=v(r)?.querySelector("[data-notes-status]");n&&(n.textContent=`${r.value.length.toLocaleString()} / 50,000 characters \xB7 unsaved`);let i=z.get(r);i&&clearTimeout(i),z.set(r,setTimeout(()=>{W(r,!1)},850))}M.addEventListener("change",e=>{let t=e.detail;ge(t.record)});document.addEventListener("click",e=>{he(e)});document.addEventListener("input",Se);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{F()},{once:!0}):F();})();
