"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendBookingEmail = async (to, subject, html, senderName = "Hostel Management") => {
    const mailOptions = {
        from: `"${senderName}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
};
exports.sendBookingEmail = sendBookingEmail;
