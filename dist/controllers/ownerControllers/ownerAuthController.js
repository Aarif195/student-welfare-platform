"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerLoginController = exports.ownerRegisterController = void 0;
const db_1 = require("../../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailer_1 = require("../../utils/mailer");
const crypto_1 = __importDefault(require("crypto"));
//  ownerRegisterController
const ownerRegisterController = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;
    try {
        const userExists = await db_1.pool.query("SELECT * FROM HostelOwners WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res
                .status(400)
                .json({ success: false, message: "Owner already exists" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // 1. Generate OTP
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);
        // 2. Insert Owner (is_verified defaults to false)
        const newOwner = await db_1.pool.query("INSERT INTO HostelOwners (firstName, lastName, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, firstName, email", [firstName, lastName, email, hashedPassword, phone]);
        // 3. Save OTP
        await db_1.pool.query("INSERT INTO email_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)", [email, otp, expiresAt]);
        // 4. Send Email
        await (0, mailer_1.sendBookingEmail)(email, "Verify Your Email", `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Confirm Your Email</h1>
    </div>
    <div style="padding: 30px; text-align: center; color: #333;">
      <p style="font-size: 16px;">Thank you for joining our Hostel Management platform. Please use the verification code below to complete your registration:</p>
      <div style="margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in <b>5 minutes</b>. If you didn't request this, please ignore this email.</p>
    </div>
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999;">
      &copy; ${new Date().getFullYear()} Hostel Management System. All rights reserved.
    </div>
  </div>
  `, "Hostel Management");
        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            email: newOwner.rows[0].email,
            role: "HostelOwner",
        });
    }
    catch (error) {
        console.log("owners", error);
        res
            .status(500)
            .json({ success: false, message: "Server error during registration" });
    }
};
exports.ownerRegisterController = ownerRegisterController;
// ownerLoginController
const ownerLoginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db_1.pool.query("SELECT * FROM HostelOwners WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        const isMatch = await bcrypt_1.default.compare(password, result.rows[0].password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        const user = result.rows[0];
        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: result.rows[0].id, role: "owner" }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: "HostelOwner",
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Server error during login" });
    }
};
exports.ownerLoginController = ownerLoginController;
