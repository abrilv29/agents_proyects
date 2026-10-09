# Plan — Spec 002: objetivo semanal de estudio

Spec aprobada el 07/10/2026. Orden: spec → lógica → tests → interfaz → verificación.

## Decisiones de la spec (con el usuario)

1. Bloque propio «Objetivo semanal» en la zona de estadísticas, justo debajo del dato
   «Esta semana», con campo numérico y botón «Guardar objetivo» (D1).
2. Un objetivo por semana, asociado al lunes que la abre; cada lunes se parte de cero
   (D2, RF-3).
3. Vigencia: de martes a domingo el cambio se aplaza siempre al lunes siguiente (D6);
   durante el lunes se aplica ese mismo día (D7).
4. Progreso: barra + «X de Y min (Z%)»; al 100% la barra se satura y el texto es «Objetivo
   cumplido», sin exceso (D4).
5. Sin objetivo: solo la invitación «Fija tu objetivo semanal» y el campo pre-rellenado,
   sin barra ni porcentaje (D5).
6. Sin interfaz de semanas pasadas: los objetivos pasados quedan como histórico por
   clave-lunes, sin UI para verlos ni editarlos (D8).

## 1. Archivos y responsabilidades

- **Crear `goals.js`** — lógica pura del objetivo semanal: clave-lunes, clave de
  guardado, validación de la entrada, lectura del almacén, pre-rellenado y progreso. Sin
  DOM ni localStorage, con export condicional `module.exports` (mismo patrón que
  `stats.js`).
  - *Por qué un archivo nuevo y no ampliar `stats.js`*: `stats.js` está presentado (su
    cabecera y `AGENTS.md`) como "lógica pura del mapa de calor"; meter aquí el objetivo
    obligaría a redefinir su responsabilidad, mezclaría dos specs en un archivo y
    mezclaría sus tests.
  - *Alternativa descartada*: reutilizar `toDayKey` de `stats.js` con `require`
    condicional — en `file://` depende del orden de los `<script>` y en Node de un ramal
    especial difícil de entender. Por eso `goals.js` trae sus propios ayudantes de fecha
    (10 líneas) y es autocontenido.
- **Crear `tests/goals.test.js`** — suite de `node --test` de toda la lógica anterior; se
  amplía en T2 y T3. `tests/stats.test.js` sigue intacto: `node --test` ejecuta las dos.
- **Modificar `index.html`** — bloque dentro de `<section class="resumen">`, justo después
  del dato «Esta semana»; nodo de mensaje propio; `<script src="goals.js">` antes de
  `app.js`.
- **Modificar `styles.css`** — fila completa del bloque, barra de progreso, invitación y
  apilado a ≤560 px, con la paleta actual (ámbar `--marca` como único acento, sin
  tarjetas).
- **Modificar `app.js`** — clave nueva de almacenamiento, carga/guardado del almacén,
  `mostrarObjetivo()` dentro de `actualizar()`, listener de «Guardar objetivo» y
  `mostrarMensaje` con elemento opcional.
- **Actualizar `AGENTS.md`** (sección Datos) y **`MEMORY.md`** al cierre.

## 2. Funciones puras con "hoy" como parámetro

Todas en `goals.js`, en inglés, sin DOM ni localStorage. "Hoy" es un `Date` local que
entrega el llamador: la función solo mira su fecha (nunca `toISOString()` ni
`new Date("AAAA-MM-DD")`, RNF-5).

1. `getMondayKey(hoy)` → `string` — clave-lunes `AAAA-MM-DD` de la semana que contiene a
   `hoy` en hora local. → RF-3; RNF-2, RNF-5.
2. `getSaveTargetKey(hoy)` → `string` — clave-lunes de la semana destino del guardado
   (regla D6/D7). → RF-2, RF-4.
3. `parseGoalInput(raw)` → `{ valid: boolean, value: number | null }` — `value: null`
   significa "borrar el objetivo de la semana destino"; `valid: false` = error, no se
   guarda nada. → RF-2, RF-8.
4. `isValidGoal(value)` → `boolean` — entero entre `GOAL_MIN` (1) y `GOAL_MAX` (100000),
   ambos exportados (el mensaje de error de `app.js` los reutiliza). → RF-2.
