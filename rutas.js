
import { supabase } from "./Conexión.js";

/* =================================
   DATOS DE DEMOSTRACION
================================= */

const rutas = [

    {
        id: "RUTA 01",
        nombre: "Centro - Zona Plateada",
        descripcion: "Recorrido por algunas zonas de Pachuca.",
        paradas: [
            "centro",
            "plaza",
            "plateada",
            "parque"
        ]
    },

    {
        id: "RUTA 02",
        nombre: "Central - Hospital General",
        descripcion: "Recorrido entre la Central y el Hospital General.",
        paradas: [
            "central",
            "mercado",
            "centro",
            "hospital",
            "san-javier"
        ]
    },

    {
        id: "RUTA 03",
        nombre: "Zona Plateada - Central",
        descripcion: "Recorrido por la zona comercial y el centro.",
        paradas: [
            "plateada",
            "plaza",
            "centro",
            "mercado",
            "central"
        ]
    }

];


/* =================================
   NOMBRES DE LAS PARADAS
================================= */

const nombresParadas = {

    centro: "Centro de Pachuca",
    central: "Central de Autobuses",
    plaza: "Plaza Juárez",
    plateada: "Zona Plateada",
    hospital: "Hospital General",
    "san-javier": "San Javier",
    mercado: "Mercado Benito Juárez",
    parque: "Parque David Ben Gurión"

};


/* =================================
   COORDENADAS DE DEMOSTRACION
================================= */

const coordenadas = {

    centro: [20.1250, -98.7330],
    central: [20.1050, -98.7470],
    plaza: [20.1230, -98.7400],
    plateada: [20.1020, -98.7500],
    hospital: [20.1050, -98.7560],
    "san-javier": [20.1150, -98.7460],
    mercado: [20.1230, -98.7380],
    parque: [20.0910, -98.7480]

};


/* =================================
   CONFIGURAR MAPA
================================= */

let mapa = null;

let capasMapa = [];

function iniciarMapa() {

    if (mapa !== null) {
        return;
    }

    mapa = L.map("mapa").setView(
        [20.115, -98.745],
        13
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ).addTo(mapa);

}


/* =================================
   LIMPIAR MAPA
================================= */

function limpiarMapa() {

    capasMapa.forEach(function(capa) {
        mapa.removeLayer(capa);
    });

    capasMapa = [];

}


/* =================================
   DIBUJAR MARCADORES
================================= */

function agregarMarcador(parada, tipo) {

    const posicion = coordenadas[parada];

    let titulo = nombresParadas[parada];

    if (tipo === "inicio") {
        titulo = "ORIGEN: " + titulo;
    }

    if (tipo === "destino") {
        titulo = "DESTINO: " + titulo;
    }

    if (tipo === "transbordo") {
        titulo = "TRANSBORDO: " + titulo;
    }

    const marcador = L.marker(posicion)
        .addTo(mapa)
        .bindPopup(titulo);

    capasMapa.push(marcador);

}


/* =================================
   DIBUJAR RECORRIDO
================================= */

function dibujarTramo(paradas, color) {

    const puntos = paradas.map(function(parada) {
        return coordenadas[parada];
    });

    const linea = L.polyline(
        puntos,
        {
            color: color,
            weight: 6,
            opacity: 0.85
        }
    ).addTo(mapa);

    capasMapa.push(linea);

    return puntos;

}


/* =================================
   MOSTRAR RUTA DIRECTA EN MAPA
================================= */

function mostrarMapaDirecto(paradas) {

    iniciarMapa();

    limpiarMapa();

    const puntos = dibujarTramo(
        paradas,
        "#8b1739"
    );

    agregarMarcador(paradas[0], "inicio");

    agregarMarcador(
        paradas[paradas.length - 1],
        "destino"
    );

    mapa.fitBounds(puntos, {
        padding: [40, 40]
    });

    mapa.invalidateSize();

}


/* =================================
   MOSTRAR TRANSBORDO EN MAPA
================================= */

function mostrarMapaTransbordo(resultado) {

    iniciarMapa();

    limpiarMapa();

    const puntosPrimera = dibujarTramo(
        resultado.primerTramo,
        "#8b1739"
    );

    const puntosSegunda = dibujarTramo(
        resultado.segundoTramo,
        "#2368a0"
    );

    agregarMarcador(
        resultado.primerTramo[0],
        "inicio"
    );

    agregarMarcador(
        resultado.transbordo,
        "transbordo"
    );

    agregarMarcador(
        resultado.segundoTramo[
            resultado.segundoTramo.length - 1
        ],
        "destino"
    );

    const todosLosPuntos = [
        ...puntosPrimera,
        ...puntosSegunda
    ];

    mapa.fitBounds(todosLosPuntos, {
        padding: [40, 40]
    });

    mapa.invalidateSize();

}


