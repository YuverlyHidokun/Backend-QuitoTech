import mongoose from "mongoose";
import Producto from "../models/producto.js";
import Tienda from "../models/tienda.js";
import { v2 as cloudinary } from 'cloudinary';

const detalleProducto = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe ese producto` });
    
    const producto = await Producto.findById(id).populate('id_tienda'); // Corrige 'Nombre_producto' a 'id_tienda'
    res.status(200).json(producto);
};
const registrarProducto = async (req, res) => {
  const { id_tienda, Nombre, Categoria, Cantidad, imagenUrl, precio } = req.body;

  // Verifica que se envió un archivo
  if (!req.files || !req.files.imagen) {
    return res.status(400).json({ msg: 'La imagen es requerida' });
  }

  try {
    // Obtén el archivo enviado
    const file = req.files.imagen;

    const cloudinaryResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
      folder: 'productos',
      use_filename: true,
      unique_filename: true,
    });
    
    const producto = await Producto.create({
      Nombre,
      Categoria,
      id_tienda,
      Cantidad,
      precio,
      imagenUrl: cloudinaryResponse.secure_url, // URL para mostrar la imagen
      imagenPublicId: cloudinaryResponse.public_id, // Public ID para eliminar
    });

    res.status(201).json({
      msg: 'Producto registrado exitosamente!',
      producto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar el producto' });
  }
};
const actualizarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    // Validar ID y datos del producto
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el producto con ID ${id}` });
    // Buscar producto por ID
    const producto = await Producto.findById(id);

    if (!producto) return res.status(404).json({ msg: `Producto con ID ${id} no encontrado` });
    // Si hay una nueva imagen en la solicitud
    if (req.files && req.files.imagen) {
      // Eliminar la imagen anterior de Cloudinary si existe
      if (producto.imagenPublicId) {
        await cloudinary.uploader.destroy(producto.imagenPublicId);
      }
      // Subir la nueva imagen a Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
        folder: 'productos',
        use_filename: true,
        unique_filename: true,
      });

      // Actualizar información de la imagen en el producto
      req.body.imagenUrl = cloudinaryResponse.secure_url;
      req.body.imagenPublicId = cloudinaryResponse.public_id;
    }

    // Actualizar datos del producto
    const productoData = { ...req.body };
    await Producto.findByIdAndUpdate(id, productoData, { new: true });

    res.status(200).json({ msg: "El producto se actualizó satisfactoriamente!!!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el producto" });
  }
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe este producto` });

  const productoenreservas = await Reserva.findOne({ id_producto: id });
  const productoenfavorito = await Favorito.findOne({ id_producto: id });
  const productoencomentarios = await Comentario.findOne({ id_producto: id });
  // Si el producto está en alguna de esas colecciones, eliminamos los registros correspondientes
  if (productoenreservas) {
    await Reserva.deleteMany({ id_producto: id });
  }

  if (productoenfavorito) {
    await Favorito.deleteMany({ id_producto: id });
  }

  if (productoencomentarios) {
    await Comentario.deleteMany({ id_producto: id });
  }
  const producto = await Producto.findById(id);
  // Elimina la imagen de Cloudinary
  if (producto.imagenPublicId) {
    await cloudinary.uploader.destroy(producto.imagenPublicId);
  }

  await Producto.findByIdAndDelete(req.params.id);

  res.status(200).json({ msg: "Producto eliminado exitosamente" });
};

const cambiarEstado = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }
        producto.Estado = !producto.Estado;
        await producto.save();

        res.json({ msg: 'El estado del producto se ha modificado', Estado: producto.Estado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};
const obtenerProductos = async (req, res) => {
  try {
    // Filtrar solo los productos con Estado en true y popular los datos de la tienda
    const productos = await Producto.find({ Estado: true }).populate('id_tienda');

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos', error });
  }
};
const ProductosInactivos = async (req, res) => {
  try {
    // Filtrar solo los productos con Estado en false
    const productos = await Producto.find({ Estado: false });

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos', error });
  }
};
const listarproductosporCategoria = async (req, res) => {
  try {
      const { Categoria } = req.params;
      console.log(`Categoría recibida: ${Categoria}`);

     const categoriasValidas = ['Mandos', 'Consolas', 'Videojuegos', 'Perifericos', 'ComponentesPC', 'Otros'];

      if (!categoriasValidas.includes(Categoria)) {
          return res.status(400).json({ msg: `La categoría '${Categoria}' no existe, busque en una categoria existente!` });
      }

      const productos = await Producto.find({ Categoria, Estado:true });
      res.status(200).json({ productos });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Hubo un error en el servidor" });
      console.log(error);
  }
};//BIEN
const obtenerTodosProductos = async (req, res) => {
  try {
    // Filtrar solo los productos con Estado en true y popular los datos de la tienda
    const productos = await Producto.find().populate('id_tienda');

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener los productos', error });
 }
};//BIEN
// Exportaciones
export {
    detalleProducto,
    registrarProducto,
    actualizarProducto,
    eliminarProducto,
    cambiarEstado,
    obtenerProductos,
    ProductosInactivos,
    listarproductosporCategoria,
    obtenerTodosProductos
};
