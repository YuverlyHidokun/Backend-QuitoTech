import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"
const TiendaSchema = new Schema({
    Nombre:{
        type:String,
        require:true,
    },
    Direccion:{
        type:String,
        require:true,
    },
    Verificado:{
        type:Boolean,
        default:false
    },
    id_propietario:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Usuario'
    }
    
},{
    timestamps:true
})
// TiendaSchema.methods.crearTokentienda = function(){
//     const tokentiendagenerado = this.tokentienda = Math.random().toString(36).slice(2)
//     return tokentiendagenerado
// }
export default model('Tienda',TiendaSchema)
