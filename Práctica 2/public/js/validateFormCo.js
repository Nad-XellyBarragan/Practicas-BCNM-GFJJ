// public/js/validateFormCo.js
document.getElementById("formCambiarPass").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevaPass = document.getElementById("nuevaPass").value;
    const confPass = document.getElementById("confPass").value;
    const correo = sessionStorage.getItem('correoTemporal');

    // 1. Validación de igualdad
    if (nuevaPass !== confPass) {
        alert("¡Error! Las contraseñas no coinciden.");
        return; // Detiene la ejecución, no hace el fetch
    }

    // 2. Validación de longitud mínima
    if (nuevaPass.length < 6) {
        alert("¡Error! La contraseña debe tener al menos 6 caracteres.");
        return; // Detiene la ejecución
    }

    // 3. Validación de sesión
    if (!correo) {
        alert("Sesión inválida. Regresa al formulario anterior.");
        return;
    }

    try {
        const response = await fetch('/users/actualizar-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nuevaPass })
        });

        const result = await response.json();

        if (result.success) {
            alert("Contraseña actualizada con éxito.");
            sessionStorage.removeItem('correoTemporal');
            window.location.href = "/users/formInicioS";
        } else {
            alert("Error del servidor: " + result.message);
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
});