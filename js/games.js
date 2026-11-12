'use strict';
/* AlgoForja · juegos: los 6 modos de siempre + simulación manual + comparar/identificar + completar identificando */
let R,hearts,mist,VV=[];
const XM=[['cmp','🔍','Comparar e identificar'],['fal','🧩','Completar identificando']];

const MUT=[[/==/,'!=','Cambiar == por != invierte la condición.'],[/!=/,'==','Cambiar != por == invierte la condición.'],[/<=/,'<','Quitar el = excluye el caso de igualdad.'],[/>=/,'>','Quitar el = excluye el caso de igualdad.'],[/ < /,' > ','Invertir el comparador cambia qué caso se cumple.'],[/ > /,' < ','Invertir el comparador cambia qué caso se cumple.'],[/ \+ /,' - ','Cambiar + por - altera el cálculo.'],[/ - /,' + ','Cambiar - por + altera el cálculo.'],[/\band\b/,'or','and exige ambas condiciones; or solo una.'],[/\bor\b/,'and','or acepta una de las condiciones; and exige ambas.'],[/\b\d+\b/,m=>String(+m+1),'Se cambió un valor constante (error de uno de más o de menos).']];
const why=(L,I,i,t)=>`En «${L[i].s}» (${say(L[i].s)}): `+(I.par.includes(t)?`«${t}» es una entrada del algoritmo.`:/^(==|!=|<=|>=|<|>)$/.test(t)?`«${t}» es el comparador que decide la condición.`:/^-?\d/.test(t)?`«${t}» es un valor constante necesario aquí.`:`«${t}» es ${['una entrada','una variable interna','la variable que se devuelve'][I.role(t)]} del algoritmo.`);

