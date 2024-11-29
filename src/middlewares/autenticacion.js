import jwt from 'jsonwebtoken'
import Administrador from '../models/administrador.js'
import Usuario from '../models/usuario.js'

const verificarAutenticacion = async (req,res,next)=>{

if(!req.headers.authorization) return res.status(404).json({msg:"Lo sentimos, debes proprocionar un token"})   
    const {authorization} = req.headers
    try {
        const {id, rol} = jwt.verify(authorization.split(' ')[1],process.env.JWT_SECRET)
        if (rol==="administrador"){
            req.AdministradorBDD = await Administrador.findById(id).lean().select("-password")
            next()
        } else {
            req.usuarioBDD = await Usuario.findById(id).lean().select("-password")
            next()
        }
    } catch (error) {
        const e = new Error(error)
        return res.status(404).json({msg:e.message})
    }
}

export default verificarAutenticacion