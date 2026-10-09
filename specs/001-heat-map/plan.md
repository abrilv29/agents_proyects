# Plan — Spec 001: mapa de calor de días estudiados

Ejecución aprobada el 06/10/2026. Orden: spec → lógica → tests → interfaz → verificación.

## Decisiones cerradas (con el usuario)

1. Ventana: 4 semanas lunes→domingo (28 celdas hasta el domingo de la semana en curso);
   días futuros visibles pero sin color.
2. Umbrales fijos de color: 1–30 / 31–60 / 61–120 / 121+ min.
3. Leyenda: muestra de color + rango de minutos por nivel.
4. Animación: se conserva el barrido de primera carga tal cual.
5. Tests: `node --test` sin dependencias; se actualiza `AGENTS.md` (decisión del usuario).
6. Tooltip: visible al pasar el cursor o tocar la celda, con el mismo texto que la
   etiqueta accesible.

## Paso 0 — Actualizar la spec

- Cerrar las 4 dudas abiertas con las decisiones anteriores.
- RF-7 reescrito (semanas lunes→domingo, futuros sin color) y sin contradicción con RF-3.
- RF-5 con modalidad (aria-label por celda) y nuevo RF-9 (tooltip).
- RF-6 con contenido de leyenda; RNF-8 cerrado; "minutos válidos" definido.
- Arreglos del QA: contexto actual real, persona de HU-3 en Usuarios, minutos
  no enteros, fecha corrupta, día inicio de ventana inclusivo.
- Criterios de finalización: nivel 4, suma del mismo día, leyenda y tooltip.

## Paso 1 — Archivos

- **Crear** `specs/001-heat-map/plan.md` (este documento).
- **Crear** `stats.js` — lógica pura del mapa.
- **Crear** `tests/stats.test.js`.
- **Modificar** `index.html` (leyenda, atributos de celda, script de `stats.js`).
- **Modificar** `styles.css` (4 niveles, leyenda, tooltip, futuro, anillo de hoy, 375 px).
- **Modificar** `app.js` (render consumiendo `stats.js`; conservar animación).
- **Actualizar** `AGENTS.md` (comando `node --test`; quitar "No hay tests") y
  `MEMORY.md` al final.

## Paso 2 — Lógica pura (`stats.js`, código en inglés, "hoy" como parámetro)

- `getHeatLevel(minutos)` → nivel 0–4 con los umbrales fijos.
- `getDayTotals(sesiones)` → fecha → suma de minutos válidos (fecha con formato
  inválido se ignora).
- `getHeatCells(sesiones, hoy)` → 28 celdas `{clave, minutos, nivel, futura, hoy}`
  con ventanas y fechas recorridas en local (`setDate`, sin UTC).
- Export condicional `module.exports` (solo si existe `module`): funciona abriendo
  `index.html` con doble clic y con `node --test`, sin build ni módulos ES.

## Paso 3 — Interfaz

- `index.html`: leyenda con rangos; celdas con `aria-label` en español y dato para el
  tooltip.
- `styles.css`: escala de ámbar de 4 intensidades de la paleta actual (#f2b33d), celda
  vacía, futura discontinua, anillo de hoy sin alterar su nivel; tooltip CSS que
  funcione al tocar en móvil; correcto a 375 px.
- `app.js`: pintar desde las celdas de `stats.js`; mismo barrido inicial y control
  `celdasMarcadas`.

## Paso 4 — Tests (puerta de la constitución)

`node --test` sobre `tests/stats.test.js`:

- Umbrales: 0→0, 1→1, 30→1, 31→2, 60→2, 61→3, 120→3, 121→4.
- Suma de varias sesiones del mismo día que cruza de nivel; minutos inválidos
  ignorados; fecha corrupta ignorada.
- Ventana con "hoy" fijo (p. ej. miércoles) = lunes→domingo, futuras sin pintar;
  cruce de mes y de año.
- Estado vacío.

Sin tests en rojo para avanzar.

## Paso 5 — Verificación manual (guía de 5 pasos)

1. Borrar claves de localStorage → abrir `index.html`: leyenda + mapa vacío, consola
   limpia.
2. Sesiones: hoy 45 min, ayer 15 min, hace 3 días dos sesiones de 70 min.
3. Comprobar niveles 2 / 1 / 4 y la suma del día (70+70 → nivel 4).
4. Tooltip al tocar/pasar y etiqueta accesible con fecha y minutos.
5. Captura a 375 px correcta, consola sin errores.

## Paso 6 — Cierre

- `MEMORY.md` con el resultado de la verificación.
- Repaso de constitución: sin dependencias, spec = código, tests verdes, datos
  intactos, interfaz en español.

## Riesgos / notas

- Renombrar a inglés las funciones existentes de `app.js`: fuera de alcance (solo el
  código nuevo va en inglés).
- Export condicional en `stats.js` es el punto más delicado de compatibilidad
  `file://`; se valida en el Paso 5.
- Cambios de formato de datos: ninguno (RNF-4).
