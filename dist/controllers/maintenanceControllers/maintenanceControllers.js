"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getStudentNotifications = exports.getStudentMaintenanceRequests = exports.updateMaintenanceStatus = exports.getMaintenanceRequests = exports.createMaintenanceRequest = void 0;
const db_1 = require("../../config/db");
// createMaintenanceRequest by students
const createMaintenanceRequest = async (req, res) => {
    const { issue_type, description } = req.body;
    const userId = req.user.id;
    // The image URL from upload middleware (e.g., Cloudinary)
    const image_url = req.file ? req.file.path : null;
    try {
        // 1. Find the student's active booking
        const bookingInfo = await db_1.pool.query(`SELECT b.room_id, r.hostel_id 
       FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       WHERE b.student_id = $1 AND b.booking_status = 'approved'
       LIMIT 1`, [Number(userId)]);
        console.log("Searching for Student ID:", userId);
        console.log("Rows found:", bookingInfo.rowCount);
        if (bookingInfo.rowCount === 0) {
            return res.status(403).json({
                message: "You must have an approved booking to file a maintenance request.",
            });
        }
        const { room_id, hostel_id } = bookingInfo.rows[0];
        // 2. Insert the request
        const newRequest = await db_1.pool.query(`INSERT INTO maintenance_requests (student_id, room_id, hostel_id, issue_type, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [Number(userId), room_id, hostel_id, issue_type, description, image_url]);
        return res.status(201).json({
            success: true,
            message: "Maintenance request submitted successfully",
            data: newRequest.rows[0],
        });
    }
    catch (error) {
        console.error("Maintenance creation error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createMaintenanceRequest = createMaintenanceRequest;
// getMaintenanceRequests Students Owner Admin
const getMaintenanceRequests = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    const { status } = req.query;
    try {
        let query = "";
        let params = [];
        // query parts
        let whereClause = role === "superadmin" ? "WHERE 1=1" : "WHERE h.owner_id = $1";
        if (role !== "superadmin")
            params.push(Number(userId));
        if (status) {
            params.push(status);
            whereClause += ` AND m.status = $${params.length}`;
        }
        query = `SELECT m.*, h.name as hostel_name, s.firstName, s.lastName 
             FROM maintenance_requests m
             JOIN Hostels h ON m.hostel_id = h.id
             JOIN Students s ON m.student_id = s.id
             ${whereClause}
             ORDER BY m.created_at DESC`;
        const requests = await db_1.pool.query(query, params);
        return res.status(200).json({
            success: true,
            count: requests.rowCount,
            data: requests.rows,
        });
    }
    catch (error) {
        console.error("Fetch maintenance error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getMaintenanceRequests = getMaintenanceRequests;
// updateMaintenanceStatus Owner & Admin
const updateMaintenanceStatus = async (req, res) => {
    const { id } = req.params;
    const { status, owner_notes, assigned_to } = req.body;
    const userId = req.user.id;
    const role = req.user.role;
    try {
        //  If Superadmin, skip ownership check. If Owner, verify they own the hostel.
        if (role !== "superadmin") {
            const checkOwnership = await db_1.pool.query(`SELECT m.id FROM maintenance_requests m
     JOIN Hostels h ON m.hostel_id = h.id
     WHERE m.id = $1 AND h.owner_id = $2`, [id, Number(userId)]);
            if (checkOwnership.rowCount === 0) {
                return res
                    .status(403)
                    .json({ message: "Unauthorized to update this request" });
            }
        }
        const updated = await db_1.pool.query(`UPDATE maintenance_requests 
       SET status = $1, owner_notes = $2, assigned_to = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`, [status, owner_notes, assigned_to, id]);
        // Get student_id and status from the updated row
        const { student_id, id: request_id, status: newStatus } = updated.rows[0];
        // Create notification for the student
        await db_1.pool.query(`INSERT INTO Notifications (student_id, request_id, title, message)
       VALUES ($1, $2, $3, $4)`, [
            student_id, request_id,
            "Maintenance Update",
            `Your maintenance request status has been updated to: ${newStatus}.`,
        ]);
        return res.status(200).json({
            success: true,
            message: "Maintenance status updated and student notified",
            data: updated.rows[0],
        });
    }
    catch (error) {
        console.error("Update maintenance error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateMaintenanceStatus = updateMaintenanceStatus;
// getStudentMaintenanceRequests
// Students to view the history and status of their own maintenance complaints
const getStudentMaintenanceRequests = async (req, res) => {
    const studentId = req.user.id;
    const { status } = req.query;
    try {
        let query = `SELECT m.*, h.name as hostel_name 
                 FROM maintenance_requests m
                 JOIN Hostels h ON m.hostel_id = h.id
                 WHERE m.student_id = $1`;
        let params = [Number(studentId)];
        if (status) {
            params.push(status);
            query += ` AND m.status = $2`;
        }
        query += ` ORDER BY m.created_at DESC`;
        const requests = await db_1.pool.query(query, params);
        return res.status(200).json({
            success: true,
            count: requests.rowCount,
            data: requests.rows,
        });
    }
    catch (error) {
        console.error("Student fetch maintenance error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getStudentMaintenanceRequests = getStudentMaintenanceRequests;
// getStudentNotifications
// Notification for the students to get update of their complains
const getStudentNotifications = async (req, res) => {
    const studentId = req.user.id;
    try {
        const notifications = await db_1.pool.query(`SELECT 
        n.id AS notification_id,
        n.title,
        n.message,
        n.is_read,
        n.created_at AS notified_at,
        m.*, 
      h.name AS hostel_name
     FROM Notifications n
      JOIN maintenance_requests m ON n.request_id = m.id
      JOIN Hostels h ON m.hostel_id = h.id
      WHERE n.student_id = $1 
      ORDER BY n.created_at DESC`, [Number(studentId)]);
        return res.status(200).json({
            success: true,
            data: notifications.rows,
        });
    }
    catch (error) {
        console.error("Fetch combined notifications error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getStudentNotifications = getStudentNotifications;
// markNotificationAsRead
const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    const studentId = req.user.id;
    try {
        const result = await db_1.pool.query(`UPDATE Notifications 
       SET is_read = true 
       WHERE id = $1 AND student_id = $2 
       RETURNING id, is_read`, [id, Number(studentId)]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }
        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error("Mark notification error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// markAllNotificationsAsRead
const markAllNotificationsAsRead = async (req, res) => {
    const studentId = req.user.id;
    try {
        await db_1.pool.query(`UPDATE Notifications 
       SET is_read = true 
       WHERE student_id = $1 AND is_read = false`, [Number(studentId)]);
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    }
    catch (error) {
        console.error("Bulk mark read error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
