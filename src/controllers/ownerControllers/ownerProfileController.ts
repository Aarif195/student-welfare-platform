import { Request, Response } from "express";
import { pool } from "../../config/db";

// getOwnerProfileController
export const getOwnerProfileController = async (req: Request, res: Response) => {
  const ownerId = (req as any).user.id;

  try {
    const result = await pool.query(
      "SELECT id, firstName, lastName, email, phone, profile_image, created_at FROM HostelOwners WHERE id = $1",
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Owner not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
};

// updateOwnerProfileController
export const updateOwnerProfileController = async (req: Request, res: Response) => {
  const { firstName, lastName, phone } = req.body;
  const ownerId = (req as any).user.id;

  try {
    const result = await pool.query(
      `UPDATE HostelOwners 
       SET firstName = $1, lastName = $2, phone = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, firstName, lastName, email, phone`,
      [firstName, lastName, phone, ownerId]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};