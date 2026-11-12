'use strict';
/* AlgoForja · laboratorio Python. Pyodide corre en un Web Worker. La descarga de Python y la ejecución del código tienen
   tiempos separados: lo lento que sea cargar Python nunca se confunde con un ciclo infinito del algoritmo. */
const LABR={};
const PY_TIMEOUT={run:8000};
let PYW=null,PYCANCEL=null,PYBUSY=false;
const RUNNER=`import sys, io, json
class _Stop(Exception):
    pass
def __rep(v):
    try:
        r = repr(v)
    except Exception:
        r = "<?>"
    return r if len(r) <= 80 else r[:77] + "..."
def __run(src, call, maxsteps):
    steps = []
    state = {"trunc": False}
    err = None
    result = None
    out = io.StringIO()
    old = sys.stdout
    sys.stdout = out
    g = {}
    def vars_of(frame):
        d = {}
        for k, v in frame.f_locals.items():
            if k.startswith("__") or callable(v):
                continue
            d[k] = __rep(v)
        return d
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<algo>":
            return None
        if len(steps) >= maxsteps:
            state["trunc"] = True
            raise _Stop()
        rec = {"ev": event, "ln": frame.f_lineno, "fn": frame.f_code.co_name, "v": vars_of(frame)}
        if event == "return":
            rec["ret"] = __rep(arg)
        if event in ("call", "line", "return"):
            steps.append(rec)
        return tracer
    try:
        code = compile(src, "<algo>", "exec")
        if call.strip():
            exec(code, g)
            sys.settrace(tracer)
            result = eval(call, g)
        else:
            sys.settrace(tracer)
            exec(code, g)
    except _Stop:
        pass
    except Exception as e:
        err = type(e).__name__ + ": " + str(e)
    finally:
        sys.settrace(None)
        sys.stdout = old
    return json.dumps({"steps": steps, "trunc": state["trunc"], "out": out.getvalue(),
                       "result": None if result is None else __rep(result), "error": err})
`;
const WORKER_SRC='var RUNNER_CODE='+JSON.stringify(RUNNER)+';\n'+`
var py=null,ready=null;
try{importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js")}catch(e){self.pyFatal=String(e)}
async function init(){
 if(py)return;
 if(!ready){ready=(async()=>{
  if(typeof loadPyodide!=='function')throw new Error('No se pudo descargar Pyodide. Revisa tu conexión y vuelve a intentar.');
  py=await loadPyodide();py.runPython(RUNNER_CODE);
 })();}
 try{await ready}catch(e){ready=null;throw e}
}
self.onmessage=async function(e){
 const m=e.data;
 try{
  await init();
  if(m.type==='init'){postMessage({type:'ready'});return}
  postMessage({type:'result',data:String(py.globals.get('__run')(m.src,m.call,m.max))});
 }catch(err){postMessage({type:'fatal',error:String(err&&err.message||err)})}
};`;
function pyWorker(){if(!PYW)PYW=new Worker(URL.createObjectURL(new Blob([WORKER_SRC],{type:'text/javascript'})));return PYW}
function pyStop(){if(PYW){try{PYW.terminate()}catch(e){}PYW=null}}
// status: 'loading' mientras se descarga Python; 'running' mientras corre el código del alumno
function pyRun(src,call,onStatus){return new Promise(res=>{
 const w=pyWorker();let tRun=null,done=false;
 const finish=r=>{if(done)return;done=true;clearTimeout(tRun);PYCANCEL=null;res(r)};
 const fail=(msg,kill)=>{if(kill)pyStop();finish({error:msg,steps:[],out:''})};
 PYCANCEL=()=>fail('Cancelado. Vuelve a ejecutar cuando quieras.',true);
 w.onerror=ev=>fail('Python no pudo cargarse: '+((ev&&ev.message)||'error del worker')+'. Revisa tu conexión y vuelve a intentar.',true);
 w.onmessage=ev=>{const m=ev.data;
  if(m.type==='ready'){onStatus&&onStatus('running');
   tRun=setTimeout(()=>fail('Se detuvo: el código tardó más de '+(PY_TIMEOUT.run/1000)+' s. Probablemente tiene un ciclo infinito o es demasiado pesado.',true),PY_TIMEOUT.run);
   w.postMessage({type:'run',src,call,max:2000})}
  else if(m.type==='result')finish(JSON.parse(m.data));
  else if(m.type==='fatal')fail(m.error,true)};
 onStatus&&onStatus('loading');
 w.postMessage({type:'init'});
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
 A.innerHTML=back('algo',id)+`<h2>🐍 Laboratorio Python</h2><p class=mut>Ejecuta el código real. La traza muestra cada línea y el valor de las variables. La primera vez hay que descargar Python: en celulares puede tardar uno o dos minutos.</p>
 <div class=card><small class=mut>Código</small><pre>${esc(clean(a.code))}</pre>
 <label class=mut>Llamada para ejecutar</label><input id=lcall value="${esc(a.call||'')}" placeholder="ej. buscar([4, 8, 12, 16], 12)">
 <button class=p id=lrun onclick="runLab('${id}')">▶️ Ejecutar</button></div><div id=lout></div>`;
 if(prev)showLab(id,prev)};
async function runLab(id){if(PYBUSY)return;const a=alg(id),call=$('#lcall').value.trim(),lines=clean(a.code).split('\n');
 PYBUSY=true;
 const status=s=>{$('#lout').innerHTML=`<div class=card>${s=='loading'?'⏳ Descargando Python… (solo la primera vez; sigue esperando)':'▶️ Ejecutando el código…'}<br><button onclick="pyCancelar()" style="margin-top:8px">Cancelar</button></div>`};
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
