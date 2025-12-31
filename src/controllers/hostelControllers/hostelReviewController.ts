import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createStudentReviewController
export const createStudentReviewController = async (req: AuthRequest, res: Response) => {
  const { hostelId } = req.params;
  const { rating, comment } = req.body;
  const student_id = (req as any).user.id;

  try {
    // 1. Verify hostel exists and student has an approved booking there
    const eligibilityCheck = await pool.query(
      `SELECT b.id FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       WHERE b.student_id = $1 AND r.hostel_id = $2 AND b.booking_status = 'approved'`,
      [student_id, hostelId]
    );

    if (eligibilityCheck.rowCount === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only review hostels where you have had an approved stay." 
      });
    }

    // 2. Check if already reviewed (One-time submission)
    const existing = await pool.query(
      "SELECT id FROM Reviews WHERE student_id = $1 AND hostel_id = $2",
      [student_id, hostelId]
    );

    if (existing.rowCount! > 0) {
      return res.status(400).json({ success: false, message: "You have already reviewed this hostel." });
    }

    // 3. Insert review
    const result = await pool.query(
      `INSERT INTO Reviews (student_id, hostel_id, rating, comment) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student_id, hostelId, rating, comment]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHostelReviewsController = (
  req: Request,
  res: Response
) => {};
