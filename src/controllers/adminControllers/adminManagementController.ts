import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// getAllStudentsController
export const getAllStudentsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*) FROM Students");
    const total = parseInt(totalResult.rows[0].count);

    const result = await pool.query(
      "SELECT id, firstName, lastName, email, created_at FROM Students ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching students" });
  }
};

// getAllOwnersController
export const getAllOwnersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query("SELECT COUNT(*) FROM HostelOwners");
    const total = parseInt(totalResult.rows[0].count);

    const result = await pool.query(
      "SELECT id, firstName, lastName, email, created_at FROM HostelOwners ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching owners" });
  }
};

// getAllHostelsController
export const getAllHostelsController = async (req: Request, res: Response) => {
  try {
    // Parse query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Fetch total count first
    const totalResult = await pool.query(`SELECT COUNT(*) FROM Hostels`);
    const total = parseInt(totalResult.rows[0].count);

    // Fetch paginated results
    const result = await pool.query(
      `
      SELECT h.*, o.firstName, o.lastName, o.email as owner_email 
      FROM Hostels h
      JOIN HostelOwners o ON h.owner_id = o.id
      ORDER BY h.created_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      data: result.rows, // [] if no rows
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching all hostels" });
  }
};

// deleteStudentController
export const deleteStudentController = async (
  req: AuthRequest,
  res: Response
) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM Students WHERE id = $1 RETURNING id",
      [studentId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Student not found" });
    res.status(200).send();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// deleteOwnerController
export const deleteOwnerController = async (
  req: AuthRequest,
  res: Response
) => {
  const { ownerId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM HostelOwners WHERE id = $1 RETURNING id",
      [ownerId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Owner not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// approveHostelController
export const approveHostelController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostelId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE Hostels SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [hostelId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hostel approved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// rejectHostelController
export const rejectHostelController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostelId } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      "UPDATE Hostels SET status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [reason || "No reason provided", hostelId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hostel rejected successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// getAllUsersController
export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalStudentsResult = await pool.query(
      "SELECT COUNT(*) FROM Students"
    );
    const totalOwnersResult = await pool.query(
      "SELECT COUNT(*) FROM HostelOwners"
    );

    const totalStudents = parseInt(totalStudentsResult.rows[0].count);
    const totalOwners = parseInt(totalOwnersResult.rows[0].count);

    const students = await pool.query(
      "SELECT id, firstName, lastName, email, 'student' as role FROM Students ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const owners = await pool.query(
      "SELECT id, firstName, lastName, email, 'owner' as role FROM HostelOwners ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      students: {
        page,
        limit,
        total: totalStudents,
        data: students.rows,
      },
      hostelowners: {
        page,
        limit,
        total: totalOwners,
        data: owners.rows,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// approveBookingController
export const approveBookingController = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    // 1. Update Booking Status
    const bookingUpdate = await pool.query(
      "UPDATE Bookings SET booking_status = 'approved' WHERE id = $1 RETURNING room_id",
      [bookingId]
    );

    if (bookingUpdate.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const room_id = bookingUpdate.rows[0].room_id;

    // 2. Flip Room Availability to FALSE
    await pool.query("UPDATE Rooms SET availability = FALSE WHERE id = $1", [
      room_id,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Booking approved and room occupied" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// getAdminPendingBookingsController
export const getAdminPendingBookingsController = async (
  req: Request,
  res: Response
) => {
  try {
    const query = `
  SELECT 
    b.id AS booking_id, b.start_date, b.end_date, b.booking_status,
    s.firstName, s.lastName, s.email AS student_email,
    r.room_number, r.type AS room_type,
    h.id AS hostel_id, h.name AS hostel_name, h.location AS hostel_location,
    p.reference AS payment_reference, p.amount AS amount_paid, p.paid_at
  FROM Bookings b
  JOIN Students s ON b.student_id = s.id
  JOIN Rooms r ON b.room_id = r.id
  JOIN Hostels h ON r.hostel_id = h.id
  JOIN Payments p ON b.id = p.booking_id
  WHERE b.booking_status = 'pending'
  ORDER BY b.booked_at DESC
`;

    const result = await pool.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};
