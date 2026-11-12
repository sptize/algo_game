'use strict';
/* AlgoForja · visualización: ejecución paso a paso con arreglos, grafos, variables y pila de llamadas */
let VZ=null;
const NODOS=['A','B','C','D'];
const GRAFO={A:['B','C'],B:['D'],C:['D'],D:[]};
const GPESO={A:{B:1,C:4},B:{C:2},C:{D:1},D:{}};
const HEUR={A:4,B:3,C:1,D:0};
const nodeMap=(f)=>Object.fromEntries(NODOS.map(f));

function* facG(n,st){st.push('factorial('+n+')');
 yield {hl:'if n <= 1',d:`Llamada factorial(${n}): ¿${n} <= 1?`,v:{n},st:st.slice()};
 let r;
 if(n<=1){r=1;yield {hl:'return 1',d:`Caso base: factorial(${n}) = 1.`,v:{n,resultado:1},st:st.slice()}}
 else{
  yield {hl:'return n *',d:`Necesito factorial(${n-1}) antes de poder multiplicar.`,v:{n},st:st.slice()};
  const sub=yield* facG(n-1,st);
  r=n*sub;
  yield {hl:'return n *',d:`Llega ${sub}: ${n} × ${sub} = ${r}.`,v:{n,resultado:r},st:st.slice()};
 }
 st.pop();return r}

function* fibG(n,st){st.push('fibonacci('+n+')');
 yield {hl:'if n <= 1',d:`Llamada fibonacci(${n}): ¿${n} <= 1?`,v:{n},st:st.slice()};
 let r;
 if(n<=1){r=n;yield {hl:'return n',d:`Caso base: fibonacci(${n}) = ${n}.`,v:{n,resultado:r},st:st.slice()}}
 else{
  yield {hl:'return fibonacci',d:`Necesito fibonacci(${n-1}) primero.`,v:{n},st:st.slice()};
  const a=yield* fibG(n-1,st);
  yield {hl:'return fibonacci',d:`Ya tengo fibonacci(${n-1}) = ${a}. Ahora necesito fibonacci(${n-2}).`,v:{n,parcial:a},st:st.slice()};
  const b=yield* fibG(n-2,st);
  r=a+b;
  yield {hl:'return fibonacci',d:`${a} + ${b} = ${r}: fibonacci(${n}) = ${r}.`,v:{n,resultado:r},st:st.slice()};
 }
 st.pop();return r}

function* msG(lista,st){
 st.push('merge_sort(['+lista.join(', ')+'])');
 yield {hl:'if len(lista)',d:`Llamada con [${lista.join(', ')}].`,arr:lista.slice(),st:st.slice()};
 if(lista.length<=1){yield {hl:'return lista',d:`Caso base: [${lista.join(', ')}] ya está ordenada.`,arr:lista.slice(),st:st.slice()};st.pop();return lista.slice()}
 const m=Math.floor(lista.length/2);
 yield {hl:'medio = len',d:`Parto en [${lista.slice(0,m).join(', ')}] y [${lista.slice(m).join(', ')}].`,arr:lista.slice(),st:st.slice()};
 const izq=yield* msG(lista.slice(0,m),st);
 const der=yield* msG(lista.slice(m),st);
 const res=[];let i=0,j=0;
 yield {hl:'resultado = []',d:`Mezclo [${izq.join(', ')}] con [${der.join(', ')}].`,arr:lista.slice(),st:st.slice()};
 while(i<izq.length&&j<der.length){
  yield {hl:'if izq[i] <= der[j]',d:`Comparo ${izq[i]} con ${der[j]} y saco el menor.`,arr:lista.slice(),st:st.slice()};
  if(izq[i]<=der[j])res.push(izq[i++]);else res.push(der[j++]);
 }
 res.push(...izq.slice(i),...der.slice(j));
 yield {hl:'resultado.extend(izq',d:`Agrego lo que sobra: [${res.join(', ')}].`,arr:res.slice(),st:st.slice()};
 st.pop();
 yield {hl:'return resultado',d:`Devuelvo [${res.join(', ')}].`,arr:res.slice(),st:st.slice()};
 return res}

