"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleStudySpaceController = exports.getAllStudySpacesController = exports.deleteStudySpaceController = exports.updateStudySpaceController = exports.createStudySpaceController = void 0;
const db_1 = require("../../config/db");
// createStudySpaceController
const createStudySpaceController = async (req, res) => {
    const { name, location, total_capacity, available_slots, opening_time, closing_time, status, } = req.body;
    const adminId = req.user.id;
    try {
        const newSpace = await db_1.pool.query(`INSERT INTO study_spaces 
        (name, location, total_capacity, available_slots, status, opening_time, closing_time, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`, [
            name,
            location,
            total_capacity,
            available_slots,
            status,
            opening_time,
            closing_time,
            adminId,
        ]);
        res.status(201).json({
            success: true,
            message: "Study space created successfully",
            data: newSpace.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createStudySpaceController = createStudySpaceController;
// updateStudySpaceController
const updateStudySpaceController = async (req, res) => {
    const { id } = req.params;
    const { total_capacity, available_slots, opening_time, closing_time } = req.body;
    let { status } = req.body;
    // Automated logic for status
    if (status && status !== "closed") {
        status = available_slots === 0 ? "full" : "open";
    }
    try {
        const result = await db_1.pool.query(`UPDATE study_spaces 
       SET total_capacity = COALESCE($1, total_capacity), 
           available_slots = COALESCE($2, available_slots), 
           status = COALESCE($3, status), 
           opening_time = COALESCE($4, opening_time), 
           closing_time = COALESCE($5, closing_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`, [total_capacity, available_slots, status, opening_time, closing_time, id]);
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Space not found" });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};
exports.updateStudySpaceController = updateStudySpaceController;
// deleteStudySpaceController
const deleteStudySpaceController = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.pool.query(`DELETE FROM study_spaces WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Study space not found",
            });
        }
        res.status(200).send();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteStudySpaceController = deleteStudySpaceController;
// getAllStudySpacesController
const getAllStudySpacesController = async (req, res) => {
    const { status, available, page = "1", limit = "10" } = req.query;
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 10);
    const offset = (pageNumber - 1) * limitNumber;
    let baseQuery = `FROM study_spaces WHERE 1=1`;
    const values = [];
    //   // Filter by status (open, closed, full)
    if (status) {
        values.push(status);
        baseQuery += ` AND status = $${values.length}`;
    }
    if (available === "true") {
        baseQuery += ` AND available_slots > 0`;
    }
    const countResult = await db_1.pool.query(`SELECT COUNT(*) ${baseQuery}`, values);
    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limitNumber);
    values.push(limitNumber, offset);
    const dataQuery = `
    SELECT *
    ${baseQuery}
    ORDER BY created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `;
    try {
        const spaces = await db_1.pool.query(dataQuery, values);
        res.status(200).json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages,
            data: spaces.rows,
        });
    }
    catch {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getAllStudySpacesController = getAllStudySpacesController;
// getSingleStudySpaceController
const getSingleStudySpaceController = async (req, res) => {
    const { id } = req.params;
    try {
        const space = await db_1.pool.query(`SELECT * FROM study_spaces WHERE id = $1`, [id]);
        res.status(200).json({
            success: true,
            data: space.rows.length > 0 ? space.rows[0] : [],
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getSingleStudySpaceController = getSingleStudySpaceController;
