import { Router } from "express";
import {
  login,
  registro,
  actualizarEmail,
  actualizarPassword,
  recuperarPassword,
  comprobarTokenPasword,
  nuevoPassword,
  listarTiendas,
  listarproductosIDtienda,
  listarproductosporID,
  listarproductosporCategoria,
  confirmEmail,
  desactivarTienda,           // Nueva función para eliminar tiendas
  eliminarProducto,         // Nueva función para eliminar productos
  crearModerador,
  listarUsuarios,            // Nueva función para crear moderadores con permisos específicos
  //eliminarUsuario,
  listarModeradores,
  eliminarModerador,
  //crearUsuario,
  obtenerUsuariosPorMes,
  listarEstadisticas,
  obtenerUltimos10Productos,
  obtenerTiendaPorId,
  obtenerModerador,
  obtenerProductosPorMes
} from "../controllers/administrador_controller.js";

const router = Router();

// Rutas de registro y login
router.post('/registro', registro); //OK
router.get('/confirmar/:token', confirmEmail); //OK
router.post('/login', login); //OK

// Rutas de recuperación de contraseña
router.post('/recuperar-password', recuperarPassword); //ok
router.get('/recuperar-password/:token', comprobarTokenPasword); //ok
router.post('/nuevo-password/:token', nuevoPassword); //ok

// Rutas de actualización de email y password
// ! router.put('/administrador/actualizaremail', actualizarEmail);
// router.put('/administrador/actualizarpassword', actualizarPassword);

// Rutas de productos y tiendas
router.get('/administrador/listartiendas', listarTiendas);
router.get('/administrador/producto/listarproductos/:id', listarproductosporID);
router.get('/administrador/productos/categoria/:Categoria', listarproductosporCategoria);
router.get('/administrador/tienda/productos/:id_tienda', listarproductosIDtienda);
router.get('/productos/por-mes/:id_tienda', obtenerProductosPorMes);

// Rutas para eliminar tiendas y productos
router.put('/administrador/tienda/:id_tienda/desactivar', desactivarTienda); //desactivar tienda
router.delete('/administrador/producto/:id', eliminarProducto);

// Ruta para crear un moderador
router.post('/administrador/crear-moderador', crearModerador);      // Crear un moderador con permisos específicos
router.get("/administrador/moderadores", listarModeradores);
router.delete("/administrador/moderadores/:id", eliminarModerador);

router.get("/administrador/listausuarios", listarUsuarios);
// ! router.delete('/administrador/usuario/:id_usuario', eliminarUsuario);

// ! router.post("/administrador/crearusuarios", crearUsuario);

router.get("/administrador/usuarios/por-mes", obtenerUsuariosPorMes);

router.get('/administrador/estadisticas', listarEstadisticas);

router.get('/administrador/ultimos-productos', obtenerUltimos10Productos);

router.get('/administrador/tienda/:id', obtenerTiendaPorId);

router.get("/administrador/moderador/:id", obtenerModerador);

export default router;
