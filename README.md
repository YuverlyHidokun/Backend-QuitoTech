# QuitoTech Backend

Este repositorio contiene el código fuente del backend para el sistema de gestión y publicación de productos gamer en la ciudad de Quito, desarrollado como parte de la tesis "Sistema de Gestión y Publicación de Productos Gamer ubicados en la ciudad de Quito".

## Descripción
El backend proporciona la lógica y funcionalidad necesarias para la gestión de usuarios, propietarios, moderadores y productos dentro del sistema QuitoTech. Está desarrollado con Node.js, utilizando una base de datos no relacional (MongoDB) y siguiendo la arquitectura RESTful.

## Características principales
- Registro e inicio de sesión de usuarios.
- Gestión de perfiles de usuarios.
- Publicación y gestión de productos por parte de propietarios.
- Administración y moderación del sistema.
- Reservas y favoritos para los usuarios móviles.

## Requisitos previos
- Node.js v14 o superior.
- MongoDB.
- Dependencias del proyecto (instaladas con `npm install`).

## Instalación
1. Clona este repositorio:
   ```bash
   git clone https://github.com/tuusuario/quitotech-backend.git
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto y define las siguientes variables:
   ```env
   PORT=3000
   MONGO_URI=tu_url_de_mongodb
   JWT_SECRET=tu_secreto_jwt
   CLOUDINARY_URL=tu_url_de_cloudinary
   ```
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

## Documentación de la API
La documentación completa de los endpoints del backend se encuentra disponible en Postman. Puedes consultarla desde el siguiente enlace:

[Documentación en Postman](https://documenter.getpostman.com/view/39967453/2sAYQWJDLa)

## Manual de usuario
Para entender cómo utilizar el sistema, consulta el siguiente video que explica su uso:

[Manual de usuario](https://www.youtube.com/watch?v=b9xJzr7jLTs)

## Autor
**Yuverly Alexander Verdezoto Lojan**

## Licencia
Este proyecto está bajo la licencia MIT.

## Contribuciones
¡Las contribuciones son bienvenidas! Si deseas contribuir, sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una rama con la funcionalidad o corrección de errores que desees agregar.
3. Realiza un pull request describiendo tus cambios.

## Estado del proyecto
Este backend está en constante desarrollo. Para cualquier duda o problema, no dudes en abrir un issue.

## Despliegue
El backend está desplegado en Render y puedes acceder a él en la siguiente URL:

[https://backend-quitotech-npmb.onrender.com](backend-quitotech-npmb.onrender.com)

## Contacto
Si tienes preguntas, sugerencias o problemas, puedes contactarme a través de:
- Email: yuverly.verdezoto@epn.edu.ec
- GitHub: [YuverlyHidokun](https://github.com/YuverlyHidokun)
