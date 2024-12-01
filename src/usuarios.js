import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"
const UsuariosSchema = new Schema({
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
    Numero:{
        type:Number,
        require:true
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
    propietario: {
        type: Boolean,
        default: false
    },
    token:{
        type:String,
        default:null
    },
    alerta_cantidad:{
        type: Number,
        default:5
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    ImagenUrl: {
        type: String,
        required: false,
    },
    imagenPublicId: {
        type: String,
        required: true
    },
},{
    timestamps:true
})
// * Método para cifrar el password del paciente
UsuariosSchema.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
// * Método para verificar si el password ingresado es el mismo de la BDD
UsuariosSchema.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.password)
    return response
}
UsuariosSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}
UsuariosSchema.methods.crearTokentienda = function(){
    const tokentiendagenerado = this.tokentienda = Math.random().toString(36).slice(2)
    return tokentiendagenerado
}
export default model('Usuarios',UsuariosSchema)
