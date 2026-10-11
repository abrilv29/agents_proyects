# Tareas — Spec 002: objetivo semanal

Orden de dependencia. Cada tarea es de 20–30 min como máximo. Estado: T1–T13 cerradas
(implementación y verificación hechas el 08/10/2026; validación con `@reviewer` el
08/10/2026 con veredicto APROBADO y `node --test` 42/42; T11 = rediseño visual, T12 =
«Barra de proceso semanal» y T13 = botón del objetivo al estilo selector de calendario,
los tres aprobados el 08/10/2026). Tests primero en la lógica: `node --test` en verde
antes de cerrar cada tarea.

- [x] **T1 — Claves de semana en `goals.js` (`getMondayKey`, `getSaveTargetKey`) con
  export condicional y sus tests.** RF: RF-3, RF-4; RNF-2, RNF-5, RNF-3.
  Hecho cuando: `tests/goals.test.js` cubre lunes→domingo, cruce de mes y de año, semana
  con cambio de horario y las fronteras domingo 23:59 / lunes 00:00 (de martes a domingo
  la clave de guardado es el lunes siguiente; el lunes se queda en su semana), y
  `node --test` pasa en verde con `goals.js` exportando por `module.exports`.

- [x] **T2 — Validación de la entrada y lectura del almacén (`parseGoalInput`,
  `isValidGoal`, `parseGoalStore`, `readGoal`).** RF: RF-2, RF-3; RNF-4.
  Hecho cuando: los tests cubren vacío y `0` → borrar; 1, 300 y 100000 válidos; letras,
  negativos, decimales, 100001 y basura no string → `valid: false`; JSON ilegible → `{}`;
  entrada ausente, `null` o corrupta → `null`; dos claves-lunes distintas se leen sin
  pisarse; `node --test` en verde.

- [x] **T3 — Pre-rellenado y progreso (`getPrefillValue`, `getProgress`).** RF: RF-5,
  RF-6; RNF-2.
  Hecho cuando: los tests cubren almacén vacío → sin valor; última clave con 300 → 300;
  última clave vacía o corrupta → vacío aunque haya valores anteriores; y el progreso
  0/100/150/200 de 300 → 0/33/50/67 % con `Math.round`, 300 y 350 → cumplido; `node --test`
  en verde.

- [x] **T4 — Bloque «Objetivo semanal» en `index.html`.** RF: RF-1; RNF-1, RNF-6.
  Hecho cuando: la zona de estadísticas contiene el título «Objetivo semanal», la etiqueta
  «Objetivo semanal (minutos)», el campo (`type="text"` con `inputmode="numeric"`), el
  botón «Guardar objetivo», la invitación, los contenedores de barra y texto y su propio
  nodo de mensaje; `goals.js` se carga antes que `app.js` y la página abre con doble clic
  sin errores de consola.

- [x] **T5 — CSS del bloque, la barra y el móvil.** RF: RF-1 (CA), RF-5 (barra); RNF-7,
  RNF-8.
  Hecho cuando: en escritorio el bloque ocupa una fila completa justo debajo de «Esta
  semana» con su regla separadora, la barra usa pista en `--linea` y relleno en ámbar
  `--marca`, sin tarjetas ni acentos nuevos; a 375 px queda apilado dentro de la zona de
  estadísticas y las tres estadísticas conservan su aspecto actual.

- [x] **T6 — Guardado del objetivo en `app.js`.** RF: RF-2, RF-4, RF-8; RNF-6.
  Hecho cuando: al pulsar «Guardar objetivo» se valida con `parseGoalInput`, se escribe en
  la clave de `getSaveTargetKey(new Date())` de `diario-estudio-objetivos` (número o
  `null`), se muestran los cuatro mensajes en español («Objetivo guardado para esta
  semana», «Objetivo eliminado de esta semana», «Se aplicará el lunes que viene» e
  «Introduce un número entero entre 1 y 100000» con `mensaje-error`), el valor inválido
  no cambia nada, no se tocan sesiones ni racha y `node --test` sigue en verde.

- [x] **T7 — Estado del bloque y recálculo en `app.js`.** RF: RF-5, RF-6, RF-7; RNF-2,
  RNF-6.
  Hecho cuando: `mostrarObjetivo()` se ejecuta dentro de `actualizar()` (carga, guardar
  sesión y guardar objetivo), el campo solo se pre-rellena en la carga inicial, con
  objetivo vigente se ven la barra con `role="progressbar"` y sus valores más «X de Y
  min (Z%)» o «Objetivo cumplido», sin objetivo se ve solo «Fija tu objetivo semanal», el
  bloque refleja siempre la semana en curso y `node --test` sigue en verde.

