import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// createStudentReviewController
export const createStudentReviewController = async (
  req: AuthRequest,
  res: Response
) => {
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
        message:
          "You can only review hostels where you have had an approved stay.",
      });
    }

    // 2. Check if already reviewed (One-time submission)
    const existing = await pool.query(
      "SELECT id FROM Reviews WHERE student_id = $1 AND hostel_id = $2",
      [student_id, hostelId]
    );

    if (existing.rowCount! > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this hostel.",
      });
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

// getHostelReviewsController
export const getHostelReviewsController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostelId } = req.params;
  const user_id = (req as any).user.id;
  const role = (req as any).user.role;

  try {
    let query = "";
    let params: any[] = [];

    if (role === "student") {
      // Students only see reviews for the hostel they have an approved booking for
      query = `
        SELECT r.*, s.firstName, s.lastName 
        FROM Reviews r
        JOIN Students s ON r.student_id = s.id
        JOIN Bookings b ON b.student_id = r.student_id
        JOIN Rooms rm ON b.room_id = rm.id
        WHERE r.hostel_id = $1 AND b.student_id = $2 AND b.booking_status = 'approved'
      `;
      params = [hostelId, user_id];
    } else if (role === "owner") {
      // Owners see reviews for their own hostel only
      query = `
        SELECT r.*, s.firstName, s.lastName 
        FROM Reviews r
        JOIN Students s ON r.student_id = s.id
        JOIN Hostels h ON r.hostel_id = h.id
        WHERE r.hostel_id = $1 AND h.owner_id = $2
      `;
      params = [hostelId, user_id];
    } else if (role === "superadmin") {
      // Admin sees all reviews for the hostel
      query = `
        SELECT r.*, s.firstName, s.lastName 
        FROM Reviews r
        JOIN Students s ON r.student_id = s.id
        WHERE r.hostel_id = $1
      `;
      params = [hostelId];
    }

    const result = await pool.query(query, params);

    // if (result.rowCount === 0 && role === "owner") {
    //   return res
    //     .status(403)
    //     .json({
    //       success: false,
    //       message: "Unauthorized to see reviews for this hostel.",
    //     });
    // }

    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// replyToReviewController OWNER AND ADMIN
export const replyToReviewController = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const user_id = (req as any).user.id;
  const role = (req as any).user.role;
  console.log("Current User Role:", role);

  try {
    if (role === "owner") {
      // 1. Verify this review belongs to a hostel owned by this owner
      const ownershipCheck = await pool.query(
        `SELECT r.id FROM Reviews r
         JOIN Hostels h ON r.hostel_id = h.id
         WHERE r.id = $1 AND h.owner_id = $2`,
        [reviewId, user_id]
      );

      if (ownershipCheck.rowCount === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Unauthorized: You can only reply to reviews for your own hostels.",
        });
      }

      // 2. Update owner reply
      await pool.query(
        `UPDATE Reviews SET owner_reply = $1, owner_replied_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [reply, reviewId]
      );
    } else if (role === "superadmin") {
      console.log("Admin is replying to review:", reviewId); 
      const adminResult = await pool.query(
        `UPDATE Reviews SET admin_reply = $1, admin_replied_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [reply, reviewId]
      );
      console.log("Database Update Result:", adminResult.rows[0]);
    }

    res
      .status(200)
      .json({ success: true, message: "Reply submitted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
