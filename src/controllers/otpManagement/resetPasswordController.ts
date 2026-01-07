import { Request, Response } from "express";
import { pool } from "../../config/db";
import { sendBookingEmail } from "../../utils/mailer";
import bcrypt from 'bcrypt';

export const resetPasswordController = async (req: Request, res: Response) => {
  const { email, otp_code, newPassword } = req.body;

  try {
    // 1. Verify OTP
    const otpResult = await pool.query(
      `SELECT * FROM email_otps 
       WHERE email = $1 AND otp_code = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp_code]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // 2. Check Expiry
    const otpData = otpResult.rows[0];
    if (new Date() > new Date(otpData.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password in both tables (wherever the email exists)
    await pool.query("UPDATE students SET password = $1 WHERE email = $2", [hashedPassword, email]);
    await pool.query("UPDATE HostelOwners SET password = $1 WHERE email = $2", [hashedPassword, email]);

    // 5. Delete OTP so it cannot be used again
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);

    res.status(200).json({ success: true, message: "Password updated successfully. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};