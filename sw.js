const PREFIX='algoforja-';
const APP=['./','index.html','css/styles.css','js/core.js','js/catalog.js','js/learn.js','js/viz.js','js/games.js','js/py.js','js/py-worker.js','manifest.webmanifest','icon-192.png','icon-512.png'];
let PENDING=null;
const appUrls=()=>APP.map(f=>new URL(f,self.registration.scope).href);
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Nada se descarga al instalar ni al abrir. Solo "update" (botón Actualizar) va a internet.
self.addEventListener('message',e=>{
 const port=e.ports&&e.ports[0],m=e.data||{};
 e.waitUntil((async()=>{
  try{
   if(m.type==='update'){
    if(PENDING)await caches.delete(PENDING);
    PENDING=PREFIX+String(Date.now()).padStart(15,'0');
    const c=await caches.open(PENDING);
    await Promise.all(appUrls().map(async u=>{const r=await fetch(u,{cache:'reload'});if(!r.ok)throw new Error('No se pudo descargar '+u);await c.put(u,r)}));
   }else if(m.type==='commit'){
    if(!PENDING)throw new Error('No hay una actualización pendiente.');
    const keep=PENDING;PENDING=null;
    for(const n of await caches.keys())if(n.startsWith(PREFIX)&&n!==keep)await caches.delete(n);
   }else if(m.type==='abort'){
    if(PENDING){await caches.delete(PENDING);PENDING=null}
   }
   port&&port.postMessage({ok:true});
  }catch(err){
   if(m.type==='update'&&PENDING){await caches.delete(PENDING);PENDING=null}
   port&&port.postMessage({error:String(err&&err.message||err)});
  }
 })())});
// Caché primero: busca en la versión más nueva guardada. La red solo se usa para la app si nunca se instaló.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(serve(e.request))});
async function lookup(req){
 const names=(await caches.keys()).filter(n=>n.startsWith(PREFIX)&&n!==PENDING).sort().reverse();
 for(const n of names){const hit=await(await caches.open(n)).match(req.url,{ignoreSearch:true});if(hit)return hit}
 return null}
async function serve(req){
 const same=new URL(req.url).origin===self.location.origin;
 if(PENDING&&!same){ // durante una actualización, Python se guarda en la caché nueva
  const res=await fetch(req);
  if(res.ok){const c=await caches.open(PENDING);await c.put(req.url,res.clone())}
  return res}
 const hit=await lookup(req);
 if(hit)return hit;
 if(same)return fetch(req);
 return new Response('Python no está guardado en este dispositivo. Pulsa 🔄 Actualizar aplicación con internet.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
