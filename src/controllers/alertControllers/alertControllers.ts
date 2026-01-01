import { Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createAlertController
export const createAlertController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, message, type } = req.body;
    const { hostelId } = req.params;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const role = req.user.role;

    // Validate type
    if (!["global", "hostel"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Invalid type. Must be "global" or "hostel".' });
    }

    let hostel_id: number | null = null;

    if (type === "hostel") {
      if (!hostelId)
        return res
          .status(400)
          .json({ message: "Hostel ID is required for hostel alerts" });

      const hostelCheck = await pool.query(
        "SELECT id, owner_id FROM hostels WHERE id = $1",
        [Number(hostelId)]
      );

      if (hostelCheck.rowCount === 0)
        return res.status(404).json({ message: "Hostel not found" });

      const hostelOwnerId = hostelCheck.rows[0].owner_id;

      if (role === "owner" && hostelOwnerId !== userId) {
        return res
          .status(403)
          .json({ message: "Owners can only create alerts for their own hostel" });
      }

      hostel_id = Number(hostelId);
    } else if (type === "global") {
      if (role !== "superadmin") {
        return res
          .status(403)
          .json({ message: "Only superadmin can create global alerts" });
      }
      hostel_id = null;
    }

    // Insert alert
    const result = await pool.query(
      `INSERT INTO alerts (title, message, type, hostel_id, created_by, creator_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, message, type, hostel_id, userId, role]
    );

    return res.status(201).json({ message: "Alert created", alert: result.rows[0] });
  } catch (err) {
    console.error("Create alert error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateAlertController = async (req: Request, res: Response) => {};

export const deleteAlertController = async (req: Request, res: Response) => {};

export const getGlobalAlertsController = async (
  req: Request,
  res: Response
) => {};

export const getHostelAlertsController = async (
  req: Request,
  res: Response
) => {};
