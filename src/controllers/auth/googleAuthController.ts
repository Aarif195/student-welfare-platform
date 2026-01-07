import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken, role, phone } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    const { email, name } = payload;
    const [firstName, ...lastNameParts] = name ? name.split(" ") : ["User", ""];
    const lastName = lastNameParts.join(" ");
    const tableName = role === "student" ? "students" : "hostelOwners";

    // 1. Check if user exists
    const userQuery = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = $1`,
      [email]
    );
    let user = userQuery.rows[0];

    // 2. If not, create them (is_verified = true)
    if (!user) {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "First-time login requires a phone number to complete registration.",
        });
      }

      const newUser = await pool.query(
        `INSERT INTO ${tableName} (firstName, lastName, email, phone, is_verified, password) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [firstName, lastName, email, phone, true, "google_authenticated"]
      );
      user = newUser.rows[0];
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token, user: { email, name, role } });
  } catch (error) {
    console.log('Failed error', error);
    
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

