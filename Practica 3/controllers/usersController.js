/**
 * Encargado de procesar las peticiones
 */
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt';
// Ya no necesitamos fs para los usuarios, pero lo dejamos si manejas otros archivos
import { processForm, validateUser, buscarPorCorreo } from "../services/usersService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- VISTAS (GET) ---

export const showFormLogin = async (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/formInicioS.html"));
};

export const showFormRegister = async (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/formRegistro.html"));
};

export const showRecovery = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/formRecuperar.html"));
};

export const showWelcome = (req, res) => {
    res.render('pages/bienvenida', { nombre: req.query.nombre || 'Usuario' });
};

export const showNuevaPassword = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/cambiarPassword.html"));
};

// --- LÓGICA DE NEGOCIO (POST/API) ---

export const registerUser = async (req, res) => {
  const datos = req.body;
  try {
    const resultado = await processForm(datos);

    if (!resultado.success) {
      return res.status(400).json({
         success: false,
         errors: resultado.errors
      });
    }

    return res.status(200).json({
       success: true,
       errors: null,
       data: resultado.data
    });

  } catch (err) {
    console.error('Error en registerUser:', err.message);
    return res.status(500).json({
       success: false,
       errors: { general: 'Error interno del servidor' }
    });
  }
};

export const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    // 1. LLAMAMOS AL SERVICIO (Descomentado y funcional)
    const result = await validateUser(correo, contrasena);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.errors
      });
    }

    // 2. Si el login es correcto, enviamos la respuesta exitosa
    // El frontend recibirá esto y podrá redireccionar a /welcome
    return res.status(200).json({
      success: true,
      errors: null,
      data: result.data
    });

  } catch (error) {
    console.error('Error en loginUser:', error.message);
    return res.status(500).json({
      success: false,
      errors: { general: 'Error interno del servidor' }
    });
  }
};

export const obtenerPregunta = async (req, res) => {
    try {
        const { correo } = req.query; 
        if (!correo) return res.status(400).json({ success: false, message: "Correo requerido" });

        const usuario = await buscarPorCorreo(correo);

        if (usuario) {
            // Aseguramos que busque 'preguntarc' en minúsculas como en tu base de datos
            return res.json({ success: true, pregunta: usuario.preguntarc });
        } else {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error en obtenerPregunta:", error.message);
        return res.status(500).json({ success: false, message: "Error interno" });
    }
};

export const verificarRespuesta = async (req, res) => {
    try {
        const { correo, respuesta } = req.body;
        const usuario = await buscarPorCorreo(correo);

        if (usuario) {
            const hashRespuesta = usuario.respuestarc || usuario.Respuestarc;
            const match = await bcrypt.compare(respuesta, hashRespuesta);
            if (match) {
                return res.json({ success: true });
            }
        }
        return res.json({ success: false, message: "Respuesta incorrecta" });
    } catch (error) {
        console.error("Error en verificarRespuesta:", error);
        return res.status(500).json({ success: false, message: "Error al validar" });
    }
};

export const actualizarPassword = async (req, res) => {
    try {
        const { correo, nuevaPass } = req.body;
        
        // Hasheamos la nueva contraseña
        const saltRounds = 12;
        const nuevoHash = await bcrypt.hash(nuevaPass, saltRounds);

        // 3. PETICIÓN A TU API DE SQL SERVER (En lugar de fs.writeFile)
        const response = await fetch('http://localhost:5000/api/sqlserver/updatePassword', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nuevaPass: nuevoHash })
        });

        if (response.ok) {
            return res.json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: "No se pudo actualizar en la base de datos" });
        }
    } catch (error) {
        console.error("Error en actualizarPassword:", error); 
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};