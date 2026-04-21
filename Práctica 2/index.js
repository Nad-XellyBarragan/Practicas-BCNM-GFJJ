/* 
   Archivo principal que inicia el servidor.
   Responsabilidades:
     1. Configurar Express
     2. Leer variables de entorno
     3. Registrar middlewares
     4. Registrar rutas
     5. Servir archivos estáticos (assets)


  Se requiere configurar el proyecto nodeJS
  
  1. Iniciarlizar proyecto
     npm init -y ------ asigna valores por defecto en 
                 ------ la configuración de package.json

   2. Instalar dependencias para el proyecto: en este caso
      Express para el servidor HTTP para procesar peticiones
      a través de envíos POST y GET.

      npm install express
      npm install --save-dev nodemon
      npm install bcrypt
*/

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/*import dotenv from "dotenv"; // npm install dotenv*/

import usersRoutes from "./routes/usersRoutes.js";
import { get404 } from "./controllers/errorController.js"

// asigna puerto para atender peticiones
/**
 * | Rango       | Tipo        | Uso recomendado                                 |
| ----------- | ----------- | ----------------------------------------------- |
| 0-1023      | Well-known  | ❌ Reservados (HTTP=80, HTTPS=443, FTP=21, etc.) |
| 1024-49151  | Registrados | ✅ Desarrollo (3000, 4000, 5000, 8080)           |
| 49152-65535 | Dinámicos   | ✅ Temporales                                    |
 */
const PORT = 3000;

// instancia el modulo de express para configurar el servidor
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define el motor de plantillas
app.set('view engine', 'ejs');

// habilita la conversión de objetos JSON a objetos JS.
app.use(express.json());

// habilita el procesamiento de solicitudes POST/PUT
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {  
  res.sendFile(path.join(__dirname, "public/html/formInicioS.html"));
});

// asocia carpeta views para las vistas EJS
app.set('views', path.join(__dirname, 'views'));

// asocia contenido estático HTML, CSS
app.use(express.static(path.join(__dirname, "public")));

app.use("/users",usersRoutes);
// Se asocia el puerto e inicia el servidor
/**
 * app.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor corriendo");
});
 */

app.use(get404);

app.use ((err, req, res, next)=>{
   const statusCode = err.statusCode || 500;
   res.status(statusCode).json({
      status: 'error',
      message: err.message || "Algo salió mal ..."
   })
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});