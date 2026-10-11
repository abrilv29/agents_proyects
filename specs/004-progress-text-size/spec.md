# Spec 004 — Tamaño de los textos de la barra de progreso

Estado: implementada

## Contexto y objetivo

El bloque «Objetivo semanal» (spec 002), en su columna de resultado «Barra de proceso
semanal», muestra dos textos junto a la barra: el porcentaje que queda al final de la
barra (hoy a ~20 px, en serif) y el texto de minutos que aparece debajo de la barra, de la
forma «120 de 300 min» o «Objetivo cumplido» (hoy a 16 px, en tinta clara). El usuario ha
pedido reducirlos a 14 px los dos: «el porcentaje puedes bajarlo en un tamaño de 14px, y
también la parte de minutos 120min 300».

Objetivo: que ambos textos se muestren a un tamaño de fuente equivalente a 14 px con el
tamaño de fuente base del navegador, sin cambiar nada más de su aspecto (familia, peso,
color) ni de ningún otro elemento de la página.

Nota de expectativas (efecto colateral esperado, no regresión): la fila de la barra la
dimensiona hoy el porcentaje; al pasar de ~20 px a 14 px esa fila se estrecha unos
píxeles y la línea de minutos sube en consecuencia. Ese desplazamiento vertical es
inherente al menor tamaño y está permitido (RF-3, CA 3). Lo que NO se permite es mover
los textos con espaciados o posiciones añadidas adrede.

## Usuarios

- Estudiante que usa el bloque «Objetivo semanal» a diario: notaría al instante si al
  encoger estos dos textos se rompe la estructura de la columna (el porcentaje deja de ir
  tras la barra o los minutos de ir debajo) o si cambia algo más de la página.
- Usuario móvil (375 px) y de escritorio (1280 px): los dos textos deben seguir cabiendo
  sin desbordes en ambos anchos.
- Persona que ajusta el tamaño de fuente base en el navegador: los textos deben seguir
  proporcionales al resto de la hoja (no quedar "pegados" a un tamaño fijo); esa
  necesidad la cubre RNF-6.

## Historias de usuario

- **HU-1**: Como usuario del bloque «Objetivo semanal», quiero que el porcentaje y el texto
  de minutos se muestren más pequeños (14 px), para que la barra destaque más y los
  acompañamientos de texto pesen menos en la lectura.

## Definiciones

- **«Porcentaje»**: la cifra con signo de porcentaje (p. ej. «40%») que se muestra al
  final de la barra, en la misma fila que esta.
- **«Texto de minutos»**: la línea que se muestra debajo de la barra; su contenido es
  «120 de 300 min» (minutos alcanzados «de» objetivo) mientras no se cumple el objetivo,
  y «Objetivo cumplido» cuando los minutos alcanzados son iguales o mayores que el
  objetivo (dos estados posibles, ambos dentro de este requisito).
- **«Tamaño de fuente equivalente a 14 px»**: el TAMAÑO DE FUENTE CALCULADO del elemento
  (el valor `font-size` que el navegador aplica al elemento, comprobable con
  `getComputedStyle`) es 14 px cuando el tamaño de fuente base del navegador es el
  habitual (16 px); es decir, 14 px = 0,875 de la base. No se habla de la altura real de
  los glifos en pantalla (los dígitos a 14 px miden menos de 14 px de alto: ese no es el
  criterio). Salvo que se diga lo contrario, todo "medir 14 px" en esta spec significa
  este criterio, con tolerancia ±0,5 px por redondeo.

## Requisitos funcionales

**RF-1 — El porcentaje se muestra a 14 px.**
Cuando la columna «Barra de proceso semanal» muestra el porcentaje de progreso, entonces
EL SISTEMA debe mostrarlo con tamaño de fuente calculado equivalente a 14 px con la base
del navegador a 16 px (según la definición de «Tamaño de fuente equivalente a 14 px»), en
lugar del tamaño actual (~20 px).
- CA: la cifra mostrada no cambia (sigue siendo el porcentaje de progreso, p. ej. «40%»);
  solo cambia su tamaño.

