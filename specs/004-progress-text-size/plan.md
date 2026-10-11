# Plan — Spec 004: tamaño de los textos de la barra de progreso

Spec aprobada por el usuario (09/10/2026). Es un cambio de presentación: dos valores de
`font-size` y los dos comentarios que los describen. Por eso este plan no tiene sección de
funciones puras ni de pseudocódigo (RNF-2: no se toca lógica; `goals.js`, `app.js` y
`stats.js` siguen tal como están).

## 1. Archivos y responsabilidades

- **Modificar `styles.css`** — único archivo con cambios:
  1. regla `.objetivo-porcentaje` (~líneas 443-450): `font-size` de `1.25rem` (≈20 px) a
     `0.875rem` (14 px con base 16);
  2. regla `.objetivo-progreso` (~líneas 453-457): `font-size` de `1rem` (16 px) a
     `0.875rem` (14 px con base 16);
  3. actualizar los dos comentarios que citan los tamaños antiguos — línea 442 («cifra en
     serif, discreta (~20 px)») y línea 452 («Minutos debajo de la barra, a 16 px y en
     tinta clara») — para que reflejen 14 px / 0,875 de la base (RNF-5).
- **`index.html`** — sin cambios: el `<span class="objetivo-porcentaje">` (línea 63) y el
  `<p class="objetivo-progreso">` (línea 65) ya existen en la estructura correcta; la spec
  es solo de presentación.
- **`app.js`** — sin cambios: escribe el contenido («40%», «120 de 300 min» u «Objetivo
  cumplido», `textContent` en las líneas 394-395) y no declara ningún tamaño de fuente.
- **`goals.js`, `stats.js`** — sin cambios: lógica pura ajena a la presentación.
- **`tests/`** (`tests/stats.test.js`, `tests/goals.test.js`) — sin cambios y sin tests
  nuevos: se ejecutan solo como puerta de regresión (`node --test` 42/42).
- **`MEMORY.md`** — actualización final al cerrar la tarea (qué cambió y por qué), como
  manda `AGENTS.md`.

## 2. Qué se cambia exactamente

### 2.1 En `styles.css`

1. **Regla `.objetivo-porcentaje` (línea 446)**: cambiar `font-size: 1.25rem;` por
   `font-size: 0.875rem;`. Es lo único que se toca de la regla: `flex: none`,
   `font-family: var(--fuente-titulo)` (serif), `font-weight: 600`, `line-height: 1` y
   `color: var(--tinta)` quedan intactos (RF-3 CA 1).
2. **Regla `.objetivo-progreso` (línea 455)**: cambiar `font-size: 1rem;` por
   `font-size: 0.875rem;`. `margin: 8px 0 0` y `color: var(--tinta-clara)` quedan
   intactos (RF-3 CA 2).
3. **Comentarios obsoletos a actualizar** (RNF-5):
   - comentario de `.objetivo-porcentaje` (línea 442): «cifra en serif, discreta (~20 px)»
     → pasa a describir la cifra a 14 px (0,875 de la base de fuente), conservando lo
     cierto (serif, discreta);
   - comentario de `.objetivo-progreso` (línea 452): «a 16 px y en tinta clara» → pasa a
     «a 14 px (0,875 de la base) y en tinta clara».

**Por qué `0.875rem` da exactamente 14 px**: la hoja no fija `font-size` en la raíz (solo
`body` declara `font-size: 16px`, línea 25), así que `rem` se apoya en la base del
navegador (16 px el habitual) y 0,875 × 16 = 14. Es además la única unidad que cumple
RNF-6 (ver decisión 1) y es coherente con el resto de la hoja, que mide todos los tamaños
en `rem` (el único `px` de `font-size` de todo el archivo es la base de `body`).

Nada más: ni `line-height`, ni `margin`, ni colores, ni familia, ni la barra
(`.objetivo-barra`, `.objetivo-relleno`), ni el subtítulo, ni ninguna otra regla.

### 2.2 Por qué no hace falta tocar nada más

