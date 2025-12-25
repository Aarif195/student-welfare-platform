import { Request, Response } from "express";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../../utils/helper";
import { pool } from "../../config/db";

// registerStudentController
export const registerStudentController = async (
  req: Request,
  res: Response
) => {
  const { firstName, lastName, email, password, phone } = req.body;

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

    // Insert student
    const result = await pool.query(
      "INSERT INTO students (firstName, lastName, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email",
      [firstName, lastName, email, hashedPassword, phone]
    );

    
    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    // console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