// ---- generadores de retos ----
const GEN={
rx(L){const I=info(L),B=shuf(L.filter(l=>l.k!='def')).slice(0,3).map(l=>{const a=SK[l.k];return{t:'quiz',q:'¿Qué estructura de control es esta línea?',code:l.t,o:SN,a,w:`«${say(l.s)}» es ${SN[a].toLowerCase()}: ${SW[a]}`,bad:i=>`Elegiste «${SN[i]}» (${SW[i]}) Pero «${say(l.s)}» es ${SN[a].toLowerCase()}: ${SW[a]}`}});
 return B.concat(shuf(I.vars).slice(0,2).map(v=>{const a=I.role(v),w=[`«${v}» es parámetro de ${I.name}(${I.par.join(', ')}): llega desde fuera.`,`«${v}» no llega como parámetro ni se devuelve directamente: guarda estado dentro del algoritmo.`,`«${v}» aparece en un return: es lo que entrega el algoritmo.`][a];return{t:'quiz',q:`¿Qué papel tiene «${v}» en este algoritmo?`,code:L.map(l=>l.t).join('\n'),o:ROLES,a,w,bad:i=>`Elegiste «${ROLES[i]}», pero ${w}`}}))},
hu(L){const I=info(L),C=[];L.forEach((l,i)=>{if(l.k!='def')for(const m of l.t.matchAll(TOK))if(!KW.has(m[0]))C.push([i,m[0]])});
 const mk=n=>{const by=shuf([...new Set(C.map(c=>c[0]))]).slice(0,n).sort((a,b)=>a-b);if(!by.length)return 0;
  const rows=L.map(l=>l.t),ans=[],W=[];
  by.forEach(i=>{const m=pick1([...L[i].t.matchAll(TOK)].filter(m=>!KW.has(m[0])));rows[i]=rows[i].slice(0,m.index)+'___'+rows[i].slice(m.index+m[0].length);ans.push(m[0]);W.push(why(L,I,i,m[0]))});
  const d=shuf([...new Set(C.map(c=>c[1]))].filter(x=>!ans.includes(x))).slice(0,3);
  return{t:'fill',q:`Completa ${by.length} hueco${by.length>1?'s':''}`,code:rows.join('\n'),bank:shuf(ans.concat(d)),ans,why:W,sol:L.map(l=>l.t).join('\n'),w:'Código completo. Fíjate en qué variables existen antes de cada línea.'}};
 return[mk(1),mk(2),mk(4)].filter(Boolean)},
or(L){const mk=n=>{n=Math.min(n,L.length);if(n<3)return 0;const s=Math.floor(Math.random()*(L.length-n+1)),it=L.slice(s,s+n).map(l=>l.t);return{t:'order',q:'Ordena este bloque del algoritmo',items:it,sol:it.join('\n'),w:'La indentación te dice qué va dentro de qué.'}};return[mk(4),mk(7)].filter(Boolean)},
tr(L){const B=L.filter(l=>l.k!='def'),U=[...new Set(B.map(l=>l.s))];if(U.length<2)return[];
 return shuf(B).slice(0,5).map(l=>{const o=shuf([l.s,...shuf(U.filter(x=>x!=l.s)).slice(0,3)]);return{t:'quiz',m:1,q:`«${say(l.s)}». ¿Qué línea es?`,o,a:o.indexOf(l.s),w:`Correcto: ${l.s} se lee «${say(l.s)}».`,bad:i=>`Elegiste «${o[i]}», que se lee «${say(o[i])}». La línea que dice «${say(l.s)}» es ${l.s}.`}})},
bg(L){const mk=()=>{const c=[];L.forEach((l,i)=>{if(l.k!='def')MUT.forEach(([re,r,d])=>{const n=l.t.replace(re,r);if(n!=l.t)c.push([i,n,d])})});
  if(!c.length)return 0;const[i,n,d]=pick1(c),rows=L.map(l=>l.t);rows[i]=n;
  return{t:'pick',q:'Alguien alteró UNA línea. ¿Cuál es?',lines:rows,a:i,w:`Antes decía: ${L[i].s}. Ahora: ${n.trim()}. ${d}`,bad:j=>`La línea ${j+1} está bien: «${say(rows[j].trim())}». La alterada es la ${i+1}: antes «${L[i].s}», ahora «${n.trim()}». ${d}`}};
 return[mk(),mk(),mk()].filter(Boolean)},
ci(L){return[{t:'blind',q:'Reconstruye el código desde el esqueleto',ref:L.map(l=>l.t),sol:L.map(l=>l.t).join('\n'),sk:L.map(l=>l.t.slice(0,l.t.length-l.s.length)+(l.k=='asg'?l.s.match(/^[^=+\-*\/ ]+/)[0]+' …':l.s.split(/[\s(:]/)[0]+' …')).join('\n')}]}};


// ---- rasgos del código (para identificar y comparar algoritmos) ----
const FE=[
['rec','usa recursión (la función se llama a sí misma)',(c,L,I)=>I.name!='(sin función)'&&c.split(new RegExp('\\b'+I.name+'\\s*\\(')).length>2],
['for','recorre con un ciclo for',c=>/^\s*for\b/m.test(c)],
['while','usa un ciclo while',c=>/^\s*while\b/m.test(c)],
['nest','tiene ciclos anidados',(c,L)=>{const lp=L.filter(l=>l.k=='loop'),d=l=>l.t.length-l.s.length;return lp.some((l,i)=>lp.slice(0,i).some(p=>d(p)<d(l)))}],
['pq','usa una cola de prioridad',c=>/priorityqueue|heapq|heappush|priority/i.test(c)],
['q','usa una cola o una pila',c=>/deque|popleft|\bqueue\b|stack|pila|\.pop\(/i.test(c)],
['heur','usa una heurística',c=>/heuristic|heur/i.test(c)],
['half','parte el problema por la mitad',c=>/\/\/\s*2|\/\s*2\b|\bmid\b|medio/i.test(c)],
['swap','intercambia elementos de lugar',c=>/\w\[[^\]]*\]\s*,\s*\w+\[[^\]]*\]\s*=|\btemp\b|\baux\b/i.test(c)],
['neg','devuelve -1 o None cuando no encuentra',c=>/return\s+(-1|None)/.test(c)],
['brk','corta el ciclo con break',c=>/^\s*break\b/m.test(c)],
['cost','acumula un costo',c=>/cost|g_score|dist/i.test(c)],
['vis','recuerda qué ya visitó',c=>/visited|explored|visitado/i.test(c)]];