/* =================================
   ELEMENTOS HTML
================================= */

const formulario = document.getElementById("formularioRutas");

const origen = document.getElementById("origen");

const destino = document.getElementById("destino");

const resultados = document.getElementById("resultados");

const listaResultados = document.getElementById("listaResultados");

const resumenBusqueda = document.getElementById("resumenBusqueda");

const catalogoRutas = document.getElementById("catalogoRutas");


/* =================================
   CONSULTAR TARIFAS EN SUPABASE
================================= */

let tarifas = [];

async function cargarTarifas() {

    const { data, error } = await supabase
        .from("tarifa")
        .select("tipo_usuario, precio");

    if (error) {

        console.error("Error al consultar tarifas:", error);

        tarifas = [];

        return false;

    }

    tarifas = data || [];

    return true;

}


/* =================================
   CONSULTAR HORARIOS EN SUPABASE
================================= */

let horarios = [];

async function cargarHorarios() {

    const { data, error } = await supabase
        .from("horario")
        .select("id_ruta, hora_inicio, hora_fin, dias_servicio");

    if (error) {

        console.error("Error al consultar horarios:", error);

        horarios = [];

        return false;

    }

    horarios = data || [];

    return true;

}


/* =================================
   FORMATEAR HORAS
================================= */

function formatearHora(horaTexto) {

    if (!horaTexto) {
        return "No disponible";
    }

    const partes = horaTexto.split(":");

    const hora = Number(partes[0]);

    const minutos = Number(partes[1] || 0);

    const periodo = hora >= 12 ? "p. m." : "a. m.";

    const hora12 = hora % 12 || 12;

    return `${hora12}:${String(minutos).padStart(2, "0")} ${periodo}`;

}


/* =================================
   MOSTRAR HORARIO DE UNA RUTA
================================= */

function crearResumenHorario(idRuta) {

    const horario = horarios.find(function(item) {

        return item.id_ruta === idRuta;

    });

    if (!horario) {

        return `
            <div class="horario-ruta">

                <h4>Horario de servicio</h4>

                <p>
                    No hay información de horarios disponible
                    para esta ruta.
                </p>

            </div>
        `;

    }

    const horaInicio = formatearHora(horario.hora_inicio);

    const horaFin = formatearHora(horario.hora_fin);

    const dias = Array.isArray(horario.dias_servicio)
        ? horario.dias_servicio.join(", ")
        : "No disponibles";

    return `

        <div class="horario-ruta">

            <div class="encabezado-horario">

                <div>
                    <span class="subtitulo-horario">
                        HORARIO DE SERVICIO
                    </span>

                    <h4>${idRuta}</h4>
                </div>

                <span class="etiqueta-horario">
                    <span class="punto-horario"></span>
                    Estimado
                </span>

            </div>

            <div class="horas-servicio">

                <div class="hora-inicio">

                    <span>Inicio del servicio</span>

                    <strong>${horaInicio}</strong>

                </div>

                <div class="hora-fin">

                    <span>Fin del servicio</span>

                    <strong>${horaFin}</strong>

                </div>

            </div>

            <div class="dias-servicio">

                <strong>Días de operación</strong>

                <p>${dias}</p>

            </div>

            <p class="nota-horario">

                Los horarios son aproximados y pueden variar
                dependiendo de las condiciones del servicio.

            </p>

        </div>

    `;

}


/* =================================
   CALCULAR Y MOSTRAR TARIFAS
================================= */

function crearResumenTarifa(numeroCombis) {

    const tarifaGeneral = tarifas.find(function(tarifa) {

        return tarifa.tipo_usuario === "General";

    });

    const tarifaAdulto = tarifas.find(function(tarifa) {

        return tarifa.tipo_usuario === "Adulto mayor";

    });

    if (!tarifaGeneral || !tarifaAdulto) {

        return `
            <div class="tarifa-ruta">
                <h4>Tarifa del recorrido</h4>
                <p>No fue posible consultar los precios.</p>
            </div>
        `;

    }

    const totalGeneral =
        Number(tarifaGeneral.precio) * numeroCombis;

    const totalAdulto =
        Number(tarifaAdulto.precio) * numeroCombis;

    return `

        <div class="tarifa-ruta">

            <div class="encabezado-tarifa">

                <div>
                    <span class="subtitulo-tarifa">
                        COSTO DEL VIAJE
                    </span>

                    <h4>Tarifa del recorrido</h4>
                </div>

                <span class="cantidad-combis">
                    ${numeroCombis}
                    ${numeroCombis === 1 ? "combi" : "combis"}
                </span>

            </div>

            <div class="opciones-tarifa">

                <div class="precio-general">

                    <span class="tipo-usuario">
                        Público general
                    </span>

                    <strong>
                        ${totalGeneral.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN"
                        })}
                    </strong>

                    <small>$12 por combi</small>

                </div>

                <div class="precio-adulto">

                    <span class="tipo-usuario">
                        Adulto mayor
                    </span>

                    <strong>
                        ${totalAdulto.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN"
                        })}
                    </strong>

                    <small>$6 por combi</small>

                </div>

            </div>

            <p class="nota-tarifa">
                El costo total depende del número de combis
                necesarias para completar el recorrido.
            </p>

        </div>

    `;

}


