import Administrador from "../models/administrador.js";
import Moderador from "../models/moderador.js"; // Asegúrate de que tienes un modelo de Moderador si es necesario
import { sendMailToUser, sendMailToRecoveryPasswordAd } from "../config/nodemailer.js";
import generarJWT from "../helpers/crearJWT.js";
import mongoose from "mongoose";
import Tienda from "../models/tienda.js";
import Producto from "../models/producto.js";
import usuario from "../models/usuario.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  // Validar que todos los campos estén completos
  if (!email || !password) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    let user = null;
    let role = null;

    // Buscar administrador
    const administrador = await Administrador.findOne({ email });
    if (administrador) {
      const verificarPassword = await administrador.matchPassword(password);
      if (!verificarPassword) {
        console.log("Contraseña incorrecta para administrador");
        return res.status(401).json({ msg: "Contraseña incorrecta" });
      }
      user = administrador;
      role = "administrador";
    }

    // Buscar moderador si no es administrador
    if (!user) {
      const moderador = await Moderador.findOne({ email });
      if (moderador) {
        const verificarPassword = await moderador.matchPassword(password);
        if (!verificarPassword) {
          console.log("Contraseña incorrecta para moderador");
          return res.status(401).json({ msg: "Contraseña incorrecta" });
        }
        user = moderador;
        role = "moderador";
      }
    }

    // Si no se encuentra el usuario (ni administrador ni moderador)
    if (!user) {
      console.log("Correo no registrado");
      return res.status(404).json({ msg: "El correo no está registrado" });
    }

    // Generar token y devolver respuesta
    const token = generarJWT(user._id, role);
    console.log("Usuario autenticado con éxito:", { id: user._id, role });

    return res.status(200).json({
      token,
      id_usuario: user._id,
      email: user.email,
      role,
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};


const registro = async (req, res) => {
  const { email, password } = req.body;
  if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

  const verificarEmailBDD = await Administrador.findOne({ email });
  if (verificarEmailBDD) return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });

  const nuevoAdministrador = new Administrador(req.body);
  nuevoAdministrador.password = await nuevoAdministrador.encrypPassword(password);
  nuevoAdministrador.crearToken();
  await nuevoAdministrador.save();

  const token = nuevoAdministrador.crearToken();
  await sendMailToUser(email, token);
  await nuevoAdministrador.save();
  res.status(200).json({ msg: "Revisa tu correo electrónico para confirmar tu cuenta" });
};

const actualizarPassword = async (req, res) => {
  const AdministradorBDD = await Administrador.findById(req.AdministradorBDD._id);
  if (!AdministradorBDD) return res.status(404).json({ msg: `Lo sentimos, id de administrador no proporcionado` });

  const verificarPassword = await AdministradorBDD.matchPassword(req.body.passwordactual);
  if (!verificarPassword) return res.status(404).json({ msg: "Lo sentimos, el password actual no es el correcto" });

  AdministradorBDD.password = await AdministradorBDD.encrypPassword(req.body.passwordnuevo);
  await AdministradorBDD.save();
  res.status(200).json({ msg: "Password actualizado correctamente" });
};

const recuperarPassword = async (req, res) => {
  const { email } = req.body;
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

  const AdministradorBDD = await Administrador.findOne({ email });
  if (!AdministradorBDD) return res.status(404).json({ msg: "Lo sentimos, no se encuentra registrado" });

  const token = AdministradorBDD.crearToken();
  AdministradorBDD.token = token;
  await sendMailToRecoveryPasswordAd(email, token);
  await AdministradorBDD.save();
  res.status(200).json({ msg: "Revisa tu correo electrónico para restablecer tu cuenta" });
};

const comprobarTokenPasword = async (req, res) => {
  if (!(req.params.token)) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });

  const AdministradorBDD = await Administrador.findOne({ token: req.params.token });
  if (AdministradorBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });

  await AdministradorBDD.save();
  res.status(200).json({ msg: "Token confirmado, ya puedes crear tu nuevo password" });
};

const nuevoPassword = async (req, res) => {
  const { password, confirmpassword } = req.body;
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
  if (password !== confirmpassword) return res.status(404).json({ msg: "Lo sentimos, los passwords no coinciden" });

  const AdministradorBDD = await Administrador.findOne({ token: req.params.token });
  if (AdministradorBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });

  AdministradorBDD.token = null;
  AdministradorBDD.password = await AdministradorBDD.encrypPassword(password);
  await AdministradorBDD.save();
  res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo password" });
};

