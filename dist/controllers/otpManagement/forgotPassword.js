"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordController = void 0;
const db_1 = require("../../config/db");
const mailer_1 = require("../../utils/mailer");
const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Check if user exists in either table
        const ownerCheck = await db_1.pool.query("SELECT id FROM HostelOwners WHERE email = $1", [email]);
        const studentCheck = await db_1.pool.query("SELECT id FROM students WHERE email = $1", [email]);
        if (ownerCheck.rows.length === 0 && studentCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User with this email does not exist" });
        }
        // 2. Generate OTP and Expiry
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);
        // 3. Store in email_otps (delete old ones first)
        await db_1.pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
        await db_1.pool.query("INSERT INTO email_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)", [email, otp, expiresAt]);
        // 4. Send Styled Email
        await (0, mailer_1.sendBookingEmail)(email, "Password Reset Request", `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
        </div>
        <div style="padding: 30px; text-align: center; color: #333;">
          <p style="font-size: 16px;">We received a request to reset your password. Use the code below to proceed:</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ef4444;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This code expires in <b>5 minutes</b>. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
      `, "Hostel Management");
        res.status(200).json({ success: true, message: "Reset OTP sent to your email" });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.forgotPasswordController = forgotPasswordController;
