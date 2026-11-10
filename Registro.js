
import { supabase } from "./Conexión.js";

// Obtener elementos del formulario
const formulario = document.getElementById("formularioRegistro");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("botonRegistro");

// Detectar el envío del formulario
formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Obtener los datos ingresados
    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmar = document.getElementById("confirmar").value;

    // Verificar que las contraseñas coincidan
    if (contrasena !== confirmar) {
        mensaje.style.color = "red";
        mensaje.textContent = "Las contraseñas no coinciden.";
        return;
    }

    mensaje.style.color = "black";
    mensaje.textContent = "Registrando cuenta...";
    boton.disabled = true;

    try {

        // Registrar usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({

            email: correo,
            password: contrasena,

            options: {
                data: {
                    Nombre: nombre,
                    Apellidos: apellidos,
                    Usuario_cuenta: usuario
                }
            }

        });

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error("No se pudo crear el usuario.");
        }

        mensaje.style.color = "green";

        if (data.session) {
            mensaje.textContent =
                "¡Cuenta creada correctamente! Ahora puedes iniciar sesión.";
        } else {
            mensaje.textContent =
                "Cuenta creada. Revisa tu correo para confirmar el registro.";
        }

        formulario.reset();

    } catch (error) {

        mensaje.style.color = "red";
        mensaje.textContent = "Error al registrar: " + error.message;

        console.error("Error de registro:", error);

    } finally {

        boton.disabled = false;

    }

});
