# Tareas — Spec 001: mapa de calor

Orden de dependencia. Cada tarea es de 20–30 min como máximo. Estado: T1–T14 cerradas
(implementación y verificación hechas el 06/10/2026; cierre formal de checkboxes el
07/10/2026 con `node --test` 12/12 y comprobación en navegador).

- [x] **T1 — Cerrar la spec con las decisiones del usuario**
  RF: todos (revisión previa).
  Hecho cuando: `spec.md` no tiene ningún `[NECESITA ACLARACIÓN]` y RF-7 no contradice
  a RF-3.

- [x] **T2 — Nivel de color por minutos (`getHeatLevel`) en `stats.js`**
  RF: RF-1.
  Hecho cuando: `node --test` pasa los tests de umbrales (0→0, 1→1, 30→1, 31→2, 60→2,
  61→3, 120→3, 121→4) y los números inválidos dan nivel 0.

- [x] **T3 — Suma por día con validación (`isValidDayKey`, `getDayTotals`)**
  RF: RF-1 (minutos válidos), RF-2; caso límite de fecha corrupta.
  Hecho cuando: los tests cubren dos sesiones del mismo día (20+25=45), minutos 0/
  negativos/decimales/no numéricos ignorados y fechas `2026-02-30`/`no-fecha` ignoradas.

- [x] **T4 — Ventana de 28 días con "hoy" como parámetro (`getHeatCells`)**
  RF: RF-3, RF-7, RF-8; RNF-2, RNF-5.
  Hecho cuando: los tests fijan un "hoy" de miércoles y comprueban ventana lunes→
  domingo de 28 celdas, futuras con nivel 0 aunque tengan sesión, más los tests de
  cruce de mes, cruce de año y horario de verano, todos en verde.

- [x] **T5 — Export condicional en `stats.js`**
  RF: ninguno directo; RNF-1, RNF-3.
  Hecho cuando: `node --test` sigue en verde (usa `module.exports`) y `index.html`
  abre con doble clic sin errores de consola por `module`.

- [x] **T6 — Leyenda en `index.html`**
  RF: RF-6; RNF-6.
  Hecho cuando: la página muestra 4 muestras de color con el texto `1-30 min`,
  `31-60 min`, `61-120 min` y `121+ min`, en español.

- [x] **T7 — CSS de niveles, futuros, anillo de hoy y móvil**
  RF: RF-1, RF-3, RF-4; RNF-7.
  Hecho cuando: la captura a 375 px muestra 4 tonos distintos de ámbar, las celdas
  futuras en discontinuo y el anillo de hoy encima sin cambiar el tono del día.

- [x] **T8 — Render de celdas en `app.js` desde `getHeatCells`**
  RF: RF-1, RF-2, RF-3, RF-4, RF-5; RNF-6.
  Hecho cuando: con sesiones de prueba 45 / 15 / 70+70 las celdas quedan en nivel 2/1/4
  y cada celda tiene `aria-label` tipo `6 de octubre: 45 min`, `7 de octubre: día
  futuro` o `14 de septiembre: sin sesión`.

- [x] **T9 — Tooltip por celda**
  RF: RF-9.
  Hecho cuando: al pasar el cursor, tocar o enfocar la celda se ve un texto idéntico al
  de su `aria-label`.

- [x] **T10 — Conservar la animación de primera carga**
  RF: ninguno directo; RNF-8.
  Hecho cuando: la primera carga barre las celdas marcadas con retardo escalonado y,
  al guardar una sesión, solo se anima la celda del día nuevo.

- [x] **T11 — Suite de tests completa en verde**
  RF: todos los anteriores; RNF-3.
  Hecho cuando: `node --test` reporta 12 tests, 12 pass, 0 fail sin paquetes instalados.

- [x] **T12 — Actualizar `AGENTS.md`**
  RF: ninguno directo; RNF-3.
  Hecho cuando: `AGENTS.md` documenta el comando `node --test`, describe `stats.js` y
  `tests/`, y ya no dice "No hay tests ni lint".

- [x] **T13 — Verificación manual (guía de 5 pasos)**
  RF: RF-1…RF-9 en conjunto; RNF-1, RNF-4, RNF-7.
  Hecho cuando: desde localStorage vacío se ven leyenda y mapa sin errores; las sesiones
  de prueba pintan los niveles esperados; tooltip y etiquetas se leen bien; captura a
  375 px correcta; consola sin errores; los datos de antes siguen ahí sin cambios y el
  localStorage se vacía al finalizar.

- [x] **T14 — Actualizar `MEMORY.md`**
  RF: criterios de finalización.
  Hecho cuando: `MEMORY.md` tiene ≤ 50 líneas, recoge el resultado de la verificación
  del 06/10/2026 y las decisiones del mapa de calor.
