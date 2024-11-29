
import Usuario from "../models/usuario.js"
import Tienda from "../models/tienda.js"
import Producto from "../models/producto.js"
import { sendMailToAdmin,sendMailToUser2, sendMailToRecoveryPassword } from "../config/nodemailer.js"
import generarJWT from "../helpers/crearJWT.js"
import mongoose from "mongoose";


const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await Usuario.findOne({email})
    if(verificarEmailBDD) return res.status(400).json({msg:"El email ya se encuentra registrado, intente con uno diferente"})
    const nuevoUsuario = new Usuario(req.body)
    nuevoUsuario.password = await nuevoUsuario.encrypPassword(password)
    nuevoUsuario.crearToken()
    await nuevoUsuario.save()

    const token = nuevoUsuario.crearToken()
    //const tokentienda = nuevoUsuario.crearTokentienda()
    //variableGlobal = tokentienda
    await sendMailToUser2(email,token)
    await nuevoUsuario.save()

    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})
} // * BIEN
const confirmEmail = async (req,res)=>{
    //: ACTIVIDAD 1
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})

    const usuarioBDD = await Usuario.findOne({token:req.params.token})
    if(!usuarioBDD?.token) return res.status(404).json({msg:"Algo ha ocurrido, parece que la cuenta ya ha sido confirmada"})

    usuarioBDD.token = null
    usuarioBDD.confirmEmail=true
    await usuarioBDD.save()

    res.status(200).json({msg:"Felicidades su cuenta ha sido confirmada, puede iniciar sesion"}) 
} // * BIEN
const actualizarPerfil = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:'Lo sentimos, debe ser un id válido'});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const usuarioBDD = await Usuario.findById(id)
    if(!usuarioBDD) return res.status(404).json({msg:`Lo sentimos, el usuario ${id} no existe!`})
    if (usuarioBDD.email !=  req.body.email)
    {
        const usuarioBDDMail = await Usuario.findOne({email:req.body.email})
        if (usuarioBDDMail)
        {
            return res.status(404).json({msg:"Lo sentimos, el perfil ya se encuentra registrado"})  
        }
    }
	usuarioBDD.nombre = req.body.nombre || usuarioBDD?.nombre
    usuarioBDD.apellido = req.body.apellido  || usuarioBDD?.apellido
    usuarioBDD.direccion = req.body.direccion || usuarioBDD?.direccion
    usuarioBDD.telefono = req.body.telefono || usuarioBDD?.telefono
    usuarioBDD.email = req.body.email || usuarioBDD?.email
    await usuarioBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
} // * BIEN
const actualizarPassword = async (req,res)=>{
    const usuarioBDD = await Usuario.findById(req.usuarioBDD._id)
    if(!usuarioBDD) return res.status(404).json({msg:`Lo sentimos, no existe el usuario ${id}`})
    const verificarPassword = await usuarioBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, la contraseña actual no es la correcta"})
    usuarioBDD.password = await usuarioBDD.encrypPassword(req.body.passwordnuevo)
    await usuarioBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
} // * BIEN
const recuperarPassword = async (req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const usuarioBDD = await Usuario.findOne({email})
    if(!usuarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = usuarioBDD.crearToken()
    usuarioBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await usuarioBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para recuperar tu contraseña"})
}// * BIEN
const comprobarTokenPasword = async (req,res)=>{
 
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const usuarioBDD = await Usuario.findOne({token:req.params.token})
    if(usuarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await usuarioBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nueva contraseña"}) 
}// * BIEN
const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, las contraseñas no coinciden"})
    const usuarioBDD = await Usuario.findOne({token:req.params.token})
    if(usuarioBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        usuarioBDD.token = null
    usuarioBDD.password = await usuarioBDD.encrypPassword(password)
    await usuarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nueva contrase;a"}) 
}// * BIEN
const actualizarEmail =async (req,res)=>{
    const {email}= req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verifyemailUser = Usuario.findOne({email})
    if (verifyemailUser?.email) return res.status(409).json({msg:"Lo sentimos, el email ya esta registrado"})

    const newusuarioBDD = await Usuario.findOne(req.usuarioBDD._id)
    newusuarioBDD.email=email
    await newusuarioBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo email"}) 
}// * BIEN
const login = async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const usuarioBDD = await Usuario.findOne({email})
    if(usuarioBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!usuarioBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await usuarioBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    const token = generarJWT(usuarioBDD._id,"usuario")
		const {nombre,apellido,direccion,telefono,_id} = usuarioBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:usuarioBDD.email,
        propietario:usuarioBDD.propietario})
} // * BIEN
const perfil = (req,res)=>{
    delete req.usuarioBDD.token
    delete req.usuarioBDD.tokentienda
    delete req.usuarioBDD.confirmEmail
    delete req.usuarioBDD.createdAt
    delete req.usuarioBDD.updatedAt
    delete req.usuarioBDD.__v
    res.status(200).json(req.usuarioBDD)
} // * BIEN

