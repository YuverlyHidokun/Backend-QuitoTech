import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    registrarReserva,
    eliminarReserva,
    obtenerReserva
} from "../controllers/reservas_controller.js";

const router = Router();


router.post('/reserva/registro', registrarReserva );
router.get('/reserva/:id', obtenerReserva);
router.delete('/reserva/eliminar/:id', eliminarReserva);

export default router;
