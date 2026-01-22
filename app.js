// Cargar datos dinámicamente al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarVehiculos();
    cargarFuncionarios();
    cargarRadiales();
    cargarTiposServicio();
    cargarObservaciones();
    setFechaActual();
});

let contadorAcompanantes = 1;

async function cargarVehiculos() {
    try {
        const response = await fetch('listado_vehiculos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const vehiculos = await response.json();
        const select = document.getElementById('vehiculo');
        
        vehiculos.forEach(vehiculo => {
            const option = document.createElement('option');
            option.value = vehiculo.codigo;
            option.textContent = `${vehiculo.codigo} - ${vehiculo.PPU}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar vehículos:', error);
        // Fallback: agregar un vehículo de prueba
        const select = document.getElementById('vehiculo');
        const option = document.createElement('option');
        option.value = 'TEST';
        option.textContent = 'Error cargando vehículos (test)';
        select.appendChild(option);
    }
}

async function cargarFuncionarios() {
    try {
        const response = await fetch('listado_funcionarios.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const funcionarios = await response.json();
        const datalist = document.getElementById('funcionarios');
        
        funcionarios.forEach(funcionario => {
            const option = document.createElement('option');
            option.value = `${funcionario.grado} ${funcionario.nombre}`;
            option.setAttribute('data-armamento', funcionario.armamento || '');
            option.setAttribute('data-casco', funcionario.casco || '');
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar funcionarios:', error);
    }
}

async function cargarRadiales() {
    try {
        const response = await fetch('listado_equipamiento.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const equipos = await response.json();
        const radialesDatalist = document.getElementById('radiales');
        const accesoriosDatalist = document.getElementById('accesorios-list');
        const accesorioSelect = document.getElementById('accesorio-select');
        
        // Separar radiales y accesorios
        equipos.forEach(equipo => {
            const option = document.createElement('option');
            option.value = `${equipo.codigo} - ${equipo.descripcion}`;
            option.setAttribute('data-tipo', equipo.tipo);
            option.setAttribute('data-series', JSON.stringify(equipo.series || []));
            
            if (equipo.tipo === 'radial') {
                radialesDatalist.appendChild(option);
            } else if (equipo.tipo === 'accesorio') {
                accesoriosDatalist.appendChild(option);
                // También agregar al select de accesorios
                const optionSelect = document.createElement('option');
                optionSelect.value = `${equipo.codigo} - ${equipo.descripcion}`;
                optionSelect.setAttribute('data-tipo', equipo.tipo);
                optionSelect.setAttribute('data-series', JSON.stringify(equipo.series || []));
                accesorioSelect.appendChild(optionSelect);
            }
        });
    } catch (error) {
        console.error('Error al cargar equipos:', error);
    }
}

function setFechaActual() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    // Formatear la fecha actual en zona horaria local como YYYY-MM-DD
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    fechaInput.value = fechaFormateada;
}

function agregarAcompanante() {
    contadorAcompanantes++;
    const container = document.getElementById('acompanantes-adicionales');
    
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
        <label for="acomp${contadorAcompanantes}">Acompañante ${contadorAcompanantes}</label>
        <div class="acompanante-group">
            <div style="flex: 1;">
                <input type="text" id="acomp${contadorAcompanantes}" list="funcionarios" placeholder="Acompañante ${contadorAcompanantes}" onchange="autocompletarArmamento('acomp${contadorAcompanantes}')">
                <input type="hidden" id="acomp${contadorAcompanantes}-armamento">
                <input type="hidden" id="acomp${contadorAcompanantes}-casco">
            </div>
            <button type="button" class="btn-eliminar" onclick="eliminarAcompanante(this)">✕</button>
        </div>
    `;
    
    container.appendChild(div);
    
    // Agregar campo de chaleco si el equipamiento está en "Sí"
    if (document.getElementById('equipamiento').value === 'Sí') {
        agregarCampoChalecoAdicional(contadorAcompanantes);
    }
}

function eliminarAcompanante(boton) {
    const grupo = boton.closest('.form-group');
    const inputId = grupo.querySelector('input[type="text"]').id;
    
    // Eliminar el campo de chaleco asociado si existe
    const campoChalecoId = `chaleco-${inputId}`;
    const campoChaleco = document.getElementById(campoChalecoId);
    if (campoChaleco) {
        campoChaleco.closest('.form-group').remove();
    }
    
    grupo.remove();
}

function validarFormulario() {
    let isValid = true;
    const campos = ['fecha', 'vehiculo', 'jp', 'acomp1', 'radio', 'equipamiento', 'tipo'];
    
    // Limpiar errores anteriores
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        const errorDiv = document.getElementById(`${campo}-error`);
        if (input) {
            input.classList.remove('error');
            if (errorDiv) errorDiv.textContent = '';
        }
    });
    
    // Validar cada campo
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        const errorDiv = document.getElementById(`${campo}-error`);
        
        if (input && !input.value.trim()) {
            input.classList.add('error');
            if (errorDiv) errorDiv.textContent = 'Este campo es obligatorio';
            isValid = false;
        }
    });
    
    return isValid;
}

