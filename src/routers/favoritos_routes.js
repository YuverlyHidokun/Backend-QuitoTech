import { Router } from 'express';
import upload from '../middlewares/uploadMiddleware.js';
import {
    registrarfavorito,
    eliminarfavortio,
    obtenerfavorito
} from "../controllers/favoritos_controller.js";

const router = Router();


router.post('/favorito/registro', registrarfavorito);
router.get('/favoritos/:id', obtenerfavorito);
router.delete('/favorito/eliminar/:id', eliminarfavortio);

export default router;
