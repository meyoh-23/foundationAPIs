const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        //1. create a transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        // activate the less secure app option in my gmail account incase gmail is being used
    });

    //2. define the email options - this is what will be passed as ana argument to this function
    const mailOptions = {
        from: 'johnkahuthu17@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    //3. send the email with nodemailer
    await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
};

module.exports = sendEmail;