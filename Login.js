document.getElementById("formularioLogin").addEventListener("submit", function(event) {

    event.preventDefault();

    var usuario = document.getElementById("usuario").value;
    var contrasena = document.getElementById("contrasena").value;
    var mensaje = document.getElementById("mensaje");

    if (usuario === "admin" && contrasena === "12345") {

        mensaje.style.color = "green";
        mensaje.textContent = "Acceso correcto. Bienvenido.";

        setTimeout(function() {
            window.location.href = "inicio.html";
        }, 1000);

    } else {

        mensaje.style.color = "red";
        mensaje.textContent = "Usuario o contraseña incorrectos.";

    }

});
