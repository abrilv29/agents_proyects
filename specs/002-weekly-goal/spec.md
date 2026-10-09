# Spec 002 — Objetivo semanal de estudio

Estado: implementada

## Contexto y objetivo

La app ya calcula los minutos de la semana (lunes a domingo, en hora local, al vuelo desde
las sesiones) y los muestra como uno de los tres datos en fila de las estadísticas. Pero no
se puede poner una meta: quien estudia a ratos no tiene con qué comparar su semana y se
pierde la motivación de "llevo X de los Y minutos que me propuse".

Objetivo: permitir fijar cuántos minutos se quieren estudiar cada semana y ver, en la
semana en curso, cuánto se lleva de ese objetivo mediante una barra de progreso, de forma
opcional (quien no quiera meta no ve barra ni porcentaje) y con un ritual semanal claro
cada lunes.

## Usuarios

- Estudiante que ya registra sesiones y quiere una meta semanal concreta para motivarse.
- La misma persona cada lunes: debe poder fijar el objetivo con el mínimo esfuerzo y
  entender de un vistazo si va bien o mal.
- Persona que todavía no quiere poner meta: solo debe ver una invitación, sin barra, sin
  porcentaje y sin sensación de fracaso.
- Usuario móvil y de lector de pantalla: debe entender el progreso por texto, sin depender
  del color ni del ancho de la barra.

## Historias de usuario

- **HU-1**: Como estudiante, quiero fijar cuántos minutos quiero estudiar esta semana y
  ver una barra con lo que llevo, para motivarme a cumplirlo.
- **HU-2**: Como usuario, quiero que cada lunes el campo aparezca con mi último objetivo
  para que fijarlo me cueste un solo clic.
- **HU-3**: Como persona que aún no quiere meta, quiero no ver barra ni porcentaje hasta
  que fije un objetivo, para que la app no me presione.
- **HU-4**: Como usuario de lector de pantalla, quiero leer el progreso en texto
  ("120 de 300 min (40%)"), para saberlo sin mirar la barra.

## Definiciones

- **Semana**: de lunes a domingo en hora local. La *semana en curso* va del lunes 00:00
  local al domingo 23:59 local.
- **Semana destino**: la semana a la que se asocia un guardado, según RF-4: es la semana
  en curso si se guarda durante el lunes, y la que empieza el lunes siguiente si se guarda
  de martes a domingo.
- **Minutos de la semana**: suma de los minutos válidos de las sesiones con fecha dentro
  de la semana en curso, sin fechas futuras. *Minutos válidos* = valor numérico entero
  mayor que 0 (misma regla que la spec 001, RF-1, CA); el resto no suma. Ya se calcula
  hoy, al vuelo, sin guardar nada propio.
- **Objetivo de una semana**: número de minutos que la persona quiere estudiar en esa
  semana. Se asocia siempre al lunes que la abre.
- **Objetivo vigente**: el objetivo de la semana en curso; es el único con el que se mide
  el progreso y el único que puede mostrarse como objetivo en el bloque.
- **Último objetivo usado (pre-rellenado)**: el valor de la entrada de la clave-lunes más
  reciente que haya entre los guardados. Si esa entrada quedó vacía (la persona guardó el
  campo vacío) o su valor es corrupto (no es un entero entre 1 y 100000), el campo aparece
  vacío: los valores corruptos se ignoran y no se ofrecen. El pre-rellenado es una
  sugerencia, no un objetivo guardado.
- **Progreso**: minutos de la semana en curso frente al objetivo vigente.
- **Formato del texto de progreso**: «X de Y min (Z%)», sin conversión a horas (nunca
  «1 h 30 min»); decisión del usuario en la decisión 4.

## Requisitos funcionales

