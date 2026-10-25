/* Small shared range cache: warm the start and end of a selected PDF, never every book. */
const BLOCK=262144,LIMIT=20*1024*1024;
function shared(){try{if(parent!==window&&parent.P100DocumentCache)return parent.P100DocumentCache}catch(_){}return window.P100DocumentCache||(window.P100DocumentCache={entries:new Map(),bytes:0})}
function entry(doc){const root=shared(),key=doc.file+'|'+doc.bytes+'|'+(doc.sha256||'');let e=root.entries.get(key);if(!e){e={ranges:new Map(),pending:new Map(),full:null};root.entries.set(key,e)}return {root,key,e}}
function trim(root,keep){if(root.bytes<=LIMIT)return;for(const [key,e] of root.entries){if(key===keep)continue;for(const data of e.ranges.values())root.bytes-=data.byteLength;if(e.full)root.bytes-=e.full.byteLength;root.entries.delete(key);if(root.bytes<=LIMIT)break}}
export async function getRange(doc,begin,end,hint=false){
 const {root,key,e}=entry(doc);if(e.full)return e.full.slice(begin,end);const name=begin+':'+end;
 if(e.ranges.has(name))return e.ranges.get(name);
 for(const [range,data] of e.ranges){const [a,b]=range.split(':').map(Number);if(a<=begin&&b>=end)return data.slice(begin-a,end-a)}
 if(e.pending.has(name))return hint?e.pending.get(name):e.pending.get(name).catch(()=>getRange(doc,begin,end));
 const promise=(async()=>{const response=await fetch(new URL('../../'+doc.file,import.meta.url),{headers:{Range:'bytes='+begin+'-'+(end-1)}});if(!response.ok)throw Error('PDF request failed: '+response.status);if(hint&&response.status===200){await response.body?.cancel();throw Error('Background range loading unavailable')}const data=new Uint8Array(await response.arrayBuffer());
 if(response.status===200){e.full=data;root.bytes+=data.byteLength;trim(root,key);return data.slice(begin,end)}
 if(data.byteLength!==end-begin)throw Error('Incomplete PDF range');e.ranges.set(name,data);root.bytes+=data.byteLength;trim(root,key);return data})().finally(()=>e.pending.delete(name));e.pending.set(name,promise);return promise;
}
export async function warm(doc){if(!doc||doc.type!=='pdf')return;const connection=navigator.connection;if(connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||''))return;const last=Math.floor((doc.bytes-1)/BLOCK)*BLOCK;await getRange(doc,0,Math.min(BLOCK,doc.bytes),true);if(last)await getRange(doc,last,doc.bytes,true)}
export async function transport(doc,pdfjs){const initial=await getRange(doc,0,Math.min(BLOCK,doc.bytes));return new(class extends pdfjs.PDFDataRangeTransport{constructor(){super(doc.bytes,initial,true)}requestDataRange(begin,end){getRange(doc,begin,end).then(data=>this.onDataRange(begin,data)).catch(error=>{console.error(error);this.onDataRange(begin,new Uint8Array())})}})()}
export const blockSize=BLOCK;
