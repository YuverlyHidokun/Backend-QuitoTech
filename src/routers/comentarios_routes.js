import { Router } from "express";

import {
    CrearComentario,
    ObtenerComentarios,
    ActualizarComentario,
    EliminarComentario
} from "../controllers/comentarios_controller.js";

const router =Router()


router.post('/usuario/comentario/nuevo',CrearComentario)
router.get('/usuario/comentarios/:id_producto',ObtenerComentarios)
router.put('/usuario/comentario/actualizar/:id_comentario',ActualizarComentario)
router.delete('/usuario/comentario/eliminar/:id_comentario',EliminarComentario)


export default router