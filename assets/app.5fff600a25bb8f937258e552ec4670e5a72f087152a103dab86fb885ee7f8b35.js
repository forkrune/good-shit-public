(()=>{var ne=Object.freeze(["S","A","B","C"]),ae=String.raw`
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
`;function L(e){let t=String(e??"").trim().toUpperCase();return ne.includes(t)?t:null}function ie(e){if(!e.head||e.getElementById("tier-presentation-expressive-styles"))return;let t=e.createElement("style");t.id="tier-presentation-expressive-styles",t.textContent=ae,e.head.append(t)}function se(e){let t=e.querySelector(".tier-letter"),r=e.querySelector("strong"),n=L(t?.textContent);!t||!r||!n||(e.classList.add("is-expressive-tier",`tier-${n.toLowerCase()}`),e.replaceChildren(t,r),e.setAttribute("role","group"),e.setAttribute("aria-label",`Tier ${n}: ${r.textContent?.trim()??""}`),t.setAttribute("aria-hidden","true"),r.setAttribute("aria-hidden","true"))}function oe(e){let t=L(e.querySelector("h3")?.textContent);t&&e.classList.add("has-tier-theme",`tier-${t.toLowerCase()}`)}function le(e){let t=L(e.dataset.symbol);t&&(e.dataset.tierTheme=t)}function ce(e=document){let t=e.nodeType===9?e:e.ownerDocument;if(t){ie(t);for(let r of e.querySelectorAll(".tier-display"))se(r);for(let r of e.querySelectorAll(".tier-row"))oe(r);for(let r of e.querySelectorAll(".browse-tile[data-symbol]"))le(r)}}typeof document<"u"&&ce(document);var we=Object.freeze(["S","A","B","C","D","E","F","unranked"]),Te=Object.freeze(["S","A","B","C"]),Ie=Object.freeze(["candidate","published","needs-review","rejected","deprecated","closed"]),Ce=Object.freeze(["publish","review","reject","unpublish"]),Le=Object.freeze(["official","google-maps","openstreetmap","reservation","trail-source","research","other"]),m=1;function b(e,t=r=>JSON.stringify(r)){let r=new Set,n=[];for(let a of e){let i=t(a);r.has(i)||(r.add(i),n.push(a))}return n}function N(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}function f(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}T/.test(e))return!1;let t=Date.parse(e);return Number.isFinite(t)&&new Date(t).toISOString()===e}function x(e){if(typeof e!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(e))return!1;let t=Date.parse(`${e}T00:00:00.000Z`);return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===e}var A="good-shit-personal-state",$=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;function de(e){return e().toISOString()}function y(...e){return e.filter(t=>!!t).sort().at(-1)??new Date(0).toISOString()}function H(e,t){return{name:String(e?.name??"Unknown catalogue entity"),slug:e?.slug?String(e.slug):null,countryCode:e?.countryCode?String(e.countryCode):null,tier:e?.tier?String(e.tier):null,status:e?.status?String(e.status):null,updatedAt:f(e?.updatedAt)?e.updatedAt:t}}function R(e,t={},r=new Date().toISOString()){if(!$.test(e))throw new TypeError(`Invalid entity ID: ${e}`);return{schemaVersion:m,entityId:e,snapshot:H(t,r),favourite:{value:!1,updatedAt:r},visited:{value:!1,dates:[],updatedAt:r},personalRating:{value:null,scale:5,updatedAt:r},notes:{value:"",updatedAt:r},conflicts:[],updatedAt:r}}function w(e,t){return e?t.updatedAt>=e.updatedAt?t:e:t}function j(e){let t=new Map;for(let r of e)t.set(r.entityId,w(t.get(r.entityId),r));return Object.freeze({complete:!0,recordsById:t})}function V(e,t){let r=null;for(let n of t){let i=(r??e.recordsById).get(n.entityId),s=w(i,n);s!==i&&(r??=new Map(e.recordsById),r.set(n.entityId,s))}return r?Object.freeze({complete:!0,recordsById:r}):e}function q(e,t,r={},n=new Date().toISOString()){return e.recordsById.get(t)??R(t,r,n)}function g(e,t=new Date().toISOString()){let r=R(e.entityId,e.snapshot,t),n=e.personalRating?.value;return{...r,favourite:{value:!!e.favourite?.value,updatedAt:f(e.favourite?.updatedAt)?e.favourite.updatedAt:t},visited:{value:!!e.visited?.value,dates:b(Array.isArray(e.visited?.dates)?e.visited.dates.filter(x):[]).sort(),updatedAt:f(e.visited?.updatedAt)?e.visited.updatedAt:t},personalRating:{value:n==null?null:Number(n),scale:5,updatedAt:f(e.personalRating?.updatedAt)?e.personalRating.updatedAt:t},notes:{value:String(e.notes?.value??""),updatedAt:f(e.notes?.updatedAt)?e.notes.updatedAt:t},conflicts:Array.isArray(e.conflicts)?structuredClone(e.conflicts):[],updatedAt:f(e.updatedAt)?e.updatedAt:t}}function ue(e,t,r,n){return{id:globalThis.crypto?.randomUUID?.()??`${e}-${n}`,field:e,existingValue:t,importedValue:r,importedAt:n,resolution:"kept-existing"}}function pe(e,t,r=new Date().toISOString()){let n=g(e,r),a=g(t,r);if(n.entityId!==a.entityId)throw new TypeError("Cannot merge personal records for different entities.");let i=[...n.conflicts,...a.conflicts],s=n.snapshot.updatedAt>=a.snapshot.updatedAt?n.snapshot:a.snapshot,l={value:n.favourite.value||a.favourite.value,updatedAt:y(n.favourite.updatedAt,a.favourite.updatedAt)},o={value:n.visited.value||a.visited.value,dates:b([...n.visited.dates,...a.visited.dates]).sort(),updatedAt:y(n.visited.updatedAt,a.visited.updatedAt)},c;n.personalRating.value==null?c=a.personalRating:a.personalRating.value==null||n.personalRating.value===a.personalRating.value?c={value:n.personalRating.value,scale:5,updatedAt:y(n.personalRating.updatedAt,a.personalRating.updatedAt)}:(c=n.personalRating,i.push(ue("personalRating",n.personalRating.value,a.personalRating.value,r)));let d,S=n.notes.value.trim(),C=a.notes.value.trim();return S?!C||S===C||S.includes(C)?d={value:n.notes.value,updatedAt:y(n.notes.updatedAt,a.notes.updatedAt)}:(d={value:`${n.notes.value.trimEnd()}

--- Imported ${r.slice(0,10)} ---
${a.notes.value.trim()}`,updatedAt:y(n.notes.updatedAt,a.notes.updatedAt,r)},i.push({id:globalThis.crypto?.randomUUID?.()??`notes-${r}`,field:"notes",existingValue:n.notes.value,importedValue:a.notes.value,importedAt:r,resolution:"preserved-both"})):d=a.notes,{schemaVersion:m,entityId:n.entityId,snapshot:s,favourite:l,visited:o,personalRating:c,notes:d,conflicts:b(i,B=>B.id??JSON.stringify(B)),updatedAt:y(n.updatedAt,a.updatedAt,r)}}function me(e){let t=[],r=(n,a)=>t.push({path:n,message:a});if(!N(e))return[{path:"$",message:"Expected an object."}];e.format!==A&&r("$.format",`Expected ${A}.`),[0,m].includes(e.schemaVersion)||r("$.schemaVersion","Unsupported personal-state schema version."),f(e.exportedAt)||r("$.exportedAt","Expected an ISO 8601 UTC timestamp."),Array.isArray(e.records)||r("$.records","Expected an array.");for(let[n,a]of(e.records??[]).entries()){let i=`$.records[${n}]`;if(!N(a)){r(i,"Expected an object.");continue}if($.test(a.entityId??"")||r(`${i}.entityId`,"Expected an immutable UUID entity ID."),e.schemaVersion===1){let s=a.personalRating?.value;s!=null&&(!Number.isFinite(s)||s<1||s>5)&&r(`${i}.personalRating.value`,"Expected null or a rating from 1 to 5."),String(a.notes?.value??"").length>5e4&&r(`${i}.notes.value`,"Notes exceed the 50,000 character limit."),(!Array.isArray(a.visited?.dates)||a.visited.dates.some(l=>!x(l)))&&r(`${i}.visited.dates`,"Expected ISO dates.")}}return t}function fe(e,t=new Date().toISOString()){let r=me(e);if(r.length){let a=r.map(i=>`${i.path}: ${i.message}`).join(`
`);throw new TypeError(`Invalid personal-state import:
${a}`)}if(e.schemaVersion===m)return{format:A,schemaVersion:m,exportedAt:e.exportedAt,records:e.records.map(a=>g(a,t)),orphanedEntityState:(e.orphanedEntityState??[]).map(a=>g(a,t)),importConflicts:Array.isArray(e.importConflicts)?structuredClone(e.importConflicts):[]};let n=e.records.map(a=>{let i=R(a.entityId,a.snapshot??{name:a.name},t);i.favourite={value:!!a.favourite,updatedAt:e.exportedAt},i.visited={value:!!a.visited,dates:b((a.visitDates??[]).filter(x)).sort(),updatedAt:e.exportedAt};let s=a.rating==null?null:Number(a.rating);return i.personalRating={value:s,scale:5,updatedAt:e.exportedAt},i.notes={value:String(a.note??""),updatedAt:e.exportedAt},i.updatedAt=e.exportedAt,i});return{format:A,schemaVersion:m,exportedAt:e.exportedAt,records:n,orphanedEntityState:[],importConflicts:[]}}function ge(e,t={}){let r=t.exportedAt??new Date().toISOString(),n=t.knownEntityIds?new Set(t.knownEntityIds):null,a=e.map(i=>g(i,r)).sort((i,s)=>i.entityId.localeCompare(s.entityId));return{format:A,schemaVersion:m,exportedAt:r,records:a,orphanedEntityState:n?a.filter(i=>!n.has(i.entityId)):[],importConflicts:a.flatMap(i=>i.conflicts.map(s=>({entityId:i.entityId,...s})))}}var E=class{adapter;clock;writeQueues;constructor(t,r={}){this.adapter=t,this.clock=r.clock??(()=>new Date),this.writeQueues=new Map}now(){return de(this.clock)}async get(t,r={}){let n=await this.adapter.get(t);return n?g(n,this.now()):R(t,r,this.now())}async getAll(){return(await this.adapter.getAll()).map(t=>g(t,this.now()))}async update(t,r,n){let i=(this.writeQueues.get(t)??Promise.resolve(null)).catch(()=>null).then(async()=>{let s=await this.get(t,r),l=this.now(),o=n(structuredClone(s),l);return o.snapshot=H({...s.snapshot,...r,updatedAt:l},l),o.updatedAt=l,await this.adapter.put(o),o});this.writeQueues.set(t,i);try{return await i}finally{this.writeQueues.get(t)===i&&this.writeQueues.delete(t)}}async setFavourite(t,r,n={}){return this.update(t,n,(a,i)=>(a.favourite={value:!!r,updatedAt:i},a))}async setVisited(t,r,n=null,a={}){return this.update(t,a,(i,s)=>{let l=[...i.visited.dates];return r&&n&&x(n)&&!l.includes(n)&&l.push(n),i.visited={value:!!r,dates:l.sort(),updatedAt:s},i})}async setPersonalRating(t,r,n={}){if(r!=null&&(!Number.isFinite(Number(r))||Number(r)<1||Number(r)>5))throw new RangeError("Personal rating must be null or between 1 and 5.");return this.update(t,n,(a,i)=>(a.personalRating={value:r==null?null:Number(r),scale:5,updatedAt:i},a))}async setNotes(t,r,n={}){let a=String(r??"");if(a.length>5e4)throw new RangeError("Notes exceed the 50,000 character limit.");return this.update(t,n,(i,s)=>(i.notes={value:a,updatedAt:s},i))}async export(t={}){return ge(await this.getAll(),{...t,exportedAt:this.now()})}async import(t){let r=this.now(),n=fe(t,r),a=[];for(let i of n.records){let s=await this.adapter.get(i.entityId),l=s?pe(s,i,r):g(i,r);await this.adapter.put(l),a.push(l)}return{imported:a.length,conflicts:a.reduce((i,s)=>i+s.conflicts.length,0),records:a}}async clear(){await this.adapter.clear()}};var ve="good-shit-personal-state",Se=2,he="records",_="plans";function T(e){return new Promise((t,r)=>{e.addEventListener("success",()=>t(e.result),{once:!0}),e.addEventListener("error",()=>r(e.error??new Error("IndexedDB request failed.")),{once:!0})})}function U(e){return new Promise((t,r)=>{e.addEventListener("complete",()=>t(),{once:!0}),e.addEventListener("abort",()=>r(e.error??new Error("IndexedDB transaction aborted.")),{once:!0}),e.addEventListener("error",()=>r(e.error??new Error("IndexedDB transaction failed.")),{once:!0})})}var M=class{databaseName;databaseVersion;storeName;#e;constructor(t={}){this.databaseName=t.databaseName??ve,this.databaseVersion=t.databaseVersion??Se,this.storeName=t.storeName??he,this.#e=null}async#t(){if(!globalThis.indexedDB)throw new Error("IndexedDB is not available in this browser.");return this.#e||(this.#e=new Promise((t,r)=>{let n=indexedDB.open(this.databaseName,this.databaseVersion);n.addEventListener("upgradeneeded",()=>{let a=n.result;a.objectStoreNames.contains(this.storeName)||a.createObjectStore(this.storeName,{keyPath:"entityId"}).createIndex("updatedAt","updatedAt"),a.objectStoreNames.contains(_)||a.createObjectStore(_,{keyPath:"id"})}),n.addEventListener("success",()=>{let a=n.result;a.addEventListener("versionchange",()=>{a.close(),this.#e=null}),t(a)},{once:!0}),n.addEventListener("error",()=>{this.#e=null,r(n.error??new Error("Could not open personal-state database."))},{once:!0}),n.addEventListener("blocked",()=>{this.#e=null,r(new Error("Personal-state database upgrade is blocked by another open tab. Close older Good Shit tabs and retry."))},{once:!0})})),this.#e}async get(t){let n=(await this.#t()).transaction(this.storeName,"readonly");return await T(n.objectStore(this.storeName).get(t))??null}async put(t){let n=(await this.#t()).transaction(this.storeName,"readwrite",{durability:"strict"}),a=await T(n.objectStore(this.storeName).put(structuredClone(t)));return await U(n),this.requestPersistence(),a}async getAll(){let r=(await this.#t()).transaction(this.storeName,"readonly");return T(r.objectStore(this.storeName).getAll())}async clear(){let r=(await this.#t()).transaction(this.storeName,"readwrite",{durability:"strict"});await T(r.objectStore(this.storeName).clear()),await U(r)}async requestPersistence(){try{return navigator.storage?.persisted&&await navigator.storage.persisted()?!0:navigator.storage?.persist?navigator.storage.persist():!1}catch{return!1}}},O=new EventTarget,P=new E(new M);function ye(e,t="unknown"){O.dispatchEvent(new CustomEvent("change",{detail:{record:e,source:t}})),globalThis.dispatchEvent?.(new CustomEvent("good-shit:personal-state-change",{detail:{record:e,source:t}}))}async function p(e,t="ui"){let r=await e(P);return ye(r,t),r}var F=/^[a-z0-9-]+$/;function z(e){return String(e??"").replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}function Q(e,t,r="ui-icon"){let n=F.test(String(t))?String(t):"diamond";return`<svg class="${z(r)}" data-ui-icon="${n}" aria-hidden="true" focusable="false"><use href="${z(e)}#${n}"></use></svg>`}function K(e,t,r){let n=e?.querySelector("[data-ui-icon]"),a=n?.querySelector("use");!n||!a||!F.test(String(r))||(n.dataset.uiIcon=String(r),a.setAttribute("href",`${t}#${r}`))}var G=document.querySelector("#page-config"),X=G?JSON.parse(G.textContent??"{}"):{uiIconSpriteUrl:""},J=e=>Q(X.uiIconSpriteUrl,e),D=null,W=new WeakMap,k=new Map;function I(e,t="Something went wrong."){return e instanceof Error?e.message:e==null?t:String(e)}function h(e){try{return JSON.parse(e?.dataset?.entitySnapshot??"{}")}catch{return{}}}function v(e){return e.closest("[data-entity-id]")}function Y(e=new Date){return new Date(e.getTime()-e.getTimezoneOffset()*6e4).toISOString().slice(0,10)}function u(e,t={}){let r=document.querySelector("#app-status");r&&(D&&clearTimeout(D),r.textContent=e,r.classList.toggle("is-error",!!t.error),r.classList.add("is-visible"),D=setTimeout(()=>r.classList.remove("is-visible"),t.duration??2800))}function ee(e,t){let r=e.querySelector('[data-personal-action="favourite"]'),n=e.querySelector('[data-personal-action="visited"]');r&&(r.setAttribute("aria-pressed",String(t.favourite.value)),K(r,X.uiIconSpriteUrl,t.favourite.value?"heart-filled":"heart"),r.title=t.favourite.value?"Remove from favourites":"Favourite"),n&&(n.setAttribute("aria-pressed",String(t.visited.value)),n.title=t.visited.value?"Mark unvisited":"Mark visited"),e.classList.toggle("is-favourite",t.favourite.value),e.classList.toggle("is-visited",t.visited.value)}function te(e,t){let r=e.querySelector('[data-detail-action="favourite"]'),n=e.querySelector('[data-detail-action="visited"]');r&&(r.setAttribute("aria-pressed",String(t.favourite.value)),r.innerHTML=`${J(t.favourite.value?"heart-filled":"heart")} ${t.favourite.value?"Favourited":"Favourite"}`),n&&(n.setAttribute("aria-pressed",String(t.visited.value)),n.innerHTML=`${J("check")} ${t.visited.value?"Visited":"Mark visited"}`);let a=e.querySelector("[data-visit-date]");a&&document.activeElement!==a&&(a.value=t.visited.dates.at(-1)??"");for(let c of e.querySelectorAll("[data-rating-value]")){let d=Number(c.dataset.ratingValue),S=d<=(t.personalRating.value??0);c.classList.toggle("is-active",S),c.setAttribute("aria-pressed",String(d===t.personalRating.value))}let i=e.querySelector("[data-rating-label]");i&&(i.textContent=t.personalRating.value==null?"Not rated":`${t.personalRating.value} of 5`);let s=e.querySelector("[data-personal-notes]");s&&document.activeElement!==s&&!s.dataset.dirty&&(s.value=t.notes.value);let l=e.querySelector("[data-notes-status]");l&&!s?.dataset.dirty&&(l.textContent=t.notes.updatedAt?`Saved ${new Date(t.notes.updatedAt).toLocaleString()}`:"Not saved yet");let o=e.querySelector("[data-visit-history]");o&&(o.textContent=t.visited.dates.length?`Visit dates: ${t.visited.dates.join(", ")}`:"No visit dates recorded.")}function be(e,t=document){for(let r of t.querySelectorAll(`[data-entity-id="${CSS.escape(e.entityId)}"]`))ee(r,e),(r.matches("[data-personal-panel]")||r.querySelector("[data-detail-action]"))&&te(r,e)}async function Z(e=document,t){try{let r=[...e.querySelectorAll("[data-entity-id]")];if(!r.length)return new Map(t?.recordsById);let n=t??j(await P.getAll()),a=V(n,k.values());for(let i of r){let s=i.dataset.entityId;if(!s)continue;let l=q(a,s,h(i));ee(i,l),(i.matches("[data-personal-panel]")||i.querySelector("[data-detail-action]"))&&te(i,l)}return new Map(a.recordsById)}catch(r){return console.error(r),u("Personal state could not be opened in this browser.",{error:!0,duration:6e3}),new Map}}async function xe(e){let t=v(e),r=t?.dataset.entityId;if(!t||!r)return null;let n=h(t),a=await P.get(r,n);if(e.dataset.personalAction==="favourite"){let i=!a.favourite.value,s=await p(l=>l.setFavourite(r,i,n),"quick-action");return u(i?"Added to favourites.":"Removed from favourites."),s}if(e.dataset.personalAction==="visited"){let i=!a.visited.value,s=await p(l=>l.setVisited(r,i,i?Y():null,n),"quick-action");return u(i?"Marked visited.":"Marked unvisited. Visit dates were retained."),s}return null}async function Ae(e){let t=v(e),r=t?.dataset.entityId;if(!t||!r)return;let n=h(t),a=await P.get(r,n);if(e.dataset.detailAction==="favourite"){let i=!a.favourite.value;await p(s=>s.setFavourite(r,i,n),"detail"),u(i?"Added to favourites.":"Removed from favourites.")}else if(e.dataset.detailAction==="visited"){let i=!a.visited.value,s=i?t.querySelector("[data-visit-date]")?.value||Y():null;await p(l=>l.setVisited(r,i,s,n),"detail"),u(i?"Visit saved.":"Marked unvisited. Existing visit dates were retained.")}}async function re(e,t=!0){let r=v(e),n=r?.dataset.entityId;if(!r||!n)return;let a=r.querySelector("[data-notes-status]");try{a&&(a.textContent="Saving\u2026");let i=await p(s=>s.setNotes(n,e.value,h(r)),"notes");delete e.dataset.dirty,a&&(a.textContent=`Saved ${new Date(i.notes.updatedAt).toLocaleString()}`),t&&u("Private note saved.")}catch(i){console.error(i);let s=I(i,"Could not save private note.");a&&(a.textContent=s),u(s,{error:!0})}}async function Pe(e){let t=e.target instanceof Element?e.target:null;if(!t)return;let r=t.closest("[data-personal-action]");if(r){e.preventDefault(),r.disabled=!0;try{await xe(r)}catch(o){console.error(o),u(I(o,"Could not update personal state."),{error:!0})}finally{r.disabled=!1}return}let n=t.closest("[data-detail-action]");if(n){n.disabled=!0;try{await Ae(n)}catch(o){console.error(o),u(I(o,"Could not update personal state."),{error:!0})}finally{n.disabled=!1}return}let a=t.closest("[data-rating-value]");if(a){let o=v(a),c=o?.dataset.entityId;if(!o||!c)return;try{await p(d=>d.setPersonalRating(c,Number(a.dataset.ratingValue),h(o)),"rating"),u(`Personal rating set to ${a.dataset.ratingValue}/5.`)}catch(d){console.error(d),u(I(d,"Could not update personal rating."),{error:!0})}return}let i=t.closest("[data-clear-rating]");if(i){let o=v(i),c=o?.dataset.entityId;if(!o||!c)return;await p(d=>d.setPersonalRating(c,null,h(o)),"rating"),u("Personal rating cleared.");return}let s=t.closest("[data-save-notes]");if(s){let o=v(s)?.querySelector("[data-personal-notes]");o&&await re(o);return}let l=t.closest("[data-add-visit-date]");if(l){let o=v(l),c=o?.querySelector("[data-visit-date]"),d=o?.dataset.entityId;if(!o||!d||!c?.value){u("Choose a visit date first.",{error:!0});return}await p(S=>S.setVisited(d,!0,c.value,h(o)),"visit-date"),u("Visit date added.")}}function Ee(e){let r=(e.target instanceof Element?e.target:null)?.closest("[data-personal-notes]");if(!r)return;r.dataset.dirty="true";let a=v(r)?.querySelector("[data-notes-status]");a&&(a.textContent=`${r.value.length.toLocaleString()} / 50,000 characters \xB7 unsaved`);let i=W.get(r);i&&clearTimeout(i),W.set(r,setTimeout(()=>{re(r,!1)},850))}O.addEventListener("change",e=>{let t=e.detail,r=w(k.get(t.record.entityId),t.record);k.set(r.entityId,r),be(r)});document.addEventListener("click",e=>{Pe(e)});document.addEventListener("input",Ee);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Z()},{once:!0}):Z();})();