// Para los juegos de identificar: el código no debe revelar el algoritmo (nombres de funciones e imports)
const ANON_ID={heuristica:'h',PriorityQueue:'Cola',deque:'Cola'};
function anon(code){
 let c=clean(code);
 const defs=[...new Set([...c.matchAll(/^\s*def\s+(\w+)/gm)].map(m=>m[1]))];
 defs.forEach((n,i)=>{c=c.replace(new RegExp('\\b'+n+'\\b','g'),'f'+(i+1))});
 return c.split('\n').filter(l=>!/^\s*(from|import)\s/.test(l)).map(l=>l.replace(/\b(heuristica|PriorityQueue|deque)\b/g,m=>ANON_ID[m])).join('\n')}
const feats=a=>{const c=clean(a.code),L=parse(c),I=info(L);return FE.filter(f=>f[2](c,L,I))},fk=a=>new Set(feats(a).map(f=>f[0]));
const pool=()=>S.algs.concat(CAT);
function idCh(a,P){const same=P.filter(x=>x!=a&&x.cat&&x.cat==a.cat),oth=P.filter(x=>x!=a&&!same.includes(x)),o=shuf([a,...shuf(same).concat(shuf(oth)).slice(0,3)]),fa=feats(a);
 return{t:'quiz',q:'¿Qué algoritmo es este código?',code:anon(a.code),o:o.map(x=>x.n),a:o.indexOf(a),
  w:`Es «${a.n}». Rasgos: ${fa.map(f=>f[1]).slice(0,4).join('; ')||'sin rasgos distintivos'}.`,
  bad:i=>{const kw=fk(o[i]),d=fa.filter(f=>!kw.has(f[0])).map(f=>f[1]).slice(0,2);return`No es «${o[i].n}». `+(d.length?`Este código ${d.join(' y ')}, algo que «${o[i].n}» no hace. `:'Se parecen mucho, pero la lógica de sus líneas los distingue. ')+`Es «${a.n}».`}}}
function cmpCh(P){const ps=shuf(P);for(const a of ps)for(const b of ps){if(a==b)continue;const ka=fk(a),kb=fk(b),d=FE.filter(f=>ka.has(f[0])!=kb.has(f[0]));if(!d.length)continue;
 const f=pick1(d),aw=ka.has(f[0]),w=aw?a:b,x=aw?b:a;
 return{t:'quiz',q:`¿Cuál de estos dos algoritmos ${f[1]}?`,codes:[{h:'Algoritmo A',c:anon(a.code)},{h:'Algoritmo B',c:anon(b.code)}],o:['A','B'],a:aw?0:1,
  w:`${aw?'A':'B'} es «${w.n}» y ${f[1]}; el otro («${x.n}») no.`,bad:i=>`Elegiste ${'AB'[i]}, pero el que ${f[1]} es ${aw?'A':'B'} («${w.n}»). El otro («${x.n}») no.`}}return 0}