const actualizarEmail = async (req, res) => {
  const { email } = req.body;
  if (Object.values(req.body).includes("")) return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });

  const verifyemailUser = await Administrador.findOne({ email });
  if (verifyemailUser?.email) return res.status(409).json({ msg: "Lo sentimos, el email ya está registrado" });

  const newAdBDD = await Administrador.findOne(req.AdministradorBDD._id);
  newAdBDD.email = email;
  await newAdBDD.save();
  res.status(200).json({ msg: "Felicitaciones, ya puedes iniciar sesión con tu nuevo email" });
};

// * Función para crear un Moderador

const crearModerador = async (req, res) => {
  try {
    // Verificar que todos los campos estén completos
    const requiredFields = ["email", "password", "nombre", "role", "pais", "telefono", "direccion", "usuario"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ msg: `El campo ${field} es obligatorio` });
      }
    }

    const { email, password, nombre, role, pais, telefono, direccion, usuario } = req.body;

    // Verificar si ya existe un moderador con ese correo
    const moderadorExistente = await Moderador.findOne({ email });
    if (moderadorExistente) {
      return res.status(400).json({ msg: "Ya existe un moderador con este correo" });
    }

    // Crear el nuevo moderador
    const nuevoModerador = new Moderador({ email, password, nombre, role, pais, telefono, direccion, usuario });

    // Asegurarse de que la contraseña está definida antes de encriptarla
    nuevoModerador.password = await nuevoModerador.encrypPassword(password);

    // Guardar el moderador
    await nuevoModerador.save();

    res.status(200).json({ msg: "Moderador creado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al crear el moderador", error: error.message });
  }
};




// * Rutas relacionadas con Tiendas y Productos
const listarTiendas = async (req, res) => {
  const tiendas = await Tienda.find({ Verificado: true }).where('Tienda').equals(req.TiendaBDD).select("-salida -createdAt -updatedAt -__v").populate('Nombre_tienda Direccion');
  res.status(200).json(tiendas);
};

// Controlador - administrador_controller.js
const listarproductosIDtienda = async (req, res) => {
  const { id_tienda } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id_tienda)) {
      return res.status(400).json({ msg: "ID de tienda no válido" });
    }

    const productos = await Producto.find({ id_tienda })
      .select("-salida -createdAt -updatedAt -__v")
      .populate('id_tienda', 'Nombre_tienda')
      .populate('Nombre_producto Categoria');

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error en el servidor", error: error.message });
  }
};


const listarproductosporID = async (req, res) => {
  const { id } = req.params;
  try {
    const productos = await Producto.find({ id })
      .select("-salida -createdAt -updatedAt -__v")
      .populate('id_tienda', 'id Nombre_producto Categoria');

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error en el servidor" });
  }
};

