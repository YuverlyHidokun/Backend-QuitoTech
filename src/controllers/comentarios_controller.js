import mongoose from "mongoose";
import Producto from "../models/producto.js"
import UsuarioMovil from "../models/usuariomovil.js"
import Comentario from "../models/comentarios.js"

// Método para crear el comentario
const CrearComentario = async (req, res) => {
    const { id_producto, id_usuario, titulo, calificacion, descripcion, email } = req.body;

    // Validar si existe el producto
    const productoExistente = await Producto.findById(id_producto);
    if (!productoExistente) {
        return res.status(400).json({ msg: "El producto no existe" });
    }

    // Verificar si el usuario ya ha comentado en este producto mediante su email y el id del producto
    const comentarioExistente = await Comentario.findOne({ id_producto, email });
    if (comentarioExistente) {
        return res.status(400).json({ msg: "Ya has comentado en este producto" });
    }

    // Validar que todos los campos requeridos están presentes
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Crear el nuevo comentario
    const nuevoComentario = new Comentario({
        id_producto,
        id_usuario,
        titulo,
        email,
        calificacion,
        descripcion
    });

    // Guardar el comentario en la base de datos
    await nuevoComentario.save();

    // Calcular el nuevo promedio de calificaciones del producto usando la instancia
    const promedio = await nuevoComentario.actualizarPromedioCalificaciones();

    // Responder con un mensaje y el nuevo promedio
    res.json({ msg: 'Comentario creado y promedio actualizado', promedio });
};

// Obtener comentarios de un producto específico
const ObtenerComentarios = async (req, res) => {
    const { id_producto } = req.params;

    // Validar si el producto existe
    const productoExistente = await Producto.findById(id_producto);
    if (!productoExistente) {
        return res.status(404).json({ msg: "El producto no existe" });
    }

    // Buscar comentarios asociados al producto
    const comentarios = await Comentario.find({ id_producto });
    res.json({ comentarios });
};
// Actualizar un comentario
const ActualizarComentario = async (req, res) => {
    const { id_comentario } = req.params;
    const { titulo, calificacion, descripcion, email } = req.body;

    // Validar si el comentario existe
    const comentarioExistente = await Comentario.findById(id_comentario);
    if (!comentarioExistente) {
        return res.status(404).json({ msg: "El comentario no existe" });
    }

    // Verificar que el usuario es el propietario del comentario
    if (comentarioExistente.email !== email) {
        return res.status(403).json({ msg: "No tienes permiso para actualizar este comentario" });
    }

    // Actualizar los campos del comentario
    comentarioExistente.titulo = titulo || comentarioExistente.titulo;
    comentarioExistente.calificacion = calificacion || comentarioExistente.calificacion;
    comentarioExistente.descripcion = descripcion || comentarioExistente.descripcion;
    await comentarioExistente.save();

    // Recalcular el promedio de calificaciones del producto
    const promedio = await comentarioExistente.actualizarPromedioCalificaciones();

    res.json({ msg: 'Comentario actualizado y promedio recalculado', promedio });
};
// Eliminar un comentario
const EliminarComentario = async (req, res) => {
    const { id_comentario } = req.params;
    const { email } = req.body;

    // Validar si el comentario existe
    const comentarioExistente = await Comentario.findById(id_comentario);
    if (!comentarioExistente) {
        return res.status(404).json({ msg: "El comentario no existe" });
    }

    // Verificar que el usuario es el propietario del comentario
    if (comentarioExistente.email !== email) {
        return res.status(403).json({ msg: "No tienes permiso para eliminar este comentario" });
    }

    // Eliminar el comentario
    await comentarioExistente.deleteOne();

    // Recalcular el promedio de calificaciones del producto
    const promedio = await comentarioExistente.actualizarPromedioCalificaciones();

    res.json({ msg: 'Comentario eliminado y promedio recalculado', promedio });
};

export {
    CrearComentario,
    ObtenerComentarios,
    ActualizarComentario,
    EliminarComentario
};
