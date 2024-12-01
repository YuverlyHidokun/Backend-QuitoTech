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

const sendMailToUser = (userMail, token) => {

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: userMail,
        subject: "Verifica tu cuenta",
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirmar/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>`
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
        subject: "Verifica tu cuenta",
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}usuario/confirmar/${encodeURIComponent(token)}">aquí</a> para confirmar tu cuenta.</p>`
    };


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};
const sendMailToAdmin = (userMail, tokentienda) => {

    let mailOptions = {
        from: process.env.USER_MAILTRAP,
        to: process.env.USER_MAILTRAP,
        subject: `Tienda de ${userMail}`,
        html: `<p>Hola, haz clic <a href="${process.env.URL_FRONTEND}confirmartienda/${encodeURIComponent(tokentienda)}">aquí</a> para verificar la tienda.</p>`
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
            <a href="${process.env.URL_FRONTEND}usuario/recuperar-password/${token}">Clic para reestablecer tu contraseña</a>
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

// send mail with defined transport object
export default sendMailToUser

export {
    sendMailToUser,
    sendMailToUser2,
    sendMailToRecoveryPassword,
    sendMailToRecoveryPasswordAd,
    sendMailToAdmin,
    sendMailToVerifyMovilUser
}



