"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPController = void 0;
const db_1 = require("../../config/db");
const verifyOTPController = async (req, res) => {
    const { email, otp_code } = req.body;
    try {
        // 1. Check if OTP exists and matches the email
        const result = await db_1.pool.query(`SELECT * FROM email_otps 
       WHERE email = $1 AND otp_code = $2 
       ORDER BY created_at DESC LIMIT 1`, [email, otp_code]);
        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP code",
            });
        }
        // 2. Perform the expiry check in JavaScript
        const otpData = result.rows[0];
        const now = new Date();
        if (now > new Date(otpData.expires_at)) {
            return res
                .status(400)
                .json({ success: false, message: "OTP has expired" });
        }
        // 3. Update both tables (Student and Owner)
        await db_1.pool.query("UPDATE students SET is_verified = true WHERE email = $1", [email]);
        await db_1.pool.query("UPDATE HostelOwners SET is_verified = true WHERE email = $1", [email]);
        // 4. Delete the OTP so it can't be reused
        await db_1.pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
        res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now login.",
        });
    }
    catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.verifyOTPController = verifyOTPController;
