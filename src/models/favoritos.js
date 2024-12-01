import {Schema, model} from 'mongoose'
import mongoose from 'mongoose'

const FavoritoSchema = new Schema({
    id_producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
    },
    id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
    }
},{
    timestamps:true
})

export default model('Favorito',FavoritoSchema)