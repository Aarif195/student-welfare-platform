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

