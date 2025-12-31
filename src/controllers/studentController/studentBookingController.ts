import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { verifyPayment } from "../../utils/helper";

// bookRoomController
export const bookRoomController = async (req: AuthRequest, res: Response) => {
  const { room_id, reference, start_date, end_date } = req.body;
  const student_id = (req as any).user.id;

  try {
    // 1. Check if room is available
    const roomCheck = await pool.query(
      "SELECT price, availability FROM Rooms WHERE id = $1",
      [room_id]
    );

    if (roomCheck.rowCount === 0 || !roomCheck.rows[0].availability) {
      return res
        .status(400)
        .json({ success: false, message: "Room unavailable" });
    }

    const roomPrice = roomCheck.rows[0].price;

    // 2. Verify Payment (using the utility)
    const isValid = await verifyPayment(reference);
    if (!isValid) {
      return res
        .status(402)
        .json({ success: false, message: "Payment verification failed" });
    }

    // 3. Create Booking & Payment Record (Transaction)
    const booking = await pool.query(
      `INSERT INTO Bookings (student_id, room_id, price, start_date, end_date, booking_status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
      [student_id, room_id, roomPrice, start_date, end_date]
    );

    const booking_id = booking.rows[0].id;

    await pool.query(
      `INSERT INTO Payments (booking_id, student_id, amount, reference, payment_status, paid_at) 
       VALUES ($1, $2, $3, $4, 'success', NOW())`,
      [booking_id, student_id, roomPrice, reference]
    );

    res.status(201).json({
      success: true,
      message: "Booking pending admin approval",
      booking_id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// getMyBookingsController
export const getMyBookingsController = async (
  req: AuthRequest,
  res: Response
) => {
  const student_id = (req as any).user.id;

  try {
    const query = `
      SELECT 
        b.id AS booking_id, b.booking_status, b.rejection_reason, b.start_date, b.end_date,
        h.name AS hostel_name, h.location AS hostel_location,
        r.room_number, r.type AS room_type,
        p.amount AS amount_paid, p.reference AS payment_reference, p.refund_status, p.paid_at
      FROM Bookings b
      JOIN Rooms r ON b.room_id = r.id
      JOIN Hostels h ON r.hostel_id = h.id
      LEFT JOIN Payments p ON b.id = p.booking_id
      WHERE b.student_id = $1
      ORDER BY b.booked_at DESC
    `;

    const result = await pool.query(query, [student_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// cancelBookingController
export const cancelBookingController = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
 const student_id = (req as any).user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Check if the booking exists, belongs to the student, and is still pending
    const checkQuery = `
      SELECT booking_status FROM Bookings 
      WHERE id = $1 AND student_id = $2
    `;
    const checkRes = await client.query(checkQuery, [bookingId, student_id]);

    if (checkRes.rowCount === 0) {
      throw new Error("Booking not found");
    }

    if (checkRes.rows[0].booking_status !== 'pending') {
      throw new Error("Only pending bookings can be cancelled. Please contact admin.");
    }

    // 2. Update Booking status to cancelled
    const updateBooking = `
      UPDATE Bookings SET booking_status = 'cancelled' 
      WHERE id = $1 RETURNING id, booking_status
    `;
    const bookingRes = await client.query(updateBooking, [bookingId]);

    // 3. Update Payment refund status to completed
    const updatePayment = `
      UPDATE Payments SET refund_status = 'completed' 
      WHERE booking_id = $1 RETURNING refund_status
    `;
    const paymentRes = await client.query(updatePayment, [bookingId]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: { ...bookingRes.rows[0], ...paymentRes.rows[0] }
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// getAllAvailableHostelsController
export const getAllAvailableHostelsController = async (
  req: AuthRequest,
  res: Response
) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Number(page);
  const pageLimit = Number(limit);
  const offset = (pageNumber - 1) * pageLimit;

  try {
    // total count
    const countResult = await pool.query(`
      SELECT COUNT(*) 
      FROM Hostels 
      WHERE status = 'approved'
    `);

    const total = Number(countResult.rows[0].count);

    // paginated data
    const result = await pool.query(
      `
      SELECT id, owner_id, name, location, description, created_at, updated_at
      FROM Hostels
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [pageLimit, offset]
    );

    res.status(200).json({
      success: true,
      meta: {
        page: pageNumber,
        limit: pageLimit,
        total,
      },
      AvailableHostels: result.rows,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error fetching hostels" });
  }
};

// getAvailableRoomsController
export const getAvailableRoomsController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostel_id, price, capacity, sort, page = 1, limit = 10 } = req.query;

  const pageNumber = Number(page);
  const pageLimit = Number(limit);
  const offset = (pageNumber - 1) * pageLimit;

  try {
    let orderBy = "r.created_at DESC";
    if (sort === "price_asc") orderBy = "r.price ASC";
    if (sort === "price_desc") orderBy = "r.price DESC";

    // total count
    const countResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM Rooms r
      INNER JOIN Hostels h ON r.hostel_id = h.id
      WHERE h.status = 'approved'
      AND r.availability = TRUE
      AND NOT EXISTS (
  SELECT 1 FROM Bookings b 
  WHERE b.room_id = r.id 
  AND b.booking_status IN ('pending', 'approved')
)
      AND ($1::integer IS NULL OR r.hostel_id = $1)
      AND ($2::numeric IS NULL OR r.price <= $2)
      AND ($3::integer IS NULL OR r.capacity = $3)
      `,
      [hostel_id || null, price || null, capacity || null]
    );

    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `
      SELECT 
        r.id, r.hostel_id, r.room_number, r.type, r.capacity, r.price, r.images,
        h.name as hostel_name, h.location as hostel_location
      FROM Rooms r
      INNER JOIN Hostels h ON r.hostel_id = h.id
      WHERE h.status = 'approved'
      AND r.availability = TRUE
      AND NOT EXISTS (
    SELECT 1 FROM Bookings b 
    WHERE b.room_id = r.id 
    AND b.booking_status IN ('pending', 'approved')
  )
      AND ($1::integer IS NULL OR r.hostel_id = $1)
      AND ($2::numeric IS NULL OR r.price <= $2)
      AND ($3::integer IS NULL OR r.capacity = $3)
      ORDER BY ${orderBy}
      LIMIT $4 OFFSET $5
      `,
      [hostel_id || null, price || null, capacity || null, pageLimit, offset]
    );

    res.status(200).json({
      success: true,
      meta: {
        page: pageNumber,
        limit: pageLimit,
        total,
      },
      AvailableRooms: result.rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
