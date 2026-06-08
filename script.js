const SUPABASE_URL = "https://pbwpiyplyycxeqjuolus.supabase.co";

const SUPABASE_KEY = "sb_publishable_Nkuu8oELp4l_nEh2v8lTYg_jQ1AiT_r";

const clienteSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
console.log(clienteSupabase);



let precios = {};
let modoVer = false;
let tipoValla = document.getElementById("tipoValla");
let altura = document.getElementById("altura");
let color = document.getElementById("color");
let contenedorEsquinas = document.getElementById("contenedorEsquinas");
let tienePuerta = document.getElementById("tienePuerta");
let contenedorPuerta = document.getElementById("contenedorPuerta");
let presupuestoEditando = null;

// ACTUALIZAR FORMULARIO
function actualizarFormulario() {
    let tipo = tipoValla.value;

    altura.innerHTML = "";
    color.innerHTML = "";

    if (tipo == "simpleTorsion") {
        altura.innerHTML += `<option value="1">1 metro</option>`;
        altura.innerHTML += `<option value="1.5">1.5 metros</option>`;
        altura.innerHTML += `<option value="2">2 metros</option>`;

        color.innerHTML += `<option value="galva">Galvanizado</option>`;
        color.innerHTML += `<option value="verde">Plastificada verde</option>`;

        contenedorEsquinas.style.display = "block";
    }

    else if (tipo == "hercules") {
        altura.innerHTML += `<option value="0.60">0.60 metros</option>`;
        altura.innerHTML += `<option value="1">1 metro</option>`;
        altura.innerHTML += `<option value="1.20">1.20 metros</option>`;
        altura.innerHTML += `<option value="1.5">1.5 metros</option>`;
        altura.innerHTML += `<option value="2">2 metros</option>`;

        color.innerHTML += `<option value="galva">Galvanizado</option>`;
        color.innerHTML += `<option value="verde">Verde</option>`;
        color.innerHTML += `<option value="blanco">Blanco</option>`;

        let anclaje = document.getElementById("anclaje");
        anclaje.innerHTML = "";
        anclaje.innerHTML += `<option value="enterrar">Enterrar</option>`;
        anclaje.innerHTML += `<option value="placa">Base de anclaje</option>`;

        contenedorEsquinas.style.display = "none";
    }
}

// MOSTRAR / OCULTAR PUERTA
function actualizarPuerta() {
    let puerta = tienePuerta.value;

    if (puerta == "si") {
        contenedorPuerta.style.display = "block";
    } else {
        contenedorPuerta.style.display = "none";
    }
}

fetch("precios.json")
    .then(respuesta => respuesta.json())
    .then(datos => {
        precios = datos;
        console.log(precios);
    });

tipoValla.addEventListener("change", actualizarFormulario);
tienePuerta.addEventListener("change", actualizarPuerta);

actualizarFormulario();
actualizarPuerta();

