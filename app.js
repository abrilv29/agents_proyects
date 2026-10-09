const CLAVE = "diario-estudio-sesiones";
const CLAVE_MEJOR = "diario-estudio-mejor-racha";
const CLAVE_OBJETIVOS = "diario-estudio-objetivos";

const formulario = document.getElementById("formulario-sesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista-sesiones");
const vacio = document.getElementById("vacio");
const rachaNumero = document.getElementById("racha-numero");
const rachaTexto = document.getElementById("racha-texto");
const semanaMinutos = document.getElementById("semana-minutos");
const semanaTexto = document.getElementById("semana-texto");
const mesDias = document.getElementById("mes-dias");
const mesTexto = document.getElementById("mes-texto");
const mejorNumero = document.getElementById("mejor-racha-numero");
const mejorTexto = document.getElementById("mejor-racha-texto");
const cuadricula = document.getElementById("cuadricula");
const campoObjetivo = document.getElementById("objetivo-minutos");
const botonObjetivo = document.getElementById("objetivo-guardar");
const mensajeObjetivo = document.getElementById("mensaje-objetivo");
const barraObjetivo = document.getElementById("objetivo-barra");
const rellenoObjetivo = document.getElementById("objetivo-relleno");
const progresoObjetivo = document.getElementById("objetivo-progreso");
const invitacionObjetivo = document.getElementById("objetivo-invitacion");

let sesiones = cargarSesiones();
let mejorRacha = cargarMejorRacha();
let primeraCarga = true;
let resaltarPrimera = false;
let celdasMarcadas = new Set();

function cargarSesiones() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? JSON.parse(guardado) : [];
  } catch (error) {
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

function cargarMejorRacha() {
  try {
    const guardado = Number(localStorage.getItem(CLAVE_MEJOR));
    return Number.isFinite(guardado) && guardado > 0 ? Math.floor(guardado) : 0;
  } catch (error) {
    return 0;
  }
}

function guardarMejorRacha() {
  localStorage.setItem(CLAVE_MEJOR, String(mejorRacha));
}

function fechaLocalHoy() {
  const hoy = new Date();
  return claveFecha(hoy);
}

function claveFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function fechaDesdeClave(clave) {
  const partes = clave.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function calcularRacha() {
  const dias = new Set(sesiones.map((sesion) => sesion.fecha));

  let dia = new Date();
  dia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());

  if (!dias.has(claveFecha(dia))) {
    dia.setDate(dia.getDate() - 1);
    if (!dias.has(claveFecha(dia))) {
      return 0;
    }
  }

  let racha = 0;
  while (dias.has(claveFecha(dia))) {
    racha++;
    dia.setDate(dia.getDate() - 1);
  }
  return racha;
}

function mostrarRacha() {
  const racha = calcularRacha();
  rachaNumero.textContent = String(racha);

  if (racha === 0) {
    rachaTexto.textContent = "Empieza hoy tu primera racha";
  } else if (racha === 1) {
    rachaTexto.textContent = "Día seguido estudiando";
  } else {
    rachaTexto.textContent = "Días seguidos estudiando";
  }
}

function calcularMinutosSemana() {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);

  const claveInicio = claveFecha(inicio);
  const claveFin = claveFecha(fin);
  const claveHoy = claveFecha(hoy);

  let total = 0;
  sesiones.forEach((sesion) => {
    if (sesion.fecha >= claveInicio && sesion.fecha <= claveFin && sesion.fecha <= claveHoy) {
      const minutos = Number(sesion.minutos);
      if (Number.isFinite(minutos) && minutos > 0) {
        total += minutos;
      }
    }
  });
  return Math.round(total);
}

function mostrarMinutosSemana() {
  const total = calcularMinutosSemana();

  if (total === 0) {
    semanaMinutos.textContent = "0 min";
    semanaTexto.textContent = "Sin sesiones esta semana";
    return;
  }

  if (total >= 60) {
    const horas = Math.floor(total / 60);
    const resto = total % 60;
    semanaMinutos.textContent = resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
  } else {
    semanaMinutos.textContent = `${total} min`;
  }
  semanaTexto.textContent = "De lunes a domingo";
}

function calcularDiasMes() {
  const hoy = new Date();
  const mesActual = claveFecha(hoy).slice(0, 7);
  const claveHoy = claveFecha(hoy);

  const dias = new Set();
  sesiones.forEach((sesion) => {
    if (sesion.fecha.slice(0, 7) === mesActual && sesion.fecha <= claveHoy) {
      dias.add(sesion.fecha);
    }
  });
  return dias.size;
}

