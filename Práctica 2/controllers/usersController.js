/**
 * Encargado de procesar las peticiones
 */

import path from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt';
import fs from 'fs/promises'; // <--- ESTA LÍNEA FALTABA Y CAUSABA EL ERROR 500
// Importamos las funciones directamente del servicio
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
    const filePath = path.resolve('public', 'html', 'bienvenida.html');
    res.sendFile(filePath);
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
            return res.status(400).json({ success: false, errors: resultado.errors });
        }
        return res.status(200).json({ success: true, data: resultado.data });
    } catch (err) {
        console.error('Error en registerUser:', err.message);
        return res.status(500).json({ success: false, errors: { general: 'Error interno' } });
    }
};

export const loginUser = async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const result = await validateUser(correo, contrasena);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.errors });
        }
        return res.status(200).json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error en loginUser:', error.message);
        return res.status(500).json({ success: false, errors: { general: 'Error interno' } });
    }
};

export const obtenerPregunta = async (req, res) => {
    try {
        const { correo } = req.query; 
        if (!correo) return res.status(400).json({ success: false, message: "Correo requerido" });

        const usuario = await buscarPorCorreo(correo);

        if (usuario) {
            return res.json({ success: true, pregunta: usuario.preguntarc });
        } else {
            return res.json({ success: false, message: "Usuario no encontrado" });
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
            const match = await bcrypt.compare(respuesta, usuario.respuestarc);
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
        
        // Es más seguro usar path.join con __dirname para que encuentre el archivo siempre
        const dataPath = path.join(__dirname, '../data/users.json');
        
        const data = await fs.readFile(dataPath, 'utf-8');
        let usuarios = JSON.parse(data);

        const index = usuarios.findIndex(u => u.correo === correo);
        
        if (index !== -1) {
            const saltRounds = 12;
            const nuevoHash = await bcrypt.hash(nuevaPass, saltRounds);
            
            usuarios[index].contrasena = nuevoHash;

            await fs.writeFile(dataPath, JSON.stringify(usuarios, null, 2));
            return res.json({ success: true });
        } else {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("DETALLE DEL ERROR:", error); 
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};