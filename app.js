// Cargar datos dinámicamente al iniciar la página
document.addEventListener("DOMContentLoaded", function () {
  cargarVehiculos();
  cargarFuncionarios();
  cargarRadiales();
  cargarTiposServicio();
  cargarObservaciones();
  setFechaActual();

  // Enfocar el primer campo relevante
  setTimeout(() => {
    document.getElementById("fecha").focus();
  }, 500);
});

let contadorAcompanantes = 1;

async function cargarVehiculos() {
  try {
    const response = await fetch("listado_vehiculos.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const vehiculos = await response.json();
    const select = document.getElementById("vehiculo");

    vehiculos.forEach((vehiculo) => {
      const option = document.createElement("option");
      const valorCompleto = `${vehiculo.codigo} - ${vehiculo.PPU}`;
      option.value = valorCompleto;
      option.textContent = valorCompleto;
      select.appendChild(option);
    });

    // Agregar opción para ingreso manual
    const manualOption = document.createElement("option");
    manualOption.value = "MANUAL";
    manualOption.textContent = "OTRO (Ingreso manual)";
    select.appendChild(manualOption);
  } catch (error) {
    console.error("Error al cargar vehículos:", error);
    // Fallback: agregar un vehículo de prueba
    const select = document.getElementById("vehiculo");
    const option = document.createElement("option");
    option.value = "TEST";
    option.textContent = "Error cargando vehículos (test)";
    select.appendChild(option);
  }
}

async function cargarFuncionarios() {
  try {
    const response = await fetch("listado_funcionarios.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const funcionarios = await response.json();
    const datalist = document.getElementById("funcionarios");

    funcionarios.forEach((funcionario) => {
      const option = document.createElement("option");
      option.value = `${funcionario.grado} ${funcionario.nombre}`;
      option.setAttribute("data-armamento", funcionario.armamento || "");
      option.setAttribute("data-casco", funcionario.casco || "");
      datalist.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar funcionarios:", error);
  }
}

async function cargarRadiales() {
  try {
    const response = await fetch("listado_equipamiento.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const equipos = await response.json();
    const radialesDatalist = document.getElementById("radiales");
    const accesoriosDatalist = document.getElementById("accesorios-list");
    const accesorioSelect = document.getElementById("accesorio-select");

    // Separar radiales y accesorios
    equipos.forEach((equipo) => {
      const option = document.createElement("option");
      option.value = `${equipo.codigo} - ${equipo.descripcion}`;
      option.setAttribute("data-tipo", equipo.tipo);
      option.setAttribute("data-series", JSON.stringify(equipo.series || []));

      if (equipo.tipo === "radial") {
        radialesDatalist.appendChild(option);
      } else if (equipo.tipo === "accesorio") {
        accesoriosDatalist.appendChild(option);
        // También agregar al select de accesorios
        const optionSelect = document.createElement("option");
        optionSelect.value = `${equipo.codigo} - ${equipo.descripcion}`;
        optionSelect.setAttribute("data-tipo", equipo.tipo);
        optionSelect.setAttribute(
          "data-series",
          JSON.stringify(equipo.series || []),
        );
        accesorioSelect.appendChild(optionSelect);
      }
    });
  } catch (error) {
    console.error("Error al cargar equipos:", error);
  }
}

function setFechaActual() {
  const fechaInput = document.getElementById("fecha");
  const hoy = new Date();
  // Formatear la fecha actual en zona horaria local como YYYY-MM-DD
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const fechaFormateada = `${año}-${mes}-${dia}`;
  fechaInput.value = fechaFormateada;
}

function mostrarCampoManualVehiculo() {
  const vehiculoSelect = document.getElementById("vehiculo");
  const manualVehiculoGroup = document.getElementById("manual-vehiculo-group");

  if (vehiculoSelect.value === "MANUAL") {
    manualVehiculoGroup.classList.remove("hidden");
  } else {
    manualVehiculoGroup.classList.add("hidden");
    document.getElementById("manual-vehiculo").value = "";
  }
}

function setToggle(id, value) {
  const input = document.getElementById(id);
  if (!input) return;

  input.value = value;

  // Actualizar UI de los botones
  const group = input.nextElementSibling;
  if (group && group.classList.contains("toggle-group")) {
    const buttons = group.querySelectorAll(".toggle-btn");
    buttons.forEach((btn) => {
      if (
        btn.innerText.includes(
          value === "Sí" || value === "SI"
            ? "SI"
            : value === "Infan" || value === "INFANTERIA"
              ? "Infan"
              : value === "Moto" || value === "MOTORIZADO"
                ? "Moto"
                : "NO",
        )
      ) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Disparar eventos manuales si es necesario
  if (id === "desplazamiento") toggleVehiculo();
  if (id === "accesorios") mostrarCampoSerie();
  if (id === "equipamiento") mostrarCamposEquipamiento();
}

function toggleVehiculo() {
  const desplazamiento = document.getElementById("desplazamiento").value;
  const sectionVehiculo = document.getElementById("section-vehiculo");
  const vehiculoSelect = document.getElementById("vehiculo");

  if (desplazamiento === "INFANTERIA") {
    sectionVehiculo.classList.add("hidden");
    if (vehiculoSelect) {
      vehiculoSelect.removeAttribute("required");
      vehiculoSelect.value = "";
      mostrarCampoManualVehiculo(); // Ocultar campo manual
    }
  } else {
    sectionVehiculo.classList.remove("hidden");
    if (vehiculoSelect) {
      vehiculoSelect.setAttribute("required", "required");
    }
  }
}

function agregarAcompanante() {
  contadorAcompanantes++;
  const container = document.getElementById("acompanantes-adicionales");

  const div = document.createElement("div");
  div.className = "form-group";
  div.innerHTML = `
        <label for="acomp${contadorAcompanantes}">Acompañante ${contadorAcompanantes}</label>
        <div style="display: flex; gap: 8px; flex-direction: column;">
            <div style="display: flex; gap: 8px; align-items: center;">
                <div class="input-icon-wrapper" style="flex: 1;">
                    
                    <input type="text" id="acomp${contadorAcompanantes}" list="funcionarios" placeholder="Grado y Nombre" onchange="autocompletarArmamento('acomp${contadorAcompanantes}')" onfocus="this.select()">
                </div>
                <button type="button" class="btn-danger" onclick="eliminarAcompanante(this)" style="padding: 12px; width: 45px;">✕</button>
            </div>
            <div id="acomp${contadorAcompanantes}-info" class="badge-info hidden"></div>
            <input type="hidden" id="acomp${contadorAcompanantes}-armamento">
            <input type="hidden" id="acomp${contadorAcompanantes}-casco">
        </div>
    `;

  container.appendChild(div);

  if (document.getElementById("equipamiento").value === "Sí") {
    agregarCampoChalecoAdicional(contadorAcompanantes);
  }
}

function eliminarAcompanante(boton) {
  const grupo = boton.closest(".form-group");
  const inputId = grupo.querySelector('input[type="text"]').id;

  const campoChalecoId = `chaleco-${inputId}`;
  const campoChaleco = document.getElementById(campoChalecoId);
  if (campoChaleco) {
    campoChaleco.closest(".form-group").remove();
  }

  grupo.remove();
}

function validarFormulario() {
  let isValid = true;
  const desplazamiento = document.getElementById("desplazamiento").value;
  const campos = ["fecha", "jp", "acomp1", "tipo"];

  document
    .querySelectorAll("input, select, textarea")
    .forEach((el) => (el.style.borderColor = ""));

  campos.forEach((campo) => {
    const input = document.getElementById(campo);
    if (input && !input.value.trim()) {
      input.style.borderColor = "#ef4444";
      isValid = false;
    }
  });

  if (desplazamiento === "MOTORIZADO") {
    const vehiculoSelect = document.getElementById("vehiculo");
    if (vehiculoSelect && !vehiculoSelect.value.trim()) {
      vehiculoSelect.style.borderColor = "#ef4444";
      isValid = false;
    } else if (vehiculoSelect && vehiculoSelect.value === "MANUAL") {
      const manualVehiculo = document.getElementById("manual-vehiculo");
      if (manualVehiculo && !manualVehiculo.value.trim()) {
        manualVehiculo.style.borderColor = "#ef4444";
        isValid = false;
      }
    }

    const kmInput = document.getElementById("km");
    if (kmInput && !String(kmInput.value).trim()) {
      kmInput.style.borderColor = "#ef4444";
      isValid = false;
    }
  }

  if (!isValid) {
    alert("Por favor, complete los campos obligatorios marcados en rojo.");
  }

  return isValid;
}

function enviarWhatsApp() {
  if (!validarFormulario()) return;

  const fechaInput = document.getElementById("fecha").value;
  const [año, mes, dia] = fechaInput.split("-");
  const fechaFormateada = `${dia}-${mes}-${año}`;

  const desplazamiento = document.getElementById("desplazamiento").value;
  const jp = document.getElementById("jp").value;
  const jpArmamento = document.getElementById("jp-armamento").value;
  const jpCasco = document.getElementById("jp-casco").value;
  const jpChaleco = document.getElementById("chaleco-jp").value;
  const equipamiento = document.getElementById("equipamiento").value;
  const tipo = document.getElementById("tipo").value;
  const obs = document.getElementById("obs").value;

  let mensaje = `*SALIDA OS9*\n`;
  mensaje += `\n`;
  mensaje += `*Fecha:* ${fechaFormateada}\n`;
  if (desplazamiento === "INFANTERIA") {
    mensaje += `*Modo:* INFANTERÍA\n`;
  }

  if (desplazamiento === "MOTORIZADO") {
    const vehiculoSelect = document.getElementById("vehiculo").value;
    const manualVehiculo = document
      .getElementById("manual-vehiculo")
      .value.trim();
    const km = document.getElementById("km").value;
    const tarjeta = document.getElementById("tarjeta-combustible").value;

    let vehiculoCompleto =
      vehiculoSelect === "MANUAL" ? manualVehiculo : vehiculoSelect;
    let vehiculoCodigo = vehiculoCompleto;
    let vehiculoPatente = "";
    if (vehiculoCompleto.includes(" - ")) {
      [vehiculoCodigo, vehiculoPatente] = vehiculoCompleto.split(" - ");
    }

    mensaje += `*Vehículo:* ${vehiculoCodigo}\n`;
    if (vehiculoPatente) mensaje += `*Patente:* ${vehiculoPatente}\n`;
    if (km) mensaje += `*KM:* ${km}\n`;
    mensaje += `*Tarjeta Combustible:* ${tarjeta}\n`;
  }

  mensaje += `\n*Personal:*\n`;
  mensaje += `• *JP:* ${jp}`;
  if (jpArmamento) mensaje += ` (Arm: ${jpArmamento})`;
  if (equipamiento === "Sí") {
    if (jpCasco) mensaje += ` (Casco: ${jpCasco})`;
    if (jpChaleco) mensaje += ` (Chaleco: ${jpChaleco})`;
  }
  mensaje += `\n`;

  for (let i = 1; i <= contadorAcompanantes; i++) {
    const acomp = document.getElementById(`acomp${i}`);
    if (acomp && acomp.value) {
      const arm = document.getElementById(`acomp${i}-armamento`).value;
      const casco = document.getElementById(`acomp${i}-casco`).value;
      const chaleco = document.getElementById(`chaleco-acomp${i}`)?.value;

      mensaje += `• *Acomp ${i}:* ${acomp.value}`;
      if (arm) mensaje += ` (Arm: ${arm})`;
      if (equipamiento === "Sí") {
        if (casco) mensaje += ` (Casco: ${casco})`;
        if (chaleco) mensaje += ` (Chaleco: ${chaleco})`;
      }
      mensaje += `\n`;
    }
  }

  const radio = document.getElementById("radio").value;
  const accesoriosSelect = document.getElementById("accesorios").value;
  if (radio) mensaje += `\n*Radio:* ${radio}\n`;

  if (accesoriosSelect === "SI") {
    const acc = document.getElementById("accesorio-select").value;
    const manual = document.getElementById("manual-accesorio").value;
    const accFinal = acc === "MANUAL" ? manual : acc;
    if (accFinal) {
      mensaje += `*Accesorio:* ${accFinal}`;
      if (acc !== "MANUAL") {
        const serie = obtenerSerieDelAccesorio(acc);
        if (serie) mensaje += ` (Serie: ${serie})`;
      }
      mensaje += `\n`;
    }
  }

  mensaje += `\n*Servicio:* ${tipo}\n`;
  if (obs) mensaje += `*Obs:* ${obs}\n`;

  mensaje += `\n`;
  mensaje += `_Sección OS9 Araucanía 2026_`;

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// Funciones para manejar tipos de servicio y observaciones
function cargarTiposServicio() {
  const tipos = JSON.parse(localStorage.getItem("tiposServicio") || "[]");
  const datalist = document.getElementById("tipos-servicio");

  // Limpiar opciones existentes
  datalist.innerHTML = "";

  // Agregar tipos guardados
  tipos.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo;
    datalist.appendChild(option);
  });
}

function cargarObservaciones() {
  const observaciones = JSON.parse(
    localStorage.getItem("observaciones") || "[]",
  );
  const datalist = document.getElementById("observaciones");

  // Limpiar opciones existentes
  datalist.innerHTML = "";

  // Agregar observaciones guardadas
  observaciones.forEach((obs) => {
    const option = document.createElement("option");
    option.value = obs;
    datalist.appendChild(option);
  });
}

function guardarTipoServicio(tipo) {
  if (!tipo.trim()) return;

  let tipos = JSON.parse(localStorage.getItem("tiposServicio") || "[]");

  // Evitar duplicados
  if (!tipos.includes(tipo.trim())) {
    tipos.unshift(tipo.trim()); // Agregar al inicio

    // Mantener solo los últimos 20 tipos
    if (tipos.length > 20) {
      tipos = tipos.slice(0, 20);
    }

    localStorage.setItem("tiposServicio", JSON.stringify(tipos));
    cargarTiposServicio(); // Recargar el datalist
  }
}

function guardarObservacion(observacion) {
  if (!observacion.trim()) return;

  let observaciones = JSON.parse(localStorage.getItem("observaciones") || "[]");

  // Evitar duplicados
  if (!observaciones.includes(observacion.trim())) {
    observaciones.unshift(observacion.trim()); // Agregar al inicio

    // Mantener solo las últimas 15 observaciones
    if (observaciones.length > 15) {
      observaciones = observaciones.slice(0, 15);
    }

    localStorage.setItem("observaciones", JSON.stringify(observaciones));
    cargarObservaciones(); // Recargar el datalist
  }
}

// Función para mostrar/ocultar campos de equipamiento
function mostrarCamposEquipamiento() {
  const equipamiento = document.getElementById("equipamiento").value;
  const camposEquipamiento = document.getElementById("campos-equipamiento");

  if (equipamiento === "Sí") {
    camposEquipamiento.classList.remove("hidden");
    sincronizarChalecos();
  } else {
    camposEquipamiento.classList.add("hidden");
    limpiarCamposChalecos();
  }
}

/**
 * Asegura que existan campos de chaleco para todos los acompañantes actuales
 */
function sincronizarChalecos() {
  const containerChalecos = document.getElementById("chalecos-adicionales");

  // Buscar todos los inputs de acompañantes (acomp2, acomp3, etc.)
  // Empezamos desde 2 porque JP y Acomp1 ya tienen sus campos fijos en el HTML
  for (let i = 2; i <= contadorAcompanantes; i++) {
    const acompInput = document.getElementById(`acomp${i}`);
    if (acompInput && !document.getElementById(`chaleco-acomp${i}`)) {
      agregarCampoChalecoAdicional(i);
    }
  }
}

function limpiarCamposChalecos() {
  // Limpiar campos de chaleco fijos
  const chalecoJP = document.getElementById("chaleco-jp");
  const chalecoAcomp1 = document.getElementById("chaleco-acomp1");
  if (chalecoJP) chalecoJP.value = "";
  if (chalecoAcomp1) chalecoAcomp1.value = "";

  // Limpiar y eliminar campos de chaleco adicionales
  const containerAdicionales = document.getElementById("chalecos-adicionales");
  if (containerAdicionales) {
    containerAdicionales.innerHTML = "";
  }
}

function agregarCampoChalecoAdicional(numeroAcompanante) {
  const container = document.getElementById("chalecos-adicionales");

  const div = document.createElement("div");
  div.className = "form-group";
  div.innerHTML = `
        <label for="chaleco-acomp${numeroAcompanante}">Chaleco - Acompañante ${numeroAcompanante}</label>
        <input type="text" id="chaleco-acomp${numeroAcompanante}" placeholder="Ej: CH-${String(numeroAcompanante + 1).padStart(3, "0")}">
    `;

  container.appendChild(div);
}

// Función para autocompletar armamento y casco al seleccionar funcionario
function autocompletarArmamento(inputId) {
  const input = document.getElementById(inputId);
  const datalist = document.getElementById("funcionarios");
  const infoBadge = document.getElementById(`${inputId}-info`);
  const valorInput = input.value;

  // Buscar si el valor coincide con algún funcionario
  const opciones = datalist.querySelectorAll("option");
  let encontrado = false;

  for (let option of opciones) {
    if (option.value === valorInput) {
      const armamento = option.getAttribute("data-armamento");
      const casco = option.getAttribute("data-casco");

      if (armamento) {
        const armamentoInput = document.getElementById(`${inputId}-armamento`);
        if (armamentoInput) armamentoInput.value = armamento;
      }

      if (casco) {
        const cascoInput = document.getElementById(`${inputId}-casco`);
        if (cascoInput) cascoInput.value = casco;
      }

      // Mostrar info en badge
      if (infoBadge) {
        infoBadge.innerHTML = `<span>🔫 ${armamento || "Sin arma"}</span> <span>🪖 ${casco || "Sin casco"}</span>`;
        infoBadge.classList.remove("hidden");
      }

      encontrado = true;
      break;
    }
  }

  if (!encontrado && infoBadge) {
    infoBadge.classList.add("hidden");
  }
}

// Función para mostrar campo de accesorios cuando se selecciona SI/NO
function mostrarCampoSerie() {
  const accesoriosSelect = document.getElementById("accesorios");
  const grupoAccesorios = document.getElementById("grupo-accesorios");

  if (accesoriosSelect.value === "SI") {
    grupoAccesorios.classList.remove("hidden");
    cargarAccesoriosDisponibles();
  } else {
    grupoAccesorios.classList.add("hidden");
  }
}

/**
 * Carga los accesorios disponibles en el select correspondiente
 */
function cargarAccesoriosDisponibles() {
  const accesorioSelect = document.getElementById("accesorio-select");
  accesorioSelect.innerHTML =
    '<option value="">Seleccionar accesorio...</option>';

  const datalist = document.getElementById("accesorios-list");
  const opciones = datalist.querySelectorAll("option");

  opciones.forEach((option) => {
    const tipo = option.getAttribute("data-tipo");
    if (tipo === "accesorio") {
      const optionSelect = document.createElement("option");
      optionSelect.value = option.value;
      optionSelect.textContent = option.value;
      accesorioSelect.appendChild(optionSelect);
    }
  });

  // Añadir opción para ingreso manual
  const manualOption = document.createElement("option");
  manualOption.value = "MANUAL";
  manualOption.textContent = "Otro (Ingreso manual)";
  accesorioSelect.appendChild(manualOption);
}

/**
 * Obtiene la serie del accesorio seleccionado
 */
function obtenerSerieDelAccesorio(valorAccesorio) {
  const datalist = document.getElementById("accesorios-list");
  const opciones = datalist.querySelectorAll("option");

  for (let option of opciones) {
    if (option.value === valorAccesorio) {
      const tipo = option.getAttribute("data-tipo");

      if (tipo === "accesorio") {
        // Intentar obtener series del data-attribute
        let series = option.getAttribute("data-series");
        if (series) {
          try {
            series = JSON.parse(series);
            return series.length > 0 ? series[0] : ""; // Tomar la primera serie
          } catch (e) {
            console.warn("Error al parsear series:", e);
          }
        }

        // Si no hay series, usar el ID como serie
        return option.getAttribute("id") || option.value;
      }
      break;
    }
  }
  return "";
}

/**
 * Función para mostrar/ocultar el campo de ingreso manual de accesorio
 */
function mostrarCampoManualAccesorio() {
  const accesorioSelect = document.getElementById("accesorio-select");
  const manualAccesorioGroup = document.getElementById(
    "manual-accesorio-group",
  );

  if (accesorioSelect.value === "MANUAL") {
    manualAccesorioGroup.classList.remove("hidden");
  } else {
    manualAccesorioGroup.classList.add("hidden");
    document.getElementById("manual-accesorio").value = "";
  }
}
