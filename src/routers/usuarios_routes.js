import { Router } from "express";
import verificarAutenticacion from '../middlewares/autenticacion.js'


import {
    // ! Rutas de propietario

    login,
    perfil,
    registro,
    confirmEmail,
    actualizarPerfil,
    actualizarEmail,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword,
    updateEmail,

    // ! Rutas de tienda

    solicitarTienda,
    confirmarTienda,
    listarTiendas,
    listarTiendasproductos,
    obtenerTiendaDelpropietario,
    obtenerTiendaConProductos,
} from "../controllers/usuario_controller.js";

const router =Router()

// ! Rutas propietario

router.post('/propietario/login',login) //OK
router.post('/propietario/registro',registro) //OK
router.get('/propietario/confirmar/:token',confirmEmail) //OK
router.get('/propietario/actualizar/:token',updateEmail) //OK
router.post('/propietario/recuperar-password',recuperarPassword) //OK
router.get('/propietario/recuperar-password/:token',comprobarTokenPasword) //OK
router.post('/propietario/nuevo-password/:token',nuevoPassword) //OK
// ! verificarAutenticacion
router.get('/propietario/perfil',perfil) //OK
router.put('/propietario/actualizaremail',actualizarEmail) //OK
router.put('/propietario/actualizarpassword',actualizarPassword) //OK
router.put('/propietario/:id',actualizarPerfil) //OK
router.get('/propietario/tienda/:id_propietario', obtenerTiendaDelpropietario);

// ! Rutas tienda 
// ! verificarAutenticacion post
router.post('/propietario/solicitud/',solicitarTienda) //OK
router.get('/confirmartienda/:token',confirmarTienda) //OK
router.get('/listartiendas',listarTiendas) //OK
router.get('/tienda/:id',obtenerTiendaConProductos) //OK
router.get('/listartiendasopciones',listarTiendasproductos) // OK



export default router