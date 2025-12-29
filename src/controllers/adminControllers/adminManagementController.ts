import { Request, Response } from "express";
import { pool } from "../../config/db";
import { AuthRequest } from "../../middlewares/authMiddleware";

export const getAllStudentsController = async (req: Request, res: Response) => {
  try {
    const students = await pool.query(
      "SELECT id, firstname, lastname, email, created_at FROM Students"
    );
    res.status(200).json({ success: true, data: students.rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error fetching students" });
  }
};

export const getAllOwnersController = async (req: Request, res: Response) => {
  try {
    const owners = await pool.query(
      "SELECT id, firstname, lastname, email, created_at FROM HostelOwners"
    );
    res.status(200).json({ success: true, data:owners.rows });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error fetching owners" });
  }
};

export const getAllHostelsController = async (req: Request, res: Response) => {
  try {
    // Fetch all hostels and join with Owners to see who they belong to
    const result = await pool.query(`
      SELECT h.*, o.firstname, o.lastname, o.email as owner_email 
      FROM Hostels h
      JOIN HostelOwners o ON h.owner_id = o.id
      ORDER BY h.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: "Server error fetching all hostels" });
  }
};

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

export const rejectHostelController = async (
  req: AuthRequest,
  res: Response
) => {
  const { hostelId } = req.params;
  const { reason } = req.body;

  try {
    const result = await pool.query(
      "UPDATE Hostels SET status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [reason || "No reason provided", hostelId]
    );

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
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const students = await pool.query(
      "SELECT id, firstname, lastname, email, 'student' as role FROM Students"
    );
    const owners = await pool.query(
      "SELECT id, firstname, lastname, email, 'owner' as role FROM HostelOwners"
    );

    res.status(200).json({
      success: true,
      data: {
        students: students.rows,
        hostelowners: owners.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
