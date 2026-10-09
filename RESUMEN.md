# Resumen del proyecto — Diario de Estudio

Documento con todo lo construido hasta el momento: la app, las skills, los comandos,
el MCP, los tests y el flujo SDD. Fecha del resumen: 06/10/2026.

---

## 1. Qué es el proyecto

Web estática para registrar sesiones de estudio (fecha, tema, minutos) y motivarse
viendo la racha de días seguidos. Proyecto didáctico: el código debe poder entenderlo
alguien que empieza a programar.

**Stack (innegociable, ver `docs/constitution.md`):**

- HTML, CSS y JavaScript puros. Sin frameworks, librerías, npm, bundler ni build.
- Funciona abriendo `index.html` con doble clic (`file://`): sin módulos ES, sin
  `fetch` a archivos locales, sin servidor.
- Tests con `node --test` (sin dependencias).
- Textos de la interfaz en español; código en inglés.

**Archivos principales:**

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura: formulario, estadísticas, mapa de calor, lista de sesiones |
| `styles.css` | Estilos (paleta tinta + ámbar `#f2b33d`, diseño tipo "hoja blanca") |
| `app.js` | Interfaz y datos (407 líneas): rachas, semana, mes, render, localStorage |
| `stats.js` | Lógica pura del mapa de calor (110 líneas): niveles, totales, ventana 28 días |
| `tests/stats.test.js` | 12 tests de `stats.js` con `node --test` |
| `AGENTS.md` | Reglas del proyecto para los agentes |
| `MEMORY.md` | Memoria entre sesiones (estado, decisiones, errores a evitar) |

---

## 2. Qué tiene la app (v1.4)

- **Registro de sesiones**: fecha editable (permite registrar días pasados), tema y
  minutos; validación (minutos > 0) y mensaje de confirmación/error con clase
  `mensaje-ok` / `mensaje-error`.
- **Racha actual**: días consecutivos con sesión que terminan hoy (si hoy no hay
  sesión pero ayer sí, sigue viva).
- **Mejor racha (récord)**: clave propia en localStorage para que el récord sobreviva
  a borrados; se muestra el máximo entre la guardada y la calculada.
- **Minutos de la semana**: lunes→domingo en hora local, recalculados al vuelo desde
  las sesiones (sin clave propia); formato `X min` o `Y h Z min` desde 60 min.
- **Días del mes**: fechas distintas del mes local en curso, sin fechas futuras.
- **Lista de sesiones**: ordenada por fecha, con "Hoy," / "Ayer," y resaltado de la
  sesión recién guardada.
- **Mapa de calor (spec 001)**: 28 celdas (4 semanas lunes→domingo) con 4 niveles de
  ámbar según minutos (umbrales 30/60/120), días futuros en discontinuo, anillo en
  hoy, leyenda con rangos, tooltip por celda (`data-etiqueta` + CSS), `aria-label` en
  español por celda, `tabindex` para teclado y animación de primera carga (al guardar
  solo se anima el día nuevo).

**Datos (localStorage):**

- `diario-estudio-sesiones`: array de `{ id, fecha: "AAAA-MM-DD", tema, minutos, creadoEn }`.
- `diario-estudio-mejor-racha`: número con la mejor racha.
- Regla: si cambia el formato, mantener compatibilidad con lo ya guardado.

**Reglas de fechas (las más delicadas):** siempre hora local; nunca `toISOString()`
ni `new Date("AAAA-MM-DD")`; recorrer días con `setDate(±1)`; semana lunes→domingo.
Esta guía está encapsulada en la skill `local-dates`.

---

## 3. Skills creadas e instaladas

Ubicación: `.agents/skills/<nombre>/SKILL.md`.

### Creadas para este proyecto

1. **`local-dates`** — Fechas locales. Se usa siempre que se toque código con fechas,
   días, semanas o rachas. Reglas: construir "hoy" con `getFullYear()/getMonth()+1/
   getDate()`, parsear con `new Date(año, mes-1, día)`, sumar días con `setDate()`,
   prohibido `toISOString()` y los 86400000 ms. Termina con checklist de revisión.
