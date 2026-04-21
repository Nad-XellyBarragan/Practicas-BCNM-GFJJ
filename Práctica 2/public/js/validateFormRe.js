(function() {
    const inicializar = () => {
        const btnBuscar = document.getElementById("btnBuscar");
        const inputCorreo = document.getElementById("correo");
        const selectPregunta = document.getElementById("preguntarc");
        const inputRespuesta = document.getElementById("respuestarc");
        const formRecuperar = document.getElementById("formRecuperar");

        if (!btnBuscar || !selectPregunta || !inputRespuesta || !formRecuperar) {
            console.error("ERROR: No se encontraron los elementos necesarios en el HTML.");
            return;
        }

        // --- 1. LÓGICA PARA BUSCAR EL USUARIO Y CARGAR PREGUNTA ---
        btnBuscar.addEventListener("click", async () => {
            const correo = inputCorreo.value;
            if (!correo) {
                alert("Por favor, ingresa un correo electrónico.");
                return;
            }

            try {
                const response = await fetch(`/users/buscar-pregunta?correo=${correo}`);
                const result = await response.json();

                if (result.success) {
                    selectPregunta.innerHTML = `<option value="${result.pregunta}" selected>${result.pregunta}</option>`;
                    
                    selectPregunta.disabled = false;
                    inputRespuesta.disabled = false;
                    inputRespuesta.style.backgroundColor = "white";
                    inputRespuesta.focus();
                    
                    alert("Usuario encontrado. Por favor, responde tu pregunta de seguridad.");
                } else {
                    alert(result.message || "El correo no está registrado.");
                }
            } catch (error) {
                console.error("Error al buscar usuario:", error);
                alert("Error de conexión con el servidor.");
            }
        });

        // --- 2. LÓGICA PARA VALIDAR RESPUESTA Y REDIRECCIONAR ---
        formRecuperar.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Capturamos el correo actual para guardarlo después
            const correoUsuario = inputCorreo.value;

            const datos = {
                correo: correoUsuario,
                respuesta: inputRespuesta.value
            };

            try {
                const response = await fetch('/users/verificar-respuesta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const result = await response.json();

                if (result.success) {
                    // --- ESTA ES LA CLAVE PARA EL SIGUIENTE FORMULARIO ---
                    sessionStorage.setItem('correoTemporal', correoUsuario);
                    
                    alert("¡Respuesta correcta! Serás redirigido para cambiar tu contraseña.");
                    window.location.href = "/users/nueva-password-view"; 
                } else {
                    alert(result.message || "La respuesta es incorrecta.");
                }
            } catch (error) {
                console.error("Error al validar respuesta:", error);
                alert("Hubo un error al validar los datos.");
            }
        });
    };

    // Asegurar que el DOM esté cargado antes de inicializar
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar();
    }
})();