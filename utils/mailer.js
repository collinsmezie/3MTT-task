const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER,
        pass: process.env.PASS,
    },
});

const mailer = async function ( to, subject, text) {

    const mailOptions = {
        from: process.env.SENDER,
        to,
        subject,
        text,
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info);
        return info;
    }

    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = mailer;

// console.log(mailer("obinwaonyinyephilip@gmail.com", "JavaScript", "Hi, it's JavaScript, you should learn how to code, so you can do incredible things like this."));


