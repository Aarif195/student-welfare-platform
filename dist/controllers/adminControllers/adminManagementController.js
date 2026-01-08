"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectBookingController = exports.getAdminPendingBookingsController = exports.approveBookingController = exports.getAllUsersController = exports.rejectHostelController = exports.approveHostelController = exports.deleteOwnerController = exports.deleteStudentController = exports.getAllHostelsController = exports.getAllOwnersController = exports.getAllStudentsController = void 0;
const db_1 = require("../../config/db");
const mailer_1 = require("../../utils/mailer");
// getAllStudentsController
const getAllStudentsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const totalResult = await db_1.pool.query("SELECT COUNT(*) FROM Students");
        const total = parseInt(totalResult.rows[0].count);
        const result = await db_1.pool.query("SELECT id, firstName, lastName, email, created_at FROM Students ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            Students: result.rows,
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ success: false, message: "Server error fetching students" });
    }
};
exports.getAllStudentsController = getAllStudentsController;
// getAllOwnersController
const getAllOwnersController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const totalResult = await db_1.pool.query("SELECT COUNT(*) FROM HostelOwners");
        const total = parseInt(totalResult.rows[0].count);
        const result = await db_1.pool.query("SELECT id, firstName, lastName, email, created_at FROM HostelOwners ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            HostelOwners: result.rows,
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ success: false, message: "Server error fetching owners" });
    }
};
exports.getAllOwnersController = getAllOwnersController;
// getAllHostelsController
const getAllHostelsController = async (req, res) => {
    try {
        // Parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Fetch total count first
        const totalResult = await db_1.pool.query(`SELECT COUNT(*) FROM Hostels`);
        const total = parseInt(totalResult.rows[0].count);
        // Fetch paginated results
        const result = await db_1.pool.query(`
      SELECT h.*, o.firstName, o.lastName, o.email as owner_email 
      FROM Hostels h
      JOIN HostelOwners o ON h.owner_id = o.id
      ORDER BY h.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            Hostels: result.rows, // [] if no rows
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ success: false, message: "Server error fetching all hostels" });
    }
};
exports.getAllHostelsController = getAllHostelsController;
// deleteStudentController
const deleteStudentController = async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await db_1.pool.query("DELETE FROM Students WHERE id = $1 RETURNING id", [studentId]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: "Student not found" });
        res.status(200).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteStudentController = deleteStudentController;
// deleteOwnerController
const deleteOwnerController = async (req, res) => {
    const { ownerId } = req.params;
    try {
        const result = await db_1.pool.query("DELETE FROM HostelOwners WHERE id = $1 RETURNING id", [ownerId]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: "Owner not found" });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteOwnerController = deleteOwnerController;
// approveHostelController
const approveHostelController = async (req, res) => {
    const { hostelId } = req.params;
    try {
        const result = await db_1.pool.query("UPDATE Hostels SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *", [hostelId]);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.approveHostelController = approveHostelController;
// rejectHostelController
const rejectHostelController = async (req, res) => {
    const { hostelId } = req.params;
    const { reason } = req.body;
    try {
        const result = await db_1.pool.query("UPDATE Hostels SET status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [reason || "No reason provided", hostelId]);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.rejectHostelController = rejectHostelController;
// getAllUsersController
const getAllUsersController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const totalStudentsResult = await db_1.pool.query("SELECT COUNT(*) FROM Students");
        const totalOwnersResult = await db_1.pool.query("SELECT COUNT(*) FROM HostelOwners");
        const totalStudents = parseInt(totalStudentsResult.rows[0].count);
        const totalOwners = parseInt(totalOwnersResult.rows[0].count);
        const students = await db_1.pool.query("SELECT id, firstName, lastName, email, 'student' as role FROM Students ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        const owners = await db_1.pool.query("SELECT id, firstName, lastName, email, 'owner' as role FROM HostelOwners ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllUsersController = getAllUsersController;
// approveBookingController
const approveBookingController = async (req, res) => {
    const { bookingId } = req.params;
    try {
        // 1. Update Status and fetch Student Email + Room details
        const bookingUpdate = await db_1.pool.query(`UPDATE Bookings 
       SET booking_status = 'approved' 
       WHERE id = $1 
       RETURNING room_id, (SELECT email FROM Students WHERE id = Bookings.student_id) as student_email`, [bookingId]);
        if (bookingUpdate.rowCount === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });
        }
        const { room_id, student_email } = bookingUpdate.rows[0];
        // 2. Flip Room Availability to FALSE
        await db_1.pool.query("UPDATE Rooms SET availability = FALSE WHERE id = $1", [
            room_id,
        ]);
        // 3. Send Automatic Email
        const emailSubject = "Booking Approved!";
        const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;    border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
        <h1>Congratulations!</h1>
        <p> Your booking for Booking ID: <strong>${bookingId}</strong> has been approved.</p>
       <p>You can now proceed with the necessary arrangements.</p>
     </div>
    `;
        await (0, mailer_1.sendBookingEmail)(student_email, emailSubject, emailHtml);
        res
            .status(200)
            .json({ success: true, message: "Booking approved and email sent to student" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.approveBookingController = approveBookingController;
// getAdminPendingBookingsController
const getAdminPendingBookingsController = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const offset = (pageNumber - 1) * pageLimit;
    try {
        // total count
        const countResult = await db_1.pool.query(`
      SELECT COUNT(*) 
      FROM Bookings b
      JOIN Payments p ON b.id = p.booking_id
      WHERE b.booking_status = 'pending'
    `);
        const total = Number(countResult.rows[0].count);
        // paginated data
        const query = `
      SELECT 
        b.id AS booking_id,
        b.start_date,
        b.end_date,
        b.booking_status,
        s.firstName,
        s.lastName,
        s.email AS student_email,
        r.room_number,
        r.type AS room_type,
        h.id AS hostel_id,
        h.name AS hostel_name,
        h.location AS hostel_location,
        p.reference AS payment_reference,
        p.amount AS amount_paid,
        p.paid_at
      FROM Bookings b
      JOIN Students s ON b.student_id = s.id
      JOIN Rooms r ON b.room_id = r.id
      JOIN Hostels h ON r.hostel_id = h.id
      JOIN Payments p ON b.id = p.booking_id
      WHERE b.booking_status = 'pending'
      ORDER BY b.booked_at DESC
      LIMIT $1 OFFSET $2
    `;
        const result = await db_1.pool.query(query, [pageLimit, offset]);
        res.status(200).json({
            success: true,
            metadata: {
                page: pageNumber,
                limit: pageLimit,
                total,
            },
            data: result.rows,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAdminPendingBookingsController = getAdminPendingBookingsController;
// rejectBookingController
const rejectBookingController = async (req, res) => {
    const { bookingId } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
        return res
            .status(400)
            .json({ success: false, message: "Rejection reason is required" });
    }
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        // 1. Update Booking status and reason
        const bookingQuery = `
      UPDATE Bookings 
      SET booking_status = 'rejected', rejection_reason = $1 
      WHERE id = $2 
      RETURNING id, room_id, booking_status, rejection_reason
    `;
        const bookingRes = await client.query(bookingQuery, [
            rejection_reason,
            bookingId,
        ]);
        if (bookingRes.rowCount === 0) {
            throw new Error("Booking not found");
        }
        // 2. Update Payment status
        const paymentQuery = `
      UPDATE Payments 
      SET refund_status = 'completed' 
      WHERE booking_id = $1 
      RETURNING refund_status
    `;
        await client.query(paymentQuery, [bookingId]);
        // 3. Get Student and Room details
        const detailsQuery = `
      SELECT s.firstName, s.lastName, s.email, r.room_number
      FROM Students s
      JOIN Bookings b ON s.id = b.student_id
      JOIN Rooms r ON b.room_id = r.id
      WHERE b.id = $1
    `;
        const detailsRes = await client.query(detailsQuery, [bookingId]);
        const student = detailsRes.rows[0];
        await client.query("COMMIT");
        // 4. Send Automatic Rejection Email
        const emailSubject = "Booking Update: Application Rejected";
        const emailHtml = `
      <h1>Booking Update</h1>
      <p>Hello ${student.firstname},</p>
      <p>We regret to inform you that your booking for room <strong>${student.room_number}</strong> has been rejected.</p>
      <p><strong>Reason:</strong> ${rejection_reason}</p>
      <p><strong>Refund Info:</strong> Your payment has been successfully refunded to your account.</p>
    `;
        await (0, mailer_1.sendBookingEmail)(student.email, emailSubject, emailHtml);
        res.status(200).json({
            success: true,
            message: "Booking rejected and notification sent"
        });
    }
    catch (error) {
        await client.query("ROLLBACK");
        res
            .status(500)
            .json({ success: false, message: error.message || "Server error" });
    }
    finally {
        client.release();
    }
};
exports.rejectBookingController = rejectBookingController;
