import { Request, Response } from "express";
import { pool } from "../../config/db";
import { sendBookingEmail } from "../../utils/mailer";
import crypto from "crypto";

export const resendOTPController = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // 1. Check if user exists in either table
    const student = await pool.query(
      "SELECT email FROM students WHERE email = $1",
      [email]
    );
    const owner = await pool.query(
      "SELECT email FROM HostelOwners WHERE email = $1",
      [email]
    );

    if (student.rows.length === 0 && owner.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

    // 3. Upsert OTP (Delete old ones for email AND keep table clean)
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
    await pool.query(
      "INSERT INTO email_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // 4. Send Email
    await sendBookingEmail(
      email,
      "New Verification Code Request",
      `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">New Verification Code</h1>
    </div>
    <div style="padding: 30px; text-align: center; color: #333;">
      <p style="font-size: 16px;">We received a request for a new verification code. Use the code below to verify your account:</p>
      <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in <b>5 minutes</b>. If you did not request this, please secure your account.</p>
    </div>
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;">
      &copy; ${new Date().getFullYear()} Hostel Management System. All rights reserved.
    </div>
  </div>
  `,
      "Hostel Management"
    );

    res
      .status(200)
      .json({ success: true, message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