- **RNF-2 (solo presentación)**: el tamaño de estos dos textos vive únicamente en esas dos
  reglas de CSS; no hay lógica ni datos implicados.
- **El contenido lo escribe JS sin tamaño propio**: `app.js` solo asigna `textContent`
  («40%», «120 de 300 min», «Objetivo cumplido»); el tamaño lo decide el CSS y cambia
  solo con estas dos líneas.
- **La estructura no cambia**: la fila flex `.objetivo-barra-fila` con el porcentaje en
  `flex: none` y los minutos en su `<p>` debajo siguen idénticos. Lo único que ocurre es
  que la fila se estrecha al bajar de ~20 px a 14 px y la línea de minutos sube unos
  píxeles: **efecto propio permitido por RF-3 CA 3** (y la barra, que ocupa el hueco
  sobrante, gana unos píxeles de ancho, permitido por los casos límite).
- **RF-3**: familia, peso, color de los dos textos, `line-height` y `margin` no se tocan;
  el resto del aspecto queda literalmente como hoy.
- **RF-4 (aislamiento)**: al limitar el cambio a `.objetivo-porcentaje` y
  `.objetivo-progreso`, ningún otro texto de la página (subtítulo, cifras de datos,
  formulario, título del bloque) cambia de tamaño.
- **HTML, JS, tests y datos**: fuera de alcance de la spec; no se reescribe lo que ya
  funciona (principio de cambio pequeño).

## 3. Interfaz

Aspecto final del bloque «Objetivo semanal», columna «Barra de proceso semanal»: el
**porcentaje pasa a ser más discreto** al final de la barra (14 px en serif con su peso y
su color de tinta, en vez de ~20 px) y la **línea de minutos debajo queda más ligera**
(14 px en tinta clara en vez de 16 px). La barra, su relleno ámbar, el subtítulo y la
columna de resultado no cambian; el porcentaje sigue en la misma fila tras la barra y los
minutos siguen debajo. Efectos derivados permitidos: la fila se estrecha y los minutos
suben unos píxeles, y la barra gana unos píxeles de ancho. A 1280 px y a 375 px (columna
apilada) los dos textos se ven completos, sin desbordes.

## 4. Decisiones (con la alternativa descartada)

1. **`0.875rem` en lugar de `14px` fijo.** *Descartada* la escritura literal `14px`:
   RNF-6 CA 2 la prohíbe expresamente porque no escala con la base del navegador (con base
   a 32 px seguiría midiendo 14 px y la proporción 0,875 se rompería); además rompería la
   convención de la hoja, que mide todos los tamaños en `rem`.
2. **No compensar el estrechamiento de la fila**: se deja `line-height: 1` del porcentaje
   y `margin: 8px 0 0` de los minutos exactamente como están. *Descartada* la compensación
   (ajustar márgenes o interlínea para recolocar la línea de minutos): la spec excluye de
   adrede los espaciados añadidos (RF-3 CA 3, «Fuera de alcance») y el desplazamiento
   vertical es efecto propio del menor tamaño, permitido; compensar añadiría complejidad y
   riesgo de descuadrar a cambio de un efecto que la spec pide expresamente tolerar.
3. **Actualizar los dos comentarios.** *Descartada* la opción de dejarlos como están:
   RNF-5 exige que los comentarios no contradigan lo que se ve en pantalla (un comentario
   que anuncia «~20 px» sobre una cifra de 14 px engaña a quien aprende leyendo el código);
   precedente: spec 003 reescribió sus tres comentarios afectados por el mismo motivo.
4. **Sin variable CSS ni clase común** para los dos tamaños. *Descartada* la extracción a
   una custom property (p. ej. `--tamano-progreso`): dos declaraciones iguales no justifican
   un nombre nuevo; el código didáctico se lee mejor con el valor directo en cada regla, y
   la spec pide tocar solo el tamaño.

## 5. Estrategia de verificación con `node --test`

- **Sin tests nuevos**: no hay lógica que tocar (fuera de alcance de la spec). La puerta
  es de regresión: **`node --test` debe seguir en verde con 42/42** antes de dar la tarea
  por hecha (principio 4 de la constitución: no se avanza con tests en rojo).
