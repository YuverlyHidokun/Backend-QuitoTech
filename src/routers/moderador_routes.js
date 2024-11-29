import { Router } from 'express';
import Moderador from '../models/moderador.js'; // Modelo de Moderador

const routerModerador = Router();

// Ruta para crear un nuevo moderador
routerModerador.post('/moderador/registro', async (req, res) => {
  const { nombre, correo, telefono, contraseña, permisos } = req.body;

  try {
    // Verificar si el moderador ya existe
    const moderadorExistente = await Moderador.findOne({ correo });
    if (moderadorExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Crear un nuevo moderador
    const nuevoModerador = new Moderador({
      nombre,
      correo,
      telefono,
      contraseña,  // Asegúrate de encriptar la contraseña antes de guardarla
      permisos,
    });

    // Guardar el moderador en la base de datos
    await nuevoModerador.save();

    res.status(201).json({ message: 'Moderador creado con éxito', moderador: nuevoModerador });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al crear el moderador' });
  }
});

export default routerModerador;