function enviarWhatsApp() {
    if (!validarFormulario()) {
        return;
    }
    
    const fecha = document.getElementById("fecha").value;
    const vehiculo = document.getElementById("vehiculo").value;
    const km = document.getElementById("km").value;
    const jp = document.getElementById("jp").value;
    const jpArmamento = document.getElementById("jp-armamento").value;
    const jpCasco = document.getElementById("jp-casco").value;
    const jpChaleco = document.getElementById("chaleco-jp").value;
    const acomp1 = document.getElementById("acomp1").value;
    const acomp1Armamento = document.getElementById("acomp1-armamento").value;
    const acomp1Casco = document.getElementById("acomp1-casco").value;
    const acomp1Chaleco = document.getElementById("chaleco-acomp1").value;
    const equipamiento = document.getElementById("equipamiento").value;
    const tipo = document.getElementById("tipo").value;
    const obs = document.getElementById("obs").value;
    const accesoriosSelect = document.getElementById("accesorios").value;
    const accesorioSelect = document.getElementById("accesorio-select").value;
    // Obtener la serie automáticamente del accesorio seleccionado
    const serie = accesorioSelect ? obtenerSerieDelAccesorio(accesorioSelect) : '';

    // Guardar tipo de servicio y observaciones en localStorage
    guardarTipoServicio(tipo);
    if (obs.trim()) {
        guardarObservacion(obs.trim());
    }

    // Obtener todos los acompañantes adicionales y sus armamentos, cascos y chalecos
    const acompanantes = [{
        nombre: acomp1, 
        armamento: acomp1Armamento, 
        casco: acomp1Casco,
        chaleco: acomp1Chaleco
    }];
    const inputsAdicionales = document.querySelectorAll('#acompanantes-adicionales .acompanante-group');
    inputsAdicionales.forEach((grupo, index) => {
        const nombreInput = grupo.querySelector(`input[type="text"]`);
        
        if (nombreInput && nombreInput.value.trim()) {
            const inputId = nombreInput.id; // Ej: acomp2, acomp3, etc.
            const numero = inputId.replace('acomp', '');
            const armamentoInput = document.getElementById(`${inputId}-armamento`);
            const cascoInput = document.getElementById(`${inputId}-casco`);
            const chalecoInput = document.getElementById(`chaleco-${inputId}`); // chaleco-acomp2, chaleco-acomp3, etc.
            
            acompanantes.push({
                nombre: nombreInput.value.trim(),
                armamento: armamentoInput ? armamentoInput.value : '',
                casco: cascoInput ? cascoInput.value : '',
                chaleco: chalecoInput ? chalecoInput.value : ''
            });
        }
    });

    // Construir mensaje mejorado
    let mensaje = `*SALIDA OS9*\n\n`;
    mensaje += `*Fecha:* ${fecha}\n`;
    mensaje += `*Vehículo:* ${vehiculo}\n`;
    
    if (km) {
        mensaje += `*Kilómetros:* ${km}\n`;
    }
    
    const tarjetaCombustible = document.getElementById("tarjeta-combustible").value;
    mensaje += `*Tarjeta de Combustible:* ${tarjetaCombustible}\n`;
    
    mensaje += `\n*Personal:*\n`;
    mensaje += `*Jefe de Patrulla:* ${jp}`;
    if (jpArmamento) {
        mensaje += ` - Armamento: ${jpArmamento}`;
    }
    if (jpCasco && equipamiento === 'Sí') {
        mensaje += ` - Casco: ${jpCasco}`;
    }
    if (jpChaleco && equipamiento === 'Sí') {
        mensaje += ` - Chaleco: ${jpChaleco}`;
    }
    mensaje += `\n`;
    
    acompanantes.forEach((acomp, index) => {
        const numeroAcomp = index + 1;
        mensaje += `*Acompañante ${numeroAcomp}:* ${acomp.nombre}`;
        if (acomp.armamento) {
            mensaje += ` - Armamento: ${acomp.armamento}`;
        }
        if (acomp.casco && equipamiento === 'Sí') {
            mensaje += ` - Casco: ${acomp.casco}`;
        }
        if (acomp.chaleco && equipamiento === 'Sí') {
            mensaje += ` - Chaleco: ${acomp.chaleco}`;
        }
        mensaje += `\n`;
    });
    
    mensaje += `\n*Equipo Radial:* ${document.getElementById("radio").value}\n`;
    if (accesoriosSelect === 'SI' && accesorioSelect) {
        mensaje += `*Accesorios:* ${accesorioSelect}`;
        if (serie) {
            mensaje += ` - Serie: ${serie}`;
        }
        mensaje += `\n`;
    }
    mensaje += `*Equipamiento completo:* ${equipamiento}\n`;
    
    mensaje += `*Tipo de Servicio:* ${tipo}\n`;
    
    if (obs) {
        mensaje += `\n*Observaciones:* ${obs}\n`;
    }
    
    mensaje += `\n_Sección OS9 Araucanía 2026_`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

// Funciones para manejar tipos de servicio y observaciones
function cargarTiposServicio() {
    const tipos = JSON.parse(localStorage.getItem('tiposServicio') || '[]');
    const datalist = document.getElementById('tipos-servicio');
    
    // Limpiar opciones existentes
    datalist.innerHTML = '';
    
    // Agregar tipos guardados
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        datalist.appendChild(option);
    });
}

