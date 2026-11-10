
import { supabase } from "./Conexión.js";

// Obtener los elementos del formulario
const formulario = document.getElementById("formularioLogin");
const mensaje = document.getElementById("mensaje");
const boton = document.getElementById("botonEntrar");

// Detectar cuando se envía el formulario
formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Obtener los datos ingresados
    const correo = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    // Mostrar mensaje de espera
    mensaje.style.color = "black";
    mensaje.textContent = "Verificando datos...";

    boton.disabled = true;

    try {

        // Comprobar los datos con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({

            email: correo,
            password: contrasena

        });

        // Comprobar si existe algún error
        if (error) {
            throw error;
        }

        // Mostrar mensaje de acceso correcto
        mensaje.style.color = "green";
        mensaje.textContent = "¡Acceso correcto! Bienvenido al STCH.";

        // Redirigir al usuario
        setTimeout(function() {

            window.location.href = "inicio.html";

        }, 1000);

    } catch (error) {

        // Mostrar mensaje si los datos son incorrectos
        mensaje.style.color = "red";
        mensaje.textContent = "Correo o contraseña incorrectos.";

        console.error("Error de inicio de sesión:", error);

    } finally {

        // Habilitar nuevamente el botón
        boton.disabled = false;

    }

});
