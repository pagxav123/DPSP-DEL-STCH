
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

    resultados.hidden = false;

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