function cargarObservaciones() {
    const observaciones = JSON.parse(localStorage.getItem('observaciones') || '[]');
    const datalist = document.getElementById('observaciones');
    
    // Limpiar opciones existentes
    datalist.innerHTML = '';
    
    // Agregar observaciones guardadas
    observaciones.forEach(obs => {
        const option = document.createElement('option');
        option.value = obs;
        datalist.appendChild(option);
    });
}

function guardarTipoServicio(tipo) {
    if (!tipo.trim()) return;
    
    let tipos = JSON.parse(localStorage.getItem('tiposServicio') || '[]');
    
    // Evitar duplicados
    if (!tipos.includes(tipo.trim())) {
        tipos.unshift(tipo.trim()); // Agregar al inicio
        
        // Mantener solo los últimos 20 tipos
        if (tipos.length > 20) {
            tipos = tipos.slice(0, 20);
        }
        
        localStorage.setItem('tiposServicio', JSON.stringify(tipos));
        cargarTiposServicio(); // Recargar el datalist
    }
}

function guardarObservacion(observacion) {
    if (!observacion.trim()) return;
    
    let observaciones = JSON.parse(localStorage.getItem('observaciones') || '[]');
    
    // Evitar duplicados
    if (!observaciones.includes(observacion.trim())) {
        observaciones.unshift(observacion.trim()); // Agregar al inicio
        
        // Mantener solo las últimas 15 observaciones
        if (observaciones.length > 15) {
            observaciones = observaciones.slice(0, 15);
        }
        
        localStorage.setItem('observaciones', JSON.stringify(observaciones));
        cargarObservaciones(); // Recargar el datalist
    }
}

// Función para mostrar/ocultar campos de equipamiento
function mostrarCamposEquipamiento() {
    const equipamiento = document.getElementById('equipamiento').value;
    const camposEquipamiento = document.getElementById('campos-equipamiento');
    const equipamientoCompleto = document.getElementById('equipamiento-completo');
    
    if (equipamiento === 'Sí' || equipamiento === 'No') {
        camposEquipamiento.style.display = 'block';
        
        if (equipamiento === 'Sí') {
            equipamientoCompleto.style.display = 'block';
            // Mostrar campos de chaleco para cada funcionario
            mostrarCamposChalecos();
        } else {
            equipamientoCompleto.style.display = 'none';
            // Limpiar campos de chaleco
            limpiarCamposChalecos();
        }
    } else {
        camposEquipamiento.style.display = 'none';
        limpiarCamposChalecos();
    }
}

function mostrarCamposChalecos() {
    // Mostrar campos de chaleco para JP y Acomp1
    document.getElementById('chaleco-jp').parentElement.style.display = 'block';
    document.getElementById('chaleco-acomp1').parentElement.style.display = 'block';
    
    // Crear campos de chaleco para acompañantes adicionales si no existen
    const inputsAdicionales = document.querySelectorAll('#acompanantes-adicionales .acompanante-group');
    inputsAdicionales.forEach((grupo) => {
        const nombreInput = grupo.querySelector(`input[type="text"]`);
        if (nombreInput) {
            const inputId = nombreInput.id; // Ej: acomp2, acomp3, etc.
            const numero = inputId.replace('acomp', '');
            const campoChalecoId = `chaleco-${inputId}`;
            
            // Verificar si el campo de chaleco ya existe
            if (!document.getElementById(campoChalecoId)) {
                agregarCampoChalecoAdicional(numero);
            } else {
                // Si existe, solo mostrarlo
                document.getElementById(campoChalecoId).parentElement.style.display = 'block';
            }
        }
    });
    
    // Mostrar campos de chaleco para acompañantes adicionales que ya existen
    const chalecosPadre = document.getElementById('chalecos-adicionales');
    const camposChalecos = chalecosPadre.querySelectorAll('.form-group');
    camposChalecos.forEach(campo => {
        campo.style.display = 'block';
    });
}