function* recorrido(modo){
 const fr=['A'],vis={A:null},nombre=modo=='bfs'?'Cola':'Pila';
 const est=act=>nodeMap(n=>[n,n===act?'actual':fr.includes(n)?'cola':(n in vis)?'visitado':'']);
 const inf=()=>nodeMap(n=>[n,n in vis?(vis[n]?'desde '+vis[n]:'inicio'):'']);
 const cola=()=>fr.slice();
 yield {hl:modo=='bfs'?'frontera = deque':'pila = [inicio]',d:`Pongo A en la ${nombre.toLowerCase()} y lo marco como visitado.`,cola:cola(),nodes:est(null),info:inf()};
 while(fr.length){
  const act=modo=='bfs'?fr.shift():fr.pop();
  yield {hl:modo=='bfs'?'actual = frontera':'actual = pila',d:`Saco ${act} de la ${nombre.toLowerCase()}.`,cola:cola(),nodes:est(act),info:inf()};
  if(act==='D'){yield {hl:'if actual == meta',d:`¡${act} es la meta!`,cola:cola(),nodes:est(act),info:inf()};break}
  for(const v of GRAFO[act]){
   yield {hl:'for vecino',d:`Reviso el vecino ${v} de ${act}.`,cola:cola(),nodes:est(act),info:inf()};
   if(!(v in vis)){vis[v]=act;fr.push(v);yield {hl:'visitados[vecino]',d:`${v} es nuevo: lo marco (viene de ${act}) y lo agrego.`,cola:cola(),nodes:est(act),info:inf()}}
  }
 }
 const path=['D'];let p='D';while(vis[p]){p=vis[p];path.unshift(p)}
 yield {hl:'return visitados',d:`Camino encontrado: ${path.join(' → ')}.`,cola:[],nodes:est('D'),info:inf()}}

function* priori(modo){
 const H=modo=='astar'?HEUR:HEUR,costo={A:0},padre={A:null};
 let pq=[[modo=='voraz'?HEUR.A:HEUR.A,'A']];
 const nom=modo=='voraz'?'h':'f';
 const cola=()=>pq.map(x=>`${x[1]}(${nom}=${x[0]})`);
 const est=act=>nodeMap(n=>[n,n===act?'actual':pq.some(x=>x[1]===n)?'cola':(n in padre?'visitado':'')]);
 const inf=()=>nodeMap(n=>[n,modo=='voraz'?(n in padre?(padre[n]?'desde '+padre[n]:'inicio'):''):(n in costo?`g=${costo[n]} h=${HEUR[n]}`:'')]);
 yield {hl:modo=='voraz'?'cola.put((heur':'cola.put((heur',d:modo=='voraz'?'Pongo A en la cola con h = 4.':'Pongo A con f = h(A) = 4.',cola:cola(),nodes:est(null),info:inf()};
 while(pq.length){
  pq.sort((x,y)=>x[0]-y[0]);const [pr,act]=pq.shift();
  yield {hl:'_, actual',d:modo=='voraz'?`Saco ${act} (h = ${pr}): el que parece más cercano.`:`Saco ${act} con f = ${pr}: el más prometedor.`,cola:cola(),nodes:est(act),info:inf()};
  if(act==='D'){yield {hl:'if actual == meta',d:'¡Meta!',cola:cola(),nodes:est(act),info:inf()};break}
  for(const v of Object.keys(GPESO[act])){
   const nuevo=modo=='voraz'?0:costo[act]+GPESO[act][v];
   yield {hl:'for vecino',d:modo=='voraz'?`Reviso ${v} desde ${act}.`:`Desde ${act}, ${v} costaría ${nuevo}.`,cola:cola(),nodes:est(act),info:inf()};
   if(modo=='voraz'){
    if(!(v in padre)){padre[v]=act;pq.push([HEUR[v],v]);yield {hl:'padre[vecino] = actual',d:`${v} es nuevo: h = ${HEUR[v]}, lo encolo.`,cola:cola(),nodes:est(act),info:inf()}}
   }else if(!(v in costo)||nuevo<costo[v]){
    costo[v]=nuevo;padre[v]=act;const pf=modo=='astar'?nuevo+HEUR[v]:nuevo;pq.push([pf,v]);
    yield {hl:'costo[vecino] = nuevo',d:modo=='astar'?`${v}: g = ${nuevo}, h = ${HEUR[v]}, f = ${pf}. Lo encolo.`:`Mejora: ${v} queda con costo ${nuevo}.`,cola:cola(),nodes:est(act),info:inf()};
   }
  }
 }
 const path=['D'];let p='D';while(padre[p]){p=padre[p];path.unshift(p)}
 const cs=path.slice(1).reduce((s,x,k)=>s+GPESO[path[k]][x],0);
 yield {hl:modo=='voraz'?'return padre':'return costo.get',d:`Camino: ${path.join(' → ')}, costo ${cs}.`+(modo=='voraz'?' El óptimo es A → B → C → D, con costo 4.':` Costo mínimo de A a D: ${costo.D}.`),cola:[],nodes:est('D'),info:inf()}}