/* =================================
   OBTENER RECORRIDO
================================= */

function obtenerTramo(ruta, puntoInicial, puntoFinal) {

    const indiceInicial = ruta.paradas.indexOf(puntoInicial);

    const indiceFinal = ruta.paradas.indexOf(puntoFinal);

    if (indiceInicial === -1 || indiceFinal === -1) {
        return null;
    }

    if (indiceInicial < indiceFinal) {

        return ruta.paradas.slice(
            indiceInicial,
            indiceFinal + 1
        );

    }

    if (indiceInicial > indiceFinal) {

        return ruta.paradas
            .slice(indiceFinal, indiceInicial + 1)
            .reverse();

    }

    return null;

}


/* =================================
   BUSCAR RUTAS DIRECTAS
================================= */

function buscarRutasDirectas(puntoInicial, puntoFinal) {

    const resultadosDirectos = [];

    rutas.forEach(function(ruta) {

        const recorrido = obtenerTramo(
            ruta,
            puntoInicial,
            puntoFinal
        );

        if (recorrido) {

            resultadosDirectos.push({
                ruta: ruta,
                recorrido: recorrido
            });

        }

    });

    return resultadosDirectos;

}


/* =================================
   BUSCAR TRANSBORDOS
================================= */

function buscarTransbordos(puntoInicial, puntoFinal) {

    const alternativas = [];

    rutas.forEach(function(primeraRuta) {

        const primerRecorrido = obtenerTramo(
            primeraRuta,
            puntoInicial,
            primeraRuta.paradas[
                primeraRuta.paradas.length - 1
            ]
        );

        if (!primerRecorrido) return;

        rutas.forEach(function(segundaRuta) {

            if (primeraRuta.id === segundaRuta.id) {
                return;
            }

            const paradasCompartidas = primeraRuta.paradas.filter(
                function(parada) {

                    return segundaRuta.paradas.includes(parada);

                }
            );

            paradasCompartidas.forEach(function(transbordo) {

                const primerTramo = obtenerTramo(
                    primeraRuta,
                    puntoInicial,
                    transbordo
                );

                const segundoTramo = obtenerTramo(
                    segundaRuta,
                    transbordo,
                    puntoFinal
                );

                if (primerTramo && segundoTramo) {

                    alternativas.push({

                        primeraRuta: primeraRuta,

                        segundaRuta: segundaRuta,

                        primerTramo: primerTramo,

                        segundoTramo: segundoTramo,

                        transbordo: transbordo

                    });

                }

            });

        });

    });

    return alternativas;

}


/* =================================
   MOSTRAR PARADAS
================================= */

function crearListaParadas(paradas) {

    let contenido = "";

    paradas.forEach(function(parada, indice) {

        let etiqueta = "";

        if (indice === 0) {

            etiqueta = "<strong>Abordar aquí:</strong> ";

        } else if (indice === paradas.length - 1) {

            etiqueta = "<strong>Bajar aquí:</strong> ";

        }

        contenido += `
            <li>
                ${etiqueta}${nombresParadas[parada]}
            </li>
        `;

    });

    return `
        <ul class="lista-paradas">
            ${contenido}
        </ul>
    `;

}


/* =================================
   CREAR TARJETA DE RUTA DIRECTA
================================= */

function crearTarjetaDirecta(resultado) {

    const ruta = resultado.ruta;

    const recorrido = resultado.recorrido;

    return `

        <article class="tarjeta-resultado">

            <span class="tipo-ruta">
                RUTA DIRECTA
            </span>

            <h3>${ruta.id} - ${ruta.nombre}</h3>

            <p class="descripcion-ruta">
                ${ruta.descripcion}
            </p>

            <div class="datos-ruta">

                <div class="dato">

                    <strong>Origen</strong>

                    <span>
                        ${nombresParadas[recorrido[0]]}
                    </span>

                </div>

                <div class="dato">

                    <strong>Destino</strong>

                    <span>
                        ${nombresParadas[recorrido[recorrido.length - 1]]}
                    </span>

                </div>

            </div>

            <div class="recorrido">

                <h4>Recorrido y paradas</h4>

                ${crearListaParadas(recorrido)}

            </div>

            ${crearResumenHorario(ruta.id)}

            ${crearResumenTarifa(1)}

        </article>

    `;

}