**RF-1 — Bloque "Objetivo semanal".**
Cuando la persona abre la página y se muestra el área de estadísticas de la semana,
entonces el sistema DEBE mostrar en esa zona un bloque titulado «Objetivo semanal» con un
campo numérico etiquetado y un botón «Guardar objetivo».
- CA: el bloque aparece en la zona de estadísticas de la semana con independencia de
  cuántas columnas tenga la fila: a 375 px, donde las tres estadísticas se apilan, el
  bloque sigue en esa misma zona (junto al dato «Esta semana»), no en una fila que no
  existe.
- CA: las tres estadísticas existentes conservan su texto, su orden y su cálculo: el dato
  de minutos de la semana no pasa a leer "X de Y min".
- CA: el campo tiene etiqueta visible y accesible en español: «Objetivo semanal
  (minutos)».
- CA: el botón del bloque se llama «Guardar objetivo» y se distingue del botón «Guardar
  sesión» de la app por su texto y su ubicación.
- CA: el guardado solo ocurre al pulsar «Guardar objetivo»; escribir en el campo no guarda
  nada.
- CA: el bloque usa los textos en español.

**RF-2 — Guardado del objetivo.**
Cuando la persona escribe un número entero entre 1 y 100000 y pulsa «Guardar objetivo»,
entonces el sistema DEBE guardarlo como objetivo de la semana destino (RF-4) y DEBE
mostrar el aviso de RF-8.
- CA: el bloque sigue mostrando el estado de la semana en curso (RF-5 si tiene objetivo
  vigente, RF-6 si no tiene); el valor recién guardado NO se muestra como objetivo vigente
  hasta que su semana destino pase a ser la en curso: en lunes se ve al instante, de
  martes a domingo no hasta el lunes siguiente (RF-4).
- Si el campo está vacío o contiene 0, entonces al guardar la semana destino DEBE quedar
  sin objetivo (se borra el objetivo que tuviera y también uno que estuviera programado
  para esa semana); la invitación vuelve cuando esa semana sea la en curso, y el
  pre-rellenado se queda sin valor hasta que se guarde uno nuevo (RF-6).
- Si el valor no está vacío y no es un entero entre 1 y 100000 (letras, decimales,
  negativos, mayor que 100000), entonces no se guarda nada, se conserva el objetivo
  anterior, no se rompe la interfaz ni se llega a mostrar un objetivo inválido, y DEBE
  mostrarse el mensaje de error de RF-8.
- CA: guardar no altera las sesiones existentes ni su cálculo.

**RF-3 — Un objetivo por semana (clave del lunes).**
Cuando se guarda un objetivo (valor o vacío), entonces el sistema DEBE asociarlo al lunes
de la semana destino, de modo que cada semana tiene el suyo y dos semanas distintas no se
pisan.
- CA: cada lunes los minutos de la semana vuelven a cero y el bloque pasa a leer el
  objetivo de esa semana (o la invitación si no tiene).
- CA: una semana sin objetivo no hereda el de la anterior.
- CA: los objetivos de las semanas pasadas quedan guardados como histórico, con una
  entrada por clave-lunes, pero no existe ninguna interfaz para verlos ni editarlos: el
  bloque solo actúa sobre la semana en curso (D8).
- CA: la compatibilidad con los datos ya guardados se describe en RNF-4.

**RF-4 — Vigencia: de martes a domingo se aplaza; el lunes aplica al instante.**
Cuando la persona guarda de martes a domingo, entonces el sistema DEBE asociar el cambio
siempre al lunes siguiente: el objetivo programado NO se aplica a la semana en curso, la
invitación «Fija tu objetivo semanal» sigue visible durante toda la semana cuando la en
curso no tiene objetivo, y, al pulsar «Guardar objetivo», DEBE mostrarse el aviso «Se
aplicará el lunes que viene» (D6).
Cuando la persona guarda durante el lunes (primer objetivo o cambio del que ya tenía la
semana), entonces el sistema DEBE aplicarlo ese mismo día a la semana en curso y DEBE
recalcular la barra al instante (D7, RF-7).
- CA: Si la semana en curso ya tiene objetivo vigente y se guarda uno nuevo de martes a
  domingo, entonces la semana en curso sigue midiéndose con su objetivo vigente hasta el
  lunes.
