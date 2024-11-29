import mongoose, {Schema,model} from 'mongoose'
import bcrypt from "bcryptjs"
const TiendaSchema = new Schema({
    Nombre_tienda:{
        type:String,
        require:true,
        trim:true
    },
    Direccion:{
        type:String,
        require:true,
        trim:true
    },
    Verificado:{
        type:Boolean,
        default:false
    },
    id_usuario:{
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
