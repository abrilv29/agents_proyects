# Plan — Spec 003: botón de guardar del objetivo integrado en el campo

Spec aprobada por el usuario (09/10/2026). Es un cambio de presentación: un renglón de
CSS más sus comentarios. Por eso este plan no tiene sección de funciones puras ni de
pseudocódigo (RNF-2: no se toca lógica; `goals.js`, `app.js` y `stats.js` siguen tal
como están).

## 1. Archivos y responsabilidades

- **Modificar `styles.css`** — único archivo con cambios:
  1. regla `.objetivo button` (~líneas 372-383): quitar `border-left`;
  2. actualizar los comentarios del estilo que describen el filete como separador
     (cabecera de `.objetivo button`, cabecera de `.objetivo-formulario` y el comentario
     del icono de 15 px) para que no contradigan la pantalla (RNF-6).
- **`index.html`** — sin cambios: la estructura del bloque `.objetivo` (líneas 48-70) ya
  es la correcta; el requisito se cumple solo con CSS.
- **`app.js`, `goals.js`, `stats.js`** — sin cambios: no hay lógica que tocar.
- **`tests/`** (`tests/stats.test.js`, `tests/goals.test.js`) — sin cambios y sin tests
  nuevos: se ejecutan solo como puerta de regresión (`node --test` 42/42).
- **`MEMORY.md`** — actualización final al cerrar la tarea (qué cambió y por qué),
  como manda `AGENTS.md`.

## 2. Qué se cambia exactamente

### 2.1 En `styles.css`

1. **Regla `.objetivo button` (~línea 381)**: borrar el renglón
   `border-left: 1px solid #cfdce8;`. La regla ya declara `border: none;` justo encima
   (línea 380) y `border-left` solo servía para anularlo y pintar el filete; al quitarlo,
   la declaración de borde efectiva vuelve a ser `border: none` y el botón no pinta
   ninguna línea vertical. El resto de la regla (`width: 26px`, `height: 41px`,
   `margin-top: 0`, `padding: 0`, `background: transparent`, `cursor: pointer`) queda
   intacto.
2. **Comentarios obsoletos a actualizar** (RNF-6):
   - cabecera de `.objetivo button` (líneas 368-371): «solo un filete vertical que lo
     separa» describe justo lo que desaparece; se reescribe para decir que el botón va al
     ras del campo, sin separación ni caja propia (conservando lo cierto: «Sin hover» y
     «el subrayado lo pinta el formulario»);
   - comentario del icono (línea 400): «Icono pequeño (15 px) dentro del filete vertical»
     → el filete ya no existe; pasa a describir el icono centrado dentro del botón;
   - cabecera de `.objetivo-formulario` (líneas 322-325): la comparación «como el
     selector del calendario del input de fecha» aludía al estilo del selector nativo, que
     es justo el que traía la divisoria; se ajusta para no implicar separación (se
     conservan lo cierto: misma fila, `gap: 0`, alineación por abajo y subrayado continuo
     bajo campo Y botón).
   - **No se tocan** el comentario de `.objetivo + .dato` (línea 254) ni el de la sección
     (línea 292): describen otros filetes (el que separa bloques de datos y la regla
     superior del bloque), que siguen existiendo.

### 2.2 Por qué no hace falta tocar nada más

- **El subrayado compartido ya lo pinta `.objetivo-formulario`** (`border-bottom: 1.5px`
  con `:focus-within`, líneas 326-338): el filete era vertical, no formaba parte de ese
  borde inferior, así que al quitarlo el subrayado sigue siendo una única línea continua
  de extremo a extremo (RF-3, sin obras).
- **El ancho no cambia**: con `* { box-sizing: border-box }` (línea 17), `width: 26px`
  ya contaba el filete *dentro* del botón; sin filete, los 26 px son de contenido puro.
  El formulario sigue midiendo lo mismo en su columna (input + botón, `gap: 0`; RF-1 CA,
  RF-4).
- **El pie no se mueve**: `height: 41px` del botón y `align-items: flex-end` del
  formulario siguen intactos → pies alineados como hoy (RF-2).
- **El icono sigue centrado**: el centrado no lo daba el filete sino la regla global
  `button { display: flex; align-items: center; justify-content: center; }` (línea 508),
  que `.objetivo button` no anula (solo cambia `flex: none`, medidas, fondos y bordes).
  Al desaparecer el borde de 1 px, el área de contenido crece de 25 a 26 px y el centro se
  desplaza 0,5 px: dentro del umbral de 1 px de RF-2 CA, imperceptible.
- **Hover/active sin regresiones**: la regla scoped `.objetivo button:hover` /
  `:active` (líneas 393-396) que anula la regla global no se toca → el botón objetivo
  sigue sin hover y «Guardar sesión» sigue con el suyo (RF-4, RF-5).
- **Icono**: la regla `.objetivo .boton-icono` (15 px, `filter: none`, líneas 401-407) y
  su aviso sobre `mask` no cambian.
- **HTML, JS y datos**: fuera de alcance de la spec (RNF-2) y del principio de cambio
  pequeño: no se reescribe lo que ya funciona.

## 3. Interfaz

