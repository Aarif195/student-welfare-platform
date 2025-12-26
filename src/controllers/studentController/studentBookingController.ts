import { Request, Response } from "express";
import { pool } from "../../config/db";

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

