(()=>{var ye="good-shit-encrypted-collection";var J=new TextEncoder,ze=new TextDecoder("utf-8",{fatal:!0}),Ke=J.encode("GSENC001"),_=52,he=16,ge=/^[0-9a-f]{32}$/,Je=/^[0-9a-f]{64}$/,Ve=/^(?:verifier|manifest|r-[0-9a-f]{64})$/,V=new WeakMap,ne=new WeakMap,I=class extends Error{constructor(){super("Encrypted artifact authentication failed."),this.name="ArtifactAuthenticationError"}};function m(e="Invalid encrypted collection format."){throw new Error(e)}function O(e,t,r=[]){(!e||typeof e!="object"||Array.isArray(e)||![Object.prototype,null].includes(Object.getPrototypeOf(e)))&&m();let n=new Set([...t,...r]);(t.some(i=>!Object.hasOwn(e,i))||Object.keys(e).some(i=>!n.has(i)))&&m()}function Ge(e){typeof e!="string"&&m("Invalid collection password."),e.length>4096&&m("Collection password exceeds the version 1 input budget.");for(let n=0;n<e.length;n+=1){let i=e.charCodeAt(n);if(i>=55296&&i<=56319){let a=e.charCodeAt(n+1);a>=56320&&a<=57343||m("Invalid collection password."),n+=1}else i>=56320&&i<=57343&&m("Invalid collection password.")}let t=e.normalize("NFC");t.endsWith("\0")&&m("Collection passwords may not end with U+0000.");let r=0;for(let n of t)if(r+=1,r>=16)break;return r<16&&m("Collection passwords require at least 16 Unicode code points after NFC."),t}function z(e){return[...e].map(t=>t.toString(16).padStart(2,"0")).join("")}function re(e){return(typeof e!="string"||e.length%2||!/^[0-9a-f]*$/.test(e))&&m(),Uint8Array.from(e.match(/../g)??[],t=>Number.parseInt(t,16))}function ie(e){O(e,["ref","kdf"]),(typeof e.ref!="string"||!ge.test(e.ref))&&m(),O(e.kdf,["version","name","hash","iterations","salt"]);let t=e.kdf;return(t.version!==1||t.name!=="PBKDF2"||t.hash!=="SHA-256"||t.iterations!==6e5||typeof t.salt!="string"||!Je.test(t.salt))&&m(),Object.freeze({ref:e.ref,kdf:Object.freeze({...t})})}function We(e){let t=new Set,r=n=>{if(n===null||typeof n=="boolean")return JSON.stringify(n);if(typeof n=="string"){for(let a of n){let o=a.codePointAt(0);o>=55296&&o<=57343&&m("Invalid Unicode in encrypted JSON.")}return JSON.stringify(n)}if(typeof n=="number")return Number.isFinite(n)||m("Invalid number in encrypted JSON."),JSON.stringify(n);(!n||typeof n!="object"||t.has(n))&&m("Invalid encrypted JSON value."),!Array.isArray(n)&&![Object.prototype,null].includes(Object.getPrototypeOf(n))&&m(),t.add(n);let i;if(Array.isArray(n)){Object.keys(n).length!==n.length&&m("Sparse or extended arrays are not JSON values.");for(let o=0;o<n.length;o+=1)Object.hasOwn(n,o)||m("Sparse or extended arrays are not JSON values.");i=`[${n.map(r).join(",")}]`}else i=`{${Object.keys(n).sort().map(a=>`${r(a)}:${r(n[a])}`).join(",")}}`;return t.delete(n),i};return J.encode(r(e))}function H(e){try{let t=typeof e=="string"?e:ze.decode(e),r=0,n=()=>{for(;/[\x20\t\r\n]/.test(t[r]??"x");)r+=1},i=s=>{n(),t[r++]!==s&&m()},a=()=>{n();let s=r;for(t[r++]!=='"'&&m();r<t.length;){let c=t[r++];if(c==="\\")r+=1;else if(c==='"')return JSON.parse(t.slice(s,r))}m()},o=(s=0)=>{if(s>100&&m(),n(),t[r]==="{"){r+=1,n();let d=new Set;if(t[r]==="}"){r+=1;return}for(;;){let u=a();if(d.has(u)&&m(),d.add(u),i(":"),o(s+1),n(),t[r]==="}"){r+=1;return}i(",")}}if(t[r]==="["){if(r+=1,n(),t[r]==="]"){r+=1;return}for(;;){if(o(s+1),n(),t[r]==="]"){r+=1;return}i(",")}}if(t[r]==='"'){a();return}let c=/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(t.slice(r));c||m(),r+=c[0].length};return o(),n(),r!==t.length&&m(),JSON.parse(t)}catch{m("Invalid or ambiguous encrypted JSON.")}}function D(...e){return J.encode(JSON.stringify([ye,1,...e]))}function K(e,t){if(e.length!==t.length)return!1;let r=0;for(let n=0;n<e.length;n+=1)r|=e[n]^t[n];return r===0}async function oe(e,t){return new Uint8Array(await globalThis.crypto.subtle.sign("HMAC",e,t))}async function ae(e){return z(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",e)))}async function be(e){let t=J.encode(Ge(e));e="";try{let r=await globalThis.crypto.subtle.importKey("raw",t,"PBKDF2",!1,["deriveBits"]),n=Object.freeze({});return ne.set(n,r),n}finally{t.fill(0)}}function we(e){ne.delete(e)}async function xe(e,t){let r=ie(t),n=ne.get(e);n||m("Invalid prepared collection password.");let i;try{let a=globalThis.crypto.subtle;i=new Uint8Array(await a.deriveBits({name:"PBKDF2",hash:"SHA-256",iterations:r.kdf.iterations,salt:re(r.kdf.salt)},n,256));let o=await a.importKey("raw",i,"HKDF",!1,["deriveKey"]);i.fill(0),i=null;let s=x=>a.deriveKey({name:"HKDF",hash:"SHA-256",salt:re(r.kdf.salt),info:D(x,r.ref,r.kdf.version,r.kdf.iterations)},o,{name:"HMAC",hash:"SHA-256",length:256},!1,["sign"]),[c,d,u]=await Promise.all([s("commitment-key"),s("nonce-key"),s("artifact-identity-key")]),f=Object.freeze({});return V.set(f,{descriptor:r,root:o,commitmentKey:c,nonceKey:d,identityKey:u}),f}finally{i?.fill(0)}}function se(e){V.delete(e)}function Xe(e,t){let r=V.get(e);return(!r||typeof t!="string"||!Ve.test(t))&&m(),r}async function ve(e,t){let r=V.get(e);return(!r||typeof t!="string"||!t)&&m(),`r-${z(await oe(r.identityKey,D("artifact-identity",r.descriptor.ref,t)))}`}async function Ye(e,t,r){return oe(e.commitmentKey,D("content-commitment",e.descriptor.ref,t,await ae(r)))}async function Ze(e,t,r){let{descriptor:n}=e,i=z(r),a=(await oe(e.nonceKey,D("gcm-nonce",n.ref,t,i))).slice(0,12),o=await globalThis.crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:re(n.kdf.salt),info:D("aes-key",n.ref,t,i)},e.root,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"]),s=D("aes-256-gcm-128",n.ref,n.kdf.version,n.kdf.name,n.kdf.hash,n.kdf.iterations,n.kdf.salt,t,i,z(a));return{key:o,nonce:a,additionalData:s}}function ce(e){return(!(e instanceof Uint8Array)||e.length<_+he||e.length>67108864+_+he||!K(e.subarray(0,8),Ke))&&m(),e}async function G(e,t,r){let n=Xe(e,t);ce(r);let i=Uint8Array.from(r),a=i.slice(8,40),{key:o,nonce:s,additionalData:c}=await Ze(n,t,a);if(!K(i.subarray(40,_),s))throw new I;let d;try{try{d=new Uint8Array(await globalThis.crypto.subtle.decrypt({name:"AES-GCM",iv:s,additionalData:c,tagLength:128},o,i.subarray(_)))}catch(u){throw u?.name==="OperationError"?new I:u}if(!K(await Ye(n,t,d),a))throw new I;return d}catch(u){throw d?.fill(0),u}}function Qe(e){return(typeof e!="string"||!ge.test(e))&&m(),We([ye,1,"unlock",e])}async function Te(e,t,r){let n=await G(e,"verifier",r);try{K(n,Qe(t))||m("Encrypted verifier binding failed.")}finally{n.fill(0)}}var tt=128*1024*1024,rt=8,nt=/^[0-9a-f]{64}$/,it=new Set(["application/json","application/gpx+xml","application/octet-stream","image/avif","image/jpeg","image/png","image/webp"]);function M(){throw new Error("Invalid encrypted publication contract.")}function ot(e){return(typeof e!="string"||!/^[A-Za-z0-9_.~/-]+$/.test(e)||e.split("/").some(t=>!t||t==="."||t===".."))&&M(),e}function at(e){return it.has(e)||M(),e}function q(e,t=null){return O(e,["artifactId","path","sha256","bytes"]),(typeof e.artifactId!="string"||!/^(?:manifest|verifier|r-[0-9a-f]{64})$/.test(e.artifactId)||t!==null&&e.artifactId!==t||typeof e.sha256!="string"||!nt.test(e.sha256)||e.path!==`encrypted/${e.sha256}.bin`||!Number.isSafeInteger(e.bytes)||e.bytes<68||e.bytes>67108932)&&M(),Object.freeze({...e})}function W(e){O(e,["schemaVersion","cryptoVersion","collections"]),(e.schemaVersion!==1||e.cryptoVersion!==1||!Array.isArray(e.collections)||e.collections.length>rt)&&M();let t=new Set,r=e.collections.map(n=>{O(n,["ref","kdf","verifier","manifest"]);let i=ie({ref:n.ref,kdf:n.kdf});t.has(i.ref)&&M(),t.add(i.ref);let a=q(n.verifier,"verifier");return a.bytes>512&&M(),Object.freeze({...i,verifier:a,manifest:q(n.manifest,"manifest")})});return Object.freeze({schemaVersion:1,cryptoVersion:1,collections:Object.freeze(r)})}function Ee(e,t){O(e,["schemaVersion","ref","displayName","resources"]),(e.schemaVersion!==1||e.ref!==t||typeof e.displayName!="string"||!e.displayName.trim()||[...e.displayName].length>200||!Array.isArray(e.resources))&&M();let r=new Set,n=new Set,i=0,a=e.resources.map(o=>{O(o,["path","mediaType","artifact"]);let s=ot(o.path),c=at(o.mediaType),d=q(o.artifact);return(!d.artifactId.startsWith("r-")||r.has(s)||n.has(d.artifactId))&&M(),r.add(s),n.add(d.artifactId),i+=d.bytes,i>tt&&M(),Object.freeze({path:s,mediaType:c,artifact:d})});return Object.freeze({schemaVersion:1,ref:t,displayName:e.displayName,resources:Object.freeze(a)})}var y=class extends Error{constructor(t){super(t==="no-match"?"Could not unlock a collection with that password.":"The collection could not be opened."),this.name="CollectionUnlockError",this.code=t}};function T(e){if(e?.aborted)throw new y("cancelled")}async function le(e,t,r){q(e),T(r);let n;try{n=await t(e.path,{signal:r,expectedBytes:e.bytes})}catch(i){throw T(r),i}if(T(r),!(n instanceof Uint8Array)||n.length!==e.bytes||await ae(n)!==e.sha256)throw new y("invalid-artifact");return n}async function Se({password:e,registry:t,fetchBytes:r,signal:n}){let i=[],a=new Map,o=new Map,s;try{let c=W(t);if(T(n),c.collections.length===0)throw new y("no-match");try{s=await be(e)}catch(h){throw T(n),typeof DOMException<"u"&&h instanceof DOMException?new y("crypto"):new y("invalid-password")}e="";for(let h of c.collections){T(n);let b=`${h.verifier.path}:${h.verifier.sha256}:${h.verifier.bytes}`;o.has(b)||o.set(b,le(h.verifier,r,n));let k=await o.get(b);ce(k);let w;try{try{w=await xe(s,{ref:h.ref,kdf:h.kdf})}catch{throw T(n),new y("crypto")}T(n);try{await Te(w,h.ref,k)}catch(g){if(T(n),g instanceof I)continue;throw g instanceof y?g:typeof DOMException<"u"&&g instanceof DOMException?new y("crypto"):new y("invalid-artifact")}i.push({descriptor:h,keys:w}),w=null}finally{w&&se(w)}}if(i.length!==1)throw new y(i.length?"ambiguous-match":"no-match");let{descriptor:d,keys:u}=i[0],f=await G(u,"manifest",await le(d.manifest,r,n)),x;try{x=Ee(H(f),d.ref)}finally{f.fill(0)}for(let h of x.resources){if(T(n),h.artifact.artifactId!==await ve(u,h.path))throw new y("invalid-artifact");let b=await G(u,h.artifact.artifactId,await le(h.artifact,r,n));a.set(h.path,{mediaType:h.mediaType,bytes:b})}return T(n),{ref:x.ref,displayName:x.displayName,resources:a}}catch(c){for(let d of a.values())d.bytes.fill(0);throw a.clear(),T(n),c instanceof y?c:typeof DOMException<"u"&&c instanceof DOMException?new y("crypto"):new y("invalid-artifact")}finally{e="",s&&we(s);for(let c of i)se(c.keys);i.length=0,o.clear()}}function ke(e,t=globalThis.fetch){let r=new URL(e);if(!["http:","https:"].includes(r.protocol)||!r.pathname.endsWith("/")||r.search||r.hash||r.username||r.password)throw new Error("Invalid publication base URL.");return async(n,{signal:i,expectedBytes:a})=>{if(!/^encrypted\/[0-9a-f]{64}\.bin$/.test(n)||!Number.isSafeInteger(a)||a<68||a>64*1024*1024+68)throw new y("invalid-artifact");let o=new URL(n,r);if(o.origin!==r.origin||!o.pathname.startsWith(r.pathname))throw new y("invalid-artifact");let s;try{s=await t(o.href,{signal:i,credentials:"omit",referrerPolicy:"no-referrer",redirect:"error",headers:{Accept:"application/octet-stream"}})}catch(f){throw T(i),f}if(T(i),!s.ok||!s.body)throw await s.body?.cancel().catch(()=>{}),T(i),new y("network");let c=s.body.getReader(),d=new Uint8Array(a),u=0;try{for(;;){T(i);let f=await c.read();if(f.done)break;if(u+f.value.length>a)throw new y("invalid-artifact");d.set(f.value,u),u+=f.value.length}if(u!==a)throw new y("invalid-artifact");return d}catch(f){throw d.fill(0),await c.cancel().catch(()=>{}),T(i),f}finally{c.releaseLock()}}}var X=class extends EventTarget{#e=new Map;#t=new Map;#n=0;#r=null;#o;#i;#a;constructor({unlock:t=Se,createUrl:r=i=>URL.createObjectURL(i),revokeUrl:n=i=>URL.revokeObjectURL(i)}={}){super(),this.#o=t,this.#i=r,this.#a=n}get busy(){return this.#r!==null}get unlocked(){return this.#e.size>0}collections(){return[...this.#e.values()].map(({ref:t,displayName:r})=>({ref:t,displayName:r}))}async unlock(t,r,n){if(this.#r)throw new y("busy");let i=this.#n,a=new AbortController;this.#r=a,this.dispatchEvent(new Event("busychange"));let o;try{let s=this.#o({password:t,registry:r,fetchBytes:n,signal:a.signal});if(t="",o=await s,this.#n!==i||a.signal.aborted)throw new y("cancelled");if(this.#e.has(o.ref)){for(let c of o.resources.values())c.bytes.fill(0);o.resources.clear()}else this.#e.set(o.ref,o),this.dispatchEvent(new Event("change"));return o.ref}catch(s){if(o&&this.#e.get(o.ref)!==o){for(let c of o.resources.values())c.bytes.fill(0);o.resources.clear()}throw s instanceof y?s:new y("invalid-artifact")}finally{t="",this.#r===a&&(this.#r=null,this.dispatchEvent(new Event("busychange")))}}readJson(t,r){let n=this.#e.get(t)?.resources.get(r);if(!n||n.mediaType!=="application/json")throw new Error("Collection resource is unavailable.");return H(n.bytes)}resourcePaths(t){return[...this.#e.get(t)?.resources.keys()??[]]}objectUrl(t,r){let n=this.#e.get(t)?.resources.get(r);if(!n)throw new Error("Collection resource is unavailable.");if(!/^image\/(?:avif|jpeg|png|webp)$/.test(n.mediaType))throw new Error("Only passive raster media can receive an object URL.");let i=JSON.stringify([t,r]);return this.#t.has(i)||this.#t.set(i,this.#i(new Blob([n.bytes],{type:n.mediaType}))),this.#t.get(i)}downloadUrl(t,r){let n=this.#e.get(t)?.resources.get(r);if(!n||!["application/gpx+xml","application/json"].includes(n.mediaType))throw new Error("Download resource is unavailable.");let i=JSON.stringify([t,r]);return this.#t.has(i)||this.#t.set(i,this.#i(new Blob([n.bytes],{type:n.mediaType}))),this.#t.get(i)}lockAll(){this.#n+=1,this.#r?.abort();for(let t of this.#e.values()){for(let r of t.resources.values())r.bytes.fill(0);t.resources.clear()}this.#e.clear();for(let t of this.#t.values())try{this.#a(t)}catch{}this.#t.clear(),this.dispatchEvent(new Event("change"))}cancelUnlock(){this.#r&&(this.#n+=1,this.#r?.abort(),this.dispatchEvent(new Event("change")))}};async function st(e,t){let r=await fetch(new URL("encrypted/manifest.json",new URL(e,location.href)),{signal:t,credentials:"omit",referrerPolicy:"no-referrer",redirect:"error",headers:{Accept:"application/json"}});if(!r.ok||!r.body)throw new Error("Collections could not be loaded.");let n=r.body.getReader(),i=[],a=0;try{for(;;){let c=await n.read();if(c.done)break;if(a+=c.value.length,a>65536)throw new Error("Collection registry is too large.");i.push(c.value)}}catch(c){throw await n.cancel().catch(()=>{}),c}finally{n.releaseLock()}let o=new Uint8Array(a),s=0;for(let c of i)o.set(c,s),s+=c.length;return W(H(o))}var de=class extends EventTarget{session;payloads=[];protectedIds=new Set;generation=0;registryRequest=null;constructor(t=new X){super(),this.session=t,t.addEventListener("change",()=>{let r=this.payloads.length>0||t.unlocked||this.registryRequest!==null;if(t.unlocked||this.registryRequest?.abort(),this.generation+=1,!!r){this.payloads=[];for(let{ref:n}of t.collections()){let i=t.readJson(n,"visitor.json");if(i.schemaVersion!==1||!Array.isArray(i.entities)||!Array.isArray(i.documents)||!Array.isArray(i.index?.docs)||!Array.isArray(i.map?.featureCollection?.features)||!Array.isArray(i.tierDocuments))throw t.lockAll(),new Error("The collection visitor data is invalid.");let a=o=>{if(!(!o||typeof o!="object")){typeof o.path=="string"&&/^assets\/images\//.test(o.path)&&(o.path=t.objectUrl(n,o.path));for(let s of Object.values(o))a(s)}};a(i);for(let o of i.entities)this.protectedIds.add(String(o.id));this.payloads.push(i)}this.dispatchEvent(new Event("change"))}}),t.addEventListener("busychange",()=>this.dispatchEvent(new Event("busychange")))}get unlocked(){return this.session.unlocked}get busy(){return this.registryRequest!==null||this.session.busy}get hasProtectedHistory(){return this.protectedIds.size>0}get revision(){return this.generation}isProtected(t){return this.protectedIds.has(String(t))}documents(){return structuredClone(this.payloads.flatMap(t=>t.documents))}index(){return structuredClone(this.payloads.flatMap(t=>t.index.docs))}mergeIndex(t){if(!this.payloads.length)return t;let r=[...t.docs],n=new Map(t.terms.map(([i,a])=>[i,[...a]]));for(let i of this.payloads){let a=r.length;r.push(...structuredClone(i.index.docs));for(let[o,s]of i.index.terms)n.set(o,[...n.get(o)??[],...s.map(([c,d])=>[c+a,d])])}return{schemaVersion:1,documentCount:r.length,docs:r,terms:[...n].sort(([i],[a])=>i<a?-1:i>a?1:0)}}tiers(){return structuredClone(this.payloads.flatMap(t=>t.tierDocuments))}entities(){return structuredClone(this.payloads.flatMap(t=>t.entities))}detail(t){return structuredClone(this.payloads.flatMap(r=>r.details??[]).find(r=>r.id===t)?.presentation)}map(){return{documents:this.documents(),featureCollection:{type:"FeatureCollection",features:structuredClone(this.payloads.flatMap(t=>t.map.featureCollection.features))}}}mapIndex(){return Object.assign({},...this.payloads.map(t=>structuredClone(t.mapIndex)))}jsonResource(t,r){let n=new URL(r,globalThis.location?.href??"https://example.invalid/"),i=new URL(t,n);if(i.origin!==n.origin||!i.pathname.startsWith(n.pathname))return;let a=i.pathname.slice(n.pathname.length);for(let{ref:o}of this.session.collections())if(this.session.resourcePaths(o).includes(a))return this.session.readJson(o,a)}safeSnapshot(t,r){return this.isProtected(t)?{name:"Locked collection place",slug:null,countryCode:null,tier:null,status:null,coordinates:null}:r}download(t,r){for(let{ref:n}of this.session.collections())if(this.session.resourcePaths(n).includes(r)&&this.payloads.some(i=>i.entities.some(a=>a.id===t)))return this.session.downloadUrl(n,r);throw new Error("The collection download is unavailable.")}async unlock(t,r){if(this.busy)throw new Error("A collection unlock is already in progress.");let n=this.revision,i=new AbortController;this.registryRequest=i,this.dispatchEvent(new Event("busychange"));try{let a=new URL(r,location.href),o=await st(r,i.signal);if(this.revision!==n||i.signal.aborted)throw new Error("Collection unlock was cancelled.");let s=this.session.unlock(t,o,ke(a.href));t="",await s}finally{t="",this.registryRequest=null,this.dispatchEvent(new Event("busychange"))}}cancelUnlock(){this.registryRequest?.abort(),this.session.cancelUnlock()}},ct=Symbol.for("good-shit.encrypted-visitor.v1"),lt=globalThis,S=lt[ct]??=new de;function Ce(e){S.addEventListener("change",e)}function Re(e,t=!1){e.querySelectorAll("[data-encrypted-refinement]").forEach(o=>o.remove());let r=S.documents(),n=(o,s)=>{let c=e.querySelector(o);if(!c)return;let d=new Set([...c.options].map(u=>u.value));for(let u of[...new Set(s)].sort()){if(!u||d.has(u))continue;let f=document.createElement("option");f.value=u,f.textContent=u.replaceAll("-"," "),f.dataset.encryptedRefinement="true",c.append(f)}};if(n(t?"#tier-country":'[name="country"]',r.map(o=>o.countryCode)),n(t?"#tier-type":'[name="entityType"]',r.map(o=>o.entityType)),n(t?"#tier-category":'[name="category"]',r.flatMap(o=>o.categories)),t)return;let i=new Map;for(let o of r)for(let[s,c]of Object.entries(o.customFacets??{})){let d=i.get(s)??new Set;for(let u of Array.isArray(c)?c:[c])d.add(String(u));i.set(s,d)}let a=e.querySelector('[data-context-filter="custom"]');for(let[o,s]of i){let c=[...e.querySelectorAll("select[data-facet-key]")].find(u=>u.dataset.facetKey===o);if(!c&&a){let u=document.createElement("div");u.className="field",u.dataset.encryptedRefinement="true";let f=document.createElement("label");f.textContent=o.split(".").at(-1)?.replace(/([a-z])([A-Z])/g,"$1 $2")??"Collection refinement",c=document.createElement("select"),c.dataset.facetKey=o,c.name=`facet:${o}`,c.append(new Option("Any","")),f.append(c),u.append(f),a.append(u)}if(!c)continue;let d=new Set([...c.options].map(u=>u.value));for(let u of[...s].sort())if(!d.has(u)){let f=new Option(u.replaceAll("-"," "),u);f.dataset.encryptedRefinement="true",c.append(f)}}}var Me=String.raw`
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
`;var dt=new Set(["ideal","good"]),ut=[{id:"infant",minAge:0,maxAge:1},{id:"toddler",minAge:2,maxAge:3},{id:"preschool",minAge:4,maxAge:5},{id:"younger-child",minAge:6,maxAge:9},{id:"older-child",minAge:10,maxAge:12},{id:"teen",minAge:13,maxAge:17},{id:"adult",minAge:18,maxAge:null}];function Y(e){return Array.isArray(e)?[...new Set(e.map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]:[...new Set(String(e??"").split(/[;,\s]+/).filter(Boolean).map(Number).filter(t=>Number.isInteger(t)&&t>=0&&t<=17))]}function pt(e){if(!Number.isInteger(e)||e<0)throw new RangeError("age must be a non-negative integer");return ut.find(t=>t.maxAge==null?e>=t.minAge:e>=t.minAge&&e<=t.maxAge)?.id??"adult"}function ft(e,t){if(!e||!Number.isInteger(t)||t<0)return"unknown";for(let r of e.hardRestrictions??[])if(r.type==="minAge"&&t<r.value||r.type==="maxAge"&&t>r.value)return"unsuitable";return e.statusByBand?.[pt(t)]??"unknown"}function $e(e,t){let r=Y(t);return r.length?r.every(n=>dt.has(ft(e,n))):!0}function Oe(e,t){return e instanceof Error?e.message:e==null?t:String(e)}function fe(e,t){return String(t).startsWith("blob:")?String(t):`${String(e||"/").replace(/\/+$/,"/")}${String(t??"").replace(/^\/+/,"")}`}var te=Object.freeze(["S","A","B","C","D","E","F"]),N=Object.freeze(["S","A","B","C"]),De=Object.freeze({S:{label:"Exceptional",exportColor:"#ffd9df",exportAccent:"#9e2d43"},A:{label:"Excellent",exportColor:"#ffdcc1",exportAccent:"#955000"},B:{label:"Very good",exportColor:"#f9e87c",exportAccent:"#665700"},C:{label:"Good",exportColor:"#b8f2c6",exportAccent:"#0f6330"},D:{label:"Mediocre",exportColor:"#d5e6ff",exportAccent:"#23578f"},E:{label:"Poor",exportColor:"#e5deff",exportAccent:"#524398"},F:{label:"Avoid",exportColor:"#ffd7f7",exportAccent:"#81377c"}});function v(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function ee(e){return String(e??"").replaceAll("-"," ").replace(/\b\w/g,t=>t.toUpperCase())}function He(e){return String(e??"").trim().toLocaleLowerCase()}function Le(e,t={}){let r=He(t.query),n=Y(t.childAges);return e.filter(i=>{if(!N.includes(i.tier)||t.country&&i.location?.countryCode!==t.country||t.entityType&&i.entityType!==t.entityType||t.category&&!(i.categories??[]).includes(t.category)||n.length&&!$e(i.audience,n))return!1;if(!r)return!0;let a=[i.names?.canonical,i.names?.local,i.location?.locality,i.location?.region,i.location?.country,i.entityType,...i.categories??[],...i.tags??[]].filter(Boolean).join(" ").toLocaleLowerCase();return r.split(/\s+/).every(o=>a.includes(o))})}function mt(e){return Object.fromEntries(te.map(t=>[t,e.filter(r=>r.tier===t).length]))}function ht(e={}){let t=["good-shit-tier-list"];e.country&&t.push(String(e.country).toLowerCase()),e.entityType&&t.push(e.entityType),e.category&&t.push(e.category);let r=Y(e.childAges);return r.length&&t.push(`ages-${r.join("-")}`),e.query&&t.push(He(e.query).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,32)),`${t.filter(Boolean).join("-")}.png`}function B(e,t,r){return r?{kind:e,key:t,...r}:null}function yt(e,t={}){let r=e?.shards?.byCountry??{},n=e?.shards?.byType??{},i=t.country||"",a=t.entityType||"";return i&&a?[B("country",i,r[i]),B("type",a,n[a])].filter(o=>!!o).sort((o,s)=>(o.count??1/0)-(s.count??1/0)||o.kind.localeCompare(s.kind)).slice(0,1):i?[B("country",i,r[i])].filter(o=>!!o):a?[B("type",a,n[a])].filter(o=>!!o):Object.entries(r).map(([o,s])=>B("country",o,s)).filter(o=>!!o).sort((o,s)=>(s.count??0)-(o.count??0)||o.key.localeCompare(s.key))}function gt(){try{return JSON.parse(document.querySelector("#page-config")?.textContent??"{}")}catch{return{}}}function bt(){if(document.querySelector("#tier-list-expressive-styles"))return;let e=document.createElement("style");e.id="tier-list-expressive-styles",e.textContent=Me,document.head.append(e)}async function Ne(e){let t=await fetch(e,{credentials:"same-origin"});if(!t.ok)throw new Error(`Could not load ${e} (${t.status}).`);return t.json()}function Ue(e,t=420){let r=e.coverImage?.variants;if(!r?.length)return null;let n=[...r].sort((i,a)=>i.width-a.width);return n.find(i=>i.width>=t)??n.at(-1)??null}function wt(e){let t=[e.location?.locality,e.location?.region,e.location?.country].filter(Boolean);return t.filter((r,n)=>n===0||r!==t[n-1]).join(" \xB7 ")}function xt(e,t){let r=Ue(e),n=v(e.names?.canonical?.trim()?.[0]?.toLocaleUpperCase()??"\u2022"),i=r?`<img src="${v(fe(t,r.path??r.url))}" width="${v(r.width)}" height="${v(r.height)}" alt="${v(e.coverImage?.alt??e.names?.canonical??"")}" loading="lazy" decoding="async">`:`<span class="tier-place-fallback" aria-hidden="true">${n}</span>`;return`<a class="tier-place-card" href="${S.isProtected(e.id)?"#":v(`${t}places/${e.slug}/`)}"${S.isProtected(e.id)?` data-protected-place="${v(e.id)}"`:""} data-tier-place="${v(e.id)}">
    <span class="tier-place-media">${i}</span>
    <span class="tier-place-copy"><strong>${v(e.names?.canonical)}</strong><span>${v(wt(e))}</span></span>
  </a>`}function vt(e,t,r){let n=De[e],i=N.includes(e),a=t.filter(s=>s.tier===e),o=i?"No published places match the current filters.":"Below the publication bar \xB7 unpublished D\u2013F records are intentionally not exposed here.";return`<section class="tier-board-row${i?"":" is-below-bar"}" data-tier="${e}" aria-labelledby="tier-heading-${e.toLowerCase()}">
    <div class="tier-rank"><strong aria-hidden="true">${e}</strong><span>${v(n.label)}</span></div>
    <div class="tier-row-content">
      <div class="tier-row-heading"><h2 id="tier-heading-${e.toLowerCase()}">${e} \xB7 ${v(n.label)}</h2><span>${i?`${a.length} published`:"not public"}</span></div>
      ${a.length?`<div class="tier-board-items">${a.map(s=>xt(s,r)).join("")}</div>`:`<div class="tier-board-empty">${v(o)}</div>`}
    </div>
  </section>`}function ue(e,t){return(e??[]).map(r=>`<option value="${v(r.value)}"${r.value===t?" selected":""}>${v(ee(r.label))} (${r.count})</option>`).join("")}function Tt(){let e=new URLSearchParams(window.location.search);return{query:e.get("q")??"",country:e.get("country")??"",entityType:e.get("type")??"",category:e.get("category")??"",childAges:e.get("ages")??""}}function At(e){let t=new URLSearchParams(window.location.search),r=[["q",e.query],["country",e.country],["type",e.entityType],["category",e.category],["ages",e.childAges]];for(let[i,a]of r)a?t.set(i,a):t.delete(i);let n=t.toString();history.replaceState(null,"",`${window.location.pathname}${n?`?${n}`:""}${window.location.hash}`)}function Et(e,t,r,n){e.className="tier-list-shell",e.removeAttribute("aria-busy"),e.innerHTML=`<header class="tier-list-hero">
    <div class="tier-list-hero-copy"><span class="eyebrow">Compiled once \xB7 streamed by filter</span><h1>The whole catalogue, ranked.</h1><p>The canonical catalogue stays untouched. During publishing, Good Shit compiles a small tier-list projection into country and type shards. Filters choose the smallest relevant shard and the board is generated in the browser as that data arrives.</p></div>
    <div class="tier-list-hero-stat"><strong>${t.entityCount}</strong><span>published places available to the compiled tier-list index</span></div>
  </header>
  <section class="tier-list-controls" aria-label="Tier list filters">
    <label>Find a place<input id="tier-query" type="search" value="${v(n.query)}" placeholder="Name, city, category\u2026" autocomplete="off"></label>
    <label>Country<select id="tier-country"><option value="">Everywhere</option>${ue(t.facets?.countries,n.country)}</select></label>
    <label>Type<select id="tier-type"><option value="">Every type</option>${ue(t.facets?.entityTypes,n.entityType)}</select></label>
    <label>Category<select id="tier-category"><option value="">Every category</option>${ue(t.facets?.categories,n.category)}</select></label>
    <label>Children\u2019s ages<input id="tier-child-ages" type="text" inputmode="numeric" autocomplete="off" value="${v(n.childAges)}" placeholder="e.g. 4, 8" title="Every entered child must be a good fit; unknown suitability is excluded."></label>
    <button id="tier-export" class="filled-button tier-export-button" type="button" disabled>Download PNG</button>
  </section>
  <div class="tier-list-meta"><span id="tier-visible-count" aria-live="polite"></span><span id="tier-stream-status" aria-live="polite">Choosing compiled shards\u2026</span><button id="tier-retry" class="outlined-button" type="button" hidden>Retry loading</button></div>
  <div id="tier-board" class="tier-board"></div>
  <p class="muted">D / E / F remain structural rows only. Unpublished records never enter the compiled tier-list projection. <a href="${v(`${r}tiers/`)}">Static tier pages</a></p>`}function St(e){return{query:e.querySelector("#tier-query")?.value.trim()??"",country:e.querySelector("#tier-country")?.value??"",entityType:e.querySelector("#tier-type")?.value??"",category:e.querySelector("#tier-category")?.value??"",childAges:e.querySelector("#tier-child-ages")?.value.trim()??""}}function Ie(e){let t=new Map;for(let r of e)t.set(String(r.id),r);return[...t.values()]}function kt(e){let t=new Map(te.map((r,n)=>[r,n]));return[...e].sort((r,n)=>(t.get(r.tier)??99)-(t.get(n.tier)??99)||r.names.canonical.localeCompare(n.names.canonical)||r.id.localeCompare(n.id))}function Z(e,t,r,n=null){let i=kt(t),a=mt(i),o=e.querySelector("#tier-board");o&&(o.innerHTML=te.map(d=>vt(d,i,r)).join(""));let s=e.querySelector("#tier-visible-count");s&&(s.innerHTML=`<strong>${i.length}</strong> ${i.length===1?"place":"places"} visible \xB7 ${N.map(d=>`${d} ${a[d]}`).join(" \xB7 ")}`);let c=e.querySelector("#tier-stream-status");return c&&n&&(c.textContent=n),i}function je(e,t=!1){let r=document.querySelector("#app-status");r&&(r.textContent=e,r.classList.toggle("is-error",t),r.classList.add("is-visible"),window.setTimeout(()=>r.classList.remove("is-visible"),t?5e3:2800))}function pe(e,t,r,n,i,a){let o=Math.min(a,n/2,i/2);e.beginPath(),e.moveTo(t+o,r),e.arcTo(t+n,r,t+n,r+i,o),e.arcTo(t+n,r+i,t,r+i,o),e.arcTo(t,r+i,t,r,o),e.arcTo(t,r,t+n,r,o),e.closePath()}function Ct(e,t,r,n,i,a){let o=Math.max(i/t.naturalWidth,a/t.naturalHeight),s=i/o,c=a/o,d=(t.naturalWidth-s)/2,u=(t.naturalHeight-c)/2;e.drawImage(t,d,u,s,c,r,n,i,a)}function Rt(e,t,r,n=2){let i=String(t??"").split(/\s+/).filter(Boolean),a=[],o="";for(let s of i){let c=o?`${o} ${s}`:s;if(e.measureText(c).width<=r||!o)o=c;else if(a.push(o),o=s,a.length===n-1)break}if(o&&a.length<n&&a.push(o),i.join(" ")!==a.join(" ")&&a.length){let s=a.length-1;for(;a[s]&&e.measureText(`${a[s]}\u2026`).width>r;)a[s]=a[s].slice(0,-1);a[s]=`${a[s]}\u2026`}return a}async function Mt(e){return e?new Promise(t=>{let r=new Image,n=window.setTimeout(()=>t(null),8e3);r.onload=()=>{window.clearTimeout(n),t(r)},r.onerror=()=>{window.clearTimeout(n),t(null)},r.src=e}):null}async function $t(e,t="/"){let r=e.map(o=>{let s=Ue(o,360);return[String(o.id),fe(t,s?.path??s?.url)]}),n=new Map,i=0;async function a(){for(;i<r.length;){let o=i++,[s,c]=r[o];n.set(s,await Mt(c))}}return await Promise.all(Array.from({length:Math.min(8,r.length||1)},()=>a())),n}function Ot(e,t){let r=[];return e.country&&r.push(e.country),e.entityType&&r.push(ee(e.entityType)),e.category&&r.push(ee(e.category)),e.query&&r.push(`\u201C${e.query}\u201D`),`${t} published place${t===1?"":"s"}${r.length?` \xB7 ${r.join(" \xB7 ")}`:" \xB7 all public catalogue entries"}`}async function Lt(e,t,r="/",n=()=>!0){let x=Math.floor(204),h=154,b=92,k=[],w=172;for(let p of te){let R=e.filter(F=>F.tier===p),L=N.includes(p)?Math.max(1,Math.ceil(R.length/6)):1,U=N.includes(p)?Math.max(154,54+L*(h+14)+20):112;k.push({tier:p,items:R,y:w,rowHeight:U}),w+=U+18}if(w+=86,w>12e3)throw new Error("This filtered tier list is too tall to export in one browser image. Narrow the filters first.");let g=document.createElement("canvas");g.width=1600,g.height=w;let l=g.getContext("2d");if(!l)throw new Error("Canvas export is unavailable in this browser.");let A=await $t(e,r);if(!n())throw new Error("Export cancelled because the collection was locked.");l.fillStyle="#fff9ff",l.fillRect(0,0,1600,w),l.fillStyle="#1d1a20",l.font="900 64px system-ui, sans-serif",l.fillText("GOOD SHIT \xB7 TIER LIST",64,78),l.fillStyle="#49454e",l.font="600 24px system-ui, sans-serif",l.fillText(Ot(t,e.length),64,120),l.font="500 18px system-ui, sans-serif",l.fillText("Generated automatically from compiled published tiers \xB7 D\u2013F remain private/unpublished",64,151);for(let p of k){let R=De[p.tier];pe(l,64,p.y,1472,p.rowHeight,34),l.fillStyle="#f3ecf5",l.fill(),pe(l,64,p.y,150,p.rowHeight,34),l.fillStyle=R.exportColor,l.fill(),l.fillStyle=R.exportAccent,l.font="900 72px system-ui, sans-serif",l.textAlign="center",l.fillText(p.tier,64+150/2,p.y+Math.min(88,p.rowHeight/2+24)),l.font="800 16px system-ui, sans-serif",l.fillText(R.label.toUpperCase(),64+150/2,p.y+Math.min(116,p.rowHeight/2+52)),l.textAlign="left";let L=242;if(!N.includes(p.tier)){l.fillStyle="#6f6873",l.font="700 22px system-ui, sans-serif",l.fillText("Below publication bar \xB7 intentionally not exposed",L,p.y+p.rowHeight/2+7);continue}if(!p.items.length){l.fillStyle="#6f6873",l.font="700 22px system-ui, sans-serif",l.fillText("No published places match this filter.",L,p.y+p.rowHeight/2+7);continue}for(let[U,F]of p.items.entries()){let Fe=U%6,qe=Math.floor(U/6),j=L+Fe*(x+14),P=p.y+46+qe*(h+14);pe(l,j,P,x,h,20),l.save(),l.clip();let me=A.get(String(F.id));me?Ct(l,me,j,P,x,b):(l.fillStyle=R.exportColor,l.fillRect(j,P,x,b),l.fillStyle=R.exportAccent,l.font="900 42px system-ui, sans-serif",l.textAlign="center",l.fillText(F.names?.canonical?.trim()?.[0]?.toUpperCase()??"\u2022",j+x/2,P+60),l.textAlign="left"),l.fillStyle="#ffffff",l.fillRect(j,P+b,x,h-b),l.fillStyle="#1d1a20",l.font="800 16px system-ui, sans-serif",Rt(l,F.names?.canonical,x-20,2).forEach((Be,_e)=>l.fillText(Be,j+10,P+b+22+_e*18)),l.restore()}}l.fillStyle="#6f6873",l.font="600 18px system-ui, sans-serif",l.fillText("good-shit \xB7 editorial tier is curated judgement, not an external review average",64,w-36);let $=await new Promise(p=>g.toBlob(p,"image/png"));if(!n())throw new Error("Export cancelled because the collection was locked.");if(!$)throw new Error("Could not encode the tier list image.");let C=URL.createObjectURL($),E=document.createElement("a");E.href=C,E.download=ht(t),document.body.append(E),E.click(),E.remove(),window.setTimeout(()=>URL.revokeObjectURL(C),1e3)}var Q=new Map;async function It(e,t="/"){let r=e?.path?fe(t,e.path):e?.url;return r?(Q.has(r)||Q.set(r,Ne(r).then(n=>n.documents??[]).catch(n=>{throw Q.delete(r),n})),Q.get(r)):[]}async function Pe(){let e=document.querySelector("[data-tier-list-root]");if(!e)return!1;bt();let t=gt(),r=String(t.basePath||"/").replace(/\/+$/,"/"),n=t.tierListManifestUrl;if(!n)return!1;let i=e.innerHTML;try{let a=await Ne(n),o=Tt();Et(e,a,r,o);let s=[],c=0,d=null,u=!1,f=!1,x=!1,h=e.querySelector("#tier-export"),b=e.querySelector("#tier-retry"),k=()=>{h&&(h.disabled=u||x||!f)},w=async()=>{let g=++c,l=St(e);o=l,S.unlocked||At(l);let A=yt(a,l);u=!0,f=!1,e.setAttribute("aria-busy","true"),k(),b&&(b.hidden=!0,b.disabled=!0);let $=S.tiers();s=Z(e,[],r,A.length?`Loading 0 / ${A.length} compiled shard${A.length===1?"":"s"}\u2026`:"No compiled shard matches this filter.");try{for(let[E,p]of A.entries()){let R=await It(p,r);if(g!==c)return;$.push(...R),s=Le(Ie($),l);let L=p.kind==="country"?`country ${p.key}`:`type ${ee(p.key)}`;Z(e,s,r,`Loaded ${E+1} / ${A.length} \xB7 ${L}`)}if(g!==c)return;s=Le(Ie($),l);let C=A.length===1?`${A[0].kind} shard`:`${A.length} country shards`;Z(e,s,r,A.length?`Ready \xB7 ${C} \xB7 ${s.length} matches`:"Ready \xB7 0 matches"),f=!0}catch(C){if(g!==c)return;console.error(C);let E=e.querySelector("#tier-stream-status");E&&(E.textContent=`Loading failed \xB7 ${s.length} ${s.length===1?"place":"places"} loaded; results are incomplete. Retry loading or use the static tier pages. ${Oe(C,"Could not load the tier list.")}`),b&&(b.hidden=!1)}finally{g===c&&(u=!1,e.removeAttribute("aria-busy"),b&&(b.disabled=!1),k())}};return e.addEventListener("input",g=>{(g.target instanceof Element?g.target:null)?.matches("#tier-query, #tier-child-ages")&&(d!==null&&window.clearTimeout(d),d=window.setTimeout(()=>{w()},140))}),e.addEventListener("change",g=>{(g.target instanceof Element?g.target:null)?.matches("#tier-country, #tier-type, #tier-category")&&(d!==null&&window.clearTimeout(d),w())}),b?.addEventListener("click",()=>{d!==null&&window.clearTimeout(d),w()}),h?.addEventListener("click",async g=>{let l=g.currentTarget instanceof HTMLButtonElement?g.currentTarget:null;if(!l||u||x||!f)return;let A=s,$={...o},C=S.revision;x=!0,k();let E=l.textContent;l.textContent="Rendering PNG\u2026";try{if(document.fonts?.ready&&await document.fonts.ready,C!==S.revision)throw new Error("Export cancelled because the collection was locked.");await Lt(A,$,r,()=>C===S.revision),je("Tier list PNG downloaded.")}catch(p){console.error(p),je(Oe(p,"Could not export the tier list."),!0)}finally{x=!1,k(),l.textContent=E}}),Ce(()=>{c+=1,s=[],Z(e,[],r,"Updating available places\u2026"),Re(e,!0),w()}),await w(),!0}catch(a){return console.error(a),e.className="page-shell",e.innerHTML=`${i}<div class="tier-list-error" role="alert">The generated tier list could not load. The static tier pages remain available.</div>`,e.removeAttribute("aria-busy"),!1}}typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{Pe()},{once:!0}):Pe());})();
