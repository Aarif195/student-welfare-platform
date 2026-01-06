import { Request, Response } from "express";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../../utils/helper";
import { pool } from "../../config/db";
import { sendBookingEmail } from "../../utils/mailer";
import crypto from "crypto";

// registerStudentController
export const registerStudentController = async (
  req: Request,
  res: Response
) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Get the file path from multer if it exists
  const profile_image = req.file ? req.file.path : null;

  try {
    // Check if email exists
    const userExist = await pool.query(
      "SELECT id FROM students WHERE email = $1",
      [email]
    );
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Hash password via helper
    const hashedPassword = await hashPassword(password);

    // 1. Generate OTP and Expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

    //2 Insert student
    const result = await pool.query(
      "INSERT INTO students (firstName, lastName, email, password, phone, profile_image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, profile_image",
      [firstName, lastName, email, hashedPassword, phone, profile_image]
    );

    // 3. Save OTP to email_otps table
    await pool.query(
      "INSERT INTO email_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // 4. Send the Email
    // Assuming your sendEmail helper takes (to, subject, text/html)
    await sendBookingEmail(
      email,
      "Verify Your Email",
      `<p>Your verification code is: ${otp}. It expires in 5 minutes.</p>`
    );

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP.",
      email: result.rows[0].email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// loginStudentController
export const loginStudentController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find the student
    const result = await pool.query("SELECT * FROM students WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 2. Compare password via helper
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // 3. Generate token via helper
    const token = generateToken(user.id, "student");

    // 4. Respond with token and user info (excluding password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: "student",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
