import{r}from"./client-yCjYLn3U.js";const U={veg:"photo-1601050690597-df0568f70950",indian:"photo-1585937421612-70a008356fbe",chinese:"photo-1585032226651-759b368d7246",bistro:"photo-1512621776951-a57141f2eefd",italian:"photo-1513104890138-7c749659a591",finedining:"photo-1414235077428-338989a2e8c0",cafe:"photo-1509042239860-f550ce710b93",burger:"photo-1568901346375-23c9450c58cd",other:"photo-1504674900247-0877df9cc836"},F=(e,t)=>`https://images.unsplash.com/${e}?w=${t}&q=70&auto=format&fit=crop`;/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=e=>e==null?void 0:e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function P(e,t,n=[]){if(t==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:I(e),size:24,node:t,...n.length>0?{aliases:n}:{}}}/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=e=>{let t="",n=!1;for(const o of e){if(o==="-"||o==="_"||o<=" "){n=t.length>0;continue}t.length===0?t+=o.toLowerCase():t+=n?o.toUpperCase():o,n=!1}return t};/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=e=>{const t=$(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=(...e)=>{const t=new Set;for(const n of e)if(typeof n=="string")for(const o of n.split(/\s+/))o&&t.add(o);return[...t].join(" ")};/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function m(e){return e!=null}function E(e,t={}){var b,w;const n=t.attributeNames??{},o=i=>n[i]??i,l=e.size??e.width??c.width,u=e.size??e.height??c.height,d=((b=e.aliases)==null?void 0:b.filter(i=>typeof i=="string"&&i.trim()!=="").map(i=>`lucide-${i}`))??[],f=[...e.name?[`lucide-${e.name}`]:[],...d],s=((w=t.className)==null?void 0:w.split(" ").filter(Boolean))??[],k=t.includeDefaultClasses===!1?p(...s):p("lucide",...f,...s),x=t.absoluteStrokeWidth?Number(t.strokeWidth??c["stroke-width"])*Number(e.size??e.width??c.width)/Number(t.size??t.width??c.width):t.strokeWidth??c["stroke-width"];return["svg",{...Object.entries(c).reduce((i,[a,h])=>(i[o(a)]=h,i),{}),..."color"in t&&t.color&&{[o("stroke")]:t.color},..."size"in t&&m(t.size)&&{[o("width")]:t.size,[o("height")]:t.size},..."width"in t&&m(t.width)&&{[o("width")]:t.width},..."height"in t&&m(t.height)&&{[o("height")]:t.height},[o("stroke-width")]:x,...k&&{[o("class")]:k},[o("viewBox")]:`0 0 ${l} ${u}`,...t.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(i=>{const[a,h,g]=i,C=t.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...h}:h;return g?[a,C,g]:[a,C]})]}/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function B(e,t={}){return E(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=e=>{if(e==null||typeof e!="object")return!1;for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&(t.startsWith("aria-")||t==="role"||t==="title")&&e[t]!=null)return!0;return!1},q=r.createContext({}),D=()=>r.useContext(q),M=r.forwardRef(({color:e,size:t,width:n,height:o,strokeWidth:l,absoluteStrokeWidth:u,nonScalingStroke:d,className:f="",children:s,iconNode:k=[],icon:x={node:k,aliases:[],size:24},...N},b)=>{const{size:w=24,strokeWidth:i=2,absoluteStrokeWidth:a=!1,nonScalingStroke:h=!1,color:g="currentColor",className:C=""}=D()??{},y=!!s||_(N),[z,A,W=[]]=B(x,{color:e??g,width:n??t??w,height:o??t??w,strokeWidth:l??i,absoluteStrokeWidth:u??a,nonScalingStroke:d??h,className:p(C,f),hasA11yProp:y,attributes:N});return r.createElement(z,{ref:b,...A},[...W.map(([v,L])=>r.createElement(v,L)),...Array.isArray(s)?s:[s]])});/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function O(e,t=[],n=[]){const o=typeof e=="string"?P(e,t,n):e,l=r.forwardRef(({className:u,...d},f)=>r.createElement(M,{ref:f,icon:o,className:u,...d}));return o.name&&(l.displayName=j(o.name)),l}/**
 * @license lucide-react v1.75.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S={name:"map-pin",size:24,node:[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]};S.node;const H=O(S);export{U as C,H as M,O as c,F as u};
