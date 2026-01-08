"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentProfileController = exports.getStudentProfileController = void 0;
const db_1 = require("../../config/db");
// getStudentProfileController
const getStudentProfileController = async (req, res) => {
    try {
        const studentId = req.user.id; // From authenticate middleware
        const result = await db_1.pool.query("SELECT id, firstName, lastName, email, phone, created_at FROM students WHERE id = $1", [studentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        // console.log("PROFILE ERROR", error);
        res.status(500).json({ success: false, message: "Server error fetching profile" });
    }
};
exports.getStudentProfileController = getStudentProfileController;
// updateStudentProfileController
const updateStudentProfileController = async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const studentId = req.user.id;
    ;
    try {
        const result = await db_1.pool.query("UPDATE students SET firstName = $1, lastName = $2, phone = $3 WHERE id = $4 RETURNING id, firstName, lastName, email, phone", [firstName, lastName, phone, studentId]);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result.rows[0]
        });
    }
    catch (error) {
        // console.log("PROFILE ERROR", error);
        res.status(500).json({ success: false, message: "Server error updating profile" });
    }
};
exports.updateStudentProfileController = updateStudentProfileController;