// CALCULAR
async function calcular() {
    document.getElementById("resultado").style.display = "block";

    let tipo = document.getElementById("tipoValla").value;
    let metros = parseFloat(document.getElementById("metros").value) || 0;
    let alturaSeleccionada = document.getElementById("altura").value;
    let colorSeleccionado = document.getElementById("color").value;
    let anclaje = document.getElementById("anclaje").value;
    let puerta = document.getElementById("tienePuerta").value;
    let clienteNombre = document.getElementById("clienteNombre").value;
    let clienteTelefono = document.getElementById("clienteTelefono").value;
    let clienteCP = document.getElementById("clienteCP").value;
    let resultado = document.getElementById("resultado");
    let numeroPresupuesto = "PRES-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 1000);

    let errores = [];

    if (metros <= 0) {
        errores.push("Los metros deben ser mayores que 0");
    }

    let esquinasInput = document.getElementById("esquinas");
    if (esquinasInput && esquinasInput.value < 0) {
        errores.push("Las esquinas no pueden ser negativas");
    }

    if (puerta == "si") {
        let anchoPuertaValor = parseFloat(document.getElementById("anchoPuerta").value);
        if (isNaN(anchoPuertaValor) || anchoPuertaValor <= 0) {
            errores.push("El ancho de puerta debe ser mayor que 0");
        }
    }

    if (clienteTelefono.length > 0 && clienteTelefono.length !== 9) {
        errores.push("El teléfono debe tener 9 dígitos");
    }

    if (clienteCP.length > 0 && clienteCP.length !== 5) {
        errores.push("El código postal debe tener 5 dígitos");
    }

    if (errores.length > 0) {
        resultado.innerHTML = `
        <div class="error">
            <h3>Corrige estos errores:</h3>
            ${errores.map(error => `<p>• ${error}</p>`).join("")}
        </div>`;
        return;
    }

    let postesPuerta = 0;
    let anchoPuerta = 0;

    if (puerta == "si") {
        anchoPuerta = parseFloat(document.getElementById("anchoPuerta").value) || 0;
        postesPuerta = 2;
    }

    // SIMPLE TORSION
    if (tipo == "simpleTorsion") {

        let materiales = [];

        let precioRolloMalla = precios.simpleTorsion.rollos[alturaSeleccionada][colorSeleccionado];
        let precioPosteNormal = precios.simpleTorsion.postesNormales[alturaSeleccionada][colorSeleccionado][anclaje];
        let precioPosteEsquina = precios.simpleTorsion.postesEsquina[alturaSeleccionada][colorSeleccionado][anclaje];
        let precioArranque = precios.simpleTorsion.arranques[alturaSeleccionada][colorSeleccionado][anclaje];
        let precioRefuerzo = precios.simpleTorsion.refuerzos[alturaSeleccionada][colorSeleccionado][anclaje];
        let precioKiloAlambre = precios.simpleTorsion.alambre.precioKilo;

        let esquinas = parseInt(document.getElementById("esquinas").value) || 0;

        let rollosMalla = Math.ceil(metros / 25);
        let kilosAlambre = (metros * 3) / 22;
        let postesEsquina = esquinas;
        let arranques = 2 + postesPuerta;
        let refuerzos = Math.floor(metros / 25);

        if (metros % 25 == 0 && metros > 0) refuerzos -= 1;
        if (refuerzos < 0) refuerzos = 0;

        let postesEspeciales = postesEsquina + arranques + refuerzos;
        let postesTotales = Math.floor(metros / 3);
        let postesNormales = postesTotales - postesEspeciales;
        if (postesNormales < 0) postesNormales = 0;

        let costeRollos = rollosMalla * precioRolloMalla;
        materiales.push({ nombre: "Rollo malla", cantidad: rollosMalla, precioUnidad: precioRolloMalla, total: costeRollos });

        let costePostesNormales = postesNormales * precioPosteNormal;
        materiales.push({ nombre: "Poste normal", cantidad: postesNormales, precioUnidad: precioPosteNormal, total: costePostesNormales });

        let costePostesEsquina = postesEsquina * precioPosteEsquina;
        materiales.push({ nombre: "Poste esquina", cantidad: postesEsquina, precioUnidad: precioPosteEsquina, total: costePostesEsquina });

        let costeArranques = arranques * precioArranque;
        materiales.push({ nombre: "Arranque", cantidad: arranques, precioUnidad: precioArranque, total: costeArranques });

        let costeRefuerzos = refuerzos * precioRefuerzo;
        materiales.push({ nombre: "Refuerzo", cantidad: refuerzos, precioUnidad: precioRefuerzo, total: costeRefuerzos });

        let costeAlambre = kilosAlambre * precioKiloAlambre;
        materiales.push({ nombre: "Alambre", cantidad: kilosAlambre.toFixed(2), precioUnidad: precioKiloAlambre, total: costeAlambre });

        let baseImponible = costeRollos + costePostesNormales + costePostesEsquina + costeArranques + costeRefuerzos + costeAlambre;
        let iva = baseImponible * 0.21;
        let totalConIva = baseImponible + iva;

        let nombreColor = colorSeleccionado === "galva" ? "Galvanizado" : "Plastificada verde";
        let nombreAnclaje = anclaje === "enterrar" ? "Enterrar" : "Bases de anclaje";
        let nombrePuerta = puerta === "si" ? anchoPuerta + " m" : "No";

        let desgloseHTML = "";
        materiales.forEach(material => {
            if (material.cantidad > 0) {
                desgloseHTML += `
                <div class="material-item">
                    <div>
                        <div class="material-nombre">${material.nombre}</div>
                        <div>${material.cantidad} x ${material.precioUnidad.toFixed(2)} €</div>
                    </div>
                    <div class="material-total">${material.total.toFixed(2)} €</div>
                </div>`;
            }
        });

        resultado.innerHTML = `
        <div class="tarjeta-resultado">
            <div class="cabecera-pdf">
                <p>Presupuesto Nº: ${numeroPresupuesto}</p>
                <div class="datos-cliente">
                    <div>
                        <span>Cliente</span>
                        <strong>${clienteNombre || "-"}</strong>
                    </div>
                    <div>
                        <span>Teléfono</span>
                        <strong>${clienteTelefono || "-"}</strong>
                    </div>
                    <div>
                        <span>CP</span>
                        <strong>${clienteCP || "-"}</strong>
                    </div>
                    <div class="empresa-pdf">
                        <h2>Vallas Heracles</h2>
                        <p>Tel: 600 000 000</p>
                        <p>Sevilla</p>
                    </div>
                </div>
                <h1>Presupuesto de Vallado</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>

            <h2>Resultado del presupuesto</h2>

            <div class="datos-grid">
                <div class="dato"><span>Tipo de valla</span><strong>Simple torsión</strong></div>
                <div class="dato"><span>Metros lineales</span><strong>${metros} m</strong></div>
                <div class="dato"><span>Altura</span><strong>${alturaSeleccionada} m</strong></div>
                <div class="dato"><span>Color</span><strong>${nombreColor}</strong></div>
                <div class="dato"><span>Anclaje</span><strong>${nombreAnclaje}</strong></div>
                <div class="dato"><span>Puerta</span><strong>${nombrePuerta}</strong></div>
            </div>

            <h3>Materiales</h3>
            <div class="tabla-materiales">${desgloseHTML}</div>

            <div class="totales">
                <div class="linea-total">
                    <span>Base imponible</span>
                    <strong>${baseImponible.toFixed(2)} €</strong>
                </div>
                <div class="linea-total">
                    <span>IVA (21%)</span>
                    <strong>${iva.toFixed(2)} €</strong>
                </div>
            </div>

            <div class="total-final">
                <span>Total presupuesto</span>
                <strong>${totalConIva.toFixed(2)} €</strong>
            </div>

            <div class="acciones-presupuesto">
                <button onclick="descargarPDF()" class="boton-pdf">Descargar PDF</button>
            </div>
        </div>`;

        if (!modoVer) {
           await guardarPresupuesto({
                numero: numeroPresupuesto,
                cliente: clienteNombre,
                telefono: clienteTelefono,
                cp: clienteCP,
                tipo: tipo,
                metros: metros,
                altura: alturaSeleccionada,
                color: colorSeleccionado,
                anclaje: anclaje,
                puerta: puerta,
                anchoPuerta: anchoPuerta,
                esquinas: esquinas,
                total: totalConIva.toFixed(2)
            });
        }

    } else if (tipo == "hercules") {

        let materiales = [];

        let precioPanel = precios.hercules.paneles[alturaSeleccionada][colorSeleccionado];
        let precioPoste = precios.hercules.postes[alturaSeleccionada][colorSeleccionado][anclaje];

        let paneles = Math.ceil(metros / 2.5);
        let postes = paneles + 1;

        if (puerta == "si") postes -= 1;

        let costePaneles = paneles * precioPanel;
        materiales.push({ nombre: "Panel Hércules", cantidad: paneles, precioUnidad: precioPanel, total: costePaneles });

        let costePostes = postes * precioPoste;
        materiales.push({ nombre: "Poste Hércules", cantidad: postes, precioUnidad: precioPoste, total: costePostes });

        let baseImponible = costePaneles + costePostes;
        let iva = baseImponible * 0.21;
        let totalConIva = baseImponible + iva;

        let nombreColor = { galva: "Galvanizado", verde: "Verde", blanco: "Blanco" }[colorSeleccionado];
        let nombreAnclaje = { enterrar: "Enterrar", placa: "Base de anclaje" }[anclaje];
        let nombrePuerta = puerta == "si" ? anchoPuerta + " m" : "No";

        let desgloseHTML = "";
        materiales.forEach(material => {
            desgloseHTML += `
            <div class="material-item">
                <div>
                    <div class="material-nombre">${material.nombre}</div>
                    <div>${material.cantidad} x ${material.precioUnidad.toFixed(2)} €</div>
                </div>
                <div class="material-total">${material.total.toFixed(2)} €</div>
            </div>`;
        });

        resultado.innerHTML = `
        <div class="tarjeta-resultado">
            <div class="cabecera-pdf">
                <div class="empresa-pdf">
                    <h2>Vallas Heracles</h2>
                    <p>Tel: 600 000 000</p>
                    <p>Sevilla</p>
                </div>
                <h1>Presupuesto de Vallado</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
            </div>

            <h2>Resultado del presupuesto</h2>

            <div class="datos-grid">
                <div class="dato"><span>Tipo de valla</span><strong>Hércules</strong></div>
                <div class="dato"><span>Metros lineales</span><strong>${metros} m</strong></div>
                <div class="dato"><span>Altura</span><strong>${alturaSeleccionada} m</strong></div>
                <div class="dato"><span>Color</span><strong>${nombreColor}</strong></div>
                <div class="dato"><span>Anclaje</span><strong>${nombreAnclaje}</strong></div>
                <div class="dato"><span>Puerta</span><strong>${nombrePuerta}</strong></div>
            </div>

            <h3>Materiales</h3>
            <div class="tabla-materiales">${desgloseHTML}</div>

            <div class="totales">
                <div class="linea-total">
                    <span>Base imponible</span>
                    <strong>${baseImponible.toFixed(2)} €</strong>
                </div>
                <div class="linea-total">
                    <span>IVA (21%)</span>
                    <strong>${iva.toFixed(2)} €</strong>
                </div>
            </div>

            <div class="total-final">
                <span>Total presupuesto</span>
                <strong>${totalConIva.toFixed(2)} €</strong>
            </div>

            <div class="acciones-presupuesto">
                <button onclick="descargarPDF()" class="boton-pdf">Descargar PDF</button>
            </div>
        </div>`;

        if (!modoVer) {
            await guardarPresupuesto({
                numero: numeroPresupuesto,
                cliente: clienteNombre,
                telefono: clienteTelefono,
                cp: clienteCP,
                tipo: tipo,
                metros: metros,
                altura: alturaSeleccionada,
                color: colorSeleccionado,
                anclaje: anclaje,
                puerta: puerta,
                anchoPuerta: anchoPuerta,
                total: totalConIva.toFixed(2)
            });
        }
    }
}

