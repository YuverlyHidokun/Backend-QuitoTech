import mongoose from "mongoose";
import Producto from "../models/producto.js";
import Tienda from "../models/tienda.js";

const detalleProducto = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe ese producto` });
    
    const producto = await Producto.findById(id).populate('id_tienda'); // Corrige 'Nombre_producto' a 'id_tienda'
    res.status(200).json(producto);
};

const registrarProducto = async (req, res) => {
    const { id_tienda, Nombre_producto, Categoria } = req.body;

    if (!req.file) {
        return res.status(400).json({ msg: 'La imagen es requerida' });
    }

    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);

        const producto = await Producto.create({
            Nombre_producto,
            Categoria,
            id_tienda,
            imagenUrl: cloudinaryResponse.url
        });

        res.status(200).json({ msg: 'Su producto se registró exitosamente!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar el producto' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe el producto ${id}` });

    let imagenUrl = req.file ? req.file.path : undefined;
    const productoData = { ...req.body };
    if (imagenUrl) {
        productoData.imagenUrl = imagenUrl;
    }

    await Producto.findByIdAndUpdate(req.params.id, productoData);
    res.status(200).json({ msg: "El producto se actualizó satisfactoriamente!!!" });
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: `Lo sentimos, no existe este producto` });

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

// Exportaciones
export {
    detalleProducto,
    registrarProducto,
    actualizarProducto,
    eliminarProducto,
    cambiarEstado
};
