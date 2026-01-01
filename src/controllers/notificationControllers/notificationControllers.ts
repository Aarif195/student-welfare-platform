import { Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createAlertController
export const createNotificationController = async (
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

      // Query hostel with approval check
      const hostelCheck = await pool.query(
        "SELECT id, owner_id, status FROM hostels WHERE id = $1 AND status = 'approved'",
        [Number(hostelId)]
      );

      if (hostelCheck.rowCount === 0) {
        return res.status(403).json({
          message:
            "Cannot create alert for this hostel. It must be approved and owned by you.",
        });
      }

      const hostelOwnerId = hostelCheck.rows[0].owner_id;

      if (role === "owner" && hostelOwnerId !== userId) {
        return res.status(403).json({
          message:
            "Owners can only create alerts for their own approved hostel.",
        });
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

// deleteAlertController
export const deleteNotificationController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { notificationId } = req.params;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const role = req.user.role;

    if (!notificationId) return res.status(400).json({ message: "notification ID is required" });

    // Fetch the notification to check ownership/role
    const alertCheck = await pool.query(
      "SELECT id, created_by FROM alerts WHERE id = $1",
      [Number(notificationId)]
    );

    if (alertCheck.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const alert = alertCheck.rows[0];

    // Only superadmin or creator can delete
    if (role !== "superadmin" && alert.created_by !== userId) {
      return res.status(403).json({ message: "You are not allowed to delete this notification" });
    }

    // Delete the notification
    await pool.query("DELETE FROM alerts WHERE id = $1", [Number(notificationId)]);

    return res.status(204).send();
  } catch (err) {
    console.error("Delete notification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// getGlobalAlertsController
export const getGlobalNotificationsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;

    // Only allow students, owners, and superadmin to access
    if (!["student", "owner", "superadmin"].includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM alerts WHERE type = 'global'`
    );
    const total = parseInt(totalResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM alerts WHERE type = 'global' ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      alerts: result.rows,
    });
  } catch (err) {
    console.error("Get global alerts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// getHostelAlertsController
export const getHostelNotificationsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { hostelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 10); 
    const offset = (page - 1) * limit;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const role = req.user.role;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID is required" });
    }

    // Get hostel info
    const hostelCheck = await pool.query(
      "SELECT id, owner_id, status FROM hostels WHERE id = $1",
      [Number(hostelId)]
    );

    if (hostelCheck.rowCount === 0) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const hostel = hostelCheck.rows[0];

    // Only allow access if hostel is approved 
    if (hostel.status !== "approved") {
      return res.status(403).json({
        message: "Cannot view alerts for unapproved hostel",
      });
    }

    // Owners can only view alerts for their own approved hostel
    if (role === "owner" && hostel.owner_id !== userId) {
      return res.status(403).json({
        message: "Owners can only view alerts for their own approved hostel",
      });
    }

    // Students can only view approved hostels (already covered above)
    // Superadmin can view all approved hostels

    // Total alerts count for pagination
    const totalResult = await pool.query(
      "SELECT COUNT(*) FROM alerts WHERE hostel_id = $1",
      [Number(hostelId)]
    );
    const total = parseInt(totalResult.rows[0].count);

    // Fetch alerts with pagination
    const result = await pool.query(
      "SELECT * FROM alerts WHERE hostel_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [Number(hostelId), limit, offset]
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      alerts: result.rows,
    });
  } catch (err) {
    console.error("Get hostel alerts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};





