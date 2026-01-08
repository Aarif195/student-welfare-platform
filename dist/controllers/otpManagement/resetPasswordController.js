"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = void 0;
const db_1 = require("../../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const resetPasswordController = async (req, res) => {
    const { email, otp_code, newPassword } = req.body;
    try {
        // 1. Verify OTP
        const otpResult = await db_1.pool.query(`SELECT * FROM email_otps 
       WHERE email = $1 AND otp_code = $2 
       ORDER BY created_at DESC LIMIT 1`, [email, otp_code]);
        if (otpResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid OTP code" });
        }
        // 2. Check Expiry
        const otpData = otpResult.rows[0];
        if (new Date() > new Date(otpData.expires_at)) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }
        // 3. Hash the new password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        // 4. Update password in both tables (wherever the email exists)
        await db_1.pool.query("UPDATE students SET password = $1 WHERE email = $2", [hashedPassword, email]);
        await db_1.pool.query("UPDATE HostelOwners SET password = $1 WHERE email = $2", [hashedPassword, email]);
        // 5. Delete OTP so it cannot be used again
        await db_1.pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
        res.status(200).json({ success: true, message: "Password updated successfully. You can now login." });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.resetPasswordController = resetPasswordController;