function mostrarDiasMes() {
  const dias = calcularDiasMes();
  mesDias.textContent = String(dias);

  if (dias === 0) {
    mesTexto.textContent = "Sin sesiones aún";
  } else if (dias === 1) {
    mesTexto.textContent = "día estudiado";
  } else {
    mesTexto.textContent = "días estudiados";
  }
}

function etiquetaCelda(datos) {
  const fecha = fechaDesdeClave(datos.key);
  const texto = fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  if (datos.isFuture) {
    return texto + ": día futuro";
  }
  if (datos.minutes > 0) {
    return texto + ": " + datos.minutes + " min";
  }
  return texto + ": sin sesión";
}

function renderCuadricula(animaTodas) {
  if (!cuadricula) {
    return;
  }
  cuadricula.innerHTML = "";

  const celdas = getHeatCells(sesiones, new Date());
  const marcadasAhora = new Set();
  let estudiados = 0;
  let animadas = 0;

  celdas.forEach((datos) => {
    const etiqueta = etiquetaCelda(datos);
    const celda = document.createElement("span");
    celda.className = "celda";
    celda.setAttribute("role", "img");
    celda.setAttribute("aria-label", etiqueta);
    celda.dataset.etiqueta = etiqueta;
    celda.tabIndex = 0;

    if (datos.isFuture) {
      celda.classList.add("celda-futura");
    } else if (datos.level > 0) {
      celda.classList.add("nivel-" + datos.level);
      marcadasAhora.add(datos.key);
      estudiados++;

      // En la primera carga se marca todo el barrido; al guardar, solo el día nuevo.
      if (animaTodas || !celdasMarcadas.has(datos.key)) {
        celda.classList.add("celda-animar");
        celda.style.setProperty("--i", animadas);
        animadas++;
      }
    }

    if (datos.isToday) {
      celda.classList.add("celda-hoy");
    }

    cuadricula.appendChild(celda);
  });

  celdasMarcadas = marcadasAhora;

  cuadricula.setAttribute(
    "aria-label",
    "Últimos 28 días: " + estudiados + (estudiados === 1 ? " día con sesión" : " días con sesión")
  );
}

function calcularMejorRacha() {
  const hoy = new Date();
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const dias = new Set(
    sesiones
      .map((sesion) => sesion.fecha)
      .filter((fecha) => fecha <= claveFecha(fin))
  );

  if (dias.size === 0) {
    return 0;
  }

  const primera = [...dias].sort()[0];
  let dia = fechaDesdeClave(primera);
  let actual = 0;
  let mejor = 0;

  while (dia <= fin) {
    if (dias.has(claveFecha(dia))) {
      actual++;
      if (actual > mejor) {
        mejor = actual;
      }
    } else {
      actual = 0;
    }
    dia.setDate(dia.getDate() + 1);
  }

  return mejor;
}

function actualizarMejorRacha() {
  const derivada = calcularMejorRacha();
  if (derivada > mejorRacha) {
    mejorRacha = derivada;
    guardarMejorRacha();
  }
}

function mostrarMejorRacha() {
  mejorNumero.textContent = String(mejorRacha);

  if (mejorRacha === 0) {
    mejorTexto.textContent = "Aún sin récord";
  } else if (calcularRacha() === mejorRacha) {
    mejorTexto.textContent = "¡Récord en curso!";
  } else {
    mejorTexto.textContent = "Tu récord";
  }
}

function ordenarSesiones() {
  sesiones.sort((a, b) => {
    if (a.fecha === b.fecha) {
      return b.creadoEn - a.creadoEn;
    }
    return a.fecha < b.fecha ? 1 : -1;
  });
}

function textoFecha(clave) {
  const fecha = fechaDesdeClave(clave);
  const opciones = { day: "numeric", month: "long", year: "numeric" };
  const texto = fecha.toLocaleDateString("es-ES", opciones);

  if (clave === fechaLocalHoy()) {
    return "Hoy, " + texto;
  }

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  if (clave === claveFecha(ayer)) {
    return "Ayer, " + texto;
  }

  return texto;
}

function mostrarSesiones() {
  ordenarSesiones();
  lista.innerHTML = "";

  vacio.hidden = sesiones.length > 0;

  sesiones.forEach((sesion, indice) => {
    const item = document.createElement("li");
    if (indice === 0 && resaltarPrimera) {
      item.className = "sesion-nueva";
    }

    const izquierda = document.createElement("div");
    izquierda.className = "sesion-izquierda";

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = textoFecha(sesion.fecha);

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    izquierda.appendChild(fecha);
    izquierda.appendChild(tema);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = sesion.minutos + " min";

    item.appendChild(izquierda);
    item.appendChild(minutos);
    lista.appendChild(item);
  });

  resaltarPrimera = false;
}

