'use strict';
/* AlgoForja · worker de Python (Pyodide). La página le pasa los archivos de Pyodide que ya están guardados
   en el dispositivo; el worker no necesita internet ni depende del service worker para leerlos. */
var PYBASE='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
var FILES={};
var realFetch=self.fetch.bind(self),realImport=self.importScripts.bind(self);
function pyName(u){return u.indexOf(PYBASE)===0?u.slice(PYBASE.length).split('?')[0]:null}
self.fetch=function(input,init){const u=typeof input==='string'?input:input.url,n=pyName(u);
 if(n&&FILES[n]){const f=FILES[n];return Promise.resolve(new Response(f.data,{status:200,headers:{'Content-Type':f.type}}))}
 return realFetch(input,init)};
self.importScripts=function(){for(const u of arguments){const n=pyName(u);
 if(n&&FILES[n])(0,eval)(FILES[n].data);else realImport(u)}};
var RUNNER_CODE=`import sys, io, json
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
var py=null,ready=null;
function setFiles(files){FILES={};Object.keys(files).forEach(n=>{const d=files[n];FILES[n]={data:d,type:n.endsWith('.js')?'text/javascript':n.endsWith('.wasm')?'application/wasm':n.endsWith('.zip')?'application/zip':'application/json'}})}
async function init(files){
 if(py)return;
 if(!ready){ready=(async()=>{
  setFiles(files);
  importScripts(PYBASE+'pyodide.js');
  if(typeof loadPyodide!=='function')throw new Error('Python no se pudo iniciar.');
  py=await loadPyodide({indexURL:PYBASE});py.runPython(RUNNER_CODE);
 })()}
 try{await ready}catch(e){ready=null;throw e}
}
self.onmessage=async function(e){
 const m=e.data;
 try{
  await init(m.files||{});
  if(m.type==='init'){postMessage({type:'ready'});return}
  postMessage({type:'result',data:String(py.globals.get('__run')(m.src,m.call,m.max))});
 }catch(err){postMessage({type:'fatal',error:String(err&&err.message||err)})}
};
