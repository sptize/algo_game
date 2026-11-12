'use strict';
/* AlgoForja · catálogo: algoritmos clásicos con su ficha completa (escrita a mano y comprobada) */
CAT.push(
{id:'lineal',n:'Búsqueda lineal',cat:'Búsqueda',code:`def busqueda_lineal(lista, buscado):
    for i in range(len(lista)):
        if lista[i] == buscado:
            return i
    return -1`,
L:{problema:'Saber si un valor está en una lista y en qué posición, cuando la lista no está ordenada.',
fundamento:'Es fuerza bruta: no supone nada sobre los datos. Compara cada elemento con el buscado hasta encontrarlo o agotar la lista.',
funcionamiento:['Empiezo en el índice 0.','Comparo lista[i] con el buscado.','Si son iguales, devuelvo i y termino.','Si no, avanzo al siguiente índice.','Si llego al final sin encontrarlo, devuelvo -1.'],
ejemplo:{texto:'Lista [4, 8, 12, 16], buscado 12.',tabla:[['i','lista[i]','¿igual a 12?'],['0','4','No'],['1','8','No'],['2','12','Sí: devuelve 2']]},
limitaciones:['Lenta en listas grandes: en el peor caso revisa todos los elementos.','No aprovecha que la lista esté ordenada.'],
tiempo:'O(n): en el peor caso (no está, o está al final) recorre los n elementos.',espacio:'O(1): solo usa la variable i.',
rendimiento:'Muy simple y sin preparación. Conviene con listas pequeñas o desordenadas.',
pila:'No usa recursión: solo está activa la función principal.',
relaciones:['lista → el ciclo for la recorre.','i → índice que avanza en cada vuelta.','if → compara lista[i] con el buscado.','return → entrega la posición o -1.']}},

{id:'binaria',n:'Búsqueda binaria',cat:'Búsqueda',code:`def busqueda_binaria(lista, buscado):
    bajo = 0
    alto = len(lista) - 1
    while bajo <= alto:
        medio = (bajo + alto) // 2
        if lista[medio] == buscado:
            return medio
        elif lista[medio] < buscado:
            bajo = medio + 1
        else:
            alto = medio - 1
    return -1`,
L:{problema:'Encontrar un valor en una lista ORDENADA con muy pocas comparaciones.',
fundamento:'Divide y vencerás: en cada paso compara con el elemento del centro y descarta la mitad donde no puede estar.',
funcionamiento:['bajo = primer índice, alto = último índice.','Calculo el medio.','Si el del medio es el buscado, devuelvo su índice.','Si es menor, el buscado está a la derecha: bajo = medio + 1.','Si es mayor, está a la izquierda: alto = medio - 1.','Si bajo supera a alto, no está: devuelvo -1.'],
ejemplo:{texto:'Lista [1, 3, 5, 7, 9, 11], buscado 7.',tabla:[['bajo','alto','medio','valor','acción'],['0','5','2','5','5 < 7: bajo = 3'],['3','5','4','9','9 > 7: alto = 3'],['3','3','3','7','¡Encontrado en 3!']]},
limitaciones:['Solo funciona si la lista está ordenada.','Insertar o borrar elementos obliga a mantener el orden.'],
tiempo:'O(log n): cada paso reduce a la mitad el espacio de búsqueda.',espacio:'O(1): versión iterativa.',
rendimiento:'Muy rápida con listas grandes. Por eso conviene mantener los datos ordenados cuando se busca mucho.',
pila:'Versión iterativa: no usa recursión. (Una versión recursiva usaría unos log n niveles de pila.)',
relaciones:['bajo y alto → delimitan la zona donde puede estar el valor.','medio → punto de comparación.','if / elif / else → decide qué mitad descartar.','while → repite mientras queden posibilidades.']}},

{id:'burbuja',n:'Ordenamiento burbuja',cat:'Ordenamiento',code:`def burbuja(lista):
    n = len(lista)
    for i in range(n):
        for j in range(n - i - 1):
            if lista[j] > lista[j + 1]:
                lista[j], lista[j + 1] = lista[j + 1], lista[j]
    return lista`,
L:{problema:'Ordenar una lista de menor a mayor de forma sencilla.',
fundamento:'Compara vecinos y los intercambia si están en desorden. Cada pasada coloca el mayor restante al final, como una burbuja que sube.',
funcionamiento:['n es el tamaño de la lista.','Cada pasada i recorre los pares de vecinos que aún no están en su lugar.','Si lista[j] > lista[j+1], los intercambio.','Tras todas las pasadas, la lista está ordenada.'],
ejemplo:{texto:'Lista [5, 1, 4, 2].',tabla:[['pasada','comparaciones e intercambios','lista al final'],['1','(5,1) cambio · (5,4) cambio · (5,2) cambio','[1, 4, 2, 5]'],['2','(1,4) no · (4,2) cambio','[1, 2, 4, 5]'],['3','(1,2) no','[1, 2, 4, 5]']]},
limitaciones:['Muy lenta en listas grandes: O(n²).','Compara aunque la lista ya esté ordenada, si no se le añade una bandera de optimización.'],
tiempo:'O(n²) en el peor caso y en el promedio.',espacio:'O(1): ordena en el mismo lugar.',
rendimiento:'Didáctica y fácil de seguir. Sirve para listas pequeñas; para listas grandes conviene merge sort o quicksort.',
pila:'No usa recursión.',
relaciones:['n → cuántas pasadas se hacen.','Dos for anidados → pasadas y comparaciones.','if → decide si intercambiar.','La asignación doble → intercambia dos valores sin variable auxiliar.']}},

{id:'insercion',n:'Ordenamiento por inserción',cat:'Ordenamiento',code:`def insercion(lista):
    for i in range(1, len(lista)):
        clave = lista[i]
        j = i - 1
        while j >= 0 and lista[j] > clave:
            lista[j + 1] = lista[j]
            j -= 1
        lista[j + 1] = clave
    return lista`,
L:{problema:'Ordenar listas pequeñas o casi ordenadas.',
fundamento:'Mantiene una parte izquierda ya ordenada. Cada elemento nuevo se inserta en su lugar, desplazando los mayores una posición a la derecha.',
funcionamiento:['Empiezo en el índice 1: el primer elemento ya cuenta como ordenado.','Guardo el elemento actual como clave.','Retrocedo mientras el anterior sea mayor que la clave, desplazándolo a la derecha.','Coloco la clave en el hueco que quedó libre.'],
ejemplo:{texto:'Lista [4, 2, 3].',tabla:[['i','clave','lista después de insertar'],['1','2','[2, 4, 3]'],['2','3','[2, 3, 4]']]},
limitaciones:['Lenta con listas grandes y desordenadas: O(n²).'],
tiempo:'O(n²) en el peor caso (lista en orden inverso); O(n) si ya está ordenada.',espacio:'O(1): ordena en el mismo lugar.',
rendimiento:'Excelente para listas pequeñas o casi ordenadas. Además es estable: no altera el orden relativo de elementos iguales.',
pila:'No usa recursión.',
relaciones:['for → toma cada clave en orden.','while → busca el hueco y desplaza elementos.','lista[j+1] = lista[j] → el desplazamiento.','j → recorre hacia la izquierda.']}},

{id:'merge',n:'Merge sort',cat:'Ordenamiento',code:`def merge_sort(lista):
    if len(lista) <= 1:
        return lista
    medio = len(lista) // 2
    izq = merge_sort(lista[:medio])
    der = merge_sort(lista[medio:])
    resultado = []
    i = 0
    j = 0
    while i < len(izq) and j < len(der):
        if izq[i] <= der[j]:
            resultado.append(izq[i])
            i += 1
        else:
            resultado.append(der[j])
            j += 1
    resultado.extend(izq[i:])
    resultado.extend(der[j:])
    return resultado`,
L:{problema:'Ordenar listas grandes con un tiempo predecible.',
fundamento:'Divide y vencerás: parte la lista a la mitad, ordena cada mitad con la misma función y luego mezcla dos listas ya ordenadas.',
funcionamiento:['Si la lista tiene 0 o 1 elemento, ya está ordenada (caso base).','Parto por la mitad y ordeno cada parte llamando a la misma función.','Mezclo: comparo los primeros de cada lista y saco el menor.','Al final agrego lo que sobró de una de las dos listas.'],
ejemplo:{texto:'Lista [6, 2, 5, 1].',tabla:[['nivel','sublistas','resultado'],['1','[6, 2] y [5, 1]','ordenar cada una'],['2','[2, 6] y [1, 5]','mezclar'],['3','[1, 2, 5, 6]','lista ordenada']]},
limitaciones:['Necesita memoria extra para las mezclas: O(n).','Para listas muy pequeñas, inserción suele ser más rápida.'],
tiempo:'O(n log n) en todos los casos.',espacio:'O(n) por las listas auxiliares.',
rendimiento:'Predecible y estable. Muy buena opción para datos grandes.',
pila:'Recursiva: cada llamada reduce la lista a la mitad, así que la pila tiene unos log n niveles. Al volver, se mezclan las partes.',
relaciones:['Caso base → detiene la recursión.','Dos llamadas recursivas → ordenan cada mitad.','while de la mezcla → combina izq y der.','resultado → acumula el orden final.']}},

{id:'quick',n:'Quicksort',cat:'Ordenamiento',code:`def quicksort(lista):
    if len(lista) <= 1:
        return lista
    pivote = lista[0]
    menores = [x for x in lista[1:] if x < pivote]
    mayores = [x for x in lista[1:] if x >= pivote]
    return quicksort(menores) + [pivote] + quicksort(mayores)`,
L:{problema:'Ordenar listas grandes con un método muy rápido en la práctica.',
fundamento:'Elige un pivote, separa los menores y los mayores que él, y ordena cada parte recursivamente. El pivote queda en su lugar definitivo.',
funcionamiento:['Caso base: lista de 0 o 1 elemento.','Elijo el primer elemento como pivote.','Separo: menores a un lado, mayores o iguales al otro.','Ordeno cada lado recursivamente y uno todo: menores + pivote + mayores.'],
ejemplo:{texto:'Lista [3, 6, 1, 8, 2].',tabla:[['pivote','menores','mayores'],['3','[1, 2]','[6, 8]'],['…','ordeno [1, 2] y [6, 8]','resultado: [1, 2, 3, 6, 8]']]},
limitaciones:['En el peor caso (pivote siempre extremo y lista ya ordenada) es O(n²).','No es estable.'],
tiempo:'O(n log n) en promedio; O(n²) en el peor caso.',espacio:'O(n) en esta versión, que crea listas nuevas.',
rendimiento:'Muy rápido en la práctica. El riesgo está en elegir mal el pivote.',
pila:'Recursiva: en el caso promedio la pila tiene unos log n niveles; en el peor caso puede llegar a n.',
relaciones:['Caso base → detiene la recursión.','pivote → define la separación.','Dos listas por comprensión → menores y mayores.','Concatenación → une los resultados.']}},

{id:'factorial',n:'Factorial (recursivo)',cat:'Recursión',code:`def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
L:{problema:'Calcular n! = n × (n−1) × … × 1.',
fundamento:'Recursión: n! se expresa con (n−1)!. Un caso base detiene las llamadas.',
funcionamiento:['Si n ≤ 1, devuelvo 1 (caso base).','Si no, pido factorial(n − 1).','Cuando llega ese resultado, lo multiplico por n y lo devuelvo.'],
ejemplo:{texto:'factorial(4).',tabla:[['llamada','espera a','vuelve con'],['factorial(4)','factorial(3)','4 × 6 = 24'],['factorial(3)','factorial(2)','3 × 2 = 6'],['factorial(2)','factorial(1)','2 × 1 = 2'],['factorial(1)','—','1 (caso base)']]},
limitaciones:['Con n grande, la pila de llamadas puede desbordarse.','Para n negativo devuelve 1 por el caso base, aunque el factorial no está definido para negativos.'],
tiempo:'O(n): hace n llamadas.',espacio:'O(n) por la pila de llamadas.',
rendimiento:'Lineal y clara. La versión con un ciclo usa O(1) de pila y es preferible en la práctica.',
pila:'factorial(4) → factorial(3) → factorial(2) → factorial(1). Luego la pila se deshace devolviendo 1, 2, 6 y 24.',
relaciones:['if n ≤ 1 → caso base.','return 1 → corta la cadena de llamadas.','return n * factorial(n − 1) → hace la llamada y la multiplicación.']}},

{id:'fibonacci',n:'Fibonacci (recursivo)',cat:'Recursión',code:`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
L:{problema:'Obtener el n-ésimo número de Fibonacci (0, 1, 1, 2, 3, 5…).',
fundamento:'Cada número es la suma de los dos anteriores. La versión recursiva lo escribe tal cual, aunque repite cálculos.',
funcionamiento:['Si n ≤ 1, devuelvo n (fib(0) = 0, fib(1) = 1).','Calculo fibonacci(n − 1) y fibonacci(n − 2) con llamadas recursivas.','Devuelvo la suma de ambos.'],
ejemplo:{texto:'fibonacci(4).',tabla:[['llamada','cálculo','resultado'],['fibonacci(4)','fib(3) + fib(2)','2 + 1 = 3'],['fibonacci(3)','fib(2) + fib(1)','1 + 1 = 2'],['fibonacci(2)','fib(1) + fib(0)','1 + 0 = 1'],['fibonacci(1), fibonacci(0)','casos base','1 y 0']]},
limitaciones:['Muy lenta: recalcula los mismos valores muchas veces.','Riesgo de desbordar la pila con n grande.'],
tiempo:'O(2ⁿ) en esta versión.',espacio:'O(n) de pila: la profundidad máxima es n.',
rendimiento:'Ilustra bien la recursión, pero para uso real conviene la versión con un ciclo (O(n)) o memorización.',
pila:'fibonacci(4) abre fibonacci(3), que abre fibonacci(2)… La pila llega a unos 4 niveles y se va cerrando al devolver resultados.',
relaciones:['if n ≤ 1 → caso base.','Dos llamadas → forman un árbol de llamadas que repite trabajo.','return suma → combina los dos resultados.']}},

{id:'bfs',n:'Búsqueda en anchura (BFS)',cat:'Grafos',code:`from collections import deque

def bfs(grafo, inicio, meta):
    frontera = deque([inicio])
    visitados = {inicio: None}
    while frontera:
        actual = frontera.popleft()
        if actual == meta:
            break
        for vecino in grafo[actual]:
            if vecino not in visitados:
                visitados[vecino] = actual
                frontera.append(vecino)
    return visitados`,
L:{problema:'Encontrar el camino con menos pasos entre dos nodos de un grafo sin costos.',
fundamento:'Explora por niveles: primero los vecinos directos, luego los vecinos de los vecinos. Usa una cola (FIFO).',
funcionamiento:['Pongo el inicio en la cola y lo marco como visitado.','Saco el primero de la cola.','Si es la meta, termino.','Para cada vecino no visitado: lo marco, guardo de dónde vino y lo encolo.'],
ejemplo:{texto:'Grafo: A→B, A→C, B→D, C→D. Buscar D desde A.',tabla:[['cola','sale','vecinos nuevos'],['[A]','A','B, C'],['[B, C]','B','D'],['[C, D]','C','(D ya estaba)'],['[D]','D','¡meta!']]},
limitaciones:['Solo da el camino óptimo si todos los pasos cuestan lo mismo.','Puede usar mucha memoria en grafos muy anchos.'],
tiempo:'O(V + E): visita cada nodo y cada arista una vez.',espacio:'O(V): la cola y el diccionario de visitados.',
rendimiento:'Muy eficiente en grafos sin costos. Es base de muchos problemas: rutas, redes, niveles.',
pila:'No recursiva: la cola guarda la frontera de nodos pendientes.',
relaciones:['grafo → vecinos de cada nodo.','cola (deque) → frontera en orden de llegada.','visitados → evita repetir nodos y guarda el camino.','if actual == meta → termina.']}},

{id:'dfs',n:'Búsqueda en profundidad (DFS)',cat:'Grafos',code:`def dfs(grafo, inicio, meta):
    pila = [inicio]
    visitados = {inicio: None}
    while pila:
        actual = pila.pop()
        if actual == meta:
            break
        for vecino in grafo[actual]:
            if vecino not in visitados:
                visitados[vecino] = actual
                pila.append(vecino)
    return visitados`,
L:{problema:'Recorrer o buscar en un grafo yendo lo más profundo posible antes de retroceder.',
fundamento:'Usa una pila (LIFO): toma el último nodo descubierto y sigue por esa rama hasta agotarla.',
funcionamiento:['Pongo el inicio en la pila y lo marco como visitado.','Saco el último elemento de la pila.','Si es la meta, termino.','Agrego sus vecinos no visitados a la pila.'],
ejemplo:{texto:'Mismo grafo que BFS. Buscar D desde A.',tabla:[['pila','sale','vecinos nuevos'],['[A]','A','B, C'],['[B, C]','C','D'],['[B, D]','D','¡meta!']]},
limitaciones:['No garantiza el camino más corto.','En grafos muy profundos puede consumir mucha pila.'],
tiempo:'O(V + E).',espacio:'O(V).',
rendimiento:'Ideal para explorar todo el grafo, detectar ciclos y hacer backtracking. No sirve para buscar rutas mínimas.',
pila:'Aquí la pila la maneja el propio código (una lista). Una versión recursiva usaría la pila de llamadas, con hasta V niveles.',
relaciones:['grafo → conexiones entre nodos.','pila → orden de exploración (el último entra, el primero sale).','visitados → evita ciclos infinitos.','pop() → toma el último elemento.']}},

{id:'dijkstra',n:'Dijkstra',cat:'Grafos',code:`from queue import PriorityQueue

def dijkstra(grafo, inicio, meta):
    costo = {inicio: 0}
    padre = {inicio: None}
    cola = PriorityQueue()
    cola.put((0, inicio))
    while not cola.empty():
        _, actual = cola.get()
        if actual == meta:
            break
        for vecino, peso in grafo[actual].items():
            nuevo = costo[actual] + peso
            if vecino not in costo or nuevo < costo[vecino]:
                costo[vecino] = nuevo
                padre[vecino] = actual
                cola.put((nuevo, vecino))
    return costo.get(meta)`,
L:{problema:'Encontrar el camino de menor costo total en un grafo con pesos positivos.',
fundamento:'Guarda el costo mínimo conocido hasta cada nodo y siempre expande el nodo más barato pendiente, usando una cola de prioridad.',
funcionamiento:['El costo del inicio es 0; lo meto en la cola.','Saco el nodo de menor costo.','Si es la meta, termino.','Para cada vecino: nuevo costo = costo actual + peso. Si mejora el conocido, lo actualizo y lo encolo.'],
ejemplo:{texto:'A→B (1), A→C (4), B→C (2), C→D (1). Costo de A a D.',tabla:[['sale','costo acumulado','acción'],['A','0','B = 1, C = 4'],['B','1','C mejora a 3'],['C','3','D = 4'],['D','4','¡meta!']]},
limitaciones:['No funciona con pesos negativos.','Sin una heurística explora más nodos que A*.'],
tiempo:'O((V + E) log V) con cola de prioridad.',espacio:'O(V).',
rendimiento:'Muy confiable para rutas óptimas con pesos positivos. Es A* con heurística igual a 0.',
pila:'No recursiva.',
relaciones:['costo → lo que se acumula por el camino.','cola de prioridad → elige siempre el más barato.','padre → permite reconstruir la ruta.','condición de mejora → nunca empeora un camino ya encontrado.']}},

{id:'astar',n:'A*',cat:'Grafos',code:`from queue import PriorityQueue

def astar(grafo, inicio, meta, heuristica):
    costo = {inicio: 0}
    padre = {inicio: None}
    cola = PriorityQueue()
    cola.put((heuristica(inicio, meta), inicio))
    while not cola.empty():
        _, actual = cola.get()
        if actual == meta:
            break
        for vecino, peso in grafo[actual].items():
            nuevo = costo[actual] + peso
            if vecino not in costo or nuevo < costo[vecino]:
                costo[vecino] = nuevo
                padre[vecino] = actual
                cola.put((nuevo + heuristica(vecino, meta), vecino))
    return costo.get(meta)`,
L:{problema:'Encontrar el camino de menor costo usando una estimación que guía hacia la meta.',
fundamento:'Como Dijkstra, pero ordena por f = g + h: costo real hasta el nodo (g) más una estimación hasta la meta (h).',
funcionamiento:['Pongo el inicio en la cola con prioridad h(inicio).','Saco el nodo de menor f.','Si es la meta, termino.','Para cada vecino calculo g; si mejora, lo guardo con prioridad g + h(vecino).'],
ejemplo:{texto:'Mismo grafo que Dijkstra. h estimada: A = 4, B = 3, C = 1, D = 0.',tabla:[['sale (f)','g','acción'],['A (4)','0','B: f = 4 · C: f = 5'],['B (4)','1','C mejora: g = 3, f = 4'],['C (4)','3','D: f = 4'],['D (4)','4','¡meta!']]},
limitaciones:['Solo garantiza el camino óptimo si la heurística nunca sobrestima el costo real (es admisible).','Una heurística mala puede hacerla lenta.'],
tiempo:'Depende de la heurística; en el peor caso, igual que Dijkstra: O((V + E) log V).',espacio:'O(V).',
rendimiento:'Normalmente mucho más rápida que Dijkstra en mapas y juegos, porque avanza hacia la meta.',
pila:'No recursiva.',
relaciones:['g → costo real acumulado.','h → estimación de lo que falta.','f = g + h → prioridad en la cola.','padre → permite reconstruir la ruta.']}}
,
{id:'seleccion',n:'Ordenamiento por selección',cat:'Ordenamiento',code:`def seleccion(lista):
    n = len(lista)
    for i in range(n):
        minimo = i
        for j in range(i + 1, n):
            if lista[j] < lista[minimo]:
                minimo = j
        lista[i], lista[minimo] = lista[minimo], lista[i]
    return lista`,
L:{problema:'Ordenar una lista buscando el menor elemento en cada paso.',
fundamento:'En cada pasada busca el más pequeño de la parte no ordenada y lo coloca al frente con un solo intercambio.',
funcionamiento:['n es el tamaño de la lista.','Para cada posición i, busco el índice del mínimo desde i hasta el final.','Comparo cada elemento con el mínimo actual y lo actualizo si encuentro uno menor.','Intercambio el mínimo con la posición i.'],
ejemplo:{texto:'Lista [5, 1, 4, 2].',tabla:[['pasada i','mínimo encontrado','lista después'],['0','1 (posición 1)','[1, 5, 4, 2]'],['1','2 (posición 3)','[1, 2, 4, 5]'],['2','4 (ya en su lugar)','[1, 2, 4, 5]']]},
limitaciones:['Siempre hace O(n²) comparaciones, aunque la lista ya esté ordenada.','No es estable: el intercambio puede cambiar el orden relativo de iguales.'],
tiempo:'O(n²) en todos los casos.',espacio:'O(1): ordena en el mismo lugar.',
rendimiento:'Hace pocos intercambios (como máximo n − 1), útil cuando escribir en memoria es costoso. Para listas grandes no es de las más rápidas.',
pila:'No usa recursión.',
relaciones:['i → posición que se va llenando con el mínimo.','minimo → guarda el índice del menor encontrado.','for interno → busca el mínimo.','Intercambio → coloca el mínimo en su lugar.']}},
{id:'euclides',n:'Máximo común divisor (Euclides)',cat:'Matemáticas',code:`def mcd(a, b):
    while b != 0:
        a, b = b, a % b
    return a`,
L:{problema:'Calcular el máximo común divisor de dos enteros.',
fundamento:'El MCD de a y b es igual al MCD de b y el residuo de a entre b. Se repite hasta que el residuo sea 0.',
funcionamiento:['Mientras b sea distinto de 0.','Reemplazo a por b y b por el residuo a % b.','Cuando b vale 0, a es el MCD.'],
ejemplo:{texto:'a = 48, b = 18.',tabla:[['a','b','a % b'],['48','18','12'],['18','12','6'],['12','6','0'],['6','0','MCD = 6']]},
limitaciones:['Pensado para enteros; con ceros o negativos conviene definir primero la convención.','Con más de dos números hay que aplicarlo en cadena.'],
tiempo:'O(log min(a, b)): el residuo se reduce muy rápido.',espacio:'O(1).',
rendimiento:'Muy rápido incluso con números enormes. Es uno de los algoritmos más antiguos que se siguen usando.',
pila:'No usa recursión (una versión recursiva sí).',
relaciones:['while → repite hasta que b sea 0.','a % b → calcula el residuo.','La asignación doble → avanza el par (a, b).','return a → entrega el MCD.']}},
{id:'voraz',n:'Búsqueda voraz',cat:'Grafos',code:`from queue import PriorityQueue

def voraz(grafo, inicio, meta, heuristica):
    cola = PriorityQueue()
    cola.put((heuristica(inicio, meta), inicio))
    padre = {inicio: None}
    while not cola.empty():
        _, actual = cola.get()
        if actual == meta:
            break
        for vecino in grafo[actual]:
            if vecino not in padre:
                padre[vecino] = actual
                cola.put((heuristica(vecino, meta), vecino))
    return padre`,
L:{problema:'Llegar rápido a una meta, siguiendo siempre lo que parece más cercano.',
fundamento:'Greedy best-first: prioriza solo la estimación h hasta la meta e ignora cuánto costó llegar. Es rápida, pero no garantiza el mejor camino.',
funcionamiento:['Pongo el inicio en la cola con su estimación.','Saco el nodo con menor h.','Si es la meta, termino.','Agrego los vecinos no visitados con su propia h.'],
ejemplo:{texto:'Mismo grafo que A*: A→B (1), A→C (4), B→C (2), C→D (1). h: A = 4, B = 3, C = 1, D = 0.',tabla:[['sale (h)','acción'],['A (4)','encola B (h = 3) y C (h = 1)'],['C (1)','encola D (h = 0)'],['D (0)','¡meta! Camino A → C → D, costo 5']]},
limitaciones:['No garantiza el camino de menor costo: en el ejemplo da 5 y el óptimo, A → B → C → D, cuesta 4.','Depende mucho de la calidad de la heurística.'],
tiempo:'En el peor caso O((V + E) log V); en la práctica depende de la heurística.',espacio:'O(V).',
rendimiento:'Muy rápida cuando la heurística es buena. Para rutas óptimas conviene A*.',
pila:'No recursiva.',
relaciones:['h → estimación que decide el orden.','cola de prioridad → saca siempre el más prometedor.','padre → permite reconstruir el camino.','No hay costo acumulado: por eso se equivoca en el ejemplo.']}},
{id:'minimax',n:'Minimax',cat:'Juegos',code:`def minimax(nodo, profundidad, maximiza):
    if profundidad == 0 or nodo.es_hoja:
        return nodo.valor
    if maximiza:
        return max(minimax(h, profundidad - 1, False) for h in nodo.hijos)
    return min(minimax(h, profundidad - 1, True) for h in nodo.hijos)`,
L:{problema:'Elegir la mejor jugada en un juego de dos jugadores con información completa, como tres en raya o ajedrez.',
fundamento:'Supone que cada jugador juega lo mejor posible. MAX busca el valor más alto y MIN el más bajo, así que el valor de cada posición se calcula desde las hojas hacia la raíz.',
funcionamiento:['Si llegué a la profundidad límite o a un estado final, devuelvo su valor.','Si es mi turno (MAX), devuelvo el máximo de sus hijos.','Si es el turno del rival (MIN), devuelvo el mínimo de sus hijos.','La raíz elige la jugada con el mejor valor.'],
ejemplo:{texto:'Árbol de dos niveles: MAX elige entre dos nodos MIN con hojas [3, 5] y [2, 9].',tabla:[['nodo','hojas','valor'],['MIN izquierdo','3, 5','3'],['MIN derecho','2, 9','2'],['MAX (raíz)','3, 2','3: juega a la izquierda']]},
limitaciones:['Explora muchísimas posiciones: en juegos complejos hay que limitar la profundidad.','Depende de la función de evaluación: si estima mal, juega mal.'],
tiempo:'O(bᵈ): b jugadas por turno y profundidad d.',espacio:'O(d): la pila llega a la profundidad del árbol.',
rendimiento:'Perfecta dentro de la profundidad explorada. La poda alfa-beta da el mismo resultado explorando menos nodos.',
pila:'Recursiva: cada turno abre una llamada; la pila llega a la profundidad d y se cierra al devolver los valores.',
relaciones:['profundidad → cuánto mira hacia adelante.','max / min → alternan entre los dos jugadores.','hijos → jugadas posibles.','valor de las hojas → lo que sube hasta la raíz.']}}
,
{id:'hill',n:'Escalada de colinas (Hill climbing)',cat:'Búsqueda local',call:"hill_climbing(2, lambda x: -(x - 7) ** 2 + 10, lambda x: [v for v in (x - 1, x + 1) if 0 <= v <= 15])",code:`def hill_climbing(inicial, valor, vecinos, max_iter=100):
    actual = inicial
    for _ in range(max_iter):
        mejor = max(vecinos(actual), key=valor, default=actual)
        if valor(mejor) <= valor(actual):
            return actual
        actual = mejor
    return actual`,
L:{problema:'Encontrar una solución con el valor más alto cuando revisar todas las posibilidades es imposible o muy costoso.',
fundamento:'Búsqueda local: parte de una solución, mira sus vecinos y se mueve al mejor siempre que mejore. Se detiene cuando ningún vecino supera a la solución actual.',
funcionamiento:['Empiezo en una solución inicial.','Genero los vecinos de la solución actual.','Elijo el vecino con mayor valor.','Si no mejora la solución actual, me detengo y devuelvo la actual.','Si mejora, me muevo a ese vecino y repito.'],
ejemplo:{texto:'f(x) = −(x − 7)² + 10, con x entre 0 y 15, empezando en x = 2. Vecinos: x − 1 y x + 1.',tabla:[['x','f(x)','vecinos (valor)','mejor vecino'],['2','−15','1 (−26), 3 (−6)','3'],['3','−6','2 (−15), 4 (1)','4'],['4','1','3 (−6), 5 (6)','5'],['5','6','4 (1), 6 (9)','6'],['6','9','5 (6), 7 (10)','7'],['7','10','6 (9), 8 (9)','ninguno mejora: se detiene en 7']]},
limitaciones:['Puede quedarse en un máximo local que no es el mejor global.','El resultado depende mucho del punto de partida.','Necesita una forma sencilla de generar los vecinos.'],
tiempo:'Depende de cuántos pasos da: cada paso evalúa todos sus vecinos.',espacio:'O(1): solo guarda la solución actual.',
rendimiento:'Muy rápida y fácil de implementar. Mejora con reinicios aleatorios o con recocido simulado, que a veces acepta un paso malo para escapar de un máximo local.',
pila:'No recursivo.',
relaciones:['actual → la solución en la que estoy.','vecinos → candidatos cercanos.','valor → criterio para comparar.','max(...) → elige el mejor vecino.','if → decide si seguir o parar.']}},
{id:'genetico',n:'Algoritmo genético',cat:'Evolutivos',call:'algoritmo_genetico([[1, 0, 0, 0, 0, 1], [0, 1, 1, 1, 1, 0], [1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1]], 3)',code:`import random

def algoritmo_genetico(poblacion, generaciones):
    for _ in range(generaciones):
        aptitudes = [aptitud(ind) for ind in poblacion]
        nueva = []
        while len(nueva) < len(poblacion):
            p1 = seleccion_ruleta(poblacion, aptitudes)
            p2 = seleccion_ruleta(poblacion, aptitudes)
            nueva.append(mutacion(cruce(p1, p2)))
        poblacion = nueva
    return max(poblacion, key=aptitud)

def aptitud(individuo):
    return sum(individuo)

def seleccion_ruleta(poblacion, aptitudes):
    total = sum(aptitudes)
    if total == 0:
        return random.choice(poblacion)
    r = random.uniform(0, total)
    acumulado = 0
    for ind, apt in zip(poblacion, aptitudes):
        acumulado += apt
        if acumulado >= r:
            return ind
    return poblacion[-1]

def cruce(p1, p2):
    punto = random.randint(1, len(p1) - 1)
    return p1[:punto] + p2[punto:]

def mutacion(ind, prob=0.05):
    return [1 - g if random.random() < prob else g for g in ind]`,
L:{problema:'Buscar una buena solución cuando hay demasiadas posibilidades para revisarlas todas.',
fundamento:'Imita la evolución: los individuos más aptos tienen más probabilidad de reproducirse, el cruce combina sus partes y la mutación introduce variedad para no quedarse atascado.',
funcionamiento:['Empiezo con una población inicial.','Calculo la aptitud de cada individuo.','Elijo dos padres por ruleta, con probabilidad proporcional a su aptitud.','Cruzo los padres en un punto y muto el hijo con baja probabilidad.','Repito hasta llenar la nueva generación y repito por varias generaciones.','Devuelvo el mejor individuo.'],
ejemplo:{texto:'Población de 4 cadenas de 6 bits. La aptitud cuenta cuántos unos tiene cada una.',tabla:[['individuo','aptitud'],['100001','2'],['011110','4'],['111000','3'],['000111','3']]},
limitaciones:['No garantiza encontrar el óptimo.','Muy sensible a sus parámetros: tamaño de población, probabilidad de mutación y número de generaciones.','Si la aptitud está mal diseñada, evoluciona hacia lo equivocado.','Puede converger demasiado pronto y perder variedad.'],
tiempo:'O(G · P · n) si calcular la aptitud cuesta O(n): G generaciones, P individuos y n genes por individuo.',espacio:'O(P · n).',
rendimiento:'Muy útil cuando no hay una fórmula directa y el espacio de soluciones es enorme. Los resultados cambian entre corridas; con semilla fija se pueden reproducir.',
pila:'No recursivo.',
relaciones:['población → conjunto de soluciones candidatas.','aptitud → mide qué tan buena es cada una.','selección → decide quién se reproduce.','cruce → combina dos soluciones.','mutación → introduce cambios pequeños para explorar.','generaciones → repiten el ciclo y mejoran la población.']}}
);