5. `parseGoalStore(raw)` → `object` — JSON → objeto; JSON ilegible o que no sea un objeto
   → `{}` (defensa, nunca lanza). → RNF-4.
6. `readGoal(goals, mondayKey)` → `number | null` — objetivo de esa clave-lunes; ausente,
   `null` o valor corrupto → `null`. → RF-2, RF-3, RF-6.
7. `getPrefillValue(goals)` → `number | null` — valor de la clave-lunes más reciente (las
   claves ISO se ordenan como texto = orden cronológico); si esa entrada está vacía o es
   corrupta → `null`. → RF-6.
8. `getProgress(minutes, goal)` → `{ percent: number, completed: boolean }` —
   `percent = min(100, Math.round(minutes / goal * 100))`, `completed = minutes >= goal`;
   precondición `goal >= 1` (no hay división por cero). → RF-5, RF-7.

Internas (no exportadas): `toLocalDayKey`, `fromLocalDayKey`, `isMondayKey`.

Ninguna función de `goals.js` escribe en localStorage ni toca el DOM: eso vive en
`app.js` (mismo patrón que la spec 001). El progreso reutiliza
`calcularMinutosSemana()` de `app.js` (decisión 6 de la sección 6).

## 3. Algoritmo en pseudocódigo

### 3.1 Clave-lunes de la semana en curso

```
getMondayKey(hoy):
    dia    <- new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())   // sin hora, local
    offset <- (dia.getDay() + 6) % 7          // lun=0, mar=1, ... , dom=6
    lunes  <- copia de dia con setDate(dia.getDate() - offset)
    devolver claveLocal(lunes)                // getters locales -> "AAAA-MM-DD"
```

Nunca se restan milisegundos (horario de verano: días de 23/25 h) ni se usa UTC.

### 3.2 Clave de guardado: la regla D6/D7

```
getSaveTargetKey(hoy):
    lunesEsta <- getMondayKey(hoy)
    SI hoy.getDay() = 1:                      // lunes, de 00:00 a 23:59 -> D7
        devolver lunesEsta                    // aplica a la semana en curso
    SINO:                                     // martes...domingo -> D6
        devolver claveLocal(sumarDias(lunesEsta, 7))   // se aplaza al lunes siguiente
```

La regla de vigencia vive solo aquí: **el día de la semana local decide la clave bajo la
que se escribe**. No se comparan instantes ni fechas guardadas.

### 3.3 Estado a mostrar (lectura)

```
mostrarObjetivo(hoy):
    claveHoy  <- getMondayKey(hoy)
    objetivo  <- readGoal(almacen, claveHoy)     // number | null
    minutos   <- calcularMinutosSemana()        // ya existente: lunes..domingo local

    SI objetivo = null:                         // sin objetivo vigente -> RF-6
        ocultar barra y progreso
        mostrar "Fija tu objetivo semanal"
    SINO:                                       // con objetivo vigente -> RF-5
        p <- getProgress(minutos, objetivo)
        ancho barra <- p.percent %
        aria-valuemin <- 0
        aria-valuemax <- objetivo
        aria-valuenow <- min(minutos, objetivo)
        texto <- p.completed
                     ? "Objetivo cumplido"
                     : `${minutos} de ${objetivo} min (${p.percent}%)`
        aria-valuetext <- texto
```

"¿Está vigente?" no usa `Date` frágiles: es
`readGoal(almacen, getMondayKey(hoy)) !== null`. Solo se comparan claves ISO como texto
(orden lexicográfico = orden cronológico) y el número de día de la semana local. Cero
comparaciones de marcas de tiempo: la frontera domingo 23:59 / lunes 00:00 queda resuelta
en la clave, no en el reloj.

### 3.4 Guardado