- CA: Si la semana en curso no tiene objetivo y se guarda uno de martes a domingo,
  entonces la invitación sigue visible y el valor no se aplica hasta el lunes siguiente.
- CA: guardar el campo vacío de martes a domingo también se aplaza: se borra el objetivo de
  la semana siguiente (programado o no) y el de la semana en curso se mantiene hasta el
  lunes.
- CA: guardado un domingo a las 23:59, el valor se asocia a la semana que empieza en menos
  de un minuto; guardado un lunes a las 00:00, el valor se asocia a la semana que acaba de
  empezar: en ambos casos de la frontera rige la semana nueva y la cerrada no cambia.
- CA: las semanas pasadas no se pueden editar (fuera de alcance).

**RF-5 — Barra de progreso y texto.**
Cuando la semana en curso tiene objetivo vigente, entonces el bloque DEBE mostrar una barra
de progreso y el texto "X de Y min (Z%)", donde X son los minutos de la semana, Y el
objetivo vigente y Z el porcentaje entero con redondeo clásico (Math.round: 33,3 → 33 y
66,7 → 67).
- CA: ejemplos de redondeo: 150 de 300 min → "150 de 300 min (50%)"; 100 de 300 min →
  "100 de 300 min (33%)"; 200 de 300 min → "200 de 300 min (67%)".
- CA: con 0 minutos la barra está vacía y el texto es "0 de Y min (0%)".
- CA: cuando X es mayor o igual que Y, la barra aparece llena y el texto pasa a "Objetivo
  cumplido"; no se muestra ningún porcentaje mayor de 100 ni el exceso ("+50").
- CA: la barra expone su estado a los lectores de pantalla con role="progressbar" y sus
  valores (mínimo 0, máximo del objetivo y valor actual), además del texto equivalente: el
  progreso se entiende sin color ni medición del ancho de la barra.
- CA: el texto comunica el progreso completo, para que se entienda sin color ni medición
  del ancho de la barra.

**RF-6 — Sin objetivo: invitación y campo pre-rellenado.**
Mientras la semana en curso no tenga objetivo, entonces el sistema NO DEBE mostrar barra ni
porcentaje, y DEBE mostrar la invitación "Fija tu objetivo semanal" junto al campo y al
botón «Guardar objetivo».
- CA: el campo viene pre-rellenado con el último objetivo usado, y se puede cambiar o
  vaciar.
- CA: el pre-rellenado sale de la entrada de la clave-lunes más reciente guardada; si esa
  entrada quedó vacía o su valor es corrupto, el campo aparece vacío (Definiciones).
- CA: si nunca se ha guardado ninguno, el campo aparece vacío.
- CA: vaciar el campo y guardar deja SIN OBJETIVO la semana destino (RF-2) y deja el
  pre-rellenado sin valor hasta que se guarde uno nuevo: al recargar, el campo sale vacío;
  la invitación se muestra (o sigue) mientras la semana destino no sea la en curso, y
  aparece cuando esa semana empiece sin objetivo.

**RF-7 — Recálculo del progreso.**
Cuando la persona abre la página, guarda una sesión o guarda un objetivo, entonces el
sistema DEBE recalcular el progreso con los minutos de la semana en curso y el objetivo
vigente.
- CA: guardar un objetivo durante el lunes actualiza la barra y el texto al instante, sin
  recargar; guardar de martes a domingo no cambia el progreso de la semana en curso (RF-4).
- CA: las sesiones con fecha futura no suman (regla ya existente del proyecto).
- CA: Si los minutos de la semana bajan por debajo del objetivo, entonces la barra vuelve a
  mostrarse parcial y el texto deja de decir "Objetivo cumplido".
