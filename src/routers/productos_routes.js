import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    detalleProducto,
    registrarProducto,
    actualizarProducto,
    eliminarProducto,
    cambiarEstado
} from "../controllers/productos_controller.js";
import verificarAutenticacion from "../middlewares/autenticacion.js";

const router = Router();

router.post('/producto/registro', verificarAutenticacion, upload.single('image'), registrarProducto);
router.get('/producto/:id', detalleProducto);
router.put('/producto/:id', verificarAutenticacion, upload.single('image'), actualizarProducto);
router.delete('/producto/:id', verificarAutenticacion, eliminarProducto);
router.post('/producto/estado/:id', verificarAutenticacion, cambiarEstado);

export default router;
