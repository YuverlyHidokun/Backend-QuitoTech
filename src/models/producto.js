import mongoose, { Schema, model } from 'mongoose';

const ProductoSchema = new Schema({
    Nombre: {
        type: String,
        required: true,
        trim: true,
    },
    Categoria: {
        type: String,
        required: true,
        enum: ['Mandos', 'Consolas', 'Videojuegos', 'Perifericos', 'ComponentesPC', 'Otros'],
    },
    Estado: {
        type: Boolean,
        default: true,
    },
    id_tienda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tienda',
    },
    promedio_calificacion: {
        type: Number,
        default: 0
    },
    Cantidad: {
        type: Number,
        default: 0
    },
    precio:{
        type:Number,
        default: 0
    },
    imagenUrl: {
        type: String,
        required: false,
    },
    imagenPublicId: {
        type: String,
        required: true
    },
}, {
    timestamps: true,
});

export default model('Producto', ProductoSchema);

