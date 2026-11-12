'use strict';
/* AlgoForja · aprendizaje: detección de algoritmos clásicos y ficha de estudio */
const PQ=/priorityqueue|heapq|heappush|priority/i,HE=/heuristic|heur/i,CO=/cost_so_far|g_score|new_cost|dist/i,VI=/visited|explored|visitado/i;
const KB=[
{n:'Búsqueda lineal',k:[[/for\b.*\bin\b/,1],[/==/,1],[/\b(mid|medio|low|high|pivot)\b/i,-4],[/buscar|search|lineal|find/i,2],[/\bwhile\b/,-1]],o:'Encontrar un elemento en una colección y dar su posición.',e:'Fuerza bruta: compara uno por uno, en orden, hasta hallarlo o agotar la lista.',d:'Una lista (no necesita orden) y un índice de recorrido.',c:'O(n) tiempo, O(1) espacio.',r:['Olvidar el break o return al encontrarlo.','Devolver 0 en vez de -1 cuando no existe.'],t:'Si la lista está ordenada, la búsqueda binaria es mucho más rápida.'},
{n:'Búsqueda binaria',k:[[/\b(mid|medio)\b/i,3],[/\/\/ ?2|\/ ?2/,2],[/\b(low|lo|izq|left)\b/i,1],[/\b(high|hi|der|right)\b/i,1],[/binar/i,3],[/merge|sort|pivot/i,-4]],o:'Encontrar un elemento en una lista ORDENADA.',e:'Divide y vencerás: mira el centro y descarta la mitad donde no puede estar.',d:'Lista ordenada, dos límites (bajo y alto) y el punto medio.',c:'O(log n) tiempo.',r:['Usarla con la lista sin ordenar.','Límites mal actualizados (mid+1 / mid-1, < vs <=): provoca bucles infinitos.'],t:'El bucle típico es while bajo <= alto; actualiza siempre uno de los límites.'},
{n:'Ordenamiento burbuja',k:[[/j\s*\+\s*1/,2],[/for[\s\S]*for/,2],[/burbuja|bubble/i,3],[/\w\[[^\]]*\]\s*,\s*\w+\[[^\]]*\]\s*=|temp|aux/i,2]],o:'Ordenar una lista.',e:'Compara pares de vecinos y los intercambia si están desordenados; el mayor «sube» al final en cada pasada.',d:'Lista y dos ciclos anidados (pasadas y comparaciones).',c:'O(n²) tiempo, O(1) espacio.',r:['Pasarse del rango: j+1 debe existir.','Intercambiar sin variable auxiliar y perder un valor.'],t:'Con una bandera «hubo intercambio» puede cortar antes si ya está ordenada.'},
{n:'Ordenamiento por inserción',k:[[/\bkey\b/i,2],[/while\s+\w+\s*>=?\s*0/,3],[/insert|inserci/i,3]],o:'Ordenar una lista.',e:'Toma cada elemento y lo inserta en su lugar dentro de la parte ya ordenada, desplazando mayores.',d:'Lista, una clave (key) y un índice j que retrocede.',c:'O(n²) peor caso, O(n) si ya está casi ordenada.',r:['Olvidar colocar la clave al final (arr[j+1] = key).','Condición de while sin controlar j >= 0.'],t:'Es muy buena para listas pequeñas o casi ordenadas.'},
{n:'Merge sort',k:[[/merge|mezcl/i,4],[/\b(mid|medio)\b/i,1],[/left|right|izq|der/i,1]],o:'Ordenar una lista.',e:'Divide y vencerás: parte en mitades, ordena cada una recursivamente y las mezcla.',d:'Sublistas izquierda y derecha, índices de mezcla y recursión.',c:'O(n log n) siempre, O(n) espacio extra.',r:['Sin caso base (lista de 0 o 1 elementos).','No copiar los restos al terminar la mezcla.'],t:'Estable y de rendimiento predecible.'},
{n:'Quicksort',k:[[/pivot|pivote/i,4],[/quick/i,3],[/less|greater|menores|mayores|left|right/i,1]],o:'Ordenar una lista.',e:'Elige un pivote, separa menores y mayores, y ordena cada parte recursivamente.',d:'Pivote, particiones y recursión.',c:'O(n log n) promedio, O(n²) peor caso.',r:['Sin caso base.','Pivote siempre en un extremo con datos ya ordenados.'],t:'En la práctica suele ser el más rápido, pero no es estable.'},
{n:'Búsqueda en anchura (BFS)',k:[[/deque|popleft|pop\(0\)|queue/i,3],[VI,2],[/heuristic|priority|heap|cost|dist/i,-4],[/bfs|anchura|breadth/i,3]],o:'Hallar el camino con menos pasos en un grafo sin costos.',e:'Explora por niveles usando una cola FIFO: primero lo más cercano al inicio.',d:'Cola (frontera), visited y parent/came_from.',c:'O(V+E) tiempo y espacio.',r:['Marcar visitado al sacar de la cola (duplica nodos) en vez de al meterlo.','Usar pila en vez de cola.'],t:'Es completa y óptima cuando todos los pasos cuestan lo mismo.'},
{n:'Búsqueda en profundidad (DFS)',k:[[/stack|pila/i,2],[/\bpop\(\)/,1],[VI,1],[/dfs|profund|depth/i,3],[/queue|popleft|heap|priority/i,-4]],o:'Recorrer o buscar en un grafo yendo lo más profundo posible.',e:'Pila LIFO (o recursión): sigue una rama hasta el final y luego retrocede.',d:'Pila o recursión, y visited.',c:'O(V+E) tiempo; poca memoria.',r:['No marcar visitados y caer en ciclos.','No garantiza el camino más corto.'],t:'Útil para explorar todo, detectar ciclos y backtracking.'},
{n:'Búsqueda voraz (Greedy Best-First)',k:[[PQ,2],[HE,3],[/cost_so_far|g_score|new_cost/i,-4],[/greedy|voraz/i,3]],o:'Llegar a la meta siguiendo lo que parece más cercano.',e:'Cola de prioridad ordenada solo por h(n), la estimación hasta la meta.',d:'Cola de prioridad, heurística, explored y came_from.',c:'Depende de la heurística; no garantiza el camino óptimo.',r:['Creer que encuentra el menor costo.','Priorizar por costo acumulado: eso ya no es voraz.'],t:'Rápida pero puede dar rodeos. Compárala con A*.'},
{n:'A*',k:[[PQ,2],[HE,2],[/cost_so_far|g_score|new_cost/i,3],[/astar|a_star|a\*/i,3]],o:'Hallar el camino de menor costo guiándose por una heurística.',e:'Cola de prioridad con f(n) = g(n) + h(n): costo real acumulado más estimación restante.',d:'Cola de prioridad, cost_so_far, came_from y heurística.',c:'Depende de la heurística; óptimo si h es admisible.',r:['Priorizar solo por h o solo por g.','No actualizar costo y padre al hallar un camino mejor.'],t:'Revisa siempre: new_cost = g(actual) + costo de la arista, y priority = new_cost + h.'},
{n:'Dijkstra / costo uniforme',k:[[PQ,2],[CO,2],[HE,-4],[/dijkstra|uniforme/i,3]],o:'Hallar el camino de menor costo sin heurística.',e:'Cola de prioridad ordenada por g(n), el costo acumulado.',d:'Cola de prioridad, dist/cost_so_far y came_from.',c:'O((V+E) log V) con montículo.',r:['Costos negativos (no los admite).','No relajar la arista cuando hay un camino mejor.'],t:'Es A* con h(n) = 0.'},
{n:'Minimax',k:[[/minimax/i,4],[/maximiz/i,2],[/\b(max|min)\(/,1],[/alpha|beta/i,-2]],o:'Elegir la mejor jugada en un juego de dos jugadores.',e:'Recorre el árbol de jugadas: MAX elige el mayor valor y MIN el menor.',d:'Estado, jugadas posibles, profundidad y función de evaluación.',c:'O(b^d) tiempo.',r:['Olvidar el caso base (profundidad 0 o estado final).','Alternar mal MAX y MIN.'],t:'La poda alfa-beta da el mismo resultado explorando menos.'},
{n:'Poda alfa-beta',k:[[/alpha/i,3],[/beta/i,3],[/prun|poda|break/i,1]],o:'Minimax explorando menos nodos.',e:'Mantiene alfa (mejor de MAX) y beta (mejor de MIN) y corta ramas que no pueden mejorar el resultado.',d:'Las de minimax más alpha y beta.',c:'Mejor caso O(b^(d/2)).',r:['Actualizar alpha o beta en el jugador equivocado.','Cortar con la condición invertida (beta <= alpha).'],t:'Da el mismo valor que minimax; solo cambia la cantidad de nodos.'},
{n:'Algoritmo genético',k:[[/fitness|aptitud/i,3],[/crossover|cruce|cruza/i,3],[/mutat|mutaci/i,3],[/poblaci|population|ruleta|roulette/i,2]],o:'Buscar buenas soluciones imitando la evolución.',e:'Evalúa una población, selecciona (p. ej. ruleta), cruza, muta y repite por generaciones.',d:'Población, función de aptitud, selección, cruce y mutación.',c:'Depende de población y generaciones.',r:['Aptitud mal definida.','Mutación o población demasiado pequeñas: converge muy pronto.'],t:'Recuerda el ciclo: evaluar, seleccionar, cruzar, mutar.'},
{n:'Algoritmo de Euclides (MCD)',k:[[/%/,2],[/while\s+b|gcd|mcd/i,3]],o:'Calcular el máximo común divisor.',e:'Reemplaza (a, b) por (b, a mod b) hasta que b sea 0.',d:'Dos enteros.',c:'O(log min(a,b)).',r:['Actualizar a y b en el orden incorrecto.'],t:'Haz la traza con (48, 18) para verlo.'},
{n:'Recursión (factorial / Fibonacci)',k:[[/fact|fib/i,4]],o:'Resolver un problema en función de versiones menores de sí mismo.',e:'Caso base que detiene la recursión y caso recursivo que reduce el problema.',d:'La pila de llamadas.',c:'Factorial O(n); Fibonacci ingenuo O(2^n).',r:['Olvidar el caso base.','No acercarse al caso base en cada llamada.'],t:'Escribe primero el caso base y luego el recursivo.'}];
const detect=code=>{let b=null,sc=0;KB.forEach(x=>{const s=x.k.reduce((a,[re,w])=>a+(re.test(code)?w:0),0);if(s>sc){sc=s;b=x}});return sc>=4?b:null};


