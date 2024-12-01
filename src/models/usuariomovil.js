import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"
const UsuarioMovilSchema = new Schema({
    nombre:{
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
    acepta_terminos:{
        type:Boolean,
        require:true,
        default:false
    },
    token:{
        type:String,
        trim:true
    },
    ctaVerificada:{
        type:Boolean,
        default:false,
        require:true
    }
},{
    timestamps:true
})
// * Método para cifrar el password del paciente
UsuarioMovilSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// * Método para verificar si el password ingresado es el mismo de la BDD
UsuarioMovilSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    console.log(response)
    return response
}
export default model('UsuarioMovil', UsuarioMovilSchema)
