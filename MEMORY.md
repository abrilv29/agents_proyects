# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1.4: sesiones (fecha, tema, minutos), racha actual/mejor, minutos de semana, días del mes, lista de sesiones, mapa de calor de 28 días y objetivo semanal con barra.
- Spec 001 (mapa de calor) CERRADA el 07/10/2026 (14/14 tareas): `stats.js` + `tests/stats.test.js`.
- Spec 002 (objetivo semanal) IMPLEMENTADA y VERIFICADA el 08/10/2026 (10/10 tareas): `goals.js` + `tests/goals.test.js`; `node --test` en verde con 42 pruebas. Rediseño visual del bloque (T11, solo CSS) el 08/10/2026.
- Héroe: racha en serif grande + mapa de calor; el resto, hoja blanca con secciones por reglas y tres datos en fila tipo libro contable (sin tarjetas).
- Tres claves: `diario-estudio-sesiones`, `diario-estudio-mejor-racha`, `diario-estudio-objetivos`; reglas de datos y fechas en `AGENTS.md`, aquí solo estado y decisiones.
- Comandos SDD en `.opencode/commands/` (skill `sdd`); `docs/constitution.md` = 6 principios innegociables (stack, spec manda, "hoy", tests, datos locales, idioma).

## Decisiones (y por qué)
- Sin backend ni dependencias: doble clic en `index.html`. Rediseño v1.4: hoja blanca con reglas, tinta #22303f/#55697a, ámbar #f2b33d único acento, serif para cifras; nada de tarjetas pastel.
- Mapa de calor (spec 001): ventana y umbrales 30/60/120 en `stats.js`, funciones puras con "hoy" y export condicional; tooltip CSS, `tabindex`, animación solo del día nuevo.
- Mejor racha en clave aparte (el récord sobrevive a borrados); minutos de la semana y días del mes se calculan al vuelo, sin clave propia.
- Objetivo (spec 002): almacén `diario-estudio-objetivos` con una entrada por clave-lunes ("AAAA-MM-DD" del lunes) como histórico; `null` = semana sin objetivo (vacío o 0 al guardar = borrar). Por qué: cada semana tiene la suya, no se pisan y no hay migraciones.
- Aplazamiento D6/D7: de martes a domingo el guardado se asocia SIEMPRE al lunes siguiente (la semana en curso no cambia y se avisa «Se aplicará el lunes que viene»); guardado el lunes se aplica al instante. Por qué: ritual semanal claro y cero sorpresas a mitad de semana.
- Pre-rellenado solo al cargar la página, con la entrada de la clave-lunes más reciente; si esa entrada está vacía o es corrupta, el campo sale vacío (nunca se ofrece basura).
- Campo `type="text"` con `inputmode="numeric"` (no `type="number"`): control total de la validación (entero 1–100000) y de los mensajes de error en español.
- `goals.js` separado de `stats.js`: lógica pura del objetivo con "hoy" como parámetro y `module.exports` condicional, la misma fórmula que ya funcionaba.
- Rediseño «La línea de compromiso» (T11, solo `styles.css`): `.objetivo` es un grid de 2 columnas (campo + botón compacto alineados al pie), el h2 usa `.objetivo h2` para ganar a `.dato-titulo` sin tocar HTML, la cifra crece con `clamp` y solo la barra tiene transición de ancho. Por qué: el bloque es un formulario con su resultado, no un dato más; cero cambios en HTML/JS.
- Icono de guardar (`assets/guardar.png`, PNG blanco de 32 px sobre fondo transparente, `<img alt="">` decorativo; `button` pasó a `display:flex` centrado): «Guardar sesión» lleva icono 16 px + texto sobre botón tinta; «Guardar objetivo» es solo-icono 42×42 px sin texto (nombre accesible y tooltip con `aria-label`/`title`), fondo blanco con filete de tinta y el PNG se oscurece con `filter: brightness(0)` (en hover/active el botón se invierte a tinta y el filtro se quita, dejando el icono blanco); en móvil comparte fila con el campo (`minmax(0,1fr) auto`). Por qué: junto al campo un botón oscuro pesaba; sin librerías de iconos.

## Aprendizajes y errores a evitar
- Nunca cuentes días restando milisegundos (horario de verano: días de 23/25 h): recorre fechas con `setDate(+1)` y formatea con la fecha local.
- Un test de horario de verano debe usar un día coherente con la regla que valida: el de `getSaveTargetKey` se corrigió (martes 27/10 → sábado 24/10) porque D6 ya aplaza los martes.
- Frontmatter YAML frágil: sin `---` de apertura no se parsea; ver con `opencode debug config` y reiniciar.
- Free tier opencode (403): `bash: deny` en un agente rompe a los subagentes; usar `ask`. Ref: anomalyco/opencode#49433.
- Las máscaras CSS (`mask-image`) exigen CORS: sobre `file://` la petición sale con `net::ERR_FAILED` y el elemento desaparece. Para recolorear un PNG transparente, usa `<img>` + `filter` (p. ej. `brightness(0)`), no `mask`.

## Verificación con MCP (`chrome-devtools`)
- 07/10/2026 cierre spec 001: 12/12 tests; navegador ok (niveles, futuros, tooltip, 375 px), consola limpia y localStorage vacío.
- 08/10/2026 cierre spec 002: `node --test` 42/42; guía de 8 pasos superada en rama jueves (ramas "lunes" de los pasos 2, 5 y 7 pendientes para el 12/10/2026); captura 375 px en `specs/002-weekly-goal/verificacion-375px.png`; consola limpia y localStorage limpio al final.
- 08/10/2026 botón solo-icono objetivo: 42/42 tests; DOM confirma icono cargado (32×32 → 18 px), input 41,6 px y botón 42 px con el mismo pie y 12 px de separación, sin desbordes a 1280 ni 375 px; el primer PNG de pantalla salió sin los iconos pintados (foto tomada durante la carga) y el MCP de capturas se quedó sin responder después.
- 08/10/2026 icono en botones: 42/42 tests; PNG carga 200 en `file://`, botones centrados con icono en 1280 px y 375 px sin desbordes, consola limpia.
- 08/10/2026 rediseño T11: 42/42 tests; 6 comprobaciones (375 px sin desbordes y formulario apilado, foco visible en campo/botón/barra, `--force-prefers-reduced-motion` anula la transición, contraste AA 13,44:1 y 5,69:1, consola limpia, localStorage limpio); capturas `diseno-objetivo-vacio.png`, `diseno-objetivo-activo.png`, `diseno-375px.png` en la carpeta de la spec. Ojo: el MCP de capturas a veces sirve una imagen cacheada al `read`; si cuadra el tamaño en disco, re-codificar a JPG y releer.
- 08/10/2026 botón objetivo blanco: 42/42 tests; el icono pasa a span con mask (el PNG blanco no se vería sobre blanco); hover/active invierten el botón.
- 08/10/2026 corrección del botón objetivo: el `mask` sobre `file://` falló (ERR_FAILED) y dejó el botón vacío; se vuelve a `<img>` + `filter: brightness(0)`; 42/42 tests.

## Próximos pasos
- Spec 002 validada por `@reviewer` el 08/10/2026: veredicto APROBADO (RF por RF).
- Comprobar las ramas "lunes" de los pasos 2, 5 y 7 de la guía el 12/10/2026.
- Ideas si el usuario las pide: editar/borrar sesiones, exportar datos.
