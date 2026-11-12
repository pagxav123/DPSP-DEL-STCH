
/* =================================
   DATOS DE DEMOSTRACION
================================= */

// Estos recorridos son ficticios.
// No representan rutas oficiales.

const rutas = [

    {
        id: "DEMO 01",
        nombre: "Centro - Zona Plateada",

        descripcion:
            "Recorrido de demostración por algunas zonas de Pachuca.",

        paradas: [
            "centro",
            "plaza",
            "plateada",
            "parque"
        ]
    },

    {
        id: "DEMO 02",
        nombre: "Central - Hospital General",

        descripcion:
            "Recorrido de demostración entre la Central y el Hospital General.",

        paradas: [
            "central",
            "mercado",
            "centro",
            "hospital",
            "san-javier"
        ]
    },

    {
        id: "DEMO 03",
        nombre: "Zona Plateada - Central",

        descripcion:
            "Recorrido de demostración por la zona comercial y el centro.",

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
   OBTENER RECORRIDO
================================= */

// Comprueba si una ruta conecta dos paradas.
// En esta demostración los recorridos son
// bidireccionales.

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
            primeraRuta.paradas[primeraRuta.paradas.length - 1]
        );

        if (!primerRecorrido) return;

        rutas.forEach(function(segundaRuta) {

            if (primeraRuta.id === segundaRuta.id) {
                return;
            }

            // Buscar una parada compartida.

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
                RUTA DIRECTA · DEMOSTRACIÓN
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
                RUTA CON TRANSBORDO · DEMOSTRACIÓN
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

            </div>

        </article>

    `;

}


/* =================================
   REALIZAR BUSQUEDA
================================= */

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const puntoInicial = origen.value;

    const puntoFinal = destino.value;


    // Comprobar que no sean iguales.

    if (puntoInicial === puntoFinal) {

        alert("El origen y el destino no pueden ser iguales.");

        return;

    }


    // Buscar recorridos directos.

    const directas = buscarRutasDirectas(
        puntoInicial,
        puntoFinal
    );


    // Limpiar resultados anteriores.

    listaResultados.innerHTML = "";


    if (directas.length > 0) {

        resumenBusqueda.textContent =
            "Encontramos " + directas.length +
            " opción(es) de ruta directa.";


        directas.forEach(function(resultado) {

            listaResultados.innerHTML +=
                crearTarjetaDirecta(resultado);

        });

       // Mostrar el mapa de la ruta directa.
mostrarMapaDirecto(directas[0].recorrido);

    } else {

        // Si no hay rutas directas,
        // buscar opciones con transbordo.

        const transbordos = buscarTransbordos(
            puntoInicial,
            puntoFinal
        );


        if (transbordos.length > 0) {

            resumenBusqueda.textContent =
                "No encontramos una ruta directa. " +
                "Estas son las alternativas con transbordo.";


            // Mostrar máximo tres alternativas.

            transbordos.slice(0, 3).forEach(function(resultado) {

                listaResultados.innerHTML +=
                    crearTarjetaTransbordo(resultado);

            });

           // Mostrar el mapa del primer transbordo.
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


    // Mostrar sección de resultados.

    // Mostrar sección de resultados.

resultados.hidden = false;

// Actualizar el tamaño del mapa cuando ya sea visible.
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

