import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const getAllStudentsController = (req: Request, res: Response) => {};

export const getAllOwnersController = (req: Request, res: Response) => {};

export const getAllHostelsController = (req: Request, res: Response) => {};

export const deleteStudentController = (req: Request, res: Response) => {};

export const deleteOwnerController = (req: Request, res: Response) => {};

export const approveHostelController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostelId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE Hostels SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [hostelId]
    );

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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


