//  * importar libreria schema y el modelo
import {Schema, model} from 'mongoose'
// * libreria para encriptar contraseñas
import bcrypt from "bcryptjs"
// * definir el schema (diseño para la tabla de una BDD SQL)
const AdministradorSchema = new Schema({
    email:{
        type:String,
        require:true,
        trim:true,
		unique:true
    },
    password:{
        type:String,
        require:true
    },
    token:{
        type:String,
        default:null
    },
    confirmEmail:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
// * Método para cifrar el password del administrador
AdministradorSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// * Método para verificar si el password ingresado es el mismo de la BDD
AdministradorSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}
AdministradorSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}
export default model('Administrador',AdministradorSchema)
