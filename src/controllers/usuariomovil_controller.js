import UsuarioMovil from "../models/usuariomovil.js"
import mongoose from "mongoose";
import { sendMailToVerifyMovilUser } from "../config/nodemailer.js";


const registro = async (req, res) => {
    try {
        const { nombre, email, password, acepta_terminos } = req.body;

        // Validar que todos los campos estén presentes
        

        // Verificar si acepta los términos
        if (acepta_terminos === "false") {
            return res.status(400).json({ msg: "Debe aceptar nuestros términos y condiciones" });
        }

        // Verificar si el email ya está registrado
        const verificarEmailBDD = await UsuarioMovil.findOne({ email });
        if (verificarEmailBDD) {
            return res.status(400).json({ msg: "El email ya se encuentra registrado, intente con uno diferente" });
        }

        // Generar token único de 5 caracteres
        const generarToken = () => {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = '';
            for (let i = 0; i < 5; i++) {
                token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return token;
        };

        const token = generarToken();

        // Crear un nuevo usuario
        const nuevoUsuario = new UsuarioMovil({
            nombre,
            email,
            password,
            acepta_terminos,
            token
        });

        // Encriptar la contraseña
        if (!password) {
            return res.status(400).json({ msg: "La contraseña es obligatoria" });
        }
        nuevoUsuario.password = await nuevoUsuario.encrypPassword(password);

        // Guardar el usuario en la base de datos
        await nuevoUsuario.save();

        // Enviar el correo de verificación
        await sendMailToVerifyMovilUser(email, token);

        res.status(200).json({
            msg: "Tu cuenta fue creada exitosamente. Revisa tu correo para confirmar tu cuenta.",
            id_usuario: nuevoUsuario._id,
            token: nuevoUsuario.token
        });
    } catch (error) {
        console.error("Error en el registro de usuario:", error);
        res.status(500).json({ msg: "Error interno del servidor" });
    }
};

const verificarCuenta = async (req, res) => {
    const { id_usuario, token } = req.body;

    const UsuarioBDD = await UsuarioMovil.findById(id_usuario);
    if (!UsuarioBDD) {return res.status(400).json({ msg: "No existe este usuario" });}

    if (UsuarioBDD.token !== token) {return res.status(400).json
        ({ msg: "El codigo no es correcto, verifique que sea el mismo que se envio a su correo" });}

    UsuarioBDD.ctaVerificada = true;
    UsuarioBDD.token = null;

    await UsuarioBDD.save();

    // Responder con éxito
    res.status(200).json({ msg: "Tu cuenta ha sido validada exitosamente." });
};
const ReenviarToken = async (req, res) => {
    const { id_usuario, token } = req.body;

    const UsuarioBDD = await UsuarioMovil.findById(id_usuario);
    if (!UsuarioBDD) {return res.status(400).json({ msg: "No existe este usuario" });}

    if (UsuarioBDD.token !== token) {return res.status(400).json({ msg: "El token no es válido" });}

    const email = UsuarioBDD.email
    await sendMailToVerifyMovilUser(email, token);  // Llamar a la función de envío de correo

    // Responder con éxito
    res.status(200).json({ msg: "El token se envio nuevamente, revisa tu correo." });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    // Verificar si hay campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }
    try {
        // Buscar usuario por email
        const UsuarioBDD = await UsuarioMovil.findOne({ email });
        // Verificar si el usuario existe
        if (!UsuarioBDD) {
            return res.status(404).json({ msg: "Lo sentimos, el Usuario no se encuentra registrado" });
        }
        // Verificar contraseña
        const verificarPassword = await UsuarioBDD.matchPassword(password);
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });
        }
        // Desestructurar propiedades del usuario
        const { _id, nombre } = UsuarioBDD;
        // Enviar respuesta con el id del usuario incluido
        res.status(200).json({
            id: _id,  // Incluye el ID en la respuesta
            nombre,
            email: UsuarioBDD.email,
        });
    } catch (error) {
        res.status(500).json({ msg: "Hubo un error en el servidor", error });
    }
};
const actualizarPassword = async (req, res) => {
    const { nuevopassword, confirmarpassword, id } = req.body;

    // Verificar que todos los campos estén presentes
    if (Object.values(req.body).includes("")) {
        return res.status(404).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        const usuarioBDD = await UsuarioMovil.findById(id);
        if (!usuarioBDD) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el Usuario ${id}` });
        }
        const verificarPassword = await UsuarioMovil.findOne({nuevopassword})
        if(!verificarPassword) return res.status(404).json({msg:"La contraseña que ingreso no es correcta"})
        const hashedPassword = await usuarioBDD.encrypPassword(confirmarpassword);
        await UsuarioMovil.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        );
        res.status(200).json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        res.status(500).json({ msg: "Error del servidor, por favor intente nuevamente más tarde." });
    }
};
const olvidoPassword = async (req, res) => {
    const { nuevopassword, confirmarpassword, email } = req.body;

    if (!nuevopassword || !confirmarpassword || !email) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        const usuarioBDD = await UsuarioMovil.findOne({ email });
        if (!usuarioBDD) {
            return res.status(404).json({ msg: `Lo sentimos, no existe el usuario con el email ${email}` });
        }

        if (nuevopassword !== confirmarpassword) {
            return res.status(400).json({ msg: "Lo sentimos, las contraseñas no coinciden" });
        }

        // Generar hash de la contraseña
        const hashedPassword = await usuarioBDD.encrypPassword(nuevopassword);

        await UsuarioMovil.findByIdAndUpdate(
            usuarioBDD._id,
            { password: hashedPassword },
            { new: true }
        );

        res.status(200).json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        res.status(500).json({ msg: "Error del servidor, por favor intente nuevamente más tarde." });
    }
};

export {
    registro,
    login,
    actualizarPassword,
    olvidoPassword,
    verificarCuenta,
    ReenviarToken
}