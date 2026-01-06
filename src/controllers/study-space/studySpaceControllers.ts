import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../config/db";

// createStudySpaceController
export const createStudySpaceController = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    name,
    location,
    total_capacity,
    available_slots,
    opening_time,
    closing_time,
    status,
  } = req.body;
  const adminId = (req as any).user.id;

  try {
    const newSpace = await pool.query(
      `INSERT INTO study_spaces 
        (name, location, total_capacity, available_slots, status, opening_time, closing_time, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        name,
        location,
        total_capacity,
        available_slots,
        status,
        opening_time,
        closing_time,
        adminId,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Study space created successfully",
      data: newSpace.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// updateStudySpaceController
export const updateStudySpaceController = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { total_capacity, available_slots, opening_time, closing_time } =
    req.body;
  let { status } = req.body;

  // Automated logic for status
  if (status && status !== "closed") {
    status = available_slots === 0 ? "full" : "open";
  }

  try {
    const result = await pool.query(
      `UPDATE study_spaces 
       SET total_capacity = COALESCE($1, total_capacity), 
           available_slots = COALESCE($2, available_slots), 
           status = COALESCE($3, status), 
           opening_time = COALESCE($4, opening_time), 
           closing_time = COALESCE($5, closing_time),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [total_capacity, available_slots, status, opening_time, closing_time, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Space not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const deleteStudySpaceController = async () => {};

export const getAllStudySpacesController = async (
  req: AuthRequest,
  res: Response
) => {
  const { status, available } = req.query; 

  let query = `SELECT * FROM study_spaces WHERE 1=1`;
  const values: any[] = [];

  // Filter by status (open, closed, full)
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }

  // Filter for only spaces with seats (available=true)
  if (available === "true") {
    query += ` AND available_slots > 0`;
  }

  query += ` ORDER BY created_at DESC`;

  try {
    const spaces = await pool.query(query, values);
    res.status(200).json({
      success: true,
      count: spaces.rowCount,
      data: spaces.rows, 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getSingleStudySpaceController = async () => {};