const listarproductosporCategoria = async (req, res) => {
  try {
    const { Categoria } = req.params;
    const categoriasValidas = ['Mandos', 'Consolas', 'Videojuegos', 'Perifericos', 'ComponentesPC', 'Otros'];

    if (!categoriasValidas.includes(Categoria)) {
      return res.status(400).json({ msg: `La categoría '${Categoria}' no existe, busque en una categoría existente!` });
    }

    const productos = await Producto.find({ Categoria });
    res.status(200).json({ productos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error en el servidor" });
  }
};

const confirmEmail = async (req, res) => {
  if (!(req.params.token)) return res.status(400).json({ msg: "Lo sentimos, no se puede validar la cuenta" });

  const administradorBDD = await Administrador.findOne({ token: req.params.token });
  if (!administradorBDD?.token) return res.status(400).json({ msg: "No existe ningún token válido" });

  administradorBDD.token = null;
  await administradorBDD.save();
  res.status(200).json({ msg: "Email confirmado con éxito!" });
};

// * Eliminar Tienda
const desactivarTienda = async (req, res) => {
  const { id_tienda } = req.params;
  
  try {
    // Buscamos la tienda por su ID y actualizamos el campo "verificado" a false
    const tienda = await Tienda.findByIdAndUpdate(
      id_tienda,
      { Verificado: false }, // Actualizamos el campo "verificado" a false
      { new: true } // Devuelve el documento actualizado
    );

    if (!tienda) {
      return res.status(404).json({ msg: "Tienda no encontrada" });
    }

    res.status(200).json({ msg: "Tienda desactivada correctamente", tienda });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al desactivar la tienda" });
  }
};


// * Eliminar Producto
const eliminarProducto = async (req, res) => {
  const { id } = req.params;  // Asegúrate de que el nombre del parámetro coincide con el de la ruta

  try {
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });

    await producto.deleteOne();  // Utiliza deleteOne en lugar de remove
    res.status(200).json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al eliminar el producto" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    // Recuperar todos los usuarios
    const usuarios = await usuario.find()
      .select("-password -token -createdAt -updatedAt -__v"); // Excluir campos sensibles

    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al listar los usuarios" });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
      const { id_usuario } = req.params;
      if (!id_usuario) {
          return res.status(400).json({ msg: 'El ID del usuario es requerido' });
      }

      const usuarioExistente = await usuario.findById(id_usuario);
      if (!usuarioExistente) {
          return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      await usuarioExistente.deleteOne();
      res.status(200).json({ msg: 'Usuario eliminado correctamente' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Hubo un error al eliminar el usuario' });
  }
};

const listarModeradores = async (req, res) => {
  try {
    const moderadores = await Moderador.find()
      .select("-password -token -createdAt -updatedAt -__v"); // Excluir campos sensibles
    res.status(200).json(moderadores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al listar los moderadores" });
  }
};

const eliminarModerador = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de moderador no válido" });
    }

    // Buscar y eliminar el moderador
    const moderador = await Moderador.findByIdAndDelete(id);
    if (!moderador) return res.status(404).json({ msg: "Moderador no encontrado" });

    res.status(200).json({ msg: "Moderador eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al eliminar el moderador" });
  }
};

const crearUsuario = async (req, res) => {
  try {
    // Validar campos requeridos
    const requiredFields = ["nombre", "apellido", "email", "password"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ msg: `El campo ${field} es obligatorio` });
      }
    }

    const { nombre, apellido, email, password } = req.body;

    // Verificar si el correo ya está registrado
    const usuarioExistente = await usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: "El email ya está registrado" });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new usuario({
      nombre,
      apellido,
      email,
      password: await usuario.prototype.encrypPassword(password),
    });

    // Generar token para confirmar el correo
    const token = nuevoUsuario.crearToken();

    // Guardar usuario en la base de datos
    await nuevoUsuario.save();

    // Retornar respuesta exitosa
    res.status(201).json({
      msg: "Usuario creado exitosamente. Revisa tu correo para confirmar tu cuenta.",
      usuario: {
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        confirmEmail: nuevoUsuario.confirmEmail,
        propietario: nuevoUsuario.propietario,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al crear el usuario", error: error.message });
  }
};

const obtenerUsuariosPorMes = async (req, res) => {
  try {
    const usuariosPorMes = await usuario.aggregate([
      {
        $group: {
          _id: {
            año: { $year: "$createdAt" },
            mes: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.año": 1, "_id.mes": 1 }
      },
      {
        $project: {
          _id: 0,
          año: "$_id.año",
          mes: "$_id.mes", // Devolvemos el número del mes para convertirlo en el frontend
          total: 1
        }
      }
    ]);

    res.status(200).json(usuariosPorMes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al obtener los usuarios por mes", error: error.message });
  }
};


const listarEstadisticas = async (req, res) => {
  try {
    // Contar todos los usuarios que no son moderadores
    const cantidadUsuarios = await usuario.countDocuments({ moderador: { $ne: true } });

    // Contar todos los usuarios que son propietarios (es decir, tienen tienda)
    const cantidadUsuariosPropietarios = await usuario.countDocuments({ propietario: true });

    // Contar todas las tiendas registradas (documentos en la colección 'tiendas')
    const cantidadTiendasRegistradas = await Tienda.countDocuments();  // Aquí contamos las tiendas

    // Contar todos los productos en total
    const cantidadProductos = await Producto.countDocuments();

    // Devolver las estadísticas
    res.status(200).json({
      cantidadUsuarios,
      cantidadUsuariosPropietarios,
      cantidadTiendasRegistradas,  // Esta línea cuenta las tiendas registradas
      cantidadProductos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error en el servidor", error: error.message });
  }
};

// Función para obtener los últimos 10 productos registrados
const obtenerUltimos10Productos = async (req, res) => {
  try {
    // Obtener los últimos 10 productos ordenados por fecha de creación descendente
    const productos = await Producto.find()
      .sort({ createdAt: -1 }) // Ordenar de más reciente a más antiguo
      .limit(10) // Limitar a los últimos 10 productos
      .select("-salida -createdAt -updatedAt -__v") // Excluir campos innecesarios
      .populate('id_tienda', 'Nombre_tienda') // Si quieres poblar la tienda del producto
      .populate('Categoria', 'nombre_categoria'); // Si quieres poblar la categoría del producto

    // Si no se encuentran productos
    if (productos.length === 0) {
      return res.status(404).json({ msg: "No se encontraron productos registrados recientemente" });
    }

    // Responder con los productos encontrados
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Hubo un error al obtener los productos", error: error.message });
  }
};

const obtenerTiendaPorId = async (req, res) => {
  const { id } = req.params; // Obtener el ID de la tienda desde los parámetros de la URL

  try {
    // Buscar la tienda en la base de datos usando el ID proporcionado
    const tienda = await Tienda.findById(id).populate('id_usuario', 'nombre apellido'); // Populate para obtener datos del usuario (si es necesario)
    
    // Verificar si la tienda existe
    if (!tienda) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    // Enviar la respuesta con los datos de la tienda
    res.status(200).json(tienda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los datos de la tienda' });
  }
};

// Función para obtener los datos de un moderador por su ID o email
const obtenerModerador = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del moderador desde los parámetros de la ruta

    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "El ID proporcionado no es válido" });
    }

    // Buscar el moderador en la base de datos por ID
    const moderador = await Moderador.findById(id);

    if (!moderador) {
      return res.status(404).json({ message: "Moderador no encontrado" });
    }

    // Excluir el campo de la contraseña por seguridad
    const { password, ...moderadorSinPassword } = moderador.toObject();

    return res.status(200).json(moderadorSinPassword);
  } catch (error) {
    console.error("Error al obtener el moderador:", error);
    return res.status(500).json({ message: "Error al obtener el moderador" });
  }
};

const mostrarUsuarioPorId = async (req, res) => {
  const { id } = req.params; // Obtener el ID del parámetro de la solicitud

  try {
    // Verificar que el ID es válido en MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID no válido" });
    }

    // Intentar buscar en la colección Usuario
    const usuarioEncontrado = await usuario.findById(id)
      .select("-password -token") // Excluir campos sensibles
      .lean();

    // Si no se encuentra el usuario
    if (!usuarioEncontrado) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Responder con los datos del usuario encontrado
    res.status(200).json(usuarioEncontrado);
  } catch (error) {
    console.error("Error al buscar usuario por ID:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const obtenerProductosPorMes = async (req, res) => {
  try {
    const productosPorMes = await Producto.aggregate([
      {
        $group: {
          _id: {
            año: { $year: "$createdAt" }, // Obtenemos el año de la fecha de creación
            mes: { $month: "$createdAt" }  // Obtenemos el mes de la fecha de creación
          },
          total: { $sum: 1 }  // Contamos la cantidad de productos por mes
        }
      },
      {
        $sort: { "_id.año": 1, "_id.mes": 1 }  // Ordenamos primero por año y luego por mes
      },
      {
        $project: {
          _id: 0,
          año: "$_id.año",  // Mostramos el año
          mes: "$_id.mes",   // Mostramos el mes
          total: 1           // Mostramos el total de productos
        }
      }
    ]);

    res.status(200).json(productosPorMes);  // Retornamos el resultado al cliente
  } catch (error) {
    console.error(error);  // Capturamos cualquier error
    res.status(500).json({ msg: "Hubo un error al obtener los productos por mes", error: error.message });
  }
};

export {
  login,
  registro,
  actualizarPassword,
  recuperarPassword,
  comprobarTokenPasword,
  nuevoPassword,
  actualizarEmail,
  crearModerador,
  listarTiendas,
  listarUsuarios,
  listarproductosIDtienda,
  listarproductosporID,
  listarproductosporCategoria,
  confirmEmail,
  desactivarTienda,  // Agregado
  eliminarProducto, // Se mantiene la función de eliminar producto
  eliminarUsuario,
  listarModeradores,
  eliminarModerador,
  crearUsuario,
  obtenerUsuariosPorMes,
  listarEstadisticas,
  obtenerUltimos10Productos,
  obtenerTiendaPorId,
  obtenerModerador,
  mostrarUsuarioPorId,
  obtenerProductosPorMes
};

