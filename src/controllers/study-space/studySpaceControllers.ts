import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { pool } from "../../config/db";

export const createStudySpaceController = async (req: AuthRequest, res: Response) => {
  const { name, location, total_capacity, available_slots, opening_time, closing_time, status } = req.body;
  const adminId = (req as any).user.id; 

  try {
    const newSpace = await pool.query(
      `INSERT INTO study_spaces 
        (name, location, total_capacity, available_slots, status, opening_time, closing_time, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, location, total_capacity, available_slots, status, opening_time, closing_time, adminId]
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
export const updateStudySpaceController = async () => {};

export const deleteStudySpaceController = async () => {};

export const getAllStudySpacesController = async () => {};

export const getSingleStudySpaceController = async () => {};