**RF-2 — El texto de minutos se muestra a 14 px.**
Cuando la columna «Barra de proceso semanal» muestra la línea de minutos debajo de la
barra, entonces EL SISTEMA debe mostrarla con tamaño de fuente calculado equivalente a
14 px con la base del navegador a 16 px (según la definición de «Tamaño de fuente
equivalente a 14 px»), en lugar del tamaño actual (16 px).
- CA: el contenido de la línea no cambia según el estado: o bien «120 de 300 min»
  (minutos alcanzados «de» objetivo), o bien «Objetivo cumplido» cuando el objetivo está
  alcanzado; solo cambia el tamaño, nunca el texto.
- CA: con la base del navegador a 16 px solo se admite el tamaño calculado de 14 px para
  esta línea; no se admite el tamaño actual (16 px) ni tamaños intermedios.

**RF-3 — El resto del aspecto de los dos textos no cambia.**
Mientras se muestran el porcentaje y el texto de minutos, EL SISTEMA debe conservar el
resto de su apariencia y su estructura como hoy: familia serif y peso del porcentaje,
color en tinta del porcentaje, color en tinta clara del texto de minutos, y la estructura
de la columna (el porcentaje en la misma fila que la barra, pegado a su final; los
minutos debajo de la barra).
- CA: el porcentaje conserva su familia serif, su peso y su color actuales; solo cambia el
  tamaño (RF-1).
- CA: el texto de minutos conserva su color actual; solo cambia el tamaño (RF-2).
- CA: la estructura se conserva sin añadir espaciados ni posiciones nuevas: el porcentaje
  sigue en la misma fila tras la barra y los minutos siguen debajo de la barra; no se
  añaden márgenes, huecos, separaciones ni cambios de alineación adrede. Se EXCLUYEN de
  este criterio los desplazamientos verticales derivados propios del menor tamaño: la fila
  se estrecha al bajar el porcentaje de ~20 px a 14 px y la línea de minutos sube en
  consecuencia unos píxeles; eso es un efecto esperado del propio cambio de tamaño, no un
  fallo (ver Nota de expectativas en Contexto).

**RF-4 — Aislamiento del cambio.**
El sistema DEBE aplicar el cambio únicamente al porcentaje y al texto de minutos de la
columna «Barra de proceso semanal»: ningún otro texto de la página cambia de tamaño.
- CA: las cifras de datos del resto de la página (racha, minutos de la semana, días del
  mes, sesión más reciente) conservan su tamaño actual.
- CA: el subtítulo «Barra de proceso semanal» y los textos del formulario de sesión
  (etiqueta, campo, botón) conservan su tamaño actual.
- CA: el título del bloque y los demás textos de la interfaz no se ven afectados.

## Requisitos no funcionales