// Paints the goal block for the current week (always from the monday key of
// today): with a live goal the bar plus its text (RF-5), without one just the
// invitation (RF-6). The field is never touched here (plan, decision 5).
function mostrarObjetivo() {
  const hoy = new Date();
  const almacen = parseGoalStore(localStorage.getItem(CLAVE_OBJETIVOS));
  const objetivo = readGoal(almacen, getMondayKey(hoy));

  if (objetivo === null) {
    barraObjetivo.hidden = true;
    progresoObjetivo.textContent = "";
    invitacionObjetivo.hidden = false;
    return;
  }

  const minutos = calcularMinutosSemana();
  const progreso = getProgress(minutos, objetivo);
  // Over the goal the text stays "Objetivo cumplido": no excess, no >100%.
  const texto = progreso.completed
    ? "Objetivo cumplido"
    : `${minutos} de ${objetivo} min (${progreso.percent}%)`;

  rellenoObjetivo.style.width = progreso.percent + "%"; // CSS default is 0
  barraObjetivo.hidden = false;
  barraObjetivo.setAttribute("aria-valuemin", "0");
  barraObjetivo.setAttribute("aria-valuemax", String(objetivo));
  barraObjetivo.setAttribute("aria-valuenow", String(Math.min(minutos, objetivo)));
  barraObjetivo.setAttribute("aria-valuetext", texto); // same text that is shown
  progresoObjetivo.textContent = texto;
  invitacionObjetivo.hidden = true;
}

function actualizar() {
  actualizarMejorRacha();
  mostrarRacha();
  mostrarMinutosSemana();
  mostrarObjetivo(); // recalculate the goal block on load and after saves (RF-7)
  mostrarDiasMes();
  mostrarMejorRacha();
  renderCuadricula(primeraCarga);
  mostrarSesiones();
  primeraCarga = false;
}

// Shows a message in its own node (defaults to the session one). The hide
// timer lives on the element, so the two message nodes never clash.
function mostrarMensaje(texto, tipo, elemento = mensaje) {
  elemento.textContent = texto;
  elemento.className = "mensaje mensaje-" + tipo;
  elemento.hidden = false;
  window.clearTimeout(elemento.hideTimer);
  elemento.hideTimer = window.setTimeout(() => {
    elemento.hidden = true;
  }, 2500);
}

campoFecha.value = fechaLocalHoy();

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha || !tema || !Number.isFinite(minutos) || minutos <= 0) {
    mostrarMensaje("Completa el tema y pon minutos mayores que cero.", "error");
    return;
  }

  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: Math.round(minutos),
    creadoEn: Date.now()
  });

  guardarSesiones();
  resaltarPrimera = true;
  actualizar();

  formulario.reset();
  campoFecha.value = fechaLocalHoy();
  mostrarMensaje("Sesión guardada.", "ok");
});

botonObjetivo.addEventListener("click", () => {
  const parsed = parseGoalInput(campoObjetivo.value);

  if (!parsed.valid) {
    // Invalid value: nothing is saved and no other data changes (RF-2).
    mostrarMensaje(
      `Introduce un número entero entre ${GOAL_MIN} y ${GOAL_MAX}`,
      "error",
      mensajeObjetivo
    );
    return;
  }

  const hoy = new Date();
  const claveDestino = getSaveTargetKey(hoy);
  const almacen = parseGoalStore(localStorage.getItem(CLAVE_OBJETIVOS));
  almacen[claveDestino] = parsed.value; // number, or null to clear that week
  localStorage.setItem(CLAVE_OBJETIVOS, JSON.stringify(almacen));

  if (claveDestino !== getMondayKey(hoy)) {
    // Tuesday to Sunday: the save waits for the next Monday (D6).
    mostrarMensaje("Se aplicará el lunes que viene", "ok", mensajeObjetivo);
  } else if (parsed.value === null) {
    mostrarMensaje("Objetivo eliminado de esta semana", "ok", mensajeObjetivo);
  } else {
    mostrarMensaje("Objetivo guardado para esta semana", "ok", mensajeObjetivo);
  }

  actualizar(); // recalculate everything (RF-7)
});

// Pre-fill the field once, on the initial load only (plan, decision 5): doing
// it inside actualizar() would wipe what the person is typing mid-way.
const prefillInicial = getPrefillValue(parseGoalStore(localStorage.getItem(CLAVE_OBJETIVOS)));
if (campoObjetivo.value === "" && prefillInicial !== null) {
  campoObjetivo.value = String(prefillInicial);
}

actualizar();
