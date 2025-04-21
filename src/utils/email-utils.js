const nodemailer = require("nodemailer")
const ejs = require("ejs");
const path = require("path");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })
        let info = await transporter.sendMail({
            from:"adetumo@gmail.com",
            to:email,
            subject:title,
            html:body
        })
        console.log("Email info:", info)
        return info
    } catch (error) {
        console.log(error.message)       
    }
}


const sendEmailTemplate = async (to, data, templateFile, subject) => {
  try {
    // Define email template path dynamically
    const templatePath = path.join(__dirname, "../emails", templateFile);

    // Render the EJS template with dynamic data
    const html = await ejs.renderFile(templatePath, { ...data, year: new Date().getFullYear() });

    const transporter = nodemailer.createTransport({
                host:process.env.MAIL_HOST,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    const message = {
      from: "Detumo",
      to,
      subject,
      text: `This is a system-generated email. Please check your inbox.`,
      html, // Use the rendered EJS template
    };

    await transporter.sendMail(message);
    return { success: true };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error };
  }
};

const sendOTPEmail = async (to, fullName, otp, expiration) => {
    return await sendEmailTemplate(
      to, 
      { fullName, otp, expiration }, 
      "otpEmail.ejs", "Your OTP"
    );
  };

  const sendResendOTPEmail = async (to, fullName, newOtp, expiration) => {
    return await sendEmailTemplate(
      to, 
      { fullName, newOtp, expiration }, 
      "resendOtp.ejs", "Your Resent OTP"
    );
  };
module.exports = {sendEmailTemplate, sendOTPEmail, sendResendOTPEmail, mailSender}