- **RNF-1**: Sin dependencias ni build: el resultado se ve abriendo la página con doble
  clic (file://).
- **RNF-2**: El cambio es solo de presentación: no toca la estructura de la página, la
  lógica de cálculo del progreso, ni los datos almacenados.
- **RNF-3**: Textos de la interfaz en español; el cambio no altera el contenido de ningún
  texto visible («40%», «120 de 300 min», «Objetivo cumplido» y el resto siguen
  idénticos).
- **RNF-4**: Sin desbordes horizontales a 1280 px ni a 375 px: la columna de resultado y
  la fila de la barra siguen cabiendo en ambos anchos.
- **RNF-5**: El código debe seguir siendo didáctico y coherente con el aspecto final: lo
  que describen los comentarios del estilo no debe contradecir lo que se ve en pantalla
  (los comentarios que hoy anuncian los tamaños antiguos deben reflejar los nuevos).
- **RNF-6**: Los dos textos se definen en unidades relativas al tamaño de fuente base del
  navegador (como el resto de la hoja, que usa unidades relativas): si el usuario cambia
  la base de fuente, los dos textos escalan en proporción constante con ella (siguen
  siendo 0,875 de la base en cualquier ajuste); con la base a 16 px miden 14 px.
  - CA: medible: con base 16 px el tamaño calculado es 14 px (±0,5 px); con base 32 px el
    tamaño calculado es 28 px (±0,5 px); la proporción 14/16 = 0,875 se mantiene.
  - CA: un valor fijo de 14 px (que no escala con la base) NO cumple este requisito.

## Casos límite

- Estado inicial sin progreso: «0%» y «0 de 300 min» (el estado más frecuente al fijar
  un objetivo) se muestran los dos a 14 px, sin desbordes.
- Objetivo cumplido: la línea muestra «Objetivo cumplido» y el porcentaje «100%»; ambos a
  14 px, con el contenido intacto (RF-2 CA 1) y sin que «Objetivo cumplido» quebre la
  fila ni la columna.
- Porcentaje de un dígito («5%»): se muestra a 14 px y sigue al final de la barra, sin
  empujarla.
- Porcentaje de tres dígitos («100%»): se muestra a 14 px y cabe en la fila sin desbordes
  ni solapes con la barra.
- Minutos grandes (objetivo alto, p. ej. «40000 de 100000 min»): el texto a 14 px sigue
  cabiendo en el ancho de la columna sin cortarse ni desbordar.
- Móvil a 375 px (columna de resultado apilada bajo el formulario): los dos textos a 14 px
  se ven completos, sin desbordes horizontales.
- Barra y relleno: la ALTURA de la barra se conserva (12 px) y la columna de resultado no
  cambia de ancho total. Efecto colateral permitido y esperado: al estrecharse el
  porcentaje, la barra (que ocupa el hueco sobrante de la fila) gana unos píxeles de
  ancho y, con ella, el relleno; ensancharse ligeramente la barra NO es un fallo.
- Desplazamiento vertical de la línea de minutos: sube unos píxeles al estrecharse la
  fila (RF-3 CA 3 y Nota de expectativas); es efecto propio del cambio de tamaño, no una
  regresión.

## Fuera de alcance

- Cambios en la estructura HTML de la página.
- Cambios en JavaScript, en los cálculos de progreso o en los datos almacenados.
- Tests nuevos: no hay lógica que tocar; la verificación es visual/manual.
- Rediseño de otros elementos: barra, relleno, subtítulo, resto de cifras de datos,
  formulario de sesión, mapa de calor, mensajes.
- Cambios de color, familia o peso de los dos textos (solo tamaño).
- Ajustes de espaciado, márgenes o separaciones añadidos adrede entre la barra y sus
  textos (los desplazamientos derivados del propio cambio de tamaño, explicados en RF-3
  CA 3, no son un "ajuste de espaciado" y por tanto no están prohibidos).

## Criterios de finalización

- RF-1 a RF-4 y RNF-1 a RNF-6 verificados.
- Verificación visual en navegador a 1280 px y a 375 px: el porcentaje y la línea de
  minutos tienen tamaño de fuente calculado 14 px con la base a 16 px (verificable en las
  herramientas del navegador); el porcentaje conserva serif, peso y color; los minutos
  conservan su color; el porcentaje sigue en la misma fila tras la barra y los minutos
  debajo de la barra (sin espaciados nuevos); sin desbordes horizontales.
- Comprobación de los estados de contenido: «0 de 300 min»/«0%» y «Objetivo
  cumplido»/«100%» con el texto intacto y a 14 px.
- Comprobación de que ningún otro texto de la página ha cambiado de tamaño (cifras de
  datos, subtítulo, formulario de sesión) y de que la altura de la barra y el ancho total
  de la columna no han cambiado.
- `node --test` sigue en verde (42/42): el cambio es de presentación y no debe alterar
  ninguna prueba existente.
- Consola del navegador sin errores y, tras la verificación, el almacenamiento local solo
  contiene las claves que la app ya usa (`diario-estudio-sesiones`,
  `diario-estudio-mejor-racha` y `diario-estudio-objetivos`).
- `MEMORY.md` actualizado con el resultado.

## Dudas abiertas

Ninguna: el alcance está cerrado (14 px en el porcentaje y en la línea de minutos,
conservando todo lo demás) y no quedan decisiones pendientes con el usuario.