function misCh(a,P){const L=parse(anon(a.code)),n=Math.random()<.5?1:2,ok=i=>i+n<=L.length&&L.slice(i,i+n).every(l=>l.k!='def'),st=L.map((_,i)=>i).filter(ok);if(st.length<3)return 0;
 const i=pick1(st),blk=L.slice(i,i+n),ind=blk[0].t.slice(0,blk[0].t.length-blk[0].s.length),
 norm=b=>{const m=Math.min(...b.map(l=>l.t.length-l.s.length));return b.map(l=>ind+l.t.slice(m)).join('\n')},ans=norm(blk),rows=L.map(l=>l.t);rows.splice(i,n,ind+'________');
 const mine=st.filter(j=>j+n<=i||j>=i+n).map(j=>norm(L.slice(j,j+n))),other=[];
 P.filter(x=>x!=a).forEach(x=>{const M=parse(anon(x.code));for(let j=0;j+n<=M.length;j++)if(M.slice(j,j+n).every(l=>l.k!='def'))other.push(norm(M.slice(j,j+n)))});
 const d=[...new Set(shuf(mine).slice(0,3).concat(shuf(other).slice(0,2)))].filter(x=>x!=ans).slice(0,3);if(!d.length)return 0;
 const o=shuf([ans,...d]),rd=x=>x.split('\n').map(y=>say(y.trim())).join(' → ');
 return{t:'quiz',m:1,q:'Falta una parte del código. ¿Cuál es?',code:rows.join('\n'),o,a:o.indexOf(ans),w:`Faltaba: «${rd(ans)}».`,bad:j=>`Elegiste «${rd(o[j])}». Aquí faltaba «${rd(ans)}», que es lo que encaja en ese punto del algoritmo.`}}
const GX={
cmp(){const P=pool();if(P.length<2)return[];const out=shuf(P).slice(0,3).map(a=>idCh(a,P));for(let k=0;k<2;k++){const c=cmpCh(P);if(c)out.push(c)}return out},
fal(){const P=pool();if(!P.length)return[];if(P.length>1)return shuf(P).slice(0,2).flatMap(a=>[idCh(a,P),misCh(a,P)]).filter(Boolean);const a=P[0];return[misCh(a,P),misCh(a,P),misCh(a,P)].filter(Boolean)}};

function miss(msg){mist++;hearts--;$('#hp').textContent='❤️'.repeat(Math.max(hearts,0))||'💔';
 const s=R.ch[R.i],d=hearts<=0;
 $('#fb').innerHTML=`<p>❌ ${esc(msg||'')}</p>`+(d?`<p>💔 Te quedaste sin vidas. Esta era la solución:</p>${s.sol?`<pre>${esc(s.sol)}</pre>`:''}<button class=p onclick="again()">Reintentar</button>`:'');
 if(d)$('#z').style.pointerEvents='none';return d}
const cont=()=>{const l=R.i==R.ch.length-1;return`<button class=p onclick="${l?'fin()':'nx()'}">${l?'Terminar ✓':'Continuar →'}</button>`};
function nx(){R.i++;draw()}
function win(w){$('#z').style.pointerEvents='none';$('#fb').innerHTML=`<p>✅ ${esc(w||'¡Bien!')}</p>`+cont()}
function fin(){const st=mist==0?3:mist<=2?2:1;award(R.a,R.mode,st);
 A.innerHTML=`<div class=card style="text-align:center"><h2>${'⭐'.repeat(st)}</h2><p>${mist?mist+' fallo(s)':'¡Sin fallos!'} · ${S.xp} XP</p><button class=p onclick="again()">🔁 Otra ronda</button> <button onclick="quit()">Volver</button></div>`}
function launch(mode,a,back,gen){const ch=gen();if(!ch.length)return alert(mode in GX?'Necesitas al menos 2 algoritmos distintos en tu catálogo para este juego.':'Este código no da para este modo (muy corto o le faltan elementos).');
 R={mode,a,back,gen,ch,i:0};hearts=3;mist=0;draw()}
const again=()=>launch(R.mode,R.a,R.back,R.gen);
const quit=()=>R&&R.back?go(...R.back):go('juego');
function start(id,mode){const a=alg(id);launch(mode,a,['jugar',id],()=>GEN[mode](parse(a.code)))}
function startX(mode){launch(mode,{id:'_g'},['juego'],GX[mode])}
function draw(){const s=R.ch[R.i],md=[...MODES,...XM].find(m=>m[0]==R.mode);
 let h=`<div class=top><button onclick=quit()>✕</button><small>${md[1]} ${md[2]} · ${R.i+1}/${R.ch.length}</small><span id=hp>${'❤️'.repeat(hearts)}</span></div><div class=card><h3>${esc(s.q)}</h3>`;
 if(s.code&&s.t=='quiz')h+=`<pre>${esc(s.code)}</pre>`;
 if(s.codes)h+=s.codes.map(x=>`<p class=mut style="margin:8px 0 0"><b>${esc(x.h)}</b></p><pre>${esc(x.c)}</pre>`).join('');
 A.innerHTML=h+'<div id=z></div><div id=fb></div></div>';T[s.t](s)}