function* dijk(){
 const costo={A:0},padre={A:null};let pq=[[0,'A']];
 const cola=()=>pq.map(x=>`${x[1]}(${x[0]})`);
 const est=act=>nodeMap(n=>[n,n===act?'actual':pq.some(x=>x[1]===n)?'cola':(n in costo?'visitado':'')]);
 const inf=()=>nodeMap(n=>[n,n in costo?'costo '+costo[n]:'']);
 yield {hl:'cola.put((0',d:'Pongo A en la cola de prioridad con costo 0.',cola:cola(),nodes:est(null),info:inf()};
 while(pq.length){
  pq.sort((x,y)=>x[0]-y[0]);const [c,act]=pq.shift();
  yield {hl:'_, actual',d:`Saco ${act} con costo ${c}.`+(c>costo[act]?` Es una entrada vieja: el mejor conocido es ${costo[act]}.`:' Es el más barato pendiente.'),cola:cola(),nodes:est(act),info:inf()};
  if(act==='D'){yield {hl:'if actual == meta',d:'¡Meta!',cola:cola(),nodes:est(act),info:inf()};break}
  for(const v of Object.keys(GPESO[act])){
   const nuevo=costo[act]+GPESO[act][v];
   yield {hl:'for vecino',d:`Desde ${act}, ${v} costaría ${nuevo} (${costo[act]} + ${GPESO[act][v]}).`,cola:cola(),nodes:est(act),info:inf()};
   if(!(v in costo)||nuevo<costo[v]){costo[v]=nuevo;padre[v]=act;pq.push([nuevo,v]);yield {hl:'costo[vecino] = nuevo',d:`Mejora: ${v} queda con costo ${nuevo}.`,cola:cola(),nodes:est(act),info:inf()}}
   else yield {hl:'if vecino not in',d:`${v} ya tenía costo ${costo[v]}: no mejora.`,cola:cola(),nodes:est(act),info:inf()};
  }
 }
 yield {hl:'return costo.get',d:`Costo mínimo de A a D: ${costo.D}.`,cola:[],nodes:est('D'),info:inf()}}

