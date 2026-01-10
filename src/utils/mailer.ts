import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
 host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingEmail = async (to: string, subject: string, html: string, senderName: string = "Hostel Management") => {
  const mailOptions = {
    from: `"${senderName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