2. **`sdd`** — Spec-Driven Development. Flujo: Constitución → Spec → Clarificación →
   Plan → Tareas → Implementación → Validación → Cambio. Plantilla de spec con EARS
   en español, estructura de plan y formato de tareas (`Hecho cuando:`), límite de
   20-30 min por tarea y máximo 10 tareas por spec.

### Instaladas desde GitHub (fijadas en `skills-lock.json` con hash)

3. **`frontend-design`** (de `anthropics/skills`) — Dirección visual intencional:
   estética, tipografía, evitar plantillas genéricas.
4. **`web-design-guidelines`** (de `vercel-labs/agent-skills`) — Auditoría de UI:
   accesibilidad, UX, buenas prácticas de interfaz.

---

## 4. Comandos (`.opencode/commands/`)

### Comando general

- **`/feature`** (agente `plan`): planifica una nueva funcionalidad antes de tocar
  código; respeta `AGENTS.md`, usa `@MEMORY.md` como contexto y no modifica nada
  hasta que se apruebe el plan.

### Comandos SDD (agente `plan`, salvo implement/validate que van a `build`)

| Comando | Qué hace |
|---|---|
| `/sdd-constitution` | Propone los 6 principios → `docs/constitution.md` con aprobación |
| `/sdd-spec $1 idea` | Entrevista de ≤5 preguntas → borrador en `specs/$1/spec.md` |
| `/sdd-clarify $1` | QA de la spec: solo detecta problemas, no los resuelve |
| `/sdd-plan $1` | `specs/$1/plan.md`; se para si la spec no está aprobada |
| `/sdd-tasks $1` | `specs/$1/tasks.md`: ≤10 tareas de 20-30 min con RF y "Hecho cuando:" |
| `/sdd-implement $1 $2` | `build`: implementa UNA tarea, tests primero (`node --test`), la marca hecha y PÁRA |
| `/sdd-validate $1` | `build`: valida RF por RF con `node --test` + Chrome DevTools, sin arreglar |
| `/sdd-change $1 texto` | `plan`: añade un RF nuevo a la spec, con diff y aprobación |
| `/sdd-status $1` | Solo lectura: fase actual, tareas x de y y siguiente comando |

Detalle de `opencode.json` y `frontmatter`: si el YAML frágil no parsea (sin `---` de
apertura o descripción partida), el comando sale con `description`/`agent` vacíos.
Se revisa con `opencode debug config` y reiniciando opencode.

---

## 5. MCP: Chrome DevTools

Configurado en `opencode.json`:

```json
"mcp": {
  "chrome-devtools": {
    "type": "local",
    "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics", "--isolated"],
    "timeout": 60000
  }
}
```

Permite verificar la app en navegador real: abrir `index.html`, inspeccionar consola,
comprobar niveles de color, tooltip, leyenda, responsive a 375 px y estado del
localStorage. Es la base del paso de validación `/sdd-validate`.

---

## 6. Tests

- Comando: **`node --test`** (documentado en `AGENTS.md`; sin paquetes instalados).
- Archivo: `tests/stats.test.js` — **12 tests, 12 pass, 0 fail** (verificado el
  06/10/2026).

Cobertura:

1. Umbrales fijos de `getHeatLevel` (0/1/30/31/60/61/120/121/10000).
2. `getHeatLevel` ignora números inválidos (negativos, NaN, undefined, texto).
3. `isValidDayKey` rechaza fechas mal formadas o imposibles (`2026-02-30`).
4. `getDayTotals` suma varias sesiones del mismo día (20+25=45).
5. `getDayTotals` ignora minutos y fechas inválidos.
6. `getHeatCells`: ventana lunes→domingo de 28 celdas.
7. `getHeatCells` marca hoy y los días futuros.
8. `getHeatCells` ignora sesiones anteriores a la ventana.
9. `getHeatCells` cruza mes y año.
10. `getHeatCells` mantiene la ventana con cambio de horario de verano (DST).
11. `getHeatCells` sin sesiones devuelve mapa vacío sin errores.
12. `toDayKey` formatea siempre en hora local.

