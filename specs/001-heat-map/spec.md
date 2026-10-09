# Spec 001 — Mapa de calor de días estudiados

## Contexto y objetivo

El héroe muestra hoy una cuadrícula de 28 celdas (de lunes a domingo, con los días
futuros de la semana en curso dibujados en discontinuo) que solo distingue "hubo
sesión" o "no hubo sesión". Quien estudia a ratos no ve la diferencia entre un día con
10 minutos y otro con 2 horas, así que la cuadrícula no le dice cuánto estudió, solo si
tocó el día.

Objetivo: convertir esa cuadrícula en un mapa de calor tipo GitHub en el que la
intensidad del color de cada día refleje los minutos estudiados ese día, para que de un
vistazo se vean los días intensos, los flojos y los vacíos. Es la misma pieza de la
interfaz, no una sección nueva.

## Usuarios

- Estudiante ocasional que registra sesiones (fecha, tema, minutos) y quiere ver su
  constancia de las últimas semanas.
- La propia persona volviendo a la app tras unos días: debe entender el mapa sin
  instrucciones.
- Visitante sin sesiones todavía: debe ver el mapa vacío y entender la leyenda antes de
  registrar nada.

## Historias de usuario

- **HU-1**: Como estudiante, quiero que cada día del mapa se pinte más o menos intenso
  según los minutos que estudié, para darme cuenta de en qué días rendí menos.
- **HU-2**: Como usuario de pantalla de lector, quiero que cada día tenga una etiqueta
  legible con su fecha y sus minutos, para entender el mapa sin depender solo del color.
- **HU-3**: Como visitante sin sesiones todavía, quiero ver el mapa vacío y una
  leyenda que explique los colores, para saber qué aparecerá cuando empiece a registrar.

## Requisitos funcionales

**RF-1 — Pintado por minutos.**
Dado que el usuario tiene sesiones guardadas, cuando abre la página, entonces el mapa de
calor DEBE mostrar 28 celdas y pintar cada día con uno de 4 niveles de intensidad
según la suma de minutos válidos de ese día.
- CA: 0 minutos válidos → nivel 0 (celda vacía, sin sesión).
- CA: 1–30 min → nivel 1; 31–60 → nivel 2; 61–120 → nivel 3; 121 o más → nivel 4.
- CA: los umbrales cuentan minutos, no sesiones.
- CA: minuto válido = valor numérico entero mayor que 0; el resto no suma.

**RF-2 — Varias sesiones el mismo día.**
Si un mismo día tiene varias sesiones, entonces el sistema DEBE sumar sus minutos
válidos antes de decidir el nivel de color.
- CA: 20 min + 25 min el mismo día = 45 min → nivel 2, y no dos marcas separadas.
- CA: dos sesiones de 70 min el mismo día = 140 min → nivel 4.

**RF-3 — Días futuros.**
Mientras una celda corresponda a un día posterior a hoy en hora local, entonces el
sistema DEBE mostrarla sin color de actividad, marcada como futura y nunca como
estudiada.
- CA: registrar una sesión con fecha futura no tiñe ningún día del mapa.

**RF-4 — Día de hoy.**
Cuando el mapa incluye hoy, entonces hoy DEBE distinguirse visualmente del resto (con
el anillo actual) sin que eso altere su nivel de color.

**RF-5 — Etiqueta accesible por día.**
Dado que el mapa se muestra, cuando el usuario navega por las celdas con lector de
pantalla, entonces cada celda DEBE exponer una etiqueta en español con su fecha y sus
minutos (p. ej. "5 de octubre: 45 min" / "5 de octubre: sin sesión").
- CA: la etiqueta refleja el total del día, no una sesión suelta.
- CA: las celdas futuras se etiquetan como futuras, sin minutos.

**RF-6 — Leyenda de intensidades.**
Dado que existen 4 niveles de color, cuando se muestra el mapa, entonces la interfaz
DEBE incluir una leyenda con una muestra de color por nivel y su rango de minutos
("1-30 min", "31-60 min", "61-120 min", "121+ min").

