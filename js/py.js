'use strict';
/* AlgoForja · laboratorio Python. Pyodide corre en js/py-worker.js con tiempos separados:
   descargar Python nunca se confunde con un ciclo infinito del algoritmo. */
const LABR={};
const PY_TIMEOUT={run:8000};
const PYFILES=['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'];
// lee Python de la caché del dispositivo (sin red). Si falta algo, lo dice.
async function readPyFiles(){
 const keys=(await caches.keys()).filter(k=>k.startsWith('algoforja-')).sort().reverse(),out={};
 for(const n of PYFILES){let hit=null;
  for(const k of keys){hit=await(await caches.open(k)).match('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'+n,{ignoreSearch:true});if(hit)break}
  if(!hit)throw new Error('falta '+n);
  out[n]=(n.endsWith('.js')||n.endsWith('.json'))?await hit.text():await hit.arrayBuffer()}
 return out}
let PYW=null,PYCANCEL=null,PYBUSY=false;
function pyWorker(){if(!PYW)PYW=new Worker('js/py-worker.js');return PYW}
// si la carga falla, dice si Python está guardado en el dispositivo y qué hacer
function failPy(err,kill,fail){
 const msgs=(s)=>{const sw=navigator.serviceWorker&&navigator.serviceWorker.controller;
  if(!sw){fail('Python no se pudo cargar: esta página todavía no usa la caché del dispositivo. Cierra la app y ábrela de nuevo; después pulsa 🔄 Actualizar aplicación con internet.',kill);return}
  const ch=new MessageChannel();ch.port1.onmessage=e=>{
   const cached=e.data&&e.data.pythonCached;
   fail((cached?'Python sí está guardado, pero el navegador no pudo leerlo ('+err+'). Cierra la app completamente y vuelve a abrirla.':'Python no está guardado en este dispositivo ('+err+'). Pulsa 🔄 Actualizar aplicación con internet.'),kill)};
  sw.postMessage({type:'status'},[ch.port2])};
 msgs();
}
function pyStop(){if(PYW){try{PYW.terminate()}catch(e){}PYW=null}}
// status: 'loading' mientras Python está en caché o descargándose; 'running' mientras corre el código
function pyRun(src,call,onStatus){return new Promise(res=>{
 const w=pyWorker();let tRun=null,done=false;
 const noGuardado=(err)=>'Python no está guardado en este dispositivo ('+err.message+'). Pulsa 🔄 Actualizar aplicación con internet.';
 const finish=r=>{if(done)return;done=true;clearTimeout(tRun);PYCANCEL=null;res(r)};
 const fail=(msg,kill)=>{if(kill)pyStop();finish({error:msg,steps:[],out:''})};
 PYCANCEL=()=>fail('Cancelado. Vuelve a ejecutar cuando quieras.',true);
 w.onerror=ev=>fail('Python no pudo cargarse: '+((ev&&ev.message)||'error del worker')+'. Pulsa 🔄 Actualizar aplicación con internet.',true);
 w.onmessage=ev=>{const m=ev.data;
  if(m.type==='ready'){onStatus&&onStatus('running');
   tRun=setTimeout(()=>fail('Se detuvo: el código tardó más de '+(PY_TIMEOUT.run/1000)+' s. Probablemente tiene un ciclo infinito o es demasiado pesado.',true),PY_TIMEOUT.run);
   w.postMessage({type:'run',src,call,max:2000})}
  else if(m.type==='result')finish(JSON.parse(m.data));
  else if(m.type==='fatal')failPy(m.error,true,fail)};
 onStatus&&onStatus('loading');
 readPyFiles().then(files=>w.postMessage({type:'init',files}),err=>fail(noGuardado(err),true));
})}
// descarga Python dentro de la caché nueva (lo usa "Actualizar aplicación")
function pyWarm(){return new Promise((res,rej)=>{
 const w=new Worker('js/py-worker.js');
 w.onmessage=ev=>{if(ev.data.type==='ready'){w.terminate();res()}else if(ev.data.type==='fatal'){w.terminate();rej(new Error(ev.data.error))}};
 w.onerror=ev=>{w.terminate();rej(new Error('Python no se pudo cargar desde el dispositivo ('+((ev&&ev.message)||'error')+')'))};
 readPyFiles().then(files=>w.postMessage({type:'init',files}),err=>{w.terminate();rej(new Error('Python no quedó guardado ('+err.message+')'))});
})}