const bind=s=>{const els=[...document.querySelectorAll('#z [data-i]')];els.forEach(b=>b.onclick=()=>{const i=+b.dataset.i;
 if(i==s.a){b.classList.add('ok');win(s.w)}
 else{b.classList.add('no');const c=els.find(e=>+e.dataset.i==s.a);if(c)c.classList.add('ok');$('#z').style.pointerEvents='none';
  if(!miss(s.bad?s.bad(i):(s.w||'')))$('#fb').insertAdjacentHTML('beforeend',cont())}})};
const T={
quiz(s){$('#z').innerHTML=shuf(s.o.map((t,i)=>[t,i])).map(([t,i])=>`<button class="opt ${s.m?'code':''}" data-i=${i}>${esc(t)}</button>`).join('');bind(s)},
pick(s){$('#z').innerHTML='<pre>'+s.lines.map((l,i)=>`<span class=ln data-i=${i}>${esc(l)||' '}</span>`).join('')+'</pre>';bind(s)},
order(s){let pool=shuf(s.items.map((t,i)=>[t,i])),ch=[];
 const r=()=>{$('#z').innerHTML=ch.map(([t],j)=>`<button class="opt code ok" data-c=${j}>${esc(t)}</button>`).join('')+'<hr style="opacity:.2">'+pool.map(([t],j)=>`<button class="opt code" data-p=${j}>${esc(t)}</button>`).join('')+`<button class=p id=chk ${pool.length?'disabled':''}>Comprobar</button>`;
  document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ch.push(pool.splice(+b.dataset.p,1)[0]);r()});
  document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{pool.push(ch.splice(+b.dataset.c,1)[0]);r()});
  $('#chk').onclick=()=>{const k=ch.findIndex(([t],j)=>t!=s.items[j]);if(k<0)win(s.w);
   else if(!miss(`La posición ${k+1} no es «${say(ch[k][0].trim())}». Ahí va «${say(s.items[k].trim())}» (${s.items[k].trim()}). ${s.w} Lo que ya iba bien se queda en su sitio.`)){pool=shuf(pool.concat(ch.splice(k)));r()}}};r()},
fill(s){const P=s.code.split('___');let v=P.slice(1).map(()=>-1);
 const r=()=>{$('#z').innerHTML='<pre>'+P.map((p,j)=>esc(p)+(j<v.length?`<span class=blank data-b=${j}>${v[j]<0?'&nbsp;&nbsp;&nbsp;':esc(s.bank[v[j]])}</span>`:'')).join('')+'</pre>'
  +s.bank.map((t,i)=>`<span class=chip data-k=${i} style="${v.includes(i)?'opacity:.3;pointer-events:none':''}">${esc(t)}</span>`).join('')+'<br><button class=p id=chk>Comprobar</button>';
  document.querySelectorAll('[data-k]').forEach(c=>c.onclick=()=>{const j=v.indexOf(-1);if(j>=0){v[j]=+c.dataset.k;r()}});
  document.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{v[+b.dataset.b]=-1;r()});
  $('#chk').onclick=()=>{const bad=v.map((x,j)=>x<0||s.bank[x]!==s.ans[j]);
   if(!bad.some(Boolean))win(s.w);else if(!miss(bad.map((b,j)=>b?`Hueco ${j+1}: iba «${s.ans[j]}». ${s.why[j]}`:'').filter(Boolean).join(' '))){v=v.map((x,j)=>bad[j]?-1:x);r()}}};r()},
