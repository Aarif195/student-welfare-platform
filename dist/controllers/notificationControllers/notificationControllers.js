"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostelNotificationsController = exports.getGlobalNotificationsController = exports.deleteNotificationController = exports.createNotificationController = void 0;
const db_1 = require("../../config/db");
const mailer_1 = require("../../utils/mailer");
// createAlertController
const createNotificationController = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const { hostelId } = req.params;
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user.id;
        const role = req.user.role;
        // Validate type
        if (!["global", "hostel"].includes(type)) {
            return res
                .status(400)
                .json({ message: 'Invalid type. Must be "global" or "hostel".' });
        }
        let hostel_id = null;
        if (type === "hostel") {
            if (!hostelId)
                return res
                    .status(400)
                    .json({ message: "Hostel ID is required for hostel alerts" });
            // Query hostel with approval check
            const hostelCheck = await db_1.pool.query("SELECT id, owner_id, status FROM hostels WHERE id = $1 AND status = 'approved'", [Number(hostelId)]);
            if (hostelCheck.rowCount === 0) {
                return res.status(403).json({
                    message: "Cannot create notification for this hostel. It must be approved and owned by you.",
                });
            }
            const hostelOwnerId = hostelCheck.rows[0].owner_id;
            if (role === "owner" && hostelOwnerId !== userId) {
                return res.status(403).json({
                    message: "Owners can only create notifications for their own approved hostel.",
                });
            }
            hostel_id = Number(hostelId);
        }
        else if (type === "global") {
            if (role !== "superadmin") {
                return res
                    .status(403)
                    .json({ message: "Only superadmin can create global notifications" });
            }
            hostel_id = null;
        }
        // Insert alert
        const result = await db_1.pool.query(`INSERT INTO alerts (title, message, type, hostel_id, created_by, creator_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [title, message, type, hostel_id, userId, role]);
        // --- NEW EMAIL LOGIC ---
        let recipientEmails = [];
        let senderName = "Campus Admin"; // Default
        if (type === "global") {
            const students = await db_1.pool.query("SELECT email FROM Students");
            recipientEmails = students.rows.map((r) => r.email);
        }
        else if (type === "hostel") {
            // 1. Get Student Emails by joining Bookings -> Rooms
            const students = await db_1.pool.query(`SELECT s.email FROM Students s 
         JOIN Bookings b ON s.id = b.student_id 
         JOIN Rooms r ON b.room_id = r.id 
         WHERE r.hostel_id = $1 AND b.booking_status = 'approved'`, [hostel_id]);
            recipientEmails = students.rows.map((r) => r.email);
            // 2. Determine Sender Name
            if (role === "owner") {
                const hostelData = await db_1.pool.query(`SELECT name FROM Hostels WHERE id = $1`, [hostel_id]);
                senderName = hostelData.rows[0]?.name || "Hostel Management";
            }
        }
        // 3. Email Template & Send
        const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.5;">${message}</p>
        <hr />
        <small style="color: #888;">Sent by: ${senderName}</small>
      </div>
    `;
        // Map through emails to trigger sends
        recipientEmails.forEach((email) => {
            (0, mailer_1.sendBookingEmail)(email, title, emailHtml, senderName);
        });
        return res.status(201).json({
            message: "Notification successfully published and sent to students",
            alert: result.rows[0],
        });
    }
    catch (err) {
        console.error("Create alert error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createNotificationController = createNotificationController;
// deleteAlertController
const deleteNotificationController = async (req, res) => {
    try {
        const { notificationId } = req.params;
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user.id;
        const role = req.user.role;
        if (!notificationId)
            return res.status(400).json({ message: "notification ID is required" });
        // Fetch the notification to check ownership/role
        const alertCheck = await db_1.pool.query("SELECT id, created_by FROM alerts WHERE id = $1", [Number(notificationId)]);
        if (alertCheck.rowCount === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }
        const alert = alertCheck.rows[0];
        // STRICT CHECK: User must be the one who created it.
        if (alert.created_by !== userId) {
            return res.status(403).json({
                message: "Access denied: You can only delete notifications you created.",
            });
        }
        // Delete the notification
        await db_1.pool.query("DELETE FROM alerts WHERE id = $1", [
            Number(notificationId),
        ]);
        return res.status(204).send();
    }
    catch (err) {
        console.error("Delete notification error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.deleteNotificationController = deleteNotificationController;
// getGlobalAlertsController
const getGlobalNotificationsController = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const role = req.user.role;
        // Only allow students, owners, and superadmin to access
        if (!["student", "owner", "superadmin"].includes(role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const totalResult = await db_1.pool.query(`SELECT COUNT(*) FROM alerts WHERE type = 'global'`);
        const total = parseInt(totalResult.rows[0].count);
        const result = await db_1.pool.query(`SELECT * FROM alerts WHERE type = 'global' ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            alerts: result.rows,
        });
    }
    catch (err) {
        console.error("Get global alerts error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getGlobalNotificationsController = getGlobalNotificationsController;
// getHostelAlertsController
const getHostelNotificationsController = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 10);
        const offset = (page - 1) * limit;
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const userId = req.user.id;
        const role = req.user.role;
        if (!hostelId) {
            return res.status(400).json({ message: "Hostel ID is required" });
        }
        // Get hostel info
        const hostelCheck = await db_1.pool.query("SELECT id, owner_id, status FROM hostels WHERE id = $1", [Number(hostelId)]);
        if (hostelCheck.rowCount === 0) {
            return res.status(404).json({ message: "Hostel not found" });
        }
        const hostel = hostelCheck.rows[0];
        // Only allow access if hostel is approved
        if (hostel.status !== "approved") {
            return res.status(403).json({
                message: "Cannot view notifications for unapproved hostel",
            });
        }
        // Owners can only view alerts for their own approved hostel
        if (role === "owner" && hostel.owner_id !== userId) {
            return res.status(403).json({
                message: "Owners can only view notifications for their own approved hostel",
            });
        }
        // Students can only view approved hostels (already covered above)
        // Superadmin can view all approved hostels
        // Total alerts count for pagination
        const totalResult = await db_1.pool.query("SELECT COUNT(*) FROM alerts WHERE hostel_id = $1", [Number(hostelId)]);
        const total = parseInt(totalResult.rows[0].count);
        // Fetch alerts with pagination
        const result = await db_1.pool.query("SELECT * FROM alerts WHERE hostel_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", [Number(hostelId), limit, offset]);
        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            alerts: result.rows,
        });
    }
    catch (err) {
        console.error("Get hostel alerts error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getHostelNotificationsController = getHostelNotificationsController;
