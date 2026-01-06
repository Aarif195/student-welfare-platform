import { pool } from "../../config/db";

import { Request, Response } from "express";

export const verifyOTPController = async (req: Request, res: Response) => {
  const { email, otp_code } = req.body;

  try {
    // 1. Check if OTP exists, matches, and is not expired
    const result = await pool.query(
      `SELECT * FROM email_otps 
       WHERE email = $1 AND otp_code = $2 AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp_code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    //2 Update students table  as verified
    await pool.query(
      "UPDATE students SET is_verified = true WHERE email = $1",
      [email]
    );

    // Update HostelOwners table as verified
    await pool.query(
      "UPDATE HostelOwners SET is_verified = true WHERE email = $1",
      [email]
    );

    // 3. Delete the OTP so it can't be reused
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
