/**
 * Aquí se define la estructura de los datos,
 * en su caso mapeo de datos a una base de datos.
 * 
 * Para el caso del formulario.
 *  1. Registrar usuario
 *  2. Recuperar usuario
 *  3. Modificar contraseña
 */

import { readFile, writeFile } from 'fs/promises';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "../data/", "users.json")

export const readUsers = async () => {
  try {
    const data = await readFile(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const writeUser = async (newUser) => {
  try {
    // Leer usuarios actuales
    const data = await readFile(FILE_PATH, 'utf-8');
    const users = JSON.parse(data);

    // Agregar nuevo usuario
    users.push(newUser);

    // Guardar archivo actualizado
    await writeFile(FILE_PATH, JSON.stringify(users, null, 2));
    return users;
  } catch (error) {
    console.error('Error registrando usuario:', error);
    return null;
  }
};

export const findUserByEmail = async (email) => {
  const users = await readUsers();
  return users.find(
  ({ correo: c }) =>
    c &&
    email &&
    c.toLowerCase() === email.toLowerCase()
) || null;
};

export const existsUser = async (email) =>
  !!(await findUserByEmail(email));

