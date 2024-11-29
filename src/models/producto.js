import mongoose, { Schema, model } from 'mongoose';

const ProductoSchema = new Schema({
    Nombre_producto: {
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
    imagenUrl: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});

export default model('Producto', ProductoSchema);

