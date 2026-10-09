# AGENTS.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (interfaz y datos),
`stats.js` (lógica pura del mapa de calor), `goals.js` (lógica pura del objetivo
semanal) y `tests/` (pruebas con `node --test`).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos
- localStorage, clave `diario-estudio-sesiones`: array de
`{ id, fecha: "AAAA-MM-DD", tema, minutos, creadoEn }` (`app.js`).
- localStorage, clave `diario-estudio-mejor-racha`: número con la mejor racha. Si no
existe o no es válido, se recalcula desde las sesiones y se guarda: se muestra siempre el
máximo entre lo guardado y lo calculado.
- localStorage, clave `diario-estudio-objetivos`: objeto JSON con una entrada por
clave-lunes (`"AAAA-MM-DD"` del lunes que abre la semana), como histórico de semanas: un
entero 1–100000 es el objetivo de esa semana y `null` = esa semana sin objetivo (vacío o
0 al guardar = borrar). Vigencia: guardar de martes a domingo se asocia al lunes SIGUIENTE
(no afecta a la semana en curso); guardar el lunes aplica a esa misma semana. Sin interfaz
para semanas pasadas (`goals.js` y `app.js`).
- `diario-estudio-sesiones` y `diario-estudio-mejor-racha` NO cambian: la clave de
objetivos es nueva y aditiva; nadie pierde datos.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.

## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- Mejor racha = mismas reglas que la racha, recorriendo desde la sesión más antigua hasta
hoy: incluye la racha en curso e ignora las fechas futuras.
- Semana = lunes a domingo en fecha local. El total de minutos de la semana se calcula al
vuelo desde las sesiones (sin clave de localStorage propia) e ignora las fechas futuras.
- Mes = mes local en curso. Días estudiados del mes = fechas distintas de sesiones en ese
mes, sin fechas futuras; se calcula al vuelo desde las sesiones, sin clave propia.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación
- Tests con `node --test` (sin dependencias); no se avanza con tests en rojo.
- Prueba manual abriendo `index.html` en el navegador.
- Para empezar de cero: DevTools → Application → Local Storage → borrar las claves
`diario-estudio-sesiones` y `diario-estudio-mejor-racha`.
