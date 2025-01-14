import Usuario from "../models/usuarios.js"
import Tienda from "../models/tienda.js"
import Producto from "../models/producto.js"
import { sendMailToAdmin,sendMailToUser2, sendMailToRecoveryPassword, sendMailToUserUpdateEmail } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';


const registro = async (req, res) => {
  const { nombre, apellido, email, password, Numero, Nombre, Direccion, alerta_cantidad, ImagenUrl} = req.body;

  try {
    // Verificar que todos los campos obligatorios estén presentes en el registro
    if (Object.values(req.body).includes("") || !req.files || !req.files.imagen) {
      return res.status(400).json({ msg: "Todos los campos y la imagen son obligatorios" });
    }

    // Verificar si el email ya está registrado
    const verificarEmailBDD = await Usuario.findOne({ email });
    if (verificarEmailBDD) {
      return res.status(400).json({ msg: "El email ya se encuentra registrado, intente con uno diferente" });
    }

    // Subir la imagen a Cloudinary
    const file = req.files.imagen;
    const cloudinaryResponse = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "usuarios",
      use_filename: true,
      unique_filename: true,
    });

    // Crear el nuevo usuario
    const nuevopropietario = new Usuario({
      nombre,
      apellido,
      email,
      password,
      Numero,
      ImagenUrl: cloudinaryResponse.secure_url, // URL para mostrar la imagen
      imagenPublicId: cloudinaryResponse.public_id, // Public ID para eliminar
    });

    // Encriptar la contraseña
    nuevopropietario.password = await nuevopropietario.encrypPassword(password);

    // Crear un token de confirmación y enviarlo
    const token = nuevopropietario.crearToken();
    await sendMailToUser2(email, token);

    // Guardar el nuevo usuario en la base de datos
    await nuevopropietario.save();

    // Ahora, proceder a crear la tienda
    const propietarioBDD = await Usuario.findOne({ email });

    if (!propietarioBDD) {
      return res.status(404).json({ msg: "Propietario no encontrado" });
    }

    // Verificar que todos los campos de la tienda estén completos
    if (Object.values(req.body).includes("")) {
      return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos de la tienda" });
    }

    // Verificar si el propietario ya posee una tienda
    if (propietarioBDD.propietario) {
      return res.status(400).json({ msg: "El propietario ya posee una tienda" });
    }

    // Crear la tienda
    const nuevaTienda = new Tienda({
      Nombre,
      Direccion,
      id_propietario: propietarioBDD._id,
    });

    // Después de guardar la tienda en la base de datos
    await nuevaTienda.save();

    // Enviar correo al administrador con los detalles de la tienda
    sendMailToAdmin(email, nuevaTienda, token);

    // Responder al cliente
    res.status(200).json({ msg: "Usuario registrado y tienda solicitada. Revisa tu correo electrónico para confirmar tu cuenta" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al procesar la solicitud, por favor intente nuevamente más tarde." });
  }
};

const verificarEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(200).json({ disponible: false });
    }
    res.status(200).json({ disponible: true });
  } catch (error) {
    console.error("Error verificando el email:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};



const confirmEmail = async (req,res)=>{
    //: ACTIVIDAD 1
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})

    const propietarioBDD = await Usuario.findOne({token:req.params.token})
    if(!propietarioBDD?.token) return res.status(404).json({msg:"Algo ha ocurrido, parece que la cuenta ya ha sido confirmada"})

    propietarioBDD.confirmEmail=true
    await propietarioBDD.save()

    res.status(200).json({msg:"Felicidades su cuenta ha sido confirmada, puede iniciar sesion"}) 
} // * BIEN
const updateEmail = async (req,res)=>{
  //: ACTIVIDAD 1
  if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})

  const propietarioBDD = await Usuario.findOne({token:req.params.token})
  if(!propietarioBDD?.token) return res.status(404).json({msg:"Algo ha ocurrido, parece que la cuenta ya ha sido confirmada"})
  const tienda = await Tienda.findOne({ id_propietario : propietarioBDD._id });

  propietarioBDD.propietario=true
  tienda.Verificado = true
  await propietarioBDD.save()
  await tienda.save()

  res.status(200).json({msg:"Felicidades su cuenta ha sido actualizada, puede iniciar sesion"}) 
}
const actualizarPerfil = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: 'Ocurrio un error inesperado, intente más tarde' });
  }

  // Buscar la tienda y el propietario
  const TiendaBDD = await Tienda.findOne({ id_usuario: id });
  if (!TiendaBDD) return res.status(404).json({ msg: "Lo sentimos, la tienda no se encuentra registrada" });

  const TiendaVerificada = TiendaBDD.Verificado;
  if (!TiendaVerificada) {
    return res.status(404).json({ msg: "Aún no se verifica la información de su tienda, en estos días se validará su tienda" });
  }

  const propietarioBDD = await Usuario.findById(id);
  if (!propietarioBDD) return res.status(404).json({ msg: `Lo sentimos, el propietario ${id} no existe!` });

  // Verificar si el email ha cambiado
  if (propietarioBDD.email !== req.body.email) {
    const token = propietarioBDD.token;
    const propietarioBDDMail = await Usuario.findOne({ email: req.body.email });

    if (propietarioBDDMail) {
      return res.status(404).json({ msg: "Lo sentimos, el perfil ya se encuentra registrado" });
    }

    await sendMailToUserUpdateEmail(req.body.email, token);
    TiendaBDD.Verificado = false;
    propietarioBDD.propietario = false;
  }

  propietarioBDD.password = await propietarioBDD.encrypPassword(req.body.password);
  propietarioBDD.nombre = req.body.nombre || propietarioBDD?.nombre;
  propietarioBDD.apellido = req.body.apellido || propietarioBDD?.apellido;
  propietarioBDD.Numero = req.body.Numero || propietarioBDD?.Numero;
  propietarioBDD.email = req.body.email || propietarioBDD?.email;
  propietarioBDD.alerta_cantidad = req.body.alerta_cantidad || propietarioBDD?.alerta_cantidad;

  TiendaBDD.Direccion = req.body.Direccion || TiendaBDD?.direccion;
  TiendaBDD.Nombre = req.body.Nombre || TiendaBDD?.Nombre;

  // Si se envió una nueva imagen
  if (req.files && req.files.imagen) {
    // Si hay una imagen anterior, eliminarla de Cloudinary
    if (propietarioBDD.imagenPublicId) {
      try {
        await cloudinary.uploader.destroy(propietarioBDD.imagenPublicId);
      } catch (error) {
        console.error("Error al eliminar la imagen anterior en Cloudinary", error);
        return res.status(500).json({ msg: "Error al eliminar la imagen anterior en Cloudinary" });
      }
    }

    // Subir la nueva imagen a Cloudinary
    const file = req.files.imagen;
    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "usuarios",  // Puedes cambiar la carpeta si es necesario
        use_filename: true,
        unique_filename: true,
      });

      // Guardar la nueva URL y el ID de la imagen en la base de datos
      propietarioBDD.ImagenUrl = cloudinaryResponse.secure_url;  // URL de la imagen
      propietarioBDD.imagenPublicId = cloudinaryResponse.public_id;  // ID de la imagen
    } catch (error) {
      console.error("Error al subir la imagen a Cloudinary", error);
      return res.status(500).json({ msg: "Error al subir la imagen a Cloudinary. Intente más tarde." });
    }
  }

  // Guardar los cambios en la base de datos
  await propietarioBDD.save();
  await TiendaBDD.save();

  return res.status(200).json({ msg: "Perfil actualizado correctamente, si actualizó su correo debe volver a verificar su cuenta con el correo enviado" });
}
const actualizarPassword = async (req,res)=>{
    const propietarioBDD = await Usuario.findById(req.propietarioBDD._id)
    if(!propietarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el propietario ${id}`})
    const verificarPassword = await propietarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, la contraseña actual no es la correcta"})
    propietarioBDD.password = await propietarioBDD.encrypPassword(req.body.passwordnuevo)
    await propietarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
} // * BIEN
const recuperarPassword = async (req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const propietarioBDD = await Usuario.findOne({email})
    if(!propietarioBDD) return res.status(404).json({msg:"Lo sentimos, el email no se encuentra registrado"})
    const token = propietarioBDD.crearToken()
    propietarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await propietarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para recuperar tu contraseña"})
}// * BIEN
const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const propietarioBDD = await Usuario.findOne({token:req.params.token})
    if(propietarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await propietarioBDD.save()
    res.status(200).json({msg:"Hemos verificado tu correo, porfavor rellena los campos para tu nueva contraseña"})
}// * BIEN
const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, las contraseñas no coinciden"})
    const propietarioBDD = await Usuario.findOne({token:req.params.token})
    if(propietarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        propietarioBDD.token = null
    propietarioBDD.password = await propietarioBDD.encrypPassword(password)
    await propietarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nueva contraseña"}) 
}// * BIEN
const actualizarEmail =async (req,res)=>{
    const {email}= req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verifyemailUser = Usuario.findOne({email})
    if (verifyemailUser?.email) return res.status(409).json({msg:"Lo sentimos, el email ya esta registrado"})

    const newpropietarioBDD = await propietario.findOne(req.propietarioBDD._id)
    newpropietarioBDD.email=email
    await newpropietarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo email"}) 
}// * BIEN
const login = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const propietarioBDD = await Usuario.findOne({email})
    if(propietarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!propietarioBDD) return res.status(404).json({msg:"Lo sentimos, el propietario no se encuentra registrado"})
    const verificarPassword = await propietarioBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = generarJWT(propietarioBDD._id,"Propietario")
		const {nombre,apellido,direccion,telefono,_id} = propietarioBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        ImagenUrl : propietarioBDD.ImagenUrl,
        email:propietarioBDD.email,
        propietario:propietarioBDD.propietario})
} // * BIEN
const perfil = async (req, res) => {
  const { id } = req.params;

  // Verificar si el usuario existe
  const VerificarUsuario = await Usuario.findById(id);
  if (!VerificarUsuario) {
    return res.status(404).json({ msg: "No encontramos su perfil, por favor intente más tarde." });
  }

  // Verificar si la tienda existe asociada al usuario
  const VerificarTienda = await Tienda.findOne({ id_propietario: id });
  if (!VerificarTienda) {
    return res.status(404).json({ msg: "No encontramos su tienda, por favor intente más tarde." });
  }

  // Devolver los datos del usuario y la tienda
  return res.status(200).json({
    usuario: {
      nombre: VerificarUsuario.nombre,
      apellido: VerificarUsuario.apellido,
      email: VerificarUsuario.email,
      numero: VerificarUsuario.Numero,
      imagenUrl: VerificarUsuario.ImagenUrl,
      alerta_cantidad : VerificarUsuario.alerta_cantidad,
      password: VerificarUsuario.password
    },
    tienda: {
      nombre: VerificarTienda.Nombre,
      direccion: VerificarTienda.Direccion,
      id_propietario: VerificarTienda.id_propietario,
    },
  });
};


// ! ENDPOINTS TIENDA
const confirmarTienda = async (req,res)=>{
    const { token } = req.params;
    //: ACTIVIDAD 1
    if(!token) return res.status(400).json({msg:"Lo sentimos, no se puede validar la tienda"})
    //: ACTIVIDAD 2
    const propietario = await Usuario.findOne({ token });
    if(!propietario) return res.status(404).json({msg:"Token inválido o propietario no encontrado"})
    //: ACTIVIDAD 3
    if(propietario.propietario === true) return res.status(404).json({msg:"propietario ya posee una tienda"})

    const tienda = await Tienda.findOne({ id_propietario : propietario._id });
    
    if(!tienda)return res.status(404).json({ msg: "Tienda no encontrada" });
   
    tienda.Verificado = true;
    propietario.token = null;
    propietario.propietario = true;
    
    await tienda.save();
    await propietario.save();
    res.status(200).json({msg:"Negocio verificado, la tienda ha sido aprovada!"}) 
} // * BIEN
const solicitarTienda = async (req, res) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { Nombre, Direccion, email, id_propietario } = req.body;

        // Buscar propietario en la base de datos por email
        const propietarioBDD = await Usuario.findOne({ email });

        // Verificar si el propietario fue encontrado
        if (!propietarioBDD) {
            return res.status(404).json({ msg: "propietario no encontrado" });
        }

        // Verificar que todos los campos estén presentes
        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        // Verificar si el email pertenece al propietario
        if (propietarioBDD.email !== email) {
            return res.status(400).json({ msg: "Lo sentimos, debe ser un email tuyo" });
        }

        // Verificar si el propietario ya posee una tienda
        if (propietarioBDD.propietario) {
            return res.status(400).json({ msg: "propietario ya posee una tienda" });
        }
        console.log(req.body);
        // Crear nueva tienda
        const nuevaTienda = new Tienda({
            Nombre : Nombre,
            Direccion : Direccion,
            id_propietario : id_propietario
        });
        // ! propietarioBDD.tokentienda = tokenTienda;

        // Guardar los cambios en la base de datos
        await nuevaTienda.save();
        await propietarioBDD.save();

        // Enviar correo de confirmación
        // ! await sendMailToAdmin(email, tokenTienda);

        // Responder al cliente
        res.status(200).json({ msg: "Tu solicitud será revisada por nuestros administradores, pronto recibirás una confirmación!!" });
    } catch (error) {
        // Manejar errores inesperados
        console.error(error);
        res.status(500).json({ msg: "Error del servidor, por favor intente nuevamente más tarde." });
    }
};

const obtenerTiendaConProductos = async (req, res) => {
    const { id } = req.params;
  
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de tienda inválido" });
    }
  
    try {
      // Buscar la tienda
      const tienda = await Tienda.findById(id).select('-createdAt -updatedAt -__v');
      if (!tienda) {
        return res.status(404).json({ msg: "La tienda no existe" });
      }
  
      // Buscar los productos asociados a la tienda
      const productos = await Producto.find({ id_tienda: id })
        .select('-createdAt -updatedAt -__v');
  
      // Responder con los datos de la tienda y sus productos
      res.status(200).json({ tienda, productos });
    } catch (error) {
      console.error("Error al obtener la tienda con productos:", error);
      res.status(500).json({ msg: "Hubo un error al obtener los datos" });
    }
  };

// * BIEN
const listarTiendas = async (req,res)=>{
    const tiendas = await Tienda.find({Verificado:true}).where('Tienda').equals(req.TiendaBDD).select("-salida -createdAt -updatedAt -__v").populate('Nombre_tienda Direccion id_propietario _id')
    res.status(200).json(tiendas)
}// * BIEN
const listarproductosIDtienda = async (req, res) => {
    const { id_tienda } = req.params;
    
    try {
        // Buscar productos por id_tienda
        const productos = await Producto.find({ id_tienda })
            .select("-salida -createdAt -updatedAt -__v")
            .populate('id_tienda', 'Nombre_tienda')  // Asegúrate de que el campo y el modelo referenciado sean correctos
            .populate('Nombre_producto Categoria');

        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en el servidor", error: error.message });
    }
};//BIEN

const listarTiendasproductos = async (req, res) => {
    try {
      const tiendas = await Tienda.find({ Verificado: true })
        .where('Tienda').equals(req.TiendaBDD)
        .select('Nombre_tienda _id') // Solo selecciona 'Nombre_tienda' y '_id'
        .populate('Nombre_tienda Direccion');
  
      res.status(200).json(tiendas);
    } catch (error) {
      res.status(500).json({ message: "Error al listar tiendas", error });
    }
  };
const obtenerTiendaDelpropietario = async (req, res) => {
    const { id_propietario } = req.params;
    
    try {
      const tienda = await Tienda.findOne({ id_propietario });
      
      if (!tienda) {
        return res.status(404).json({ msg: 'No se encontró una tienda asociada a este propietario' });
      }
      
      res.status(200).json({ tienda });
    } catch (error) {
      res.status(500).json({ msg: 'Error al obtener la tienda', error });
    }
  };


export {
    // ! Rutas de propietario
    login,
    perfil,
    registro,
    verificarEmail,
    updateEmail,
    confirmEmail,
    actualizarPerfil,
    actualizarEmail,
    actualizarPassword,
	  recuperarPassword,
    comprobarTokenPasword,
	  nuevoPassword,
    // ! Rutas de tienda
    solicitarTienda,
    confirmarTienda,
    listarTiendas,
    listarTiendasproductos,
    obtenerTiendaDelpropietario,
    obtenerTiendaConProductos
}