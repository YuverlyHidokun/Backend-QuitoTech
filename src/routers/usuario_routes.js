import { Router } from "express";
import verificarAutenticacion from '../middlewares/autenticacion.js'


import {
    // ! Rutas de Usuario

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

    // ! Rutas de tienda

    solicitarTienda,
    confirmarTienda,
    listarTiendas,
    listarproductosporID,
    listarproductosporCategoria,
    listarproductosIDtienda,
    listarTiendasproductos,
    obtenerTiendaDelUsuario
} from "../controllers/usuario_controller.js";

const router =Router()

// ! Rutas Usuario

router.post('/usuario/login',login) //OK
router.post('/usuario/registro',registro) //OK
router.get('/usuario/confirmar/:token',confirmEmail) //OK
router.post('/usuario/recuperar-password',recuperarPassword) //OK
router.get('/usuario/recuperar-password/:token',comprobarTokenPasword) //OK
router.post('/usuario/nuevo-password/:token',nuevoPassword) //OK
router.get('/usuario/perfil',verificarAutenticacion,perfil) //OK
router.put('/usuario/actualizaremail',verificarAutenticacion,actualizarEmail) //OK
router.put('/usuario/actualizarpassword',verificarAutenticacion,actualizarPassword) //OK
router.put('/usuario/:id',verificarAutenticacion,actualizarPerfil) //OK
router.get('/usuario/tienda/:id_usuario', obtenerTiendaDelUsuario);


// ! Rutas tienda 

router.post('/usuario/solicitud/', verificarAutenticacion,solicitarTienda) //OK
router.get('/confirmartienda/:tokentienda',confirmarTienda) //OK
router.get('/listartiendas',listarTiendas) //OK
router.get('/producto/listarproductos/:id',listarproductosporID) //OK
router.get('/productos/categoria/:Categoria',listarproductosporCategoria) //OK
router.get('/tienda/productos/:id_tienda',listarproductosIDtienda) // OK\
router.get('/listartiendasopciones',listarTiendasproductos) // OK



export default router