const form = document.getElementById("miFormulario");
const closeModal = document.getElementById("closeModal");
const resultado = document.getElementById("resultado");

const campos = ["nombre","contrasena","concontrasena","preguntarc","respuestarc","correo"];

/* mensajes centralizados */
const mensajes = {
  nombre: "El nombre solo debe contener letras",
  contrasena: "La contraseña debe incluir entre 6 y 13 caracteres (letras y dígitos)",
  concontrasena: "La contraseña debe incluir entre 6 y 13 caracteres (letras y dígitos)",
  correo: "Correo electrónico inválido"
};

/* helper para setear error */
function setError(input, error, mensaje) {
  error.textContent = mensaje;
  input.classList.add("invalido");
  input.classList.remove("valido");
}

/* helper para éxito */
function setValido(input, error) {
  error.textContent = "";
  input.classList.add("valido");
  input.classList.remove("invalido");
}

/* validar contraseñas */
function validarPasswords() {
  const pass = document.getElementById("contrasena");
  const confirm = document.getElementById("concontrasena");
  const error = document.getElementById("error-concontrasena");

  if (!confirm.value) {
    error.textContent = "";
    return true;
  }

  if (pass.value !== confirm.value) {
    error.textContent = "✖ Las contraseñas no coinciden";
    error.style.color = "red";
    confirm.classList.add("invalido");
    return false;
  }

  error.textContent = "✔ Coinciden";
  error.style.color = "green";
  confirm.classList.remove("invalido");
  confirm.classList.add("valido");
  return true;
}
/* Condicion de pregunta de recuperacion*/
// Asegura que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    const selectPregunta = document.getElementById("preguntarc");
    const inputRespuesta = document.getElementById("respuestarc");

    // Verificamos en consola si los encontró (presiona F12 en Chrome para ver)
    console.log("Select encontrado:", selectPregunta);
    console.log("Input encontrado:", inputRespuesta);

    if (selectPregunta && inputRespuesta) {
        selectPregunta.addEventListener("change", () => {
            if (selectPregunta.value !== "") {
                inputRespuesta.disabled = false;
                inputRespuesta.placeholder = "Escribe tu respuesta";
            } else {
                inputRespuesta.disabled = true;
                inputRespuesta.value = "";
            }
        });
    }
});

/* validación general */
function validarCampo(id) {
  const input = document.getElementById(id);
  const error = document.getElementById("error-" + id);

  if (!input || !error) return true;

  /* obligatorio */
  if (input.required && input.validity.valueMissing) {
    setError(input, error, "Este campo es obligatorio");
    return false;
  }

  /* pattern */
  if (input.validity.patternMismatch) {
    setError(input, error, mensajes[id] || "Formato inválido");
    return false;
  }

  /* email */
  if (input.validity.typeMismatch) {
    setError(input, error, mensajes.correo);
    return false;
  }

  setValido(input, error);

  /* validar contraseñas SOLO cuando aplica */
  if (id === "contrasena" || id === "concontrasena") {
    return validarPasswords();
  }

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
campos.forEach(id => {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("blur", () => validarCampo(id));
  input.addEventListener("input", debounce(() => validarCampo(id), 300));
});

/* submit */
form.addEventListener("submit", async function(e) {
  e.preventDefault();

  let valido = true;

  campos.forEach(id => {
    if (!validarCampo(id)) {
      valido = false;
    }
  });

  if (!valido) return;

  const datos = Object.fromEntries(new FormData(form));

  try { 
     const response = await fetch("/users/registro", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(datos)
        });

      const responseJSON = await response.json();
    
      if (responseJSON.success){
            showModal("¡Registrado!",`Gracias ${responseJSON.data.nombre} tus datos han sido guardados con éxito`, true);
      }else{
        const msgError = responseJSON.errors.correo;
        showModal("Error",msgError, false);   
      }

   }catch (error) {
      console.error("Error en la petición:",error);
      showModal("Error","No se pudo conectar con el servidor, false");
   }   
   });      
  

closeModal.addEventListener("click", async function(e) {
  e.preventDefault();
  document.getElementById('modal').classList.remove('show'); 
});


function showModal (title, message, succes){
   const modal = document.getElementById("modal");
   const modalTitle = document.getElementById("modalTitle");
   const Modalmessage = document.getElementById("modalMessage");

  modalTitle.innerText = title;
  Modalmessage.innerText = message;

  modalTitle.style.color = succes ? "#2ecc71" : '#e74c3c';

  modal.classList.add("show");
}