- [x] **T8 — Actualizar `AGENTS.md` (sección Datos).** RF: criterios de finalización;
  RNF-4.
  Hecho cuando: `AGENTS.md` documenta la clave `diario-estudio-objetivos` (una entrada por
  clave-lunes como histórico, `null` = sin objetivo, rango 1–100000 y aplazamiento al
  lunes cuando se guarda de martes a domingo frente a aplicación inmediata el lunes) y
  confirma que `diario-estudio-sesiones` y `diario-estudio-mejor-racha` no cambian.

- [x] **T9 — Verificación manual (guía con D = día de la semana en que se ejecuta).**
  RF-1…RF-8 en conjunto; RNF-1, RNF-4, RNF-7, RNF-8.
  Hecho cuando: los 8 pasos de la guía de la spec pasan con la rama de D anotada (si D no
  es lunes, se anota que las ramas de lunes de los pasos 2, 5 y 7 se comprueban el próximo
  lunes); el campo tiene etiqueta en español, «Guardar objetivo» no se confunde con
  «Guardar sesión» y la barra expone `role="progressbar"` además del texto; la captura a
  375 px muestra el bloque en la zona de estadísticas; la consola está limpia; las claves
  previas siguen intactas y al finalizar se dejan los datos de prueba borrados.

- [x] **T10 — Actualizar `MEMORY.md`.** RF: criterios de finalización.
  Hecho cuando: `MEMORY.md` tiene ≤ 50 líneas, recoge el resultado de la verificación y
  las decisiones clave del objetivo semanal (almacén por clave-lunes con `null`,
  aplazamiento D6/D7 y `goals.js`).

- [x] **T11 — Rediseño visual del bloque «Objetivo semanal» («La línea de
  compromiso»), solo `styles.css`.** RF-1 (CA), RF-5, RF-6 (aspecto de los dos
  estados); RNF-7, RNF-8.
  Hecho cuando: el bloque pasa a grid de dos columnas (título como título de sección,
  campo y botón compacto en la misma línea, invitación en cursiva serif, cifra
  ampliada con `clamp`), la barra mide 12 px con transición de ancho anulable por
  `prefers-reduced-motion`, a 375 px colapsa a una columna sin desbordes y con el
  formulario apilado; `node --test` 42/42, contraste AA (tinta 13,44:1,
  tinta-clara 5,69:1), consola limpia y localStorage sin datos de prueba. Sin tocar
  `index.html` ni JS. Capturas: `diseno-objetivo-vacio.png`,
  `diseno-objetivo-activo.png`, `diseno-375px.png`.

- [x] **T12 — Rediseño del bloque pedido por el usuario: formulario en una fila,
  columna de resultado con título y sin invitación (`index.html`, `styles.css`,
  `app.js`).** RF-1, RF-5 (aspecto de la interfaz); RNF-6, RNF-7, RNF-8.
  Hecho cuando: campo y botón comparten fila dentro de `.objetivo-formulario`
  (columna de 300 px: input 252 + hueco 12 + botón 36), la etiqueta pasa a «Fija tu
  objetivo semanal (minutos)» con `placeholder="100 min"`, la invitación desaparece de
  HTML, CSS y JS, y sin objetivo vigente la columna derecha entera
  (`.objetivo-resultado`: título «Barra de proceso semanal», barra con el porcentaje
  al final a 20 px y los minutos a 16 px) queda oculta; con objetivo se muestra y
  `aria-valuetext` conserva «X de Y min (Z%)». Verificado el 08/10/2026: `node --test`
  42/42, navegador a 1280 y 375 px sin desbordes, D6 intacto («Se aplicará el lunes
  que viene»), consola limpia y localStorage vacío al final. **Pendiente de aprobación**:
  la enmienda de `spec.md`/`plan.md` (RF-1 CA, RF-4, RF-6 y la decisión 5 siguen
  citando la invitación y el texto «X de Y min (Z%)»).

- [x] **T13 — Botón «Guardar objetivo» al estilo selector del calendario, solo
  `styles.css`.** RF-1 (CA de la interfaz); RNF-7, RNF-8.
  Hecho cuando: `.objetivo-formulario` pinta el subrayado compartido (`gap: 0` y
  `border-bottom` continuo bajo campo Y botón, `:focus-within` lo oscurece al enfocar),
  el input del objetivo no pinta el suyo (reglas scoped a `.objetivo-formulario`, los
  inputs de sesión no cambian), el botón queda al ras: 36×41 px con fondo transparente,
  sin borde exterior y solo `border-left` de filete vertical, y SIN efecto hover/active
  (se anula la regla global `button:hover` sin tocar la de los demás botones); el
  icono sigue en tinta a 15 px (`filter: none`). Verificado el 08/10/2026: `node --test`
  42/42, geometría en navegador (gap 0, input 40,8 px / botón 41 px con el mismo pie,
  subrayado continuo), hover y focus comprobados con el ratón y el foco, «Guardar
  sesión» con su hover intacto, consola limpia y sin desbordes a 1280 y 375 px.