const TRACE={
 lineal:{entrada:'lista = [4, 8, 12, 16], buscado = 12',arr:[4,8,12,16],gen:function*(){
  const lista=[4,8,12,16],x=12;
  yield {hl:'for i in',d:'Empiezo a recorrer la lista desde el índice 0.',v:{buscado:x}};
  for(let i=0;i<lista.length;i++){
   yield {hl:'if lista[i]',d:`Comparo lista[${i}] = ${lista[i]} con ${x}.`,v:{i},hi:[i]};
   if(lista[i]===x){yield {hl:'return i',d:`¡Igual! Devuelvo la posición ${i}.`,v:{i,resultado:i},hi:[i]};return i}
  }
  yield {hl:'return -1',d:'Recorrí toda la lista: no está.',v:{resultado:-1}};return -1}},

 binaria:{entrada:'lista = [1, 3, 5, 7, 9, 11], buscado = 7',arr:[1,3,5,7,9,11],gen:function*(){
  const lista=[1,3,5,7,9,11],x=7;let bajo=0,alto=lista.length-1;
  yield {hl:'bajo = 0',d:'Bajo empieza en el primer índice.',v:{bajo},rng:[0,lista.length-1]};
  yield {hl:'alto = len',d:'Alto empieza en el último índice.',v:{bajo,alto},rng:[bajo,alto]};
  while(bajo<=alto){
   const m=Math.floor((bajo+alto)/2);
   yield {hl:'while bajo',d:`¿${bajo} <= ${alto}? Sí: el valor todavía puede estar.`,v:{bajo,alto},rng:[bajo,alto]};
   yield {hl:'medio = ',d:`Miro el centro: índice ${m}, valor ${lista[m]}.`,v:{bajo,alto,medio:m},rng:[bajo,alto],hi:[m]};
   if(lista[m]===x){yield {hl:'return medio',d:`¡Encontrado en ${m}!`,v:{medio:m,resultado:m},hi:[m]};return m}
   if(lista[m]<x){bajo=m+1;yield {hl:'bajo = medio + 1',d:`${lista[m]} < ${x}: descarto la mitad izquierda.`,v:{bajo,alto},rng:[bajo,alto],hi:[m]}}
   else{alto=m-1;yield {hl:'alto = medio - 1',d:`${lista[m]} > ${x}: descarto la mitad derecha.`,v:{bajo,alto},rng:[bajo,alto],hi:[m]}}
  }
  yield {hl:'return -1',d:'Bajo superó a alto: no está.',v:{resultado:-1}};return -1}},

 burbuja:{entrada:'lista = [5, 1, 4, 2]',arr:[5,1,4,2],gen:function*(){
  const a=[5,1,4,2],n=a.length;
  yield {hl:'n = len',d:'Tomo el tamaño de la lista: 4 elementos.',arr:a.slice()};
  for(let i=0;i<n;i++){
   yield {hl:'for i in',d:`Pasada ${i+1}: el mayor de los no ordenados quedará al final.`,arr:a.slice(),rng:[0,n-i-1]};
   for(let j=0;j<n-i-1;j++){
    yield {hl:'for j in',d:`Comparo las posiciones ${j} y ${j+1}: ${a[j]} y ${a[j+1]}.`,arr:a.slice(),hi:[j,j+1]};
    if(a[j]>a[j+1]){
     yield {hl:'if lista[j]',d:`${a[j]} > ${a[j+1]}: hay que intercambiarlos.`,arr:a.slice(),hi:[j,j+1]};
     [a[j],a[j+1]]=[a[j+1],a[j]];
     yield {hl:'lista[j], lista[j + 1]',d:'Intercambiados.',arr:a.slice(),hi:[j,j+1]};
    }
   }
  }
  yield {hl:'return lista',d:`Lista ordenada: [${a.join(', ')}].`,arr:a.slice()};return a}},

 insercion:{entrada:'lista = [4, 2, 3]',arr:[4,2,3],gen:function*(){
  const a=[4,2,3];
  for(let i=1;i<a.length;i++){
   const clave=a[i];
   yield {hl:'clave = ',d:`Tomo la clave ${clave} (posición ${i}).`,arr:a.slice(),hi:[i],v:{i,clave}};
   let j=i-1;
   yield {hl:'j = i - 1',d:`Empiezo a comparar en la posición ${j}.`,arr:a.slice(),hi:[j],v:{i,clave,j}};
   while(j>=0&&a[j]>clave){
    yield {hl:'while j >= 0',d:`${a[j]} > ${clave}: desplazo ${a[j]} a la derecha.`,arr:a.slice(),hi:[j],v:{clave,j}};
    a[j+1]=a[j];
    yield {hl:'lista[j + 1] = lista[j]',d:`${a[j+1]} ya está en la posición ${j+1}.`,arr:a.slice(),hi:[j+1],v:{clave,j}};
    j--;
    yield {hl:'j -= 1',d:`Retrocedo: j = ${j}.`,arr:a.slice(),v:{clave,j}};
   }
   a[j+1]=clave;
   yield {hl:'lista[j + 1] = clave',d:`Coloco la clave ${clave} en la posición ${j+1}.`,arr:a.slice(),hi:[j+1],v:{clave,j}};
  }
  yield {hl:'return lista',d:`Lista ordenada: [${a.join(', ')}].`,arr:a.slice()};return a}},

 seleccion:{entrada:'lista = [5, 1, 4, 2]',arr:[5,1,4,2],gen:function*(){
  const a=[5,1,4,2],n=a.length;
  yield {hl:'n = len',d:'Tomo el tamaño de la lista: 4 elementos.',arr:a.slice()};
  for(let i=0;i<n;i++){
   let mi=i;
   yield {hl:'for i in',d:`Busco el menor desde la posición ${i}.`,arr:a.slice(),hi:[i]};
   yield {hl:'minimo = i',d:`Por ahora el mínimo es ${a[i]} (posición ${i}).`,arr:a.slice(),hi:[mi]};
   for(let j=i+1;j<n;j++){
    yield {hl:'for j in',d:`Comparo ${a[j]} con el mínimo actual ${a[mi]}.`,arr:a.slice(),hi:[j,mi]};
    if(a[j]<a[mi]){mi=j;yield {hl:'minimo = j',d:`${a[j]} es menor: nuevo mínimo.`,arr:a.slice(),hi:[mi]}}
   }
   [a[i],a[mi]]=[a[mi],a[i]];
   yield {hl:'lista[i], lista[minimo]',d:`Coloco el mínimo ${a[i]} en la posición ${i}.`,arr:a.slice(),hi:[i,mi]};
  }
  yield {hl:'return lista',d:`Lista ordenada: [${a.join(', ')}].`,arr:a.slice()};return a}},

 merge:{entrada:'lista = [6, 2, 5, 1]',arr:[6,2,5,1],gen:function*(){yield* msG([6,2,5,1],[])}},

 factorial:{entrada:'n = 4',arr:null,gen:function*(){yield* facG(4,[])}},
 fibonacci:{entrada:'n = 4',arr:null,gen:function*(){yield* fibG(4,[])}},

 euclides:{entrada:'a = 48, b = 18',arr:null,gen:function*(){
  let a=48,b=18;
  yield {hl:'while b != 0',d:'Empiezo con a = 48 y b = 18.',v:{a,b}};
  while(b!==0){
   yield {hl:'while b != 0',d:`b = ${b} no es 0: sigo.`,v:{a,b}};
   const oa=a,ob=b;[a,b]=[b,oa%ob];
   yield {hl:'a, b = b, a % b',d:`${oa} % ${ob} = ${oa%ob}. Ahora a = ${a}, b = ${b}.`,v:{a,b}};
  }
  yield {hl:'return a',d:`b es 0: el MCD es ${a}.`,v:{a,b}};return a}},

 bfs:{entrada:'grafo A→B, A→C, B→D, C→D · inicio A · meta D',nodos:NODOS,colaNom:'Cola',gen:function*(){yield* recorrido('bfs')}},
 dfs:{entrada:'mismo grafo · inicio A · meta D',nodos:NODOS,colaNom:'Pila',gen:function*(){yield* recorrido('dfs')}},
 dijkstra:{entrada:'A→B (1), A→C (4), B→C (2), C→D (1) · de A a D',nodos:NODOS,colaNom:'Cola de prioridad',gen:function*(){yield* dijk()}},
 astar:{entrada:'mismo grafo de Dijkstra · h: A = 4, B = 3, C = 1, D = 0',nodos:NODOS,colaNom:'Cola de prioridad',gen:function*(){yield* priori('astar')}},
 voraz:{entrada:'mismo grafo · h: A = 4, B = 3, C = 1, D = 0',nodos:NODOS,colaNom:'Cola de prioridad',gen:function*(){yield* priori('voraz')}}
};

