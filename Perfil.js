
import { supabase } from "./Conexión.js";

// Obtener elementos
const nombre = document.getElementById("nombre");
const apellidos = document.getElementById("apellidos");
const usuario = document.getElementById("usuario");
const correo = document.getElementById("correo");
const fecha = document.getElementById("fecha");
const mensaje = document.getElementById("mensaje");

// Consultar usuario actual
async function cargarPerfil() {

    try {

        // Obtener usuario de la sesión
        const { data: { user }, error: errorUsuario } =
            await supabase.auth.getUser();

        if (errorUsuario) {
            throw errorUsuario;
        }

        // Comprobar si inició sesión
        if (!user) {
            window.location.href = "Login.html";
            return;
        }

        // Consultar sus datos en la tabla cuenta
        const { data, error } = await supabase
            .from("cuenta")
            .select("nombre, apellidos, usuario_cuenta, correo, fecha_registro")
            .eq("id", user.id)
            .single();

        if (error) {
            throw error;
        }

        // Mostrar información
        nombre.textContent = data.nombre;
        apellidos.textContent = data.apellidos;
        usuario.textContent = data.usuario_cuenta;
        correo.textContent = data.correo;

        // Formatear fecha
        if (data.fecha_registro) {

            const fechaRegistro = new Date(data.fecha_registro);

            fecha.textContent = fechaRegistro.toLocaleDateString("es-MX");

        } else {

            fecha.textContent = "No disponible";

        }

    } catch (error) {

        console.error("Error al cargar perfil:", error);

        mensaje.textContent =
            "No se pudo cargar la información del perfil.";

    }

}

// Cerrar sesión
document.getElementById("cerrarSesion")
    .addEventListener("click", async function() {

        const { error } = await supabase.auth.signOut();

        if (error) {
            mensaje.textContent = "No se pudo cerrar la sesión.";
            return;
        }

        window.location.href = "Login.html";

    });

// Ejecutar
cargarPerfil();
