# Tareas — Spec 004: tamaño de los textos de la barra de progreso

Alcance mínimo (dos valores de `font-size` + dos comentarios): **una sola tarea**, en orden
de dependencia, de 20–30 min como máximo. `node --test` en verde antes de cerrarla.

- [x] **T1. Reducir a 14 px (0,875rem) el porcentaje y la línea de minutos de la barra de
  progreso y actualizar sus dos comentarios (solo `styles.css`), con verificación y cierre.**
  RF-1, RF-2, RF-3, RF-4; RNF-1, RNF-2, RNF-3, RNF-4, RNF-5, RNF-6.
  - Hecho cuando: en `styles.css` la regla `.objetivo-porcentaje` declara
    `font-size: 0.875rem` (antes `1.25rem`) y la regla `.objetivo-progreso` declara
    `font-size: 0.875rem` (antes `1rem`), conservando intactas el resto de sus
    declaraciones (`flex: none`, serif, peso 600, `line-height: 1`, color tinta; `margin:
    8px 0 0`, color tinta clara) y sin tocar ninguna otra regla de la hoja; los dos
    comentarios citan 14 px / 0,875 de la base y ya no anuncian «~20 px» ni «16 px»;
    `node --test` pasa en verde con 42/42; y en el navegador (`file://`, doble clic) a
    1280 px y 375 px se comprueba con `getComputedStyle`: `font-size` calculado = 14 px
    (±0,5) en `.objetivo-porcentaje` y en `.objetivo-progreso` con base 16, en los estados
    «0%» / «0 de 300 min» y «100%» / «Objetivo cumplido» con el texto intacto, el
    porcentaje conservando serif/peso/color y los minutos su color, la estructura sin
    espaciados nuevos (la fila se estrecha y los minutos suben unos píxeles: efecto
    permitido), ningún otro texto de la página cambiando de tamaño, barra de 12 px y ancho
    de columna intactos, sin desbordes horizontales, consola limpia y localStorage solo con
    las tres claves habituales (con la base de fuente a 32 px los dos tamaños pasan a
    28 px: proporción 0,875, RNF-6); `MEMORY.md` queda actualizado con el resultado.
