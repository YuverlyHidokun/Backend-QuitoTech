import mongoose from "mongoose";
import Producto from "../models/producto.js";
import Reserva from "../models/reservas.js";
import UsuarioMovil from "../models/usuariomovil.js";
import Usuario from "../models/usuarios.js"


const registrarReserva = async (req, res) => {
    const { id_usuario, id_producto, id_propietario } = req.body;

    // Validación de campos vacíos
    if (Object.values(req.body).includes("")) 
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    try {
        const verificarUsuario = await UsuarioMovil.findById(id_usuario);
        const verificarProducto = await Producto.findById(id_producto);
        const verificarPropietario = await Usuario.findById(id_propietario);
        const reservaExistente = await Reserva.findOne({id_usuario,id_producto,id_propietario});
        console.log(id_propietario, id_usuario, id_producto)
         // Actualizar la cantidad del producto (restar 1)
        if (!verificarUsuario) return res.status(404).json({ msg: "Lo sentimos, no existe un usuario registrado" });
        if (!verificarProducto) return res.status(404).json({ msg: "Lo sentimos, no existe un producto registrado" });
        if (verificarProducto.Cantidad <= 0) return res.status(400).json({ msg: "Lo sentimos, este producto no está disponible para reservar" });
        if (!verificarPropietario) return res.status(404).json({ msg: "Lo sentimos, no existe un propietario registrado" });
        if (reservaExistente) return res.status(400).json({ msg: "Ya existe una reserva registrada con este producto, usuario y propietario" });
        const productoActualizado = await Producto.findByIdAndUpdate(
          id_producto,
          { $inc: { Cantidad: -1 } }, // Resta 1 a la cantidad
          { new: true } // Retorna el documento actualizado
        );
        if (!productoActualizado) return res.status(500).json({ msg: "Error al actualizar la cantidad del producto" });
        
        
        // Registrar la reserva con id_usuario, id_producto y id_propietario
        const nuevaReserva = await Reserva.create({
            id_usuario,
            id_producto,
            id_propietario
        });
        // Verificar si la actualización fue exitosa
        if (productoActualizado.Cantidad === 0) {
            await Producto.findByIdAndUpdate(
                id_producto,
                { Estado: false }, // Cambia el estado a false
                { new: true }
            );
        }
        res.status(200).json({ msg: 'Su producto se reservó exitosamente!', reserva: nuevaReserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al reservar el producto' });
    }
};

const eliminarReserva = async (req, res) => {
  const { id } = req.params;

  // Validación de campos vacíos
  if (Object.values(req.body).includes("")) { return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });}
  // Verificación de ID válido
  if (!mongoose.Types.ObjectId.isValid(id)) {return res.status(404).json({ msg: "Lo sentimos, no existe esta reserva" });}
  try {
      // Buscar la reserva por ID
      const reserva = await Reserva.findById(id);
      if (!reserva) {return res.status(404).json({ msg: "Reserva no encontrada" });}
      // Obtener el id_producto de la reserva para actualizar la cantidad
      const { id_producto } = reserva;
      // Eliminar la reserva
      await Reserva.findByIdAndDelete(id);
      // Actualizar la cantidad del producto (aumentar 1)
      const productoActualizado = await Producto.findByIdAndUpdate(
          id_producto,
          { $inc: { Cantidad: 1 } }, // Aumentar 1 a la cantidad
          { new: true } // Retorna el documento actualizado
      );
      if (!productoActualizado) {
          return res.status(500).json({ msg: "Error al actualizar la cantidad del producto" });
      }
      // Si la cantidad del producto es mayor a 0, establecer el estado en true
      if (productoActualizado.Cantidad > 0) {
          await Producto.findByIdAndUpdate(
              id_producto,
              { Estado: true }, // Cambia el estado a true
              { new: true }
          );
      }
      res.status(200).json({ msg: "Reserva eliminada exitosamente", producto: productoActualizado });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al eliminar la reserva" });
  }
};

const obtenerReserva = async (req, res) => {
    const { id } = req.params;
  
    // Verificamos si el usuario existe en la base de datos
    const usuarioExistente = await UsuarioMovil.findById(id);
    if (!usuarioExistente) {
      return res.status(404).json({ msg: 'El usuario no existe' });
    }
  
    try {
      // Aquí cambiamos la búsqueda a `id_usuario` para que coincida con el campo en la colección Reserva
      const reservas = await Reserva.find({ id_usuario: id })
      .populate({
        path: 'id_producto', // Poblar id_producto
        populate: {
          path: 'id_tienda', // Poblar id_tienda dentro de id_producto
        }
      })
      .populate('id_propietario'); // Poblar id_propietario de la reserva
    
      if (reservas.length === 0) {
        return res.status(404).json({ msg: 'No se encontraron reservas para este usuario' });
      }
  
      // Respondemos con todas las reservas encontradas
      res.status(200).json(reservas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error al obtener las reservas', error });
    }
};

  


// Exportaciones
export {
    registrarReserva,
    eliminarReserva,
    obtenerReserva
};
