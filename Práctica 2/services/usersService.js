import bcrypt from 'bcrypt';
import { writeUser, findUserByEmail } from "../models/usersModel.js";

/**
 * Procesa el registro de un nuevo usuario
 */
export const processForm = async (datos) => {
    const { nombre, contrasena, preguntarc, respuestarc, correo } = datos;
    const errores = {};

    // Validaciones de formato
    if (!nombre || !/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre)) {
        errores.nombre = "El nombre solo debe contener letras";
    }
    if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) {
        errores.correo = "Correo inválido";
    }
    if (!contrasena || contrasena.length < 6) {
        errores.contrasena = "La contraseña debe tener al menos 6 caracteres";
    }
    if (!respuestarc || respuestarc.length < 2) {
        errores.respuestarc = "Respuesta de seguridad inválida";
    }

    if (Object.keys(errores).length > 0) {
        return { success: false, errors: errores };
    }

    try {
        // Verificar si el usuario ya existe
        const usuarioExiste = await findUserByEmail(correo);
        if (usuarioExiste) {
            return {
                success: false,
                errors: { correo: "Este correo electrónico ya está registrado" }
            };
        }

        // Hasheo de seguridad para contraseña Y respuesta de recuperación
        const saltRounds = 12;
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);
        const respuestarcHash = await bcrypt.hash(respuestarc, saltRounds);

        const datosProcesados = {
            nombre,
            contrasena: contrasenaHash,
            preguntarc,
            respuestarc: respuestarcHash,
            correo,
            fecha: new Date().toISOString()
        };

        await writeUser(datosProcesados);
        
        // Devolvemos éxito sin datos sensibles
        return {
            success: true,
            errors: null,
            data: { nombre, correo } 
        };

    } catch (err) {
        console.error("Error en el proceso de registro:", err.message);
        return {
            success: false,
            errors: { general: "Error interno del servidor" }
        };
    }
};

/**
 * Valida las credenciales para el Login
 */
export const validateUser = async (correo, contrasena) => {
    try {
        const user = await findUserByEmail(correo);      

        if (!user) {
            return {
                success: false,
                errors: { correo: 'Usuario no encontrado' }               
            }; 
        }
        
        const match = await bcrypt.compare(contrasena, user.contrasena);
        
        if (!match) {
            return {
                success: false,
                errors: { contrasena: 'Contraseña incorrecta' }
            };
        }

        return {
            success: true,
            errors: null,
            data: { nombre: user.nombre, correo: user.correo }
        };
    } catch(err){
        console.error("Error en validateUser:", err);
        return {
            success: false,
            errors: { general: 'Error del servidor' }
        };
    }  
};

/**
 * NUEVA: Busca un usuario para recuperar contraseña
 * Reutiliza la lógica del modelo para mantener consistencia
 */
export const buscarPorCorreo = async (correo) => {
    try {
        const user = await findUserByEmail(correo);
        return user; // Devuelve el objeto usuario o null si no existe
    } catch (error) {
        console.error("Error en buscarPorCorreo:", error);
        throw error;
    }
};