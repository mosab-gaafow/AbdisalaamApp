import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // or smtp.gmail.com
  port: 587,
  auth: {
    user: '@gmail.com',
    pass: '###########',
  },
});

export const sendResetCode = async (email, code) => {
  const mailOptions = {
    from: '"Travel App" <@gmail.com>',
    to: email,
    subject: 'Your Password Reset Code',
    text: `Your password reset code is: ${code}`,
    html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
  };

  return transporter.sendMail(mailOptions);
};