```
al pulsar "Guardar objetivo":
    parsed <- parseGoalInput(campo.value)
    SI parsed.valid = FALSO:
        mostrarMensaje(mensajeObjetivo,
                       "Introduce un número entero entre 1 y 100000", "error")
        detener                                 // no se escribe nada (RF-2)

    hoy        <- new Date()
    claveDestino <- getSaveTargetKey(hoy)
    almacen[claveDestino] <- parsed.value       // número o null (borrado)
    guardar almacen en "diario-estudio-objetivos"

    SI claveDestino <> getMondayKey(hoy):       // D6: martes a domingo
        mostrarMensaje(mensajeObjetivo, "Se aplicará el lunes que viene", "ok")
    SINO SI parsed.value = null:                // D7 + campo vacío
        mostrarMensaje(mensajeObjetivo, "Objetivo eliminado de esta semana", "ok")
    SINO:                                       // D7 + valor
        mostrarMensaje(mensajeObjetivo, "Objetivo guardado para esta semana", "ok")

    actualizar()                                // recalcula todo (RF-7)
```

El bloque se pinta siempre desde `getMondayKey(hoy)`, nunca desde lo tecleado: por eso de
martes a domingo la semana en curso no cambia, la invitación sigue visible y el valor
recién guardado espera a su lunes (RF-2 CA, RF-4).

### 3.5 Pre-rellenado (solo en la carga)

```
al cargar la pagina:
    campo.value <- getPrefillValue(almacen) != null
                       ? String(getPrefillValue(almacen))
                       : ""
```

Se ejecuta una sola vez al inicio; `actualizar()` no vuelve a tocar el campo.

## 4. Interfaz

- **Ubicación**: `<section class="resumen">`, inmediatamente después del dato «Esta
  semana». En escritorio el bloque ocupa una fila completa por debajo de la fila de los
  tres datos (`grid-column: 1 / -1; grid-row: 2`); a ≤560 px, al liberarse esa colocación
  explícita, queda apilado justo debajo de «Esta semana», dentro de la misma zona (RF-1
  CA, D1). Los tres datos conservan su texto, su orden y su cálculo.
- **Contenido** (textos exactos de la spec):
  - Título `<h2>`: «Objetivo semanal».
  - Etiqueta: «Objetivo semanal (minutos)» + campo con `id` propio.
  - Botón: «Guardar objetivo». Fuera de un `<form>`: el guardado solo ocurre al pulsarlo
    (RF-1 CA) y con `type="text"` las letras llegan tal cual al validador.
  - Invitación: «Fija tu objetivo semanal» (solo visible sin objetivo vigente).
  - Barra `<div role="progressbar">` con `aria-valuemin="0"`, `aria-valuemax` = objetivo,
    `aria-valuenow` = minutos (techo: objetivo) y `aria-valuetext` = texto visible; más un
    párrafo con «X de Y min (Z%)» o «Objetivo cumplido».
  - Nodo de mensaje propio con las clases ya existentes `mensaje`, `mensaje-ok` y
    `mensaje-error`, separado del mensaje de «Guardar sesión» (RF-8 CA).
- **Estados**: (a) sin objetivo vigente → invitación + campo + botón, sin barra ni
  porcentaje; (b) con objetivo vigente → barra + texto. El estado se decide en cada
  pintado por la clave-lunes de hoy.
- **Mensajes**: `mostrarMensaje(texto, tipo, elemento)` con el elemento opcional (por
  defecto, el de sesión); el temporizador de ocultación se guarda en el propio elemento,
  así los dos mensajes no se pisan.
- **Accesibilidad**: el bloque hereda `aria-live="polite"` de `.resumen`, así que los
  cambios de progreso se anuncian sin código extra; la barra explica el estado por
  atributos y por texto (RF-5 CA).
- **Estilo**: reutiliza los rótulos de `.dato-titulo` y los campos de `.campo`; pista de
  la barra en `--linea` y relleno en `--marca` (ámbar, único acento), sin tarjetas ni
  acentos nuevos (RNF-8), legible y tocable a 375 px (RNF-7). Textos en español (RNF-6).

## 5. Datos

- Clave nueva: **`diario-estudio-objetivos`** (constante `CLAVE_OBJETIVOS` en `app.js`,
  junto a `CLAVE` y `CLAVE_MEJOR`).