- **La verificación de los RF es visual/manual en navegador** (`file://` con doble clic),
  a **1280 px** y **375 px**, usando `getComputedStyle` en la consola — la spec define
  «14 px» como el tamaño de fuente CALCULADO, con tolerancia ±0,5 px. Lista concreta:
  1. `getComputedStyle(.objetivo-porcentaje).fontSize` = 14 px (±0,5) con base 16 (RF-1);
  2. `getComputedStyle(.objetivo-progreso).fontSize` = 14 px (±0,5), comprobado en los
     dos estados: «0%» / «0 de 300 min» (inicio) y «100%» / «Objetivo cumplido»
     (cumplido), con el texto intacto en ambos (RF-2, RF-2 CA 1, casos límite);
  3. el porcentaje conserva familia serif, `font-weight: 600` y color tinta; los minutos,
     su color tinta clara (RF-3 CA 1-2);
  4. la estructura no cambia: el porcentaje sigue en la fila tras la barra y los minutos
     debajo, con `line-height` y `margin` originales (sin espaciados nuevos); que la fila
     se estreche y los minutos suban es el efecto permitido (RF-3 CA 3);
  5. ningún otro texto cambia de tamaño: subtítulo «Barra de proceso semanal», cifras de
     datos (racha, minutos de la semana, días del mes, última sesión) y formulario de
     sesión conservan su `font-size` calculado (RF-4);
  6. altura de la barra = 12 px y ancho total de la columna intactos; sin desbordes
     horizontales a 1280 px ni a 375 px (RNF-4, casos límite);
  7. los dos comentarios de `styles.css` citan 14 px / 0,875 de la base y ya no anuncian
     «~20 px» ni «16 px» (RNF-5);
  8. consola sin errores y, al final, localStorage solo con las tres claves habituales
     (`diario-estudio-sesiones`, `diario-estudio-mejor-racha`,
     `diario-estudio-objetivos`) (criterios de finalización);
  9. la página abre con doble clic sin errores (RNF-1);
  10. **Opcional pero recomendado — RNF-6**: en la consola,
      `document.documentElement.style.fontSize = '32px'` (la base pasa a 32 px) y medir de
      nuevo: los dos tamaños calculados pasan a 28 px (±0,5), manteniendo la proporción
      0,875; recargar la página para revertirlo. Es factible en `file://` porque el cambio
      es solo de la raíz en memoria. Si aun así no se quisiera tocar la raíz, la
      proporción queda garantizada por el propio uso de `rem` (revisión de §2.1: `0.875rem`
      es la única forma de cumplir a la vez 14 px con base 16 y «0,875 de la base» en
      cualquier ajuste).

## 6. Cobertura RF

| Requisito | Sección del plan | Verificación (§5) |
|---|---|---|
| RF-1 (porcentaje a 14 px) | §2.1.1 | paso 1 |
| RF-2 (texto de minutos a 14 px) | §2.1.2 | paso 2 |
| RF-3 (resto del aspecto y estructura intactos) | §2.1 (solo `font-size` + comentarios) y §2.2 | pasos 3, 4 |
| RF-4 (aislamiento: ningún otro texto cambia) | §1 y §2.2 (solo dos reglas) | paso 5 |
| RNF-1 (doble clic, `file://`) | §1 (CSS puro, sin build) | paso 9 |
| RNF-2 (solo presentación) | §1 (único archivo: `styles.css`) | revisión del diff: solo `styles.css`, 4 líneas |
| RNF-3 (textos visibles sin cambios de contenido) | §2.1 (ningún `textContent` ni color se toca) | paso 2 |
| RNF-4 (sin desbordes a 1280/375) | §3 (aspecto que sigue cabiendo) | paso 6 |
| RNF-5 (comentarios coherentes con la pantalla) | §2.1.3 y decisión 3 | paso 7 |
| RNF-6 (unidades relativas, 0,875 de la base) | §2.1 (por qué `0.875rem`) y decisión 1 | paso 10 |
