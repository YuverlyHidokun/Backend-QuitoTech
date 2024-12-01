import {Schema, model} from 'mongoose'
import mongoose from 'mongoose'
import Producto from "../models/producto.js"
const ComentarioSchema = new Schema({
    titulo:{
        type:String,
        require:true,
        trim:true
    },
    descripcion:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        require:true,
        trim:true
    },
    calificacion:{
        type:Number,
        default: 1,
        min: 0,
        max: 5,
    },
    id_usuario:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UsuarioMovil'
    },
    id_producto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Prodcuto'
    },
    fecha:{
        type:Date,
        require:true,
        default: Date.now
    }

},{
    timestamps:true
})

ComentarioSchema.methods.actualizarPromedioCalificaciones = async function() {
    try {
        // Obtener todos los comentarios que correspondan al mismo producto
        const comentarios = await this.constructor.find({ id_producto: this.id_producto });

        if (comentarios.length === 0) {
            return 0; // Si no hay comentarios, el promedio es 0
        }

        // Calcular el promedio de las calificaciones
        const promedio = comentarios.reduce((sum, comentario) => sum + comentario.calificacion, 0) / comentarios.length;

        // Actualizar el promedio en el documento del producto
        await Producto.findByIdAndUpdate(this.id_producto, { promedio_calificacion: promedio });

        return promedio;
    } catch (error) {
        console.error('Error al actualizar el promedio de calificaciones:', error);
        throw new Error('No se pudo actualizar el promedio de calificaciones');
    }
};


export default model('Comentario',ComentarioSchema)