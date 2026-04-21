const form = document.getElementById("loginForm");

/* helpers */
function setError(input, error, mensaje) {
  error.textContent = mensaje;
  input.classList.add("invalido");
  input.classList.remove("valido");
}

function setValido(input, error) {
  error.textContent = "";
  input.classList.add("valido");
  input.classList.remove("invalido");
}

/* validar campo */
function validarCampo(input) {
  const error = document.getElementById("error-" + input.id);

  if (input.validity.valueMissing) {
    setError(input, error, "Este campo es obligatorio");
    return false;
  }

  if (input.type === "email" && input.validity.typeMismatch) {
    setError(input, error, "Correo inválido");
    return false;
  }

  if (input.id === "contrasena" && input.value.length < 6) {
    setError(input, error, "Mínimo 6 caracteres");
    return false;
  }

  setValido(input, error);
  return true;
}

/* debounce */
function debounce(func, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/* eventos */
["correo","contrasena"].forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("blur", () => validarCampo(input));
  input.addEventListener("input", debounce(() => validarCampo(input), 300));
});

/* submit */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll("input");
  let valido = true;

  inputs.forEach(input => {
    if (!validarCampo(input)) valido = false;
  });

  if (!valido) return;

  const datos = {
    correo: document.getElementById("correo").value,
    contrasena: document.getElementById("contrasena").value
  };

  try {
    const response = await fetch("/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const resultadoServidor = await response.json();
    const nombre = resultadoServidor.data.nombre;
    const url = `/users/login/${encodeURIComponent(nombre)}`;
    console.log(url);
    window.location.href = url;

  } catch (error) {
    alert("Error al iniciar sesión");
  }
});

