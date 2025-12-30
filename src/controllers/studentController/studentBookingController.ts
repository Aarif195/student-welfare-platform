import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

// bookRoomController
export const bookRoomController = async (req: Request, res: Response) => {
  const { room_id, start_date, end_date, total_price } = req.body;
  const student_id = (req as any).user.id;

  try {
    // 1. Check if room exists and is available using 'availability' column
    const roomCheck = await pool.query(
      "SELECT id FROM Rooms WHERE id = $1 AND availability = TRUE", 
      [room_id]
    );
    
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Room is currently occupied or unavailable" });
    }


    // 2. Conflict Protection: Check if there is already a 'pending' or 'approved' booking for this room
    const conflictCheck = await pool.query(
      "SELECT id FROM Bookings WHERE room_id = $1 AND booking_status IN ('pending', 'approved')",
      [room_id]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: "This room is already reserved by another student" });
    }

    // 3. Create the booking using your exact column names
    const newBooking = await pool.query(
      `INSERT INTO Bookings (student_id, room_id, start_date, end_date, total_price, booking_status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') 
       RETURNING *`,
      [student_id, room_id, start_date, end_date, total_price]
    );

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      data: newBooking.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error creating booking" });
  }
};

// getStudentBookingsController
export const getStudentBookingsController = async (req: Request, res: Response) => {
  const student_id = (req as any).user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM Bookings WHERE student_id = $1 ORDER BY booked_at DESC",
      [student_id]
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching bookings" });
  }
};

//  getStudentBookingByIdController
export const getStudentBookingByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const student_id = (req as any).user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM Bookings WHERE id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching booking details" });
  }
};

// updateStudentBookingController
export const updateStudentBookingController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { start_date, end_date } = req.body;
  const student_id = (req as any).user.id;

  try {
    // Only allow update if the booking is still 'pending'
    const result = await pool.query(
      `UPDATE Bookings 
       SET start_date = $1, end_date = $2 
       WHERE id = $3 AND student_id = $4 AND booking_status = 'pending' 
       RETURNING *`,
      [start_date, end_date, id, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found or cannot be updated (only pending bookings can be modified)" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking dates updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating booking" });
  }
};

// cancelBookingController
export const cancelBookingController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const student_id = (req as any).user.id;

  try {
    const result = await pool.query(
      "UPDATE Bookings SET booking_status = 'cancelled' WHERE id = $1 AND student_id = $2 RETURNING *",
      [id, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error cancelling booking" });
  }
};

// getAllAvailableHostelsController
export const getAllAvailableHostelsController = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, owner_id, name, location, description , created_at,updated_at
      FROM Hostels 
      WHERE status = 'approved' 
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ success: false, message: "Server error fetching hostels" });
  }
};

// getAvailableRoomsController
export const getAvailableRoomsController = async (req: Request, res: Response) => {
  const { hostel_id, price, capacity, sort } = req.query;

  try {
    // Determine sorting order
    let orderBy = "r.created_at DESC"; // default
    if (sort === "price_asc") orderBy = "r.price ASC";
    if (sort === "price_desc") orderBy = "r.price DESC";

    const result = await pool.query(`
      SELECT 
        r.id,r.hostel_id, r.room_number, r.type, r.capacity, r.price, r.images,
        h.name as hostel_name, h.location as hostel_location
      FROM Rooms r
      INNER JOIN Hostels h ON r.hostel_id = h.id
      WHERE h.status = 'approved' 
      AND r.availability = TRUE
      AND ($1::integer IS NULL OR r.hostel_id = $1)
      AND ($2::numeric IS NULL OR r.price <= $2)
      AND ($3::integer IS NULL OR r.capacity = $3)
      ORDER BY ${orderBy}
    `, [hostel_id || null, price || null, capacity || null]);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};