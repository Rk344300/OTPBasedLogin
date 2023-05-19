const nodemailer = require("nodemailer");

require('dotenv/config');

// Setting up transporter with Gmail service to be able to send mails to the users
let transporter = nodemailer.createTransport(
    {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.TRANSPORTER_EMAIL,
            pass: process.env.TRANSPORTER_PASSWORD
        },
    },
    (err) => {
        console.log(err);
        return;
    }
);

module.exports = {
    transporter: transporter,
};