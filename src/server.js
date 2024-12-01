// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';

import routerAdministrador from './routers/administrador_routes.js'
import routerUsuario from './routers/usuarios_routes.js'
import routerProducto from './routers/productos_routes.js'
import routerUsuariosMovil from './routers/usuariomovil_routes.js'
import routerComentarios from './routers/comentarios_routes.js'
import routerfavorito from './routers/favoritos_routes.js'
import routerReserva from './routers/reservas-router.js'



// Inicializaciones
const app = express()
dotenv.config()


// Configuraciones
app.set('port', process.env.PORT || 3000)
app.use(cors())
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true, // Usar archivos temporales
    tempFileDir: '/tmp/', // Ruta temporal para los archivos
  }));
// Variables globales

// Rutas
app.get('/', (req, res) => {
    res.send("Server on")
})
app.use('/quitotech', routerAdministrador)
app.use('/quitotech', routerUsuario)
app.use('/quitotech', routerProducto)
app.use('/quitotech', routerUsuariosMovil)
app.use('/quitotech', routerComentarios)
app.use('/quitotech', routerfavorito)
app.use('/quitotech', routerReserva)


// Manejo de una ruta que no sea encontrada
app.use((req, res) => res.status(404).send("Endpoint no encontrado - 404"))

// Exportar la instancia de express por medio de app
export default app