V.viz=id=>{const a=alg(id),T0=TRACE[id]||labTrace(id);
 if(!a)return go('catalogo');
 if(!T0){A.innerHTML=back('ficha',id)+'<h2>▶️ Ejecución</h2><div class=card><p class=mut>Este algoritmo no tiene animación fija. Ejecútalo en el Laboratorio Python para ver su traza real.</p></div>';return}
 VZ={id,T:T0,steps:[...T0.gen()],i:0};vzDraw()};
function vzDraw(){const s=VZ.steps[VZ.i],a=alg(VZ.id),lines=clean(a.code).split('\n');
 const hit=s.ln!=null?s.ln-1:(s.hl?lines.findIndex(l=>l.trim().startsWith(s.hl)):-1);
 const arr=s.arr||VZ.T.arr;
 const cells=arr?'<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">'+arr.map((x,i)=>{const hi=(s.hi||[]).includes(i),rg=s.rng&&i>=s.rng[0]&&i<=s.rng[1];
  return `<div style="text-align:center"><div style="min-width:44px;padding:10px 6px;border-radius:10px;font-weight:700;background:${hi?'#1e6fe8':rg?'#d6e6ff':'#fff'};color:${hi?'#fff':'#0f2a4a'};border:1px solid #d5e3f7">${x}</div><small class=mut>${i}</small></div>`}).join('')+'</div>':'';
 const nodos=VZ.T.nodos?'<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">'+VZ.T.nodos.map(n=>{const st=(s.nodes||{})[n]||'',inf=(s.info||{})[n]||'',bg=st=='actual'?'#1e6fe8':st=='cola'?'#fff3cd':st=='visitado'?'#cfe2ff':'#fff',col=st=='actual'?'#fff':'#0f2a4a';
  return `<div style="text-align:center;min-width:72px;padding:8px;border-radius:12px;background:${bg};color:${col};border:1px solid #d5e3f7"><b>${n}</b><br><small>${esc(inf)}</small></div>`}).join('')+'</div><small class=mut>Azul: actual · amarillo: en la cola · celeste: visitado</small>':'';
 const cola=s.cola?`<p><b>${esc(VZ.T.colaNom||'Cola')}:</b> ${s.cola.length?'['+s.cola.map(x=>esc(x)).join(', ')+']':'(vacía)'}</p>`:'';
 const frames=s.st?`<p><b>Pila de llamadas</b> (arriba, la llamada activa):</p><pre>${s.st.slice().reverse().map(f=>esc(f)).join('\n')}</pre>`:'';
 const vars=s.v?`<table><tr>${Object.keys(s.v).map(k=>`<th>${esc(k)}</th>`).join('')}</tr><tr>${Object.values(s.v).map(x=>`<td>${x==null?'—':esc(x)}</td>`).join('')}</tr></table>`:'';
 A.innerHTML=back('ficha',VZ.id)+`<h2>▶️ ${esc(a.n)}</h2><p class=mut>Entrada: ${esc(VZ.T.entrada)}</p>`
 +`<div class=card><small class=mut>Paso ${VZ.i+1} de ${VZ.steps.length}</small><p style="font-size:17px;margin:6px 0"><b>${esc(s.d)}</b></p>${cells}${nodos}${cola}${vars}</div>`
 +`<pre>${lines.map((l,i)=>`<span style="display:block;${i==hit?'background:#cfe2ff;border-radius:6px;font-weight:700':''}">${esc(l)}</span>`).join('')}</pre>`
 +(frames?`<div class=card>${frames}</div>`:'')
 +`<div class=top><button onclick="vzGo(-1)" ${VZ.i==0?'disabled':''}>⬅️ Anterior</button><button onclick="vzReset()">↺ Inicio</button><button class=p onclick="vzGo(1)" ${VZ.i>=VZ.steps.length-1?'disabled':''}>Siguiente ➡️</button></div>`}
function vzGo(k){VZ.i=Math.max(0,Math.min(VZ.steps.length-1,VZ.i+k));vzDraw()}
function vzReset(){VZ.i=0;vzDraw()}