// ---- profundidad de ciclos anidados (para estimar complejidad) ----
function depthOf(L){let best=0,st=[];L.forEach(l=>{const ind=l.t.length-l.s.length;while(st.length&&st[st.length-1]>=ind)st.pop();if(l.k=='loop'){st.push(ind);best=Math.max(best,st.length)}});return best}

// ---- análisis automático para algoritmos propios (estimado) ----
function userLesson(a){
 const c=clean(a.code),L=parse(c),I=info(L),K=detect(a.code);
 const rets=L.filter(l=>l.k=='ret').map(l=>l.s.replace(/^return\s*/,'')).filter(Boolean).join(' / ')||'(no devuelve valor)';
 const rec=I.name!='(sin función)'&&(c.match(new RegExp('\\b'+I.name+'\\s*\\(','g'))||[]).length>1;
 const dp=depthOf(L);
 const tiempo=rec?'Depende de cuántas veces se llama a sí misma (estimado).':dp==0?'O(1): no tiene ciclos (estimado).':dp==1?'O(n): un ciclo sobre la entrada (estimado).':`O(n^${dp}): ${dp} ciclos anidados (estimado).`;
 const crece=/\[\]|\{\}|set\(|list\(|dict\(|append|\.add\(/.test(c);
 const espacio=(crece?'O(n): crea estructuras que crecen con la entrada':'O(1): no crea estructuras que crezcan')+(rec?', más la pila de llamadas (estimado).':' (estimado).');
 return{
  pila:rec?'Recursiva: la función se llama a sí misma. Cada llamada espera a la siguiente, así que la pila crece con la profundidad y se deshace al volver.':'No recursiva: solo está activa la función principal.',
  relaciones:[`Entradas (${I.par.join(', ')||'ninguna'}): llegan desde fuera.`,`Variables (${I.vars.filter(v=>!I.par.includes(v)).join(', ')||'ninguna'}): guardan estado.`,`${L.filter(l=>l.k=='loop').length} ciclo(s) y ${L.filter(l=>l.k=='cond').length} condición(es): controlan el flujo.`,`${L.filter(l=>l.k=='ret').length} return(s): entregan el resultado (${rets}).`],
  problema:K?K.o:`La función ${I.name} recibe ${I.par.join(', ')||'nada'} y devuelve ${rets}. Piensa qué problema resuelve.`,
  fundamento:K?K.e:'No reconocí un patrón clásico; el fundamento se deduce de la estructura del código.',
  funcionamiento:L.map(l=>say(l.s)),
  ejemplo:{texto:'Ejecútalo en el Laboratorio Python con una entrada pequeña: verás cada línea y el valor de las variables.',sim:true},
  limitaciones:(K?K.r:[]).concat(['Revisa casos borde: entrada vacía, un solo elemento y valores repetidos.','Confirma que el algoritmo termina (los ciclos o la recursión avanzan).']),
  tiempo,espacio,
  rendimiento:K?K.t:'Usa la complejidad estimada como guía y compárala con un algoritmo clásico parecido del catálogo.'}}

// ---- ficha de estudio: los 10 puntos, en el orden pedido ----
function fichaHTML(a){
 const le=CAT.includes(a)?a.L:userLesson(a),id=a.id,ej=le.ejemplo||{};
 const ul=xs=>`<ul>${xs.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`,ol=xs=>`<ol>${xs.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;
 const tab=ej.tabla?'<div style="overflow-x:auto"><table>'+ej.tabla.map((r,i)=>'<tr>'+r.map(c=>`<${i?'td':'th'}>${esc(c)}</${i?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>':'';
 const tr=(typeof TRACE!='undefined'&&TRACE[id])||(typeof LABR!='undefined'&&LABR[id]&&LABR[id].steps.length);
 const sec=(h,b)=>`<div class=card><h3>${h}</h3>${b}</div>`;
 return `<button onclick="go('algo','${id}')">← Volver</button><h2>📖 ${esc(a.n)}</h2>`
 +(CAT.includes(a)?'':'<p class=mut>Análisis automático de tu código: lo que aparece es una estimación.</p>')
 +sec('⏱️ 1. Complejidad en tiempo y espacio',`<p><b>Tiempo:</b> ${esc(le.tiempo)}</p><p><b>Espacio:</b> ${esc(le.espacio)}</p>`)
 +sec('📚 2. Pila de llamadas',`<p>${esc(le.pila)}</p>`+(tr?`<button onclick="go('viz','${id}')">▶️ Ver la pila paso a paso</button>`:''))
 +sec('🔗 3. Relación entre componentes',ul(le.relaciones))
 +sec('🎯 4. Problema que resuelve',`<p>${esc(le.problema)}</p>`)
 +sec('🧱 5. Fundamento teórico',`<p>${esc(le.fundamento)}</p>`)
 +sec('⚙️ 6. Funcionamiento',ol(le.funcionamiento))
 +sec('🧪 7. Ejemplo de ejecución',`<p>${esc(ej.texto||'')}</p>${tab}`+(tr?`<button class=p onclick="go('viz','${id}')">▶️ Ejecución paso a paso</button>`:'')+(ej.sim?`<button onclick="go('sim','${id}')">🧮 Simulación manual</button> <button onclick="go('lab','${id}')">🐍 Laboratorio Python</button>`:''))
 +sec('⚠️ 8. Limitaciones',ul(le.limitaciones))
 +sec('📈 9. Complejidad y rendimiento',`<p>${esc(le.rendimiento)}</p>`)
 +sec('🎮 10. Juego de análisis de implementación',`<p class=mut>Practica identificando y reconstruyendo esta implementación.</p><button class=p onclick="go('jugar','${id}')">🎮 Jugar</button>`)
 +sec('✅ ¿Ya lo entendí?',['Explico qué problema resuelve.','Identifico sus componentes y su pila.','Calculo su complejidad con un ejemplo.','Reconstruyo el código sin mirarlo.'].map(x=>`<label style="display:block"><input type=checkbox style="width:auto;margin:0 8px 0 0"> ${x}</label>`).join(''))}

V.ficha=id=>{const a=alg(id);if(!a)return go('catalogo');A.innerHTML=fichaHTML(a)};
