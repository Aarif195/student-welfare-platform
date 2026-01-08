"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerGuestLogs = exports.registerGuest = void 0;
const db_1 = require("../../config/db");
// registerGuest
const registerGuest = async (req, res) => {
    const studentId = req.user.id;
    const { guest_name, guest_phone, visit_purpose, expected_duration } = req.body;
    try {
        // 1. Get hostel_id via Bookings and Rooms tables
        const bookingLookup = await db_1.pool.query(`SELECT rm.hostel_id 
       FROM Bookings b
       JOIN Rooms rm ON b.room_id = rm.id
       WHERE b.student_id = $1 AND b.booking_status = 'approved' 
       LIMIT 1`, [studentId]);
        const hostelId = bookingLookup.rows[0]?.hostel_id;
        if (!hostelId) {
            return res.status(403).json({
                message: "Access denied. You must have an approved booking to log a guest.",
            });
        }
        // 2. Insert into guest_logs
        const newGuest = await db_1.pool.query(`INSERT INTO guest_logs (student_id, hostel_id, guest_name, guest_phone, visit_purpose, expected_duration)
       VALUES ($1, $2, $3, $4, $5, $6::interval) RETURNING *`, [
            studentId,
            hostelId,
            guest_name,
            guest_phone,
            visit_purpose,
            expected_duration,
        ]);
        return res.status(201).json({ success: true, data: newGuest.rows[0] });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.registerGuest = registerGuest;
// getOwnerGuestLogs
const getOwnerGuestLogs = async (req, res) => {
    const ownerId = req.user.id;
    const { status } = req.query; // 'active' or 'history'
    try {
        //  Active is when current time is BEFORE expiry. History is when it's AFTER.
        const timeCondition = status === "history"
            ? "(gl.check_in_at + gl.expected_duration) <= CURRENT_TIMESTAMP"
            : "(gl.check_in_at + gl.expected_duration) > CURRENT_TIMESTAMP";
        const logs = await db_1.pool.query(`SELECT 
    gl.id,
    gl.guest_name,
    gl.guest_phone,
    gl.visit_purpose,
    gl.check_in_at,
    gl.expected_duration,
    (gl.check_in_at + gl.expected_duration) AS expiry_time,
    s.firstName AS host_firstName,
    s.lastName AS host_lastName,
    rm.room_number,
    h.name AS hostel_name
   FROM guest_logs gl
   JOIN Students s ON gl.student_id = s.id
   JOIN Rooms rm ON rm.id = (
      SELECT b.room_id 
      FROM Bookings b 
      WHERE b.student_id = s.id AND b.booking_status = 'approved' 
      LIMIT 1
   )
   JOIN Hostels h ON gl.hostel_id = h.id
   WHERE h.owner_id = $1 AND ${timeCondition}
   ORDER BY gl.check_in_at DESC`, [ownerId]);
        return res.status(200).json({ success: true, data: logs.rows });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getOwnerGuestLogs = getOwnerGuestLogs;
