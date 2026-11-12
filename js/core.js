'use strict';
/* AlgoForja · núcleo: utilidades, análisis de código, estado, navegación e inicio */
const $=s=>document.querySelector(s),A=$('#app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const pick1=a=>a[Math.floor(Math.random()*a.length)];

// ---- navegación: los módulos registran sus pantallas en V ----
const VERSION='1.9.1',V={},CAT=[];
const go=(v,...a)=>{(V[v]||V.pronto)(...a);scrollTo(0,0)};
const back=(v,a)=>`<button onclick="go('${v||'home'}'${a!=null&&a!==''?`,'${a}'`:''})">← Volver</button>`;
const big=(ic,t,s,on)=>`<button class=big onclick="${on}"><span class=ic>${ic}</span><span><b>${t}</b><small>${s}</small></span></button>`;
V.pronto=()=>{A.innerHTML=back()+'<div class=card><h3>🚧 Próximamente</h3><p class=mut>Esta parte llega en una próxima entrega.</p></div>'};

// ---- limpieza del código: se omiten TODOS los comentarios ----
function clean(code){
 code=code.replace(/\r/g,'').replace(/\t/g,'    ').replace(/("""|''')[\s\S]*?\1/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
 return code.split('\n').map(l=>{if(/^\s*\/\//.test(l))return'';let q='',o='';
  for(let i=0;i<l.length;i++){const c=l[i];
   if(q){o+=c;if(c=='\\')o+=l[++i]||'';else if(c==q)q='';continue}
   if(c=='"'||c=="'"){q=c;o+=c;continue}
   if(c=='#')break;o+=c}
  return o.replace(/\s+$/,'')}).filter(l=>l.trim()).join('\n')}

// ---- análisis del código (reglas propias, sin internet) ----
const KW=new Set('def for while if elif else return break continue in not and or is None True False range len print import from class pass lambda with as try except self append get put add pop empty min max sum abs int float str list dict set tuple PriorityQueue Queue heappush heappop'.split(' '));
const TOK=/(?<![\w)\]]\s*)-\d+\.?\d*|[A-Za-z_]\w*|\d+\.?\d*|==|!=|<=|>=|[<>]/g;
function parse(code){return clean(code).split('\n').map(t=>{const s=t.trim();
 const k=/^def\s/.test(s)?'def':/^(for|while)\b/.test(s)?'loop':/^(if|elif|else)\b/.test(s)?'cond':/^return\b/.test(s)?'ret':/^(break|continue)\b/.test(s)?'jump':/^[\w.\[\], ()]+?\s*[-+*\/]?=(?!=)/.test(s)?'asg':'seq';
 return{t,s,k}})}
function info(L){const d=L.find(l=>l.k=='def'),m=d&&d.s.match(/^def\s+(\w+)\s*\((.*?)\)/);
 const par=m?m[2].split(',').map(x=>x.trim().replace(/[:=].*$/,'').trim()).filter(Boolean):[],vs=new Set(),rets=new Set();
 L.forEach(l=>{let x;if(l.k=='asg'&&(x=l.s.match(/^([A-Za-z_]\w*)/)))vs.add(x[1]);if(x=l.s.match(/^for\s+(\w+)/))vs.add(x[1]);
  if(l.k=='ret')(l.s.match(/[A-Za-z_]\w*/g)||[]).forEach(w=>{if(!KW.has(w))rets.add(w)})});
 return{name:m?m[1]:'(sin función)',par,vars:[...new Set([...par,...vs])],role:v=>par.includes(v)?0:rets.has(v)?2:1}}
const say=s=>{let m;
 if(m=s.match(/^def\s+(\w+)\s*\((.*?)\)/))return`Defino la función ${m[1]}, que recibe ${m[2]||'nada'}`;
 if(m=s.match(/^for\s+(.+?)\s+in\s+(.+?):?$/))return`Repito para cada ${m[1]} en ${m[2]}`;
 if(m=s.match(/^while\s+(.+?):?$/))return`Mientras ${m[1]}, repito`;
 if(m=s.match(/^elif\s+(.+?):?$/))return`Si no, y si ${m[1]}`;
 if(m=s.match(/^if\s+(.+?):?$/))return`Si ${m[1]}`;
 if(/^else/.test(s))return'En cualquier otro caso';
 if(m=s.match(/^return\s*(.*)$/))return m[1]?`Devuelvo ${m[1]}`:'Termino la función';
 if(s=='break')return'Termino el ciclo';if(s=='continue')return'Salto a la siguiente vuelta';
 if(m=s.match(/^(.+?)\s*([-+*\/]?)=\s*(.+)$/))return m[2]=='+'?`Sumo ${m[3]} a ${m[1]}`:m[2]=='-'?`Resto ${m[3]} a ${m[1]}`:m[2]?`Actualizo ${m[1]} con ${m[2]}= ${m[3]}`:`Guardo ${m[3]} en ${m[1]}`;
 return`Ejecuto ${s}`};
const SN=['Secuencia','Condición','Repetición','Retorno / salto'],SK={asg:0,seq:0,def:0,cond:1,loop:2,ret:3,jump:3};
const SW=['Se ejecuta en orden: ni decide ni repite.','Decide qué camino seguir según una condición.','Repite instrucciones durante un recorrido o mientras se cumpla una regla.','Entrega un resultado o altera el ciclo.'];
const ROLES=['Entrada (dato que recibe)','Variable interna (guarda estado)','Salida (lo que devuelve)'],RW=['Llega como parámetro.','Se crea y cambia dentro del algoritmo.','Es lo que se devuelve al final.'];

// ---- estado (IndexedDB) ----
const RANGOS=[[0,'Aprendiz'],[100,'Mecánico'],[300,'Ingeniero inverso'],[600,'Arquitecto']];
const MODES=[['rx','🩻','Radiografía','Pasos 1-5: ¿qué papel tiene cada parte?'],['hu','🧩','Huecos','Niveles 2-3: completa lo que falta'],['or','🔀','Ordenar','Paso 5: reordena un bloque'],['tr','🗣️','Traductor','Paso 7: de palabras a código'],['bg','🐞','Caza-errores','Nivel 4: halla la línea alterada'],['ci','🧠','A ciegas','Paso 8: reconstruye con solo el esqueleto']];
let S={xp:0,streak:0,last:'',algs:[],prog:{}};
const db=new Promise(r=>{try{const q=indexedDB.open('algoforja',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}});
const load=async()=>{const d=await db;return d?new Promise(r=>{const g=d.transaction('k').objectStore('k').get('s');g.onsuccess=()=>r(g.result);g.onerror=()=>r()}):0};
const save=async()=>{const d=await db;if(d)d.transaction('k','readwrite').objectStore('k').put(S,'s')};
const alg=id=>{const u=S.algs.find(a=>a.id==id);if(u)return u;const c=CAT.find(a=>a.id==id);return c&&S.cedit&&S.cedit[id]?Object.assign({},c,{code:S.cedit[id],edited:true}):c};
const stOf=a=>a.st||(S.prog[a.id]=S.prog[a.id]||{});
const stars=a=>MODES.reduce((s,m)=>s+(stOf(a)[m[0]]||0),0);
function award(a,mode,st){const s=stOf(a),pv=s[mode]||0;if(st>pv){S.xp+=10*(st-pv);s[mode]=st}
 const t=new Date().toDateString(),y=new Date(Date.now()-864e5).toDateString();if(S.last!=t){S.streak=S.last==y?S.streak+1:1;S.last=t}save()}

// ---- pantallas base ----
V.home=()=>{const c=[...RANGOS].reverse().find(r=>S.xp>=r[0]),nx=RANGOS.find(r=>r[0]>S.xp),n=S.algs.length+CAT.length;
 A.innerHTML=`<div class=hero><div class=top><h1>⚙️ AlgoForja</h1><span class=pill>🔥 ${S.streak}</span></div><small>Aprende algoritmos desde cero, jugando.</small><div style="margin-top:10px"><b>${c[1]}</b> · ${S.xp} XP</div><div class=bar style="background:#ffffff44"><i style="background:#fff;width:${nx?(S.xp-c[0])/(nx[0]-c[0])*100:100}%"></i></div></div>`
 +big('🎓','Aprende un nuevo algoritmo','Ingresa uno o elige del catálogo',"go('aprende')")
 +big('🎮','Juego','Practica con los modos de juego',"go('juego')")
 +big('📚','Catálogo de Algoritmos',`${n} algoritmo${n==1?'':'s'}`,"go('catalogo')")
 +`<div style="text-align:center;margin:18px 0"><button onclick=actualizar()>🔄 Actualizar aplicación</button><br><small class=mut>Versión ${VERSION}</small></div>`};
V.aprende=()=>{A.innerHTML=back()+'<h2>🎓 Aprende un nuevo algoritmo</h2>'
 +big('➕','Ingresar un algoritmo nuevo','Pega tu código y conviértelo en lección',"go('nuevo')")
 +big('📚','Elegir del catálogo','Tus algoritmos y los del sistema',"go('catalogo','aprender')")};
V.catalogo=m=>{const row=a=>`<button class="card node" onclick="go('algo','${a.id}')"><span style="flex:1;text-align:left"><b>${esc(a.n)}</b>${a.cat?`<br><small class=mut>${esc(a.cat)}</small>`:''}<div class=bar><i style="width:${stars(a)/(MODES.length*3)*100}%"></i></div></span><span class=pill>${stars(a)} ⭐</span></button>`;
 A.innerHTML=back(m=='aprender'?'aprende':'home')+`<h2>📚 Catálogo</h2><button class=p onclick="go('nuevo')">➕ Agregar mi algoritmo</button><h3>Mis algoritmos</h3>`
 +(S.algs.map(row).join('')||'<p class=mut>Aún no has agregado ninguno.</p>')+'<h3>Del sistema</h3>'
 +(CAT.map(row).join('')||'<p class=mut>Los algoritmos clásicos llegan en una próxima entrega.</p>')};
V.algo=id=>{const a=alg(id),L=parse(a.code),I=info(L),mine=S.algs.includes(a);
 A.innerHTML=back('catalogo')+(mine?` <button onclick="go('nuevo','${id}')">✏️</button> <button onclick="del('${id}')">🗑️</button>`:'')+`<h2>${esc(a.n)}</h2><div class="card mut"><small>${L.length} líneas · función ${esc(I.name)}${a.cat?' · '+esc(a.cat):''}</small></div>`
 +big('📖','Aprender','Ficha de estudio completa',`go('ficha','${id}')`)+big('🎮','Jugar con este algoritmo','Los modos de práctica',`go('jugar','${id}')`)
 +big('🐍','Laboratorio Python','Ejecuta el código real y mira su traza',`go('lab','${id}')`)
 +(mine?'':big('✏️','Modificar código','Pega una versión nueva de este algoritmo',`go('editcat','${id}')`)+(a.edited?big('↩️','Restaurar original','Vuelve al código del catálogo',`restaurar('${id}')`):''))};
const EJ=`def buscar(lista, buscado):\n    posicion = -1  # empieza sin encontrar\n    for i in range(len(lista)):\n        if lista[i] == buscado:\n            posicion = i\n            break\n    return posicion`;
V.nuevo=id=>{const a=id?alg(id):{n:'',cat:'',code:''};
 A.innerHTML=back(id?'algo':'aprende',id)+`<h2>${id?'✏️ Editar':'➕ Nuevo'} algoritmo</h2><input id=nm placeholder="Nombre (ej. Búsqueda binaria)" value="${esc(a.n)}"><input id=ct placeholder="Categoría (ej. Búsqueda, Ordenamiento)" value="${esc(a.cat||'')}"><input id=ll placeholder="Llamada para ejecutar, ej. buscar([4, 8, 12, 16], 12)" value="${esc(a.call||'')}"><textarea id=cd placeholder="Pega aquí tu código (Python funciona mejor). Los comentarios se omiten automáticamente.">${esc(a.code)}</textarea><button onclick=ex()>💡 Ejemplo</button> <button class=p onclick="sv('${id||''}')">Guardar</button><p id=er class=mut></p>`};
function ex(){$('#nm').value='Búsqueda lineal';$('#ct').value='Búsqueda';$('#cd').value=EJ;$('#ll').value='buscar([4, 8, 12, 16], 12)'}
function sv(id){const n=$('#nm').value.trim(),ct=$('#ct').value.trim(),c=clean($('#cd').value),call=$('#ll').value.trim();
 if(!n||parse(c).length<3)return $('#er').textContent='Pon un nombre y al menos 3 líneas de código.';
 if(id){const a=alg(id);if(a.code!=c)a.st={};Object.assign(a,{n,cat:ct,code:c,call})}else{id=String(Date.now());S.algs.push({id,n,cat:ct,code:c,call,st:{}})}
 save();go('algo',id)}
function del(id){if(confirm('¿Borrar este algoritmo?')){S.algs=S.algs.filter(a=>a.id!=id);save();go('catalogo')}}

// ---- actualizar: borra la copia guardada de la app (no toca tus datos) y recarga ----
// ---- actualizar: solo aquí se usa internet. Descarga la app y Python en una caché nueva; si algo falla, sigue la versión anterior ----
function swMsg(sw,msg){return new Promise((res,rej)=>{const ch=new MessageChannel();ch.port1.onmessage=e=>e.data&&e.data.error?rej(new Error(e.data.error)):res(e.data);sw.postMessage(msg,[ch.port2])})}
async function actualizar(){
 if(!confirm('Descargar la última versión de la app y Python. Necesita internet. ¿Continuar?'))return;
 A.innerHTML=`<div class=card><h3>🔄 Actualizando…</h3><p class=mut>Descargando la app y Python. No cierres la aplicación.</p></div>`;
 let sw=null;
 try{
  sw=(await navigator.serviceWorker.ready).active;
  await swMsg(sw,{type:'update'});
  await pyWarm();
  const st=await swMsg(sw,{type:'status'});
  if(!st.pythonCached)throw new Error('Python no quedó guardado en el dispositivo.');
  await swMsg(sw,{type:'commit'});
  location.reload();
 }catch(err){
  try{if(sw)await swMsg(sw,{type:'abort'})}catch(e){}
  A.innerHTML=back()+`<div class=card><h3>No se pudo actualizar</h3><p class=mut>${esc(err.message)}</p><p>La versión que ya tienes sigue funcionando. Revisa tu conexión e inténtalo de nuevo.</p></div>`}}

// ---- arranque ----
addEventListener('load',()=>{
 if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
 load().then(s=>{if(s)S=Object.assign(S,s);go('home')})});