// DESCARGAR PDF
function descargarPDF() {
    let cliente = document.getElementById("clienteNombre").value.replaceAll(" ", "_");
    let numero = document.querySelector(".cabecera-pdf p").innerText.replace("Presupuesto Nº: ", "");
    document.title = numero + "-" + cliente;
    window.print();
}

// GUARDAR
async function guardarPresupuesto(datos) {
    console.log("VALOR EDITANDO:", presupuestoEditando);

    let error;

    if (presupuestoEditando) {

        const resultado = await clienteSupabase
            .from("presupuestos")
            .update(datos)
            .eq("id", presupuestoEditando);

        error = resultado.error;

    } else {

        const resultado = await clienteSupabase
            .from("presupuestos")
            .insert([datos]);

        error = resultado.error;
    }

    if (error) {
        console.log("ERROR SUPABASE:", error);
    } else {
        console.log("Guardado correctamente");
    }
}

// HISTORIAL
async function mostrarHistorial() {
    let textoBusqueda = document.getElementById("busquedaHistorial").value.toLowerCase();
    const { data: historial, error } = await clienteSupabase
    .from("presupuestos")
    .select("*");

if (error) {
    console.log(error);
    return;
}

let historialMostrar = [...historial].reverse();

    let contenedor = document.getElementById("historial");

    if (historial.length == 0) {
        contenedor.innerHTML = `
        <div class="error">
            <h3>No hay presupuestos guardados</h3>
        </div>`;
        return;
    }

    let filas = "";
    let encontrados = 0;

    historialMostrar.forEach((presupuesto, indexMostrado) => {
        let indexReal = historial.length - 1 - indexMostrado;

        let coincide =
            presupuesto.cliente.toLowerCase().includes(textoBusqueda) ||
            presupuesto.numero.toLowerCase().includes(textoBusqueda);

        if (!coincide) return;
        encontrados++;

        filas += `
        <tr>
            <td>${presupuesto.numero}</td>
            <td>${presupuesto.cliente}</td>
            <td>${presupuesto.fecha || "-"}</td>
            <td>${presupuesto.tipo == "simpleTorsion" ? "Simple torsión" : "Hércules"}</td>
            <td>${presupuesto.metros} m</td>
            <td>${presupuesto.total} €</td>
            <td>
                <div class="acciones-tabla">
                    <button onclick="verPresupuesto(${presupuesto.id})" class="boton-ver">👁</button>
                    <button onclick="eliminarPresupuesto(${presupuesto.id})" class="boton-eliminar">X</button>
                </div>
            </td>
        </tr>`;
    });

    if (encontrados == 0) {
        contenedor.innerHTML = `
        <div class="error">
            <h3>No se encontraron presupuestos</h3>
        </div>`;
        return;
    }

    contenedor.innerHTML = `
    <h2>Historial de presupuestos</h2>
    <table class="tabla-historial">
        <thead>
            <tr>
                <th>Nº</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Metros</th>
                <th>Total</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>${filas}</tbody>
    </table>`;
}

    // ELIMINAR
    async function eliminarPresupuesto(id) {

        if (!confirm("¿Seguro que quieres eliminar este presupuesto?")) return;

        const { error } = await clienteSupabase
            .from("presupuestos")
            .delete()
            .eq("id", id);

        if (error) {
            console.log(error);
            return;
        }

        mostrarHistorial();
    }

