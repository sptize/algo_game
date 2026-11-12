'use strict';
/* AlgoForja · worker de Python (Pyodide). Es un archivo propio para que el service worker lo controle
   y guarde Pyodide en la caché: así funciona sin internet después de pulsar "Actualizar aplicación". */
var PYURL='https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
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
async function init(){
 if(py)return;
 if(!ready){ready=(async()=>{
  try{importScripts(PYURL)}catch(e){throw new Error('No se pudo descargar Pyodide. Revisa tu conexión.')}
  py=await loadPyodide();py.runPython(RUNNER_CODE);
 })()}
 try{await ready}catch(e){ready=null;throw e}
}
self.onmessage=async function(e){
 const m=e.data;
 try{
  await init();
  if(m.type==='init'){postMessage({type:'ready'});return}
  postMessage({type:'result',data:String(py.globals.get('__run')(m.src,m.call,m.max))});
 }catch(err){postMessage({type:'fatal',error:String(err&&err.message||err)})}
};