// traduce la traza cruda de Python a pasos para la visualización
function labSteps(raw,lines){const st=[],out=[];
 raw.forEach(e=>{
  if(e.ev=='call'){st.push(e.fn+'('+Object.values(e.v).join(', ')+')');
   out.push({ln:e.ln,d:`Entro en ${e.fn}`+(Object.keys(e.v).length?' con '+Object.entries(e.v).map(([k,v])=>k+' = '+v).join(', '):'')+'.',v:e.v,st:st.slice()})}
  else if(e.ev=='line'){const t=(lines[e.ln-1]||'').trim();
   out.push({ln:e.ln,d:`Línea ${e.ln}: ${say(t)}.`,v:e.v,st:st.slice()})}
  else{out.push({ln:e.ln,d:`${e.fn} devuelve ${e.ret}.`,v:e.v,st:st.slice()});st.pop()}
 });return out}
function labTrace(id){const r=LABR[id];return r&&r.steps&&r.steps.length?{entrada:r.call||'ejecución real',arr:null,gen:()=>r.steps}:null}

V.lab=id=>{const a=alg(id);if(!a)return go('catalogo');const prev=LABR[id];
 A.innerHTML=back('algo',id)+`<h2>🐍 Laboratorio Python</h2><p class=mut>Ejecuta el código real. La traza muestra cada línea y el valor de las variables. Python se guarda en el dispositivo al pulsar 🔄 Actualizar aplicación.</p>
 <div class=card><small class=mut>Código</small><pre>${esc(clean(a.code))}</pre>
 <label class=mut>Llamada para ejecutar</label><input id=lcall value="${esc(a.call||'')}" placeholder="ej. buscar([4, 8, 12, 16], 12)">
 <button class=p id=lrun onclick="runLab('${id}')">▶️ Ejecutar</button></div><div id=lout></div>`;
 if(prev)showLab(id,prev)};
async function runLab(id){if(PYBUSY)return;const a=alg(id),call=$('#lcall').value.trim(),lines=clean(a.code).split('\n');
 PYBUSY=true;
 const status=s=>{$('#lout').innerHTML=`<div class=card>${s=='loading'?'⏳ Cargando Python…':'▶️ Ejecutando el código…'}<br><button onclick="pyCancelar()" style="margin-top:8px">Cancelar</button></div>`};
 status('loading');
 const r=await pyRun(clean(a.code),call,status);
 PYBUSY=false;
 LABR[id]={call,steps:labSteps(r.steps||[],lines),out:r.out||'',result:r.result,error:r.error,trunc:r.trunc,raw:r.steps?r.steps.length:0};
 if(call!==(a.call||'')){a.call=call;save()}
 showLab(id,LABR[id])}
function pyCancelar(){if(PYCANCEL)PYCANCEL()}
function showLab(id,r){$('#lout').innerHTML=`<div class=card>${r.error?`<p style="color:#a12b2b"><b>Error:</b> ${esc(r.error)}</p>`:`<p><b>Resultado:</b> ${esc(r.result==null?'(sin valor)':r.result)}</p>`}`
 +(r.out?`<p><b>Salida:</b></p><pre>${esc(r.out)}</pre>`:'')
 +`<p class=mut>${r.steps.length} pasos registrados${r.trunc?' (se cortó en el límite de 2000)':''}.</p>`
 +(r.steps.length?`<button class=p onclick="go('viz','${id}')">🎬 Ver traza paso a paso</button>`:'')+'</div>'}