- CA: al cruzar la medianoche o cambiar de semana con la página abierta, el cambio se ve al
  recargar (limitación aceptada, igual que el resto de datos).

**RF-8 — Feedback al guardar.**
Cuando la persona pulsa «Guardar objetivo», entonces el sistema DEBE mostrar un mensaje en
español con el patrón de mensajes ya existente de la app (texto breve que aparece y se
oculta solo; los fallos con la clase de error `mensaje-error`).
- CA: guardado con valor de martes a domingo → mensaje de éxito «Se aplicará el lunes que
  viene».
- CA: guardado con el campo vacío (o con 0) de martes a domingo → el mismo mensaje de
  éxito «Se aplicará el lunes que viene».
- CA: guardado con valor durante el lunes → mensaje de éxito «Objetivo guardado para esta
  semana».
- CA: guardado con el campo vacío (o con 0) durante el lunes → mensaje de éxito «Objetivo
  eliminado de esta semana».
- CA: valor inválido → mensaje de error «Introduce un número entero entre 1 y 100000»,
  sin guardar nada ni cambiar ningún dato (RF-2).
- CA: guardar una sesión (acción existente) sigue mostrando sus propios mensajes: el
  objetivo no los sustituye.

## Requisitos no funcionales

- **RNF-1**: Sin dependencias ni build: la característica funciona abriendo la página con
  doble clic.
- **RNF-2**: Los cálculos (semana, qué objetivo está vigente, progreso y porcentaje) son
  funciones puras que reciben "hoy" como parámetro, sin tocar la interfaz ni el
  almacenamiento.
- **RNF-3**: La lógica se prueba con `node --test` sin instalar paquetes; no se avanza con
  pruebas en rojo.
- **RNF-4**: Compatibilidad con lo ya guardado: los objetivos usan una clave nueva del
  almacenamiento local, sin tocar el formato de las sesiones ni de la mejor racha; nadie
  pierde datos.
- **RNF-5**: Fechas, lunes y semana siempre en hora local del usuario (sin conversiones
  UTC).
- **RNF-6**: Textos de la interfaz en español y código en inglés.
- **RNF-7**: Se entiende a 375 px de ancho y el progreso se lee por texto, no solo por el
  color o el largo de la barra.
- **RNF-8**: Se integra en el diseño actual (misma hoja con secciones separadas por reglas,
  ámbar como único acento), sin introducir tarjetas nuevas.

## Casos límite

- Primera semana o usuario nuevo: sin nada guardado → invitación, campo vacío, sin barra
  ni porcentaje y sin errores.
- Objetivo 0 o vacío guardado: la semana destino queda sin objetivo (invitación cuando le
  toque); un 0 se trata como vacío, no como valor inválido.
- Objetivo no numérico, decimal, negativo o mayor que 100000: no se conserva como
  objetivo; sigue el anterior o la invitación, se avisa con `mensaje-error` y la app no se
  rompe.
- Objetivo menor que los minutos ya estudiados esa semana: la barra aparece saturada y el
  texto "Objetivo cumplido" desde el principio.
- Cambio guardado un domingo 23:59 frente a un lunes 00:00: en ambos casos el valor rige
  la semana que empieza y la semana que termina conserva su objetivo.
- Objetivo nuevo guardado de martes a domingo en una semana que aún no tiene ninguno: no se
  aplica hasta el lunes siguiente y la invitación sigue visible.
- Guardar vacío de martes a domingo: se programa el borrado para el lunes siguiente; la
  semana en curso conserva su objetivo vigente (o su invitación) hasta el lunes.
- Semanas anteriores: quedan como dato guardado por clave-lunes (histórico), sin interfaz
  que las muestre ni permita editarlas.
- Última entrada guardada vacía o con valor corrupto: el campo de pre-rellenado sale
  vacío; no se ofrece ningún valor.
- Cruzar de mes o de año con la clave del lunes (semana del 28/12 al 03/01): el objetivo
  sigue perteneciendo a esa misma semana, sin duplicarse ni perderse.