---

## 7. Flujo SDD aplicado

**Constitución** (`docs/constitution.md`): 6 principios innegociables —

1. Simplicidad primero (sin dependencias ni build).
2. La spec manda (nada se implementa si no está en la spec).
3. Lógica separada de interfaz (funciones puras con "hoy" como parámetro).
4. Tests como puerta (`node --test`; prohibido avanzar en rojo).
5. Los datos del usuario son sagrados (compatibilidad hacia atrás, fechas locales).
6. Idioma: código en inglés, interfaz y docs en español.

**Spec activa: `specs/001-heat-map/`** (mapa de calor de días estudiados)

- `spec.md`: 9 RF (pintado por minutos, suma por día, futuros, anillo de hoy,
  etiqueta accesible, leyenda, ventana de 28 días, vacío inicial, tooltip), 8 RNF,
  casos límite, fuera de alcance y criterios de finalización. Sin dudas abiertas:
  resueltas el 06/10/2026 con el usuario.
- `plan.md`: ejecución aprobada el 06/10/2026; 6 decisiones cerradas (ventana
  lunes→domingo, umbrales 30/60/120, leyenda con rangos, animación conservada,
  `node --test` + `AGENTS.md`, tooltip = aria-label) y 6 pasos (spec → lógica →
  tests → interfaz → verificación → cierre).
- `tasks.md`: 14 tareas (T1–T14). **Estado del archivo: solo T1 marcada**, aunque la
  implementación y la verificación ya están hechas (ver §8).

---

## 8. Estado real de la implementación

- Lógica (`stats.js`) e interfaz (leyenda, niveles, tooltip, futuros, anillo,
  animación) **implementadas**; `stats.js` se carga antes que `app.js` en
  `index.html` y usa export condicional (`module.exports` solo si existe `module`)
  para convivir con `file://` y `node --test`.
- **Verificación del 06/10/2026**: 12/12 tests en verde; navegador ok (niveles,
  futuros, anillo, leyenda, tooltip, animación, 375 px) con localStorage vacío.
- **Pendiente de formalizar**: marcar T2–T14 en `specs/001-heat-map/tasks.md` (la
  comprobación ya pasó, falta el checkbox) y reflejarlo en `MEMORY.md`.

---

## 9. Decisiones importantes (y por qué)

- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Rediseño v1.4: nada de tarjetas pastel (kit SaaS); hoja blanca con secciones por
  reglas; paleta blancos/tinta + ámbar como único acento; serif para cifras, sans del
  sistema; sin fuentes externas.
- Mejor racha en clave aparte: el récord sobrevive a borrados y no hay migraciones.
- Minutos de semana y días del mes sin clave propia: se recalculan desde las sesiones
  (cero migraciones).
- Mapa de calor: ventanas y umbrales en `stats.js` con funciones puras; `hoy` siempre
  como parámetro.
- Fecha editable en el formulario: permite registrar días pasados y ver crecer la racha.

## 10. Errores a evitar (aprendidos)

- Nunca contar días restando milisegundos (horario de verano: días de 23/25 h):
  recorrer con `setDate(+1)` y formatear con la fecha local.
- Frontmatter YAML frágil: sin `---` de apertura o con descripción partida no se
  parsea; revisar con `opencode debug config` y reiniciar.
- El error de validación salía en verde: usar siempre `mensaje-ok` / `mensaje-error`.

---

## 11. Próximos pasos

- Formalizar T2–T14 en `specs/001-heat-map/tasks.md` y actualizar `MEMORY.md`.
- Ideas si el usuario las pide: editar/borrar sesiones, exportar datos.
- Para empezar de cero: DevTools → Application → Local Storage → borrar
  `diario-estudio-sesiones` y `diario-estudio-mejor-racha`.
