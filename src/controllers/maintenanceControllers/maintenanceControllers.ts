import { Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createMaintenanceRequest
export const createMaintenanceRequest = async (
  req: AuthRequest,
  res: Response
) => {
  const { issue_type, description } = req.body;
const userId = (req as any).user.id;

  // The image URL from upload middleware (e.g., Cloudinary)
  const image_url = req.file ? req.file.path : null;

  try {
    // 1. Find the student's active booking
    const bookingInfo = await pool.query(
      `SELECT b.room_id, r.hostel_id 
       FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       WHERE b.student_id = $1 AND b.booking_status = 'approved'
       LIMIT 1`,
      [Number(userId)]
    );

    console.log("Searching for Student ID:", userId);
    console.log("Rows found:", bookingInfo.rowCount);

    if (bookingInfo.rowCount === 0) {
      return res.status(403).json({
        message:
          "You must have an approved booking to file a maintenance request.",
      });
    }

    const { room_id, hostel_id } = bookingInfo.rows[0];

    // 2. Insert the request
    const newRequest = await pool.query(
      `INSERT INTO maintenance_requests (student_id, room_id, hostel_id, issue_type, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [Number(userId), room_id, hostel_id, issue_type, description, image_url]
    );

    return res.status(201).json({
      success: true,
      message: "Maintenance request submitted successfully",
      data: newRequest.rows[0],
    });
  } catch (error) {
    console.error("Maintenance creation error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
