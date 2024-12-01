import mongoose from "mongoose";
import Producto from "../models/producto.js";
import Favorito from "../models/favoritos.js";
import UsuarioMovil from "../models/usuariomovil.js";


const registrarfavorito = async (req, res) => {
    const { id_usuario, id_producto } = req.body;

    const verificarProducto = await Producto.findById(id_producto);
    const verificarUsuario = await UsuarioMovil.findById(id_usuario);
    const verificarFavorito = await Favorito.findOne({id_usuario, id_producto})

    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    
    if(!verificarUsuario) return res.status(404).json({msg:"Lo sentimos no existe un usuario registrado"})
    
    if(verificarFavorito) return res.status(400).json({msg : "Este producto ya se encuentra en favoritos"})
    
    if(!verificarProducto) return res.status(404).json({msg:"Lo sentimos no existe un producto registrado"})
    try {
        const producto = await Favorito.create({
            id_usuario,
            id_producto,
        });
        res.status(200).json({ msg: 'Su producto favorito se registró exitosamente!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar el producto favorito' });
    }
};
const eliminarfavortio = async (req, res) => {
    const { id } = req.params;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe este producto` });

    await Favorito.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Producto eliminado exitosamente" });
};
const obtenerfavorito = async (req, res) => {
    const { id_usuario } = req.params; // Suponiendo que id_usuario se pasa como parámetro en la URL
  
    try {
      // Filtra los favoritos por id_usuario
      const favoritos = await Favorito.find( id_usuario )
      .populate({
        path: 'id_producto', // Populamos la referencia al producto
        populate: {
            path: 'id_tienda', // Populamos la tienda del producto
        }
    });
      // Si no se encuentran favoritos, respondemos con un mensaje
      if (favoritos.length === 0) {
        return res.status(404).json({ msg: 'No se encontraron favoritos para este usuario' });
      }
  
      // Responde con los favoritos, los cuales ahora contienen los detalles del producto
      res.status(200).json(favoritos);
    } catch (error) {
      res.status(500).json({ msg: 'Error al obtener los favoritos', error });
    }
  };
  
// Exportaciones
export {
    registrarfavorito,
    eliminarfavortio,
    obtenerfavorito
};