blind(s){$('#z').innerHTML=`<pre>${esc(s.sk)}</pre><textarea id=tx placeholder="Escribe el código completo, sin mirar"></textarea><button class=p id=chk>Comprobar</button>`;
 $('#chk').onclick=()=>{const n=x=>x.replace(/\s+/g,''),u=$('#tx').value.split('\n').map(n).filter(Boolean),fal=[];
  s.ref.forEach(r=>{const j=u.indexOf(n(r));if(j<0)fal.push(r.trim());else u.splice(j,1)});const ok=s.ref.length-fal.length;
  if(ok/s.ref.length>=.85)win(`${ok}/${s.ref.length} líneas correctas.`+(fal.length?` Faltó: ${fal.map(x=>`${x} («${say(x)}»)`).join(' | ')}`:''));
  else miss(`Vas ${ok}/${s.ref.length}. Te falta, por ejemplo: «${say(fal[0])}» → ${fal[0]}`)}}};


// ---- pantallas de juego ----
const rowA=a=>`<button class="card node" onclick="go('jugar','${a.id}')"><span style="flex:1;text-align:left"><b>${esc(a.n)}</b>${a.cat?`<br><small class=mut>${esc(a.cat)}</small>`:''}<div class=bar><i style="width:${stars(a)/(MODES.length*3)*100}%"></i></div></span><span class=pill>${stars(a)} ⭐</span></button>`;
V.juego=()=>{const g=S.prog._g||{},P=S.algs.length+CAT.length;
 A.innerHTML=back()+'<h2>🎮 Juego</h2>'
 +big('🎯','Un algoritmo','Los 6 modos de práctica + simulación manual',"go('elegir')")
 +big('🔍','Comparar e identificar',`Reconoce algoritmos entre varios ${'⭐'.repeat(g.cmp||0)}`,"startX('cmp')")
 +big('🧩','Completar código identificando',`Reconoce el algoritmo y completa lo que falta ${'⭐'.repeat(g.fal||0)}`,"startX('fal')")
 +(P<2?'<p class=mut>Para los dos últimos juegos conviene tener al menos 2 algoritmos en tu catálogo.</p>':'')};
V.elegir=()=>{A.innerHTML=back('juego')+'<h2>🎯 Elige un algoritmo</h2>'+(S.algs.concat(CAT).map(rowA).join('')||'<p class=mut>Aún no tienes algoritmos. Agrega uno desde «Aprende un nuevo algoritmo».</p>')};
V.jugar=id=>{const a=alg(id);
 A.innerHTML=back('algo',id)+`<h2>${esc(a.n)}</h2>`
 +MODES.map(m=>`<button class=node onclick="start('${id}','${m[0]}')"><span style="font-size:24px">${m[1]}</span><span style="flex:1;text-align:left"><b>${m[2]}</b><br><small class=mut>${m[3]}</small></span><span>${'⭐'.repeat(stOf(a)[m[0]]||0)||'▶️'}</span></button>`).join('')
 +`<button class=node onclick="go('sim','${id}')"><span style="font-size:24px">🧮</span><span style="flex:1;text-align:left"><b>Simulación manual</b><br><small class=mut>Paso 6: tabla de seguimiento</small></span></button>`};
V.sim=id=>{VV=info(parse(alg(id).code)).vars.slice(0,7);
 A.innerHTML=back('jugar',id)+`<h2>🧮 Simulación manual</h2><p class=mut>Elige datos pequeños y anota cómo cambia cada variable. Por cada línea pregúntate: ¿qué valor tiene antes? ¿y después? ¿qué se perdería si no se ejecutara?</p><div style="overflow-x:auto"><table id=tb><tr><th>#</th>${VV.map(v=>`<th>${esc(v)}</th>`).join('')}</tr></table></div><button onclick=addRow()>+ fila</button>`;addRow();addRow()};
function addRow(){const t=$('#tb'),r=t.insertRow();r.innerHTML=`<td>${t.rows.length-1}</td>`+VV.map(()=>'<td contenteditable style="min-width:48px"></td>').join('')}
