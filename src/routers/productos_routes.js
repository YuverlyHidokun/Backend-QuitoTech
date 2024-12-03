import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    detalleProducto,
    registrarProducto,
    actualizarProducto,
    eliminarProducto,
    cambiarEstado,
    obtenerProductos,
    ProductosInactivos,
    listarproductosporCategoria,
    obtenerTodosProductos
} from "../controllers/productos_controller.js";
import verificarAutenticacion from "../middlewares/autenticacion.js";

const router = Router();

// ! verificarAutenticacion

router.post('/producto/registro', registrarProducto);
router.get('/producto/:id', detalleProducto);
router.get('/productos/enstock', obtenerProductos);
router.get('/productos/enstock/:Categoria', listarproductosporCategoria);
router.get('/productos/sinstock', ProductosInactivos);
router.put('/producto/:id',actualizarProducto);
router.put('/producto/estado/:id',cambiarEstado);
router.delete('/producto/:id',eliminarProducto);
router.get('/productos', obtenerTodosProductos);

export default router;
