import { Request, Response } from "express";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// adminLoginController
export const adminLoginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM Admins WHERE email = $1", [email]);
    const admin = result.rows[0];

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, role: admin.role }, //superadmin
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};