// VER
async function verPresupuesto(id) {
    presupuestoEditando = id;

console.log("EDITANDO ID:", presupuestoEditando);

    const { data: presupuesto, error } = await clienteSupabase
        .from("presupuestos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.log(error);
        return;
    }
    presupuestoEditando = id;

    document.getElementById("clienteNombre").value = presupuesto.cliente;
    document.getElementById("clienteTelefono").value = presupuesto.telefono;
    document.getElementById("clienteCP").value = presupuesto.cp;
    document.getElementById("tipoValla").value = presupuesto.tipo;
    document.getElementById("metros").value = presupuesto.metros;

    actualizarFormulario();

    document.getElementById("altura").value = presupuesto.altura;
    document.getElementById("color").value = presupuesto.color;
    document.getElementById("anclaje").value = presupuesto.anclaje;
    document.getElementById("tienePuerta").value = presupuesto.puerta;

    actualizarPuerta();

    if (presupuesto.tipo == "simpleTorsion") {
        document.getElementById("esquinas").value = presupuesto.esquinas || 0;
    }

    if (presupuesto.puerta == "si") {
        document.getElementById("anchoPuerta").value = presupuesto.anchoPuerta || 0;
    }

    modoVer = true;
    calcular();
    modoVer = false;

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
}

// NUEVO PRESUPUESTO
function nuevoPresupuesto() {
    presupuestoEditando = null;
    document.getElementById("clienteNombre").value = "";
    document.getElementById("clienteTelefono").value = "";
    document.getElementById("clienteCP").value = "";
    document.getElementById("metros").value = "";
    document.getElementById("esquinas").value = "";
    document.getElementById("anchoPuerta").value = "";

    document.getElementById("tipoValla").value = "simpleTorsion";
    document.getElementById("anclaje").value = "enterrar";
    document.getElementById("tienePuerta").value = "no";

    actualizarFormulario();
    actualizarPuerta();

    document.getElementById("resultado").style.display = "none";
    document.getElementById("resultado").innerHTML = "";

    document.getElementById("busquedaHistorial").value = "";

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
}
async function probarIA() {

const mensaje = prompt("Describe la valla");

    const respuesta = await fetch("/api/ia", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mensaje: mensaje
        })
    });

  const datos = await respuesta.json();

console.log(datos);

const presupuesto = JSON.parse(datos.respuesta);

console.log(presupuesto);

if (presupuesto.tipo) {
    document.getElementById("tipoValla").value = presupuesto.tipo;
}

if (presupuesto.metros) {
    document.getElementById("metros").value = presupuesto.metros;
}

actualizarFormulario();

setTimeout(() => {

    if (presupuesto.altura) {
        document.getElementById("altura").value = presupuesto.altura;
    }

    if (presupuesto.color) {
        document.getElementById("color").value = presupuesto.color;
    }

}, 100);

if (presupuesto.puerta) {
    document.getElementById("tienePuerta").value = presupuesto.puerta;
}

actualizarPuerta();

if (presupuesto.anchoPuerta) {
    document.getElementById("anchoPuerta").value = presupuesto.anchoPuerta;
}
}