- Formato: JSON, objeto con una entrada por clave-lunes:

  ```json
  { "2026-09-28": 240, "2026-10-05": 300, "2026-10-12": null }
  ```

  - clave: `AAAA-MM-DD` del lunes que abre la semana (siempre un lunes, hora local);
  - valor entero entre 1 y 100000 → objetivo de esa semana;
  - valor `null` → la semana quedó sin objetivo a propósito (se guardó vacío o 0);
  - clave ausente → esa semana nunca tuvo objetivo;
  - valor corrupto (texto, decimal, 0, negativo, >100000) → se trata como sin objetivo y
    no se ofrece en el pre-rellenado (RF-2, RF-6).
- Compatibilidad (RNF-4): clave nueva; `diario-estudio-sesiones` y
  `diario-estudio-mejor-racha` no cambian de nombre ni de formato; nadie pierde datos.
  Almacenamiento ausente o JSON ilegible → `{}` (sin errores, estado de usuario nuevo).
- Rango: 1–100000 inclusive. Vacío o `0` → borra el objetivo de la semana destino (nunca
  son valores válidos de objetivo).
- Escritura: solo al pulsar «Guardar objetivo»; se serializa el almacén completo con
  `JSON.stringify` (los `null` se conservan).

## 6. Decisiones justificadas (con la alternativa descartada)

1. **Archivo de la lógica: `goals.js` nuevo**, con sus 10 líneas de ayudantes de fecha
   propios. *Descartada*: ampliar `stats.js` (su nombre y su cabecera describen el mapa de
   calor; se mezclarían dos specs y sus tests) y el `require` condicional de `stats.js`
   desde `goals.js` (acoplamiento al orden de los `<script>` en `file://` y ramal
   especial en Node).
2. **Formato del almacén: objeto por clave-lunes con `null` como "sin objetivo"**.
   *Descartada*: borrar la clave al guardar vacío — el pre-rellenado miraría la entrada
   anterior con valor y resucitaría un objetivo que la persona acababa de quitar (contra
   RF-6: "al recargar, el campo sale vacío"); `0` como marcador (indistinguible de un
   objetivo legítimo al leer y validar); array de objetivos (buscar la semana exige
   recorrer y comparar fechas, con más fallos posibles que un índice por clave).
3. **"¿Está vigente?" = `readGoal(almacen, getMondayKey(hoy))`, con la regla D6/D7 solo
   al escribir (`getSaveTargetKey`)**. *Descartada*: guardar una marca de tiempo
   `aplicaDesde` y comparar instantes al leer (fronteras de zona horaria, medianoche y un
   estado intermedio "programado pero no vigente" que la spec no pide); decidir "es el
   mismo día" restando fechas (el fallo clásico del horario de verano). Solo se usan
   `getDay()` local y claves ISO comparadas como texto.
4. **Campo con `type="text"` + `inputmode="numeric"`** (el valor es literalmente lo que
   se escribe; sin `pattern`: el campo no está en un `<form>` y la validación es propia,
   en JS). *Descartado*: `type="number"` — con él, escribir
   letras deja el campo en vacío, así que «Guardar objetivo» borraría sin querer el
   objetivo y nunca mostraría el error de RF-8 (la guía, paso 6, exige que "abc" dé error);
   además `validity.badInput` no es testeable con `node --test`. El campo sigue siendo
   numérico para quien lo usa: `inputmode` abre el teclado numérico en móvil.
5. **El pre-rellenado se aplica solo en la carga inicial**. *Descartado*: rellenar en cada
   `actualizar()` — borraría lo que la persona esté escribiendo cada vez que guarda una
   sesión.
6. **El progreso reutiliza `calcularMinutosSemana()` existente**. *Descartada*: una
   segunda suma de la semana dentro de `goals.js` (podría divergir del dato «Esta semana»
   ya mostrado, y RF-1 CA pide conservar su cálculo). En la práctica las reglas coinciden
   porque `app.js` guarda las sesiones con minutos enteros.
7. **Los textos en español se quedan en `app.js`; `goals.js` devuelve solo datos**
   (`{valid, value}`, `{percent, completed}`). *Descartada*: `formatProgressText` en
   `goals.js` (rompería el patrón de `stats.js`, que no contiene español; RNF-6: código
   en inglés, interfaz en español). El formato exacto lo cubren el porcentaje probado en
   `node --test` y la guía manual.
