# Diario de Estudio

## Qué es

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Uso

No hace falta servidor ni instalar nada: abre `index.html` con doble clic (`file://`).
Los datos se guardan en el `localStorage` del navegador, en tres claves:

- `diario-estudio-sesiones`: las sesiones (fecha, tema, minutos).
- `diario-estudio-mejor-racha`: la mejor racha alcanzada.
- `diario-estudio-objetivos`: el histórico de objetivos semanales.

Para empezar de cero: DevTools → Application → Local Storage → borra esas tres claves.

![Interfaz del Diario de Estudio](assets/proyecto.png)

## Stack y estructura

HTML, CSS y JavaScript puros: sin frameworks, sin dependencias, sin npm ni build.

- `index.html`: estructura de la página.
- `styles.css`: estilos.
- `app.js`: interfaz y datos.
- `goals.js`: lógica pura del objetivo semanal.
- `stats.js`: lógica pura del mapa de calor.
- `tests/`: pruebas con `node --test` (42 en verde).
- `assets/`: imágenes.
- `docs/constitution.md`: principios innegociables del proyecto.
- `specs/`: especificaciones.

Tests: `node --test`.

## Cómo se desarrolla: Spec-Driven Development (SDD)

La spec manda sobre el código:

Constitución → Spec → Clarificación (QA) → Plan → Tareas → Implementación (una tarea a
la vez, tests primero) → Validación RF por RF → Cierre.

El usuario aprueba cada fase; nada avanza sin su visto bueno. Cada spec vive en
`specs/NNN-nombre/` con `spec.md`, `plan.md` y `tasks.md`.

## Multiagentes con opencode

El trabajo se reparte entre varios agentes con roles fijos:

- **Coordinador**: dirige el flujo, reparte el trabajo, verifica con el navegador y
  habla con el usuario; no escribe código.
- **@planner**: redacta specs, planes y tareas; no toca código.
- **@reviewer**: QA que solo detecta — revisa la spec antes de aprobarla y valida la
  implementación RF por RF; no modifica nada.
- **@implementer**: implementa una tarea cada vez (tests primero), con `node --test` en
  verde antes de pasar a la siguiente.

Comandos SDD en `.opencode/commands/` y skill `sdd`; memoria entre sesiones en
`MEMORY.md`; reglas del proyecto en `AGENTS.md`.

## Specs cerradas

- 001: mapa de calor.
- 002: objetivo semanal.
- 003: botón del objetivo sin filete.
- 004: textos de la barra a 14 px.