function limpiarCamposChalecos() {
    // Limpiar y ocultar campos de chaleco
    document.getElementById('chaleco-jp').value = '';
    document.getElementById('chaleco-acomp1').value = '';
    document.getElementById('chaleco-jp').parentElement.style.display = 'none';
    document.getElementById('chaleco-acomp1').parentElement.style.display = 'none';
    
    // Limpiar campos de chaleco adicionales
    const chalecosPadre = document.getElementById('chalecos-adicionales');
    const camposChalecos = chalecosPadre.querySelectorAll('.form-group');
    camposChalecos.forEach(campo => {
        const input = campo.querySelector('input');
        if (input) input.value = '';
        campo.style.display = 'none';
    });
}

function agregarCampoChalecoAdicional(numeroAcompanante) {
    const container = document.getElementById('chalecos-adicionales');
    
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
        <label for="chaleco-acomp${numeroAcompanante}">Chaleco - Acompañante ${numeroAcompanante}</label>
        <input type="text" id="chaleco-acomp${numeroAcompanante}" placeholder="Ej: CH-${String(numeroAcompanante + 1).padStart(3, '0')}">
    `;
    
    container.appendChild(div);
}

// Función para autocompletar armamento y casco al seleccionar funcionario
function autocompletarArmamento(inputId) {
    const input = document.getElementById(inputId);
    const datalist = document.getElementById('funcionarios');
    const valorInput = input.value;
    
    // Buscar si el valor coincide con algún funcionario
    const opciones = datalist.querySelectorAll('option');
    for (let option of opciones) {
        if (option.value === valorInput) {
            const armamento = option.getAttribute('data-armamento');
            const casco = option.getAttribute('data-casco');
            
            if (armamento) {
                // Poner el armamento en el campo oculto
                const armamentoInput = document.getElementById(`${inputId}-armamento`);
                if (armamentoInput) {
                    armamentoInput.value = armamento;
                }
            }
            
            if (casco) {
                // Poner el casco en el campo oculto
                const cascoInput = document.getElementById(`${inputId}-casco`);
                if (cascoInput) {
                    cascoInput.value = casco;
                }
            }
            break;
        }
    }
}

// Función para mostrar campo de accesorios cuando se selecciona SI/NO
function mostrarCampoSerie() {
    const accesoriosSelect = document.getElementById('accesorios');
    const grupoAccesorios = document.getElementById('grupo-accesorios');
    const valorSeleccionado = accesoriosSelect.value;
    
    if (!valorSeleccionado) {
        // Si no hay accesorio seleccionado, ocultar campos
        grupoAccesorios.style.display = 'none';
        return;
    }
    
    // Si se selecciona "NO", ocultar campos de accesorios
    if (valorSeleccionado === 'NO') {
        grupoAccesorios.style.display = 'none';
        return;
    }
    
    // Si se selecciona "SI", mostrar campos de accesorios
    if (valorSeleccionado === 'SI') {
        grupoAccesorios.style.display = 'block';
        cargarAccesoriosDisponibles();
    }
}

/**
 * Carga los accesorios disponibles en el select correspondiente
 */
function cargarAccesoriosDisponibles() {
    const accesorioSelect = document.getElementById('accesorio-select');
    accesorioSelect.innerHTML = '<option value="">Seleccionar accesorio...</option>';
    
    const datalist = document.getElementById('accesorios-list');
    const opciones = datalist.querySelectorAll('option');
    
    opciones.forEach(option => {
        const tipo = option.getAttribute('data-tipo');
        if (tipo === 'accesorio') {
            const optionSelect = document.createElement('option');
            optionSelect.value = option.value;
            optionSelect.textContent = option.value;
            accesorioSelect.appendChild(optionSelect);
        }
    });
}

/**
 * Obtiene la serie del accesorio seleccionado
 */
function obtenerSerieDelAccesorio(valorAccesorio) {
    const datalist = document.getElementById('accesorios-list');
    const opciones = datalist.querySelectorAll('option');
    
    for (let option of opciones) {
        if (option.value === valorAccesorio) {
            const tipo = option.getAttribute('data-tipo');
            
            if (tipo === 'accesorio') {
                // Intentar obtener series del data-attribute
                let series = option.getAttribute('data-series');
                if (series) {
                    try {
                        series = JSON.parse(series);
                        return series.length > 0 ? series[0] : ''; // Tomar la primera serie
                    } catch (e) {
                        console.warn('Error al parsear series:', e);
                    }
                }
                
                // Si no hay series, usar el ID como serie
                return option.getAttribute('id') || option.value;
            }
            break;
        }
    }
    return '';
}

/**
 * Función simplificada para actualizar cuando se selecciona un accesorio específico
 */
function actualizarCampoSerie() {
    // Esta función ya no necesita hacer nada visualmente
    // La serie se obtendrá automáticamente en enviarWhatsApp()

}
