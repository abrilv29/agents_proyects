# Spec 003 — Botón de guardar del objetivo integrado en el campo

Estado: implementada

## Contexto y objetivo

El bloque «Objetivo semanal» (spec 002) tiene un campo de minutos y, pegado a su derecha,
un botón solo-icono que guarda el objetivo. Hoy el botón se separa del campo con un filete
vertical (una línea de 1 px en el límite entre ambos), al estilo del selector de calendario
nativo. El usuario ha pedido quitar ese filete para que el botón parezca que "sale del mismo
input": que campo y botón se lean como una sola pieza continua, sin divisoria visible.

Objetivo: eliminar la separación vertical entre campo y botón manteniendo intactos el resto
del comportamiento y aspecto del bloque (alineación por el pie, ancho total del formulario,
subrayado compartido, estado de foco, icono centrado y ausencia de hover).

## Usuarios

- Estudiante que usa el bloque «Objetivo semanal» y ve a diario el campo y su botón: notaría
  al instante cualquier descuadre o línea parásita.
- Usuario móvil (375 px) y de escritorio (1280 px): el formulario debe verse limpio y sin
  desbordes en ambos extremos.
- Persona que navega con teclado o lector de pantalla: el botón debe seguir siendo
  enfocable y activable igual que hoy.

## Historias de usuario

- **HU-1**: Como usuario del bloque «Objetivo semanal», quiero que el botón de guardar
  parezca parte del propio campo (sin línea que los divida), para que el formulario se lea
  como una pieza única y más limpia.

## Definiciones

Ninguna: el término "límite entre campo y botón" es unívoco (el borde vertical que hoy
separa visualmente el input del botón).

## Requisitos funcionales

**RF-1 — Sin divisoria vertical entre campo y botón.**
Cuando se muestra el formulario del objetivo semanal, entonces el sistema NO DEBE pintar
ninguna línea vertical divisoria visible en el límite entre el campo de minutos y el botón
de guardar: ambos deben percibirse como una sola superficie continua.
- CA: "línea divisoria" es cualquier trazo vertical propio del límite campo-botón (como el
  filete de 1 px actual). El indicador de foco (el anillo visible que la regla global de
  foco dibuja alrededor del botón enfocado con teclado) NO cuenta como divisoria: es un
  estado temporal de accesibilidad, no parte del diseño del límite.
- CA: la ausencia de divisoria se exige en TODOS los estados que este cambio debe
  conservar: en reposo, con el campo enfocado y con el botón enfocado con teclado. En
  ninguno de esos estados debe aparecer un trazo vertical propio del límite.
- CA: el ancho total del formulario (campo + botón, sin separación) NO debe cambiar como
  consecuencia de la ausencia de divisoria: el formulario sigue midiendo lo mismo que
  antes dentro de su columna.

**RF-2 — Alineación y centrado conservados.**
Mientras el formulario del objetivo se muestra, el sistema DEBE mantener el pie del botón
alineado con el pie del campo, y el icono del botón debe seguir centrado vertical y
horizontalmente en el área del botón.
- CA: el descuadre entre el pie del campo y el pie del botón sigue siendo inferior a 1 px
  (umbral ya verificado en la iteración previa del botón estilo calendario).
- CA: el icono no se desplaza de forma perceptible al quitar la divisoria: su centrado
  dentro del botón se mantiene (desviación máxima de 1 px en cualquier eje).

**RF-3 — Subrayado compartido intacto.**
Cuando el formulario del objetivo se muestra, entonces el sistema DEBE pintar un subrayado
inferior continuo bajo el campo Y bajo el botón (una única línea de extremo a extremo del
formulario); y cuando el campo o el botón reciben el foco, entonces el sistema DEBE
oscurecer ese subrayado compartido.
- CA: el subrayado no se interrumpe ni presenta un hueco en el punto donde antes estaba la
  divisoria vertical.
- CA: el color del subrayado en reposo y en foco no cambia respecto al actual.

**RF-4 — Comportamiento del botón sin regresiones.**
El sistema DEBE conservar el comportamiento actual del botón de guardar del objetivo:
mismo ancho visible (26 px de ancho y 41 px de alto), mismo tamaño de icono (15 px), fondo
transparente, activable con clic y con teclado, y sin ningún efecto hover ni active al
pasar el ratón o al pulsarlo.
- CA: al hacer hover sobre el botón, ni su fondo ni su icono cambian de apariencia.
- CA: al enfocar el botón con el tabulador, sigue siendo enfocable y activable (Enter o
  espacio guardan el objetivo, con los mismos mensajes que ya describe la spec 002).

