import { Request, Response } from "express";
import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//  ownerRegisterController
export const ownerRegisterController = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM HostelOwners WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Owner already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOwner = await pool.query(
      "INSERT INTO HostelOwners (firstName, lastName, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, firstName, email",
      [firstName, lastName, email, hashedPassword, phone]
    );

    res.status(201).json({ success: true, data: newOwner.rows[0] });
  } catch (error) {
    console.log("owners", error);
    
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// ownerLoginController
export const ownerLoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM HostelOwners WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: result.rows[0].id, role: 'owner' },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};