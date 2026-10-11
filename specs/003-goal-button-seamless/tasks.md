# Tareas — Spec 003: botón de guardar integrado en el campo

Alcance mínimo (un renglón de CSS + comentarios): **una sola tarea**, en orden de
dependencia, de 20–30 min como máximo. `node --test` en verde antes de cerrarla.

- [x] **T1. Quitar el filete vertical del botón del objetivo y actualizar los comentarios
  obsoletos (solo `styles.css`), con verificación y cierre.** RF-1, RF-2, RF-3, RF-4,
  RF-5; RNF-1, RNF-2, RNF-3, RNF-4, RNF-5, RNF-6.
  - Hecho cuando: la regla `.objetivo button` ya no contiene
    `border-left: 1px solid #cfdce8` (su borde efectivo vuelve a ser `border: none`, con
    `width: 26px`, `height: 41px`, fondo transparente y la regla scoped de
    hover/active intactos); los tres comentarios que citan el filete (cabecera de
    `.objetivo button`, cabecera de `.objetivo-formulario` y el del icono de 15 px)
    describen el aspecto real y los comentarios de otros filetes siguen sin tocarse;
    `node --test` pasa en verde con 42/42; y en el navegador (`file://`, doble clic) a
    1280 px y 375 px se comprueba: sin trazo vertical en el límite campo-botón en reposo,
    con el campo enfocado ni con el botón enfocado con Tab (el anillo de foco no cuenta),
    subrayado compartido continuo que se oscurece sin interrupción, icono centrado
    (desviación ≤ 1 px), pie del botón alineado con el pie del campo (< 1 px), ancho
    total del formulario intacto y sin desbordes, hover **sin** cambio en el botón del
    objetivo pero **con** su cambio normal en «Guardar sesión», campo vacío/con valor/en
    error sin divisoria, consola limpia y localStorage sin claves nuevas; `MEMORY.md`
    queda actualizado con el resultado.
