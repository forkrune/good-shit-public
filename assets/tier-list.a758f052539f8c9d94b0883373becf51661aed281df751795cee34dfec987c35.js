(()=>{var z=String.raw`
.tier-list-shell {
  width: min(1540px, calc(100% - 2rem));
  margin-inline: auto;
  padding-block: clamp(2rem, 5vw, 5rem);
}

.tier-list-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: clamp(1rem, 3vw, 2.5rem);
  align-items: stretch;
  margin-bottom: clamp(1.5rem, 4vw, 3rem);
}

.tier-list-hero-copy,
.tier-list-hero-stat {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 62%, transparent);
  background: color-mix(in srgb, var(--md-sys-color-surface-container-low) 92%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-list-hero-copy {
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border-radius: 54px 24px 54px 24px;
}

.tier-list-hero-copy::after {
  content: "";
  position: absolute;
  z-index: -1;
  width: 18rem;
  aspect-ratio: 1;
  right: -6rem;
  bottom: -8rem;
  border-radius: 42% 58% 64% 36% / 52% 38% 62% 48%;
  background: color-mix(in srgb, var(--md-sys-color-primary-container) 74%, transparent);
  rotate: 16deg;
}

.tier-list-hero-copy h1 {
  max-width: 12ch;
  margin-top: .25rem;
  font-size: clamp(2.8rem, 7vw, 6.2rem);
  line-height: .92;
}

.tier-list-hero-copy p {
  max-width: 64ch;
  margin-top: 1rem;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.05rem;
}

.tier-list-hero-stat {
  display: grid;
  align-content: center;
  gap: .75rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: 24px 54px 24px 54px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--md-sys-color-secondary-container) 78%, transparent), color-mix(in srgb, var(--md-sys-color-surface-container) 90%, transparent));
}

.tier-list-hero-stat strong {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: .9;
}

.tier-list-hero-stat span {
  max-width: 24ch;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 700;
}

.tier-list-controls {
  display: grid;
  grid-template-columns: minmax(220px, 1.8fr) repeat(3, minmax(150px, .8fr)) auto;
  gap: .75rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 66%, transparent);
  border-radius: 30px 16px 30px 16px;
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 94%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-list-controls label {
  display: grid;
  gap: .35rem;
  min-width: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--text-label);
  font-weight: 800;
  letter-spacing: .02em;
}

.tier-list-controls input,
.tier-list-controls select {
  width: 100%;
  min-height: 3.25rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 18px;
  padding: .75rem .9rem;
  background: var(--md-sys-color-surface-container-lowest);
}

.tier-list-controls .tier-export-button {
  min-height: 3.25rem;
  white-space: nowrap;
}

.tier-list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem 1rem;
  align-items: center;
  justify-content: space-between;
  margin: .75rem .25rem 1.25rem;
  color: var(--md-sys-color-on-surface-variant);
}

.tier-list-meta strong {
  color: var(--md-sys-color-on-surface);
}

.tier-board {
  display: grid;
  gap: .8rem;
}

.tier-board-row {
  --tier-accent: var(--md-sys-color-primary);
  --tier-container: var(--md-sys-color-primary-container);
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 164px;
  overflow: clip;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent);
  border-radius: 44px 18px 44px 18px;
  background: color-mix(in srgb, var(--md-sys-color-surface-container-low) 94%, transparent);
  box-shadow: var(--elevation-1);
}

.tier-board-row:nth-child(even) {
  border-radius: 18px 44px 18px 44px;
}

.tier-board-row[data-tier="S"] { --tier-accent: #b9344c; --tier-container: #ffd9df; }
.tier-board-row[data-tier="A"] { --tier-accent: #a55200; --tier-container: #ffdcc1; }
.tier-board-row[data-tier="B"] { --tier-accent: #756400; --tier-container: #f9e87c; }
.tier-board-row[data-tier="C"] { --tier-accent: #146c38; --tier-container: #b8f2c6; }
.tier-board-row[data-tier="D"] { --tier-accent: #245d9e; --tier-container: #d5e6ff; }
.tier-board-row[data-tier="E"] { --tier-accent: #5847a4; --tier-container: #e5deff; }
.tier-board-row[data-tier="F"] { --tier-accent: #8c3b86; --tier-container: #ffd7f7; }

.tier-rank {
  display: grid;
  place-items: center;
  align-content: center;
  gap: .2rem;
  padding: 1rem .5rem;
  background: var(--tier-container);
  color: color-mix(in srgb, var(--tier-accent) 88%, #111 12%);
}

.tier-rank strong {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  line-height: .9;
}

.tier-rank span {
  max-width: 9ch;
  text-align: center;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.tier-row-content {
  display: grid;
  gap: .75rem;
  min-width: 0;
  padding: 1rem;
}

.tier-row-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-inline: .2rem;
}

.tier-row-heading h2 {
  font-size: 1.05rem;
}

.tier-row-heading span {
  color: var(--md-sys-color-on-surface-variant);
  font-size: .82rem;
  font-weight: 800;
}

.tier-board-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: .7rem;
  align-content: start;
}

.tier-place-card {
  position: relative;
  display: grid;
  grid-template-rows: 92px auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 55%, transparent);
  border-radius: 26px 12px 26px 12px;
  background: var(--md-sys-color-surface-container-lowest);
  color: var(--md-sys-color-on-surface);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--md-sys-color-scrim) 10%, transparent);
  text-decoration: none;
  transition:
    transform var(--duration-short) var(--motion-emphasized),
    border-radius var(--duration-medium) var(--motion-emphasized),
    box-shadow var(--duration-short) var(--motion-standard);
}

.tier-place-card:nth-child(3n + 2) {
  border-radius: 12px 26px 12px 26px;
}

.tier-place-card:hover {
  z-index: 2;
  transform: translateY(-3px) rotate(-.25deg);
  border-radius: 14px 30px 14px 30px;
  box-shadow: var(--elevation-2);
  text-decoration: none;
}

.tier-place-media {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--tier-container) 86%, white 14%) 0 22%, transparent 23%),
    linear-gradient(145deg, var(--tier-container), color-mix(in srgb, var(--tier-container) 55%, var(--md-sys-color-surface-container-high)));
}

.tier-place-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale var(--duration-medium) var(--motion-standard);
}

.tier-place-card:hover .tier-place-media img {
  scale: 1.045;
}

.tier-place-fallback {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--tier-accent);
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 900;
}

.tier-place-copy {
  display: grid;
  gap: .22rem;
  align-content: start;
  padding: .72rem .78rem .82rem;
}

.tier-place-copy strong {
  overflow: hidden;
  font-size: .9rem;
  line-height: 1.18;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-place-copy span {
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: .74rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tier-board-empty {
  display: grid;
  min-height: 86px;
  place-items: center;
  border: 1px dashed color-mix(in srgb, var(--tier-accent) 42%, var(--md-sys-color-outline-variant));
  border-radius: 22px 10px 22px 10px;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

.tier-board-row.is-below-bar {
  min-height: 112px;
  opacity: .82;
}

.tier-board-row.is-below-bar .tier-row-content {
  align-content: center;
}

.tier-board-row.is-below-bar .tier-board-empty {
  min-height: 64px;
}

.tier-list-loading {
  display: grid;
  min-height: 280px;
  place-items: center;
  border-radius: 40px 18px 40px 18px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 800;
}

.tier-list-error {
  margin-top: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 22px;
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

@media (prefers-color-scheme: dark) {
  .tier-board-row[data-tier="S"] { --tier-accent: #ffb0bd; --tier-container: #6f2638; }
  .tier-board-row[data-tier="A"] { --tier-accent: #ffb874; --tier-container: #6a3600; }
  .tier-board-row[data-tier="B"] { --tier-accent: #eadb68; --tier-container: #514700; }
  .tier-board-row[data-tier="C"] { --tier-accent: #8fdda3; --tier-container: #174d29; }
  .tier-board-row[data-tier="D"] { --tier-accent: #a9c9ff; --tier-container: #214873; }
  .tier-board-row[data-tier="E"] { --tier-accent: #c9bdff; --tier-container: #41347c; }
  .tier-board-row[data-tier="F"] { --tier-accent: #f1a7e8; --tier-container: #62305f; }
  .tier-rank { color: var(--tier-accent); }
}

@media (max-width: 1120px) {
  .tier-list-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tier-list-controls .tier-export-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .tier-list-shell {
    width: min(100% - 1rem, 1540px);
    padding-top: 1rem;
  }
  .tier-list-hero {
    grid-template-columns: 1fr;
  }
  .tier-list-hero-copy,
  .tier-list-hero-stat {
    border-radius: 34px 16px 34px 16px;
  }
  .tier-list-hero-stat {
    grid-template-columns: auto 1fr;
    align-items: center;
  }
  .tier-list-hero-stat strong {
    font-size: 3.4rem;
  }
  .tier-list-controls {
    grid-template-columns: 1fr;
    padding: .8rem;
    border-radius: 24px 12px 24px 12px;
  }
  .tier-list-controls .tier-export-button {
    grid-column: auto;
  }
  .tier-board-row,
  .tier-board-row:nth-child(even) {
    grid-template-columns: 1fr;
    border-radius: 30px 14px 30px 14px;
  }
  .tier-rank {
    grid-template-columns: auto 1fr;
    justify-content: start;
    min-height: 76px;
    padding: .8rem 1rem;
  }
  .tier-rank strong {
    font-size: 2.8rem;
  }
  .tier-rank span {
    max-width: none;
    text-align: left;
  }
  .tier-board-items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .tier-board-items {
    grid-template-columns: 1fr;
  }
  .tier-place-card {
    grid-template-columns: 92px minmax(0, 1fr);
    grid-template-rows: minmax(92px, auto);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tier-place-card,
  .tier-place-media img {
    transition: none;
  }
  .tier-place-card:hover {
    transform: none;
  }
}
`;var re=new Set(["ideal","good"]),ne=[{id:"infant",minAge:0,maxAge:1},{id:"toddler",minAge:2,maxAge:3},{id:"preschool",minAge:4,maxAge:5},{id:"younger-child",minAge:6,maxAge:9},{id:"older-child",minAge:10,maxAge:12},{id:"teen",minAge:13,maxAge:17},{id:"adult",minAge:18,maxAge:null}];function q(e){return Array.isArray(e)?[...new Set(e.map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]:[...new Set(String(e??"").split(/[;,\s]+/).filter(Boolean).map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]}function ie(e){if(!Number.isInteger(e)||e<0)throw new RangeError("age must be a non-negative integer");return ne.find(t=>t.maxAge==null?e>=t.minAge:e>=t.minAge&&e<=t.maxAge)?.id??"adult"}function oe(e,t){if(!e||!Number.isInteger(t)||t<0)return"unknown";for(let r of e.hardRestrictions??[])if(r.type==="minAge"&&t<r.value||r.type==="maxAge"&&t>r.value)return"unsuitable";return e.statusByBand?.[ie(t)]??"unknown"}function N(e,t){let r=q(t);return r.length?r.every(i=>re.has(oe(e,i))):!0}function U(e,t){return e instanceof Error?e.message:e==null?t:String(e)}function D(e,t){return`${String(e||"/").replace(/\/+$/,"/")}${String(t??"").replace(/^\/+/,"")}`}var I=Object.freeze(["S","A","B","C","D","E","F"]),k=Object.freeze(["S","A","B","C"]),V=Object.freeze({S:{label:"Exceptional",exportColor:"#ffd9df",exportAccent:"#9e2d43"},A:{label:"Excellent",exportColor:"#ffdcc1",exportAccent:"#955000"},B:{label:"Very good",exportColor:"#f9e87c",exportAccent:"#665700"},C:{label:"Good",exportColor:"#b8f2c6",exportAccent:"#0f6330"},D:{label:"Mediocre",exportColor:"#d5e6ff",exportAccent:"#23578f"},E:{label:"Poor",exportColor:"#e5deff",exportAccent:"#524398"},F:{label:"Avoid",exportColor:"#ffd7f7",exportAccent:"#81377c"}});function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function R(e){return String(e??"").replaceAll("-"," ").replace(/\b\w/g,t=>t.toUpperCase())}function X(e){return String(e??"").trim().toLocaleLowerCase()}function G(e,t={}){let r=X(t.query),i=q(t.childAges);return e.filter(o=>{if(!k.includes(o.tier)||t.country&&o.location?.countryCode!==t.country||t.entityType&&o.entityType!==t.entityType||t.category&&!(o.categories??[]).includes(t.category)||i.length&&!N(o.audience,i))return!1;if(!r)return!0;let s=[o.names?.canonical,o.names?.local,o.location?.locality,o.location?.region,o.location?.country,o.entityType,...o.categories??[],...o.tags??[]].filter(Boolean).join(" ").toLocaleLowerCase();return r.split(/\s+/).every(a=>s.includes(a))})}function ae(e){return Object.fromEntries(I.map(t=>[t,e.filter(r=>r.tier===t).length]))}function se(e={}){let t=["good-shit-tier-list"];e.country&&t.push(String(e.country).toLowerCase()),e.entityType&&t.push(e.entityType),e.category&&t.push(e.category);let r=q(e.childAges);return r.length&&t.push(`ages-${r.join("-")}`),e.query&&t.push(X(e.query).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,32)),`${t.filter(Boolean).join("-")}.png`}function H(e,t,r){return r?{kind:e,key:t,...r}:null}function le(e,t={}){let r=e?.shards?.byCountry??{},i=e?.shards?.byType??{},o=t.country||"",s=t.entityType||"";return o&&s?[H("country",o,r[o]),H("type",s,i[s])].filter(a=>!!a).sort((a,l)=>(a.count??1/0)-(l.count??1/0)||a.kind.localeCompare(l.kind)).slice(0,1):o?[H("country",o,r[o])].filter(a=>!!a):s?[H("type",s,i[s])].filter(a=>!!a):Object.entries(r).map(([a,l])=>H("country",a,l)).filter(a=>!!a).sort((a,l)=>(l.count??0)-(a.count??0)||a.key.localeCompare(l.key))}function ce(){try{return JSON.parse(document.querySelector("#page-config")?.textContent??"{}")}catch{return{}}}function de(){if(document.querySelector("#tier-list-expressive-styles"))return;let e=document.createElement("style");e.id="tier-list-expressive-styles",e.textContent=z,document.head.append(e)}async function Y(e){let t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Could not load ${e} (${t.status}).`);return t.json()}function K(e,t=420){let r=e.coverImage?.variants;if(!r?.length)return null;let i=[...r].sort((o,s)=>o.width-s.width);return i.find(o=>o.width>=t)??i.at(-1)??null}function ue(e){let t=[e.location?.locality,e.location?.region,e.location?.country].filter(Boolean);return t.filter((r,i)=>i===0||r!==t[i-1]).join(" \xB7 ")}function pe(e,t){let r=K(e),i=u(e.names?.canonical?.trim()?.[0]?.toLocaleUpperCase()??"\u2022"),o=r?`<img src="${u(D(t,r.path??r.url))}" width="${u(r.width)}" height="${u(r.height)}" alt="${u(e.coverImage?.alt??e.names?.canonical??"")}" loading="lazy" decoding="async">`:`<span class="tier-place-fallback" aria-hidden="true">${i}</span>`;return`<a class="tier-place-card" href="${u(`${t}places/${e.slug}/`)}" data-tier-place="${u(e.id)}">
    <span class="tier-place-media">${o}</span>
    <span class="tier-place-copy"><strong>${u(e.names?.canonical)}</strong><span>${u(ue(e))}</span></span>
  </a>`}function me(e,t,r){let i=V[e],o=k.includes(e),s=t.filter(l=>l.tier===e),a=o?"No published places match the current filters.":"Below the publication bar \xB7 unpublished D\u2013F records are intentionally not exposed here.";return`<section class="tier-board-row${o?"":" is-below-bar"}" data-tier="${e}" aria-labelledby="tier-heading-${e.toLowerCase()}">
    <div class="tier-rank"><strong aria-hidden="true">${e}</strong><span>${u(i.label)}</span></div>
    <div class="tier-row-content">
      <div class="tier-row-heading"><h2 id="tier-heading-${e.toLowerCase()}">${e} \xB7 ${u(i.label)}</h2><span>${o?`${s.length} published`:"not public"}</span></div>
      ${s.length?`<div class="tier-board-items">${s.map(l=>pe(l,r)).join("")}</div>`:`<div class="tier-board-empty">${u(a)}</div>`}
    </div>
  </section>`}function B(e,t){return(e??[]).map(r=>`<option value="${u(r.value)}"${r.value===t?" selected":""}>${u(R(r.label))} (${r.count})</option>`).join("")}function ge(){let e=new URLSearchParams(window.location.search);return{query:e.get("q")??"",country:e.get("country")??"",entityType:e.get("type")??"",category:e.get("category")??"",childAges:e.get("ages")??""}}function fe(e){let t=new URLSearchParams(window.location.search),r=[["q",e.query],["country",e.country],["type",e.entityType],["category",e.category],["ages",e.childAges]];for(let[o,s]of r)s?t.set(o,s):t.delete(o);let i=t.toString();history.replaceState(null,"",`${window.location.pathname}${i?`?${i}`:""}${window.location.hash}`)}function he(e,t,r,i){e.className="tier-list-shell",e.removeAttribute("aria-busy"),e.innerHTML=`<header class="tier-list-hero">
    <div class="tier-list-hero-copy"><span class="eyebrow">Compiled once \xB7 streamed by filter</span><h1>The whole catalogue, ranked.</h1><p>The canonical catalogue stays untouched. During publishing, Good Shit compiles a small tier-list projection into country and type shards. Filters choose the smallest relevant shard and the board is generated in the browser as that data arrives.</p></div>
    <div class="tier-list-hero-stat"><strong>${t.entityCount}</strong><span>published places available to the compiled tier-list index</span></div>
  </header>
  <section class="tier-list-controls" aria-label="Tier list filters">
    <label>Find a place<input id="tier-query" type="search" value="${u(i.query)}" placeholder="Name, city, category\u2026" autocomplete="off"></label>
    <label>Country<select id="tier-country"><option value="">Everywhere</option>${B(t.facets?.countries,i.country)}</select></label>
    <label>Type<select id="tier-type"><option value="">Every type</option>${B(t.facets?.entityTypes,i.entityType)}</select></label>
    <label>Category<select id="tier-category"><option value="">Every category</option>${B(t.facets?.categories,i.category)}</select></label>
    <label>Children\u2019s ages<input id="tier-child-ages" type="text" inputmode="numeric" autocomplete="off" value="${u(i.childAges)}" placeholder="e.g. 4, 8" title="Every entered child must be a good fit; unknown suitability is excluded."></label>
    <button id="tier-export" class="filled-button tier-export-button" type="button" disabled>Download PNG</button>
  </section>
  <div class="tier-list-meta"><span id="tier-visible-count" aria-live="polite"></span><span id="tier-stream-status" aria-live="polite">Choosing compiled shards\u2026</span><button id="tier-retry" class="outlined-button" type="button" hidden>Retry loading</button></div>
  <div id="tier-board" class="tier-board"></div>
  <p class="muted">D / E / F remain structural rows only. Unpublished records never enter the compiled tier-list projection. <a href="${u(`${r}tiers/`)}">Static tier pages</a></p>`}function ye(e){return{query:e.querySelector("#tier-query")?.value.trim()??"",country:e.querySelector("#tier-country")?.value??"",entityType:e.querySelector("#tier-type")?.value??"",category:e.querySelector("#tier-category")?.value??"",childAges:e.querySelector("#tier-child-ages")?.value.trim()??""}}function J(e){let t=new Map;for(let r of e)t.set(String(r.id),r);return[...t.values()]}function be(e){let t=new Map(I.map((r,i)=>[r,i]));return[...e].sort((r,i)=>(t.get(r.tier)??99)-(t.get(i.tier)??99)||r.names.canonical.localeCompare(i.names.canonical)||r.id.localeCompare(i.id))}function F(e,t,r,i=null){let o=be(t),s=ae(o),a=e.querySelector("#tier-board");a&&(a.innerHTML=I.map(p=>me(p,o,r)).join(""));let l=e.querySelector("#tier-visible-count");l&&(l.innerHTML=`<strong>${o.length}</strong> ${o.length===1?"place":"places"} visible \xB7 ${k.map(p=>`${p} ${s[p]}`).join(" \xB7 ")}`);let d=e.querySelector("#tier-stream-status");return d&&i&&(d.textContent=i),o}function W(e,t=!1){let r=document.querySelector("#app-status");r&&(r.textContent=e,r.classList.toggle("is-error",t),r.classList.add("is-visible"),window.setTimeout(()=>r.classList.remove("is-visible"),t?5e3:2800))}function P(e,t,r,i,o,s){let a=Math.min(s,i/2,o/2);e.beginPath(),e.moveTo(t+a,r),e.arcTo(t+i,r,t+i,r+o,a),e.arcTo(t+i,r+o,t,r+o,a),e.arcTo(t,r+o,t,r,a),e.arcTo(t,r,t+i,r,a),e.closePath()}function xe(e,t,r,i,o,s){let a=Math.max(o/t.naturalWidth,s/t.naturalHeight),l=o/a,d=s/a,p=(t.naturalWidth-l)/2,S=(t.naturalHeight-d)/2;e.drawImage(t,p,S,l,d,r,i,o,s)}function we(e,t,r,i=2){let o=String(t??"").split(/\s+/).filter(Boolean),s=[],a="";for(let l of o){let d=a?`${a} ${l}`:l;if(e.measureText(d).width<=r||!a)a=d;else if(s.push(a),a=l,s.length===i-1)break}if(a&&s.length<i&&s.push(a),o.join(" ")!==s.join(" ")&&s.length){let l=s.length-1;for(;s[l]&&e.measureText(`${s[l]}\u2026`).width>r;)s[l]=s[l].slice(0,-1);s[l]=`${s[l]}\u2026`}return s}async function ve(e){return e?new Promise(t=>{let r=new Image,i=window.setTimeout(()=>t(null),8e3);r.onload=()=>{window.clearTimeout(i),t(r)},r.onerror=()=>{window.clearTimeout(i),t(null)},r.src=e}):null}async function Te(e,t="/"){let r=e.map(a=>{let l=K(a,360);return[String(a.id),D(t,l?.path??l?.url)]}),i=new Map,o=0;async function s(){for(;o<r.length;){let a=o++,[l,d]=r[a];i.set(l,await ve(d))}}return await Promise.all(Array.from({length:Math.min(8,r.length||1)},()=>s())),i}function Ae(e,t){let r=[];return e.country&&r.push(e.country),e.entityType&&r.push(R(e.entityType)),e.category&&r.push(R(e.category)),e.query&&r.push(`\u201C${e.query}\u201D`),`${t} published place${t===1?"":"s"}${r.length?` \xB7 ${r.join(" \xB7 ")}`:" \xB7 all public catalogue entries"}`}async function Se(e,t,r="/"){let h=Math.floor(204),w=154,v=92,x=[],y=172;for(let c of I){let f=e.filter(M=>M.tier===c),E=k.includes(c)?Math.max(1,Math.ceil(f.length/6)):1,$=k.includes(c)?Math.max(154,54+E*(w+14)+20):112;x.push({tier:c,items:f,y,rowHeight:$}),y+=$+18}if(y+=86,y>12e3)throw new Error("This filtered tier list is too tall to export in one browser image. Narrow the filters first.");let T=document.createElement("canvas");T.width=1600,T.height=y;let n=T.getContext("2d");if(!n)throw new Error("Canvas export is unavailable in this browser.");let m=await Te(e,r);n.fillStyle="#fff9ff",n.fillRect(0,0,1600,y),n.fillStyle="#1d1a20",n.font="900 64px system-ui, sans-serif",n.fillText("GOOD SHIT \xB7 TIER LIST",64,78),n.fillStyle="#49454e",n.font="600 24px system-ui, sans-serif",n.fillText(Ae(t,e.length),64,120),n.font="500 18px system-ui, sans-serif",n.fillText("Generated automatically from compiled published tiers \xB7 D\u2013F remain private/unpublished",64,151);for(let c of x){let f=V[c.tier];P(n,64,c.y,1472,c.rowHeight,34),n.fillStyle="#f3ecf5",n.fill(),P(n,64,c.y,150,c.rowHeight,34),n.fillStyle=f.exportColor,n.fill(),n.fillStyle=f.exportAccent,n.font="900 72px system-ui, sans-serif",n.textAlign="center",n.fillText(c.tier,64+150/2,c.y+Math.min(88,c.rowHeight/2+24)),n.font="800 16px system-ui, sans-serif",n.fillText(f.label.toUpperCase(),64+150/2,c.y+Math.min(116,c.rowHeight/2+52)),n.textAlign="left";let E=242;if(!k.includes(c.tier)){n.fillStyle="#6f6873",n.font="700 22px system-ui, sans-serif",n.fillText("Below publication bar \xB7 intentionally not exposed",E,c.y+c.rowHeight/2+7);continue}if(!c.items.length){n.fillStyle="#6f6873",n.font="700 22px system-ui, sans-serif",n.fillText("No published places match this filter.",E,c.y+c.rowHeight/2+7);continue}for(let[$,M]of c.items.entries()){let Q=$%6,Z=Math.floor($/6),C=E+Q*(h+14),L=c.y+46+Z*(w+14);P(n,C,L,h,w,20),n.save(),n.clip();let O=m.get(String(M.id));O?xe(n,O,C,L,h,v):(n.fillStyle=f.exportColor,n.fillRect(C,L,h,v),n.fillStyle=f.exportAccent,n.font="900 42px system-ui, sans-serif",n.textAlign="center",n.fillText(M.names?.canonical?.trim()?.[0]?.toUpperCase()??"\u2022",C+h/2,L+60),n.textAlign="left"),n.fillStyle="#ffffff",n.fillRect(C,L+v,h,w-v),n.fillStyle="#1d1a20",n.font="800 16px system-ui, sans-serif",we(n,M.names?.canonical,h-20,2).forEach((ee,te)=>n.fillText(ee,C+10,L+v+22+te*18)),n.restore()}}n.fillStyle="#6f6873",n.font="600 18px system-ui, sans-serif",n.fillText("good-shit \xB7 editorial tier is curated judgement, not an external review average",64,y-36);let g=await new Promise(c=>T.toBlob(c,"image/png"));if(!g)throw new Error("Could not encode the tier list image.");let A=URL.createObjectURL(g),b=document.createElement("a");b.href=A,b.download=se(t),document.body.append(b),b.click(),b.remove(),window.setTimeout(()=>URL.revokeObjectURL(A),1e3)}var j=new Map;async function Ee(e,t="/"){let r=e?.path?D(t,e.path):e?.url;return r?(j.has(r)||j.set(r,Y(r).then(i=>i.documents??[]).catch(i=>{throw j.delete(r),i})),j.get(r)):[]}async function _(){let e=document.querySelector("[data-tier-list-root]");if(!e)return!1;de();let t=ce(),r=String(t.basePath||"/").replace(/\/+$/,"/"),i=t.tierListManifestUrl;if(!i)return!1;let o=e.innerHTML;try{let s=await Y(i),a=ge();he(e,s,r,a);let l=[],d=0,p=null,S=!1,h=!1,w=!1,v=e.querySelector("#tier-export"),x=e.querySelector("#tier-retry"),y=()=>{v&&(v.disabled=S||w||!h)},T=async()=>{let n=++d,m=ye(e);a=m,fe(m);let g=le(s,m);S=!0,h=!1,e.setAttribute("aria-busy","true"),y(),x&&(x.hidden=!0,x.disabled=!0);let A=[];l=F(e,[],r,g.length?`Loading 0 / ${g.length} compiled shard${g.length===1?"":"s"}\u2026`:"No compiled shard matches this filter.");try{for(let[c,f]of g.entries()){let E=await Ee(f,r);if(n!==d)return;A.push(...E),l=G(J(A),m);let $=f.kind==="country"?`country ${f.key}`:`type ${R(f.key)}`;F(e,l,r,`Loaded ${c+1} / ${g.length} \xB7 ${$}`)}if(n!==d)return;l=G(J(A),m);let b=g.length===1?`${g[0].kind} shard`:`${g.length} country shards`;F(e,l,r,g.length?`Ready \xB7 ${b} \xB7 ${l.length} matches`:"Ready \xB7 0 matches"),h=!0}catch(b){if(n!==d)return;console.error(b);let c=e.querySelector("#tier-stream-status");c&&(c.textContent=`Loading failed \xB7 ${l.length} ${l.length===1?"place":"places"} loaded; results are incomplete. Retry loading or use the static tier pages. ${U(b,"Could not load the tier list.")}`),x&&(x.hidden=!1)}finally{n===d&&(S=!1,e.removeAttribute("aria-busy"),x&&(x.disabled=!1),y())}};return e.addEventListener("input",n=>{(n.target instanceof Element?n.target:null)?.matches("#tier-query, #tier-child-ages")&&(p!==null&&window.clearTimeout(p),p=window.setTimeout(()=>{T()},140))}),e.addEventListener("change",n=>{(n.target instanceof Element?n.target:null)?.matches("#tier-country, #tier-type, #tier-category")&&(p!==null&&window.clearTimeout(p),T())}),x?.addEventListener("click",()=>{p!==null&&window.clearTimeout(p),T()}),v?.addEventListener("click",async n=>{let m=n.currentTarget instanceof HTMLButtonElement?n.currentTarget:null;if(!m||S||w||!h)return;let g=l,A={...a};w=!0,y();let b=m.textContent;m.textContent="Rendering PNG\u2026";try{document.fonts?.ready&&await document.fonts.ready,await Se(g,A,r),W("Tier list PNG downloaded.")}catch(c){console.error(c),W(U(c,"Could not export the tier list."),!0)}finally{w=!1,y(),m.textContent=b}}),await T(),!0}catch(s){return console.error(s),e.className="page-shell",e.innerHTML=`${o}<div class="tier-list-error" role="alert">The generated tier list could not load. The static tier pages remain available.</div>`,e.removeAttribute("aria-busy"),!1}}typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{_()},{once:!0}):_());})();
