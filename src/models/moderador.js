import {Schema, model} from "mongoose";
import bcrypt from "bcryptjs";

// Definir el esquema para el Moderador
const moderadorSchema = new Schema({
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true, // Asegura que el correo electrónico sea único en la base de datos
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un correo electrónico válido"]
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"]
    },
    role: { // Cambié permisos por role
      type: String,
      enum: ['administrador', 'moderador'],
      required: true, // Asegura que siempre haya un role asignado
      default: 'moderador', // Por defecto asignamos moderador si no se especifica
    },
    estado: {
      type: Boolean,
      default: true, // Estado de activación del moderador
    },
    pais: {
      type: String, // Nuevo campo para el país
      required: true
    },
    telefono: {
      type: String, // Nuevo campo para el teléfono
      required: true
    },
    direccion: {
      type: String, // Nuevo campo para la dirección
      required: true
    },
    usuario: {
      type: String, // Nuevo campo para el apodo
      unique: true,
      required: true
    }
  },
  {
    timestamps: true, // Usa timestamps para createdAt y updatedAt
  }
);

// Método para encriptar la contraseña
moderadorSchema.methods.encrypPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const passwordEncryp = await bcrypt.hash(password,salt)
  return passwordEncryp
};

// Método para comparar la contraseña ingresada con la almacenada
moderadorSchema.methods.matchPassword = async function(password) {
  const response = await bcrypt.compare(password,this.password)
  return response
};

export default model('Moderador',moderadorSchema);