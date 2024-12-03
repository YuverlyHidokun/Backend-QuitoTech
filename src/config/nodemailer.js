import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
        user: process.env.USER_MAILTRAP,
        pass: process.env.PASS_MAILTRAP,
    }
});

const sendMailToUserUpdateEmail = (email, token) => {

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: email,
        subject: "Actualizacion de cuenta",
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}/propietario/actualizar/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>`
    };


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};
const sendMailToUser2 = (userMail, token) => {
    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Verificación de Registro de Usuario",
        html: `
            <p>Hola, gracias por registrarte en nuestra plataforma.</p>
            <p>Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
            <p><a href="${process.env.VITE_FRONTEND_URL}/propietario/confirmar/${encodeURIComponent(token)}" style="color: #4CAF50; font-weight: bold;">Verificar mi cuenta</a></p>
            <p>Si no realizaste este registro, por favor ignora este correo.</p>
            <p>¡Estamos emocionados de tenerte con nosotros!</p>
            <br>
            <p>Saludos,<br>El equipo de soporte.</p>
            <strong><p>----------------------------------------------------------------------------------------------------</p></strong>
            <p style="color: grey;">Este es un correo electrónico generado por el sistema. No responda a este correo electrónico.</p>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

const sendMailToAdmin = (userMail, tienda, token) => {
    // Desestructuramos los datos de la tienda
    const { Nombre, Direccion, email } = tienda;

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: process.env.USER_MAILTRAP,
        subject: `Tienda de ${userMail}`, // Corregido el uso de las comillas invertidas
        html: `
            <p>Hola, se ha creado una nueva tienda. Aquí están los detalles:</p>
            <ul>
                <li><strong>Nombre de la tienda:</strong> ${Nombre}</li>
                <li><strong>Dirección:</strong> ${Direccion}</li>
                <li><strong>Email del propietario:</strong> ${userMail}</li>
            </ul>
            <p>Haz clic <a href="${process.env.VITE_FRONTEND_URL}/propietario/confirmartienda/${encodeURIComponent(token)}">aquí</a> para verificar la tienda.</p>
            <strong><p>----------------------------------------------------------------------------------------------------</p></strong>
            <p style="color: grey;">Este es un correo electrónico generado por el sistema. No responda a este correo electrónico.</p>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};


const sendMailToRecoveryPassword = async (userMail, token) => {
    let info = await transporter.sendMail({
        from: 'Administradores de la Pagina',
        to: userMail,
        subject: "Correo para reestablecer tu contraseña",
        html: `
        <!DOCTYPE html>
    <html lang="es">
    <head></head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Gestión de Tiendas - Tiendas Quito</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f8f8;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 24px;
                color: #0056b3;
            }
            hr {
                border: 0;
                height: 1px;
                background: #ddd;
                margin: 20px 0;
            }
            a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #28a745;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            a:hover {
                background-color: #218838;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Sistema de Gestión de Tiendas (Tiendas Quito 🛒 🏬)</h1>
            <hr>
            <a href="${process.env.URL_FRONTEND}propietario/recuperar-password/${token}">Clic para reestablecer tu contraseña</a>
            <hr>
            <footer><b>¡TeamKhaos te da la Bienvenida!</b></footer>
        </div>
    </body>
    </html>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}
const sendMailToRecoveryPasswordAd = async (userMail, token) => {
    let info = await transporter.sendMail({
        from: 'Administradores de la Pagina',
        to: userMail,
        subject: "Correo para reestablecer tu contraseña",
        html: `
        <!DOCTYPE html>
    <html lang="es">
    <head></head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Gestión de Tiendas - Tiendas Quito</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f8f8;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                font-size: 24px;
                color: #0056b3;
            }
            hr {
                border: 0;
                height: 1px;
                background: #ddd;
                margin: 20px 0;
            }
            a {
                display: inline-block;
                padding: 10px 20px;
                background-color: #28a745;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }
            a:hover {
                background-color: #218838;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Sistema de Gestión de Tiendas (Tiendas Quito 🛒 🏬)</h1>
            <hr>
            <a href="${process.env.URL_FRONTEND}recuperar-password/${token}">Clic para reestablecer tu contraseña</a>
            <hr>
            <footer><b>¡TeamKhaos te da la Bienvenida!</b></footer>
        </div>
    </body>
    </html>
    `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}
const sendMailToVerifyMovilUser = async (userMail, token) => {
    let info = await transporter.sendMail({
        from: 'Administradores de la Página',  // Correo de origen
        to: userMail,  // Correo del destinatario
        subject: "Verificación de cuenta",  // Asunto del correo
        html: `
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de cuenta</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .card {
                        width: 100%;
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        text-align: center;
                    }
                    h2 {
                        color: #333;
                    }
                    p {
                        font-size: 16px;
                        color: #555;
                    }
                    .btn {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 25px;
                        background-color: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .btn:hover {
                        background-color: #218838;
                    }
                    .token {
                        font-size: 18px;
                        font-weight: bold;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Verificación de cuenta</h2>
                    <p>Gracias por usar nuestro servicio. Estás a un paso de confirmar tu cuenta.</p>
                    <p>Para finalizar, ingresa el siguiente código <span class="token">${token}</span> en nuestra app para comenzar a disfrutar de los mejores productos de Quito.</p>
                </div>
            </body>
        </html>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}
const sendMailToDeleteProduct = async (userMail, id) => {
    let info = await transporter.sendMail({
        from: 'Administradores de la Página',  // Correo de origen
        to: userMail,  // Correo del destinatario
        subject: "Suspensión de producto",  // Asunto del correo
        html: `
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Suspensión de producto</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .card {
                        width: 100%;
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #fff;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                        text-align: center;
                    }
                    h2 {
                        color: #333;
                    }
                    p {
                        font-size: 16px;
                        color: #555;
                    }
                    .btn {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 25px;
                        background-color: #dc3545;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .btn:hover {
                        background-color: #c82333;
                    }
                    .token {
                        font-size: 18px;
                        font-weight: bold;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Suspensión de producto</h2>
                    <p>Hemos visto que tu producto no cumple con las normas de nuestra página, por lo que lo hemos suspendido.</p>
                    <p>Revisa y actualiza tu producto para que pueda ser nuevamente aprobado.</p>
                    <a href="http://localhost:3000/${id}" class="btn">Ver producto</a>
                </div>
            </body>
        </html>
        `
    });
    console.log("Mensaje enviado satisfactoriamente: ", info.messageId);
}

// send mail with defined transport object
export default sendMailToUser2

export {
    sendMailToUserUpdateEmail,
    sendMailToUser2,
    sendMailToRecoveryPassword,
    sendMailToRecoveryPasswordAd,
    sendMailToAdmin,
    sendMailToVerifyMovilUser,
    sendMailToDeleteProduct
}



