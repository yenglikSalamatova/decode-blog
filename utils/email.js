const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Email options
  const mailOptions = {
    from: "Master Admin <decode-blog@mail.ru>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
