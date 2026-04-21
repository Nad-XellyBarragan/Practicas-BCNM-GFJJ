/*
   rutas a acciones correspondientes a los 
   métodos HTTP POST y GET según correspondan 
   para las peticiones al servidor.

   En estas rutas se invocan a los controladores
   que son los encargados de procesar las 
   peticiones.
*/

/*SPA -- Single Page Application */

import express from "express";
import { showFormRegister,showRecovery, showWelcome, registerUser, loginUser } from "../controllers/usersController.js";

import * as usersController from '../controllers/usersController.js';

const router = express.Router();
/*router.get("/", showFormLogin);*/
router.get("/registro", showFormRegister);
router.post("/registro", registerUser);
router.post("/login",loginUser)
router.get("/login/:name", showWelcome);
router.get("/recory", showRecovery);
router.get('/buscar-pregunta', usersController.obtenerPregunta);
router.post('/verificar-respuesta', usersController.verificarRespuesta);
router.get('/nueva-password-view', usersController.showNuevaPassword);
router.post('/actualizar-password', usersController.actualizarPassword);
router.get('/login', usersController.showFormLogin); 
// O quizás:
router.get('/formInicioS', usersController.showFormLogin);

export default router;