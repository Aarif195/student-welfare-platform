import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../../config/db";
import jwt from "jsonwebtoken";
import { hashPassword } from "../../utils/helper";
// import crypto from 'crypto';
import * as crypto from 'crypto';

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

    // 2. Account Linking (Verify existing user)
    if (user) {
      if (!user.is_verified) {
        await pool.query(
          `UPDATE ${tableName} SET is_verified = true WHERE email = $1`,
          [email]
        );
        user.is_verified = true;
      }
    }
    // 3. If not, create them
    else {
      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "First-time login requires a phone number to complete registration.",
        });
      }

      // Generate a unique random string and hash it
      const entropy = crypto.randomBytes(16).toString("hex");
      const securePassword = await hashPassword(entropy);

      const newUser = await pool.query(
        `INSERT INTO ${tableName} (firstName, lastName, email, phone, is_verified, password) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [firstName, lastName, email, phone, true, securePassword]
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
    console.log("Failed error", error);

    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};
