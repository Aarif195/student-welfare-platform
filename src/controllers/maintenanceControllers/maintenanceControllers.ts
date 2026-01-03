import { Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createMaintenanceRequest by students
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

// getMaintenanceRequests
export const getMaintenanceRequests = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
const { status } = req.query;

  try {
    let query = "";
    let params: any[] = [];

// query parts
    let whereClause = role === "superadmin" ? "WHERE 1=1" : "WHERE h.owner_id = $1";
    if (role !== "superadmin") params.push(Number(userId));

    if (status) {
      params.push(status);
      whereClause += ` AND m.status = $${params.length}`;
    }

    query = `SELECT m.*, h.name as hostel_name, s.firstName, s.lastName 
             FROM maintenance_requests m
             JOIN Hostels h ON m.hostel_id = h.id
             JOIN Students s ON m.student_id = s.id
             ${whereClause}
             ORDER BY m.created_at DESC`;


    const requests = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: requests.rowCount,
      data: requests.rows,
    });
  } catch (error) {
    console.error("Fetch maintenance error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// updateMaintenanceStatus
export const updateMaintenanceStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params; // The Maintenance Request ID
  const { status, owner_notes, assigned_to } = req.body;
  const userId = (req as any).user.id;
  const role = (req as any).user.role;

  try {
    //  If Superadmin, skip ownership check. If Owner, verify they own the hostel.
    if (role !== "superadmin") {
      const checkOwnership = await pool.query(
        `SELECT m.id FROM maintenance_requests m
     JOIN Hostels h ON m.hostel_id = h.id
     WHERE m.id = $1 AND h.owner_id = $2`,
        [id, Number(userId)]
      );

      if (checkOwnership.rowCount === 0) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this request" });
      }
    }

    const updated = await pool.query(
      `UPDATE maintenance_requests 
       SET status = $1, owner_notes = $2, assigned_to = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, owner_notes, assigned_to, id]
    );

    return res.status(200).json({
      success: true,
      message: "Maintenance status updated",
      data: updated.rows[0],
    });
  } catch (error) {
    console.error("Update maintenance error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
