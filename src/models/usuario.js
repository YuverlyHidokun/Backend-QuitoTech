import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"
const UsuarioSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    apellido:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        trim:true
    },
    password:{
        type:String,
        require:true
    },
    propietario:{
        type:Boolean,
        default:false
    },
    token:{
        type:String,
        default:null
    },
    tokentienda:{
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
// * Método para cifrar el password del paciente
UsuarioSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// * Método para verificar si el password ingresado es el mismo de la BDD
UsuarioSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}
UsuarioSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}
UsuarioSchema.methods.crearTokentienda = function(){
    const tokentiendagenerado = this.tokentienda = Math.random().toString(36).slice(2)
    return tokentiendagenerado
}
export default model('Usuario',UsuarioSchema)