Aspecto final del bloque «Objetivo semanal»: campo de minutos y botón solo-icono se leen
como **una sola pieza continua** —misma fila, sin hueco y sin ninguna línea vertical que
los divida— apoyada sobre el **subrayado compartido** de 1,5 px que recorre el pie de los
dos de extremo a extremo. El botón conserva sus 26×41 px, fondo transparente, icono tinta
de 15 px centrado y el mismo pie que el campo; al enfocar campo o botón, el subrayado se
oscurece sin interrupción (y con el botón enfocado con teclado aparece su anillo de foco
normal). Sin objetivo o con él, sin hover en este botón y con el resto de la página —en
especial «Guardar sesión»— idéntico a hoy. A 375 px el formulario apilado se comporta igual.

## 4. Decisiones (con la alternativa descartada)

1. **Borrar `border-left` entero.** *Descartada*: cambiar solo el color
   (`border-left-color: transparent`) — dejaría una declaración huérfana que invita a
   preguntarse «¿un borde invisible para qué?», ocuparía 1 px de caja sin efecto visible
   y contradiría el tono didáctico del código; quien lea el archivo debe ver exactamente
   lo que hay (RNF-6).
2. **No compensar el medio píxel de desplazamiento del icono.** *Descartada* la
   compensación (márgenes o relleno a mano para volver a colocarlo): 0,5 px es la mitad
   del umbral de 1 px que exige RF-2 CA, el centrado se percibe ópticamente igual, y un
   parche de compensación añadiría complejidad con riesgo real de descuadrar el ancho o el
   pie a cambio de un beneficio invisible.
3. **Actualizar los comentarios afectados.** *Descartada* la opción de dejarlos como
   están: RNF-6 exige que lo que describen los comentarios no contradiga lo que se ve; un
   comentario que dice «filete vertical que lo separa» sobre un botón sin filete induciría
   a error a cualquiera que aprenda leyendo el código.
4. **Limitar el cambio a la regla `.objetivo button` + sus comentarios.** *Descartada*
   la limpieza mayor (reescribir `.objetivo-formulario`, mover el subrayado al botón o
   tocar HTML/JS): RNF-2 lo limita a presentación y el alcance cerrado de la spec es «quitar
   la divisoria y conservar todo lo demás»; cambiar más sería reescribir lo que ya
   funciona.

## 5. Estrategia de verificación con `node --test`

- **Sin tests nuevos**: no hay lógica que tocar (fuera de alcance de la spec). La puerta
  es de regresión: **`node --test` debe seguir en verde con 42/42** antes de dar la tarea
  por hecha (principio 4 de la constitución: no se avanza con tests en rojo).
- **La verificación de los RF es visual/manual en navegador** (`file://` con doble clic),
  a **1280 px** y **375 px**, con esta lista concreta:
  1. reposo: no hay ningún trazo vertical en el límite campo-botón (RF-1);
  2. campo enfocado: el subrayado compartido se oscurece continuo, sin interrupción y sin
     divisoria (RF-1, RF-3);
  3. botón enfocado con teclado (Tab): se ve el anillo de foco (no cuenta como divisoria,
     RF-1 CA 1), el subrayado sigue oscurecido y no hay filete (RF-1);
  4. icono centrado vertical y horizontalmente en el botón, desviación ≤ 1 px (RF-2);
  5. pie del botón alineado con el pie del campo, descuadre < 1 px (RF-2);
  6. ancho total del formulario intacto (campo + botón = ancho de su columna, sin
     cambios) (RF-1 CA);
  7. hover sobre el botón del objetivo: ni fondo ni icono cambian (RF-4);
  8. hover sobre «Guardar sesión»: el fondo **sí** se oscurece como siempre (RF-5);
  9. campo vacío, con valor y en error: en ninguno aparece divisoria (casos límite);
  10. sin desbordes horizontales a 1280 px ni a 375 px (RNF-5);
  11. consola sin errores y, al final, localStorage sin claves nuevas más allá de las tres
      habituales (criterios de finalización);
  12. la página abre con doble clic sin errores (RNF-1).

## 6. Cobertura RF

| Requisito | Dónde se cumple en el plan | Tarea |
|---|---|---|
| RF-1 (sin divisoria vertical, ancho intacto) | §2.1 (quitar `border-left`) + §2.2 (`box-sizing`) + verificación 1, 2, 3, 6 | T1 |
| RF-2 (pies alineados e icono centrado) | §2.2 (height 41 + `flex-end`; centrado por la regla global `button`) + verificación 4, 5 | T1 |
| RF-3 (subrayado compartido intacto) | §2.2 (lo pinta `.objetivo-formulario`, intocado) + verificación 2, 3 | T1 |
| RF-4 (comportamiento del botón sin regresiones) | §2.1 (solo se borra `border-left`; medidas, fondo e icono intactos) + §2.2 (regla scoped de hover sin tocar) + verificación 7 | T1 |
| RF-5 (aislamiento: «Guardar sesión» intacto) | §2.2 y decisión 4 (cambio limitado a `.objetivo button`) + verificación 8 | T1 |
| RNF-1 (doble clic, `file://`) | verificación 12 | T1 |
| RNF-2 (solo presentación) | §1 (único archivo: `styles.css`) | T1 |
| RNF-3 (sin cambios de texto) | §2.1 (CSS y comentarios, ningún texto visible) | T1 |
| RNF-4 (se integra en el diseño actual) | §3 (misma hoja y paleta; ningún elemento nuevo) | T1 |
| RNF-5 (sin desbordes a 1280/375) | §2.2 (ancho intacto) + verificación 6, 10 | T1 |
| RNF-6 (comentarios coherentes con la pantalla) | §2.2 y decisión 3 (actualizar los tres comentarios) | T1 |
