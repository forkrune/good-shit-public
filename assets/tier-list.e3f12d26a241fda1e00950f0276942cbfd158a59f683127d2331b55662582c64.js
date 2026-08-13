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
`;var te=new Set(["ideal","good"]),re=[{id:"infant",minAge:0,maxAge:1},{id:"toddler",minAge:2,maxAge:3},{id:"preschool",minAge:4,maxAge:5},{id:"younger-child",minAge:6,maxAge:9},{id:"older-child",minAge:10,maxAge:12},{id:"teen",minAge:13,maxAge:17},{id:"adult",minAge:18,maxAge:null}];function M(e){return Array.isArray(e)?[...new Set(e.map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]:[...new Set(String(e??"").split(/[;,\s]+/).filter(Boolean).map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]}function ne(e){if(!Number.isInteger(e)||e<0)throw new RangeError("age must be a non-negative integer");return re.find(t=>t.maxAge==null?e>=t.minAge:e>=t.minAge&&e<=t.maxAge)?.id??"adult"}function ie(e,t){if(!e||!Number.isInteger(t)||t<0)return"unknown";for(let r of e.hardRestrictions??[])if(r.type==="minAge"&&t<r.value||r.type==="maxAge"&&t>r.value)return"unsuitable";return e.statusByBand?.[ne(t)]??"unknown"}function N(e,t){let r=M(t);return r.length?r.every(n=>te.has(ie(e,n))):!0}function oe(e,t){return e instanceof Error?e.message:e==null?t:String(e)}function P(e,t){return`${String(e||"/").replace(/\/+$/,"/")}${String(t??"").replace(/^\/+/,"")}`}var j=Object.freeze(["S","A","B","C","D","E","F"]),A=Object.freeze(["S","A","B","C"]),_=Object.freeze({S:{label:"Exceptional",exportColor:"#ffd9df",exportAccent:"#9e2d43"},A:{label:"Excellent",exportColor:"#ffdcc1",exportAccent:"#955000"},B:{label:"Very good",exportColor:"#f9e87c",exportAccent:"#665700"},C:{label:"Good",exportColor:"#b8f2c6",exportAccent:"#0f6330"},D:{label:"Mediocre",exportColor:"#d5e6ff",exportAccent:"#23578f"},E:{label:"Poor",exportColor:"#e5deff",exportAccent:"#524398"},F:{label:"Avoid",exportColor:"#ffd7f7",exportAccent:"#81377c"}});function p(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function q(e){return String(e??"").replaceAll("-"," ").replace(/\b\w/g,t=>t.toUpperCase())}function V(e){return String(e??"").trim().toLocaleLowerCase()}function U(e,t={}){let r=V(t.query),n=M(t.childAges);return e.filter(i=>{if(!A.includes(i.tier)||t.country&&i.location?.countryCode!==t.country||t.entityType&&i.entityType!==t.entityType||t.category&&!(i.categories??[]).includes(t.category)||n.length&&!N(i.audience,n))return!1;if(!r)return!0;let s=[i.names?.canonical,i.names?.local,i.location?.locality,i.location?.region,i.location?.country,i.entityType,...i.categories??[],...i.tags??[]].filter(Boolean).join(" ").toLocaleLowerCase();return r.split(/\s+/).every(a=>s.includes(a))})}function ae(e){return Object.fromEntries(j.map(t=>[t,e.filter(r=>r.tier===t).length]))}function se(e={}){let t=["good-shit-tier-list"];e.country&&t.push(String(e.country).toLowerCase()),e.entityType&&t.push(e.entityType),e.category&&t.push(e.category);let r=M(e.childAges);return r.length&&t.push(`ages-${r.join("-")}`),e.query&&t.push(V(e.query).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,32)),`${t.filter(Boolean).join("-")}.png`}function L(e,t,r){return r?{kind:e,key:t,...r}:null}function le(e,t={}){let r=e?.shards?.byCountry??{},n=e?.shards?.byType??{},i=t.country||"",s=t.entityType||"";return i&&s?[L("country",i,r[i]),L("type",s,n[s])].filter(a=>!!a).sort((a,l)=>(a.count??1/0)-(l.count??1/0)||a.kind.localeCompare(l.kind)).slice(0,1):i?[L("country",i,r[i])].filter(a=>!!a):s?[L("type",s,n[s])].filter(a=>!!a):Object.entries(r).map(([a,l])=>L("country",a,l)).filter(a=>!!a).sort((a,l)=>(l.count??0)-(a.count??0)||a.key.localeCompare(l.key))}function ce(){try{return JSON.parse(document.querySelector("#page-config")?.textContent??"{}")}catch{return{}}}function de(){if(document.querySelector("#tier-list-expressive-styles"))return;let e=document.createElement("style");e.id="tier-list-expressive-styles",e.textContent=z,document.head.append(e)}async function X(e){let t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Could not load ${e} (${t.status}).`);return t.json()}function Y(e,t=420){let r=e.coverImage?.variants;if(!r?.length)return null;let n=[...r].sort((i,s)=>i.width-s.width);return n.find(i=>i.width>=t)??n.at(-1)??null}function ue(e){let t=[e.location?.locality,e.location?.region,e.location?.country].filter(Boolean);return t.filter((r,n)=>n===0||r!==t[n-1]).join(" \xB7 ")}function pe(e,t){let r=Y(e),n=p(e.names?.canonical?.trim()?.[0]?.toLocaleUpperCase()??"\u2022"),i=r?`<img src="${p(P(t,r.path??r.url))}" width="${p(r.width)}" height="${p(r.height)}" alt="${p(e.coverImage?.alt??e.names?.canonical??"")}" loading="lazy" decoding="async">`:`<span class="tier-place-fallback" aria-hidden="true">${n}</span>`;return`<a class="tier-place-card" href="${p(`${t}places/${e.slug}/`)}" data-tier-place="${p(e.id)}">
    <span class="tier-place-media">${i}</span>
    <span class="tier-place-copy"><strong>${p(e.names?.canonical)}</strong><span>${p(ue(e))}</span></span>
  </a>`}function me(e,t,r){let n=_[e],i=A.includes(e),s=t.filter(l=>l.tier===e),a=i?"No published places match the current filters.":"Below the publication bar \xB7 unpublished D\u2013F records are intentionally not exposed here.";return`<section class="tier-board-row${i?"":" is-below-bar"}" data-tier="${e}" aria-labelledby="tier-heading-${e.toLowerCase()}">
    <div class="tier-rank"><strong aria-hidden="true">${e}</strong><span>${p(n.label)}</span></div>
    <div class="tier-row-content">
      <div class="tier-row-heading"><h2 id="tier-heading-${e.toLowerCase()}">${e} \xB7 ${p(n.label)}</h2><span>${i?`${s.length} published`:"not public"}</span></div>
      ${s.length?`<div class="tier-board-items">${s.map(l=>pe(l,r)).join("")}</div>`:`<div class="tier-board-empty">${p(a)}</div>`}
    </div>
  </section>`}function B(e,t){return(e??[]).map(r=>`<option value="${p(r.value)}"${r.value===t?" selected":""}>${p(q(r.label))} (${r.count})</option>`).join("")}function ge(){let e=new URLSearchParams(window.location.search);return{query:e.get("q")??"",country:e.get("country")??"",entityType:e.get("type")??"",category:e.get("category")??"",childAges:e.get("ages")??""}}function fe(e){let t=new URLSearchParams(window.location.search),r=[["q",e.query],["country",e.country],["type",e.entityType],["category",e.category],["ages",e.childAges]];for(let[i,s]of r)s?t.set(i,s):t.delete(i);let n=t.toString();history.replaceState(null,"",`${window.location.pathname}${n?`?${n}`:""}${window.location.hash}`)}function he(e,t,r,n){e.className="tier-list-shell",e.removeAttribute("aria-busy"),e.innerHTML=`<header class="tier-list-hero">
    <div class="tier-list-hero-copy"><span class="eyebrow">Compiled once \xB7 streamed by filter</span><h1>The whole catalogue, ranked.</h1><p>The canonical catalogue stays untouched. During publishing, Good Shit compiles a small tier-list projection into country and type shards. Filters choose the smallest relevant shard and the board is generated in the browser as that data arrives.</p></div>
    <div class="tier-list-hero-stat"><strong>${t.entityCount}</strong><span>published places available to the compiled tier-list index</span></div>
  </header>
  <section class="tier-list-controls" aria-label="Tier list filters">
    <label>Find a place<input id="tier-query" type="search" value="${p(n.query)}" placeholder="Name, city, category\u2026" autocomplete="off"></label>
    <label>Country<select id="tier-country"><option value="">Everywhere</option>${B(t.facets?.countries,n.country)}</select></label>
    <label>Type<select id="tier-type"><option value="">Every type</option>${B(t.facets?.entityTypes,n.entityType)}</select></label>
    <label>Category<select id="tier-category"><option value="">Every category</option>${B(t.facets?.categories,n.category)}</select></label>
    <label>Children\u2019s ages<input id="tier-child-ages" type="text" inputmode="numeric" autocomplete="off" value="${p(n.childAges)}" placeholder="e.g. 4, 8" title="Every entered child must be a good fit; unknown suitability is excluded."></label>
    <button id="tier-export" class="filled-button tier-export-button" type="button" disabled>Download PNG</button>
  </section>
  <div class="tier-list-meta"><span id="tier-visible-count" aria-live="polite"></span><span id="tier-stream-status" aria-live="polite">Choosing compiled shards\u2026</span></div>
  <div id="tier-board" class="tier-board"></div>
  <p class="muted">D / E / F remain structural rows only. Unpublished records never enter the compiled tier-list projection. <a href="${p(`${r}tiers/`)}">Static tier pages</a></p>`}function ye(e){return{query:e.querySelector("#tier-query")?.value.trim()??"",country:e.querySelector("#tier-country")?.value??"",entityType:e.querySelector("#tier-type")?.value??"",category:e.querySelector("#tier-category")?.value??"",childAges:e.querySelector("#tier-child-ages")?.value.trim()??""}}function G(e){let t=new Map;for(let r of e)t.set(String(r.id),r);return[...t.values()]}function be(e){let t=new Map(j.map((r,n)=>[r,n]));return[...e].sort((r,n)=>(t.get(r.tier)??99)-(t.get(n.tier)??99)||r.names.canonical.localeCompare(n.names.canonical)||r.id.localeCompare(n.id))}function I(e,t,r,n=null){let i=be(t),s=ae(i),a=e.querySelector("#tier-board");a&&(a.innerHTML=j.map(f=>me(f,i,r)).join(""));let l=e.querySelector("#tier-visible-count");l&&(l.innerHTML=`<strong>${i.length}</strong> ${i.length===1?"place":"places"} visible \xB7 ${A.map(f=>`${f} ${s[f]}`).join(" \xB7 ")}`);let m=e.querySelector("#tier-stream-status");return m&&n&&(m.textContent=n),i}function J(e,t=!1){let r=document.querySelector("#app-status");r&&(r.textContent=e,r.classList.toggle("is-error",t),r.classList.add("is-visible"),window.setTimeout(()=>r.classList.remove("is-visible"),t?5e3:2800))}function F(e,t,r,n,i,s){let a=Math.min(s,n/2,i/2);e.beginPath(),e.moveTo(t+a,r),e.arcTo(t+n,r,t+n,r+i,a),e.arcTo(t+n,r+i,t,r+i,a),e.arcTo(t,r+i,t,r,a),e.arcTo(t,r,t+n,r,a),e.closePath()}function xe(e,t,r,n,i,s){let a=Math.max(i/t.naturalWidth,s/t.naturalHeight),l=i/a,m=s/a,f=(t.naturalWidth-l)/2,x=(t.naturalHeight-m)/2;e.drawImage(t,f,x,l,m,r,n,i,s)}function we(e,t,r,n=2){let i=String(t??"").split(/\s+/).filter(Boolean),s=[],a="";for(let l of i){let m=a?`${a} ${l}`:l;if(e.measureText(m).width<=r||!a)a=m;else if(s.push(a),a=l,s.length===n-1)break}if(a&&s.length<n&&s.push(a),i.join(" ")!==s.join(" ")&&s.length){let l=s.length-1;for(;s[l]&&e.measureText(`${s[l]}\u2026`).width>r;)s[l]=s[l].slice(0,-1);s[l]=`${s[l]}\u2026`}return s}async function ve(e){return e?new Promise(t=>{let r=new Image,n=window.setTimeout(()=>t(null),8e3);r.onload=()=>{window.clearTimeout(n),t(r)},r.onerror=()=>{window.clearTimeout(n),t(null)},r.src=e}):null}async function Te(e,t="/"){let r=e.map(a=>{let l=Y(a,360);return[String(a.id),P(t,l?.path??l?.url)]}),n=new Map,i=0;async function s(){for(;i<r.length;){let a=i++,[l,m]=r[a];n.set(l,await ve(m))}}return await Promise.all(Array.from({length:Math.min(8,r.length||1)},()=>s())),n}function Ae(e,t){let r=[];return e.country&&r.push(e.country),e.entityType&&r.push(q(e.entityType)),e.category&&r.push(q(e.category)),e.query&&r.push(`\u201C${e.query}\u201D`),`${t} published place${t===1?"":"s"}${r.length?` \xB7 ${r.join(" \xB7 ")}`:" \xB7 all public catalogue entries"}`}async function Se(e,t,r="/"){let u=Math.floor(204),d=154,g=92,h=[],y=172;for(let c of j){let b=e.filter(C=>C.tier===c),E=A.includes(c)?Math.max(1,Math.ceil(b.length/6)):1,$=A.includes(c)?Math.max(154,54+E*(d+14)+20):112;h.push({tier:c,items:b,y,rowHeight:$}),y+=$+18}if(y+=86,y>12e3)throw new Error("This filtered tier list is too tall to export in one browser image. Narrow the filters first.");let w=document.createElement("canvas");w.width=1600,w.height=y;let o=w.getContext("2d");if(!o)throw new Error("Canvas export is unavailable in this browser.");let R=await Te(e,r);o.fillStyle="#fff9ff",o.fillRect(0,0,1600,y),o.fillStyle="#1d1a20",o.font="900 64px system-ui, sans-serif",o.fillText("GOOD SHIT \xB7 TIER LIST",64,78),o.fillStyle="#49454e",o.font="600 24px system-ui, sans-serif",o.fillText(Ae(t,e.length),64,120),o.font="500 18px system-ui, sans-serif",o.fillText("Generated automatically from compiled published tiers \xB7 D\u2013F remain private/unpublished",64,151);for(let c of h){let b=_[c.tier];F(o,64,c.y,1472,c.rowHeight,34),o.fillStyle="#f3ecf5",o.fill(),F(o,64,c.y,150,c.rowHeight,34),o.fillStyle=b.exportColor,o.fill(),o.fillStyle=b.exportAccent,o.font="900 72px system-ui, sans-serif",o.textAlign="center",o.fillText(c.tier,64+150/2,c.y+Math.min(88,c.rowHeight/2+24)),o.font="800 16px system-ui, sans-serif",o.fillText(b.label.toUpperCase(),64+150/2,c.y+Math.min(116,c.rowHeight/2+52)),o.textAlign="left";let E=242;if(!A.includes(c.tier)){o.fillStyle="#6f6873",o.font="700 22px system-ui, sans-serif",o.fillText("Below publication bar \xB7 intentionally not exposed",E,c.y+c.rowHeight/2+7);continue}if(!c.items.length){o.fillStyle="#6f6873",o.font="700 22px system-ui, sans-serif",o.fillText("No published places match this filter.",E,c.y+c.rowHeight/2+7);continue}for(let[$,C]of c.items.entries()){let K=$%6,Q=Math.floor($/6),v=E+K*(u+14),T=c.y+46+Q*(d+14);F(o,v,T,u,d,20),o.save(),o.clip();let O=R.get(String(C.id));O?xe(o,O,v,T,u,g):(o.fillStyle=b.exportColor,o.fillRect(v,T,u,g),o.fillStyle=b.exportAccent,o.font="900 42px system-ui, sans-serif",o.textAlign="center",o.fillText(C.names?.canonical?.trim()?.[0]?.toUpperCase()??"\u2022",v+u/2,T+60),o.textAlign="left"),o.fillStyle="#ffffff",o.fillRect(v,T+g,u,d-g),o.fillStyle="#1d1a20",o.font="800 16px system-ui, sans-serif",we(o,C.names?.canonical,u-20,2).forEach((Z,ee)=>o.fillText(Z,v+10,T+g+22+ee*18)),o.restore()}}o.fillStyle="#6f6873",o.font="600 18px system-ui, sans-serif",o.fillText("good-shit \xB7 editorial tier is curated judgement, not an external review average",64,y-36);let k=await new Promise(c=>w.toBlob(c,"image/png"));if(!k)throw new Error("Could not encode the tier list image.");let D=URL.createObjectURL(k),S=document.createElement("a");S.href=D,S.download=se(t),document.body.append(S),S.click(),S.remove(),window.setTimeout(()=>URL.revokeObjectURL(D),1e3)}var H=new Map;async function Ee(e,t="/"){let r=e?.path?P(t,e.path):e?.url;return r?(H.has(r)||H.set(r,X(r).then(n=>n.documents??[]).catch(n=>{throw H.delete(r),n})),H.get(r)):[]}async function W(){let e=document.querySelector("[data-tier-list-root]");if(!e)return!1;de();let t=ce(),r=String(t.basePath||"/").replace(/\/+$/,"/"),n=t.tierListManifestUrl;if(!n)return!1;let i=e.innerHTML;try{let s=await X(n),a=ge();he(e,s,r,a);let l=[],m=0,f=null,x=async()=>{let u=++m;a=ye(e),fe(a);let d=le(s,a),g=e.querySelector("#tier-export");g&&(g.disabled=!0);let h=[];l=I(e,[],r,d.length?`Loading 0 / ${d.length} compiled shard${d.length===1?"":"s"}\u2026`:"No compiled shard matches this filter.");for(let[w,o]of d.entries()){let R=await Ee(o,r);if(u!==m)return;h.push(...R),l=U(G(h),a);let k=o.kind==="country"?`country ${o.key}`:`type ${q(o.key)}`;I(e,l,r,`Loaded ${w+1} / ${d.length} \xB7 ${k}`)}if(u!==m)return;l=U(G(h),a);let y=d.length===1?`${d[0].kind} shard`:`${d.length} country shards`;I(e,l,r,d.length?`Ready \xB7 ${y} \xB7 ${l.length} matches`:"Ready \xB7 0 matches"),g&&(g.disabled=!1)};return e.addEventListener("input",u=>{(u.target instanceof Element?u.target:null)?.matches("#tier-query, #tier-child-ages")&&(f!==null&&window.clearTimeout(f),f=window.setTimeout(()=>{x()},140))}),e.addEventListener("change",u=>{(u.target instanceof Element?u.target:null)?.matches("#tier-country, #tier-type, #tier-category")&&x()}),e.querySelector("#tier-export")?.addEventListener("click",async u=>{let d=u.currentTarget instanceof HTMLButtonElement?u.currentTarget:null;if(!d)return;d.disabled=!0;let g=d.textContent;d.textContent="Rendering PNG\u2026";try{document.fonts?.ready&&await document.fonts.ready,await Se(l,a,r),J("Tier list PNG downloaded.")}catch(h){console.error(h),J(oe(h,"Could not export the tier list."),!0)}finally{d.disabled=!1,d.textContent=g}}),await x(),!0}catch(s){return console.error(s),e.className="page-shell",e.innerHTML=`${i}<div class="tier-list-error" role="alert">The generated tier list could not load. The static tier pages remain available.</div>`,e.removeAttribute("aria-busy"),!1}}typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{W()},{once:!0}):W());})();