**RF-7 — Ventana temporal.**
Cuando el usuario abre la página, entonces el mapa DEBE cubrir exactamente 28 días
organizados en 4 semanas de lunes a domingo en hora local, terminando en el domingo de
la semana en curso.
- CA: el día de inicio de la ventana está incluido; no se muestran días anteriores.
- CA: los días futuros de la semana en curso se muestran sin color (RF-3).

**RF-8 — Vacío inicial.**
Si el usuario no tiene ninguna sesión, entonces el mapa DEBE mostrarse completo sin
niveles de color, sin errores, junto a la leyenda.

**RF-9 — Tooltip por celda.**
Cuando el usuario pasa el cursor por una celda o la toca en móvil, entonces la celda
DEBE mostrar un texto breve con la fecha y los minutos del día, con el mismo contenido
que la etiqueta accesible (RF-5).

## Requisitos no funcionales

- **RNF-1**: Sin dependencias ni build: la característica debe funcionar abriendo la
  página con doble clic.
- **RNF-2**: Los cálculos de minutos, ventana y niveles son funciones puras que reciben
  "hoy" como parámetro, sin tocar la interfaz ni el almacenamiento.
- **RNF-3**: La lógica del mapa se prueba con `node --test` sin instalar paquetes; no se
  avanza con pruebas en rojo. El comando queda documentado en `AGENTS.md`.
- **RNF-4**: No cambia el formato de las sesiones ya guardadas; nadie pierde datos.
- **RNF-5**: Fechas y minutos siempre en hora local del usuario (sin conversiones UTC).
- **RNF-6**: Textos de la interfaz en español y código en inglés.
- **RNF-7**: El mapa debe verse bien en móvil (a 375 px de ancho) y no depender solo
  del color para comunicar la información (etiquetas accesibles + tooltip + leyenda).
- **RNF-8**: Se conserva el comportamiento actual de animación de primera carga, sin que
  la animación oculte ni altere el nivel de color de un día.

## Casos límite

- Día con minutos inválidos (0, negativos, no numéricos o no enteros): se ignoran al
  sumar; si ningún minuto suma, el día queda en nivel 0.
- Día con muchas minutos (121 o más): satura en nivel 4; no hay nivel superior.
- Sesión más antigua que la ventana de 28 días: no se ve en el mapa, pero sus minutos
  siguen contando para el resto de estadísticas.
- Sesión con fecha de formato corrupto o interpretable: se ignora sin error y sin
  romper el pintado.
- Día de inicio de la ventana: incluido en el mapa.
- Página abierta al cruzar la medianoche o cambiar de mes: el mapa se recalcula al
  recargar; limitación aceptada (igual que el resto de datos).
- Sin sesiones o con todas fuera de la ventana: mapa vacío sin errores.

## Fuera de alcance

- Editar o borrar sesiones.
- Rango configurable de semanas (por ahora fijo: 4 semanas / 28 celdas).
- Ajuste automático de umbrales según el historial del usuario.
- Exportar, sincronizar o enviar datos a servicios externos.
- Cambiar el formato de los datos guardados.
- Renombrar a inglés las funciones existentes (solo el código nuevo va en inglés).

## Criterios de finalización

- Todos los RF y RNF verificados; pruebas con `node --test` en verde, sin paquetes
  nuevos instalados.
- Guía manual de 5 pasos superada: registrar sesión de hoy, ayer y hace 3 días con
  minutos que cubran los niveles 1, 2 y 4 (incluida la suma de dos sesiones del mismo
  día); comprobar leyenda, tooltip y etiqueta accesible; consola sin errores.
- Comprobación en móvil a 375 px.
- `MEMORY.md` actualizado con el resultado de la verificación.

## Dudas abiertas

- Ninguna: resueltas el 06/10/2026 con el usuario (ventana lunes→domingo, umbrales
  fijos 30/60/120, leyenda con rangos, animación conservada, `node --test` con
  `AGENTS.md` actualizado y tooltip visible).
