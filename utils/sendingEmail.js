const nodemailer = require("nodemailer");
module.exports = async (userEmail, subject, htmlTemplate) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL_ADDRSS, //sender
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.APP_EMAIL_ADDRSS, //sender,
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email Send " + info.response);
  } catch (error) {
    console.log(error);
    throw new Error("Internal Server Error (nodemailer)");
  }
};