- Sesiones con fecha futura: no suman al progreso.
- Registrar una sesión con fecha de la semana pasada: no cambia el progreso de la semana en
  curso.
- Página abierta al cruzar la medianoche o cambiar de semana: el progreso se recalcula al
  recargar.

## Fuera de alcance

- Objetivos diarios o por tema.
- Objetivos de otras métricas (sesiones, racha, días del mes).
- Notificaciones o recordatorios de la meta.
- Editar o borrar semanas pasadas.
- Ver el histórico de semanas anteriores en la interfaz (solo queda como dato guardado).
- Editar o borrar sesiones.
- Heredar automáticamente el objetivo de la semana anterior.
- Indicador de exceso por encima del objetivo (la barra satura en 100%).
- Ajustar el objetivo automáticamente según el historial del usuario.
- Exportar, sincronizar o enviar datos a servicios externos.

## Decisiones menores de la revisión QA

Declaradas aquí para que sean verificables; todas ya están reflejadas en el RF
correspondiente:

- **Rechazo de valor inválido**: se avisa con el patrón de error existente
  (`mensaje-error`) usando el texto «Introduce un número entero entre 1 y 100000» (RF-8).
- **Límite del objetivo**: entero entre 1 y 100000 inclusive; fuera de ese rango (salvo el
  vacío/0, que borra) el valor es inválido (RF-2).
- **Pre-rellenado**: sale de la entrada de la clave-lunes más reciente guardada; si está
  vacía o es corrupta, el campo sale vacío (RF-6, Definiciones). Así, vaciar el campo y
  guardar deja también sin valor el pre-rellenado hasta que se guarde uno nuevo.
- **Porcentaje**: redondeo clásico `Math.round`, con los ejemplos del RF-5.
- **Minutos válidos**: se referencia la regla de la spec 001, RF-1, CA (entero mayor que
  0), en Definiciones.
- **Disparadores del recálculo**: además de abrir la página y guardar una sesión, guardar
  un objetivo recalcula la barra (RF-7).
- **Accesibilidad**: etiqueta del campo en español; botón «Guardar objetivo» distinto de
  «Guardar sesión»; barra con `role="progressbar"` y valores, además del texto completo
  del progreso (RF-1, RF-5).
- **Textos de interfaz nuevos**: etiqueta «Objetivo semanal (minutos)», botón «Guardar
  objetivo» y los cuatro mensajes de RF-8 (RF-1, RF-8).
- **Estilo EARS**: redactado como la spec 001 («cuando…, entonces el sistema…», en
  minúsculas, con DEBE/NO DEBE en mayúsculas).

## Criterios de finalización

- Todos los RF y RNF verificados; pruebas con `node --test` en verde, sin paquetes nuevos
  instalados.
