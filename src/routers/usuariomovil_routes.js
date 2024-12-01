import { Router } from "express";
import verificarAutenticacion from '../middlewares/autenticacion.js'


import {
    registro,
    login,
    actualizarPassword,
    olvidoPassword,
    verificarCuenta,
    ReenviarToken
} from "../controllers/usuariomovil_controller.js";

const router =Router()



router.post('/usuario/login',login) //OK
router.post('/usuario/verificar',verificarCuenta) //OK
router.post('/usuario/retoken',ReenviarToken) //OK
router.post('/usuario/registro',registro) //OK
router.put('/usuario/nuevapassword',actualizarPassword) //OK
router.put('/usuario/recuperar',olvidoPassword) //OK


export default router