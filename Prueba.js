
import { supabase } from "./Conexión.js";

// Comprobar conexión con Supabase
async function probarConexion() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.log("Error de conexión:", error.message);
    } else {
        console.log("¡Conexión con Supabase correcta!");
        console.log("Sesión:", data.session);
    }

}

probarConexion();