- Guía manual superada. La guía usa la fecha de la semana como variable: **D = día de la
  semana en que se ejecuta**. Pasos:
  1. Borrar en las herramientas del navegador las claves de la app (sesiones, mejor racha
     y objetivo semanal) y abrir la página: invitación «Fija tu objetivo semanal», campo
     vacío, sin barra ni porcentaje.
  2. Escribir 300 y pulsar «Guardar objetivo». Si D = lunes → mensaje «Objetivo guardado
     para esta semana» y aparece "0 de 300 min (0%)". Si D es de martes a domingo →
     mensaje «Se aplicará el lunes que viene», la invitación sigue visible y la semana en
     curso no cambia (la guarda queda programada para el lunes siguiente).
  3. Recargar: el campo se pre-rellena con 300 y el estado de la semana en curso no ha
     cambiado.
  4. Registrar una sesión de 120 min de hoy: si el objetivo ya está vigente (D = lunes, o
     semana que ya tenía objetivo aplicado) se lee "120 de 300 min (40%)"; si acababas de
     programarlo para el lunes, la semana en curso sigue sin barra (esperado, RF-4).
  5. Con el objetivo vigente, registrar sesiones hasta llegar a 300 min: la barra se llena
     y el texto pasa a "Objetivo cumplido" (si el objetivo está programado para el lunes,
     este paso se comprueba el lunes siguiente).
  6. Escribir "abc" (letras) y pulsar «Guardar objetivo» → mensaje de error «Introduce un
     número entero entre 1 y 100000», sin cambiar nada.
  7. Dejar el campo vacío y pulsar «Guardar objetivo». Si D = lunes → mensaje «Objetivo
     eliminado de esta semana», desaparece la barra y vuelve la invitación. Si D es de
     martes a domingo → mensaje «Se aplicará el lunes que viene» y la semana en curso no
     cambia.
  8. Recargar: la consola está sin errores y el campo sale vacío (el pre-rellenado quedó
     sin valor tras el vaciado).
  - Si D no es lunes, las ramas "lunes" de los pasos 2, 5 y 7 se comprueban la próxima vez
    que toque lunes; la guía se anota con la rama ejecutada.
- Comprobación de accesibilidad: el campo tiene etiqueta en español, «Guardar objetivo» no
  se confunde con «Guardar sesión» y la barra expone su estado (role="progressbar") además
  del texto.
- La sección "Datos" de `AGENTS.md` queda actualizada con la clave nueva de objetivos: su
  nombre, que guarda una entrada por clave-lunes (histórico), que el vacío significa "sin
  objetivo", el rango 1–100000 y la regla de aplazamiento al lunes (D6/D7).
- Comprobación de que las claves existentes siguen intactas y ningún dato se ha perdido.
- Comprobación en móvil a 375 px: el bloque aparece en la zona de estadísticas apiladas.
- `MEMORY.md` actualizado con el resultado de la verificación.

## Dudas abiertas

- Ninguna: no queda ninguna nota pendiente ni marcador sin resolver. Ocho
  decisiones cerradas con el usuario (5 originales y D6, D7 y D8, resueltas el
  07/10/2026):
  1. **Dónde se fija/edita**: bloque propio "Objetivo semanal" en la zona de estadísticas
     de la semana (justo debajo del dato "Esta semana"), con campo numérico y botón
     «Guardar objetivo» (opción b).
  2. **Qué se guarda**: un objetivo por semana, asociado al lunes de su semana; cada lunes
     se parte de cero y cada semana muestra el suyo (opción b).
  3. **Cambio a mitad de semana**: no se aplica a mitad de semana; el cambio rige en el
     lunes siguiente, salvo que se guarde durante el lunes, en que se aplica ese mismo día
     (resuelta con D6 y D7, ver decisiones 6 y 7).
  4. **Progreso**: barra + texto "120 de 300 min (40%)"; al 100% la barra se satura y
     aparece "Objetivo cumplido", sin contar el exceso (opción a).
  5. **Sin objetivo**: opcional; sin objetivo no hay barra ni porcentaje, solo la invitación
     "Fija tu objetivo semanal", con el campo pre-rellenado con el último objetivo usado
     (opción a + prellenado).
  6. **D6 — Guardado de martes a domingo**: se aplaza SIEMPRE al lunes siguiente; la
     invitación sigue visible toda la semana y, al pulsar «Guardar objetivo», se muestra
     «Se aplicará el lunes que viene»; el objetivo programado NO se aplica a la semana en
     curso.
  7. **D7 — Guardado durante el lunes**: se aplica ese mismo día a la semana en curso
     (primer objetivo o cambio del que ya tenía).
  8. **D8 — Sin UI de semanas anteriores**: no se muestra ninguna interfaz de semanas
     anteriores; el bloque solo actúa sobre la semana en curso; los objetivos pasados quedan
     guardados en la clave por semana (histórico) sin interfaz; "editar/borrar semanas
     pasadas" sigue fuera de alcance.