8. **Mensaje propio para el objetivo y `mostrarMensaje(texto, tipo, elemento)`** con
   temporizador por elemento. *Descartado*: un único nodo de mensaje compartido (RF-8 CA:
   los mensajes de «Guardar sesión» no se sustituyen) y duplicar la función (código
   repetido con la misma lógica de temporizador).
9. **Bloque en el DOM justo después de «Esta semana», con fila completa en escritorio**.
   *Descartado*: colocarlo al final de la fila (tras «Mejor racha»), más simple en CSS
   pero a 375 px quedaría alejado del dato «Esta semana», contra RF-1 CA y D1.

## 7. Estrategia de tests con `node --test`

Suite nueva `tests/goals.test.js`, con el estilo de `tests/stats.test.js`: `node:test` +
`node:assert/strict`, "hoy" fijo con `new Date(año, mes, día[, hora, minuto])` para las
fronteras. `node --test` ejecuta las dos suites sin paquetes nuevos (RNF-3).

| Función | RF | Casos |
|---|---|---|
| `getMondayKey` | RF-3; RNF-2, RNF-5 | lunes → su propia clave; miércoles y domingo → el lunes de su semana; cruce de mes y de año (2027-01-01 → 2026-12-28); semana con cambio de horario (2026-10-26, tras el DST del 25); nunca UTC. |
| `getSaveTargetKey` | RF-4 (D6/D7), RF-3 | lunes 00:00 y lunes 23:59 → misma semana; martes a sábado → lunes siguiente; domingo 23:59 → lunes siguiente; domingo 2027-01-03 → 2027-01-04; dos semanas seguidas dan claves distintas (no se pisan). |
| `parseGoalInput`, `isValidGoal` | RF-2, RF-8 | `""` y `"0"` → válido con `value: null`; `"1"`, `"300"`, `"100000"` válidos; `"abc"`, `"-5"`, `"3.5"`, `"100001"`, `"1e5"` y no-string → `valid: false`. |
| `parseGoalStore`, `readGoal` | RF-2, RF-3, RF-6; RNF-4 | JSON ilegible o no objeto → `{}`; clave ausente o `null` → `null`; valor corrupto → `null`; `300` → `300`; dos claves-lunes distintas se leen por separado. |
| `getPrefillValue` | RF-6 | almacén vacío → `null`; última clave con 300 → 300; última clave `null` o corrupta → `null` aunque haya valores anteriores; ignora claves con formato inválido; cruce de año (2026-12-28 vs 2027-01-04). |
| `getProgress` | RF-5, RF-7 | 0/100/150/200 de 300 → 0/33/50/67 % con `Math.round`; 300 → cumplido al 100 %; 350 → cumplido (nunca >100); objetivo menor que los minutos ya estudiados → cumplido desde el primer pintado. |

Queda para la verificación manual (interfaz y entorno): RF-1 (bloque, textos y
emplazamiento), RF-5 (barra y `role="progressbar"` en el DOM), RF-6 (invitación y
pre-rellenado tras recargar), RF-7 (recálculo al abrir, al guardar sesión y al guardar
objetivo), RF-8 (los cuatro mensajes), RNF-1 (doble clic, sin errores por `module`),
RNF-4 (claves existentes intactas), RNF-6/RNF-7/RNF-8 (español, 375 px, diseño) y la
comprobación de accesibilidad.

## Riesgos / notas

- La página abierta que cruza la medianoche o cambia de semana no se actualiza sola: el
  cambio se ve al recargar (limitación aceptada en RF-7 CA, igual que el resto de datos).
- `calcularMinutosSemana()` acepta minutos no enteros mientras la definición pide enteros:
  sin efecto práctico porque `app.js` guarda `Math.round(...)`; no se toca esa función
  (RF-1 CA).
- Export condicional de `goals.js`: mismo punto delicado que en la spec 001; se valida
  abriendo `index.html` con doble clic (T4 y T9).
- El campo no vive en un `<form>`: si en el futuro se quiere guardar con Enter, haría
  falta un formulario (ahora fuera de alcance: RF-1 CA pide que guarde solo el botón).