// ! ENDPOINTS TIENDA
const confirmarTienda = async (req,res)=>{
    const { tokentienda } = req.params;
    //: ACTIVIDAD 1
    if(!tokentienda) return res.status(400).json({msg:"Lo sentimos, no se puede validar la tienda"})
    //: ACTIVIDAD 2
    const usuario = await Usuario.findOne({ tokentienda });
    if(!usuario) return res.status(404).json({msg:"Token inválido o usuario no encontrado"})
    //: ACTIVIDAD 3
    if(usuario.propietario === true) return res.status(404).json({msg:"Usuario ya posee una tienda"})

    const tienda = await Tienda.findOne({ id_usuario : usuario._id });
    
    if(!tienda)return res.status(404).json({ msg: "Tienda no encontrada" });
   
    tienda.Verificado = true;
    usuario.tokentienda = null;
    usuario.propietario = true;
    
    await tienda.save();
    await usuario.save();
    res.status(200).json({msg:"Negocio verificado, la tienda ha sido aprovada!"}) 
} // * BIEN
const solicitarTienda = async (req, res) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { Nombre_tienda, Direccion, email } = req.body;

        // Buscar usuario en la base de datos por email
        const usuarioBDD = await Usuario.findOne({ email });

        // Verificar si el usuario fue encontrado
        if (!usuarioBDD) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Verificar que todos los campos estén presentes
        if (Object.values(req.body).includes("")) {
            return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
        }

        // Verificar si el email pertenece al usuario
        if (usuarioBDD.email !== email) {
            return res.status(400).json({ msg: "Lo sentimos, debe ser un email tuyo" });
        }

        // Verificar si el usuario ya posee una tienda
        if (usuarioBDD.propietario) {
            return res.status(400).json({ msg: "Usuario ya posee una tienda" });
        }

        // Crear nueva tienda
        const nuevaTienda = new Tienda(req.body);
        const tokenTienda = usuarioBDD.crearTokentienda();
        usuarioBDD.tokentienda = tokenTienda;

        // Guardar los cambios en la base de datos
        await nuevaTienda.save();
        await usuarioBDD.save();

        // Enviar correo de confirmación
        await sendMailToAdmin(email, tokenTienda);

        // Responder al cliente
        res.status(200).json({ msg: "Tu solicitud será revisada por nuestros administradores, pronto recibirás una confirmación!!" });
    } catch (error) {
        // Manejar errores inesperados
        console.error(error);
        res.status(500).json({ msg: "Error del servidor, por favor intente nuevamente más tarde." });
    }
};

// * BIEN
const listarTiendas = async (req,res)=>{ 
    const tiendas = await Tienda.find({Verificado:true}).where('Tienda').equals(req.TiendaBDD).select("-salida -createdAt -updatedAt -__v").populate('Nombre_tienda Direccion id_usuario _id')
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
const listarproductosporID = async (req, res) => {
    const {id} = req.params
    const productosBDD = await Producto.findById(id)
    try {
        const productos = await Producto.find({id: req.productosBDD })
            .select("-salida -createdAt -updatedAt -__v")
            .populate('id_tienda', 'id Nombre_producto Categoria');
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en el servidor" });
    }
};//BIEN
const listarproductosporCategoria = async (req, res) => {
    try {
        const { Categoria } = req.params;
        console.log(`Categoría recibida: ${Categoria}`);

       const categoriasValidas = ['Mandos', 'Consolas', 'Videojuegos', 'Perifericos', 'ComponentesPC', 'Otros'];

        if (!categoriasValidas.includes(Categoria)) {
            return res.status(400).json({ msg: `La categoría '${Categoria}' no existe, busque en una categoria existente!` });
        }

        const productos = await Producto.find({ Categoria });
        res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error en el servidor" });
        console.log(error);
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
const obtenerTiendaDelUsuario = async (req, res) => {
    const { id_usuario } = req.params;
    
    try {
      const tienda = await Tienda.findOne({ id_usuario });
      
      if (!tienda) {
        return res.status(404).json({ msg: 'No se encontró una tienda asociada a este usuario' });
      }
      
      res.status(200).json({ tienda });
    } catch (error) {
      res.status(500).json({ msg: 'Error al obtener la tienda', error });
    }
  };


export {
    // ! Rutas de Usuario
    login,
    perfil,
    registro,
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
    listarproductosporID,
    listarproductosporCategoria,
    listarproductosIDtienda,
    listarTiendasproductos,
    obtenerTiendaDelUsuario
}