import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../config/db";

// registerGuest
export const registerGuest = async (req: AuthRequest, res: Response) => {
  const studentId = (req as any).user.id;
  const { guest_name, guest_phone, visit_purpose, expected_duration } = req.body;

  try {
    // 1. Get hostel_id via Bookings and Rooms tables
    const bookingLookup = await pool.query(
      `SELECT rm.hostel_id 
       FROM Bookings b
       JOIN Rooms rm ON b.room_id = rm.id
       WHERE b.student_id = $1 AND b.booking_status = 'approved' 
       LIMIT 1`,
      [studentId]
    );

    const hostelId = bookingLookup.rows[0]?.hostel_id;

    if (!hostelId) {
      return res.status(403).json({ 
        message: "Access denied. You must have an approved booking to log a guest." 
      });
    }

    // 2. Insert into guest_logs
    const newGuest = await pool.query(
      `INSERT INTO guest_logs (student_id, hostel_id, guest_name, guest_phone, visit_purpose, expected_duration)
       VALUES ($1, $2, $3, $4, $5, $6::interval) RETURNING *`,
      [studentId, hostelId, guest_name, guest_phone, visit_purpose, expected_duration]
    );

    return res.status(201).json({ success: true, data: newGuest.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};