/* =================================
   CREAR TARJETA CON TRANSBORDO
================================= */

function crearTarjetaTransbordo(resultado) {

    return `

        <article class="tarjeta-resultado">

            <span class="tipo-ruta">
                RUTA CON TRANSBORDO
            </span>

            <h3>
                ${resultado.primeraRuta.id}
                +
                ${resultado.segundaRuta.id}
            </h3>

            <p class="descripcion-ruta">
                Necesitas utilizar dos recorridos
                para llegar a tu destino.
            </p>

            <div class="tramo">

                <h4>
                    Primera combi:
                    ${resultado.primeraRuta.nombre}
                </h4>

                ${crearListaParadas(resultado.primerTramo)}

                ${crearResumenHorario(resultado.primeraRuta.id)}

            </div>

            <div class="transbordo">

                <strong>🔄 Realizar transbordo</strong>

                <p>
                    Baja de la primera combi en:
                    <strong>
                        ${nombresParadas[resultado.transbordo]}
                    </strong>
                </p>

                <p>
                    Desde ese punto debes abordar
                    la segunda combi.
                </p>

            </div>

            <div class="tramo">

                <h4>
                    Segunda combi:
                    ${resultado.segundaRuta.nombre}
                </h4>

                ${crearListaParadas(resultado.segundoTramo)}

                ${crearResumenHorario(resultado.segundaRuta.id)}

            </div>

            ${crearResumenTarifa(2)}

        </article>

    `;

}


/* =================================
   REALIZAR BUSQUEDA
================================= */

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const puntoInicial = origen.value;

    const puntoFinal = destino.value;

    if (puntoInicial === puntoFinal) {

        alert("El origen y el destino no pueden ser iguales.");

        return;

    }

    // Consultar tarifas y horarios.

    const [tarifasDisponibles] = await Promise.all([

        cargarTarifas(),

        cargarHorarios()

    ]);

    if (!tarifasDisponibles) {

        alert("No se pudieron consultar las tarifas. Intenta nuevamente.");

        return;

    }

    // Buscar recorridos directos.

    const directas = buscarRutasDirectas(
        puntoInicial,
        puntoFinal
    );

    listaResultados.innerHTML = "";

    if (directas.length > 0) {

        resumenBusqueda.textContent =
            "Encontramos " + directas.length +
            " opción(es) de ruta directa.";

        directas.forEach(function(resultado) {

            listaResultados.innerHTML +=
                crearTarjetaDirecta(resultado);

        });

        mostrarMapaDirecto(directas[0].recorrido);

    } else {

        const transbordos = buscarTransbordos(
            puntoInicial,
            puntoFinal
        );

        if (transbordos.length > 0) {

            resumenBusqueda.textContent =
                "No encontramos una ruta directa. " +
                "Estas son las alternativas con transbordo.";

            transbordos.slice(0, 3).forEach(function(resultado) {

                listaResultados.innerHTML +=
                    crearTarjetaTransbordo(resultado);

            });

            mostrarMapaTransbordo(transbordos[0]);

        } else {

            resumenBusqueda.textContent =
                "No se encontraron recorridos disponibles.";

            listaResultados.innerHTML = `

                <div class="sin-resultados">

                    <h3>Sin rutas disponibles</h3>

                    <p>
                        No encontramos una combinación
                        de recorridos para los puntos seleccionados.
                    </p>

                    <p>
                        Intenta seleccionar otro origen o destino.
                    </p>

                </div>

            `;

        }

    }

    resultados.hidden = false;

    if (mapa !== null) {

        setTimeout(function() {

            mapa.invalidateSize();

        }, 200);

    }

    resultados.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

});


/* =================================
   MOSTRAR CATALOGO DE RUTAS
================================= */

function mostrarCatalogo() {

    rutas.forEach(function(ruta) {

        const tarjeta = document.createElement("article");

        tarjeta.className = "tarjeta-ruta";

        tarjeta.innerHTML = `

            <span class="numero-ruta">
                ${ruta.id}
            </span>

            <h3>
                ${ruta.nombre}
            </h3>

            <p>
                ${ruta.descripcion}
            </p>

            <div class="paradas-resumen">

                <strong>Paradas del recorrido:</strong>

                ${ruta.paradas.map(function(parada) {

                    return nombresParadas[parada];

                }).join(" → ")}

            </div>

        `;

        catalogoRutas.appendChild(tarjeta);

    });

}


// Ejecutar el catálogo al cargar la página.

mostrarCatalogo();