**RF-5 — Aislamiento del cambio.**
El sistema DEBE aplicar el cambio únicamente al botón de guardar del objetivo semanal:
el resto de botones de la página (en particular «Guardar sesión») conservan su aspecto
actual, incluido su efecto hover.
- CA: «Guardar sesión» sigue mostrando su fondo oscuro al hacer hover, igual que hoy.
- CA: ningún otro elemento de la página cambia de apariencia como consecuencia del cambio.

## Requisitos no funcionales

- **RNF-1**: Sin dependencias ni build: el resultado se ve abriendo la página con doble
  clic (file://).
- **RNF-2**: El cambio es solo de presentación: no toca la estructura de la página, la
  lógica de guardado del objetivo, ni los datos almacenados.
- **RNF-3**: Textos de la interfaz en español; el cambio no altera ningún texto visible.
- **RNF-4**: Se integra en el diseño actual (misma hoja, misma paleta, ámbar como único
  acento), sin introducir elementos ni tarjetas nuevas.
- **RNF-5**: Sin desbordes horizontales a 1280 px ni a 375 px: el formulario (campo +
  botón) sigue cabiendo en su columna en ambos anchos.
- **RNF-6**: El código debe seguir siendo didáctico y coherente con el aspecto final: lo
  que describen los comentarios del estilo no debe contradecir lo que se ve en pantalla.

## Casos límite

- Campo vacío, con valor o en error: en ningún estado debe aparecer una línea vertical
  divisoria entre campo y botón.
- Campo enfocado y botón enfocado: el subrayado compartido se oscurece sin interrupción
  en el punto de encuentro entre ambos.
- Botón enfocado con teclado: aparece el anillo de foco visible alrededor del botón; su
  flanco izquierdo NO cuenta como divisoria (RF-1, CA 1) y el subrayado compartido sigue
  oscurecido.
- Hover sobre el botón: sin cambio de fondo ni de icono (igual que hoy).
- Móvil a 375 px (formulario apilado con la columna izquierda): el formulario campo+botón
  sigue midiendo lo mismo, sin desbordes y con el pie alineado.
- Escritorio a 1280 px: el formulario no cambia de ancho total respecto al actual.
- «Guardar sesión» y el resto de botones de la página: ningún cambio visible.

## Fuera de alcance

- Cambios en la estructura HTML de la página.
- Cambios en la lógica de guardado del objetivo o en los datos almacenados.
- Tests unitarios: no hay lógica que tocar; la verificación es visual/manual.
- Rediseño de otros elementos de la página (barra de progreso, mensajes, otros botones,
  formulario de sesión, mapa de calor).
- Cambios en el comportamiento hover/active o en el tamaño del icono.

## Criterios de finalización

- RF-1 a RF-5 y RNF-1 a RNF-6 verificados.
- Verificación manual en navegador: a 1280 px y a 375 px, sin desbordes horizontales;
  el límite campo-botón no muestra ninguna línea vertical propia en reposo, con el campo
  enfocado ni con el botón enfocado con teclado (el anillo de foco no cuenta, RF-1 CA 1);
  el subrayado inferior es continuo bajo campo y botón; el foco en el campo o en el botón
  oscurece el subrayado compartido; el icono sigue centrado en el botón; el pie del botón
  sigue alineado con el pie del campo; el ancho total del formulario no cambia.
- Comprobación de que «Guardar sesión» sigue con su hover normal y que el resto de la
  página no ha cambiado de apariencia.
- `node --test` sigue en verde (42/42): el cambio es de presentación y no debe alterar
  ninguna prueba existente.
- Consola del navegador sin errores y, tras la verificación, el almacenamiento local no
  tiene claves nuevas más allá de las tres que la app ya usa (`diario-estudio-sesiones`,
  `diario-estudio-mejor-racha` y `diario-estudio-objetivos`, esta última creada por el
  propio guardado del objetivo al probar el botón).
- `MEMORY.md` actualizado con el resultado.

## Dudas abiertas

Ninguna: el alcance está cerrado (quitar la divisoria vertical y conservar todo lo demás)
y no quedan decisiones pendientes con el usuario.
